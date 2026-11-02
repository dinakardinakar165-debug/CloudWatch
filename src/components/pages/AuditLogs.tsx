import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToCSV } from '../../services/exportService';
import {
  ScrollText,
  Search,
  Filter,
  Download,
  ShieldCheck,
  KeyRound,
  FileCheck2,
  Trash2,
  Clock,
} from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const { auditLogs } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filtered = auditLogs.filter((log) => {
    const matchesCat = selectedCategory === 'ALL' || log.category === selectedCategory;
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      JSON.stringify(log.details).toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleExport = () => {
    exportToCSV(
      'CloudWatch-Sentinel-Security-Audit-Trail',
      filtered.map((l) => ({
        ID: l.id,
        Timestamp: l.timestamp,
        Actor: l.actor,
        Action: l.action,
        Category: l.category,
        IP_Address: l.ipAddress || '',
        Details: JSON.stringify(l.details),
      }))
    );
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'SECURITY':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'POLICY_CHANGE':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'CONSENT':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'DATA_DELETION':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'COLLECTOR':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#172033]">
            Security Audit Trail & Governance Logs
          </h2>
          <p className="text-xs text-[#667085]">
            Tamper-evident operational log recording every credential check, token lifecycle, policy alteration, and consent action
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-[#E0E5EC] text-xs font-semibold text-[#172033] hover:bg-slate-50 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-[#3157C8]" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-lg border border-[#E0E5EC] p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#667085]" />
          <input
            type="text"
            placeholder="Search actions, actors, or details payload..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs outline-none text-[#172033]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-[#667085]" />
          <span className="font-semibold text-[#667085]">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-[#E0E5EC] rounded px-2.5 py-1 bg-white text-[#172033] outline-none"
          >
            <option value="ALL">All Categories ({auditLogs.length})</option>
            <option value="SECURITY">Security & Access</option>
            <option value="POLICY_CHANGE">Policy Alteration</option>
            <option value="CONSENT">Consent State</option>
            <option value="COLLECTOR">Collector Activity</option>
            <option value="DATA_DELETION">Data Erasure</option>
            <option value="DATA_EXPORT">Data Export</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-lg border border-[#E0E5EC] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F5F7FA] border-b border-[#E0E5EC] text-[#667085] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Details / Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E5EC]">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-[#172033] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${getCategoryColor(
                        log.category
                      )}`}
                    >
                      {log.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#172033]">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-[#172033]">
                    {log.actor}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#667085]">
                    {log.ipAddress || '—'}
                  </td>
                  <td className="py-3 px-4">
                    <pre className="font-mono text-[11px] text-[#667085] bg-slate-50 p-1.5 rounded border border-slate-200 max-w-md overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(log.details)}
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
