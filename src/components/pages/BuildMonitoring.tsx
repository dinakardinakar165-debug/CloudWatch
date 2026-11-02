import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { StatCard } from '../common/StatCard';
import {
  Hammer,
  Clock,
  Terminal,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Cpu,
  Layers,
} from 'lucide-react';

export const BuildMonitoring: React.FC = () => {
  const { builds } = useApp();
  const [selectedBuildId, setSelectedBuildId] = useState<string>(builds[0]?.id || '');

  const activeBuild = builds.find((b) => b.id === selectedBuildId) || builds[0];

  const succeededCount = builds.filter((b) => b.lastBuildStatus === 'SUCCEEDED').length;
  const failedCount = builds.filter((b) => b.lastBuildStatus === 'FAILED').length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#263445]">
            AWS CodeBuild Project & Execution Monitoring
          </h2>
          <p className="text-xs text-[#667085]">
            Continuous compilation pipelines, Docker container builds, phase durations, and CloudWatch build logs
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Monitored Build Projects"
          value={builds.length}
          subtitle="Managed container runtimes"
          icon={Hammer}
          accentColor="navy"
        />
        <StatCard
          title="Successful Builds"
          value={succeededCount}
          subtitle="Passed lint, test, and container packaging"
          icon={CheckCircle2}
          accentColor="teal"
        />
        <StatCard
          title="Failed Builds"
          value={failedCount}
          subtitle="Exited with non-zero error status"
          icon={XCircle}
          accentColor={failedCount > 0 ? 'critical' : 'teal'}
        />
      </div>

      {/* Main Split: Projects on Left, Build Phases on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 5 cols Projects List */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-[#E0E5EC] p-4 flex flex-col gap-3 shadow-2xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#263445] pb-2 border-b border-[#E0E5EC]">
            CodeBuild Projects
          </h3>

          <div className="flex flex-col gap-2">
            {builds.map((build) => {
              const isSelected = build.id === selectedBuildId;
              return (
                <div
                  key={build.id}
                  onClick={() => setSelectedBuildId(build.id)}
                  className={`p-3.5 rounded-md border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#3157C8] bg-blue-50/50 shadow-2xs'
                      : 'border-[#E0E5EC] hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-[#263445] truncate">
                      {build.name}
                    </span>
                    <StatusBadge status={build.lastBuildStatus} size="sm" />
                  </div>

                  <p className="text-[11px] text-[#667085] line-clamp-1 mb-2">
                    {build.description || 'AWS CodeBuild Managed Service'}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-[#667085] pt-2 border-t border-slate-200">
                    <span>Build #{build.lastBuildNumber}</span>
                    <span>Duration: {build.durationSeconds}s</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: 7 cols Phases and Log Details */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {activeBuild ? (
            <div className="bg-white rounded-lg border border-[#E0E5EC] p-5 shadow-2xs flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E0E5EC]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#263445]">
                      {activeBuild.name} (Build #{activeBuild.lastBuildNumber})
                    </h3>
                    <StatusBadge status={activeBuild.lastBuildStatus} size="sm" />
                  </div>
                  <div className="text-xs text-[#667085] font-mono mt-0.5">
                    Compute: {activeBuild.environment.computeType} · Image: {activeBuild.environment.image}
                  </div>
                </div>

                {activeBuild.buildLogsUrl && (
                  <a
                    href={activeBuild.buildLogsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold text-[#3157C8] hover:underline"
                  >
                    <span>View CloudWatch Logs</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Build Phases Timeline */}
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#263445]">
                  Execution Phases Breakdown
                </h4>

                <div className="flex flex-col gap-1.5">
                  {activeBuild.phases.map((ph, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded bg-[#F4F6F9] border border-[#E0E5EC] text-xs font-mono"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            ph.phaseStatus === 'SUCCEEDED'
                              ? 'bg-emerald-500'
                              : 'bg-rose-600'
                          }`}
                        />
                        <span className="font-semibold text-[#263445]">
                          {ph.phaseType}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#667085]">{ph.durationSeconds}s</span>
                        <StatusBadge status={ph.phaseStatus} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Failure Error Display if Failed */}
              {activeBuild.lastBuildStatus === 'FAILED' && (activeBuild.failureReason || activeBuild.sanitizedSummary) && (
                <div className="p-4 rounded-md bg-rose-50 border border-rose-200 text-xs flex flex-col gap-2">
                  <div className="font-bold text-rose-900 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    Sanitised Build Failure Diagnostic ({activeBuild.failureCategory || 'ERROR'})
                  </div>
                  <pre className="font-mono text-[11px] text-rose-950 bg-white p-2.5 rounded border border-rose-200 whitespace-pre-wrap">
                    {activeBuild.failureReason || activeBuild.sanitizedSummary}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-[#E0E5EC] p-8 text-center text-sm text-[#667085]">
              Select a project on the left to inspect phases.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
