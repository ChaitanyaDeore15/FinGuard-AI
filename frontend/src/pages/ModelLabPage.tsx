import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Layers,
  Scale,
  Sliders,
  CheckCircle,
  HelpCircle,
  Activity,
  Award,
  Terminal,
  RefreshCw,
  GitCompare,
  TrendingUp,
  BarChart2,
  Info
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

import { api } from '../services/api';
import { ModelRegistryItem } from '../types';

export const ModelLabPage: React.FC = () => {
  const [models, setModels] = useState<ModelRegistryItem[]>([]);
  const [details, setDetails] = useState<any>(null);
  const [selectedDomain, setSelectedDomain] = useState<'FRAUD' | 'CREDIT'>('FRAUD');
  const [thresholdSim, setThresholdSim] = useState(0.65);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([api.getModels(), api.getEvaluationDetails()])
      .then(([mods, dets]) => {
        setModels(mods);
        setDetails(dets);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const activeFraud = models.find((m) => m.target_domain === 'FRAUD');
  const activeCredit = models.find((m) => m.target_domain === 'CREDIT');
  const currentModel = selectedDomain === 'FRAUD' ? activeFraud : activeCredit;
  const currentEval = selectedDomain === 'FRAUD' ? details?.fraud_model : details?.credit_model;

  if (isLoading || !currentModel) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-teal-400 mb-3" />
        <p className="text-sm">Loading ML Model Registry and Held-Out Test Evaluations...</p>
      </div>
    );
  }

  const cm = currentModel.confusion_matrix || { tn: 0, fp: 0, fn: 0, tp: 0 };
  const baseline = currentEval?.baseline_comparison;
  const prCurve = currentEval?.pr_curve || [];
  const rocCurve = currentEval?.roc_curve || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Model Lab, Calibration & Explainable AI
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Module E: Transparent benchmark evaluations, confusion matrices, ROC/PR curves, and feature importances.
          </p>
        </div>

        {/* Domain Switcher */}
        <div className="flex items-center gap-1.5 bg-navy-900 border border-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setSelectedDomain('FRAUD')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              selectedDomain === 'FRAUD'
                ? 'bg-teal-500 text-navy-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Fraud Detection Ensemble
          </button>
          <button
            onClick={() => setSelectedDomain('CREDIT')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              selectedDomain === 'CREDIT'
                ? 'bg-cyan-500 text-navy-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Credit Default Classifier
          </button>
        </div>
      </div>

      {/* Model Overview & Champion vs Baseline Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Card Metadata */}
        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider font-bold">
              Active Production Artifact
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              DEPLOYED
            </span>
          </div>

          <h2 className="text-lg font-bold text-white">{currentModel.model_name}</h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            {currentModel.model_type} • {currentModel.model_version}
          </p>

          <div className="mt-5 space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-navy-950/70 border border-slate-800">
              <span className="text-slate-400">Dataset Provenance:</span>
              <span className="font-semibold text-slate-200 truncate max-w-[170px]" title={currentModel.dataset_name}>
                {currentModel.dataset_name}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-navy-950/70 border border-slate-800 font-mono">
              <span className="text-slate-400">Total Benchmark Records:</span>
              <span className="font-bold text-white">{currentModel.dataset_records.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-navy-950/70 border border-slate-800 font-mono">
              <span className="text-slate-400">Data Partition Split:</span>
              <span className="text-slate-200">{currentModel.train_test_split} (Train / Val / Test)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-navy-950/70 border border-slate-800 font-mono">
              <span className="text-slate-400">Operating Decision Threshold:</span>
              <span className="text-amber-400 font-bold">{currentModel.optimal_threshold}</span>
            </div>
          </div>
        </div>

        {/* Evaluation Metrics Comparison Table */}
        <div className="lg:col-span-2 bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-teal-400" />
                Held-Out Test Set Performance Comparison
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Unseen Held-Out Test Set (15%)</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Direct comparison between the baseline linear model and the candidate tree-based booster.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                    <th className="pb-2.5">Model Architecture</th>
                    <th className="pb-2.5">PR-AUC</th>
                    <th className="pb-2.5">ROC-AUC</th>
                    <th className="pb-2.5">Precision</th>
                    <th className="pb-2.5">Recall</th>
                    <th className="pb-2.5 text-right">F1-Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {/* Baseline */}
                  {baseline && (
                    <tr className="hover:bg-slate-800/30 text-slate-400">
                      <td className="py-3 font-sans font-medium text-slate-300">
                        {baseline.model_name}
                      </td>
                      <td className="py-3">{baseline.pr_auc.toFixed(4)}</td>
                      <td className="py-3">{baseline.roc_auc.toFixed(4)}</td>
                      <td className="py-3">{baseline.precision.toFixed(4)}</td>
                      <td className="py-3">{baseline.recall.toFixed(4)}</td>
                      <td className="py-3 text-right font-bold text-slate-300">{baseline.f1.toFixed(4)}</td>
                    </tr>
                  )}

                  {/* Champion */}
                  <tr className="bg-teal-500/5 hover:bg-teal-500/10 text-white font-bold">
                    <td className="py-3 font-sans text-teal-300 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-teal-400" />
                      {currentModel.model_name}
                    </td>
                    <td className="py-3 text-teal-400">{currentModel.pr_auc.toFixed(4)}</td>
                    <td className="py-3 text-cyan-400">{currentModel.roc_auc.toFixed(4)}</td>
                    <td className="py-3">{currentModel.precision.toFixed(4)}</td>
                    <td className="py-3">{currentModel.recall.toFixed(4)}</td>
                    <td className="py-3 text-right text-emerald-400">{currentModel.f1_score.toFixed(4)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-navy-950/70 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <span>
              <strong>Methodology Note:</strong> Accuracy is intentionally excluded from decision metrics because
              severe class imbalance renders 99.8% baseline accuracy deceptive. Model deployment is governed strictly by
              Precision-Recall AUC (PR-AUC) and F1-score optimization.
            </span>
          </div>
        </div>
      </div>

      {/* Confusion Matrix Visualizer & Global Feature Importances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix Interactive Visualizer */}
        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-400" />
              Held-Out Test Set Confusion Matrix
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              N = {cm.tn + cm.fp + cm.fn + cm.tp} Test Samples
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-6">
            Visualizing True Negatives, False Positives (Type I), False Negatives (Type II), and True Positives.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-center font-mono">
            {/* True Negative */}
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-[11px] font-sans text-emerald-400 font-semibold uppercase">
                True Negatives (TN)
              </div>
              <div className="text-3xl font-black text-white mt-1">{cm.tn.toLocaleString()}</div>
              <div className="text-[10px] text-slate-400 mt-1 font-sans">Correctly Approved Normal</div>
            </div>

            {/* False Positive */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="text-[11px] font-sans text-amber-400 font-semibold uppercase">
                False Positives (FP)
              </div>
              <div className="text-3xl font-black text-amber-300 mt-1">{cm.fp.toLocaleString()}</div>
              <div className="text-[10px] text-slate-400 mt-1 font-sans">Type I Error (False Alarm)</div>
            </div>

            {/* False Negative */}
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <div className="text-[11px] font-sans text-rose-400 font-semibold uppercase">
                False Negatives (FN)
              </div>
              <div className="text-3xl font-black text-rose-400 mt-1">{cm.fn.toLocaleString()}</div>
              <div className="text-[10px] text-slate-400 mt-1 font-sans">Type II Error (Missed Risk)</div>
            </div>

            {/* True Positive */}
            <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20">
              <div className="text-[11px] font-sans text-teal-400 font-semibold uppercase">
                True Positives (TP)
              </div>
              <div className="text-3xl font-black text-teal-300 mt-1">{cm.tp.toLocaleString()}</div>
              <div className="text-[10px] text-slate-400 mt-1 font-sans">Correctly Intercepted</div>
            </div>
          </div>
        </div>

        {/* Global Feature Importances Chart */}
        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              Global Feature Importance Ranking
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Gain / Gini Weight</span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Relative contribution of each predictor feature in split decision boundary calculations.
          </p>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {currentModel.feature_importances.map((item, idx) => {
              const maxImp = currentModel.feature_importances[0]?.importance || 1.0;
              const pct = (item.importance / maxImp) * 100;

              return (
                <div key={item.feature} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-200">
                      {idx + 1}. {item.feature}
                    </span>
                    <span className="font-mono text-teal-400 font-semibold">
                      {(item.importance * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reproducibility & Code Verification Terminal */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Terminal className="w-4 h-4 text-teal-400" />
          <h3 className="text-sm font-bold text-white">
            Reproducibility & Automated Pipeline Verification Commands
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          To independently regenerate these exact metrics and models from the command line, run:
        </p>

        <div className="bg-navy-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-2 overflow-x-auto">
          <div><span className="text-teal-400"># 1. Train and evaluate fraud detection champion pipeline</span></div>
          <div className="text-slate-100">python -m app.ml.train_fraud</div>
          <div className="pt-2"><span className="text-teal-400"># 2. Train and evaluate credit risk underwriting pipeline</span></div>
          <div className="text-slate-100">python -m app.ml.train_credit</div>
          <div className="pt-2"><span className="text-teal-400"># 3. Execute automated test suite across models and APIs</span></div>
          <div className="text-slate-100">pytest -v tests</div>
        </div>
      </div>
    </div>
  );
};
