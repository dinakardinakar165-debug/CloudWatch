import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { StatCard } from '../common/StatCard';
import { exportToCSV } from '../../services/exportService';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Download,
  Trash2,
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  Database,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';

export const DataGovernance: React.FC = () => {
  const {
    operatingMode,
    dataSource,
    dataPolicy,
    consentRecords,
    updateConsent,
    deletionRequests,
    createDeletionRequest,
    collectors,
    account,
    resources,
    costSummary,
    currentUser,
    setCurrentPage,
  } = useApp();

  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [selectedDeleteCategory, setSelectedDeleteCategory] = useState<string>(
    'Historic CloudWatch Metric Observations (> 30 days old)'
  );

  const handleExportAllData = () => {
    const exportRows = resources.map((r) => ({
      DataSource: r.dataSource,
      ResourceID: r.id,
      Name: r.name,
      Type: r.type,
      Region: r.region,
      HealthStatus: r.healthStatus,
      CPU_Utilization: `${r.metrics.cpuUtilization}%`,
      LastCollected: r.lastCollectedAt,
    }));
    exportToCSV('Tenant-Export-All-CloudWatch-Sentinel-Data', exportRows);
  };

  const handleExecuteDeletion = () => {
    createDeletionRequest([selectedDeleteCategory]);
    setConfirmDeleteModal(false);
  };

  const isViewer = currentUser.role === 'Viewer';

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#172033]">
            Data Governance & Privacy Framework
          </h2>
          <p className="text-xs text-[#667085]">
            Account owner data control, consent revocation, retention periods, and Right-to-Erasure compliance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAllData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-[#E0E5EC] text-xs font-semibold text-[#172033] hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#3157C8]" />
            <span>Export Tenant Data (CSV)</span>
          </button>

          <button
            onClick={() => setConfirmDeleteModal(true)}
            disabled={isViewer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Right-to-Erasure (Purge)</span>
          </button>
        </div>
      </div>

      {/* Governance Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Ingestion Mode"
          value={
            operatingMode === 'MODE_C_DEMO'
              ? 'Mode C (Demo)'
              : operatingMode === 'MODE_B_LOCAL_COLLECTOR'
              ? 'Mode B (Local Collector)'
              : 'Mode A (Cross-Account)'
          }
          subtitle={`Current Data Source: [${dataSource}]`}
          icon={ShieldCheck}
          accentColor={operatingMode === 'MODE_C_DEMO' ? 'warning' : 'teal'}
        />
        <StatCard
          title="Active Collectors"
          value={collectors.filter((c) => c.status === 'ACTIVE').length}
          subtitle={`${collectors.length} total registrations`}
          icon={Database}
          accentColor="blue"
        />
        <StatCard
          title="Data Retention Limit"
          value={`${dataPolicy.retentionDays} Days`}
          subtitle="Rolling automated purge"
          icon={Clock}
          accentColor="navy"
        />
        <StatCard
          title="Pseudonymisation"
          value={dataPolicy.pseudonymizeIdentifiers ? 'ENABLED' : 'DISABLED'}
          subtitle={dataPolicy.pseudonymizeIdentifiers ? 'IDs masked with hashes' : 'Raw AWS IDs displayed'}
          icon={Lock}
          accentColor={dataPolicy.pseudonymizeIdentifiers ? 'teal' : 'warning'}
        />
      </div>

      {/* Mode & Connection State Overview */}
      <div className="bg-white rounded-lg border border-[#E0E5EC] p-5 shadow-2xs flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E0E5EC]">
          <div>
            <h3 className="text-sm font-bold text-[#172033]">
              Active Ingestion Mode & Custody Chain
            </h3>
            <p className="text-xs text-[#667085]">
              Details on who holds credentials, where telemetry is sanitized, and how access can be revoked
            </p>
          </div>
          <button
            onClick={() => setCurrentPage('consent_policies')}
            className="text-xs font-semibold text-[#3157C8] hover:underline"
          >
            Configure Policies →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded bg-[#F5F7FA] border border-[#E0E5EC]">
            <span className="text-[#667085] block text-[10px] uppercase font-bold">
              Account Identifier
            </span>
            <span className="font-bold text-[#172033] mt-1 block">
              {dataPolicy.pseudonymizeIdentifiers ? 'org-acc-7a1b (Masked)' : account.accountId || '124890374182'}
            </span>
            <span className="text-[#667085] text-[10px] mt-0.5 block">
              Alias: {account.accountAlias || 'kct-enterprise-prod'}
            </span>
          </div>

          <div className="p-3.5 rounded bg-[#F5F7FA] border border-[#E0E5EC]">
            <span className="text-[#667085] block text-[10px] uppercase font-bold">
              Credential Custody
            </span>
            <span className="font-bold text-[#172033] mt-1 block">
              {operatingMode === 'MODE_B_LOCAL_COLLECTOR'
                ? 'Retained inside Customer VPC'
                : operatingMode === 'MODE_A_CROSS_ACCOUNT'
                ? 'Temporary STS AssumeRole session'
                : 'Zero credentials (Offline Simulation)'}
            </span>
            <span className="text-[#667085] text-[10px] mt-0.5 block">
              Permanent keys shared: NEVER
            </span>
          </div>

          <div className="p-3.5 rounded bg-[#F5F7FA] border border-[#E0E5EC]">
            <span className="text-[#667085] block text-[10px] uppercase font-bold">
              Revocation Mechanism
            </span>
            <span className="font-bold text-[#172033] mt-1 block">
              {operatingMode === 'MODE_B_LOCAL_COLLECTOR'
                ? 'Revoke Scoped Ingestion Token'
                : operatingMode === 'MODE_A_CROSS_ACCOUNT'
                ? 'Delete / Detach IAM Role in AWS'
                : 'Instant switch in settings'}
            </span>
            <span className="text-[#667085] text-[10px] mt-0.5 block">
              Effective immediately
            </span>
          </div>
        </div>
      </div>

      {/* Consent Registry Table */}
      <div className="bg-white rounded-lg border border-[#E0E5EC] p-5 shadow-2xs flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E0E5EC]">
          <div>
            <h3 className="text-sm font-bold text-[#172033]">
              Customer Consent Registry & Storage Boundaries
            </h3>
            <p className="text-xs text-[#667085]">
              Explicit consent must be granted before telemetry categories enter the platform
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E0E5EC] text-[#667085] uppercase tracking-wider font-semibold">
                <th className="pb-3">Telemetry Category</th>
                <th className="pb-3">Data Captured</th>
                <th className="pb-3">Storage Location</th>
                <th className="pb-3">Retention Policy</th>
                <th className="pb-3">Consent Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E5EC]">
              {consentRecords.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-bold text-[#172033]">
                    {c.category}
                  </td>
                  <td className="py-3 text-[#667085] max-w-xs">
                    {c.description}
                  </td>
                  <td className="py-3 font-mono text-[11px] text-[#172033]">
                    {c.storageLocation}
                  </td>
                  <td className="py-3 font-mono text-[11px] text-[#667085]">
                    {c.retentionPolicy}
                  </td>
                  <td className="py-3">
                    {c.isApproved ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        <XCircle className="w-3 h-3 text-slate-500" />
                        Prohibited / Denied
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    {c.canRevoke && (
                      <button
                        onClick={() => updateConsent(c.id, !c.isApproved)}
                        disabled={isViewer}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors disabled:opacity-40 ${
                          c.isApproved
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {c.isApproved ? 'Revoke Consent' : 'Approve Category'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deletion Requests History (Right to Erasure) */}
      <div className="bg-white rounded-lg border border-[#E0E5EC] p-5 shadow-2xs flex flex-col gap-4">
        <h3 className="text-sm font-bold text-[#172033] pb-2 border-b border-[#E0E5EC] flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-rose-600" />
          Right-to-Erasure Execution History
        </h3>

        <div className="flex flex-col gap-2">
          {deletionRequests.map((del) => (
            <div
              key={del.id}
              className="p-3.5 rounded-md bg-[#F5F7FA] border border-[#E0E5EC] flex flex-wrap items-center justify-between gap-3 text-xs"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-[#172033]">
                  Purge Request: {del.id}
                </span>
                <span className="text-[#667085] font-mono text-[11px]">
                  Target Categories: {del.dataCategories.join(', ')}
                </span>
                <span className="text-[#667085] text-[10px]">
                  Requested by {del.requestedBy} on {new Date(del.requestedAt).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] font-bold text-emerald-700">
                  {del.recordsPurged.toLocaleString()} records purged
                </span>
                <StatusBadge status={del.status} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal for Right-to-Erasure */}
      {confirmDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-[#E0E5EC] flex flex-col gap-4">
            <div className="flex items-center gap-3 text-rose-700">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-[#172033]">
                Confirm Right-to-Erasure Purge
              </h3>
            </div>

            <p className="text-xs text-[#667085] leading-relaxed">
              In compliance with enterprise data-retention guidelines, executing this request will permanently delete all stored telemetry matching the selected category. This action is non-reversible and recorded in the immutable audit log.
            </p>

            <div>
              <label className="text-xs font-semibold text-[#172033] block mb-1">
                Select Data Category to Purge
              </label>
              <select
                value={selectedDeleteCategory}
                onChange={(e) => setSelectedDeleteCategory(e.target.value)}
                className="w-full text-xs border border-[#E0E5EC] rounded p-2 bg-white outline-none"
              >
                <option value="Historic CloudWatch Metric Observations (> 30 days old)">
                  Historic Metric Samples (&gt; 30 days old)
                </option>
                <option value="All Stored Cost Explorer Billing Records">
                  All Stored Billing Records
                </option>
                <option value="CI/CD Pipeline Execution History">
                  CI/CD Pipeline Execution History
                </option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDeleteModal(false)}
                className="px-3 py-1.5 rounded border border-[#E0E5EC] text-xs font-semibold text-[#172033] hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDeletion}
                className="px-4 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                Permanently Purge Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
