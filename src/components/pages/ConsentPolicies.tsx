import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { sanitizeCollectorPayload } from '../../services/dataSanitizationEngine';
import {
  FileCheck2,
  Lock,
  Sliders,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

const SAMPLE_RAW_PAYLOAD = {
  account_id: '124890374182',
  resource_id: 'i-0a8b9f1234cde5678',
  cpu_utilization_avg: 42.8,
  network_in_bytes: 8400000,
  monthly_cost_estimate: 2180.5,
  pipeline_status: 'InProgress',
  // Accidental secret inclusion from script:
  aws_secret_access_key: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  github_token: 'ghp_9f8a2bc901de4581234567890abcdef01234',
  // Prohibited data:
  environment_variables: {
    DATABASE_URL: 'postgresql://postgres:secret123@prod-db.internal:5432/main',
    STRIPE_SECRET_KEY: 'sk_live_1234567890',
  },
  source_code_snippet: 'def execute_charge(token): stripe.Charge.create(amount=100)',
  raw_build_console_logs: '2026-11-02 13:40:12 DEBUG Loading AWS credentials from ~/.aws/credentials...',
};

export const ConsentPolicies: React.FC = () => {
  const { dataPolicy, updateDataPolicy, currentUser } = useApp();

  const [rawPayloadText, setRawPayloadText] = useState(
    JSON.stringify(SAMPLE_RAW_PAYLOAD, null, 2)
  );
  const [sanitizationResult, setSanitizationResult] = useState<any>(null);

  const isViewer = currentUser.role === 'Viewer';

  const handleRunSimulator = () => {
    try {
      const parsed = JSON.parse(rawPayloadText);
      const res = sanitizeCollectorPayload(parsed, dataPolicy);
      setSanitizationResult(res);
    } catch {
      alert('Invalid JSON in raw payload simulator.');
    }
  };

  const handleResetSimulator = () => {
    setRawPayloadText(JSON.stringify(SAMPLE_RAW_PAYLOAD, null, 2));
    setSanitizationResult(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#172033]">
            Consent & Data-Sharing Policy Configuration
          </h2>
          <p className="text-xs text-[#667085]">
            Granular controls over what telemetry is allowed, what is redacted, and zero-trust sanitisation preview
          </p>
        </div>

        <div className="text-xs font-mono text-[#667085]">
          Last approved by: <strong className="text-[#172033]">{dataPolicy.approvedBy}</strong>
        </div>
      </div>

      {/* Policy Toggles Grid */}
      <div className="bg-white rounded-lg border border-[#E0E5EC] p-5 shadow-2xs flex flex-col gap-4">
        <h3 className="text-sm font-bold text-[#172033] pb-2 border-b border-[#E0E5EC] flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#3157C8]" />
          Granular Telemetry Allowlist Toggles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* CPU Metrics */}
          <div className="p-3.5 rounded-md border border-[#E0E5EC] bg-[#F5F7FA] flex items-center justify-between gap-2">
            <div>
              <span className="font-bold text-[#172033] block">
                EC2 CPU Utilization Average
              </span>
              <span className="text-[11px] text-[#667085]">
                Hypervisor compute metrics
              </span>
            </div>
            <input
              type="checkbox"
              checked={dataPolicy.allowCpuMetrics}
              disabled={isViewer}
              onChange={(e) => updateDataPolicy({ allowCpuMetrics: e.target.checked })}
              className="w-4 h-4 accent-[#3157C8] cursor-pointer"
            />
          </div>

          {/* Network Totals */}
          <div className="p-3.5 rounded-md border border-[#E0E5EC] bg-[#F5F7FA] flex items-center justify-between gap-2">
            <div>
              <span className="font-bold text-[#172033] block">
                EC2 Network Traffic Totals
              </span>
              <span className="text-[11px] text-[#667085]">
                In/Out byte counts
              </span>
            </div>
            <input
              type="checkbox"
              checked={dataPolicy.allowNetworkTotals}
              disabled={isViewer}
              onChange={(e) => updateDataPolicy({ allowNetworkTotals: e.target.checked })}
              className="w-4 h-4 accent-[#3157C8] cursor-pointer"
            />
          </div>

          {/* Cost Aggregates */}
          <div className="p-3.5 rounded-md border border-[#E0E5EC] bg-[#F5F7FA] flex items-center justify-between gap-2">
            <div>
              <span className="font-bold text-[#172033] block">
                Monthly Cost Aggregates
              </span>
              <span className="text-[11px] text-[#667085]">
                Unblended service billing totals
              </span>
            </div>
            <input
              type="checkbox"
              checked={dataPolicy.allowCostAggregates}
              disabled={isViewer}
              onChange={(e) => updateDataPolicy({ allowCostAggregates: e.target.checked })}
              className="w-4 h-4 accent-[#3157C8] cursor-pointer"
            />
          </div>

          {/* Pipeline Status */}
          <div className="p-3.5 rounded-md border border-[#E0E5EC] bg-[#F5F7FA] flex items-center justify-between gap-2">
            <div>
              <span className="font-bold text-[#172033] block">
                CI/CD CodePipeline Status
              </span>
              <span className="text-[11px] text-[#667085]">
                Stage execution states
              </span>
            </div>
            <input
              type="checkbox"
              checked={dataPolicy.allowPipelineStatus}
              disabled={isViewer}
              onChange={(e) => updateDataPolicy({ allowPipelineStatus: e.target.checked })}
              className="w-4 h-4 accent-[#3157C8] cursor-pointer"
            />
          </div>

          {/* Build Duration */}
          <div className="p-3.5 rounded-md border border-[#E0E5EC] bg-[#F5F7FA] flex items-center justify-between gap-2">
            <div>
              <span className="font-bold text-[#172033] block">
                Build & Deploy Durations
              </span>
              <span className="text-[11px] text-[#667085]">
                Compilation phase durations
              </span>
            </div>
            <input
              type="checkbox"
              checked={dataPolicy.allowBuildDuration}
              disabled={isViewer}
              onChange={(e) => updateDataPolicy({ allowBuildDuration: e.target.checked })}
              className="w-4 h-4 accent-[#3157C8] cursor-pointer"
            />
          </div>

          {/* Pseudonymisation */}
          <div className="p-3.5 rounded-md border border-[#E0E5EC] bg-[#F5F7FA] flex items-center justify-between gap-2">
            <div>
              <span className="font-bold text-[#172033] block">
                Pseudonymise Identifiers
              </span>
              <span className="text-[11px] text-[#667085]">
                Mask account & resource IDs
              </span>
            </div>
            <input
              type="checkbox"
              checked={dataPolicy.pseudonymizeIdentifiers}
              disabled={isViewer}
              onChange={(e) => updateDataPolicy({ pseudonymizeIdentifiers: e.target.checked })}
              className="w-4 h-4 accent-[#3157C8] cursor-pointer"
            />
          </div>
        </div>

        {/* Permanently Prohibited & Locked Categories */}
        <div className="pt-2">
          <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider block mb-2">
            Permanently Prohibited Data Categories (Zero-Trust Enforcement)
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-600 shrink-0" />
              <div>
                <strong className="block font-mono text-[11px]">Source Code Artifacts</strong>
                <span className="text-[10px] text-rose-700">Strictly prohibited from ingestion</span>
              </div>
            </div>

            <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-600 shrink-0" />
              <div>
                <strong className="block font-mono text-[11px]">Environment Variables</strong>
                <span className="text-[10px] text-rose-700">Strictly prohibited from ingestion</span>
              </div>
            </div>

            <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-600 shrink-0" />
              <div>
                <strong className="block font-mono text-[11px]">Raw Terminal Build Logs</strong>
                <span className="text-[10px] text-rose-700">Statically disabled by policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive In-VPC Sanitisation Simulator */}
      <div className="bg-white rounded-lg border border-[#E0E5EC] p-5 shadow-2xs flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E0E5EC]">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#3157C8]" />
              <h3 className="text-sm font-bold text-[#172033]">
                Customer-Side Local Collector Sanitisation Simulator
              </h3>
            </div>
            <p className="text-xs text-[#667085]">
              Demonstrates how the customer-side Python collector strips secrets and drops prohibited fields before transmitting to Sentinel
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetSimulator}
              className="flex items-center gap-1 px-3 py-1.5 rounded border border-[#E0E5EC] text-xs font-semibold text-[#172033] hover:bg-slate-50"
            >
              <RotateCcw className="w-3 h-3 text-[#667085]" />
              <span>Reset Sample</span>
            </button>
            <button
              onClick={handleRunSimulator}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#3157C8] hover:bg-[#2544A8] text-white text-xs font-semibold shadow-xs"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Execute In-VPC Sanitisation</span>
            </button>
          </div>
        </div>

        {/* Dual Code Split: Raw input vs Sanitized Output */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Raw Collector Payload */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-[#172033] flex items-center justify-between">
              <span>Raw Customer Environment Payload (Pre-Sanitisation)</span>
              <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Contains Secrets & Prohibited Fields
              </span>
            </span>
            <textarea
              value={rawPayloadText}
              onChange={(e) => setRawPayloadText(e.target.value)}
              className="w-full h-80 bg-[#111827] text-slate-200 p-3 rounded-md font-mono text-[11px] leading-relaxed border border-slate-700 outline-none focus:border-[#3157C8]"
            />
          </div>

          {/* Right: Sanitised Clean Output */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-[#172033] flex items-center justify-between">
              <span>Sanitised Ingestion Payload (Delivered to Sentinel)</span>
              {sanitizationResult && (
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {sanitizationResult.redactedSecretOccurrences} Secrets Redacted · {sanitizationResult.rejectedProhibitedFields.length} Fields Dropped
                </span>
              )}
            </span>
            <div className="w-full h-80 bg-[#111827] text-slate-200 p-3 rounded-md font-mono text-[11px] leading-relaxed border border-slate-700 overflow-y-auto">
              {sanitizationResult ? (
                <pre>{JSON.stringify(sanitizationResult.sanitizedData, null, 2)}</pre>
              ) : (
                <div className="h-full flex items-center justify-center text-[#667085] text-xs">
                  Click "Execute In-VPC Sanitisation" to test policy filtering
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Prohibited Rejection Summary */}
        {sanitizationResult && sanitizationResult.rejectedProhibitedFields.length > 0 && (
          <div className="p-3.5 rounded-md bg-rose-50 border border-rose-200 text-xs flex flex-col gap-1.5 text-rose-950">
            <div className="flex items-center gap-1.5 font-bold text-rose-900">
              <XCircle className="w-4 h-4 text-rose-600" />
              Prohibited Fields Statically Dropped & Blocked by Policy
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {sanitizationResult.rejectedProhibitedFields.map((field: string, idx: number) => (
                <span
                  key={idx}
                  className="font-mono text-[11px] px-2 py-0.5 rounded bg-white text-rose-800 border border-rose-200"
                >
                  {field}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
