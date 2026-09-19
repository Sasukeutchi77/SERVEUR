import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: string;
  trendPositive?: boolean;
  icon: LucideIcon;
  iconColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  trend,
  trendPositive = true,
  icon: Icon,
  iconColor = 'text-indigo-400',
}) => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-slate-900/70 border border-slate-800/80 p-4.5 backdrop-blur-sm transition-all duration-200 hover:border-slate-700 hover:bg-slate-900/90 shadow-sm group">
      {/* Top accent line on hover */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400 font-mono">
          {label}
        </span>
        <div className={`p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl font-bold tracking-tight text-white font-mono">
          {value}
        </div>
        {trend && (
          <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
            trendPositive ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' : 'bg-slate-800 text-slate-400'
          }`}>
            {trend}
          </span>
        )}
      </div>

      {subValue && (
        <p className="mt-1 text-xs text-slate-500 line-clamp-1">
          {subValue}
        </p>
      )}
    </div>
  );
};
