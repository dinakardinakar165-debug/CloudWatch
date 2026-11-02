import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number; // percentage change
    isPositiveGood?: boolean;
    label?: string;
  };
  accentColor?: 'blue' | 'teal' | 'warning' | 'critical' | 'navy';
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'navy',
  badge,
}) => {
  const getBorderColor = () => {
    switch (accentColor) {
      case 'blue':
        return 'border-l-[#3157C8]';
      case 'teal':
        return 'border-l-[#168C83]';
      case 'warning':
        return 'border-l-[#D99A28]';
      case 'critical':
        return 'border-l-[#C43232]';
      default:
        return 'border-l-[#14243A]';
    }
  };

  const isGood = trend
    ? trend.isPositiveGood !== false
      ? trend.value >= 0
      : trend.value <= 0
    : true;

  return (
    <div
      className={`bg-white rounded-lg border border-[#E0E5EC] border-l-4 ${getBorderColor()} p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-sm`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
            {title}
          </span>
          {badge && (
            <span className="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              {badge}
            </span>
          )}
        </div>
        {Icon && (
          <div className="p-2 rounded-md bg-[#F4F6F9] text-[#14243A]">
            <Icon className="w-5 h-5 text-[#3157C8]" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-2xl font-bold font-sans text-[#263445] tracking-tight">
          {value}
        </div>

        {(subtitle || trend) && (
          <div className="mt-1 flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={`font-semibold font-mono ${
                  isGood ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {trend.value > 0 ? '+' : ''}
                {trend.value}%
              </span>
            )}
            {subtitle && <span className="text-[#667085]">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
