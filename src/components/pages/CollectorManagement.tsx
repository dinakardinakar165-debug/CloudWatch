import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { StatCard } from '../common/StatCard';
import { CollectorRegistration } from '../../types/cloudwatch-sentinel';
import {
  Terminal,
  KeyRound,
  RotateCcw,
  Trash2,
  Copy,
  Check,
  Plus,
  Server,
  Cloud,
  CheckCircle2,
  ShieldCheck,
  Download,
  AlertTriangle,
} from 'lucide-react';

export const CollectorManagement: React.FC = () => {
  const {
    collectors,
    registerCollector,
    revokeCollector,
    rotateCollectorToken,
    currentUser,
    setOperatingMode,
  } = useApp();

  const [newCollectorName, setNewCollectorName] = useState('');
  const [newCollectorEnv, setNewCollectorEnv] = useState<CollectorRegistration['environment']>('AWS EC2');
  const [generatedTokenModal, setGeneratedTokenModal] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [rotatedTokenModal, setRotatedTokenModal] = useState<{ id: string; token: string } | null>(null);

  const isViewer = currentUser.role === 'Viewer';

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectorName) return;

    const { rawToken } = registerCollector(newCollectorName, newCollectorEnv);
    setGeneratedTokenModal(rawToken);
    setNewCollectorName('');
    setOperatingMode('MODE_B_LOCAL_COLLECTOR');
  };

  const handleRotate = (collectorId: string) => {
    const rawToken = rotateCollectorToken(collectorId);
    setRotatedTokenModal({ id: collectorId, token: rawToken });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 3000);
  };

  const handleDownloadCollectorScript = () => {
    window.open('/collector/sentinel_collector.py', '_blank');
  };

  const activeCount = collectors.filter((c) => c.status === 'ACTIVE').length;
  const revokedCount = collectors.filter((c) => c.status === 'REVOKED').length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#172033]">
            Mode B: Customer-Controlled Local Collector Fleet
          </h2>
          <p className="text-xs text-[#667085]">
            Manage in-VPC Python collectors, scoped revocable ingestion tokens, and local filtering heartbeats
          </p>
        </div>

        <button
          onClick={handleDownloadCollectorScript}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#3157C8] text-white text-xs font-semibold hover:bg-[#2544A8] transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Python Collector Package</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Active Local Collectors"
          value={activeCount}
          subtitle="Emitting heartbeat within 5 minutes"
          icon={Terminal}
          accentColor="teal"
        />
        <StatCard
          title="Revoked / Expired"
          value={revokedCount}
          subtitle="Tokens blocked at ingestion boundary"
          icon={AlertTriangle}
          accentColor={revokedCount > 0 ? 'warning' : 'navy'}
        />
        <StatCard
          title="Security Enforcement"
          value="Zero-Trust"
          subtitle="No AWS credentials shared with Sentinel"
          icon={ShieldCheck}
          accentColor="teal"
        />
      </div>

      {/* Register New Collector Section */}
      <div className="bg-white rounded-lg border border-[#E0E5EC] p-5 shadow-2xs flex flex-col gap-3">
        <h3 className="text-sm font-bold text-[#172033] pb-2 border-b border-[#E0E5EC] flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#3157C8]" />
          Register New Customer Environment Collector
        </h3>

        <form onSubmit={handleRegister} className="flex flex-wrap items-end gap-3 text-xs">
          <div className="flex-1 min-w-[220px]">
            <label className="font-semibold text-[#667085] block mb-1">
              Collector Name / Host Alias
            </label>
            <input
              type="text"
              required
              placeholder="e.g. prod-vpc-private-collector-01"
              value={newCollectorName}
              onChange={(e) => setNewCollectorName(e.target.value)}
              disabled={isViewer}
              className="w-full border border-[#E0E5EC] rounded-md px-3 py-2 outline-none focus:border-[#3157C8]"
            />
          </div>

          <div className="w-48">
            <label className="font-semibold text-[#667085] block mb-1">
              Runtime Environment
            </label>
            <select
              value={newCollectorEnv}
              onChange={(e) => setNewCollectorEnv(e.target.value as any)}
              disabled={isViewer}
              className="w-full border border-[#E0E5EC] rounded-md px-3 py-2 bg-white outline-none"
            >
              <option value="AWS EC2">AWS EC2 Instance</option>
              <option value="AWS Lambda">AWS Lambda Function</option>
              <option value="Docker / Container">Docker Container / ECS</option>
              <option value="Local / VPC">Local Dev / On-Premises</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isViewer || !newCollectorName}
            className="px-4 py-2 rounded-md bg-[#3157C8] hover:bg-[#2544A8] text-white font-semibold transition-colors disabled:opacity-50"
          >
            Generate Scoped Token
          </button>
        </form>
      </div>

      {/* Generated Token Banner Modal */}
      {generatedTokenModal && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-300 text-xs flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Collector Token Generated — Save Now (Displayed Only Once)
            </span>
            <button
              onClick={() => handleCopy(generatedTokenModal)}
              className="flex items-center gap-1 font-semibold text-emerald-800 hover:underline"
            >
              {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedToken ? 'Copied' : 'Copy Token'}</span>
            </button>
          </div>
          <pre className="bg-white p-2.5 rounded font-mono text-[11px] text-emerald-950 border border-emerald-200 overflow-x-auto">
            {generatedTokenModal}
          </pre>
          <div className="text-[11px] text-emerald-800 flex justify-between items-center">
            <span>Pass this token in the <code className="font-mono">Authorization: Bearer</code> header of your local collector.</span>
            <button
              onClick={() => setGeneratedTokenModal(null)}
              className="font-bold text-emerald-900 underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Rotated Token Banner Modal */}
      {rotatedTokenModal && (
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-300 text-xs flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-blue-900 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-blue-600" />
              Rotated Ingestion Token for {rotatedTokenModal.id}
            </span>
            <button
              onClick={() => handleCopy(rotatedTokenModal.token)}
              className="flex items-center gap-1 font-semibold text-blue-800 hover:underline"
            >
              {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedToken ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="bg-white p-2.5 rounded font-mono text-[11px] text-blue-950 border border-blue-200 overflow-x-auto">
            {rotatedTokenModal.token}
          </pre>
          <div className="text-[11px] text-blue-800 flex justify-between items-center">
            <span>Previous token invalidated. Update your collector daemon.</span>
            <button
              onClick={() => setRotatedTokenModal(null)}
              className="font-bold text-blue-900 underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Registered Collectors Fleet Table */}
      <div className="bg-white rounded-lg border border-[#E0E5EC] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F5F7FA] border-b border-[#E0E5EC] text-[#667085] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Collector ID / Name</th>
                <th className="py-3 px-4">Environment</th>
                <th className="py-3 px-4">Token Prefix</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Version</th>
                <th className="py-3 px-4">Last Heartbeat</th>
                <th className="py-3 px-4">Records Sent</th>
                <th className="py-3 px-4 text-right">Security Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E5EC]">
              {collectors.map((c) => (
                <tr key={c.collectorId} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#172033]">{c.name}</span>
                      <span className="font-mono text-[11px] text-[#667085]">{c.collectorId}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#172033]">
                    {c.environment}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#667085]">
                    {c.tokenPrefix}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={c.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#667085]">
                    {c.version}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#667085]">
                    {new Date(c.lastHeartbeatAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#172033]">
                    {c.recordsSentCount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {c.status === 'ACTIVE' && (
                        <>
                          <button
                            onClick={() => handleRotate(c.collectorId)}
                            disabled={isViewer}
                            className="px-2 py-1 rounded border border-[#E0E5EC] bg-white hover:bg-slate-50 text-[11px] font-semibold text-[#172033] transition-colors disabled:opacity-40"
                            title="Rotate ingestion token"
                          >
                            Rotate Token
                          </button>
                          <button
                            onClick={() => revokeCollector(c.collectorId)}
                            disabled={isViewer}
                            className="px-2 py-1 rounded border border-rose-200 bg-rose-50 hover:bg-rose-100 text-[11px] font-semibold text-rose-700 transition-colors disabled:opacity-40"
                            title="Immediately revoke access"
                          >
                            Revoke
                          </button>
                        </>
                      )}
                      {c.status === 'REVOKED' && (
                        <span className="text-[11px] font-mono text-rose-700 font-semibold">
                          Revoked & Inactive
                        </span>
                      )}
                    </div>
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
