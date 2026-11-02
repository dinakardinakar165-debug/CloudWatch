import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { SimpleLineChart } from '../common/SimpleLineChart';
import { SimpleBarChart } from '../common/SimpleBarChart';
import { StatusBadge } from '../common/StatusBadge';
import { generateDemoMetricSeries } from '../../data/mockEnterpriseData';
import {
  Server,
  DollarSign,
  GitBranch,
  AlertOctagon,
  BellRing,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
} from 'lucide-react';

export const OverviewDashboard: React.FC = () => {
  const {
    resources,
    costSummary,
    pipelines,
    anomalies,
    alerts,
    account,
    operatingMode,
    dataSource,
    setCurrentPage,
    setSelectedPipelineId,
  } = useApp();

  const healthyResources = resources.filter((r) => r.healthStatus === 'HEALTHY').length;
  const warningResources = resources.filter((r) => r.healthStatus === 'WARNING').length;
  const criticalResources = resources.filter((r) => r.healthStatus === 'CRITICAL').length;

  const totalPipelines = pipelines.length;
  const succeededPipelines = pipelines.filter((p) => p.status === 'Succeeded').length;
  const failedPipelines = pipelines.filter((p) => p.status === 'Failed').length;
  const pipelineSuccessRate = totalPipelines > 0 ? ((succeededPipelines / totalPipelines) * 100).toFixed(0) : '0';

  const openAlerts = alerts.filter((a) => a.status === 'OPEN');
  const activeAnomalies = anomalies.filter((a) => a.status === 'ACTIVE');

  const cpuData = generateDemoMetricSeries(24).map((d) => ({
    timeLabel: d.timeLabel,
    value: d.cpuUtilization,
  }));

  const costBreakdown = costSummary.topServices.slice(0, 5).map((s) => ({
    label: s.service,
    value: s.amount,
    subValue: `${s.percentage}%`,
  }));

  return (
    <div className="flex flex-col gap-6">
      {/* Mode Banner */}
      {operatingMode === 'MODE_C_DEMO' ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>[MODE C: OFFLINE DEMONSTRATION ACTIVE]</strong> Observing deterministic simulated AWS telemetry, cost explorer records, and CI/CD pipelines. No AWS credentials or network access required.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage('collector_management')}
              className="px-2.5 py-1 rounded bg-[#3157C8] hover:bg-[#2544A8] text-white font-semibold text-[11px] transition-colors"
            >
              Mode B: Local Collector
            </button>
            <button
              onClick={() => setCurrentPage('aws_connections')}
              className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] transition-colors"
            >
              Mode A: Cross-Account IAM
            </button>
          </div>
        </div>
      ) : operatingMode === 'MODE_B_LOCAL_COLLECTOR' ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-blue-900">
            <ShieldCheck className="w-4 h-4 text-[#3157C8] shrink-0" />
            <span>
              <strong>[MODE B: CUSTOMER-CONTROLLED LOCAL COLLECTOR ACTIVE]</strong> Telemetry is sanitized in-VPC by your local daemon before delivery to Sentinel. Zero AWS credentials shared.
            </span>
          </div>
          <button
            onClick={() => setCurrentPage('collector_management')}
            className="px-2.5 py-1 rounded bg-[#3157C8] text-white font-semibold text-[11px]"
          >
            Manage Collectors
          </button>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>[MODE A: CUSTOMER-AUTHORISED CROSS-ACCOUNT IAM ACTIVE]</strong> Temporary read-only credentials assumed via STS AssumeRole with External ID.
            </span>
          </div>
          <button
            onClick={() => setCurrentPage('aws_connections')}
            className="px-2.5 py-1 rounded bg-emerald-700 text-white font-semibold text-[11px]"
          >
            Role Status
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Monitored Resources"
          value={resources.length}
          subtitle={`${healthyResources} healthy · ${criticalResources} critical`}
          icon={Server}
          accentColor="navy"
        />
        <StatCard
          title="Month-To-Date Cost"
          value={`$${costSummary.mtdCost.toLocaleString()}`}
          subtitle={`Budget: $${costSummary.budgetLimit.toLocaleString()} (${costSummary.budgetUtilizedPercent}%)`}
          icon={DollarSign}
          trend={{ value: 8.4, isPositiveGood: false }}
          accentColor="teal"
        />
        <StatCard
          title="CI/CD Pipelines"
          value={totalPipelines}
          subtitle={`${succeededPipelines} success · ${failedPipelines} failed`}
          icon={GitBranch}
          accentColor="blue"
        />
        <StatCard
          title="Pipeline Success Rate"
          value={`${pipelineSuccessRate}%`}
          subtitle="Rolling 7-day average"
          icon={CheckCircle2}
          trend={{ value: -12.5, isPositiveGood: true }}
          accentColor={Number(pipelineSuccessRate) > 75 ? 'blue' : 'warning'}
        />
        <StatCard
          title="Z-Score Anomalies"
          value={activeAnomalies.length}
          subtitle="Deviations > 1.8σ detected"
          icon={AlertOctagon}
          accentColor={activeAnomalies.length > 0 ? 'critical' : 'teal'}
        />
        <StatCard
          title="Open Incidents"
          value={openAlerts.length}
          subtitle={`${alerts.filter((a) => a.severity === 'CRITICAL' && a.status === 'OPEN').length} critical alarms`}
          icon={BellRing}
          accentColor={openAlerts.length > 0 ? 'critical' : 'teal'}
        />
      </div>

      {/* Charts Section: CloudWatch CPU + Cost Explorer Service Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#263445] flex items-center gap-2">
              <Server className="w-4 h-4 text-[#3157C8]" /> Cluster Average CPUUtilization (%)
            </span>
            <button
              onClick={() => setCurrentPage('infrastructure')}
              className="text-xs text-[#3157C8] hover:underline flex items-center gap-1 font-medium"
            >
              Metric Explorer <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <SimpleLineChart
            data={cpuData}
            unit="%"
            thresholdValue={80.0}
            thresholdLabel="CloudWatch High CPU Alarm"
            lineColor="#3157C8"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#263445] flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#168C83]" /> AWS Cost Explorer — Top Services (MTD)
            </span>
            <button
              onClick={() => setCurrentPage('cost_analytics')}
              className="text-xs text-[#3157C8] hover:underline flex items-center gap-1 font-medium"
            >
              Cost Intelligence <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <SimpleBarChart
            data={costBreakdown}
            unit="$"
          />
        </div>
      </div>

      {/* Split Rows: CI/CD Pipeline Activity & Active Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left 2 cols: Recent CI/CD Pipelines */}
        <div className="xl:col-span-2 bg-white rounded-lg border border-[#E0E5EC] p-5 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#263445]">
                  AWS CI/CD Pipeline Activity
                </h3>
                <p className="text-xs text-[#667085]">
                  Real-time status of AWS CodePipeline executions across stages
                </p>
              </div>
              <button
                onClick={() => setCurrentPage('pipeline_monitoring')}
                className="text-xs font-semibold text-[#3157C8] hover:underline flex items-center gap-1"
              >
                View All Pipelines <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E0E5EC] text-[#667085] uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Pipeline Name</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Duration</th>
                    <th className="pb-3 font-semibold">Stages</th>
                    <th className="pb-3 font-semibold">Last Execution</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E5EC]">
                  {pipelines.map((pipe) => (
                    <tr key={pipe.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-medium text-[#263445]">
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs">{pipe.name}</span>
                          <span className="text-[10px] text-[#667085] font-mono">
                            {pipe.region}
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        <StatusBadge status={pipe.status} size="sm" />
                      </td>
                      <td className="py-3 font-mono text-[#263445]">
                        {pipe.durationSeconds ? `${pipe.durationSeconds}s` : '—'}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          {pipe.stages.map((stg, sIdx) => (
                            <span
                              key={sIdx}
                              title={`${stg.name}: ${stg.status}`}
                              className={`w-2.5 h-2.5 rounded-full ${
                                stg.status === 'Succeeded'
                                  ? 'bg-emerald-500'
                                  : stg.status === 'Failed'
                                  ? 'bg-rose-500 ring-2 ring-rose-200'
                                  : stg.status === 'InProgress'
                                  ? 'bg-blue-500 animate-pulse'
                                  : 'bg-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="py-3 text-[#667085] font-mono text-[11px]">
                        {pipe.lastExecutionTime
                          ? new Date(pipe.lastExecutionTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedPipelineId(pipe.id);
                            setCurrentPage('pipeline_details');
                          }}
                          className="px-2 py-1 rounded bg-[#F4F6F9] hover:bg-blue-50 hover:text-[#3157C8] text-[#263445] font-semibold text-[11px] transition-colors"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 col: Active Alarms & Incidents */}
        <div className="bg-white rounded-lg border border-[#E0E5EC] p-5 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#263445]">
                  Active Alarms & Incidents
                </h3>
                <p className="text-xs text-[#667085]">
                  Requiring engineering triage
                </p>
              </div>
              <button
                onClick={() => setCurrentPage('alerts')}
                className="text-xs font-semibold text-[#3157C8] hover:underline"
              >
                Alerts Center
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {openAlerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 rounded-md border border-[#E0E5EC] bg-[#F4F6F9] flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <StatusBadge status={alert.severity} size="sm" />
                    <span className="text-[10px] text-[#667085] font-mono">
                      {new Date(alert.detectedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-[#263445] line-clamp-1">
                    {alert.description}
                  </div>
                  <div className="text-[11px] text-[#667085] font-mono truncate">
                    {alert.resourceOrPipelineId}
                  </div>
                </div>
              ))}

              {openAlerts.length === 0 && (
                <div className="py-8 text-center text-xs text-[#667085]">
                  No open alarms detected. All services operational.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E0E5EC] flex items-center justify-between text-xs text-[#667085]">
            <span>Anomaly Engine: Active</span>
            <button
              onClick={() => setCurrentPage('anomaly_detection')}
              className="font-semibold text-[#3157C8] hover:underline"
            >
              Review {activeAnomalies.length} Anomalies →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
