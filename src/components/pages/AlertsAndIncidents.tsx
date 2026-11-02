import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { StatCard } from '../common/StatCard';
import {
  BellRing,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Filter,
  Search,
  Check,
  ShieldAlert,
} from 'lucide-react';

export const AlertsAndIncidents: React.FC = () => {
  const { alerts, updateAlertStatus } = useApp();
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  const filtered = alerts.filter((alt) => {
    const matchesSev = filterSeverity === 'ALL' || alt.severity === filterSeverity;
    const matchesStat = filterStatus === 'ALL' || alt.status === filterStatus;
    const matchesSearch =
      alt.description.toLowerCase().includes(search.toLowerCase()) ||
      alt.resourceOrPipelineId.toLowerCase().includes(search.toLowerCase());
    return matchesSev && matchesStat && matchesSearch;
  });

  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' && a.status === 'OPEN').length;
  const highCount = alerts.filter((a) => a.severity === 'HIGH' && a.status === 'OPEN').length;
  const openCount = alerts.filter((a) => a.status === 'OPEN').length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#263445]">
            Unified Cloud Incident & Alarm Center
          </h2>
          <p className="text-xs text-[#667085]">
            Consolidated operational alerts spanning CloudWatch alarms, pipeline breaks, cost breaches, and compute failures
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Open Alarms & Incidents"
          value={openCount}
          subtitle="Requiring engineering action"
          icon={BellRing}
          accentColor={openCount > 0 ? 'critical' : 'teal'}
        />
        <StatCard
          title="Critical Severity Alarms"
          value={criticalCount}
          subtitle="Immediate production impact"
          icon={XCircle}
          accentColor={criticalCount > 0 ? 'critical' : 'teal'}
        />
        <StatCard
          title="High Severity Alarms"
          value={highCount}
          subtitle="Service degradation risks"
          icon={AlertTriangle}
          accentColor={highCount > 0 ? 'warning' : 'teal'}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-lg border border-[#E0E5EC] p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#667085]" />
          <input
            type="text"
            placeholder="Search incident descriptions, resources, or error strings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs outline-none text-[#263445]"
          />
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[#667085]">Severity:</span>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="border border-[#E0E5EC] rounded px-2.5 py-1 bg-white text-[#263445] outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[#667085]">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-[#E0E5EC] rounded px-2.5 py-1 bg-white text-[#263445] outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incident Cards */}
      <div className="flex flex-col gap-4">
        {filtered.map((alert) => (
          <div
            key={alert.id}
            className={`bg-white rounded-lg border p-5 shadow-2xs flex flex-col gap-3 transition-all ${
              alert.severity === 'CRITICAL' && alert.status === 'OPEN'
                ? 'border-rose-300 ring-2 ring-rose-50'
                : 'border-[#E0E5EC]'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-md bg-[#F4F6F9] text-[#14243A]">
                  <ShieldAlert className="w-5 h-5 text-[#3157C8]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={alert.severity} size="sm" />
                    <span className="font-mono text-xs text-[#667085]">
                      Category: {alert.category}
                    </span>
                    <span className="text-[#667085]">·</span>
                    <span className="font-mono text-xs text-[#667085]">
                      Source: {alert.source}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-[#263445] mt-1">
                    {alert.description}
                  </h3>
                  <div className="text-xs text-[#667085] font-mono mt-0.5">
                    Target: {alert.resourceOrPipelineId} · Detected:{' '}
                    {new Date(alert.detectedAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge status={alert.status} size="sm" />
                {alert.status === 'OPEN' && (
                  <button
                    onClick={() => updateAlertStatus(alert.id, 'ACKNOWLEDGED')}
                    className="px-2.5 py-1 text-xs rounded border border-[#E0E5EC] bg-white hover:bg-slate-50 font-medium text-[#263445] transition-colors"
                  >
                    Acknowledge
                  </button>
                )}
                {alert.status !== 'RESOLVED' && (
                  <button
                    onClick={() => updateAlertStatus(alert.id, 'RESOLVED')}
                    className="px-2.5 py-1 text-xs rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>

            {/* Supporting Evidence Payload */}
            <div className="bg-[#F4F6F9] rounded p-3 text-xs font-mono">
              <span className="font-bold text-[#667085] block mb-1">
                Supporting Evidence / Telemetry Payload:
              </span>
              <pre className="text-[#263445] whitespace-pre-wrap overflow-x-auto text-[11px]">
                {JSON.stringify(alert.supportingEvidence, null, 2)}
              </pre>
            </div>

            {/* Suggested Next Action */}
            <div className="p-3 bg-blue-50 border border-blue-100 rounded text-xs text-blue-950 flex flex-col gap-1">
              <span className="font-bold text-blue-900">
                Suggested Remediation Action:
              </span>
              <p className="leading-relaxed">{alert.suggestedNextAction}</p>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-white rounded-lg border border-[#E0E5EC] p-8 text-center text-sm text-[#667085]">
            No alerts match your current filter parameters.
          </div>
        )}
      </div>
    </div>
  );
};
