import React, { useState, useEffect } from 'react';
import { History, Shield, RefreshCw, Filter, Search, Clock, User, Terminal } from 'lucide-react';
import { api } from '../services/api';
import { AuditLogItem } from '../types';

export const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [actionFilter, setActionFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAuditLogs(actionFilter || undefined);
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Security Audit Trail & Regulatory Compliance Log
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable system audit logs tracking user authentications, model evaluations, and compliance triage actions.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="px-3 py-1.5 rounded-xl bg-navy-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium transition flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-semibold text-slate-300">Filter Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-navy-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
          >
            <option value="">All Action Types</option>
            <option value="USER_LOGIN">USER_LOGIN</option>
            <option value="IMPORT_TRANSACTIONS_CSV">IMPORT_TRANSACTIONS_CSV</option>
            <option value="UPDATE_FRAUD_REVIEW">UPDATE_FRAUD_REVIEW</option>
            <option value="CREDIT_RISK_ASSESSMENT">CREDIT_RISK_ASSESSMENT</option>
            <option value="SYSTEM_INITIALIZATION">SYSTEM_INITIALIZATION</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Total Logged Events: <span className="text-white font-bold">{logs.length}</span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 bg-navy-950/80 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Actor / Email</th>
                <th className="py-3 px-4">Resource Target</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Audit Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-sans">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-400" />
                    Querying audit records...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-sans">
                    No audit records found matching this filter.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-sans">
                      {log.user_email || 'System / Batch'}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="text-slate-500 font-normal">[{log.resource_type}]</span> {log.resource_id || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{log.ip_address}</td>
                    <td className="py-3 px-4 text-slate-300 font-sans max-w-sm truncate" title={log.details || ''}>
                      {log.details || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
