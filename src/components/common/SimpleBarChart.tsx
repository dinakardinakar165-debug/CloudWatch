import React from 'react';

interface BarData {
  label: string;
  value: number;
  subValue?: string;
  color?: string;
}

interface SimpleBarChartProps {
  data: BarData[];
  title?: string;
  unit?: string;
  height?: number;
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({
  data,
  title,
  unit = '$',
}) => {
  if (!data || data.length === 0) {
    return <div className="text-sm text-slate-500 py-4">No data available</div>;
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="w-full bg-white rounded-lg border border-[#E0E5EC] p-5">
      {title && (
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#263445] mb-4">
          {title}
        </h4>
      )}

      <div className="flex flex-col gap-3">
        {data.map((item, idx) => {
          const percent = Math.min(100, Math.max(2, (item.value / maxValue) * 100));
          const barColor = item.color || '#3157C8';

          return (
            <div key={idx} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#263445] truncate max-w-[240px]">
                  {item.label}
                </span>
                <span className="font-mono font-semibold text-[#14243A]">
                  {unit}
                  {item.value.toLocaleString()}
                  {item.subValue && (
                    <span className="text-[#667085] font-normal ml-1.5 font-sans">
                      ({item.subValue})
                    </span>
                  )}
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${percent}%`, backgroundColor: barColor }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
