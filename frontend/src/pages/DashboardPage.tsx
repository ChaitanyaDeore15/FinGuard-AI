import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Receipt,
  ShieldAlert,
  AlertTriangle,
  CreditCard,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Cpu,
  CheckCircle,
  Clock,
  Layers
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

import { api } from '../services/api';
import { DashboardSummary, DailyTrend, CategorySpending } from '../types';
import { KPICard } from '../components/KPICard';
import { StatusBadge } from '../components/StatusBadge';
import { RiskBadge } from '../components/RiskBadge';

const TIER_COLORS: Record<string, string> = {
  LOW: '#10B981',
  MEDIUM: '#F59E0B',
  HIGH: '#EF4444',
};

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<DailyTrend[]>([]);
  const [categories, setCategories] = useState<CategorySpending[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sumData, trendData, catData] = await Promise.all([
        api.getDashboardSummary(),
        api.getDailyTrends(30),
        api.getCategorySpending(),
      ]);
      setSummary(sumData);
      setTrends(trendData);
      setCategories(catData);
    } catch (err: any) {
      setError(err.message || 'Failed to load executive dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-teal-400 mb-3" />
        <p className="text-sm">Synthesizing institutional risk metrics from database...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
        <h3 className="font-bold text-base mb-1">Failed to Load Dashboard</h3>
        <p className="text-xs">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 text-xs font-semibold hover:bg-rose-500/30"
        >
          Retry Ingestion
        </button>
      </div>
    );
  }

  const { kpis, credit_portfolio, recent_alerts, active_models } = summary;

  const creditPieData = [
    { name: 'Low Risk', value: credit_portfolio.low_risk_count, color: '#10B981' },
    { name: 'Medium Risk', value: credit_portfolio.medium_risk_count, color: '#F59E0B' },
    { name: 'High Risk', value: credit_portfolio.high_risk_count, color: '#EF4444' },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Executive Risk & Banking Overview
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time portfolio intelligence, automated ML fraud triage, and credit exposure metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboardData}
            className="p-2 rounded-xl bg-navy-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <Link
            to="/transactions"
            className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-navy-950 font-bold text-xs transition flex items-center gap-1.5 shadow"
          >
            <span>Ledger Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Ledger Volume"
          value={`$${kpis.total_volume.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtext={`Avg Ticket: $${kpis.avg_transaction_value.toFixed(2)}`}
          icon={DollarSign}
          variant="accent"
        />
        <KPICard
          title="Total Transactions"
          value={kpis.total_transactions.toLocaleString()}
          subtext="Spread across last 90 days"
          icon={Receipt}
          variant="default"
        />
        <KPICard
          title="Flagged Suspicious Rate"
          value={`${kpis.fraud_rate_pct.toFixed(2)}%`}
          subtext={`${kpis.flagged_transactions} anomalies identified by XGBoost`}
          icon={ShieldAlert}
          variant="danger"
        />
        <KPICard
          title="Review Backlog"
          value={kpis.pending_reviews}
          subtext={`${kpis.confirmed_fraud} Confirmed • ${kpis.false_positives} Cleared`}
          icon={AlertTriangle}
          variant="warning"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Transaction Volume & Risk Trend Chart */}
        <div className="lg:col-span-2 bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-400" />
                Transaction Volume & Anomaly Trends (30 Days)
              </h3>
              <p className="text-xs text-slate-400">Daily settlement flow alongside ML-flagged volume</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  stroke="#64748B"
                  fontSize={10}
                  tickFormatter={(val) => val.slice(5)}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={10}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B132B',
                    borderColor: '#1E293B',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    color: '#F8FAFC',
                  }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Volume']}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#14B8A6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#volGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Credit Risk Portfolio Spread */}
        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-cyan-400" />
                Credit Portfolio Exposure
              </h3>
              <Link to="/credit" className="text-xs text-teal-400 hover:underline">
                View All
              </Link>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Default risk distribution across {credit_portfolio.total_evaluated} evaluated credit profiles
            </p>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={creditPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {creditPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B132B',
                      borderColor: '#1E293B',
                      borderRadius: '0.5rem',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-center font-mono text-xs">
            <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
              <div className="text-[10px] text-emerald-400 font-sans">Low Risk</div>
              <div className="font-bold text-emerald-300">{credit_portfolio.low_risk_count}</div>
            </div>
            <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
              <div className="text-[10px] text-amber-400 font-sans">Medium Risk</div>
              <div className="font-bold text-amber-300">{credit_portfolio.medium_risk_count}</div>
            </div>
            <div className="bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
              <div className="text-[10px] text-rose-400 font-sans">High Risk</div>
              <div className="font-bold text-rose-300">{credit_portfolio.high_risk_count}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active AI Models & Recent High-Risk Flagged Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active ML Engines Status */}
        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-teal-400" />
              Active AI Risk Engines
            </h3>
            <Link to="/model-lab" className="text-xs text-teal-400 hover:underline">
              Model Lab
            </Link>
          </div>

          <div className="space-y-3.5">
            {/* Fraud Model Card */}
            <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">
                  {active_models.fraud_model.name}
                </span>
                <span className="text-[10px] font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  ONLINE
                </span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-400">
                <div>Version: <span className="text-slate-200">{active_models.fraud_model.version}</span></div>
                <div>PR-AUC: <span className="text-teal-400 font-bold">{active_models.fraud_model.pr_auc}</span></div>
                <div>Threshold: <span className="text-amber-400">{active_models.fraud_model.threshold}</span></div>
              </div>
            </div>

            {/* Credit Risk Model Card */}
            <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">
                  {active_models.credit_model.name}
                </span>
                <span className="text-[10px] font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  ONLINE
                </span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-400">
                <div>Version: <span className="text-slate-200">{active_models.credit_model.version}</span></div>
                <div>ROC-AUC: <span className="text-cyan-400 font-bold">{active_models.credit_model.roc_auc}</span></div>
                <div>PR-AUC: <span className="text-cyan-400 font-bold">{active_models.credit_model.pr_auc}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent High-Risk Alerts Feed */}
        <div className="lg:col-span-2 bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Live Anomaly Alert Stream
              </h3>
              <p className="text-xs text-slate-400">Latest transactions flagged by the fraud detection pipeline</p>
            </div>
            <Link to="/fraud" className="text-xs text-rose-400 hover:underline flex items-center gap-1">
              <span>Investigation Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-2 font-semibold">Reference</th>
                  <th className="pb-2 font-semibold">Merchant</th>
                  <th className="pb-2 font-semibold">Amount</th>
                  <th className="pb-2 font-semibold">Risk Score</th>
                  <th className="pb-2 font-semibold">Status</th>
                  <th className="pb-2 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {recent_alerts.map((alert) => (
                  <tr key={alert.review_id} className="hover:bg-slate-800/30 transition">
                    <td className="py-2.5 text-slate-300 font-semibold">{alert.transaction_reference}</td>
                    <td className="py-2.5 text-slate-300 font-sans truncate max-w-[140px]">{alert.merchant_name}</td>
                    <td className="py-2.5 text-white font-bold">
                      ${alert.amount.toFixed(2)} {alert.currency}
                    </td>
                    <td className="py-2.5">
                      <RiskBadge score={alert.risk_score} />
                    </td>
                    <td className="py-2.5">
                      <StatusBadge status={alert.review_status} />
                    </td>
                    <td className="py-2.5 text-right font-sans">
                      <Link
                        to="/fraud"
                        className="text-teal-400 hover:text-teal-300 text-xs font-semibold"
                      >
                        Investigate
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
