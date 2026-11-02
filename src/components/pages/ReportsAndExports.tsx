import React from 'react';
import { useApp } from '../../context/AppContext';
import { exportToCSV, generateExecutivePDF } from '../../services/exportService';
import {
  FileSpreadsheet,
  Download,
  Printer,
  FileText,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const ReportsAndExports: React.FC = () => {
  const {
    account,
    resources,
    costSummary,
    costHistory,
    pipelines,
    anomalies,
    alerts,
    operatingMode,
    dataSource,
    selectedRegion,
  } = useApp();

  const handleGeneratePDF = () => {
    generateExecutivePDF({
      accountAlias: account.accountAlias || 'KCT-AWS-Prod',
      region: selectedRegion,
      resources,
      costSummary,
      pipelines,
      anomalies,
      alerts,
      operatingMode,
      dataSource,
    });
  };

  const handleExportResources = () => {
    exportToCSV('AWS-Infrastructure-Health-Report', resources.map((r) => ({
      ID: r.id,
      Name: r.name,
      Type: r.type,
      Region: r.region,
      State: r.state,
      HealthStatus: r.healthStatus,
      CPU_Utilization_Pct: r.metrics.cpuUtilization,
      LaunchDate: r.launchTime,
    })));
  };

  const handleExportCost = () => {
    exportToCSV('AWS-Cost-Explorer-Report', costHistory.map((c) => ({
      Date: c.date,
      Service: c.service,
      Cost_USD: c.cost,
      Region: c.region,
    })));
  };

  const handleExportPipelines = () => {
    exportToCSV('AWS-CodePipeline-Performance-Report', pipelines.map((p) => ({
      PipelineName: p.name,
      Status: p.status,
      Region: p.region,
      Duration_Seconds: p.durationSeconds,
      LastExecutionId: p.lastExecutionId,
      LastExecutionTime: p.lastExecutionTime,
    })));
  };

  const handleExportAnomalies = () => {
    exportToCSV('AWS-ZScore-Anomaly-Report', anomalies.map((a) => ({
      Title: a.title,
      Category: a.category,
      Target: a.targetResourceOrPipeline,
      ObservedValue: a.observedValue,
      BaselineMean: a.baselineMean,
      BaselineStdDev: a.baselineStdDev,
      ZScore: a.zScore,
      Severity: a.severity,
      Status: a.status,
      DetectedAt: a.detectedAt,
    })));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#263445]">
            Enterprise Observability Reports & Audit Dossiers
          </h2>
          <p className="text-xs text-[#667085]">
            Generate statutory PDF compliance documents and raw CSV datasets for infrastructure, cost, and CI/CD audits
          </p>
        </div>

        <button
          onClick={handleGeneratePDF}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#3157C8] text-white text-xs font-semibold hover:bg-[#2646A8] transition-colors shadow-xs"
        >
          <FileText className="w-4 h-4" />
          <span>Generate Executive PDF Report</span>
        </button>
      </div>

      {/* Available Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-lg border border-[#E0E5EC] p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <FileSpreadsheet className="w-5 h-5 text-[#3157C8]" />
              <h3 className="font-bold text-sm text-[#263445]">
                AWS Infrastructure Health & Compute Audit
              </h3>
            </div>
            <p className="text-xs text-[#667085] leading-relaxed mb-4">
              Comprehensive inventory of EC2 instances, RDS databases, and ALBs with current hypervisor CPUUtilization and network metrics.
            </p>
          </div>
          <button
            onClick={handleExportResources}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-[#F4F6F9] hover:bg-slate-100 text-[#263445] text-xs font-semibold border border-[#E0E5EC] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#3157C8]" />
            <span>Download CSV ({resources.length} resources)</span>
          </button>
        </div>

        <div className="bg-white rounded-lg border border-[#E0E5EC] p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <FileSpreadsheet className="w-5 h-5 text-[#168C83]" />
              <h3 className="font-bold text-sm text-[#263445]">
                AWS Cost Explorer & FinOps Spending Dossier
              </h3>
            </div>
            <p className="text-xs text-[#667085] leading-relaxed mb-4">
              Daily unblended billing records broken down by service category, budget utilization percentages, and surge markers.
            </p>
          </div>
          <button
            onClick={handleExportCost}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-[#F4F6F9] hover:bg-slate-100 text-[#263445] text-xs font-semibold border border-[#E0E5EC] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#168C83]" />
            <span>Download CSV (Billing records)</span>
          </button>
        </div>

        <div className="bg-white rounded-lg border border-[#E0E5EC] p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <FileSpreadsheet className="w-5 h-5 text-[#3157C8]" />
              <h3 className="font-bold text-sm text-[#263445]">
                CI/CD CodePipeline Performance & Reliability
              </h3>
            </div>
            <p className="text-xs text-[#667085] leading-relaxed mb-4">
              Pipeline execution logs, stage progression durations, failure rate analysis, and CodeBuild container status.
            </p>
          </div>
          <button
            onClick={handleExportPipelines}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-[#F4F6F9] hover:bg-slate-100 text-[#263445] text-xs font-semibold border border-[#E0E5EC] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#3157C8]" />
            <span>Download CSV ({pipelines.length} pipelines)</span>
          </button>
        </div>

        <div className="bg-white rounded-lg border border-[#E0E5EC] p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <FileSpreadsheet className="w-5 h-5 text-[#D99A28]" />
              <h3 className="font-bold text-sm text-[#263445]">
                Z-Score Statistical Anomaly Audit Log
              </h3>
            </div>
            <p className="text-xs text-[#667085] leading-relaxed mb-4">
              Historical record of Gaussian Z-score breaches, baseline mean and standard deviation snapshots, and evidence data.
            </p>
          </div>
          <button
            onClick={handleExportAnomalies}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-[#F4F6F9] hover:bg-slate-100 text-[#263445] text-xs font-semibold border border-[#E0E5EC] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#D99A28]" />
            <span>Download CSV ({anomalies.length} anomalies)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
