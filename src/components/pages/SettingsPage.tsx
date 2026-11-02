import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { resetSupabaseClient } from '../../services/supabaseService';
import {
  Settings,
  Database,
  BellRing,
  Sliders,
  DollarSign,
  Shield,
  Check,
  Save,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { costSummary } = useApp();

  const [intervalSec, setIntervalSec] = useState('60');
  const [criticalZScore, setCriticalZScore] = useState('3.5');
  const [highZScore, setHighZScore] = useState('2.5');
  const [budgetLimit, setBudgetLimit] = useState(String(costSummary.budgetLimit));
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (supabaseUrl && supabaseKey) {
      resetSupabaseClient(supabaseUrl, supabaseKey);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#263445]">
            Platform Governance & Engine Configuration
          </h2>
          <p className="text-xs text-[#667085]">
            Tune statistical anomaly sensitivity, AWS polling frequency, Supabase endpoints, and alerting thresholds
          </p>
        </div>

        {savedSuccess && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Settings Saved Successfully</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Section 1: Telemetry Scraper Settings */}
        <div className="bg-white rounded-lg border border-[#E0E5EC] p-5 shadow-2xs flex flex-col gap-4">
          <h3 className="text-sm font-bold text-[#263445] pb-2 border-b border-[#E0E5EC] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#3157C8]" />
            Telemetry Scraper & Background Worker Intervals
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-[#667085] block mb-1">
                CloudWatch Metric Polling Interval
              </label>
              <select
                value={intervalSec}
                onChange={(e) => setIntervalSec(e.target.value)}
                className="w-full border border-[#E0E5EC] rounded-md px-3 py-2 bg-white text-[#263445] outline-none"
              >
                <option value="60">60 seconds (Near-realtime / High API volume)</option>
                <option value="300">300 seconds (5 minutes / AWS Free Tier friendly)</option>
                <option value="900">900 seconds (15 minutes / Cost-optimized)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-[#667085] block mb-1">
                Cost Explorer Billing Synchronization
              </label>
              <input
                type="text"
                disabled
                value="Daily at 04:00 UTC (AWS Cost Explorer frequency)"
                className="w-full border border-[#E0E5EC] rounded-md px-3 py-2 bg-slate-50 text-[#667085] outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Statistical Anomaly Detection Thresholds */}
        <div className="bg-white rounded-lg border border-[#E0E5EC] p-5 shadow-2xs flex flex-col gap-4">
          <h3 className="text-sm font-bold text-[#263445] pb-2 border-b border-[#E0E5EC] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#D99A28]" />
            Gaussian Z-Score Statistical Anomaly Thresholds
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-[#667085] block mb-1">
                Critical Severity Z-Score (|Z| ≥)
              </label>
              <input
                type="number"
                step="0.1"
                value={criticalZScore}
                onChange={(e) => setCriticalZScore(e.target.value)}
                className="w-full border border-[#E0E5EC] rounded-md px-3 py-2 font-mono text-[#263445] outline-none"
              />
              <span className="text-[10px] text-[#667085] mt-1 block">
                Standard deviations above baseline (Default: 3.5σ)
              </span>
            </div>

            <div>
              <label className="font-semibold text-[#667085] block mb-1">
                High Severity Z-Score (|Z| ≥)
              </label>
              <input
                type="number"
                step="0.1"
                value={highZScore}
                onChange={(e) => setHighZScore(e.target.value)}
                className="w-full border border-[#E0E5EC] rounded-md px-3 py-2 font-mono text-[#263445] outline-none"
              />
              <span className="text-[10px] text-[#667085] mt-1 block">
                Standard deviations above baseline (Default: 2.5σ)
              </span>
            </div>

            <div>
              <label className="font-semibold text-[#667085] block mb-1">
                Monthly AWS Budget Limit (USD)
              </label>
              <input
                type="number"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(e.target.value)}
                className="w-full border border-[#E0E5EC] rounded-md px-3 py-2 font-mono text-[#263445] outline-none"
              />
              <span className="text-[10px] text-[#667085] mt-1 block">
                Triggers warning at 80% utilization
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Supabase PostgreSQL Persistence */}
        <div className="bg-white rounded-lg border border-[#E0E5EC] p-5 shadow-2xs flex flex-col gap-4">
          <h3 className="text-sm font-bold text-[#263445] pb-2 border-b border-[#E0E5EC] flex items-center gap-2">
            <Database className="w-4 h-4 text-[#168C83]" />
            External Supabase PostgreSQL & Realtime Configuration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-[#667085] block mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://xyzproject.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full border border-[#E0E5EC] rounded-md px-3 py-2 font-mono text-[#263445] outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-[#667085] block mb-1">
                Supabase Public Anon Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                className="w-full border border-[#E0E5EC] rounded-md px-3 py-2 font-mono text-[#263445] outline-none"
              />
            </div>
          </div>
          <p className="text-[11px] text-[#667085]">
            If left blank, CloudWatch Sentinel operates with the built-in high performance in-memory realtime bus.
          </p>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#3157C8] text-white text-xs font-semibold hover:bg-[#2646A8] transition-colors shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
