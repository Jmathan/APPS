import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subValue?: string;
  change?: string | null;
  isPositive?: boolean | null; // true = good (green), false = bad (red), null = neutral
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  tooltip?: string;
  badge?: string;
  badgeColor?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subValue,
  change,
  isPositive,
  icon: Icon,
  iconBg = 'bg-emerald-50',
  iconColor = 'text-emerald-700',
  tooltip,
  badge,
  badgeColor = 'bg-slate-100 text-slate-700',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all ${
        onClick ? 'cursor-pointer hover:border-emerald-300' : ''
      }`}
      title={tooltip}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl font-black text-slate-900 font-mono tracking-tight flex items-baseline gap-2">
          <span>{value}</span>
          {badge && (
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>

        <div className="mt-1.5 flex items-center justify-between text-xs">
          {change !== undefined && change !== null && (
            <div className="flex items-center gap-1 font-semibold">
              <span
                className={
                  isPositive === true
                    ? 'text-emerald-600'
                    : isPositive === false
                    ? 'text-red-600'
                    : 'text-slate-500'
                }
              >
                {change}
              </span>
              <span className="text-slate-400 text-[11px]">vs baseline</span>
            </div>
          )}

          {subValue && (
            <span className="text-slate-500 font-medium text-[11px] ml-auto">
              {subValue}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
