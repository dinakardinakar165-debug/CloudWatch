/**
 * CloudWatch Sentinel - Enterprise Privacy-First Dataset
 * Strictly labeled data sources [DEMO] vs [CUSTOMER_COLLECTOR] vs [LIVE_AWS]
 * Institution: Kumaraguru College of Technology
 */

import {
  AWSAccountConnection,
  CloudResource,
  CostRecord,
  CostSummary,
  Pipeline,
  BuildProject,
  Anomaly,
  Alert,
  UserProfile,
  DataSharingPolicy,
  CollectorRegistration,
  AuditEvent,
  ConsentRecord,
  DeletionRequest,
  DeploymentExecution,
  MonitoringWorkerStatus,
} from '../types/cloudwatch-sentinel';

export const DEFAULT_DATA_SHARING_POLICY: DataSharingPolicy = {
  allowCpuMetrics: true,
  allowNetworkTotals: true,
  allowInstanceStatus: true,
  allowCostAggregates: true,
  allowPipelineStatus: true,
  allowBuildDuration: true,
  allowBuildLogs: false, // Permanently disabled by policy
  allowSourceCode: false, // Strictly prohibited
  allowEnvVariables: false, // Strictly prohibited
  pseudonymizeIdentifiers: false,
  retentionDays: 30,
  lastApprovedAt: '2026-11-01T08:00:00Z',
  approvedBy: 'Dinakar S (Administrator)',
  isCustomized: false,
};

export const DEMO_ACCOUNT_CONNECTION: AWSAccountConnection = {
  accountId: '124890374182',
  accountAlias: 'kct-enterprise-prod',
  roleArn: 'arn:aws:iam::124890374182:role/CloudWatchSentinelCrossAccountRole',
  externalId: 'kct-cws-deputy-defense-7a89b0', // Confused-deputy mitigation
  region: 'us-east-1',
  status: 'CONNECTED',
  authMethod: 'IAM_ROLE_EXTERNAL_ID',
  lastVerifiedAt: '2026-11-02T13:40:00Z',
  verifiedPermissions: [
    'cloudwatch:GetMetricData',
    'cloudwatch:ListMetrics',
    'cloudwatch:DescribeAlarms',
    'ec2:DescribeInstances',
    'ec2:DescribeInstanceStatus',
    'ce:GetCostAndUsage',
    'codepipeline:ListPipelines',
    'codepipeline:GetPipelineState',
    'codebuild:ListBuilds',
    'codebuild:BatchGetBuilds',
  ],
  operatingMode: 'MODE_C_DEMO',
  dataSource: 'DEMO',
};

export const NOT_CONFIGURED_ACCOUNT: AWSAccountConnection = {
  accountId: '',
  accountAlias: '',
  region: 'us-east-1',
  status: 'NOT_CONFIGURED',
  authMethod: 'IAM_ROLE_EXTERNAL_ID',
  verifiedPermissions: [],
  operatingMode: 'MODE_A_CROSS_ACCOUNT',
  dataSource: 'LIVE_AWS',
};

export const DEMO_COLLECTORS: CollectorRegistration[] = [
  {
    collectorId: 'col-ec2-prod-us-east-1',
    name: 'Customer-VPC-Collector-01',
    environment: 'AWS EC2',
    tokenPrefix: 'cws_live_9f8a2...',
    status: 'ACTIVE',
    createdAt: '2026-10-15T09:00:00Z',
    lastHeartbeatAt: '2026-11-02T13:58:12Z',
    version: 'v1.4.2-py311',
    recordsSentCount: 8420,
    allowedCategories: ['EC2 CPU', 'EC2 Network', 'Instance Status', 'CodePipeline State'],
    lastPayloadSummary: {
      metricsCount: 142,
      sanitizedFieldsCount: 18,
      rejectedProhibitedCount: 0,
    },
  },
  {
    collectorId: 'col-lambda-billing-daily',
    name: 'Cost-Sanitizer-Lambda-Worker',
    environment: 'AWS Lambda',
    tokenPrefix: 'cws_live_1b7c4...',
    status: 'ACTIVE',
    createdAt: '2026-10-20T12:00:00Z',
    lastHeartbeatAt: '2026-11-02T04:05:00Z',
    version: 'v1.4.0-serverless',
    recordsSentCount: 310,
    allowedCategories: ['Monthly Cost Aggregates', 'Service Spends'],
    lastPayloadSummary: {
      metricsCount: 12,
      sanitizedFieldsCount: 4,
      rejectedProhibitedCount: 0,
    },
  },
  {
    collectorId: 'col-docker-cicd-runner',
    name: 'CI/CD-Telemetry-Sidecar',
    environment: 'Docker / Container',
    tokenPrefix: 'cws_live_7d9e1...',
    status: 'REVOKED',
    createdAt: '2026-09-01T14:30:00Z',
    lastHeartbeatAt: '2026-10-24T18:20:00Z',
    version: 'v1.2.0',
    recordsSentCount: 4120,
    allowedCategories: ['CodeBuild Metadata'],
    lastPayloadSummary: {
      metricsCount: 0,
      sanitizedFieldsCount: 0,
      rejectedProhibitedCount: 1, // Attempted to send raw build log -> rejected!
    },
  },
];

