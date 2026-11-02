import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { StatCard } from '../common/StatCard';
import {
  GitBranch,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  ArrowRight,
  ExternalLink,
  GitCommit,
} from 'lucide-react';

export const PipelineMonitoring: React.FC = () => {
  const { pipelines, setSelectedPipelineId, setCurrentPage, selectedRegion } = useApp();
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filtered = pipelines.filter((pipe) => {
    const matchesFilter = filter === 'ALL' || pipe.status === filter;
    const matchesSearch = pipe.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const total = pipelines.length;
  const succeeded = pipelines.filter((p) => p.status === 'Succeeded').length;
  const failed = pipelines.filter((p) => p.status === 'Failed').length;
  const inProgress = pipelines.filter((p) => p.status === 'InProgress').length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#263445]">
            AWS CodePipeline Observability Center
          </h2>
          <p className="text-xs text-[#667085]">
            Distributed CI/CD release orchestrations, stage transitions, and execution telemetry in {selectedRegion}
          </p>
        </div>

        <button
          onClick={() => setCurrentPage('pipeline_details')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-[#E0E5EC] text-xs font-semibold text-[#263445] hover:bg-slate-50 transition-colors"
        >
          <span>Inspect Pipeline Stages</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#3157C8]" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monitored Pipelines"
          value={total}
          subtitle="AWS CodePipeline V2"
          icon={GitBranch}
          accentColor="navy"
        />
        <StatCard
          title="Succeeded Executions"
          value={succeeded}
          subtitle="Passed all verification gates"
          icon={CheckCircle2}
          accentColor="teal"
        />
        <StatCard
          title="Failed Executions"
          value={failed}
          subtitle="Stage or action breaches"
          icon={XCircle}
          accentColor={failed > 0 ? 'critical' : 'teal'}
        />
        <StatCard
          title="In Progress"
          value={inProgress}
          subtitle="Actively building / deploying"
          icon={Clock}
          accentColor="blue"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-lg border border-[#E0E5EC] p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#667085]" />
          <input
            type="text"
            placeholder="Search pipelines by name or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs outline-none text-[#263445]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-[#667085]">Execution Status:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-[#E0E5EC] rounded px-3 py-1 bg-white text-[#263445] outline-none"
          >
            <option value="ALL">All States ({pipelines.length})</option>
            <option value="Succeeded">Succeeded</option>
            <option value="Failed">Failed</option>
            <option value="InProgress">InProgress</option>
            <option value="Stopped">Stopped</option>
          </select>
        </div>
      </div>

      {/* Pipelines List */}
      <div className="flex flex-col gap-4">
        {filtered.map((pipe) => {
          const failedStage = pipe.stages.find((s) => s.status === 'Failed');
          return (
            <div
              key={pipe.id}
              className="bg-white rounded-lg border border-[#E0E5EC] p-5 shadow-2xs flex flex-col gap-4 hover:border-slate-300 transition-all"
            >
              {/* Pipeline Header */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-[#F4F6F9] text-[#14243A]">
                    <GitBranch className="w-5 h-5 text-[#3157C8]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-[#263445]">{pipe.name}</h3>
                      <StatusBadge status={pipe.status} size="sm" />
                    </div>
                    <div className="text-xs text-[#667085] font-mono mt-0.5 flex items-center gap-2">
                      <span>Execution ID: {pipe.lastExecutionId?.slice(0, 18)}...</span>
                      <span>·</span>
                      <span>Region: {pipe.region}</span>
                      <span>·</span>
                      <span>Duration: {pipe.durationSeconds || 0}s</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedPipelineId(pipe.id);
                      setCurrentPage('pipeline_details');
                    }}
                    className="px-3 py-1.5 rounded-md bg-[#3157C8] text-white text-xs font-semibold hover:bg-[#2646A8] transition-colors flex items-center gap-1.5"
                  >
                    <span>Inspect Stages</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Stage Visual Progression Workflow */}
              <div className="bg-[#F4F6F9] rounded-lg p-3.5 flex flex-wrap items-center gap-2">
                {pipe.stages.map((stage, idx) => (
                  <React.Fragment key={idx}>
                    <div
                      className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium flex items-center gap-1.5 border transition-all ${
                        stage.status === 'Succeeded'
                          ? 'bg-white border-emerald-300 text-emerald-800 shadow-2xs'
                          : stage.status === 'Failed'
                          ? 'bg-rose-50 border-rose-300 text-rose-800 font-bold shadow-2xs ring-2 ring-rose-200'
                          : stage.status === 'InProgress'
                          ? 'bg-blue-50 border-blue-300 text-blue-800 animate-pulse'
                          : 'bg-slate-100 border-slate-200 text-slate-400'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          stage.status === 'Succeeded'
                            ? 'bg-emerald-500'
                            : stage.status === 'Failed'
                            ? 'bg-rose-600'
                            : stage.status === 'InProgress'
                            ? 'bg-blue-500'
                            : 'bg-slate-400'
                        }`}
                      />
                      <span>{stage.name}</span>
                      {stage.durationSeconds && (
                        <span className="text-[10px] text-slate-500">
                          ({stage.durationSeconds}s)
                        </span>
                      )}
                    </div>
                    {idx < pipe.stages.length - 1 && (
                      <span className="text-slate-400 text-xs font-bold">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Failure Context Alert if Failed */}
              {failedStage && (failedStage.sanitizedErrorMessage || failedStage.errorMessage) && (
                <div className="bg-rose-50 border border-rose-200 rounded-md p-3 text-xs flex items-start gap-2 text-rose-900">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold">
                      Failed at stage "{failedStage.name}" (Action: {failedStage.failedAction || 'Unknown'}):
                    </span>
                    <span className="font-mono text-[11px] text-rose-800">
                      {failedStage.sanitizedErrorMessage || failedStage.errorMessage}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
