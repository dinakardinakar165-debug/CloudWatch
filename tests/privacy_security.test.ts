/**
 * CloudWatch Sentinel - Security, Privacy & Statistical Engine Verification Suite
 * Tests automated redaction, prohibited data dropping, pseudonymisation,
 * and Gaussian Z-Score calculations.
 * 
 * Run with: npx tsx tests/privacy_security.test.ts
 */

import {
  redactSecretPatterns,
  sanitizeCollectorPayload,
  pseudonymizeIdentifier,
  PROHIBITED_FIELD_PATTERNS
} from '../src/services/dataSanitizationEngine';
import {
  calculateStatisticalSummary,
  evaluateStatisticalAnomaly,
  DEFAULT_ANOMALY_CONFIG
} from '../src/services/anomalyDetectionEngine';
import { generateCrossAccountTrustPolicy, generateLeastPrivilegeIAMPolicy } from '../src/services/awsClientService';
import { DEFAULT_DATA_SHARING_POLICY } from '../src/data/mockEnterpriseData';

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${detail ? ` - ${detail}` : ''}`);
    testsFailed++;
  }
}

console.log('================================================================');
console.log('CloudWatch Sentinel - Security & Privacy Test Suite');
console.log('Institution: Kumaraguru College of Technology (24BCS405 et al.)');
console.log('================================================================\n');

// 1. SECRET PATTERN REDACTION
console.log('[Suite 1: In-VPC Secret Pattern Redaction]');
{
  const testString1 = "Connecting with AWS key AKIAIOSFODNN7EXAMPLE and secret";
  const res1 = redactSecretPatterns(testString1);
  assert(res1.cleanText.includes('[REDACTED_SECRET]') && !res1.cleanText.includes('AKIAIOSFODNN7EXAMPLE'), 'Redacts AWS Access Key ID (AKIA...)');
  assert(res1.count === 1, 'Accurately counts 1 secret redaction occurrence');

  const testString2 = "Git token ghp_1234567890abcdefghijklmnopqrstuvwxyz and Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
  const res2 = redactSecretPatterns(testString2);
  assert(!res2.cleanText.includes('ghp_') && !res2.cleanText.includes('eyJhbGci'), 'Redacts GitHub tokens and Bearer authentication headers');
  assert(res2.count >= 2, 'Counts multiple concurrent secret tokens');

  const testString3 = "-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA0Y3...\n-----END RSA PRIVATE KEY-----";
  const res3 = redactSecretPatterns(testString3);
  assert(res3.cleanText.includes('[REDACTED_SECRET]') && !res3.cleanText.includes('MIIEowIBAAKCAQEA'), 'Redacts RSA Private Keys from payload logs');
}

// 2. PROHIBITED FIELD DROPPING
console.log('\n[Suite 2: Prohibited Metadata Field Rejection]');
{
  const rawPayloadWithSecrets = {
    cpu_utilization_avg: 42.5,
    memory_percent: 61.2,
    db_password: "super_secret_password_123",
    api_access_key: "AKIA1111222233334444",
    app_env_vars: { DATABASE_URL: "postgres://admin:pass@host/db" },
    source_code_snippet: "def login(): return True",
    raw_logs: "2026-11-02 ERROR user password exposed"
  };

  const sanitized = sanitizeCollectorPayload(rawPayloadWithSecrets, DEFAULT_DATA_SHARING_POLICY);

  assert(sanitized.sanitizedData.cpu_utilization_avg === 42.5, 'Allows approved metric: cpu_utilization_avg');
  assert(sanitized.sanitizedData.db_password === undefined, 'Strictly drops prohibited field: db_password');
  assert(sanitized.sanitizedData.api_access_key === undefined, 'Strictly drops prohibited field: api_access_key');
  assert(sanitized.sanitizedData.app_env_vars === undefined, 'Strictly drops prohibited field: app_env_vars');
  assert(sanitized.sanitizedData.source_code_snippet === undefined, 'Strictly drops prohibited field: source_code_snippet');
  assert(sanitized.sanitizedData.raw_logs === undefined, 'Strictly drops prohibited field: raw_logs');
  assert(sanitized.rejectedProhibitedFields.length >= 5, `Identified and recorded ${sanitized.rejectedProhibitedFields.length} prohibited keys for audit`);
}

// 3. CATEGORY POLICY ENFORCEMENT
console.log('\n[Suite 3: Dynamic Category Policy Allowlisting]');
{
  const policyRestrictingCpu = {
    ...DEFAULT_DATA_SHARING_POLICY,
    allowCpuMetrics: false,
    allowCostAggregates: false
  };

  const mixedPayload = {
    cpu_utilization_avg: 78.4,
    network_in_bytes: 1048576,
    daily_cost_usd: 142.50
  };

  const sanitized = sanitizeCollectorPayload(mixedPayload, policyRestrictingCpu);
  assert(sanitized.sanitizedData.cpu_utilization_avg === undefined, 'Disallowed CPU metrics rejected when allowCpuMetrics is false');
  assert(sanitized.sanitizedData.daily_cost_usd === undefined, 'Disallowed Cost aggregates rejected when allowCostAggregates is false');
  assert(sanitized.sanitizedData.network_in_bytes === 1048576, 'Permitted network metrics retained when allowNetworkTotals is true');
}

// 4. IDENTIFIER PSEUDONYMISATION
console.log('\n[Suite 4: Deterministic Identifier Pseudonymisation]');
{
  const ec2Id = "i-0a8b9f1234cde5678";
  const pseudo1 = pseudonymizeIdentifier(ec2Id, 'ec2');
  const pseudo2 = pseudonymizeIdentifier(ec2Id, 'ec2');

  assert(pseudo1.startsWith('res-ec2-'), 'EC2 identifier transformed into synthetic resource prefix');
  assert(pseudo1 === pseudo2, 'Pseudonymisation is deterministic across collection intervals');
  assert(!pseudo1.includes('0a8b9f1234cde5678'), 'Original physical instance ID is obscured');

  const accountId = "123456789012";
  const pseudoAccount = pseudonymizeIdentifier(accountId, 'account');
  assert(pseudoAccount.startsWith('org-acc-'), 'AWS Account 12-digit number transformed to synthetic org alias');
}

// 5. STATISTICAL ANOMALY ENGINE (GAUSSIAN Z-SCORE)
console.log('\n[Suite 5: Gaussian Z-Score Anomaly Engine]');
{
  // Sample data: historical CPU baseline mean = 20%, stdDev = 5%
  const baseline = [20, 22, 19, 21, 20, 18, 20];
  const summary = calculateStatisticalSummary(baseline);
  assert(summary !== null, 'Calculates non-null statistical summary for baseline');
  assert(Math.abs(summary!.mean - 20) < 0.5, `Calculates accurate mean (~20, got ${summary?.mean.toFixed(2)})`);
  assert(summary!.stdDev > 0, 'Computes non-zero standard deviation using Bessel correction');

  // Test normal point (CPU = 22%)
  const normalEval = evaluateStatisticalAnomaly(
    'res-1',
    'CPUUtilization',
    22,
    baseline,
    '%',
    'INFRASTRUCTURE',
    DEFAULT_ANOMALY_CONFIG
  );
  assert(normalEval === null, 'Normal variance point (Z < 1.8) produces no false-positive anomaly');

  // Test critical anomaly (CPU = 95%, Z > 10)
  const anomalyEval = evaluateStatisticalAnomaly(
    'res-1',
    'CPUUtilization',
    95,
    baseline,
    '%',
    'INFRASTRUCTURE',
    DEFAULT_ANOMALY_CONFIG
  );
  assert(anomalyEval !== null, 'Detected critical spike anomaly (CPU = 95%)');
  assert(anomalyEval?.severity === 'CRITICAL', `Severity accurately assigned CRITICAL (got ${anomalyEval?.severity})`);
  assert(anomalyEval?.zScore! > 3.5, `Z-Score exceeds threshold (${anomalyEval?.zScore.toFixed(2)})`);

  // Test zero-variance protection (flatline)
  const flatline = [10, 10, 10, 10, 10];
  const flatlineSummary = calculateStatisticalSummary(flatline);
  assert(flatlineSummary !== null, 'Summary computed for zero-variance flatline');
  assert(isFinite(flatlineSummary!.stdDev) && flatlineSummary!.stdDev > 0, 'Zero-variance epsilon prevents divide-by-zero');
}

// 6. AWS CROSS-ACCOUNT SECURITY & CONFUSED DEPUTY MITIGATION
console.log('\n[Suite 6: AWS Cross-Account Trust Policy & Confused Deputy]');
{
  const testExternalId = "sentinel-ext-sec-test-849102";
  const trustPolicyJson = generateCrossAccountTrustPolicy(testExternalId);
  const trustPolicy = JSON.parse(trustPolicyJson);

  assert(trustPolicy.Statement[0].Action === "sts:AssumeRole", 'IAM Trust Policy specifies sts:AssumeRole action');
  assert(trustPolicy.Statement[0].Condition?.StringEquals?.["sts:ExternalId"] === testExternalId, 'Trust Policy enforces mandatory sts:ExternalId condition to eliminate Confused Deputy vulnerability');

  const readOnlyPolicyJson = generateLeastPrivilegeIAMPolicy();
  const readOnlyPolicy = JSON.parse(readOnlyPolicyJson);
  const allActions: string[] = readOnlyPolicy.Statement.flatMap((s: any) => s.Action);
  assert(allActions.includes('cloudwatch:GetMetricData'), 'Policy grants cloudwatch:GetMetricData');
  assert(allActions.includes('ce:GetCostAndUsage'), 'Policy grants ce:GetCostAndUsage');
  assert(!allActions.some((a: string) => a.includes('s3:GetObject') || a.includes('ec2:RunInstances') || a.includes('iam:CreateUser')), 'Strictly excludes write/destructive or object-data permissions');
}

console.log('\n================================================================');
console.log(`Test Execution Completed: ${testsPassed} Passed, ${testsFailed} Failed`);
console.log('================================================================\n');

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log('ALL PRIVACY, SECURITY, AND ALGORITHMIC CRITERIA VERIFIED SUCCESSFULLY.\n');
}