export const DEMO_CONSENT_RECORDS: ConsentRecord[] = [
  {
    id: 'consent-ec2-metrics',
    category: 'Compute & Hypervisor Metrics',
    description: 'EC2 CPUUtilization, NetworkIn/Out byte counts, and StatusCheckFailed counts.',
    purpose: 'Infrastructure health evaluation, capacity sizing, and anomaly detection.',
    storageLocation: 'Supabase PostgreSQL (Tenant Isolated Table: metric_samples)',
    retentionPolicy: '30-day automatic rolling purge',
    isApproved: true,
    approvedBy: 'Dinakar S (Administrator)',
    approvedAt: '2026-10-15T09:12:00Z',
    canRevoke: true,
  },
  {
    id: 'consent-cost-explorer',
    category: 'AWS Billing & Spend Aggregates',
    description: 'Daily unblended service-level costs and month-to-date budget utilization.',
    purpose: 'Cloud financial management (FinOps), budget breach alerting, and spike detection.',
    storageLocation: 'Supabase PostgreSQL (Tenant Isolated Table: cost_records)',
    retentionPolicy: '90-day rolling purge',
    isApproved: true,
    approvedBy: 'Santhosh TMA (FinOps Lead)',
    approvedAt: '2026-10-16T11:45:00Z',
    canRevoke: true,
  },
  {
    id: 'consent-cicd-metadata',
    category: 'CI/CD Pipeline Execution Metadata',
    description: 'CodePipeline stage status, execution durations, and sanitised failure categories.',
    purpose: 'Deployment observability and release velocity tracking.',
    storageLocation: 'Supabase PostgreSQL (Tenant Isolated Table: pipeline_executions)',
    retentionPolicy: '60-day rolling purge',
    isApproved: true,
    approvedBy: 'Kabileshwara Y (DevOps Lead)',
    approvedAt: '2026-10-17T14:20:00Z',
    canRevoke: true,
  },
  {
    id: 'consent-raw-build-logs',
    category: 'Raw CodeBuild Logs & Source Artifacts',
    description: 'Full un-redacted terminal outputs, console streams, and source repository snapshots.',
    purpose: 'NOT PERMITTED. Statically locked to prevent leakage of secrets or source code.',
    storageLocation: 'PROHIBITED — Never stored or transmitted',
    retentionPolicy: 'Not Applicable',
    isApproved: false,
    canRevoke: false,
  },
];

