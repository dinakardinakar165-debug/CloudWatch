import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { SimpleBarChart } from '../common/SimpleBarChart';
import { SimpleLineChart } from '../common/SimpleLineChart';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  PieChart,
  Calendar,
  Wallet,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export const CostIntelligence: React.FC = () => {
  const { costSummary, costHistory, setCurrentPage } = useApp();

  const serviceBars = costSummary.topServices.map((s) => ({
    label: s.service,
    value: s.amount,
    subValue: `${s.percentage}% (${s.trend > 0 ? '+' : ''}${s.trend}%)`,
    color: s.trend > 20 ? '#C43232' : '#3157C8',
  }));

  // Daily spend trend data
  // Aggregate cost by date
  const dateMap = new Map<string, number>();
  costHistory.forEach((c) => {
    dateMap.set(c.date, (dateMap.get(c.date) || 0) + c.cost);
  });

  const dailyTrendData = Array.from(dateMap.entries()).map(([dateStr, totalCost]) => ({
    timeLabel: dateStr.slice(5),
    value: Number(totalCost.toFixed(2)),
  }));

  const isOverBudget = costSummary.budgetUtilizedPercent > 80;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#263445]">
            AWS Cost Intelligence & Budget Observability
          </h2>
          <p className="text-xs text-[#667085]">
            Telemetry synchronized via AWS Cost Explorer GetCostAndUsage API · Billing updated daily
          </p>
        </div>

        <button
          onClick={() => setCurrentPage('consent_policies')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#3157C8] text-white text-xs font-semibold hover:bg-[#2646A8] transition-colors"
        >
          <span>Configure Cost Sharing Policy</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Cost KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Month-To-Date Spend"
          value={`$${costSummary.mtdCost.toLocaleString()}`}
          subtitle="Net unblended cost (USD)"
          icon={DollarSign}
          trend={{ value: 8.4, isPositiveGood: false }}
          accentColor="teal"
        />
        <StatCard
          title="Forecasted End-of-Month"
          value={`$${costSummary.forecastedCost.toLocaleString()}`}
          subtitle="Based on linear regression"
          icon={TrendingUp}
          accentColor="blue"
        />
        <StatCard
          title="Monthly Budget Limit"
          value={`$${costSummary.budgetLimit.toLocaleString()}`}
          subtitle={`${costSummary.budgetUtilizedPercent}% utilized`}
          icon={Wallet}
          accentColor={isOverBudget ? 'warning' : 'navy'}
          badge={isOverBudget ? 'Budget Alert' : undefined}
        />
        <StatCard
          title="Daily Run Rate"
          value={`$${costSummary.dailyAvg.toFixed(2)}`}
          subtitle="Rolling 30-day daily average"
          icon={Calendar}
          accentColor="navy"
        />
      </div>

      {/* Budget Progress Bar */}
      <div className="bg-white rounded-lg border border-[#E0E5EC] p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#263445]">
              AWS Monthly Budget: KCT-Infrastructure-Production-Cap
            </span>
            <span className="font-mono text-[#667085]">
              (${costSummary.mtdCost.toLocaleString()} / ${costSummary.budgetLimit.toLocaleString()})
            </span>
          </div>
          <span
            className={`font-mono font-bold ${
              isOverBudget ? 'text-amber-700' : 'text-emerald-700'
            }`}
          >
            {costSummary.budgetUtilizedPercent}% utilized
          </span>
        </div>

        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden relative">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOverBudget ? 'bg-amber-500' : 'bg-[#3157C8]'
            }`}
            style={{ width: `${Math.min(100, costSummary.budgetUtilizedPercent)}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-[#667085]">
          <span>0%</span>
          <span className="font-mono text-amber-700 font-semibold">80% Warning Threshold Exceeded</span>
          <span>100% ($6,000.00 Limit)</span>
        </div>
      </div>

      {/* Split Charts: Daily Expenditure Trend + Service Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <SimpleLineChart
            data={dailyTrendData}
            title="Daily AWS Spend Evolution (USD)"
            unit="$"
            height={260}
            thresholdValue={180}
            thresholdLabel="Daily Run Rate Cap"
            lineColor="#168C83"
          />
        </div>

        <div>
          <SimpleBarChart
            data={serviceBars}
            title="Expenditure Breakdown by AWS Service (MTD)"
            unit="$"
          />
        </div>
      </div>
    </div>
  );
};
