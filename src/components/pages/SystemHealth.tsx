import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import {
  HeartPulse,
  Database,
  Radio,
  Server,
  RefreshCw,
  Clock,
  Activity,
  CheckCircle2,
  Terminal,
} from 'lucide-react';

export const SystemHealth: React.FC = () => {
  const { workerStatus, triggerManualRefresh, isRefreshing } = useApp();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#263445]">
            Platform Infrastructure & Telemetry Collector Health
          </h2>
          <p className="text-xs text-[#667085]">
            Telemetry scraping workers, Supabase PostgreSQL persistence, and Realtime WebSocket event pipelines
          </p>
        </div>

        <button
          onClick={triggerManualRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#3157C8] text-white text-xs font-semibold hover:bg-[#2646A8] transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Execute Scrape Cycle</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Telemetry Collector"
          value={workerStatus.status}
          subtitle="Cron scheduled interval: 60s"
          icon={HeartPulse}
          accentColor="teal"
        />
        <StatCard
          title="Successful Cycles"
          value={workerStatus.successCount}
          subtitle={`${workerStatus.failureCount} failed retries`}
          icon={CheckCircle2}
          accentColor="teal"
        />
        <StatCard
          title="Supabase Database"
          value={workerStatus.databaseConnected ? 'CONNECTED' : 'DISCONNECTED'}
          subtitle="PostgreSQL Connection Pool"
          icon={Database}
          accentColor="blue"
        />
        <StatCard
          title="EventBridge Pipeline"
          value={`${workerStatus.apiLatencyMs} ms`}
          subtitle="Realtime WebSocket latency"
          icon={Radio}
          accentColor="navy"
        />
      </div>

      {/* Collector Workers Queue */}
      <div className="bg-white rounded-lg border border-[#E0E5EC] p-5 shadow-2xs flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E0E5EC]">
          <div>
            <h3 className="text-sm font-bold text-[#263445]">
              Active Background Monitoring Workers
            </h3>
            <p className="text-xs text-[#667085]">
              Distributed background services running on Render Web Service & Worker container
            </p>
          </div>
          <span className="font-mono text-xs text-[#667085]">
            Last heartbeat:{' '}
            {new Date(workerStatus.lastRunAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {workerStatus.activeJobs.map((job, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-md bg-[#F4F6F9] border border-[#E0E5EC] text-xs font-mono"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-[#263445]">{job}</span>
              </div>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                HEALTHY
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Production Architecture Topology */}
      <div className="bg-white rounded-lg border border-[#E0E5EC] p-5 shadow-2xs flex flex-col gap-3">
        <h3 className="text-sm font-bold text-[#263445]">
          Telemetry Flow & Event Ingestion Topology
        </h3>
        <div className="bg-[#14243A] text-slate-200 p-4 rounded-md font-mono text-xs overflow-x-auto leading-relaxed border border-slate-700">
{`AWS CloudWatch / Cost Explorer / CodePipeline / EventBridge
        │ (HTTPS API polling & EventBridge Rule Webhook)
        ▼
Render FastAPI Worker (boto3 client & Z-Score anomaly engine)
        │
        ▼
Supabase PostgreSQL (16 tables with RLS and foreign-key indexes)
        │
        ▼ (Supabase Realtime WebSockets)
React Frontend Dashboard (Port 3000 / Vite SPA)`}
        </div>
      </div>
    </div>
  );
};