export const DEMO_AUDIT_LOGS: AuditEvent[] = [
  {
    id: 'aud-001',
    timestamp: '2026-11-02T13:40:00Z',
    actor: 'Dinakar S (Administrator)',
    action: 'DATA_SHARING_POLICY_UPDATED',
    category: 'POLICY_CHANGE',
    details: {
      changedSetting: 'pseudonymizeIdentifiers',
      oldValue: false,
      newValue: true,
      reason: 'Enforced customer privacy compliance rule',
    },
    ipAddress: '192.168.1.104',
  },
  {
    id: 'aud-002',
    timestamp: '2026-11-02T11:20:00Z',
    actor: 'Customer-VPC-Collector-01',
    action: 'METRIC_BATCH_INGESTED',
    category: 'COLLECTOR',
    details: {
      metricsIngested: 142,
      sanitizedFields: 18,
      status: 'SUCCESS',
      scope: 'us-east-1',
    },
    ipAddress: '10.0.4.82',
  },
  {
    id: 'aud-003',
    timestamp: '2026-11-01T16:15:00Z',
    actor: 'Nikhil R (Security Reviewer)',
    action: 'COLLECTOR_TOKEN_REVOKED',
    category: 'SECURITY',
    details: {
      collectorId: 'col-docker-cicd-runner',
      reason: 'Periodic credential rotation & containment test',
    },
    ipAddress: '192.168.1.189',
  },
  {
    id: 'aud-004',
    timestamp: '2026-10-30T10:00:00Z',
    actor: 'Dinakar S (Administrator)',
    action: 'EXPORT_AUDIT_DOSSIER',
    category: 'DATA_EXPORT',
    details: {
      format: 'PDF',
      scope: 'Last 30 Days Compliance',
      file: 'CloudWatch-Sentinel-Audit-Report.pdf',
    },
    ipAddress: '192.168.1.104',
  },
];

export const DEMO_DELETION_REQUESTS: DeletionRequest[] = [
  {
    id: 'del-req-2026-001',
    requestedAt: '2026-10-28T09:00:00Z',
    requestedBy: 'Pranesh Sachin M (Security Lead)',
    dataCategories: ['Staging Environment Metric Samples (> 14 days old)'],
    status: 'COMPLETED',
    completedAt: '2026-10-28T09:05:00Z',
    recordsPurged: 12450,
  },
];

export const DEMO_RESOURCES: CloudResource[] = [
  {
    id: 'i-0a8b9f1234cde5678',
    name: 'prod-api-cluster-01',
    pseudonymizedAlias: 'res-ec2-a8b9',
    type: 'AWS::EC2::Instance',
    region: 'us-east-1',
    state: 'running',
    instanceType: 'm6i.xlarge',
    availabilityZone: 'us-east-1a',
    launchTime: '2026-09-12T04:12:00Z',
    tags: { Environment: 'Production', Service: 'CoreAPI', Owner: 'DevOps-Team' },
    healthStatus: 'HEALTHY',
    dataSource: 'DEMO',
    lastCollectedAt: '2026-11-02T13:58:00Z',
    metrics: {
      cpuUtilization: 38.4,
      networkInBps: 8420000,
      networkOutBps: 14200000,
      statusCheckFailed: 0,
      diskReadOps: 420,
      diskWriteOps: 890,
      memoryUtilization: 62.1,
    },
  },
  {
    id: 'i-0f9c8d7e6a5b4c3d2',
    name: 'prod-worker-etl-node-03',
    pseudonymizedAlias: 'res-ec2-f9c8',
    type: 'AWS::EC2::Instance',
    region: 'us-east-1',
    state: 'running',
    instanceType: 'c6i.2xlarge',
    availabilityZone: 'us-east-1b',
    launchTime: '2026-10-01T11:20:00Z',
    tags: { Environment: 'Production', Service: 'BatchETL', Owner: 'DataEngineering' },
    healthStatus: 'WARNING',
    healthReason: 'Sustained CPU > 85% for 45 minutes; potential bottleneck in batch consumer',
    dataSource: 'DEMO',
    lastCollectedAt: '2026-11-02T13:58:00Z',
    metrics: {
      cpuUtilization: 89.2,
      networkInBps: 28400000,
      networkOutBps: 34100000,
      statusCheckFailed: 0,
      diskReadOps: 1480,
      diskWriteOps: 3200,
      memoryUtilization: 84.7,
    },
  },
  {
    id: 'i-01a2b3c4d5e6f7a8b',
    name: 'staging-auth-gateway-01',
    pseudonymizedAlias: 'res-ec2-01a2',
    type: 'AWS::EC2::Instance',
    region: 'us-east-1',
    state: 'running',
    instanceType: 't3.medium',
    availabilityZone: 'us-east-1a',
    launchTime: '2026-10-24T08:00:00Z',
    tags: { Environment: 'Staging', Service: 'AuthGateway', Owner: 'SecurityEng' },
    healthStatus: 'HEALTHY',
    dataSource: 'DEMO',
    lastCollectedAt: '2026-11-02T13:58:00Z',
    metrics: {
      cpuUtilization: 14.6,
      networkInBps: 1200000,
      networkOutBps: 1800000,
      statusCheckFailed: 0,
      diskReadOps: 90,
      diskWriteOps: 110,
      memoryUtilization: 41.0,
    },
  },
  {
    id: 'i-077665544332211aa',
    name: 'legacy-payment-sync-proxy',
    pseudonymizedAlias: 'res-ec2-0776',
    type: 'AWS::EC2::Instance',
    region: 'us-east-1',
    state: 'running',
    instanceType: 'm5.large',
    availabilityZone: 'us-east-1b',
    launchTime: '2026-07-02T19:40:00Z',
    tags: { Environment: 'Production', Service: 'PaymentSync', Owner: 'FinOps' },
    healthStatus: 'CRITICAL',
    healthReason: 'StatusCheckFailed_Instance = 1; OS level kernel panic or network unreachable',
    dataSource: 'DEMO',
    lastCollectedAt: '2026-11-02T13:58:00Z',
    metrics: {
      cpuUtilization: 98.7,
      networkInBps: 45000,
      networkOutBps: 12000,
      statusCheckFailed: 1,
      diskReadOps: 12,
      diskWriteOps: 0,
      memoryUtilization: 96.3,
    },
  },
  {
    id: 'rds-aurora-cluster-main',
    name: 'kct-prod-aurora-postgres-cluster',
    pseudonymizedAlias: 'res-rds-8910',
    type: 'AWS::RDS::DBInstance',
    region: 'us-east-1',
    state: 'available',
    instanceType: 'db.r6g.xlarge',
    availabilityZone: 'us-east-1-multi-az',
    launchTime: '2026-06-15T00:00:00Z',
    tags: { Environment: 'Production', Service: 'RelationalDB', MultiAZ: 'True' },
    healthStatus: 'HEALTHY',
    dataSource: 'DEMO',
    lastCollectedAt: '2026-11-02T13:58:00Z',
    metrics: {
      cpuUtilization: 24.8,
      networkInBps: 19500000,
      networkOutBps: 26000000,
      statusCheckFailed: 0,
      diskReadOps: 850,
      diskWriteOps: 1920,
      memoryUtilization: 58.2,
    },
  },
];

