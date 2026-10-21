import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ReceiptText,
  ShieldAlert,
  CreditCard,
  Cpu,
  History,
  BookOpen,
  Shield,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { to: '/transactions', label: 'Transaction Analytics', icon: ReceiptText },
    { to: '/fraud', label: 'Fraud Detection & Queue', icon: ShieldAlert, badge: 'Live AI' },
    { to: '/credit', label: 'Credit Risk Assessment', icon: CreditCard },
    { to: '/model-lab', label: 'Model Lab & Explainability', icon: Cpu },
    { to: '/audit', label: 'Audit Trail & Compliance', icon: History },
    { to: '/docs', label: 'System Documentation', icon: BookOpen },
  ];

  return (
    <aside className="w-64 bg-navy-950 border-r border-slate-800/80 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand Logo */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Shield className="w-5 h-5 text-navy-950" />
          </div>
          <div>
            <div className="font-bold tracking-tight text-white flex items-center gap-1.5 text-base">
              FinGuard <span className="text-teal-400 text-xs px-1.5 py-0.5 rounded bg-teal-500/10 border border-teal-500/30">AI</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Digital Banking Intelligence</div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="px-3 py-6">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 mb-2">
            Banking Core & Risk
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition group ${
                      isActive
                        ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30 font-semibold shadow-inner'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-navy-900/60'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-teal-400 transition" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 font-mono">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="p-4 border-t border-slate-800/80">
        <NavLink
          to="/"
          className="flex items-center justify-between p-3 rounded-xl bg-navy-900/60 hover:bg-navy-900 border border-slate-800 text-xs text-slate-300 transition group"
        >
          <div className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
            <span className="font-medium">Public Showcase</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition" />
        </NavLink>

        <div className="mt-3 text-[10px] text-slate-400 text-center font-mono">
          Educational Portfolio Prototype<br />
          v1.0.0 • B.Tech Capstone Edition
        </div>
      </div>
    </aside>
  );
};
