/**
 * CloudWatch Sentinel - Data Minimisation & Sanitisation Engine
 * Enforces strict field allowlisting, regex redaction of secrets,
 * prohibited data rejection, and pseudonymisation.
 */

import { DataSharingPolicy } from '../types/cloudwatch-sentinel';

export const PROHIBITED_FIELD_PATTERNS = [
  /password/i,
  /secret/i,
  /access_key/i,
  /secret_key/i,
  /token/i,
  /private_key/i,
  /env_var/i,
  /environment_variables/i,
  /source_code/i,
  /raw_logs/i,
  /payload/i,
  /sql/i,
  /request_body/i,
];

export const SECRET_VALUE_REGEXES = [
  /AKIA[0-9A-Z]{16}/g, // AWS Access Key ID
  /(?:aws_secret_access_key|secret_key|password)\s*[:=]\s*["']?([a-zA-Z0-9/+=]{30,})["']?/gi,
  /bearer\s+[a-zA-Z0-9._~+/-]+=*/gi,
  /-----BEGIN (?:RSA )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA )?PRIVATE KEY-----/gi,
  /ghp_[a-zA-Z0-9]{36}/g, // GitHub Token
];

export interface SanitizationResult<T> {
  sanitizedData: T;
  rejectedProhibitedFields: string[];
  redactedSecretOccurrences: number;
  isAllowedByPolicy: boolean;
  policyDenialReason?: string;
}

/**
 * Pseudonymize an AWS identifier (e.g. i-0a8b9f1234cde5678 -> res-ec2-a8b9)
 */
export function pseudonymizeIdentifier(id: string, type: 'account' | 'ec2' | 'pipeline' = 'ec2'): string {
  if (!id) return '';
  // Generate deterministic short hash
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(6, '0').slice(-6);

  if (type === 'account') {
    return `org-acc-${hex.slice(0, 4)}`;
  }
  if (type === 'pipeline') {
    return `pipe-masked-${hex.slice(0, 4)}`;
  }
  return `res-${type}-${hex.slice(0, 4)}`;
}

/**
 * Redact secrets from text strings
 */
export function redactSecretPatterns(text: string): { cleanText: string; count: number } {
  if (!text || typeof text !== 'string') return { cleanText: text, count: 0 };

  let count = 0;
  let clean = text;

  for (const regex of SECRET_VALUE_REGEXES) {
    const matches = clean.match(regex);
    if (matches) {
      count += matches.length;
      clean = clean.replace(regex, '[REDACTED_SECRET]');
    }
  }

  return { cleanText: clean, count };
}

/**
 * Filter an incoming raw collector payload against the organization's policy and allowlist
 */
export function sanitizeCollectorPayload(
  rawPayload: Record<string, any>,
  policy: DataSharingPolicy
): SanitizationResult<Record<string, any>> {
  const rejectedFields: string[] = [];
  let totalRedacted = 0;
  const sanitized: Record<string, any> = {};

  // Inspect each field in the payload
  for (const [key, val] of Object.entries(rawPayload)) {
    // 1. Check prohibited field blacklist
    const isProhibited = PROHIBITED_FIELD_PATTERNS.some((pat) => pat.test(key));
    if (isProhibited) {
      rejectedFields.push(key);
      continue; // Strictly drop prohibited field
    }

    // 2. Check category policies
    if (key.includes('cpu') && !policy.allowCpuMetrics) {
      rejectedFields.push(`${key} (CPU metrics disabled by policy)`);
      continue;
    }
    if (key.includes('network') && !policy.allowNetworkTotals) {
      rejectedFields.push(`${key} (Network metrics disabled by policy)`);
      continue;
    }
    if (key.includes('cost') && !policy.allowCostAggregates) {
      rejectedFields.push(`${key} (Cost aggregates disabled by policy)`);
      continue;
    }
    if (key.includes('pipeline') && !policy.allowPipelineStatus) {
      rejectedFields.push(`${key} (Pipeline status disabled by policy)`);
      continue;
    }

    // 3. Redact string values
    if (typeof val === 'string') {
      const { cleanText, count } = redactSecretPatterns(val);
      totalRedacted += count;

      // Handle pseudonymisation
      if (policy.pseudonymizeIdentifiers && (key.includes('id') || key.includes('arn') || key.includes('account'))) {
        sanitized[key] = cleanText.startsWith('i-')
          ? pseudonymizeIdentifier(cleanText, 'ec2')
          : cleanText.length === 12 && /^\d+$/.test(cleanText)
          ? pseudonymizeIdentifier(cleanText, 'account')
          : cleanText;
      } else {
        sanitized[key] = cleanText;
      }
    } else if (typeof val === 'object' && val !== null) {
      // Recursively sanitize nested dictionary
      const nested = sanitizeCollectorPayload(val, policy);
      sanitized[key] = nested.sanitizedData;
      rejectedFields.push(...nested.rejectedProhibitedFields);
      totalRedacted += nested.redactedSecretOccurrences;
    } else {
      sanitized[key] = val;
    }
  }

  return {
    sanitizedData: sanitized,
    rejectedProhibitedFields: rejectedFields,
    redactedSecretOccurrences: totalRedacted,
    isAllowedByPolicy: true,
  };
}
