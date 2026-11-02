/**
 * CloudWatch Sentinel - Global Privacy-First State Context
 * Manages Operating Modes (A, B, C), Data Sharing Policies,
 * Scoped Collectors, Immutable Audit Trail, and Consent Governance.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  NavigationPage,
  OperatingMode,
  DataSourceType,
  AWSAccountConnection,
  CloudResource,
  CostSummary,
  CostRecord,
  Pipeline,
  BuildProject,
  Anomaly,
  Alert,
  UserProfile,
  TimeRangeOption,
  DataSharingPolicy,
  CollectorRegistration,
  AuditEvent,
  ConsentRecord,
  DeletionRequest,
  DeploymentExecution,
  MonitoringWorkerStatus,
} from '../types/cloudwatch-sentinel';
import {
  DEFAULT_DATA_SHARING_POLICY,
  DEMO_ACCOUNT_CONNECTION,
  NOT_CONFIGURED_ACCOUNT,
  DEMO_COLLECTORS,
  DEMO_AUDIT_LOGS,
  DEMO_CONSENT_RECORDS,
  DEMO_DELETION_REQUESTS,
  DEMO_RESOURCES,
  DEMO_COST_SUMMARY,
  DEMO_DAILY_COST_HISTORY,
  DEMO_PIPELINES,
  DEMO_BUILD_PROJECTS,
  DEMO_DEPLOYMENTS,
  DEMO_WORKER_STATUS,
  DEMO_ANOMALIES,
  DEMO_ALERTS,
  CURRENT_USER,
} from '../data/mockEnterpriseData';
import { realtimeBus } from '../services/supabaseService';
import { pseudonymizeIdentifier } from '../services/dataSanitizationEngine';

interface AppContextType {
  currentPage: NavigationPage;
  setCurrentPage: (page: NavigationPage) => void;
  timeRange: TimeRangeOption;
  setTimeRange: (range: TimeRangeOption) => void;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;

  // Operating Mode
  operatingMode: OperatingMode;
  setOperatingMode: (mode: OperatingMode) => void;
  dataSource: DataSourceType;

  // AWS & Collector state
  account: AWSAccountConnection;
  setAccount: React.Dispatch<React.SetStateAction<AWSAccountConnection>>;
  collectors: CollectorRegistration[];
  registerCollector: (name: string, env: CollectorRegistration['environment']) => { collector: CollectorRegistration; rawToken: string };
  revokeCollector: (collectorId: string) => void;
  rotateCollectorToken: (collectorId: string) => string;

  // Governance & Policies
  dataPolicy: DataSharingPolicy;
  updateDataPolicy: (updates: Partial<DataSharingPolicy>) => void;
  consentRecords: ConsentRecord[];
  updateConsent: (consentId: string, approved: boolean) => void;
  auditLogs: AuditEvent[];
  addAuditEvent: (action: string, category: AuditEvent['category'], details: Record<string, any>) => void;
  deletionRequests: DeletionRequest[];
  createDeletionRequest: (categories: string[]) => void;

  // Monitoring entities
  resources: CloudResource[];
  costSummary: CostSummary;
  costHistory: CostRecord[];
  pipelines: Pipeline[];
  selectedPipelineId: string;
  setSelectedPipelineId: (id: string) => void;
  builds: BuildProject[];
  deployments: DeploymentExecution[];
  anomalies: Anomaly[];
  alerts: Alert[];
  workerStatus: MonitoringWorkerStatus;

  // User & System
  currentUser: UserProfile;
  switchUserRole: (role: UserProfile['role']) => void;
  isRefreshing: boolean;
  triggerManualRefresh: () => Promise<void>;
  updateAlertStatus: (alertId: string, newStatus: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED') => void;
  updateAnomalyStatus: (anomalyId: string, newStatus: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED') => void;
  activeNotification: { message: string; type: 'info' | 'success' | 'warning' | 'error' } | null;
  dismissNotification: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('overview');
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('24h');
  const [selectedRegion, setSelectedRegion] = useState<string>('us-east-1');

  // Default to MODE_C_DEMO as explicitly required by prompt
  const [operatingMode, setOperatingModeState] = useState<OperatingMode>('MODE_C_DEMO');
  const [dataSource, setDataSource] = useState<DataSourceType>('DEMO');

  const [dataPolicy, setDataPolicy] = useState<DataSharingPolicy>(DEFAULT_DATA_SHARING_POLICY);
  const [collectors, setCollectors] = useState<CollectorRegistration[]>(DEMO_COLLECTORS);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(DEMO_AUDIT_LOGS);
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>(DEMO_CONSENT_RECORDS);
  const [deletionRequests, setDeletionRequests] = useState<DeletionRequest[]>(DEMO_DELETION_REQUESTS);

  const [account, setAccount] = useState<AWSAccountConnection>(DEMO_ACCOUNT_CONNECTION);
  const [resources, setResources] = useState<CloudResource[]>(DEMO_RESOURCES);
  const [costSummary, setCostSummary] = useState<CostSummary>(DEMO_COST_SUMMARY);
  const [costHistory, setCostHistory] = useState<CostRecord[]>(DEMO_DAILY_COST_HISTORY);
  const [pipelines, setPipelines] = useState<Pipeline[]>(DEMO_PIPELINES);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('pipe-kct-payment-gateway');
  const [builds, setBuilds] = useState<BuildProject[]>(DEMO_BUILD_PROJECTS);
  const [anomalies, setAnomalies] = useState<Anomaly[]>(DEMO_ANOMALIES);
  const [alerts, setAlerts] = useState<Alert[]>(DEMO_ALERTS);
  const [deployments] = useState<DeploymentExecution[]>(DEMO_DEPLOYMENTS);
  const [workerStatus] = useState<MonitoringWorkerStatus>(DEMO_WORKER_STATUS);

  const [currentUser, setCurrentUser] = useState<UserProfile>(CURRENT_USER);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeNotification, setActiveNotification] = useState<{
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  } | null>(null);

  // Mode Transition Handler
  const setOperatingMode = (mode: OperatingMode) => {
    setOperatingModeState(mode);
    if (mode === 'MODE_C_DEMO') {
      setDataSource('DEMO');
      setAccount(DEMO_ACCOUNT_CONNECTION);
      addAuditEvent('OPERATING_MODE_CHANGED', 'SECURITY', { mode: 'MODE_C_DEMO', note: 'Switched to simulated offline demo mode' });
    } else if (mode === 'MODE_A_CROSS_ACCOUNT') {
      setDataSource('LIVE_AWS');
      setAccount((prev) => ({
        ...prev,
        operatingMode: 'MODE_A_CROSS_ACCOUNT',
        dataSource: 'LIVE_AWS',
      }));
      addAuditEvent('OPERATING_MODE_CHANGED', 'SECURITY', { mode: 'MODE_A_CROSS_ACCOUNT', note: 'Switched to customer-authorised cross-account role mode' });
    } else if (mode === 'MODE_B_LOCAL_COLLECTOR') {
      setDataSource('CUSTOMER_COLLECTOR');
      setAccount((prev) => ({
        ...prev,
        operatingMode: 'MODE_B_LOCAL_COLLECTOR',
        dataSource: 'CUSTOMER_COLLECTOR',
      }));
      addAuditEvent('OPERATING_MODE_CHANGED', 'SECURITY', { mode: 'MODE_B_LOCAL_COLLECTOR', note: 'Switched to customer-controlled local collector ingestion mode' });
    }
  };

  const addAuditEvent = (
    action: string,
    category: AuditEvent['category'],
    details: Record<string, any>
  ) => {
    const newEvent: AuditEvent = {
      id: `aud-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      actor: `${currentUser.name} (${currentUser.role})`,
      action,
      category,
      details,
      ipAddress: '192.168.1.104',
    };
    setAuditLogs((prev) => [newEvent, ...prev]);
  };

  const updateDataPolicy = (updates: Partial<DataSharingPolicy>) => {
    setDataPolicy((prev) => {
      const next = { ...prev, ...updates, lastApprovedAt: new Date().toISOString(), approvedBy: currentUser.name, isCustomized: true };
      addAuditEvent('DATA_SHARING_POLICY_UPDATED', 'POLICY_CHANGE', {
        changedFields: Object.keys(updates),
        newPolicy: next,
      });
      return next;
    });

    setActiveNotification({
      message: 'Data Sharing Policy updated and recorded in audit log.',
      type: 'success',
    });
    setTimeout(() => setActiveNotification(null), 4000);
  };

  const updateConsent = (consentId: string, approved: boolean) => {
    setConsentRecords((prev) =>
      prev.map((c) =>
        c.id === consentId
          ? {
              ...c,
              isApproved: approved,
              approvedBy: approved ? currentUser.name : undefined,
              approvedAt: approved ? new Date().toISOString() : undefined,
            }
          : c
      )
    );

    addAuditEvent('CONSENT_STATE_CHANGED', 'CONSENT', {
      consentId,
      newStatus: approved ? 'APPROVED' : 'REVOKED',
    });

    setActiveNotification({
      message: `Consent ${approved ? 'Granted' : 'Revoked'} for category.`,
      type: approved ? 'success' : 'warning',
    });
    setTimeout(() => setActiveNotification(null), 4000);
  };

  const registerCollector = (name: string, env: CollectorRegistration['environment']) => {
    const randomHex = Math.random().toString(36).substring(2, 10);
    const rawToken = `cws_live_${randomHex}_${Date.now().toString(36)}`;
    const newCollector: CollectorRegistration = {
      collectorId: `col-${env.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${randomHex.slice(0, 4)}`,
      name,
      environment: env,
      tokenPrefix: `${rawToken.slice(0, 14)}...`,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastHeartbeatAt: new Date().toISOString(),
      version: 'v1.4.2-py311',
      recordsSentCount: 0,
      allowedCategories: ['EC2 CPU', 'EC2 Network', 'Instance Status', 'CodePipeline State'],
      lastPayloadSummary: {
        metricsCount: 0,
        sanitizedFieldsCount: 0,
        rejectedProhibitedCount: 0,
      },
    };

    setCollectors((prev) => [newCollector, ...prev]);
    addAuditEvent('COLLECTOR_REGISTERED', 'COLLECTOR', {
      collectorId: newCollector.collectorId,
      name,
      environment: env,
    });

    return { collector: newCollector, rawToken };
  };

  const revokeCollector = (collectorId: string) => {
    setCollectors((prev) =>
      prev.map((c) => (c.collectorId === collectorId ? { ...c, status: 'REVOKED' } : c))
    );
    addAuditEvent('COLLECTOR_REVOKED', 'SECURITY', { collectorId, reason: 'Manual administrator revocation' });
    setActiveNotification({
      message: `Collector ${collectorId} access immediately revoked.`,
      type: 'warning',
    });
    setTimeout(() => setActiveNotification(null), 4000);
  };

  const rotateCollectorToken = (collectorId: string) => {
    const rawToken = `cws_live_rot_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;
    setCollectors((prev) =>
      prev.map((c) =>
        c.collectorId === collectorId
          ? { ...c, tokenPrefix: `${rawToken.slice(0, 14)}...`, status: 'ACTIVE' }
          : c
      )
    );
    addAuditEvent('COLLECTOR_TOKEN_ROTATED', 'SECURITY', { collectorId });
    return rawToken;
  };

  const createDeletionRequest = (categories: string[]) => {
    const req: DeletionRequest = {
      id: `del-req-${Date.now().toString().slice(-4)}`,
      requestedAt: new Date().toISOString(),
      requestedBy: currentUser.name,
      dataCategories: categories,
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
      recordsPurged: 4850,
    };
    setDeletionRequests((prev) => [req, ...prev]);
    addAuditEvent('RIGHT_TO_ERASURE_EXECUTED', 'DATA_DELETION', {
      requestId: req.id,
      categories,
      purgedCount: 4850,
    });
    setActiveNotification({
      message: 'Right-to-Erasure executed: 4,850 stored metric observations permanently purged.',
      type: 'success',
    });
    setTimeout(() => setActiveNotification(null), 5000);
  };

  const switchUserRole = (role: UserProfile['role']) => {
    setCurrentUser((prev) => ({ ...prev, role }));
    addAuditEvent('USER_ROLE_SWITCHED', 'AUTHENTICATION', { newRole: role });
  };

  const triggerManualRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsRefreshing(false);
    setActiveNotification({
      message: 'Telemetry collection cycle executed successfully.',
      type: 'success',
    });
    setTimeout(() => setActiveNotification(null), 3000);
  };

  const updateAlertStatus = (alertId: string, newStatus: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED') => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              status: newStatus,
              resolvedAt: newStatus === 'RESOLVED' ? new Date().toISOString() : undefined,
              acknowledgedBy: newStatus === 'ACKNOWLEDGED' ? currentUser.name : a.acknowledgedBy,
            }
          : a
      )
    );
    addAuditEvent('ALERT_STATUS_UPDATED', 'SECURITY', { alertId, status: newStatus });
  };

  const updateAnomalyStatus = (anomalyId: string, newStatus: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED') => {
    setAnomalies((prev) =>
      prev.map((anom) => (anom.id === anomalyId ? { ...anom, status: newStatus } : anom))
    );
    addAuditEvent('ANOMALY_STATUS_UPDATED', 'SECURITY', { anomalyId, status: newStatus });
  };

  const dismissNotification = () => setActiveNotification(null);

  // Apply pseudonymisation to displayed resources and pipelines when enabled by policy
  const effectiveResources = resources.map((r) =>
    dataPolicy.pseudonymizeIdentifiers
      ? { ...r, name: r.pseudonymizedAlias || pseudonymizeIdentifier(r.id, 'ec2'), id: pseudonymizeIdentifier(r.id, 'ec2') }
      : r
  );

  const effectivePipelines = pipelines.map((p) =>
    dataPolicy.pseudonymizeIdentifiers
      ? { ...p, name: p.pseudonymizedAlias || pseudonymizeIdentifier(p.id, 'pipeline'), id: pseudonymizeIdentifier(p.id, 'pipeline') }
      : p
  );

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        timeRange,
        setTimeRange,
        selectedRegion,
        setSelectedRegion,
        operatingMode,
        setOperatingMode,
        dataSource,
        account,
        setAccount,
        collectors,
        registerCollector,
        revokeCollector,
        rotateCollectorToken,
        dataPolicy,
        updateDataPolicy,
        consentRecords,
        updateConsent,
        auditLogs,
        addAuditEvent,
        deletionRequests,
        createDeletionRequest,
        resources: effectiveResources,
        costSummary,
        costHistory,
        pipelines: effectivePipelines,
        selectedPipelineId,
        setSelectedPipelineId,
        builds,
        deployments,
        anomalies,
        alerts,
        workerStatus,
        currentUser,
        switchUserRole,
        isRefreshing,
        triggerManualRefresh,
        updateAlertStatus,
        updateAnomalyStatus,
        activeNotification,
        dismissNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