export const DEMO_COST_SUMMARY: CostSummary = {
  mtdCost: 4892.45,
  lastMonthCost: 4420.10,
  forecastedCost: 6150.00,
  dailyAvg: 163.08,
  budgetLimit: 6000.00,
  budgetUtilizedPercent: 81.5,
  currency: 'USD',
  lastUpdated: '2026-11-02T13:40:00Z',
  dataSource: 'DEMO',
  topServices: [
    { service: 'Amazon Elastic Compute Cloud - Compute', amount: 2180.50, percentage: 44.6, trend: +8.4 },
    { service: 'Amazon Relational Database Service', amount: 1240.20, percentage: 25.3, trend: +1.2 },
    { service: 'Amazon Simple Storage Service', amount: 485.60, percentage: 9.9, trend: -2.5 },
    { service: 'Amazon CloudWatch', amount: 395.15, percentage: 8.1, trend: +34.8 },
    { service: 'AWS CodePipeline & CodeBuild', amount: 320.00, percentage: 6.5, trend: +18.2 },
    { service: 'Elastic Load Balancing', amount: 271.00, percentage: 5.5, trend: +0.4 },
  ],
};

export const DEMO_DAILY_COST_HISTORY: CostRecord[] = [
  { date: '2026-10-04', service: 'Amazon EC2', cost: 72.4, currency: 'USD', region: 'us-east-1', dataSource: 'DEMO' },
  { date: '2026-10-04', service: 'Amazon RDS', cost: 41.2, currency: 'USD', region: 'us-east-1', dataSource: 'DEMO' },
  { date: '2026-10-10', service: 'Amazon EC2', cost: 73.8, currency: 'USD', region: 'us-east-1', dataSource: 'DEMO' },
  { date: '2026-10-10', service: 'Amazon RDS', cost: 41.5, currency: 'USD', region: 'us-east-1', dataSource: 'DEMO' },
  { date: '2026-10-18', service: 'Amazon EC2', cost: 74.0, currency: 'USD', region: 'us-east-1', dataSource: 'DEMO' },
  { date: '2026-10-18', service: 'Amazon CloudWatch', cost: 12.4, currency: 'USD', region: 'us-east-1', dataSource: 'DEMO' },
  { date: '2026-10-28', service: 'Amazon CloudWatch', cost: 48.9, currency: 'USD', region: 'us-east-1', dataSource: 'DEMO' }, // SPIKE
  { date: '2026-11-01', service: 'Amazon EC2', cost: 81.0, currency: 'USD', region: 'us-east-1', dataSource: 'DEMO' },
  { date: '2026-11-01', service: 'Amazon CloudWatch', cost: 38.5, currency: 'USD', region: 'us-east-1', dataSource: 'DEMO' },
];

