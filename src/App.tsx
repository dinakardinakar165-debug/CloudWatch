/**
 * CloudWatch Sentinel
 * Privacy-First AWS Infrastructure, Cost Monitoring & CI/CD Pipeline Intelligence Platform
 * Institution: Kumaraguru College of Technology
 * Team: Dinakar S (24BCS405), Kabileshwara Y (24BCS411), Pranesh Sachin M (24BCS415), Santhosh TMA (24BCS247), Nikhil R (24BCS190)
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { OverviewDashboard } from './components/pages/OverviewDashboard';
import { InfrastructureMonitoring } from './components/pages/InfrastructureMonitoring';
import { CostIntelligence } from './components/pages/CostIntelligence';
import { PipelineMonitoring } from './components/pages/PipelineMonitoring';
import { PipelineDetails } from './components/pages/PipelineDetails';
import { AnomalyInvestigation } from './components/pages/AnomalyInvestigation';
import { AlertsAndIncidents } from './components/pages/AlertsAndIncidents';
import { AwsConnections } from './components/pages/AwsConnections';
import { CollectorManagement } from './components/pages/CollectorManagement';
import { DataGovernance } from './components/pages/DataGovernance';
import { ConsentPolicies } from './components/pages/ConsentPolicies';
import { ReportsAndExports } from './components/pages/ReportsAndExports';
import { AuditLogs } from './components/pages/AuditLogs';
import { SettingsPage } from './components/pages/SettingsPage';
import { TeamProfile } from './components/pages/TeamProfile';
import {
  ChevronRight,
  Shield,
  X,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';

function SentinelMainContent() {
  const { currentPage, setCurrentPage, activeNotification, dismissNotification, operatingMode, dataSource } = useApp();

  const getPageTitle = () => {
    switch (currentPage) {
      case 'overview':
        return 'Overview Dashboard';
      case 'infrastructure':
        return 'Infrastructure Monitoring (EC2)';
      case 'cost_analytics':
        return 'AWS Cost Analytics & Budgets';
      case 'pipeline_monitoring':
        return 'CI/CD Pipeline Monitoring';
      case 'pipeline_details':
        return 'Pipeline Details & Stages';
      case 'anomaly_detection':
        return 'Statistical Anomaly Engine (Z-Score)';
      case 'alerts':
        return 'Alerts & Incidents';
      case 'aws_connections':
        return 'Mode A: Cross-Account IAM Role';
      case 'collector_management':
        return 'Mode B: Customer Local Collector';
      case 'data_governance':
        return 'Data Governance & Privacy Framework';
      case 'consent_policies':
        return 'Consent & Sharing Policies';
      case 'reports':
        return 'Reports & Compliance Dossiers';
      case 'audit_logs':
        return 'Security Audit Trail';
      case 'settings':
        return 'Platform Settings';
      case 'team_profile':
        return 'KCT Engineering Team Profile';
      default:
        return 'Dashboard';
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'overview':
        return <OverviewDashboard />;
      case 'infrastructure':
        return <InfrastructureMonitoring />;
      case 'cost_analytics':
        return <CostIntelligence />;
      case 'pipeline_monitoring':
        return <PipelineMonitoring />;
      case 'pipeline_details':
        return <PipelineDetails />;
      case 'anomaly_detection':
        return <AnomalyInvestigation />;
      case 'alerts':
        return <AlertsAndIncidents />;
      case 'aws_connections':
        return <AwsConnections />;
      case 'collector_management':
        return <CollectorManagement />;
      case 'data_governance':
        return <DataGovernance />;
      case 'consent_policies':
        return <ConsentPolicies />;
      case 'reports':
        return <ReportsAndExports />;
      case 'audit_logs':
        return <AuditLogs />;
      case 'settings':
        return <SettingsPage />;
      case 'team_profile':
        return <TeamProfile />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F5F7FA] min-h-screen">
      {/* Top Header with Mode & DataSource Controls */}
      <TopHeader />

      {/* Breadcrumb Subheader */}
      <div className="bg-white border-b border-[#E0E5EC] px-6 py-2 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-[#667085]">
          <span
            onClick={() => setCurrentPage('overview')}
            className="hover:text-[#3157C8] cursor-pointer font-medium"
          >
            CloudWatch Sentinel
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1]" />
          <span className="font-bold text-[#172033]">{getPageTitle()}</span>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="text-[#667085]">Mode:</span>
          <strong className="text-[#172033]">{operatingMode}</strong>
          <span className="text-[#667085]">·</span>
          <span className="text-[#667085]">Kumaraguru College of Technology</span>
        </div>
      </div>

      {/* Floating Active Notification Toast */}
      {activeNotification && (
        <div className="mx-6 mt-4 p-3 rounded-lg shadow-md border text-xs flex items-center justify-between gap-3 bg-white border-[#E0E5EC] animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            {activeNotification.type === 'success' && (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            {activeNotification.type === 'error' && (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            {activeNotification.type === 'warning' && (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            {activeNotification.type === 'info' && (
              <Info className="w-4 h-4 text-[#3157C8] shrink-0" />
            )}
            <span className="font-semibold text-[#172033]">
              {activeNotification.message}
            </span>
          </div>
          <button
            onClick={dismissNotification}
            className="text-[#667085] hover:text-[#172033]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Viewport */}
      <main className="flex-1 p-6 max-w-[1680px] w-full mx-auto">
        {renderCurrentPage()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E0E5EC] px-6 py-3.5 text-xs text-[#667085] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#172033]">CloudWatch Sentinel</span>
          <span>·</span>
          <span>Privacy-First AWS Observability</span>
          <span>·</span>
          <span>Kumaraguru College of Technology</span>
        </div>
        <div className="font-mono text-[11px]">
          Team: Dinakar S (24BCS405), Kabileshwara Y (24BCS411), Pranesh Sachin M (24BCS415), Santhosh TMA (24BCS247), Nikhil R (24BCS190)
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen flex text-[#172033] bg-[#F5F7FA] font-sans antialiased">
        <Sidebar />
        <SentinelMainContent />
      </div>
    </AppProvider>
  );
}
