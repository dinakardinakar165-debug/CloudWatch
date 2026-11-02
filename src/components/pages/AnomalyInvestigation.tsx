import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { StatCard } from '../common/StatCard';
import {
  AlertOctagon,
  Calculator,
  Activity,
  CheckCircle2,
  Filter,
  Info,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const AnomalyInvestigation: React.FC = () => {
  const { anomalies, updateAnomalyStatus } = useApp();

  const activeCount = anomalies.filter((a) => a.status === 'ACTIVE').length;
  const acknowledgedCount = anomalies.filter((a) => a.status === 'ACKNOWLEDGED').length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#263445]">
            Statistical Anomaly Detection Engine
          </h2>
          <p className="text-xs text-[#667085]">
            Z-score Gaussian deviation analysis across infrastructure metrics, daily billing, and pipeline execution durations
          </p>
        </div>
      </div>

      {/* Formula & Engine Definition Card */}
      <div className="bg-[#14243A] text-white rounded-lg p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-[#3157C8] text-white">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider">
              Mathematical Detection Model
            </div>
            <div className="text-base font-bold font-mono mt-0.5">
              Z = (x - μ) / σ
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Evaluates current telemetry <code className="text-cyan-200">x</code> against rolling historical mean <code className="text-cyan-200">μ</code> and sample standard deviation <code className="text-cyan-200">σ</code>. Deviations with |Z| ≥ 1.8σ trigger anomaly flags.
            </p>
          </div>
        </div>

        <div className="bg-white/10 rounded p-3 text-xs font-mono flex flex-col gap-1 border border-white/10">
          <div>• Critical Threshold: |Z| ≥ 3.5σ</div>
          <div>• High Threshold: |Z| ≥ 2.5σ</div>
          <div>• Zero-Variance Protection: ε = 0.0001</div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Active Anomalies"
          value={activeCount}
          subtitle="Currently deviating from baseline"
          icon={AlertOctagon}
          accentColor={activeCount > 0 ? 'critical' : 'teal'}
        />
        <StatCard
          title="Acknowledged Deviations"
          value={acknowledgedCount}
          subtitle="Under active triage by engineers"
          icon={Activity}
          accentColor="warning"
        />
        <StatCard
          title="Baseline Confidence"
          value="High (N ≥ 30)"
          subtitle="Meets minimum statistical sample requirements"
          icon={CheckCircle2}
          accentColor="teal"
        />
      </div>

      {/* Anomalies List */}
      <div className="flex flex-col gap-4">
        {anomalies.map((anom) => {
          const isCritical = anom.severity === 'CRITICAL';
          return (
            <div
              key={anom.id}
              className={`bg-white rounded-lg border p-5 shadow-2xs flex flex-col gap-4 transition-all ${
                isCritical
                  ? 'border-rose-300 ring-2 ring-rose-50'
                  : 'border-[#E0E5EC]'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-md ${
                      isCritical
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    <AlertOctagon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-[#263445]">
                        {anom.title}
                      </h3>
                      <StatusBadge status={anom.severity} size="sm" />
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-[#14243A] border border-slate-200">
                        Z = {anom.zScore > 0 ? '+' : ''}{anom.zScore.toFixed(2)}σ
                      </span>
                    </div>
                    <div className="text-xs text-[#667085] font-mono mt-0.5">
                      Target: {anom.targetResourceOrPipeline} · Detected:{' '}
                      {new Date(anom.detectedAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {anom.status === 'ACTIVE' && (
                    <button
                      onClick={() => updateAnomalyStatus(anom.id, 'ACKNOWLEDGED')}
                      className="px-2.5 py-1 text-xs rounded border border-[#E0E5EC] bg-white hover:bg-slate-50 font-medium text-[#263445] transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                  {anom.status !== 'RESOLVED' && (
                    <button
                      onClick={() => updateAnomalyStatus(anom.id, 'RESOLVED')}
                      className="px-2.5 py-1 text-xs rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
                    >
                      Mark Resolved
                    </button>
                  )}
                  {anom.status === 'RESOLVED' && (
                    <StatusBadge status="RESOLVED" size="sm" />
                  )}
                </div>
              </div>

              {/* Statistical Evidence Breakdown */}
              <div className="bg-[#F4F6F9] rounded-md p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div>
                  <span className="text-[#667085] block text-[10px] uppercase">
                    Observed Metric Value (x)
                  </span>
                  <span className="font-bold text-sm text-[#C43232]">
                    {anom.observedValue} {anom.unit}
                  </span>
                </div>
                <div>
                  <span className="text-[#667085] block text-[10px] uppercase">
                    Historical Baseline Mean (μ)
                  </span>
                  <span className="font-semibold text-sm text-[#263445]">
                    {anom.baselineMean} {anom.unit}
                  </span>
                </div>
                <div>
                  <span className="text-[#667085] block text-[10px] uppercase">
                    Sample Standard Dev (σ)
                  </span>
                  <span className="font-semibold text-sm text-[#263445]">
                    ±{anom.baselineStdDev} {anom.unit}
                  </span>
                </div>
                <div>
                  <span className="text-[#667085] block text-[10px] uppercase">
                    Baseline Window Samples
                  </span>
                  <span className="font-semibold text-sm text-[#263445]">
                    {anom.historicalWindowPoints} observations
                  </span>
                </div>
              </div>

              {/* Statistical Explanation */}
              <p className="text-xs text-[#263445] leading-relaxed">
                {anom.explanation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
