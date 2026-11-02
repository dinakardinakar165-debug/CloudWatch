/**
 * CloudWatch Sentinel - Privacy-First Architecture Type Definitions
 * Enterprise AWS Cloud Observability, Cost Monitoring & CI/CD Pipeline Intelligence
 * Institution: Kumaraguru College of Technology
 */

export type OperatingMode =
  | 'MODE_A_CROSS_ACCOUNT'
  | 'MODE_B_LOCAL_COLLECTOR'
  | 'MODE_C_DEMO';

export type DataSourceType = 'LIVE_AWS' | 'CUSTOMER_COLLECTOR' | 'DEMO';

export type AWSAuthMethod = 'IAM_ROLE_EXTERNAL_ID' | 'CUSTOMER_COLLECTOR_TOKEN' | 'DEMO_MOCK';

export type ConnectionStatus = 'CONNECTED' | 'NOT_CONFIGURED' | 'ERROR' | 'VERIFYING' | 'REVOKED';

export interface AWSAccountConnection {
  accountId: string;
  accountAlias: string;
  roleArn?: string;
  externalId?: string; // Required for confused-deputy protection in Cross-Account Mode A
  region: string;
  status: ConnectionStatus;
  authMethod: AWSAuthMethod;
  lastVerifiedAt?: string;
  verifiedPermissions: string[];
  errorMessage?: string;
  operatingMode: OperatingMode;
  dataSource: DataSourceType;
}

export interface DataSharingPolicy {
  allowCpuMetrics: boolean;
  allowNetworkTotals: boolean;
  allowInstanceStatus: boolean;
  allowCostAggregates: boolean;
  allowPipelineStatus: boolean;
  allowBuildDuration: boolean;
  allowBuildLogs: boolean; // Statically locked to false / disabled
  allowSourceCode: boolean; // Statically locked to false / prohibited
  allowEnvVariables: boolean; // Statically locked to false / prohibited
  pseudonymizeIdentifiers: boolean;
  retentionDays: number;
  lastApprovedAt: string;
  approvedBy: string;
  isCustomized: boolean;
}

export interface CollectorRegistration {
  collectorId: string;
  name: string;
  environment: 'AWS EC2' | 'AWS Lambda' | 'Docker / Container' | 'Local / VPC';
  tokenPrefix: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  createdAt: string;
  lastHeartbeatAt: string;
  version: string;
  recordsSentCount: number;
  allowedCategories: string[];
  lastPayloadSummary?: {
    metricsCount: number;
    sanitizedFieldsCount: number;
    rejectedProhibitedCount: number;
  };
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  category: 'AUTHENTICATION' | 'CONSENT' | 'COLLECTOR' | 'POLICY_CHANGE' | 'DATA_EXPORT' | 'DATA_DELETION' | 'SECURITY';
  details: Record<string, any>;
  ipAddress?: string;
}

export interface DeletionRequest {
  id: string;
  requestedAt: string;
  requestedBy: string;
  dataCategories: string[];
  status: 'COMPLETED' | 'PROCESSING' | 'PENDING_APPROVAL';
  completedAt?: string;
  recordsPurged: number;
}

export interface ConsentRecord {
  id: string;
  category: string;
  description: string;
  purpose: string;
  storageLocation: string;
  retentionPolicy: string;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  canRevoke: boolean;
}

export type ResourceType =
  | 'AWS::EC2::Instance'
  | 'AWS::RDS::DBInstance'
  | 'AWS::Lambda::Function'
  | 'AWS::S3::Bucket'
  | 'AWS::EC2::Volume'
  | 'AWS::ElasticLoadBalancingV2::LoadBalancer';

export type HealthStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'UNKNOWN';

export interface CloudResource {
  id: string;
  name: string;
  pseudonymizedAlias?: string;
  type: ResourceType;
  region: string;
  state: 'running' | 'stopped' | 'terminated' | 'available' | 'in-use' | 'degraded';
  instanceType?: string;
  availabilityZone?: string;
  launchTime: string;
  tags: Record<string, string>;
  healthStatus: HealthStatus;
  healthReason?: string;
  dataSource: DataSourceType;
  lastCollectedAt: string;
  metrics: {
    cpuUtilization: number;
    networkInBps: number;
    networkOutBps: number;
    statusCheckFailed: number;
    diskReadOps?: number;
    diskWriteOps?: number;
    memoryUtilization?: number;
  };
}

export interface MetricSample {
  timestamp: string;
  value: number;
  unit: string;
  metricName: string;
  resourceId: string;
  region: string;
  aggregation: 'Average' | 'Maximum' | 'Minimum' | 'Sum';
  dataSource: DataSourceType;
}

export interface CostRecord {
  date: string;
  service: string;
  cost: number;
  currency: string;
  usageType?: string;
  region: string;
  dataSource: DataSourceType;
  isForecast?: boolean;
}

