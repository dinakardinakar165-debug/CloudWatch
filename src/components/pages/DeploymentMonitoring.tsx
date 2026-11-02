import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { StatCard } from '../common/StatCard';
import {
  Rocket,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ShieldCheck,
  Server,
} from 'lucide-react';

export const DeploymentMonitoring: React.FC = () => {
  const { deployments } = useApp();

  const succeededCount = deployments.filter((d) => d.status === 'Succeeded').length;
  const failedCount = deployments.filter((d) => d.status === 'Failed').length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#263445]">
            AWS CodeDeploy Release & Fleet Orchestration
          </h2>
          <p className="text-xs text-[#667085]">
            Monitoring blue/green deployments, traffic shifting, rollback events, and ECS/EC2 target health
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Monitored Deployments"
          value={deployments.length}
          subtitle="AWS CodeDeploy Groups"
          icon={Rocket}
          accentColor="navy"
        />
        <StatCard
          title="Successful Deployments"
          value={succeededCount}
          subtitle="Passed traffic canary health tests"
          icon={CheckCircle2}
          accentColor="teal"
        />
        <StatCard
          title="Failed / Rolled Back"
          value={failedCount}
          subtitle="Automatic rollback triggered"
          icon={XCircle}
          accentColor={failedCount > 0 ? 'critical' : 'teal'}
        />
      </div>

      {/* Deployments List */}
      <div className="flex flex-col gap-4">
        {deployments.map((dep) => (
          <div
            key={dep.id}
            className="bg-white rounded-lg border border-[#E0E5EC] p-5 shadow-2xs flex flex-col gap-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-[#F4F6F9] text-[#14243A]">
                  <Rocket className="w-5 h-5 text-[#3157C8]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[#263445]">
                      {dep.applicationName}
                    </h3>
                    <StatusBadge status={dep.status} size="sm" />
                  </div>
                  <div className="text-xs text-[#667085] font-mono mt-0.5">
                    Deployment Group: {dep.deploymentGroupName} · ID: {dep.id}
                  </div>
                </div>
              </div>

              <div className="text-xs font-mono text-[#667085]">
                Duration: {dep.durationSeconds || 0}s
              </div>
            </div>

            {/* Target Fleet Overview */}
            {dep.deploymentOverview && (
              <div className="bg-[#F4F6F9] rounded-md p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[#667085] block font-mono text-[10px]">
                    Succeeded Targets
                  </span>
                  <span className="font-mono font-bold text-emerald-700">
                    {dep.deploymentOverview.succeeded} tasks
                  </span>
                </div>
                <div>
                  <span className="text-[#667085] block font-mono text-[10px]">
                    Failed Targets
                  </span>
                  <span className="font-mono font-bold text-rose-700">
                    {dep.deploymentOverview.failed} tasks
                  </span>
                </div>
                <div>
                  <span className="text-[#667085] block font-mono text-[10px]">
                    In Progress
                  </span>
                  <span className="font-mono font-bold text-blue-700">
                    {dep.deploymentOverview.inProgress} tasks
                  </span>
                </div>
                <div>
                  <span className="text-[#667085] block font-mono text-[10px]">
                    Rollback State
                  </span>
                  <span className="font-mono font-bold text-[#263445]">
                    {dep.rollbackInfo?.rollbackStatus || 'NONE'}
                  </span>
                </div>
              </div>
            )}

            {dep.failureMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-900 font-mono">
                <strong>Failure Diagnostic:</strong> {dep.failureMessage}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
