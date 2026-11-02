import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToCSV } from '../../services/exportService';
import {
  TrendingUp,
  Download,
  Filter,
  Calendar,
  Layers,
  ArrowUpRight,
  Info,
} from 'lucide-react';

export const CostExplorer: React.FC = () => {
  const { costHistory, costSummary } = useApp();
  const [selectedService, setSelectedService] = useState('ALL');

  const services = ['ALL', ...Array.from(new Set(costHistory.map((c) => c.service)))];

  const filtered = costHistory.filter((c) =>
    selectedService === 'ALL' ? true : c.service === selectedService
  );

  const handleExport = () => {
    exportToCSV('AWS-Cost-Explorer-Data', filtered);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#263445]">
            AWS Cost Explorer Multidimensional Deep-Dive
          </h2>
          <p className="text-xs text-[#667085]">
            Filter and dissect daily cloud spending by service, usage type, and region dimensions
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-[#E0E5EC] text-xs font-semibold text-[#263445] hover:bg-slate-50 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-[#3157C8]" />
          <span>Export Billing Records (CSV)</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg border border-[#E0E5EC] p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-[#667085]" />
          <span className="font-semibold text-[#667085]">Filter by Service:</span>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="border border-[#E0E5EC] rounded px-3 py-1.5 bg-white text-[#263445] outline-none font-medium"
          >
            {services.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs font-mono text-[#667085]">
          Showing {filtered.length} billing line items · Currency: USD
        </div>
      </div>

      {/* Cost Table */}
      <div className="bg-white rounded-lg border border-[#E0E5EC] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F4F6F9] border-b border-[#E0E5EC] text-[#667085] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">AWS Service Name</th>
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4 text-right">Unblended Cost ($)</th>
                <th className="py-3 px-4">Anomaly Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E5EC]">
              {filtered.map((item, idx) => {
                const isSpike = item.service.includes('CloudWatch') && item.cost > 30;
                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-[#263445]">
                      {item.date}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#263445]">
                      {item.service}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#667085]">
                      {item.region}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-right text-[#14243A]">
                      ${item.cost.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      {isSpike ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                          <ArrowUpRight className="w-3 h-3 text-rose-600" />
                          Cost Surge (+300%)
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#667085] font-mono">Normal</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-[#F4F6F9] border border-[#E0E5EC] rounded-lg p-4 text-xs flex items-start gap-3">
        <Info className="w-4 h-4 text-[#3157C8] shrink-0 mt-0.5" />
        <div className="text-[#667085] leading-relaxed">
          <strong className="text-[#263445]">Important AWS Billing Latency Notice:</strong> AWS Cost Explorer updates daily (typically 24 to 48 hours delayed from raw consumption). Do not treat Cost Explorer records as sub-second streaming metrics.
        </div>
      </div>
    </div>
  );
};
