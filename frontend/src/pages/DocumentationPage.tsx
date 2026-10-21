import React, { useState } from 'react';
import {
  BookOpen,
  Layers,
  Database,
  Cpu,
  Shield,
  FileCheck,
  Scale,
  ExternalLink,
  ChevronRight,
  Terminal,
  Code
} from 'lucide-react';

export const DocumentationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'database' | 'ml' | 'responsible_ai'>('architecture');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-3 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          FinGuard AI Engineering & Academic Documentation
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Comprehensive project report for academic viva, postgraduate admissions evaluation, and portfolio demonstration.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-1 text-xs">
        <button
          onClick={() => setActiveTab('architecture')}
          className={`px-3 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
            activeTab === 'architecture'
              ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>System Architecture</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`px-3 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
            activeTab === 'database'
              ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Database Schema & Data</span>
        </button>

        <button
          onClick={() => setActiveTab('ml')}
          className={`px-3 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
            activeTab === 'ml'
              ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Machine Learning Methodology</span>
        </button>

        <button
          onClick={() => setActiveTab('responsible_ai')}
          className={`px-3 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
            activeTab === 'responsible_ai'
              ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Responsible AI & Ethics</span>
        </button>
      </div>

      {/* Tab 1: System Architecture */}
      {activeTab === 'architecture' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-400" />
              End-to-End System Architecture
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              FinGuard AI is built following the clean layered architecture pattern for high reliability, testability,
              and maintainability. The platform decouples client presentation, REST routing, data access, and asynchronous ML inference.
            </p>

            <div className="bg-navy-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 space-y-2">
              <div className="text-teal-400 font-bold">[Presentation Tier - React & TypeScript SPA]</div>
              <div className="text-slate-400 pl-4">└── Recharts Data Visualizations, Tailwind CSS Navy Design Tokens, JWT Context Auth</div>
              <div className="text-cyan-400 font-bold mt-2">[API Gateway & Business Logic - FastAPI]</div>
              <div className="text-slate-400 pl-4">├── Dependency Injection (get_db, get_current_user, require_role)</div>
              <div className="text-slate-400 pl-4">├── Ingestion Services & CSV Sanitization Engines</div>
              <div className="text-slate-400 pl-4">└── Pydantic v2 Request/Response Data Validation</div>
              <div className="text-rose-400 font-bold mt-2">[Machine Learning Intelligence Engine - Scikit-Learn & XGBoost]</div>
              <div className="text-slate-400 pl-4">├── Stratified Train/Val/Test Split Pipeline</div>
              <div className="text-slate-400 pl-4">├── Operating Decision Threshold Optimizer</div>
              <div className="text-slate-400 pl-4">└── SHAP-Aligned Feature Attribution Vector Service</div>
              <div className="text-emerald-400 font-bold mt-2">[Persistence Layer - SQLAlchemy 2.0 & Alembic]</div>
              <div className="text-slate-400 pl-4">└── SQLite Local Zero-Config Engine / PostgreSQL Dual-Engine Compatibility</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Database Schema */}
      {activeTab === 'database' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-teal-400" />
              Relational Database Entities & Indexes
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              The data model is engineered to support financial transaction integrity, relational joins,
              and immutable security audit trails.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-navy-950 p-4 rounded-xl border border-slate-800">
                <span className="text-teal-400 font-bold block mb-1">`transactions` Table</span>
                <p className="text-slate-400 text-[11px] mb-2 font-sans">Core ledger of card and wire movements</p>
                <div className="text-slate-300 space-y-0.5 text-[11px]">
                  <div>• id: Integer (PK)</div>
                  <div>• transaction_reference: String(64) UNIQUE</div>
                  <div>• account_id: String(64) INDEXED</div>
                  <div>• amount: Float NOT NULL</div>
                  <div>• timestamp: DateTime INDEXED</div>
                  <div>• merchant_category: String(64) INDEXED</div>
                  <div>• status: Enum(COMPLETED, FLAGGED, DECLINED)</div>
                </div>
              </div>

              <div className="bg-navy-950 p-4 rounded-xl border border-slate-800">
                <span className="text-rose-400 font-bold block mb-1">`fraud_predictions` Table</span>
                <p className="text-slate-400 text-[11px] mb-2 font-sans">Real-time model inferences and attributions</p>
                <div className="text-slate-300 space-y-0.5 text-[11px]">
                  <div>• id: Integer (PK)</div>
                  <div>• transaction_id: FK &rarr; transactions.id</div>
                  <div>• risk_score: Float INDEXED</div>
                  <div>• is_flagged: Boolean INDEXED</div>
                  <div>• threshold_used: Float</div>
                  <div>• top_risk_factors: JSON Text</div>
                  <div>• model_version: String(64)</div>
                </div>
              </div>

              <div className="bg-navy-950 p-4 rounded-xl border border-slate-800">
                <span className="text-cyan-400 font-bold block mb-1">`credit_assessments` Table</span>
                <p className="text-slate-400 text-[11px] mb-2 font-sans">Retail loan and credit applicant evaluations</p>
                <div className="text-slate-300 space-y-0.5 text-[11px]">
                  <div>• id: Integer (PK)</div>
                  <div>• applicant_reference: String(64) UNIQUE</div>
                  <div>• probability_of_default: Float INDEXED</div>
                  <div>• risk_tier: Enum(LOW, MEDIUM, HIGH)</div>
                  <div>• credit_limit: Float</div>
                  <div>• utilization_ratio: Float</div>
                  <div>• key_risk_drivers: JSON Text</div>
                </div>
              </div>

              <div className="bg-navy-950 p-4 rounded-xl border border-slate-800">
                <span className="text-amber-400 font-bold block mb-1">`audit_logs` Table</span>
                <p className="text-slate-400 text-[11px] mb-2 font-sans">Append-only regulatory trail of actions</p>
                <div className="text-slate-300 space-y-0.5 text-[11px]">
                  <div>• id: Integer (PK)</div>
                  <div>• user_id: Integer (FK &rarr; users.id)</div>
                  <div>• action: String(64) INDEXED</div>
                  <div>• resource_type: String(64)</div>
                  <div>• details: Text</div>
                  <div>• timestamp: DateTime INDEXED</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Machine Learning Methodology */}
      {activeTab === 'ml' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-teal-400" />
              Machine Learning Pipeline & Evaluation Rigor
            </h3>
            
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-sans">
              <div>
                <strong className="text-white block mb-0.5">1. Severe Class Imbalance Mitigation</strong>
                Financial fraud datasets naturally feature severe skewness (~0.17% to 1.8% positive class).
                The pipeline calibrates XGBoost's <code className="text-teal-400 font-mono">scale_pos_weight</code> to balance the gradient steps
                between majority (legitimate) and minority (fraudulent) instances.
              </div>

              <div>
                <strong className="text-white block mb-0.5">2. Prevention of Data Leakage</strong>
                Dataset splits follow strict stratified 70% Train, 15% Validation, and 15% Held-Out Test partitions.
                All numerical scaling (<code className="text-teal-400 font-mono">StandardScaler</code>) and categorical encoders (<code className="text-teal-400 font-mono">OneHotEncoder</code>)
                are fitted strictly on the training partition and transformed across validation and testing.
              </div>

              <div>
                <strong className="text-white block mb-0.5">3. Metric Selection & Threshold Optimization</strong>
                Relying on standard accuracy in fraud detection is dangerous: a trivial predictor that labels every transaction as legitimate achieves 99% accuracy while missing 100% of fraud.
                FinGuard AI optimizes for <strong>Precision-Recall AUC (PR-AUC)</strong> and performs threshold tuning on the validation set to maximize operational F1-score.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Responsible AI */}
      {activeTab === 'responsible_ai' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-teal-400" />
              Responsible AI, Fairness & Financial Ethics Disclosures
            </h3>
            
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-4 rounded-xl bg-navy-950 border border-slate-800">
                <h4 className="font-bold text-white text-xs mb-1">Protected Characteristics in Credit Scoring</h4>
                <p>
                  Features such as applicant age or marital status in public research datasets (such as UCI Taiwan Credit)
                  must be treated with extreme caution. In production digital banking, algorithms must not discriminate against
                  protected classes under the Equal Credit Opportunity Act (ECOA) or European AI Act high-risk classification.
                  Underwriting models must prioritize demonstrated debt serviceability, verified income, and credit history over demographic proxies.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-navy-950 border border-slate-800">
                <h4 className="font-bold text-white text-xs mb-1">Human-in-the-Loop Decision Governance</h4>
                <p>
                  FinGuard AI strictly operates as a decision-support advisory system. Model risk scores inform analysts
                  in the review triage queue rather than executing autonomous transaction terminations or account closures.
                  Analysts must record reason codes and compliance notes, preserving accountability and procedural justice.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
