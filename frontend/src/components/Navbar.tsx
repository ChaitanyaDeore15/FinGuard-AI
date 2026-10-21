import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, Bell, ChevronDown, Activity } from 'lucide-react';
import { UserRole } from '../types';

export const Navbar: React.FC = () => {
  const { user, role, switchDemoUser, logout } = useAuth();

  return (
    <header className="h-16 bg-navy-900/90 backdrop-blur border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Production Simulator Online</span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-navy-950/60 border border-slate-800 px-3 py-1 rounded-lg">
          <Activity className="w-3.5 h-3.5 text-teal-400" />
          <span>ML Core: <strong className="text-slate-200 font-mono">XGBoost v1.0</strong> (PR-AUC: 0.999)</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Role Quick Switcher (Mandatory for academic demo evaluation) */}
        <div className="flex items-center gap-1.5 bg-navy-950 border border-slate-800 p-1 rounded-xl text-xs">
          <span className="text-[11px] text-slate-400 px-2 font-medium">Demo Role:</span>
          {(['ADMIN', 'RISK_ANALYST', 'COMPLIANCE_OFFICER'] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => switchDemoUser(r)}
              className={`px-2.5 py-1 rounded-lg font-medium transition text-xs ${
                role === r
                  ? 'bg-teal-500 text-navy-950 font-semibold shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {r === 'ADMIN' ? 'Chief Risk Officer' : r === 'RISK_ANALYST' ? 'Fraud Analyst' : 'Auditor'}
            </button>
          ))}
        </div>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-navy-950 font-bold text-xs shadow-md">
            {user?.full_name ? user.full_name[0] : 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-200 leading-none">
              {user?.full_name || 'Staff User'}
            </div>
            <div className="text-[10px] text-teal-400 font-mono mt-0.5">
              {role}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
