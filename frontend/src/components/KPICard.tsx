import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  subtext?: string;
  icon: LucideIcon;
  variant?: 'default' | 'accent' | 'warning' | 'danger';
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  isPositive,
  subtext,
  icon: Icon,
  variant = 'default',
}) => {
  const iconColors = {
    default: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
    accent: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    danger: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };

  return (
    <div className="bg-navy-900 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition shadow-lg relative overflow-hidden group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className={`p-2.5 rounded-lg border ${iconColors[variant]} transition group-hover:scale-105`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-3">
        <span className="text-2xl font-bold tracking-tight text-white font-mono">
          {value}
        </span>
        {change && (
          <span
            className={`inline-flex items-center text-xs font-medium ${
              isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
            )}
            {change}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1 text-xs text-slate-400 truncate">
          {subtext}
        </p>
      )}

      {/* Subtle top glow line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />
    </div>
  );
};
