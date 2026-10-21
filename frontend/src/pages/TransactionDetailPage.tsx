import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Receipt,
  ShieldAlert,
  CreditCard,
  Globe,
  Clock,
  Smartphone,
  Cpu,
  CheckCircle,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { RiskBadge } from '../components/RiskBadge';
import { ExplainabilityWaterfall } from '../components/ExplainabilityWaterfall';

export const TransactionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    api.getTransactionDetail(Number(id))
      .then((res) => setData(res))
      .catch((err) => setError(err.message || 'Transaction not found'))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-400">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs">Loading ledger record #{id}...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
        <h3 className="font-bold text-base mb-1">Transaction Record Error</h3>
        <p className="text-xs">{error || 'Record does not exist'}</p>
        <Link to="/transactions" className="mt-4 inline-block text-xs text-teal-400 underline">
          ← Return to Ledger
        </Link>
      </div>
    );
  }

  const { fraud_score, review } = data;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          to="/transactions"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Transactions Ledger</span>
        </Link>
      </div>

      {/* Main Overview Card */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold block mb-1">
              Transaction Reference Audit Node
            </span>
            <h1 className="text-2xl font-black text-white font-mono flex items-center gap-3">
              {data.transaction_reference}
              <StatusBadge status={data.status} />
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Account Target: <span className="text-slate-200 font-mono">{data.account_id}</span>
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Total Settlement</span>
            <div className="text-3xl font-extrabold text-white font-mono">
              ${data.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              <span className="text-sm font-normal text-slate-400 ml-1">{data.currency}</span>
            </div>
          </div>
        </div>

        {/* Detailed Metadata Grid */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-navy-950/70 rounded-xl border border-slate-800/80">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Merchant</span>
            <span className="font-semibold text-slate-200 mt-0.5 block truncate">{data.merchant_name}</span>
            <span className="text-[11px] text-teal-400 font-mono">{data.merchant_category}</span>
          </div>

          <div className="p-3 bg-navy-950/70 rounded-xl border border-slate-800/80">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Settlement Time</span>
            <span className="font-semibold text-slate-200 mt-0.5 block font-mono">
              {new Date(data.timestamp).toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400">Timestamp</span>
          </div>

          <div className="p-3 bg-navy-950/70 rounded-xl border border-slate-800/80">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Payment Channel</span>
            <span className="font-semibold text-slate-200 mt-0.5 block font-mono">{data.transaction_type}</span>
            <span className="text-[11px] text-slate-400">{data.channel}</span>
          </div>

          <div className="p-3 bg-navy-950/70 rounded-xl border border-slate-800/80">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Origin & Geolocation</span>
            <span className="font-semibold text-slate-200 mt-0.5 block font-mono">
              {data.country_code} {data.is_international ? '• International' : '• Domestic'}
            </span>
            <span className="text-[11px] text-slate-400 font-mono truncate block">
              {data.device_fingerprint || 'Standard Device'}
            </span>
          </div>
        </div>
      </div>

      {/* Machine Learning Scoring & Explainability Section */}
      {fraud_score && (
        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Machine-Learning Risk Assessment</h3>
                <p className="text-xs text-slate-400">
                  Model: <span className="font-mono text-slate-200">{fraud_score.model_version}</span> • Decision Threshold: <span className="font-mono text-amber-400">{fraud_score.threshold_used}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <RiskBadge score={fraud_score.risk_score} />
            </div>
          </div>

          {/* Explainability factors */}
          <ExplainabilityWaterfall
            factors={fraud_score.risk_factors}
            title="Local Feature Attribution Drivers (Instance Explainability)"
          />

          {/* Review Status if present */}
          {review && (
            <div className="mt-5 p-4 rounded-xl bg-navy-950/80 border border-slate-800 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Analyst Investigation Record #{review.review_id}
                </span>
                <StatusBadge status={review.review_status} />
              </div>
              <p className="text-slate-400 font-sans italic">
                "{review.analyst_notes || 'No review notes provided.'}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
