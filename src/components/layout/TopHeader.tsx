import React from 'react';
import { useApp } from '../../context/AppContext';
import { OperatingMode, TimeRangeOption } from '../../types/cloudwatch-sentinel';
import {
  RefreshCw,
  Globe,
  Clock,
  Shield,
  ShieldAlert,
  Server,
  Lock,
  ChevronDown,
} from 'lucide-react';

const AWS_REGIONS = [
  { id: 'us-east-1', name: 'us-east-1 (N. Virginia)' },
  { id: 'us-west-2', name: 'us-west-2 (Oregon)' },
  { id: 'eu-west-1', name: 'eu-west-1 (Ireland)' },
  { id: 'ap-south-1', name: 'ap-south-1 (Mumbai)' },
];

export const TopHeader: React.FC = () => {
  const {
    timeRange,
    setTimeRange,
    selectedRegion,
    setSelectedRegion,
    operatingMode,
    setOperatingMode,
    dataSource,
    account,
    isRefreshing,
    triggerManualRefresh,
    currentUser,
    switchUserRole,
    setCurrentPage,
    dataPolicy,
  } = useApp();

  return (
    <header className="bg-white border-b border-[#E0E5EC] px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
      {/* Left: Mode Selection & Data Source Tag */}
      <div className="flex items-center gap-3">
        {/* Three Operating Modes Selector */}
        <div className="flex items-center bg-[#F5F7FA] p-1 rounded-md border border-[#E0E5EC] text-xs font-mono">
          <button
            onClick={() => setOperatingMode('MODE_C_DEMO')}
            className={`px-2.5 py-1 rounded font-bold transition-all ${
              operatingMode === 'MODE_C_DEMO'
                ? 'bg-white text-amber-700 shadow-2xs border border-amber-200'
                : 'text-[#667085] hover:text-[#172033]'
            }`}
          >
            Mode C: Demo
          </button>
          <button
            onClick={() => setOperatingMode('MODE_B_LOCAL_COLLECTOR')}
            className={`px-2.5 py-1 rounded font-bold transition-all ${
              operatingMode === 'MODE_B_LOCAL_COLLECTOR'
                ? 'bg-white text-[#3157C8] shadow-2xs border border-blue-200'
                : 'text-[#667085] hover:text-[#172033]'
            }`}
          >
            Mode B: Local Collector
          </button>
          <button
            onClick={() => setOperatingMode('MODE_A_CROSS_ACCOUNT')}
            className={`px-2.5 py-1 rounded font-bold transition-all ${
              operatingMode === 'MODE_A_CROSS_ACCOUNT'
                ? 'bg-white text-emerald-700 shadow-2xs border border-emerald-200'
                : 'text-[#667085] hover:text-[#172033]'
            }`}
          >
            Mode A: Cross-Account
          </button>
        </div>

        {/* Live Data Source Badge */}
        <span
          className={`hidden md:inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded border font-bold ${
            dataSource === 'DEMO'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : dataSource === 'CUSTOMER_COLLECTOR'
              ? 'bg-blue-50 text-blue-800 border-blue-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              dataSource === 'DEMO'
                ? 'bg-amber-500'
                : dataSource === 'CUSTOMER_COLLECTOR'
                ? 'bg-blue-600'
                : 'bg-emerald-600'
            }`}
          />
          SOURCE: [{dataSource}]
        </span>

        {dataPolicy.pseudonymizeIdentifiers && (
          <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
            <Lock className="w-3 h-3" />
            Pseudonymised
          </span>
        )}
      </div>

      {/* Right Controls: Region, Time, Refresh, User Role Switcher */}
      <div className="flex items-center gap-3">
        {/* Region Selector */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#F5F7FA] border border-[#E0E5EC] text-xs">
          <Globe className="w-3.5 h-3.5 text-[#667085]" />
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-transparent text-xs font-medium text-[#172033] outline-none cursor-pointer"
          >
            {AWS_REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Time Range */}
        <div className="flex items-center gap-0.5 bg-[#F5F7FA] p-0.5 rounded-md border border-[#E0E5EC] text-xs font-mono">
          <Clock className="w-3 h-3 ml-1.5 text-[#667085]" />
          {(['1h', '6h', '24h', '7d', '30d'] as TimeRangeOption[]).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                timeRange === r
                  ? 'bg-white text-[#3157C8] font-bold shadow-2xs'
                  : 'text-[#667085] hover:text-[#172033]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Manual Refresh */}
        <button
          onClick={triggerManualRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-[#E0E5EC] text-xs font-semibold text-[#172033] hover:bg-slate-50 transition-all disabled:opacity-50"
          title="Trigger ingestion check"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#3157C8] ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Sync</span>
        </button>

        {/* RBAC Role Selector Dropdown */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-[#E0E5EC] text-xs">
          <div className="w-7 h-7 rounded-full bg-[#111827] text-white flex items-center justify-center font-bold text-xs">
            {currentUser.name[0]}
          </div>
          <div className="flex flex-col text-left">
            <span className="font-bold text-[#172033] text-[11px] truncate max-w-[110px]">
              {currentUser.name}
            </span>
            <select
              value={currentUser.role}
              onChange={(e) => switchUserRole(e.target.value as any)}
              className="text-[10px] text-[#3157C8] font-semibold bg-transparent outline-none cursor-pointer"
              title="Test multi-tenant RBAC permissions"
            >
              <option value="Administrator">Role: Administrator</option>
              <option value="Organisation Owner">Role: Org Owner</option>
              <option value="Security Reviewer">Role: Security Reviewer</option>
              <option value="Viewer">Role: Read-Only Viewer</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
