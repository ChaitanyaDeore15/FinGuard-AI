import React from 'react';
import { RiskFactor } from '../types';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface ExplainabilityWaterfallProps {
  factors: RiskFactor[];
  title?: string;
}

export const ExplainabilityWaterfall: React.FC<ExplainabilityWaterfallProps> = ({
  factors,
  title = "Feature Attribution Breakdown (Local Explainability)"
}) => {
  if (!factors || factors.length === 0) {
    return (
      <div className="text-sm text-slate-400 italic py-2">
        No feature attribution signals recorded.
      </div>
    );
  }

  // Find max absolute contribution to normalize bar widths
  const maxAbs = Math.max(...factors.map((f) => Math.abs(f.contribution)), 0.05);

  return (
    <div className="bg-navy-950/60 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Info className="w-4 h-4 text-teal-400" />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          {title}
        </h4>
      </div>

      <div className="space-y-3">
        {factors.map((item, idx) => {
          const isRiskIncreasing = item.contribution > 0;
          const pctWidth = Math.min(100, (Math.abs(item.contribution) / maxAbs) * 100);

          return (
            <div key={idx} className="group">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-200 flex items-center gap-1.5">
                  {isRiskIncreasing ? (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  {item.factor}
                </span>
                <span
                  className={`font-mono font-semibold ${
                    isRiskIncreasing ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {isRiskIncreasing ? '+' : ''}
                  {(item.contribution * 100).toFixed(1)}%
                </span>
              </div>

              {/* Attribution Bar */}
              <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isRiskIncreasing
                      ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  }`}
                  style={{ width: `${pctWidth}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
