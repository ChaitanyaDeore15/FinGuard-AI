import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles: Record<string, string> = {
    COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    FLAGGED: 'bg-rose-500/10 text-rose-400 border-rose-500/30 font-semibold',
    DECLINED: 'bg-red-500/15 text-red-400 border-red-500/30',
    CONFIRMED_FRAUD: 'bg-red-500/20 text-red-300 border-red-500/40',
    FALSE_POSITIVE: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    CLEARED: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
  };

  const style = styles[status] || 'bg-slate-800 text-slate-300 border-slate-700';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border font-mono ${style}`}>
      {status.replace('_', ' ')}
    </span>
  );
};
