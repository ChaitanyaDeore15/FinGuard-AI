import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  RefreshCw,
  Sliders,
  Sparkles,
  BarChart3,
  Filter,
  CheckSquare,
  Search
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

import { api } from '../services/api';
import { FraudAlertItem, FraudScoreResponse } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { StatusBadge } from '../components/StatusBadge';
import { ExplainabilityWaterfall } from '../components/ExplainabilityWaterfall';
import { ReviewActionModal } from '../components/ReviewActionModal';

export const FraudPage: React.FC = () => {
  const [alerts, setAlerts] = useState<FraudAlertItem[]>([]);
  const [distribution, setDistribution] = useState<any[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<FraudAlertItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Live Simulator State
  const [simAmount, setSimAmount] = useState(1850);
  const [simHour, setSimHour] = useState(3);
  const [simVelocity, setSimVelocity] = useState(4);
  const [simRatio, setSimRatio] = useState(4.5);
  const [simIpRisk, setSimIpRisk] = useState(0.85);
  const [simIntl, setSimIntl] = useState(true);
  const [simCategory, setSimCategory] = useState('Electronics');
  const [simType, setSimType] = useState('ONLINE');
  const [simResult, setSimResult] = useState<FraudScoreResponse | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchAlertsAndDist = async () => {
    setIsLoading(true);
    try {
      const [alertsData, distData] = await Promise.all([
        api.getFraudAlerts(statusFilter),
        api.getFraudDistribution(),
      ]);
      setAlerts(alertsData);
      setDistribution(distData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertsAndDist();
  }, [statusFilter]);

  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await api.scoreTransaction({
        amount: Number(simAmount),
        hour: Number(simHour),
        velocity_1h: Number(simVelocity),
        amount_to_avg_ratio: Number(simRatio),
        ip_risk_score: Number(simIpRisk),
        is_international: simIntl,
        merchant_category: simCategory,
        transaction_type: simType,
      });
      setSimResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            AI Fraud Detection & Investigation Queue
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Module B: XGBoost ensemble anomaly detection, real-time scoring API, and case triage workflow.
          </p>
        </div>

        <button
          onClick={fetchAlertsAndDist}
          className="px-3 py-1.5 rounded-xl bg-navy-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium transition flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Real-time Scoring Simulator Sandbox */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-500/10 border border-teal-500/20 rounded-lg text-teal-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Live Transaction Risk Scoring Simulator
                <span className="text-[10px] font-mono font-normal bg-teal-500/10 text-teal-300 border border-teal-500/20 px-2 py-0.5 rounded-full">
                  Interactive ML API
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Adjust features to observe real-time probability shifts and local attribution waterfalls.
              </p>
            </div>
          </div>

          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-navy-950 font-bold text-xs transition flex items-center gap-1.5 shadow"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isSimulating ? 'Scoring...' : 'Score Live'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 font-medium block mb-1">
                Amount ($): <span className="text-white font-mono font-bold">${simAmount}</span>
              </label>
              <input
                type="range"
                min="5"
                max="5000"
                step="25"
                value={simAmount}
                onChange={(e) => setSimAmount(Number(e.target.value))}
                className="w-full accent-teal-400"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">
                Transaction Hour: <span className="text-white font-mono font-bold">{simHour}:00 hrs</span>
              </label>
              <input
                type="range"
                min="0"
                max="23"
                value={simHour}
                onChange={(e) => setSimHour(Number(e.target.value))}
                className="w-full accent-teal-400"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">
                1-Hour Velocity (Spike): <span className="text-white font-mono font-bold">{simVelocity} txns</span>
              </label>
              <input
                type="range"
                min="1"
                max="8"
                value={simVelocity}
                onChange={(e) => setSimVelocity(Number(e.target.value))}
                className="w-full accent-teal-400"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">
                Ratio to 30d Baseline: <span className="text-white font-mono font-bold">{simRatio}x</span>
              </label>
              <input
                type="range"
                min="0.2"
                max="10.0"
                step="0.2"
                value={simRatio}
                onChange={(e) => setSimRatio(Number(e.target.value))}
                className="w-full accent-teal-400"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">
                IP / Proxy Risk Score: <span className="text-white font-mono font-bold">{simIpRisk}</span>
              </label>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={simIpRisk}
                onChange={(e) => setSimIpRisk(Number(e.target.value))}
                className="w-full accent-teal-400"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Merchant Category</label>
              <select
                value={simCategory}
                onChange={(e) => setSimCategory(e.target.value)}
                className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
              >
                <option value="Groceries">Groceries (Low Base Risk)</option>
                <option value="Dining">Dining</option>
                <option value="Electronics">Electronics (High Anomaly)</option>
                <option value="Crypto/Gaming">Crypto/Gaming (High Anomaly)</option>
                <option value="Travel">Travel</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={simIntl}
                  onChange={(e) => setSimIntl(e.target.checked)}
                  className="rounded accent-teal-400"
                />
                <span>Cross-Border / International Card</span>
              </label>
            </div>
          </div>

          {/* Real-time Result Output */}
          <div className="lg:col-span-5 bg-navy-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            {simResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Ensemble ML Risk Score
                    </span>
                    <div className="text-3xl font-extrabold font-mono text-white mt-0.5">
                      {(simResult.risk_score * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <RiskBadge score={simResult.risk_score} />
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                      Threshold: {simResult.threshold_used}
                    </div>
                  </div>
                </div>

                <ExplainabilityWaterfall
                  factors={simResult.risk_factors}
                  title="Attribution Contributions"
                />
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500">Running model...</div>
            )}
          </div>
        </div>
      </div>

      {/* Risk Distribution Histogram */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-teal-400" />
              Portfolio Risk Score Distribution (Deciles)
            </h3>
            <p className="text-xs text-slate-400">
              Histogram of predicted fraud scores across all transactions in the ledger
            </p>
          </div>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distribution} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="range" stroke="#64748B" fontSize={10} />
              <YAxis stroke="#64748B" fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0B132B',
                  borderColor: '#1E293B',
                  borderRadius: '0.5rem',
                  fontSize: '11px',
                }}
                formatter={(v: any) => [`${v} transactions`, 'Volume']}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {distribution.map((entry, index) => {
                  const color =
                    index < 3 ? '#10B981' : index < 6 ? '#F59E0B' : '#EF4444';
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Suspicious Transactions Investigation Queue */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Suspicious Transactions Review Backlog
            </h3>
            <span className="text-slate-400 text-xs">
              Human-in-the-loop compliance review workflow for model-flagged events
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-navy-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-teal-500 font-mono"
            >
              <option value="ALL">All Cases</option>
              <option value="PENDING">Pending Review</option>
              <option value="CONFIRMED_FRAUD">Confirmed Fraud</option>
              <option value="FALSE_POSITIVE">False Positive</option>
              <option value="CLEARED">Cleared</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-navy-950/80 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-4">Ref & Account</th>
                <th className="py-3 px-4">Merchant</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">ML Risk Score</th>
                <th className="py-3 px-4">Review Status</th>
                <th className="py-3 px-4">Top Risk Drivers</th>
                <th className="py-3 px-4 text-right">Triage Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-sans">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-400" />
                    Fetching investigation alerts...
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-sans">
                    No transactions match the selected review status.
                  </td>
                </tr>
              ) : (
                alerts.map((alert) => (
                  <tr key={alert.review_id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{alert.transaction_reference}</div>
                      <div className="text-[10px] text-slate-500">{alert.account_id}</div>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <div className="font-medium text-slate-200 truncate max-w-[140px]">{alert.merchant_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{alert.merchant_category}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                      ${alert.amount.toFixed(2)} {alert.currency}
                    </td>
                    <td className="py-3 px-4">
                      <RiskBadge score={alert.risk_score} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={alert.review_status} />
                    </td>
                    <td className="py-3 px-4 font-sans max-w-[220px]">
                      {alert.risk_factors && alert.risk_factors.length > 0 ? (
                        <div className="truncate text-slate-300 text-[11px]" title={alert.risk_factors[0].description}>
                          • {alert.risk_factors[0].factor}: {alert.risk_factors[0].description}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px]">No factors</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        onClick={() => {
                          setSelectedAlert(alert);
                          setIsModalOpen(true);
                        }}
                        className="px-3 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold transition"
                      >
                        Triage Case
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Action Modal */}
      <ReviewActionModal
        alert={selectedAlert}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchAlertsAndDist}
      />
    </div>
  );
};
