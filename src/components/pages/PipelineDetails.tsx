import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  GitBranch,
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  ExternalLink,
  Terminal,
  FileCode2,
  Calendar,
  Layers,
} from 'lucide-react';

export const PipelineDetails: React.FC = () => {
  const { pipelines, selectedPipelineId, setSelectedPipelineId, setCurrentPage, account } = useApp();

  const pipeline =
    pipelines.find((p) => p.id === selectedPipelineId) || pipelines[0];

  if (!pipeline) {
    return (
      <div className="bg-white rounded-lg border border-[#E0E5EC] p-8 text-center text-sm text-[#667085]">
        Pipeline not found.{' '}
        <button
          onClick={() => setCurrentPage('pipeline_monitoring')}
          className="text-[#3157C8] underline font-semibold"
        >
          Return to pipeline list
        </button>
      </div>
    );
  }

  const failedStage = pipeline.stages.find((s) => s.status === 'Failed');

  // AWS Console deep link
  const consoleUrl = `https://${pipeline.region}.console.aws.amazon.com/codesuite/codepipeline/pipelines/${pipeline.name}/view?region=${pipeline.region}`;

  return (
    <div className="flex flex-col gap-6">
      {/* Back button and Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage('pipeline_monitoring')}
            className="p-2 rounded-md bg-white border border-[#E0E5EC] hover:bg-slate-50 transition-colors text-[#263445]"
            title="Back to all pipelines"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#263445]">{pipeline.name}</h2>
              <StatusBadge status={pipeline.status} size="sm" />
            </div>
            <p className="text-xs text-[#667085] font-mono mt-0.5">
              Region: {pipeline.region} · Latest Execution: {pipeline.lastExecutionId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Pipeline Switcher */}
          <select
            value={pipeline.id}
            onChange={(e) => setSelectedPipelineId(e.target.value)}
            className="text-xs font-mono border border-[#E0E5EC] rounded-md px-3 py-1.5 bg-white text-[#263445] outline-none"
          >
            {pipelines.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <a
            href={consoleUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#3157C8] text-white text-xs font-semibold hover:bg-[#2646A8] transition-colors"
          >
            <span>Open in AWS Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Execution Summary Bar */}
      <div className="bg-white rounded-lg border border-[#E0E5EC] p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 shadow-2xs text-xs">
        <div>
          <span className="text-[#667085] block font-mono text-[10px] uppercase">
            Total Execution Duration
          </span>
          <span className="font-mono font-bold text-sm text-[#263445]">
            {pipeline.durationSeconds || 0} seconds
          </span>
        </div>
        <div>
          <span className="text-[#667085] block font-mono text-[10px] uppercase">
            Execution Timestamp
          </span>
          <span className="font-mono font-semibold text-[#263445]">
            {pipeline.lastExecutionTime
              ? new Date(pipeline.lastExecutionTime).toLocaleString()
              : '—'}
          </span>
        </div>
        <div>
          <span className="text-[#667085] block font-mono text-[10px] uppercase">
            Stages Configured
          </span>
          <span className="font-mono font-semibold text-[#263445]">
            {pipeline.stages.length} Stages (Source → Deploy)
          </span>
        </div>
        <div>
          <span className="text-[#667085] block font-mono text-[10px] uppercase">
            Execution Status
          </span>
          <span
            className={`font-mono font-bold ${
              pipeline.status === 'Succeeded'
                ? 'text-emerald-700'
                : pipeline.status === 'Failed'
                ? 'text-rose-700'
                : 'text-blue-700'
            }`}
          >
            {pipeline.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Stages In Order (Sequential Execution Pipeline) */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#263445]">
          Stage Execution Pipeline & Action Telemetry
        </h3>

        <div className="flex flex-col gap-4">
          {pipeline.stages.map((stage, sIdx) => {
            const isFailed = stage.status === 'Failed';
            const isSucceeded = stage.status === 'Succeeded';
            const isInProgress = stage.status === 'InProgress';

            return (
              <div
                key={sIdx}
                className={`bg-white rounded-lg border p-5 transition-all shadow-2xs ${
                  isFailed
                    ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/10'
                    : isSucceeded
                    ? 'border-[#E0E5EC]'
                    : isInProgress
                    ? 'border-blue-300 bg-blue-50/20'
                    : 'border-slate-200 opacity-60'
                }`}
              >
                {/* Stage Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E0E5EC]">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                        isSucceeded
                          ? 'bg-emerald-600 text-white'
                          : isFailed
                          ? 'bg-rose-600 text-white'
                          : isInProgress
                          ? 'bg-blue-600 text-white animate-pulse'
                          : 'bg-slate-300 text-slate-700'
                      }`}
                    >
                      {sIdx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#263445]">
                        {stage.name}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {stage.durationSeconds && (
                      <span className="text-xs font-mono text-[#667085] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {stage.durationSeconds}s
                      </span>
                    )}
                    <StatusBadge status={stage.status} size="sm" />
                  </div>
                </div>

                {/* Stage Actions */}
                <div className="mt-4 flex flex-col gap-3">
                  <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider">
                    Stage Actions & Providers
                  </span>

                  {stage.actions.map((act, aIdx) => (
                    <div
                      key={aIdx}
                      className="p-3 rounded-md bg-[#F4F6F9] border border-[#E0E5EC] flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileCode2 className="w-4 h-4 text-[#3157C8]" />
                          <span className="text-xs font-bold text-[#263445]">
                            {act.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-[#667085] border border-slate-200">
                            {act.actionTypeId.category} · {act.actionTypeId.provider}
                          </span>
                        </div>
                        <StatusBadge status={act.status} size="sm" />
                      </div>

                      {act.summary && (
                        <div className="text-xs text-[#263445] font-mono bg-white p-2 rounded border border-slate-200">
                          {act.summary}
                        </div>
                      )}

                      {act.externalExecutionUrl && (
                        <div className="text-right">
                          <a
                            href={act.externalExecutionUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3157C8] hover:underline"
                          >
                            <span>Inspect CloudBuild Logs</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Failure Details & Guidance */}
                {isFailed && (stage.sanitizedErrorMessage || stage.errorMessage) && (
                  <div className="mt-4 p-4 rounded-md bg-rose-50 border border-rose-200 text-xs flex flex-col gap-2 text-rose-950">
                    <div className="flex items-center gap-1.5 font-bold text-rose-900">
                      <AlertOctagon className="w-4 h-4 text-rose-600" />
                      Failure Diagnosis & Sanitised Payload
                    </div>
                    <pre className="font-mono text-[11px] bg-white p-2.5 rounded border border-rose-200 text-rose-900 overflow-x-auto whitespace-pre-wrap">
                      {stage.sanitizedErrorMessage || stage.errorMessage}
                    </pre>
                    <div className="text-[11px] text-slate-700 bg-white/70 p-2 rounded">
                      <strong>Suggested Next Action:</strong> Verify SSM parameter store credentials for external payment webhooks in local VPC, check network security group egress rules in CodeBuild VPC configuration, and re-trigger execution.
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
