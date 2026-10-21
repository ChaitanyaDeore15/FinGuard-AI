import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ReceiptText,
  DollarSign,
  ShieldAlert,
  BarChart2,
  PieChart as PieIcon
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

import { api } from '../services/api';
import { Transaction, TransactionKPIs, CategorySpending, MerchantSpending } from '../types';
import { KPICard } from '../components/KPICard';
import { StatusBadge } from '../components/StatusBadge';
import { RiskBadge } from '../components/RiskBadge';
import { CSVImportModal } from '../components/CSVImportModal';

const CATEGORY_COLORS = [
  '#14B8A6', '#0EA5E9', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#10B981', '#6366F1'
];

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [kpis, setKpis] = useState<TransactionKPIs | null>(null);
  const [categories, setCategories] = useState<CategorySpending[]>([]);
  const [topMerchants, setTopMerchants] = useState<MerchantSpending[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [transactionType, setTransactionType] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [riskLevel, setRiskLevel] = useState('ALL');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await api.getTransactions({
        page,
        page_size: pageSize,
        search,
        category,
        transaction_type: transactionType,
        status,
        risk_level: riskLevel,
        sort_by: sortBy,
        sort_dir: sortDir,
      });
      setTransactions(data.items);
      setTotal(data.total);
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const [kpiData, catData, merchData] = await Promise.all([
        api.getTransactionKPIs(),
        api.getCategorySpending(),
        api.getTopMerchants(8),
      ]);
      setKpis(kpiData);
      setCategories(catData);
      setTopMerchants(merchData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [page, pageSize, category, transactionType, status, riskLevel, sortBy, sortDir]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const toggleSort = (col: string) => {
    if (sortBy === col) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(col);
      setSortDir('desc');
    }
  };

  const handleExportCSV = () => {
    const url = api.getExportCSVUrl({
      category,
      transaction_type: transactionType,
      status,
    });
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Institutional Transaction Ledger & Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Module A: Database-backed ingestion, multi-dimensional query filters, and volume analytics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-navy-950 font-bold text-xs transition flex items-center gap-1.5 shadow"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-navy-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Row */}
      {kpis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Transaction Volume"
            value={`$${kpis.total_volume.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            subtext="Calculated across entire database"
            icon={DollarSign}
            variant="accent"
          />
          <KPICard
            title="Total Ingested Records"
            value={kpis.total_count.toLocaleString()}
            subtext="Unique transaction references"
            icon={ReceiptText}
            variant="default"
          />
          <KPICard
            title="Average Ticket Size"
            value={`$${kpis.avg_transaction_value.toFixed(2)}`}
            subtext="Mean transaction amount"
            icon={BarChart2}
            variant="warning"
          />
          <KPICard
            title="Flagged Volume"
            value={`$${kpis.flagged_volume.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            subtext={`${kpis.flagged_rate_pct.toFixed(2)}% of transaction count`}
            icon={ShieldAlert}
            variant="danger"
          />
        </div>
      )}

      {/* Visual Analytics Charts: Category Spending & Top Merchants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category Chart */}
        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-teal-400" />
              Volume by Merchant Category
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Aggregated DB Queries</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <XAxis
                  dataKey="category"
                  stroke="#64748B"
                  fontSize={10}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
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
                  }}
                  formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Volume']}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Merchants Spending */}
        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              Top Merchant Settlement Volume
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Ranked by Total Value</span>
          </div>
          <div className="space-y-2.5 overflow-y-auto max-h-60 pr-1">
            {topMerchants.map((m, idx) => (
              <div
                key={m.merchant_name}
                className="flex items-center justify-between p-2 rounded-xl bg-navy-950/60 border border-slate-800/80 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 text-center font-mono text-slate-500 font-bold text-[11px]">
                    #{idx + 1}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-200 block truncate max-w-[200px]">
                      {m.merchant_name}
                    </span>
                    <span className="text-[10px] text-slate-500">{m.merchant_category}</span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-white">
                    ${m.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-slate-500">{m.transaction_count} txns</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter and Search Control Bar */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by transaction reference, account ID, or merchant name..."
              className="w-full bg-navy-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
          >
            Apply Search
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/60 text-xs">
          {/* Category Filter */}
          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="w-full bg-navy-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Categories</option>
              <option value="Groceries">Groceries</option>
              <option value="Dining">Dining</option>
              <option value="Utilities">Utilities</option>
              <option value="Electronics">Electronics</option>
              <option value="Travel">Travel</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Crypto/Gaming">Crypto/Gaming</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
              Payment Type
            </label>
            <select
              value={transactionType}
              onChange={(e) => { setTransactionType(e.target.value); setPage(1); }}
              className="w-full bg-navy-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Types</option>
              <option value="POS">POS (Point of Sale)</option>
              <option value="ONLINE">Online Card Purchase</option>
              <option value="MOBILE_PAYMENT">Mobile Payment</option>
              <option value="ATM_WITHDRAWAL">ATM Withdrawal</option>
              <option value="WIRE_TRANSFER">Wire Transfer</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full bg-navy-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="FLAGGED">Flagged Suspicious</option>
              <option value="DECLINED">Declined / Blocked</option>
            </select>
          </div>

          {/* Risk Level Filter */}
          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
              AI Risk Tier
            </label>
            <select
              value={riskLevel}
              onChange={(e) => { setRiskLevel(e.target.value); setPage(1); }}
              className="w-full bg-navy-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">Low Risk (&lt; 30%)</option>
              <option value="MEDIUM">Medium Risk (30-70%)</option>
              <option value="HIGH">High Risk (&gt; 70%)</option>
              <option value="FLAGGED">Flagged by Threshold</option>
            </select>
          </div>
        </div>
      </div>

      {/* Interactive Transaction Ledger Table */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">
            Showing {transactions.length} of {total.toLocaleString()} transactions
          </span>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="bg-navy-950 border border-slate-700 rounded px-2 py-1 text-slate-200"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-navy-950/80 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <th
                  onClick={() => toggleSort('timestamp')}
                  className="py-3 px-4 cursor-pointer hover:text-white transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Date / Time</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Account</th>
                <th className="py-3 px-4">Merchant & Category</th>
                <th className="py-3 px-4">Type</th>
                <th
                  onClick={() => toggleSort('amount')}
                  className="py-3 px-4 cursor-pointer hover:text-white transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Amount</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">ML Risk Score</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 font-sans">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-400" />
                    Querying transaction records...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-sans">
                    No transactions match the selected filter parameters.
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(txn.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200">
                      {txn.transaction_reference}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{txn.account_id}</td>
                    <td className="py-3 px-4 font-sans">
                      <span className="font-medium text-slate-200 block truncate max-w-[150px]">
                        {txn.merchant_name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {txn.merchant_category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {txn.transaction_type}
                    </td>
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                      ${txn.amount.toFixed(2)} <span className="text-[10px] text-slate-400">{txn.currency}</span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={txn.status} />
                    </td>
                    <td className="py-3 px-4">
                      {txn.fraud_risk_score !== undefined ? (
                        <RiskBadge score={txn.fraud_risk_score} />
                      ) : (
                        <span className="text-slate-500">Unscored</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <Link
                        to={`/transactions/${txn.id}`}
                        className="text-teal-400 hover:text-teal-300 font-semibold"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-800 bg-navy-950/60 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-700 bg-navy-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-700 bg-navy-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          fetchTransactions();
          fetchAnalytics();
        }}
      />
    </div>
  );
};