export interface CostSummary {
  mtdCost: number;
  lastMonthCost: number;
  forecastedCost: number;
  dailyAvg: number;
  budgetLimit: number;
  budgetUtilizedPercent: number;
  currency: string;
  lastUpdated: string;
  dataSource: DataSourceType;
  topServices: {
    service: string;
    amount: number;
    percentage: number;
    trend: number;
  }[];
}

export type PipelineStatus = 'InProgress' | 'Succeeded' | 'Failed' | 'Stopped' | 'Superseded';
export type StageStatus = 'InProgress' | 'Succeeded' | 'Failed' | 'Cancelled';

export interface PipelineAction {
  name: string;
  actionTypeId: {
    category: 'Source' | 'Build' | 'Test' | 'Deploy' | 'Approval' | 'Invoke';
    provider: string;
    version: string;
  };
  status: StageStatus;
  summary?: string;
  sanitizedCategory?: string;
  externalExecutionUrl?: string;
  externalExecutionId?: string;
}

export interface PipelineStage {
  name: string;
  status: StageStatus;
  startTime?: string;
  endTime?: string;
  durationSeconds?: number;
  actions: PipelineAction[];
  failedAction?: string;
  sanitizedErrorMessage?: string;
  errorMessage?: string;
}

export interface Pipeline {
  id: string;
  name: string;
  pseudonymizedAlias?: string;
  region: string;
  status: PipelineStatus;
  lastExecutionId?: string;
  lastExecutionTime?: string;
  durationSeconds?: number;
  stages: PipelineStage[];
  tags: Record<string, string>;
  dataSource: DataSourceType;
}

export interface BuildProject {
  id: string;
  name: string;
  description?: string;
  lastBuildStatus: 'SUCCEEDED' | 'FAILED' | 'IN_PROGRESS' | 'STOPPED';
  lastBuildNumber: number;
  lastBuildTime: string;
  durationSeconds: number;
  environment: {
    computeType: string;
    image: string;
    type: string;
  };
  failureCategory?: string;
  failureReason?: string;
  sanitizedSummary?: string;
  buildLogsUrl?: string;
  phases: {
    phaseType: string;
    phaseStatus: string;
    durationSeconds: number;
  }[];
  dataSource: DataSourceType;
}

export interface Anomaly {
  id: string;
  category: 'INFRASTRUCTURE' | 'COST' | 'PIPELINE';
  title: string;
  targetResourceOrPipeline: string;
  detectedAt: string;
  observedValue: number;
  baselineMean: number;
  baselineStdDev: number;
  zScore: number;
  unit: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  explanation: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  historicalWindowPoints: number;
  dataSource: DataSourceType;
}

export interface DeploymentExecution {
  id: string;
  applicationName: string;
  deploymentGroupName: string;
  status: 'Succeeded' | 'Failed' | 'InProgress' | 'Queued';
  startTime: string;
  endTime?: string;
  durationSeconds?: number;
  deploymentOverview?: {
    succeeded: number;
    failed: number;
    inProgress: number;
    pending: number;
  };
  rollbackInfo?: {
    rollbackStatus: string;
  };
  failureMessage?: string;
}

export interface MonitoringWorkerStatus {
  lastRunAt: string;
  status: 'HEALTHY' | 'COLLECTING' | 'DEGRADED';
  intervalSeconds: number;
  successCount: number;
  failureCount: number;
  activeJobs: string[];
  databaseConnected: boolean;
  realtimeConnected: boolean;
  eventBridgeActive: boolean;
  apiLatencyMs: number;
}

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
export type AlertCategory = 'INFRASTRUCTURE' | 'COST' | 'PIPELINE' | 'SECURITY' | 'GOVERNANCE';
export type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface Alert {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  source: string;
  resourceOrPipelineId: string;
  description: string;
  detectedAt: string;
  supportingEvidence: Record<string, any>;
  status: AlertStatus;
  suggestedNextAction: string;
  resolvedAt?: string;
  acknowledgedBy?: string;
  dataSource: DataSourceType;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'Organisation Owner' | 'Administrator' | 'Security Reviewer' | 'Viewer';
  department: string;
  institution: string;
  organisationName: string;
}

export type TimeRangeOption = '1h' | '6h' | '24h' | '7d' | '30d';

export type NavigationPage =
  | 'overview'
  | 'infrastructure'
  | 'cost_analytics'
  | 'pipeline_monitoring'
  | 'pipeline_details'
  | 'anomaly_detection'
  | 'alerts'
  | 'aws_connections'
  | 'collector_management'
  | 'data_governance'
  | 'consent_policies'
  | 'reports'
  | 'audit_logs'
  | 'settings'
  | 'team_profile';
