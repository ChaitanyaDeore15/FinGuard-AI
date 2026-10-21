import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('analyst@finguard.ai');
  const [password, setPassword] = useState('AnalystPassword123!');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login, switchDemoUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectDemoRole = async (r: 'ADMIN' | 'RISK_ANALYST' | 'COMPLIANCE_OFFICER') => {
    await switchDemoUser(r);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Shield className="w-5 h-5 text-navy-950" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              FinGuard <span className="text-teal-400">AI</span>
            </span>
          </Link>
          <p className="text-xs text-slate-400">Secure Digital Banking & Risk Analytics Portal</p>
        </div>

        {/* Login Box */}
        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-1">Institutional Sign In</h2>
          <p className="text-xs text-slate-400 mb-6">Enter your authorized banking staff credentials</p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="analyst@finguard.ai"
                  className="w-full bg-navy-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-navy-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-navy-950 font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 disabled:opacity-50"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In to Platform'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Role Cards */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
              One-Click Evaluation Credentials
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => selectDemoRole('RISK_ANALYST')}
                className="w-full p-2.5 rounded-xl bg-navy-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition text-left flex items-center justify-between text-xs group"
              >
                <div>
                  <div className="font-semibold text-slate-200 group-hover:text-teal-300">Marcus Vance</div>
                  <div className="text-[10px] text-teal-400">Senior Fraud Risk Analyst</div>
                </div>
                <span className="text-[11px] font-mono text-slate-400">analyst@finguard.ai</span>
              </button>

              <button
                type="button"
                onClick={() => selectDemoRole('ADMIN')}
                className="w-full p-2.5 rounded-xl bg-navy-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition text-left flex items-center justify-between text-xs group"
              >
                <div>
                  <div className="font-semibold text-slate-200 group-hover:text-teal-300">Sarah Chen</div>
                  <div className="text-[10px] text-cyan-400">Chief Risk Officer (Admin)</div>
                </div>
                <span className="text-[11px] font-mono text-slate-400">admin@finguard.ai</span>
              </button>

              <button
                type="button"
                onClick={() => selectDemoRole('COMPLIANCE_OFFICER')}
                className="w-full p-2.5 rounded-xl bg-navy-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition text-left flex items-center justify-between text-xs group"
              >
                <div>
                  <div className="font-semibold text-slate-200 group-hover:text-teal-300">Elena Rostova</div>
                  <div className="text-[10px] text-amber-400">Compliance & Audit Officer</div>
                </div>
                <span className="text-[11px] font-mono text-slate-400">auditor@finguard.ai</span>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-xs text-slate-400 hover:text-teal-400 transition">
            ← Return to Public Portfolio Showcase
          </Link>
        </div>
      </div>
    </div>
  );
};
