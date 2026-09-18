import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatPercent } from '../utils/currency';
import {
  FileText,
  Printer,
  Download,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Calendar,
  Building2,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const {
    metrics,
    monthlyMetrics,
    expenseCategories,
    insights,
    currency,
    user,
    transactions,
    exportCSV,
  } = useApp();

  const [activeReportTab, setActiveReportTab] = useState<'pnl' | 'transactions' | 'expenses' | 'cashflow' | 'insights'>('pnl');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto print:p-0 print:max-w-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            Financial Reports & Automated Insights
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Executive P&L statements, cost driver allocations, and rule-based diagnostic alerts for{' '}
            <strong className="text-slate-800">{user?.businessName || 'Your Business'}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF Report</span>
          </button>
        </div>
      </div>

      {/* Print-only Header Banner */}
      <div className="hidden print:block border-b border-slate-300 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-950">BizGuard Executive Financial Statement</h1>
            <p className="text-xs text-slate-600 mt-1">
              Entity: {user?.businessName} | Prepared for: {user?.fullName} ({user?.industry})
            </p>
          </div>
          <div className="text-right text-xs text-slate-500 font-mono">
            Generated: {new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}
          </div>
        </div>
      </div>

      {/* Report Tabs (hidden in print) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto print:hidden">
        {[
          { id: 'pnl', label: 'Monthly P&L Statement' },
          { id: 'transactions', label: `Transaction Ledger (${transactions.length})` },
          { id: 'expenses', label: 'Expense Category Breakdown' },
          { id: 'cashflow', label: 'Cash Flow Summary' },
          { id: 'insights', label: `Automated Insights (${insights.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReportTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeReportTab === tab.id
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Monthly P&L Statement */}
      {(activeReportTab === 'pnl' || (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('print').matches)) && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs print:border-none print:shadow-none">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Profit & Loss (P&L) Statement</h3>
              <p className="text-xs text-slate-500">Chronological monthly breakdown of revenue, expenses, and net profit</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 print:hidden">
              Cumulative Profit: {formatCurrency(metrics.netProfit, currency, { showSign: true })}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4 text-right">Revenue</th>
                  <th className="py-3 px-4 text-right">Expenses</th>
                  <th className="py-3 px-4 text-right">Net Profit</th>
                  <th className="py-3 px-4 text-right">Profit Margin</th>
                  <th className="py-3 px-4 text-right">Revenue Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {monthlyMetrics.map((m) => (
                  <tr key={m.monthKey} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-semibold text-slate-800">{m.displayMonth}</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-700">
                      {formatCurrency(m.revenue, currency)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-red-600">
                      {formatCurrency(m.expenses, currency)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span className={m.netProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}>
                        {formatCurrency(m.netProfit, currency, { showSign: true })}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {typeof m.profitMargin === 'number'
                        ? `${m.profitMargin.toFixed(1)}%`
                        : m.revenue > 0
                        ? `${((m.netProfit / m.revenue) * 100).toFixed(1)}%`
                        : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {m.revenueGrowthPct != null ? formatPercent(m.revenueGrowthPct) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-bold text-xs">
                <tr>
                  <td className="py-3 px-4 uppercase tracking-wider text-slate-700">Total Period Summary</td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-800 font-extrabold">
                    {formatCurrency(metrics.totalRevenue, currency)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-red-700 font-extrabold">
                    {formatCurrency(metrics.totalExpenses, currency)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-950 font-black">
                    {formatCurrency(metrics.netProfit, currency, { showSign: true })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-800 font-bold">
                    {typeof metrics.profitMargin === 'number' ? `${metrics.profitMargin.toFixed(1)}%` : '—'}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400">—</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Transaction Ledger Report */}
      {(activeReportTab === 'transactions' || (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('print').matches)) && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs print:border-none print:shadow-none print:mt-6">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">Financial Report: Transaction Ledger</h3>
              <p className="text-xs text-slate-500">
                Detailed transaction statement with recorded transaction dates from the database
              </p>
            </div>
            <div className="flex items-center gap-2 print:hidden">
              <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                {transactions.length} Total Records
              </span>
              <button
                onClick={exportCSV}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No transaction records found. Add transactions to generate report.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const isRev = tx.type === 'revenue';
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                          {tx.id}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                          {tx.date}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isRev
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {isRev ? 'Revenue' : 'Expense'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {tx.title || tx.category}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {tx.category}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold">
                          <span className={isRev ? 'text-emerald-700' : 'text-red-600'}>
                            {isRev ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                          {tx.description}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Expense Category Breakdown */}
      {activeReportTab === 'expenses' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Cost Structure & Expense Allocation</h3>
            <p className="text-xs text-slate-500">Breakdown of operational outflows by category</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Expense Category</th>
                  <th className="py-3 px-4 text-right">Total Outflow</th>
                  <th className="py-3 px-4 text-right">% of Total Spending</th>
                  <th className="py-3 px-4 text-right">Monthly Average</th>
                  <th className="py-3 px-4 text-center">Cost Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {expenseCategories.map((cat) => (
                  <tr key={cat.category} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-semibold text-slate-800 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span>{cat.category}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(cat.amount, currency)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-700">
                      {(cat.percentage ?? 0).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {formatCurrency(
                        monthlyMetrics.length > 0 ? cat.amount / monthlyMetrics.length : cat.amount,
                        currency
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="w-24 mx-auto bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Cash Flow Summary */}
      {activeReportTab === 'cashflow' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Statement of Cash Flows</h3>
            <p className="text-xs text-slate-500">Summary of liquid capital movements and ending cash position</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Starting Cash Pool</span>
              <p className="text-xl font-black font-mono text-slate-900 mt-1">
                {formatCurrency(metrics.currentCash - metrics.netProfit, currency)}
              </p>
              <span className="text-[10px] text-slate-400">Baseline initial reserve</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-emerald-50/60">
              <span className="text-[11px] font-bold text-emerald-800 uppercase">Total Cash Inflows</span>
              <p className="text-xl font-black font-mono text-emerald-700 mt-1">
                +{formatCurrency(metrics.totalRevenue, currency)}
              </p>
              <span className="text-[10px] text-slate-500">Customer payments & receipts</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-red-50/60">
              <span className="text-[11px] font-bold text-red-800 uppercase">Total Cash Outflows</span>
              <p className="text-xl font-black font-mono text-red-600 mt-1">
                -{formatCurrency(metrics.totalExpenses, currency)}
              </p>
              <span className="text-[10px] text-slate-500">Salaries, leases, vendor dues</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-blue-50/60">
              <span className="text-[11px] font-bold text-blue-800 uppercase">Current Cash Balance</span>
              <p className="text-xl font-black font-mono text-blue-700 mt-1">
                {formatCurrency(metrics.currentCash, currency)}
              </p>
              <span className="text-[10px] text-slate-500">Net available liquidity</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Automated Rule-Based Insights */}
      {activeReportTab === 'insights' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Rule-Based Financial Intelligence</h3>
              <p className="text-xs text-slate-500">
                Actionable patterns dynamically synthesized from your transaction ledger
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {insights.length} active insights generated
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((ins, idx) => {
              const isWarning = ins.toLowerCase().includes('warning') || ins.toLowerCase().includes('run out') || ins.toLowerCase().includes('faster');
              const isSuccess = ins.toLowerCase().includes('increased') || ins.toLowerCase().includes('best') || ins.toLowerCase().includes('profit');

              const bg = isWarning
                ? 'bg-amber-50/80 border-amber-200'
                : isSuccess
                ? 'bg-emerald-50/80 border-emerald-200'
                : 'bg-blue-50/80 border-blue-200';

              const Icon = isWarning ? AlertTriangle : isSuccess ? CheckCircle2 : Lightbulb;
              const iconColor = isWarning
                ? 'text-amber-600'
                : isSuccess
                ? 'text-emerald-600'
                : 'text-blue-600';

              return (
                <div key={idx} className={`p-5 rounded-2xl border ${bg} shadow-xs flex items-start gap-3`}>
                  <div className={`shrink-0 ${iconColor} mt-0.5`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                      {isWarning ? 'Financial Alert' : isSuccess ? 'Performance Highlight' : 'Operational Pattern'}
                    </h4>
                    <p className="text-xs font-semibold text-slate-800 mt-1 leading-relaxed">
                      {ins}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
