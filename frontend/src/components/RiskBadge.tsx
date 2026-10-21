import React from 'react';

interface RiskBadgeProps {
  score?: number;
  tier?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  showScore?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ score, tier, showScore = true }) => {
  let computedTier = tier;
  if (!computedTier && score !== undefined) {
    if (score >= 0.70) computedTier = 'HIGH';
    else if (score >= 0.35) computedTier = 'MEDIUM';
    else computedTier = 'LOW';
  }

  const styles = {
    LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    HIGH: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    CRITICAL: 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse',
  };

  const labels = {
    LOW: 'Low Risk',
    MEDIUM: 'Medium Risk',
    HIGH: 'High Risk',
    CRITICAL: 'Critical Fraud',
  };

  const currentTier = computedTier || 'LOW';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[currentTier]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${
        currentTier === 'LOW' ? 'bg-emerald-400' :
        currentTier === 'MEDIUM' ? 'bg-amber-400' :
        'bg-rose-400'
      }`} />
      <span>{labels[currentTier]}</span>
      {showScore && score !== undefined && (
        <span className="font-mono opacity-80">({(score * 100).toFixed(0)}%)</span>
      )}
    </span>
  );
};
