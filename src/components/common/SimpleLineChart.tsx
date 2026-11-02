import React, { useState } from 'react';

interface DataPoint {
  timeLabel: string;
  value: number;
  threshold?: number;
  [key: string]: any;
}

interface SimpleLineChartProps {
  data: DataPoint[];
  title?: string;
  unit?: string;
  height?: number;
  thresholdValue?: number;
  thresholdLabel?: string;
  lineColor?: string;
}

export const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
  data,
  title,
  unit = '%',
  height = 220,
  thresholdValue,
  thresholdLabel = 'Threshold',
  lineColor = '#3157C8',
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div
        style={{ height }}
        className="w-full flex items-center justify-center bg-slate-50 border border-[#E0E5EC] rounded-lg text-sm text-[#667085]"
      >
        No telemetry data available for the selected interval
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const minVal = 0;
  const maxVal = Math.max(...values, thresholdValue || 0, 10) * 1.15; // headroom

  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 30;

  const chartWidth = 700; // SVG viewBox coordinate space
  const chartHeight = height;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const getX = (index: number) => {
    return paddingLeft + (index / (data.length - 1 || 1)) * innerWidth;
  };

  const getY = (val: number) => {
    const clamped = Math.max(minVal, Math.min(maxVal, val));
    return paddingTop + innerHeight - ((clamped - minVal) / (maxVal - minVal || 1)) * innerHeight;
  };

  // Generate SVG path points
  const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');

  // Area path
  const areaPath = `${points} L ${getX(data.length - 1)},${paddingTop + innerHeight} L ${getX(0)},${paddingTop + innerHeight} Z`;

  // Y-axis ticks (4 ticks)
  const yTicks = [0, maxVal * 0.33, maxVal * 0.66, maxVal].map((v) => Number(v.toFixed(1)));

  return (
    <div className="w-full bg-white rounded-lg border border-[#E0E5EC] p-4 flex flex-col justify-between">
      {title && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#263445]">
            {title}
          </span>
          {hoverIndex !== null && data[hoverIndex] && (
            <span className="text-xs font-mono font-bold text-[#3157C8] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              {data[hoverIndex].timeLabel}: {data[hoverIndex].value} {unit}
            </span>
          )}
        </div>
      )}

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto select-none"
          style={{ maxHeight: height }}
        >
          {/* Background grid lines */}
          {yTicks.map((tickVal, idx) => {
            const yPos = getY(tickVal);
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={yPos}
                  x2={chartWidth - paddingRight}
                  y2={yPos}
                  stroke="#E0E5EC"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={yPos + 4}
                  textAnchor="end"
                  fill="#667085"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {tickVal}
                  {unit}
                </text>
              </g>
            );
          })}

          {/* Threshold line */}
          {thresholdValue !== undefined && (
            <g>
              <line
                x1={paddingLeft}
                y1={getY(thresholdValue)}
                x2={chartWidth - paddingRight}
                y2={getY(thresholdValue)}
                stroke="#C43232"
                strokeWidth="1.5"
                strokeDasharray="6 3"
              />
              <text
                x={chartWidth - paddingRight - 4}
                y={getY(thresholdValue) - 5}
                textAnchor="end"
                fill="#C43232"
                fontSize="9"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                {thresholdLabel}: {thresholdValue}
                {unit}
              </text>
            </g>
          )}

          {/* Area under curve */}
          <polygon points={areaPath} fill={lineColor} fillOpacity="0.08" />

          {/* Line */}
          <polyline
            fill="none"
            stroke={lineColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />

          {/* Data Points & Interactive hover zones */}
          {data.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.value);
            const isHovered = hoverIndex === i;

            return (
              <g key={i}>
                {/* Invisible wider hover hit target */}
                <rect
                  x={cx - (innerWidth / data.length / 2)}
                  y={paddingTop}
                  width={innerWidth / data.length}
                  height={innerHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                />

                {isHovered && (
                  <line
                    x1={cx}
                    y1={paddingTop}
                    x2={cx}
                    y2={paddingTop + innerHeight}
                    stroke="#3157C8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 5 : 2.5}
                  fill={isHovered ? '#FFFFFF' : lineColor}
                  stroke={lineColor}
                  strokeWidth="2"
                  className="pointer-events-none transition-all"
                />
              </g>
            );
          })}

          {/* X Axis labels (Show 6 equidistant points) */}
          {data.map((d, i) => {
            const step = Math.max(1, Math.floor(data.length / 6));
            if (i % step === 0 || i === data.length - 1) {
              return (
                <text
                  key={i}
                  x={getX(i)}
                  y={chartHeight - 8}
                  textAnchor="middle"
                  fill="#667085"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {d.timeLabel}
                </text>
              );
            }
            return null;
          })}
        </svg>
      </div>
    </div>
  );
};
