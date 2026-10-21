import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  UserCheck,
  TrendingUp,
  AlertTriangle,
  Play,
  RefreshCw,
  Info,
  Scale,
  Award,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts';

import { api } from '../services/api';
import { CreditRiskAssessment, CreditPortfolioSummary } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { ExplainabilityWaterfall } from '../components/ExplainabilityWaterfall';

export const CreditRiskPage: React.FC = () => {
  const [assessments, setAssessments] = useState<CreditRiskAssessment[]>([]);
  const [portfolio, setPortfolio] = useState<CreditPortfolioSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Interactive Underwriting Simulator
  const [name, setName] = useState('Elena Rostova (Applicant)');
  const [limit, setLimit] = useState(60000);
  const [age, setAge] = useState(32);
  const [edu, setEdu] = useState('University');
  const [marriage, setMarriage] = useState('Married');
  const [pay0, setPay0] = useState(0); // -1 to 4
  const [bill, setBill] = useState(18000);
  const [payment, setPayment] = useState(9000);

  const [simResult, setSimResult] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const fetchCreditData = async () => {
    setIsLoading(true);
    try {
      const [assData, portData] = await Promise.all([
        api.getCreditAssessments(),
        api.getCreditPortfolioSummary(),
      ]);
      setAssessments(assData);
      setPortfolio(portData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCreditData();
  }, []);

  const runEvaluation = async () => {
    setIsEvaluating(true);
    try {
      const res = await api.assessCreditRisk({
        applicant_name: name,
        credit_limit: Number(limit),
        age: Number(age),
        education_level: edu,
        marital_status: marriage,
        repayment_status_recent: Number(pay0),
        repayment_history_sum: Number(pay0) * 2,
        avg_bill_amount: Number(bill),
        avg_payment_amount: Number(payment),
        utilization_ratio: Number((bill / Math.max(1, limit)).toFixed(3)),
      });
      setSimResult(res);
      fetchCreditData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  useEffect(() => {
    runEvaluation();
  }, []);

  const pieData = portfolio?.tiers.map((t) => ({
    name: `${t.tier} Risk`,
    value: t.count,
    color: t.tier === 'LOW' ? '#10B981' : t.tier === 'MEDIUM' ? '#F59E0B' : '#EF4444',
  })) || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Credit Risk Intelligence & Explainable Underwriting
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Module C: Probability of default forecasting, SHAP-aligned attribution, and retail credit risk modeling.
          </p>
        </div>

        <button
          onClick={fetchCreditData}
          className="px-3 py-1.5 rounded-xl bg-navy-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium transition flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Portfolio</span>
        </button>
      </div>

      {/* Simulator & Live Score Card */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Credit Application Risk Simulator
                <span className="text-[10px] font-mono font-normal bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                  UCI Benchmark Pipeline
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Simulate applicant characteristics to evaluate default probability and local feature contributions.
              </p>
            </div>
          </div>

          <button
            onClick={runEvaluation}
            disabled={isEvaluating}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs transition flex items-center gap-1.5 shadow"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isEvaluating ? 'Evaluating...' : 'Evaluate Application'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="text-slate-400 font-medium block mb-1">Applicant Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">
                Authorized Credit Limit: <span className="text-white font-mono font-bold">${limit.toLocaleString()}</span>
              </label>
              <input
                type="range"
                min="10000"
                max="300000"
                step="10000"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">
                Applicant Age: <span className="text-white font-mono font-bold">{age} yrs</span>
              </label>
              <input
                type="range"
                min="21"
                max="75"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">
                Recent Repayment Status (PAY_0)
              </label>
              <select
                value={pay0}
                onChange={(e) => setPay0(Number(e.target.value))}
                className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
              >
                <option value={-1}>-1: Paid Duly (Punctual On-Time)</option>
                <option value={0}>0: Revolving Credit (Minimum Paid)</option>
                <option value={1}>1: Payment Delayed 1 Month</option>
                <option value={2}>2: Payment Delayed 2 Months (Delinquency)</option>
                <option value={3}>3: Payment Delayed 3 Months</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Education Level</label>
              <select
                value={edu}
                onChange={(e) => setEdu(e.target.value)}
                className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
              >
                <option value="Graduate School">Graduate School (Master/PhD)</option>
                <option value="University">University (Bachelors)</option>
                <option value="High School">High School</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">
                Average Statement Balance ($): <span className="text-white font-mono font-bold">${bill.toLocaleString()}</span>
              </label>
              <input
                type="range"
                min="0"
                max={limit}
                step="1000"
                value={bill}
                onChange={(e) => setBill(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">
                Average Payment Made ($): <span className="text-white font-mono font-bold">${payment.toLocaleString()}</span>
              </label>
              <input
                type="range"
                min="0"
                max={bill}
                step="500"
                value={payment}
                onChange={(e) => setPayment(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>

          {/* Underwriting Result Card */}
          <div className="lg:col-span-5 bg-navy-950/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            {simResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Probability of Default (PD)
                    </span>
                    <div className="text-3xl font-black font-mono text-white mt-0.5">
                      {(simResult.probability_of_default * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Risk Tier
                    </span>
                    <RiskBadge tier={simResult.risk_tier} />
                    <div className="text-[11px] font-mono text-cyan-400 mt-1 font-bold">
                      Credit Score Est: ~{simResult.credit_score_equivalent}
                    </div>
                  </div>
                </div>

                <ExplainabilityWaterfall
                  factors={simResult.key_risk_drivers}
                  title="SHAP-Aligned Risk Drivers"
                />
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500">Evaluating credit risk...</div>
            )}
          </div>
        </div>
      </div>

      {/* Portfolio Overview & Past Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tier Distribution Pie */}
        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
            <Scale className="w-4 h-4 text-cyan-400" />
            Portfolio Exposure Tiers
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Aggregated default risk tiers across {portfolio?.total_applicants || 0} evaluated applicant files
          </p>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
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

          <div className="space-y-2 pt-3 border-t border-slate-800 text-xs">
            {portfolio?.tiers.map((t) => (
              <div key={t.tier} className="flex items-center justify-between font-mono">
                <span className="font-medium text-slate-300 font-sans">{t.tier} Risk Tier:</span>
                <span className="font-bold text-white">{t.count} ({t.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Historical Applications Table */}
        <div className="lg:col-span-2 bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-teal-400" />
                Underwriting Ledger History
              </h3>
              <p className="text-xs text-slate-400">Recent credit assessments recorded with explainability metadata</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="pb-2">Applicant</th>
                  <th className="pb-2">Limit</th>
                  <th className="pb-2">Utilization</th>
                  <th className="pb-2">Delay Status</th>
                  <th className="pb-2">Default Prob</th>
                  <th className="pb-2 text-right">Risk Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {assessments.slice(0, 8).map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-2.5 font-sans">
                      <div className="font-semibold text-slate-200">{a.applicant_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{a.applicant_reference}</div>
                    </td>
                    <td className="py-2.5 text-white">${a.credit_limit.toLocaleString()}</td>
                    <td className="py-2.5 text-slate-300">{(a.utilization_ratio * 100).toFixed(0)}%</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${
                        a.repayment_status_recent >= 2
                          ? 'bg-rose-500/10 text-rose-400'
                          : a.repayment_status_recent === 1
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {a.repayment_status_recent <= 0 ? 'Punctual (0)' : `Delay +${a.repayment_status_recent}mo`}
                      </span>
                    </td>
                    <td className="py-2.5 font-bold text-white">
                      {(a.probability_of_default * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 text-right font-sans">
                      <RiskBadge tier={a.risk_tier} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Fairness & Responsible AI Disclosure Notice */}
      <div className="bg-navy-950/80 border border-slate-800 rounded-2xl p-5 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
          <Info className="w-4 h-4" /> Responsible AI, Algorithmic Fairness & Model Governance Notice
        </div>
        <p>
          • <strong>Intended Use:</strong> This credit model is developed exclusively as an academic educational prototype based on the public UCI Default of Credit Card Clients Dataset.
        </p>
        <p>
          • <strong>Protected Characteristics:</strong> Demographic features such as age and marital status must never be used in production lending decisions to make unsupported discriminatory assumptions. Responsible underwriting relies strictly on documented credit capacity, verified income, debt-to-income (DTI), and punctual repayment track records.
        </p>
        <p>
          • <strong>Correlation vs. Causation:</strong> SHAP and feature contribution attributions reflect statistical associations in historical data, not causal proof of an applicant's future solvency.
        </p>
      </div>
    </div>
  );
};
