import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SimpleLineChart } from '../common/SimpleLineChart';
import { generateDemoMetricSeries } from '../../data/mockEnterpriseData';
import {
  Activity,
  Layers,
  Clock,
  SlidersHorizontal,
  Info,
  Download,
} from 'lucide-react';
import { exportToCSV } from '../../services/exportService';

const AVAILABLE_METRICS = [
  { id: 'CPUUtilization', name: 'CPUUtilization', unit: '%', threshold: 80 },
  { id: 'NetworkIn', name: 'NetworkIn', unit: 'MB', threshold: 100 },
  { id: 'NetworkOut', name: 'NetworkOut', unit: 'MB', threshold: 150 },
  { id: 'DiskReadOps', name: 'DiskReadOps', unit: 'Ops/sec', threshold: 1000 },
  { id: 'DiskWriteOps', name: 'DiskWriteOps', unit: 'Ops/sec', threshold: 2500 },
  { id: 'StatusCheckFailed_Instance', name: 'StatusCheckFailed_Instance', unit: 'Count', threshold: 1 },
];

export const CloudWatchMetrics: React.FC = () => {
  const { resources } = useApp();
  const [selectedResourceId, setSelectedResourceId] = useState<string>(
    resources[0]?.id || ''
  );
  const [selectedMetric, setSelectedMetric] = useState<string>('CPUUtilization');
  const [aggregation, setAggregation] = useState<'Average' | 'Maximum' | 'Sum'>('Average');
  const [period, setPeriod] = useState<string>('5m');

  const activeMetricObj =
    AVAILABLE_METRICS.find((m) => m.id === selectedMetric) || AVAILABLE_METRICS[0];

  const rawSeries = generateDemoMetricSeries(24);
  const chartData = rawSeries.map((d) => {
    let val = d.cpuUtilization;
    if (selectedMetric === 'NetworkIn') val = d.networkInMB;
    if (selectedMetric === 'NetworkOut') val = d.networkOutMB;
    if (selectedMetric === 'DiskReadOps') val = Math.round(d.cpuUtilization * 14);
    if (selectedMetric === 'DiskWriteOps') val = Math.round(d.cpuUtilization * 28);
    if (selectedMetric === 'StatusCheckFailed_Instance') val = d.cpuUtilization > 95 ? 1 : 0;

    return {
      timeLabel: d.timeLabel,
      value: val,
    };
  });

  const handleExport = () => {
    exportToCSV(`CloudWatch-${selectedMetric}-${selectedResourceId}`, chartData);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#263445]">
            CloudWatch Metric Telemetry Explorer
          </h2>
          <p className="text-xs text-[#667085]">
            Query AWS CloudWatch GetMetricData API with configurable period aggregations and statistical dimensions
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-[#E0E5EC] text-xs font-semibold text-[#263445] hover:bg-slate-50 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-[#3157C8]" />
          <span>Export Metric Samples (CSV)</span>
        </button>
      </div>

      {/* Query Selector Bar */}
      <div className="bg-white rounded-lg border border-[#E0E5EC] p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shadow-2xs">
        {/* Resource Selector */}
        <div>
          <label className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block mb-1">
            Target Resource Dimension
          </label>
          <select
            value={selectedResourceId}
            onChange={(e) => setSelectedResourceId(e.target.value)}
            className="w-full text-xs font-mono border border-[#E0E5EC] rounded-md px-3 py-2 bg-white text-[#263445] outline-none"
          >
            {resources.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.id.slice(0, 14)}...)
              </option>
            ))}
          </select>
        </div>

        {/* Metric Name */}
        <div>
          <label className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block mb-1">
            CloudWatch Metric Name
          </label>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="w-full text-xs font-mono border border-[#E0E5EC] rounded-md px-3 py-2 bg-white text-[#263445] outline-none"
          >
            {AVAILABLE_METRICS.map((m) => (
              <option key={m.id} value={m.id}>
                AWS/EC2 : {m.name} ({m.unit})
              </option>
            ))}
          </select>
        </div>

        {/* Aggregation */}
        <div>
          <label className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block mb-1">
            Statistic
          </label>
          <select
            value={aggregation}
            onChange={(e) => setAggregation(e.target.value as any)}
            className="w-full text-xs font-mono border border-[#E0E5EC] rounded-md px-3 py-2 bg-white text-[#263445] outline-none"
          >
            <option value="Average">Average</option>
            <option value="Maximum">Maximum (Peak)</option>
            <option value="Sum">Sum</option>
          </select>
        </div>

        {/* Period */}
        <div>
          <label className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block mb-1">
            Period Interval
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full text-xs font-mono border border-[#E0E5EC] rounded-md px-3 py-2 bg-white text-[#263445] outline-none"
          >
            <option value="1m">60 seconds (1 min - High Resolution)</option>
            <option value="5m">300 seconds (5 min - Standard)</option>
            <option value="1h">3600 seconds (1 hour)</option>
            <option value="1d">86400 seconds (1 day)</option>
          </select>
        </div>
      </div>

      {/* Main Metric Visualization Canvas */}
      <SimpleLineChart
        data={chartData}
        title={`${selectedMetric} (${aggregation}) for ${selectedResourceId}`}
        unit={activeMetricObj.unit}
        height={340}
        thresholdValue={activeMetricObj.threshold}
        thresholdLabel="Configured Alarm Threshold"
        lineColor="#3157C8"
      />

      {/* CloudWatch Query Technical Specs Callout */}
      <div className="bg-[#F4F6F9] border border-[#E0E5EC] rounded-lg p-4 text-xs flex items-start gap-3">
        <Info className="w-5 h-5 text-[#3157C8] shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <div className="font-bold text-[#263445]">
            CloudWatch GetMetricData API Schema Specifications
          </div>
          <p className="text-[#667085] leading-relaxed">
            Observations are fetched using CloudWatch MetricDataQuery definitions with dimensions <code className="font-mono bg-white px-1 py-0.5 border border-slate-200 rounded">InstanceId = {selectedResourceId}</code> and namespace <code className="font-mono bg-white px-1 py-0.5 border border-slate-200 rounded">AWS/EC2</code>. Missing data points are handled through zero-fill or linear interpolation depending on whether the instance was stopped.
          </p>
        </div>
      </div>
    </div>
  );
};
