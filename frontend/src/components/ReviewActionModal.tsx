import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, AlertOctagon, X, MessageSquare } from 'lucide-react';
import { FraudAlertItem, ReviewStatus } from '../types';
import { api } from '../services/api';
import { ExplainabilityWaterfall } from './ExplainabilityWaterfall';

interface ReviewActionModalProps {
  alert: FraudAlertItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewActionModal: React.FC<ReviewActionModalProps> = ({
  alert,
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen || !alert) return null;

  const [status, setStatus] = useState<ReviewStatus>(alert.review_status);
  const [notes, setNotes] = useState(alert.analyst_notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateReviewStatus(alert.review_id, {
        review_status: status,
        analyst_notes: notes,
        action_taken: status === 'CONFIRMED_FRAUD' ? 'ACCOUNT_ALERT_SENT' : 'STATUS_UPDATED',
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      window.alert(err.message || 'Failed to update review status');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-navy-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Fraud Investigation Triage
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Ref: {alert.transaction_reference} | Account: {alert.account_id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Transaction Metadata Snapshot */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-navy-950/60 p-3.5 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Amount</span>
              <span className="text-sm font-bold text-white font-mono">
                ${alert.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {alert.currency}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Merchant</span>
              <span className="text-slate-200 font-medium truncate block">{alert.merchant_name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Category</span>
              <span className="text-slate-200 font-medium">{alert.merchant_category}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Model Score</span>
              <span className="text-sm font-bold text-rose-400 font-mono">
                {(alert.risk_score * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Explainability factors */}
          <ExplainabilityWaterfall factors={alert.risk_factors} />

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Analyst Determination
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setStatus('CONFIRMED_FRAUD')}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                  status === 'CONFIRMED_FRAUD'
                    ? 'border-red-500 bg-red-500/15 text-white ring-1 ring-red-500'
                    : 'border-slate-800 hover:border-slate-700 bg-navy-950/40 text-slate-300'
                }`}
              >
                <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
                <div>
                  <div className="text-xs font-semibold">Confirmed Fraud</div>
                  <div className="text-[10px] text-slate-400">Block & chargeback</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setStatus('FALSE_POSITIVE')}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                  status === 'FALSE_POSITIVE'
                    ? 'border-blue-500 bg-blue-500/15 text-white ring-1 ring-blue-500'
                    : 'border-slate-800 hover:border-slate-700 bg-navy-950/40 text-slate-300'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <div className="text-xs font-semibold">False Positive</div>
                  <div className="text-[10px] text-slate-400">Verified cardholder</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setStatus('CLEARED')}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                  status === 'CLEARED'
                    ? 'border-emerald-500 bg-emerald-500/15 text-white ring-1 ring-emerald-500'
                    : 'border-slate-800 hover:border-slate-700 bg-navy-950/40 text-slate-300'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-semibold">Cleared / Safe</div>
                  <div className="text-[10px] text-slate-400">2FA passed</div>
                </div>
              </button>
            </div>
          </div>

          {/* Investigation Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
              Investigation Audit Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record investigation findings, cardholder contact notes, or justification..."
              className="w-full bg-navy-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-medium bg-teal-500 hover:bg-teal-400 text-navy-950 font-semibold rounded-lg transition disabled:opacity-50"
            >
              {isSaving ? 'Submitting Decision...' : 'Save Triage Decision'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
