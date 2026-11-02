import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import { SimpleLineChart } from '../common/SimpleLineChart';
import { generateDemoMetricSeries } from '../../data/mockEnterpriseData';
import {
  Server,
  Activity,
  AlertTriangle,
  HardDrive,
  Cpu,
  RefreshCw,
  Search,
  ExternalLink,
} from 'lucide-react';

export const InfrastructureMonitoring: React.FC = () => {
  const { resources, selectedRegion } = useApp();
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>(
    resources[0]?.id || ''
  );
  const [filterState, setFilterState] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const ec2Instances = resources.filter(
    (r) => r.type === 'AWS::EC2::Instance'
  );

  const filteredInstances = ec2Instances.filter((inst) => {
    const matchesFilter =
      filterState === 'all'
        ? true
        : filterState === 'healthy'
        ? inst.healthStatus === 'HEALTHY'
        : filterState === 'warning'
        ? inst.healthStatus === 'WARNING'
        : inst.healthStatus === 'CRITICAL';

    const matchesSearch =
      inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const activeInstance =
    resources.find((r) => r.id === selectedInstanceId) || ec2Instances[0];

  const cpuData = generateDemoMetricSeries(24).map((d) => ({
    timeLabel: d.timeLabel,
    value: activeInstance?.healthStatus === 'WARNING' ? Math.min(100, d.cpuUtilization * 1.6) : d.cpuUtilization,
  }));

  const netInData = generateDemoMetricSeries(24).map((d) => ({
    timeLabel: d.timeLabel,
    value: d.networkInMB,
  }));

  return (
    <div className="flex flex-col gap-6">
      {/* Header Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#263445]">
            EC2 & Compute Infrastructure Observability
          </h2>
          <p className="text-xs text-[#667085]">
            CloudWatch instance telemetry, status check evaluations, and hypervisor metrics for {selectedRegion}
          </p>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monitored EC2 Instances"
          value={ec2Instances.length}
          subtitle="Running on AWS Nitro / Xen"
          icon={Server}
          accentColor="navy"
        />
        <StatCard
          title="Cluster Avg CPU Utilization"
          value="48.2%"
          subtitle="Baseline normal variance"
          icon={Cpu}
          accentColor="blue"
        />
        <StatCard
          title="Status Check Failures"
          value={ec2Instances.filter((i) => i.metrics.statusCheckFailed > 0).length}
          subtitle="StatusCheckFailed_Instance > 0"
          icon={AlertTriangle}
          accentColor={
            ec2Instances.some((i) => i.metrics.statusCheckFailed > 0)
              ? 'critical'
              : 'teal'
          }
        />
        <StatCard
          title="Aggregate Network I/O"
          value="128.4 MB/s"
          subtitle="VPC Elastic Network Adapter"
          icon={Activity}
          accentColor="teal"
        />
      </div>

      {/* Main Split: Left Instance List, Right Detailed Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 5 cols Instance List */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-[#E0E5EC] p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#667085]" />
              <input
                type="text"
                placeholder="Filter instances..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-[#E0E5EC] outline-none focus:border-[#3157C8]"
              />
            </div>
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="text-xs border border-[#E0E5EC] rounded px-2 py-1.5 bg-white text-[#263445] outline-none"
            >
              <option value="all">All States</option>
              <option value="healthy">Healthy</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto max-h-[580px]">
            {filteredInstances.map((inst) => {
              const isSelected = inst.id === selectedInstanceId;
              return (
                <div
                  key={inst.id}
                  onClick={() => setSelectedInstanceId(inst.id)}
                  className={`cursor-pointer p-3 rounded-md border transition-all ${
                    isSelected
                      ? 'border-[#3157C8] bg-blue-50/50 shadow-2xs'
                      : 'border-[#E0E5EC] hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-[#263445]">
                      {inst.name}
                    </span>
                    <StatusBadge status={inst.healthStatus} size="sm" />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#667085] font-mono">
                    <span>{inst.id}</span>
                    <span>{inst.instanceType}</span>
                  </div>

                  <div className="mt-2 grid grid-cols-3 gap-1 pt-2 border-t border-[#E0E5EC]/60 text-[10px]">
                    <div>
                      <span className="text-[#667085]">CPU:</span>{' '}
                      <strong className="text-[#263445] font-mono">
                        {inst.metrics.cpuUtilization}%
                      </strong>
                    </div>
                    <div>
                      <span className="text-[#667085]">NetIn:</span>{' '}
                      <strong className="text-[#263445] font-mono">
                        {(inst.metrics.networkInBps / 1000000).toFixed(1)}M
                      </strong>
                    </div>
                    <div>
                      <span className="text-[#667085]">StatusChk:</span>{' '}
                      <strong
                        className={`font-mono ${
                          inst.metrics.statusCheckFailed > 0
                            ? 'text-rose-700 font-bold'
                            : 'text-emerald-700'
                        }`}
                      >
                        {inst.metrics.statusCheckFailed === 0 ? 'Passed' : 'Failed'}
                      </strong>
                    </div>
                  </div>

                  {inst.healthReason && (
                    <div className="mt-2 text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200">
                      {inst.healthReason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: 7 cols Telemetry Charts for Selected Instance */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {activeInstance ? (
            <>
              {/* Selected Instance Meta Header */}
              <div className="bg-white rounded-lg border border-[#E0E5EC] p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#263445]">
                      {activeInstance.name}
                    </h3>
                    <StatusBadge status={activeInstance.healthStatus} size="sm" />
                  </div>
                  <div className="text-xs text-[#667085] font-mono mt-0.5">
                    {activeInstance.id} · {activeInstance.instanceType} · {activeInstance.availabilityZone}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://console.aws.amazon.com/ec2/v2/home?region=${activeInstance.region}#InstanceDetails:instanceId=${activeInstance.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold text-[#3157C8] hover:underline"
                  >
                    Open AWS EC2 Console <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Chart 1: CPUUtilization */}
              <SimpleLineChart
                data={cpuData}
                title={`${activeInstance.name} — CPUUtilization (%)`}
                unit="%"
                thresholdValue={80}
                thresholdLabel="Alarm Threshold"
                lineColor="#3157C8"
              />

              {/* Chart 2: NetworkInMB */}
              <SimpleLineChart
                data={netInData}
                title={`${activeInstance.name} — NetworkIn (MB/s)`}
                unit="MB"
                lineColor="#168C83"
              />

              {/* Tags & Metadata Table */}
              <div className="bg-white rounded-lg border border-[#E0E5EC] p-4 shadow-2xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#263445] mb-2">
                  Instance Tags & Metadata
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {Object.entries(activeInstance.tags).map(([k, v]) => (
                    <div key={k} className="p-2 rounded bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-[#667085] font-mono block">{k}</span>
                      <span className="font-semibold text-[#263445] truncate block">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg border border-[#E0E5EC] p-8 text-center text-sm text-[#667085]">
              Select an instance on the left to inspect CloudWatch metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