export const DEMO_PIPELINES: Pipeline[] = [
  {
    id: 'pipe-kct-payment-gateway',
    name: 'payment-gateway-ci-cd-pipeline',
    pseudonymizedAlias: 'pipe-masked-7a1b',
    region: 'us-east-1',
    status: 'Failed',
    lastExecutionId: 'e49b81f2-710c-4029-9e81-fa891024bcde',
    lastExecutionTime: '2026-11-02T13:42:10Z',
    durationSeconds: 412,
    tags: { Service: 'PaymentEngine', Environment: 'Production' },
    dataSource: 'DEMO',
    stages: [
      {
        name: 'Source',
        status: 'Succeeded',
        startTime: '2026-11-02T13:35:18Z',
        endTime: '2026-11-02T13:35:42Z',
        durationSeconds: 24,
        actions: [
          {
            name: 'GitHub_Webhook',
            actionTypeId: { category: 'Source', provider: 'GitHub', version: '1' },
            status: 'Succeeded',
            summary: 'Commit 8f9b2a1 verified via signed webhook',
          },
        ],
      },
      {
        name: 'Build',
        status: 'Succeeded',
        startTime: '2026-11-02T13:35:45Z',
        endTime: '2026-11-02T13:38:15Z',
        durationSeconds: 150,
        actions: [
          {
            name: 'CodeBuild_Docker',
            actionTypeId: { category: 'Build', provider: 'CodeBuild', version: '1' },
            status: 'Succeeded',
            summary: 'Docker image compiled and tagged (no logs retained)',
          },
        ],
      },
      {
        name: 'Test_Integration',
        status: 'Failed',
        startTime: '2026-11-02T13:38:18Z',
        endTime: '2026-11-02T13:42:10Z',
        durationSeconds: 232,
        failedAction: 'Run_End_To_End_Tests',
        sanitizedErrorMessage: 'IntegrationTestFailure: HTTP 403 authorization check failed in webhook signature suite. [Raw credentials and payload strings redacted]',
        actions: [
          {
            name: 'Run_End_To_End_Tests',
            actionTypeId: { category: 'Test', provider: 'CodeBuild', version: '1' },
            status: 'Failed',
            sanitizedCategory: 'ASSERTION_FAILURE',
            summary: 'Test suite failed with exit code 1. Logs sanitised.',
          },
        ],
      },
      {
        name: 'Deploy_Production',
        status: 'Cancelled',
        actions: [
          {
            name: 'ECS_Deploy',
            actionTypeId: { category: 'Deploy', provider: 'CodeDeploy', version: '1' },
            status: 'Cancelled',
          },
        ],
      },
    ],
  },
  {
    id: 'pipe-kct-core-api-release',
    name: 'core-api-production-release',
    pseudonymizedAlias: 'pipe-masked-3c9f',
    region: 'us-east-1',
    status: 'Succeeded',
    lastExecutionId: 'c7720a41-2b99-4d81-89ec-91823746ab12',
    lastExecutionTime: '2026-11-02T11:05:30Z',
    durationSeconds: 520,
    tags: { Service: 'CoreBackend', Environment: 'Production' },
    dataSource: 'DEMO',
    stages: [
      {
        name: 'Source',
        status: 'Succeeded',
        durationSeconds: 20,
        actions: [{ name: 'GitSync', actionTypeId: { category: 'Source', provider: 'GitHub', version: '1' }, status: 'Succeeded' }],
      },
      {
        name: 'Build',
        status: 'Succeeded',
        durationSeconds: 188,
        actions: [{ name: 'Compile', actionTypeId: { category: 'Build', provider: 'CodeBuild', version: '1' }, status: 'Succeeded' }],
      },
      {
        name: 'Deploy',
        status: 'Succeeded',
        durationSeconds: 308,
        actions: [{ name: 'DeployRolling', actionTypeId: { category: 'Deploy', provider: 'CodeDeploy', version: '1' }, status: 'Succeeded' }],
      },
    ],
  },
];

