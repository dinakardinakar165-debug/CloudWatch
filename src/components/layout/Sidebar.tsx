import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationPage } from '../../types/cloudwatch-sentinel';
import {
  LayoutDashboard,
  Server,
  DollarSign,
  GitBranch,
  AlertOctagon,
  BellRing,
  KeyRound,
  Terminal,
  ShieldCheck,
  FileCheck2,
  FileSpreadsheet,
  ScrollText,
  Settings,
  Users,
  Shield,
  Sliders,
} from 'lucide-react';

interface NavGroup {
  title: string;
  items: {
    id: NavigationPage;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
  }[];
}

export const Sidebar: React.FC = () => {
  const { currentPage, setCurrentPage, alerts, anomalies, operatingMode } = useApp();

  const openAlertsCount = alerts.filter((a) => a.status === 'OPEN').length;
  const activeAnomaliesCount = anomalies.filter((a) => a.status === 'ACTIVE').length;

  const navGroups: NavGroup[] = [
    {
      title: 'CORE OBSERVABILITY',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'infrastructure', label: 'Infrastructure Monitoring', icon: Server },
        { id: 'cost_analytics', label: 'Cost Analytics', icon: DollarSign },
        { id: 'pipeline_monitoring', label: 'CI/CD Pipeline Monitoring', icon: GitBranch },
        {
          id: 'anomaly_detection',
          label: 'Anomaly Detection (Z-Score)',
          icon: AlertOctagon,
          badge: activeAnomaliesCount > 0 ? activeAnomaliesCount : undefined,
          badgeColor: 'bg-amber-500 text-white',
        },
        {
          id: 'alerts',
          label: 'Alerts & Incidents',
          icon: BellRing,
          badge: openAlertsCount > 0 ? openAlertsCount : undefined,
          badgeColor: 'bg-rose-600 text-white',
        },
      ],
    },
    {
      title: 'INGESTION & PRIVACY MODES',
      items: [
        { id: 'aws_connections', label: 'Mode A: Cross-Account IAM', icon: KeyRound },
        { id: 'collector_management', label: 'Mode B: Local Collector', icon: Terminal },
        { id: 'data_governance', label: 'Data Governance & Privacy', icon: ShieldCheck },
        { id: 'consent_policies', label: 'Consent & Sharing Policies', icon: FileCheck2 },
      ],
    },
    {
      title: 'GOVERNANCE & SECURITY',
      items: [
        { id: 'reports', label: 'Reports & Audit Dossiers', icon: FileSpreadsheet },
        { id: 'audit_logs', label: 'Immutable Audit Logs', icon: ScrollText },
        { id: 'settings', label: 'Settings & Multi-Tenant', icon: Settings },
      ],
    },
    {
      title: 'ACADEMIC SUBMISSION',
      items: [
        { id: 'team_profile', label: 'KCT Engineering Team', icon: Users },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#111827] text-slate-200 flex flex-col shrink-0 border-r border-[#0B0F17] select-none h-screen sticky top-0 overflow-y-auto">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10 flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#3157C8] flex items-center justify-center text-white shadow-md">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide text-white font-sans">
              CLOUDWATCH SENTINEL
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">
              Privacy-First Observability
            </p>
          </div>
        </div>

        {/* Institution Badge */}
        <div className="mt-3 px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-slate-300">
          <div className="font-semibold text-white truncate">Kumaraguru College of Technology</div>
          <div className="text-slate-400 text-[9px] truncate">Cloud App & Development · 2026</div>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 py-4 px-3 flex flex-col gap-5">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="flex flex-col gap-1">
            <span className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono">
              {group.title}
            </span>
            <div className="flex flex-col gap-0.5 mt-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors text-left ${
                      isActive
                        ? 'bg-[#3157C8] text-white shadow-xs font-semibold'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                          item.badgeColor || 'bg-slate-700 text-slate-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Active Mode Pill in Sidebar Footer */}
      <div className="p-4 border-t border-white/10 bg-[#0B0F17]/70 text-xs flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-mono">INGESTION MODE:</span>
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
              operatingMode === 'MODE_C_DEMO'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : operatingMode === 'MODE_B_LOCAL_COLLECTOR'
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {operatingMode === 'MODE_C_DEMO'
              ? 'MODE C: DEMO'
              : operatingMode === 'MODE_B_LOCAL_COLLECTOR'
              ? 'MODE B: COLLECTOR'
              : 'MODE A: CROSS-ACCT'}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          {operatingMode === 'MODE_C_DEMO'
            ? 'Offline deterministic simulation. Zero credentials required.'
            : operatingMode === 'MODE_B_LOCAL_COLLECTOR'
            ? 'Customer-controlled local collector with in-VPC sanitisation.'
            : 'Customer-created IAM role via STS AssumeRole with External ID.'}
        </p>
      </div>
    </aside>
  );
};
