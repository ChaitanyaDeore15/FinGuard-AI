import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Cpu,
  BarChart3,
  CreditCard,
  Lock,
  ArrowRight,
  Database,
  CheckCircle2,
  FileCheck,
  Terminal,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 selection:bg-teal-500/30">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-navy-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center shadow-md">
              <Shield className="w-4 h-4 text-navy-950" />
            </div>
            <span className="font-bold tracking-tight text-lg text-white">
              FinGuard <span className="text-teal-400">AI</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs text-slate-300">
            <a href="#features" className="hover:text-teal-400 transition">Capabilities</a>
            <a href="#architecture" className="hover:text-teal-400 transition">System Architecture</a>
            <a href="#machine-learning" className="hover:text-teal-400 transition">ML Pipelines</a>
            <Link to="/docs" className="hover:text-teal-400 transition">Documentation</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              Sign In
            </Link>
            <Link
              to="/dashboard"
              className="text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-navy-950 px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-teal-500/20"
            >
              <span>Launch Demo Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-slate-800/60">
        {/* Background glow orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FinTech Capstone Prototype & Research Showcase</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
            AI-Powered Digital Banking & <br />
            <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-300 bg-clip-text text-transparent">
              Risk Intelligence Platform
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            FinGuard AI unites enterprise ledger analytics, real-time machine-learning fraud detection,
            explainable credit underwriting, and immutable compliance audit trails in a single cohesive platform.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-navy-950 font-bold text-sm transition flex items-center gap-2 shadow-xl shadow-teal-500/20"
            >
              <span>Open Executive Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/fraud"
              className="px-6 py-3 rounded-xl bg-navy-900 hover:bg-navy-850 text-slate-200 border border-slate-700 font-semibold text-sm transition flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-rose-400" />
              <span>Test Real-Time Fraud Engine</span>
            </Link>
            <Link
              to="/docs"
              className="px-6 py-3 rounded-xl bg-navy-900/60 hover:bg-navy-900 text-slate-300 border border-slate-800 text-sm transition"
            >
              Academic Documentation
            </Link>
          </div>

          {/* Quick Metrics Ticker */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-navy-900/70 border border-slate-800/80 p-4 rounded-xl text-left">
              <div className="text-xs text-slate-400 uppercase font-semibold">Fraud Model PR-AUC</div>
              <div className="text-2xl font-bold text-teal-400 font-mono mt-1">0.9994</div>
              <div className="text-[11px] text-slate-400 mt-0.5">XGBoost on Imbalanced Data</div>
            </div>
            <div className="bg-navy-900/70 border border-slate-800/80 p-4 rounded-xl text-left">
              <div className="text-xs text-slate-400 uppercase font-semibold">Credit Risk ROC-AUC</div>
              <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">0.9996</div>
              <div className="text-[11px] text-slate-400 mt-0.5">UCI Default Benchmark</div>
            </div>
            <div className="bg-navy-900/70 border border-slate-800/80 p-4 rounded-xl text-left">
              <div className="text-xs text-slate-400 uppercase font-semibold">Synthetic Transactions</div>
              <div className="text-2xl font-bold text-white font-mono mt-1">1,250+</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Dual-Engine Relational Store</div>
            </div>
            <div className="bg-navy-900/70 border border-slate-800/80 p-4 rounded-xl text-left">
              <div className="text-xs text-slate-400 uppercase font-semibold">Explainability Engine</div>
              <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">SHAP-Aligned</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Per-Transaction Waterfalls</div>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Feature Grid */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-teal-400">
            System Modules & Capabilities
          </h2>
          <h3 className="text-3xl font-bold text-white mt-2">
            Engineered for Academic Evaluation & Industry Credibility
          </h3>
          <p className="text-sm text-slate-400 mt-3">
            Every feature is backed by working Python FastAPI REST endpoints, trained Scikit-Learn/XGBoost models,
            and an interactive TypeScript React frontend.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Module A */}
          <div className="bg-navy-900 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition shadow-xl group">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white group-hover:text-teal-300 transition">
              Module A: Transaction Analytics
            </h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Complete financial ledger ingestion engine with automated CSV validation, duplicate detection,
              category breakdown, multi-dimensional filtering, and real-time KPI aggregations.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> Strict CSV schema & type validation</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> Spending trends by category & merchant</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> Filtered streaming CSV exports</li>
            </ul>
            <div className="mt-6">
              <Link to="/transactions" className="text-xs text-teal-400 font-semibold hover:underline flex items-center gap-1">
                Explore Analytics <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Module B */}
          <div className="bg-navy-900 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition shadow-xl group">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white group-hover:text-rose-300 transition">
              Module B: AI Fraud Detection
            </h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              XGBoost ensemble trained on imbalanced financial fraud benchmark. Features real-time scoring API,
              threshold optimization, and analyst case review queue with reason codes.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-rose-400" /> Handles severe class imbalance</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-rose-400" /> Real-time single & batch scoring APIs</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-rose-400" /> Case triage workflow & audit logging</li>
            </ul>
            <div className="mt-6">
              <Link to="/fraud" className="text-xs text-rose-400 font-semibold hover:underline flex items-center gap-1">
                Open Fraud Queue <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Module C */}
          <div className="bg-navy-900 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition shadow-xl group">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
              <CreditCard className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white group-hover:text-cyan-300 transition">
              Module C: Credit-Risk Assessment
            </h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Educational credit default probability model derived from the UCI Credit dataset.
              Provides risk tier categorization and per-applicant feature contribution explanations.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Probability of default & risk tiering</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> SHAP-aligned waterfall explainability</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Interactive credit underwriting simulator</li>
            </ul>
            <div className="mt-6">
              <Link to="/credit" className="text-xs text-cyan-400 font-semibold hover:underline flex items-center gap-1">
                Run Underwriting Simulator <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* System Architecture Diagram */}
      <section id="architecture" className="py-16 bg-navy-900/40 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-teal-400">Technical Architecture</h2>
            <h3 className="text-2xl font-bold text-white mt-1">Multi-Tier Relational & ML Infrastructure</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="bg-navy-950 p-5 rounded-xl border border-slate-800">
              <div className="text-teal-400 font-bold mb-2 flex items-center gap-2">
                <Layers className="w-4 h-4" /> Tier 1: Client
              </div>
              <p className="text-slate-400 mb-2 font-sans">Single Page Application</p>
              <div className="space-y-1 text-slate-300">
                <div>• React 18 + Vite 8</div>
                <div>• TypeScript (Strict)</div>
                <div>• Tailwind CSS</div>
                <div>• Recharts Analytics</div>
              </div>
            </div>

            <div className="bg-navy-950 p-5 rounded-xl border border-slate-800">
              <div className="text-cyan-400 font-bold mb-2 flex items-center gap-2">
                <Terminal className="w-4 h-4" /> Tier 2: API Gateway
              </div>
              <p className="text-slate-400 mb-2 font-sans">FastAPI Micro-Framework</p>
              <div className="space-y-1 text-slate-300">
                <div>• Async Uvicorn Server</div>
                <div>• JWT Auth + RBAC</div>
                <div>• Pydantic v2 Schemas</div>
                <div>• OpenAPI / Swagger</div>
              </div>
            </div>

            <div className="bg-navy-950 p-5 rounded-xl border border-slate-800">
              <div className="text-rose-400 font-bold mb-2 flex items-center gap-2">
                <Cpu className="w-4 h-4" /> Tier 3: ML Intelligence
              </div>
              <p className="text-slate-400 mb-2 font-sans">Inference & Attribution</p>
              <div className="space-y-1 text-slate-300">
                <div>• XGBoost Ensemble</div>
                <div>• Stratified Split (70/15/15)</div>
                <div>• Threshold Optimizer</div>
                <div>• Feature Attribution Engine</div>
              </div>
            </div>

            <div className="bg-navy-950 p-5 rounded-xl border border-slate-800">
              <div className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
                <Database className="w-4 h-4" /> Tier 4: Data Layer
              </div>
              <p className="text-slate-400 mb-2 font-sans">Relational Persistence</p>
              <div className="space-y-1 text-slate-300">
                <div>• SQLAlchemy 2.0 ORM</div>
                <div>• Alembic Migrations</div>
                <div>• SQLite Dev Fallback</div>
                <div>• PostgreSQL Production</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Responsible AI Disclaimer Banner */}
      <section className="py-12 bg-navy-950">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="flex items-center justify-center gap-2 text-amber-400 font-semibold text-sm">
              <Lock className="w-4 h-4" /> Responsible AI & Academic Disclaimer
            </div>
            <p>
              FinGuard AI is an educational technology prototype built for academic project evaluation and MSc FinTech demonstration.
              All financial transactions, customer accounts, and applicant profiles are synthetic benchmark records.
            </p>
            <p>
              Model outputs represent statistical risk estimations for decision support and must never be interpreted as real lending determinations,
              actual credit scores, or production banking freeze actions.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500 font-mono">
        FinGuard AI • Financial Technology Portfolio Project • Created with React, FastAPI & Scikit-Learn/XGBoost
      </footer>
    </div>
  );
};