export const DEMO_BUILD_PROJECTS: BuildProject[] = [
  {
    id: 'proj-kct-payment-build',
    name: 'kct-payment-docker-build',
    description: 'Docker image packaging with least-privilege IAM build context',
    lastBuildStatus: 'SUCCEEDED',
    lastBuildNumber: 189,
    lastBuildTime: '2026-11-02T13:38:15Z',
    durationSeconds: 150,
    environment: {
      computeType: 'BUILD_GENERAL1_MEDIUM',
      image: 'aws/codebuild/amazonlinux2-x86_64-standard:4.0',
      type: 'LINUX_CONTAINER',
    },
    dataSource: 'DEMO',
    phases: [
      { phaseType: 'SUBMITTED', phaseStatus: 'SUCCEEDED', durationSeconds: 2 },
      { phaseType: 'PROVISIONING', phaseStatus: 'SUCCEEDED', durationSeconds: 18 },
      { phaseType: 'INSTALL', phaseStatus: 'SUCCEEDED', durationSeconds: 22 },
      { phaseType: 'BUILD', phaseStatus: 'SUCCEEDED', durationSeconds: 68 },
      { phaseType: 'POST_BUILD', phaseStatus: 'SUCCEEDED', durationSeconds: 12 },
    ],
  },
  {
    id: 'proj-kct-payment-e2e',
    name: 'kct-payment-e2e-tests',
    description: 'End-to-End integration test suite (Raw build logs redacted)',
    lastBuildStatus: 'FAILED',
    lastBuildNumber: 94,
    lastBuildTime: '2026-11-02T13:42:10Z',
    durationSeconds: 232,
    failureCategory: 'TEST_ASSERTION_FAILURE',
    sanitizedSummary: 'npm run test:e2e exited with code 1. Signature validation failed.',
    environment: {
      computeType: 'BUILD_GENERAL1_LARGE',
      image: 'aws/codebuild/standard:5.0',
      type: 'LINUX_CONTAINER',
    },
    dataSource: 'DEMO',
    phases: [
      { phaseType: 'PROVISIONING', phaseStatus: 'SUCCEEDED', durationSeconds: 20 },
      { phaseType: 'INSTALL', phaseStatus: 'SUCCEEDED', durationSeconds: 31 },
      { phaseType: 'BUILD', phaseStatus: 'FAILED', durationSeconds: 172 },
    ],
  },
];

