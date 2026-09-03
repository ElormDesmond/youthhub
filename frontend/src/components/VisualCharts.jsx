import React from 'react';

/**
 * Interactive SVG Donut / Pie Chart Component
 */
export function PieChart({ data = [], size = 180, strokeWidth = 28, centerLabel = '', centerSubtext = '' }) {
  const total = data.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);
  let accumulatedPercent = 0;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-center">
        <div className="w-24 h-24 rounded-full border-4 border-slate-700 border-dashed flex items-center justify-center text-slate-500 text-xs font-bold">
          No Data
        </div>
      </div>
    );
  }

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
      {/* SVG Ring */}
      <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
          />
          {data.map((item, idx) => {
            const val = parseFloat(item.value) || 0;
            if (val <= 0) return null;
            const percent = val / total;
            const strokeDasharray = `${percent * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedPercent * circumference;
            accumulatedPercent += percent;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={item.color || '#10b981'}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 hover:opacity-80"
              />
            );
          })}
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
          <span className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none truncate max-w-full">
            {centerLabel || total}
          </span>
          {centerSubtext && (
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">
              {centerSubtext}
            </span>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2 min-w-[150px] w-full sm:w-auto">
        {data.map((item, idx) => {
          const val = parseFloat(item.value) || 0;
          const pct = total > 0 ? Math.round((val / total) * 100) : 0;
          return (
            <div key={idx} className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="font-semibold text-slate-300 truncate max-w-[120px]">{item.label}</span>
              </div>
              <span className="font-bold text-white font-mono text-[11px]">
                {item.formattedValue || val} <span className="text-slate-400 font-normal">({pct}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Visual Progress Bar with Target
 */
export function MetricBar({ label, value, max, color = 'bg-brand-600', format = 'number' }) {
  const percentage = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-bold">
        <span className="text-slate-300">{label}</span>
        <span className="text-white font-mono">
          {format === 'currency' ? `GHS ${value.toLocaleString()}` : value} / {format === 'currency' ? `GHS ${max.toLocaleString()}` : max} ({percentage}%)
        </span>
      </div>
      <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
