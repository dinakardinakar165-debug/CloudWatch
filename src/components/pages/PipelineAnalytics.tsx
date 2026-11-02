import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { SimpleBarChart } from '../common/SimpleBarChart';
import { SimpleLineChart } from '../common/SimpleLineChart';
import {
  BarChart2,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  Layers,
} from 'lucide-react';

export const PipelineAnalytics: React.FC = () => {
  const { pipelines } = useApp();

  const total = pipelines.length;
  const succeeded = pipelines.filter((p) => p.status === 'Succeeded').length;
  const failed = pipelines.filter((p) => p.status === 'Failed').length;
  const inProgress = pipelines.filter((p) => p.status === 'InProgress').length;
  const successRate = total > 0 ? ((succeeded / total) * 100).toFixed(1) : '0';

  const durations = pipelines
    .filter((p) => p.durationSeconds !== undefined && p.durationSeconds > 0)
    .map((p) => p.durationSeconds as number);
  const avgDuration =
    durations.length > 0
      ? (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(0)
      : '0';

  // Failure distribution by stage
  const stageFailureDistribution = [
    { label: 'Test_Integration Stage', value: 14, color: '#C43232', subValue: '48%' },
    { label: 'CodeBuild Compilation Stage', value: 8, color: '#D99A28', subValue: '28%' },
    { label: 'Deploy Target Health Gate', value: 5, color: '#3157C8', subValue: '17%' },
    { label: 'Source Webhook Handshake', value: 2, color: '#14243A', subValue: '7%' },
  ];

  // Pipeline execution duration comparison
  const durationComparison = pipelines.map((p) => ({
    label: p.name,
    value: p.durationSeconds || 0,
    subValue: `${p.durationSeconds || 0}s`,
    color: p.status === 'Failed' ? '#C43232' : '#3157C8',
  }));

  // Trend data for build durations
  const durationTrend = [
    { timeLabel: 'Exec #180', value: 142 },
    { timeLabel: 'Exec #182', value: 148 },
    { timeLabel: 'Exec #184', value: 155 },
    { timeLabel: 'Exec #186', value: 160 },
    { timeLabel: 'Exec #188', value: 175 },
    { timeLabel: 'Exec #189', value: 232 }, // Anomaly spike
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#263445]">
            CI/CD Pipeline Analytics & Reliability Metrics
          </h2>
          <p className="text-xs text-[#667085]">
            Quantitative assessment of release velocity, MTTR, and stage failure distributions
          </p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Success Rate"
          value={`${successRate}%`}
          subtitle="All AWS CodePipeline runs"
          icon={CheckCircle2}
          accentColor={Number(successRate) > 75 ? 'teal' : 'warning'}
        />
        <StatCard
          title="Average Pipeline Latency"
          value={`${avgDuration}s`}
          subtitle="Source to deployment gate"
          icon={Clock}
          accentColor="blue"
        />
        <StatCard
          title="Failed Executions"
          value={failed}
          subtitle="Aborted before production"
          icon={XCircle}
          accentColor={failed > 0 ? 'critical' : 'teal'}
        />
        <StatCard
          title="Active Build Queues"
          value={inProgress}
          subtitle="Currently progressing"
          icon={Activity}
          accentColor="navy"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <SimpleBarChart
            data={stageFailureDistribution}
            title="Stage Failure Distribution (Last 30 Days)"
            unit="Count: "
          />
        </div>

        <div>
          <SimpleBarChart
            data={durationComparison}
            title="Execution Duration by CodePipeline (Seconds)"
            unit=""
          />
        </div>
      </div>

      <div>
        <SimpleLineChart
          data={durationTrend}
          title="Build Latency Trend Across Recent Commits (Seconds)"
          unit="s"
          thresholdValue={180}
          thresholdLabel="SLA Latency Cap (180s)"
          lineColor="#3157C8"
          height={260}
        />
      </div>
    </div>
  );
};