export const DEMO_ANOMALIES: Anomaly[] = [
  {
    id: 'anom-cpu-spike-worker-03',
    category: 'INFRASTRUCTURE',
    title: 'Extreme CPU Utilization Surge on Batch Worker',
    targetResourceOrPipeline: 'i-0f9c8d7e6a5b4c3d2 (prod-worker-etl-node-03)',
    detectedAt: '2026-11-02T12:30:00Z',
    observedValue: 89.2,
    baselineMean: 31.4,
    baselineStdDev: 8.6,
    zScore: 6.72,
    unit: '% CPUUtilization',
    severity: 'HIGH',
    explanation: 'Current CPU utilization (89.2%) is 6.72 standard deviations above historical baseline mean (31.4% ± 8.6%).',
    status: 'ACTIVE',
    historicalWindowPoints: 168,
    dataSource: 'DEMO',
  },
  {
    id: 'anom-cost-cloudwatch-surge',
    category: 'COST',
    title: 'Unexpected Daily CloudWatch Logs Spending Surge',
    targetResourceOrPipeline: 'AWS Cost Explorer: Amazon CloudWatch',
    detectedAt: '2026-10-28T23:59:00Z',
    observedValue: 48.9,
    baselineMean: 11.8,
    baselineStdDev: 2.1,
    zScore: 17.67,
    unit: 'USD/day',
    severity: 'CRITICAL',
    explanation: 'Daily spending for Amazon CloudWatch surged from $11.80/day baseline to $48.90/day (Z = 17.67σ).',
    status: 'ACTIVE',
    historicalWindowPoints: 30,
    dataSource: 'DEMO',
  },
  {
    id: 'anom-pipeline-e2e-duration',
    category: 'PIPELINE',
    title: 'CI/CD Test Execution Latency Deviation',
    targetResourceOrPipeline: 'payment-gateway-ci-cd-pipeline: Test_Integration',
    detectedAt: '2026-11-02T13:42:10Z',
    observedValue: 232,
    baselineMean: 84.0,
    baselineStdDev: 14.5,
    zScore: 10.21,
    unit: 'seconds',
    severity: 'HIGH',
    explanation: 'Test stage took 232 seconds before failure (10.21 standard deviations over the 84.0s baseline).',
    status: 'ACTIVE',
    historicalWindowPoints: 45,
    dataSource: 'DEMO',
  },
];

export const DEMO_ALERTS: Alert[] = [
  {
    id: 'alt-ec2-status-check-fail',
    category: 'INFRASTRUCTURE',
    severity: 'CRITICAL',
    source: 'AWS/EC2 CloudWatch Alarm',
    resourceOrPipelineId: 'i-077665544332211aa (legacy-payment-sync-proxy)',
    description: 'EC2 Instance Status Check Failed (StatusCheckFailed_Instance = 1.0) in us-east-1b.',
    detectedAt: '2026-11-02T14:02:18Z',
    supportingEvidence: {
      metric: 'StatusCheckFailed_Instance',
      threshold: 1.0,
      availabilityZone: 'us-east-1b',
    },
    status: 'OPEN',
    suggestedNextAction: 'Check EC2 system log in customer AWS console or trigger stop/start to migrate host hardware.',
    dataSource: 'DEMO',
  },
  {
    id: 'alt-pipeline-test-failed',
    category: 'PIPELINE',
    severity: 'HIGH',
    source: 'AWS CodePipeline Execution Engine',
    resourceOrPipelineId: 'payment-gateway-ci-cd-pipeline',
    description: 'Pipeline execution failed at stage "Test_Integration" (Action: Run_End_To_End_Tests).',
    detectedAt: '2026-11-02T13:42:10Z',
    supportingEvidence: {
      executionId: 'e49b81f2-710c-4029-9e81-fa891024bcde',
      stage: 'Test_Integration',
      sanitizedError: 'HTTP 403 Forbidden',
    },
    status: 'OPEN',
    suggestedNextAction: 'Inspect local test runner credentials in SSM Parameter Store without sharing secrets.',
    dataSource: 'DEMO',
  },
  {
    id: 'alt-cost-budget-threshold-80',
    category: 'COST',
    severity: 'MEDIUM',
    source: 'AWS Cost Explorer / Budget Engine',
    resourceOrPipelineId: 'Budget: KCT-Monthly-Infrastructure-Cap',
    description: 'Actual AWS Month-to-Date expenditure ($4,892.45) has exceeded 80% of $6,000.00 monthly budget.',
    detectedAt: '2026-11-01T08:00:00Z',
    supportingEvidence: {
      currentMtdCost: 4892.45,
      budgetLimit: 6000.00,
      utilizationPercentage: 81.54,
    },
    status: 'ACKNOWLEDGED',
    acknowledgedBy: 'Santhosh TMA',
    suggestedNextAction: 'Review unattached EBS volumes and optimize CloudWatch log group retention policies.',
    dataSource: 'DEMO',
  },
];

export const DEMO_DEPLOYMENTS: DeploymentExecution[] = [
  {
    id: 'd-1A2B3C4D5',
    applicationName: 'KCT-CoreAPI-Application',
    deploymentGroupName: 'Production-ECS-Target-Group',
    status: 'Succeeded',
    startTime: '2026-11-02T11:00:22Z',
    endTime: '2026-11-02T11:05:30Z',
    durationSeconds: 308,
    deploymentOverview: { succeeded: 4, failed: 0, inProgress: 0, pending: 0 },
    rollbackInfo: { rollbackStatus: 'NOT_TRIGGERED' },
  },
  {
    id: 'd-9Z8Y7X6W5',
    applicationName: 'KCT-Payment-Service',
    deploymentGroupName: 'Staging-ECS-BlueGreen',
    status: 'Failed',
    startTime: '2026-10-30T17:15:00Z',
    endTime: '2026-10-30T17:21:40Z',
    durationSeconds: 400,
    deploymentOverview: { succeeded: 1, failed: 3, inProgress: 0, pending: 0 },
    failureMessage: 'Health check grace period exceeded on replacement task set (target group response 503). Automatic rollback succeeded.',
    rollbackInfo: { rollbackStatus: 'ROLLED_BACK_SUCCESSFULLY' },
  },
];

export const DEMO_WORKER_STATUS: MonitoringWorkerStatus = {
  lastRunAt: '2026-11-02T13:58:00Z',
  status: 'HEALTHY',
  intervalSeconds: 60,
  successCount: 1428,
  failureCount: 2,
  activeJobs: [
    'CloudWatch EC2 Metric Scraper (Every 60s)',
    'AWS Cost Explorer Billing Ingestion (Daily 04:00 UTC)',
    'CodePipeline / EventBridge Execution Consumer (Realtime)',
    'Z-Score Statistical Anomaly Detector (Every 5m)',
    'Supabase Realtime Sync Engine (Continuous WebSocket)',
  ],
  databaseConnected: true,
  realtimeConnected: true,
  eventBridgeActive: true,
  apiLatencyMs: 42,
};

export const CURRENT_USER: UserProfile = {
  id: 'usr-kct-001',
  name: 'Dinakar S',
  email: 'dinakardinakar165@gmail.com',
  role: 'Administrator',
  department: 'Cloud Application and Development',
  institution: 'Kumaraguru College of Technology',
  organisationName: 'Kumaraguru Enterprise Cloud Labs',
};

export const TEAM_MEMBERS = [
  { name: 'Dinakar S', rollNumber: '24BCS405', role: 'Full Stack & Cloud Architecture Lead' },
  { name: 'Kabileshwara Y', rollNumber: '24BCS411', role: 'CI/CD Pipeline & CodeBuild Integration Engineer' },
  { name: 'Pranesh Sachin M', rollNumber: '24BCS415', role: 'CloudWatch Telemetry & Anomaly Analytics Engineer' },
  { name: 'Santhosh TMA', rollNumber: '24BCS247', role: 'Cost Explorer & FinOps Optimization Engineer' },
  { name: 'Nikhil R', rollNumber: '24BCS190', role: 'DevOps, Supabase Realtime & Security Engineer' },
];

export const generateDemoMetricSeries = (hours: number = 24) => {
  const points = [];
  const now = Date.now();
  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(now - i * 3600 * 1000).toISOString();
    const hourOfDay = new Date(now - i * 3600 * 1000).getHours();
    const baseCpu = 25 + Math.sin((hourOfDay - 6) / 24 * Math.PI * 2) * 15;
    const isAnomalyTime = i === 3 || i === 2;
    const cpu = isAnomalyTime ? 89.2 + (Math.random() * 4 - 2) : Math.max(10, Math.min(95, baseCpu + (Math.random() * 8 - 4)));
    const netIn = Math.round((cpu * 320000) + Math.random() * 500000);
    const netOut = Math.round((cpu * 580000) + Math.random() * 800000);
    points.push({
      timestamp,
      timeLabel: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cpuUtilization: Number(cpu.toFixed(1)),
      networkInMB: Number((netIn / (1024 * 1024)).toFixed(2)),
      networkOutMB: Number((netOut / (1024 * 1024)).toFixed(2)),
      threshold: 80.0,
      dataSource: 'DEMO',
    });
  }
  return points;
};
