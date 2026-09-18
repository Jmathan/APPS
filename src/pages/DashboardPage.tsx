import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MetricCard } from '../components/common/MetricCard';
import { AlertBanner } from '../components/common/AlertBanner';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { formatCurrency, formatPercent } from '../utils/currency';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Percent,
  Hourglass,
  PlusCircle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const {
    metrics,
    monthlyMetrics,
    expenseCategories,
    alerts,
    currency,
    isDemoActive,
    loadDemoData,
    clearDemoData,
    navigateTo,
    user,
  } = useApp();

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  const hasData = metrics.transactionCount > 0;

  // Formatting for Recharts tooltips & axis
  const formatYAxis = (tick: number) => {
    return formatCurrency(tick, currency, { compact: true });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              Executive Dashboard
            </h1>
            {isDemoActive && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                Demo Café Data
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time financial solvency, cash burn tracking, and operational performance for{' '}
            <span className="font-semibold text-slate-800">{user?.businessName || 'Your Business'}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsTxModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm shadow-emerald-700/20 active:scale-[0.98] transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Real-time Alerts */}
      <AlertBanner alerts={alerts} />

      {/* 6 Dynamic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* 1. Total Revenue */}
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue, currency)}
          subValue={`${metrics.transactionCount} records`}
          icon={TrendingUp}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
          isPositive={true}
          tooltip="Sum of all recorded revenue inflows"
          onClick={() => navigateTo('/transactions')}
        />

        {/* 2. Total Expenses */}
        <MetricCard
          title="Total Expenses"
          value={formatCurrency(metrics.totalExpenses, currency)}
          subValue={
            metrics.totalRevenue > 0
              ? `${((metrics.totalExpenses / metrics.totalRevenue) * 100).toFixed(0)}% of revenue`
              : undefined
          }
          icon={TrendingDown}
          iconBg="bg-red-50"
          iconColor="text-red-700"
          isPositive={false}
          tooltip="Sum of all recorded operational outflows"
          onClick={() => navigateTo('/transactions')}
        />

        {/* 3. Net Profit */}
        <MetricCard
          title="Net Profit"
          value={formatCurrency(metrics.netProfit, currency, { showSign: true })}
          badge={metrics.netProfit >= 0 ? 'Surplus' : 'Deficit'}
          badgeColor={metrics.netProfit >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}
          icon={DollarSign}
          iconBg={metrics.netProfit >= 0 ? 'bg-emerald-50' : 'bg-red-50'}
          iconColor={metrics.netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}
          isPositive={metrics.netProfit >= 0}
          tooltip="Total Revenue minus Total Expenses"
          onClick={() => navigateTo('/analytics')}
        />

        {/* 4. Current Cash Balance */}
        <MetricCard
          title="Current Cash"
          value={formatCurrency(metrics.currentCash, currency)}
          subValue="Initial pool + net flow"
          icon={Wallet}
          iconBg="bg-blue-50"
          iconColor="text-blue-700"
          isPositive={metrics.currentCash > 0}
          tooltip="Liquid reserve available to cover obligations"
          onClick={() => navigateTo('/cash-runway')}
        />

        {/* 5. Profit Margin */}
        <MetricCard
          title="Profit Margin"
          value={typeof metrics.profitMargin === 'number' ? `${metrics.profitMargin.toFixed(1)}%` : 'N/A'}
          subValue={
            typeof metrics.profitMargin === 'number' && metrics.profitMargin > 15
              ? 'Healthy'
              : typeof metrics.profitMargin === 'number' && metrics.profitMargin < 0
              ? 'Negative'
              : 'Baseline'
          }
          icon={Percent}
          iconBg="bg-purple-50"
          iconColor="text-purple-700"
          isPositive={typeof metrics.profitMargin === 'number' ? metrics.profitMargin > 0 : null}
          tooltip="(Net Profit / Total Revenue) × 100"
          onClick={() => navigateTo('/analytics')}
        />

        {/* 6. Cash Runway */}
        <MetricCard
          title="Cash Runway"
          value={
            metrics.cashRunwayMonths !== null
              ? `${metrics.cashRunwayMonths} mo`
              : metrics.totalRevenue > 0
              ? 'Self-Sustaining'
              : 'N/A'
          }
          subValue={
            metrics.monthlyBurnRate > 0
              ? `Burn: ${formatCurrency(metrics.monthlyBurnRate, currency, { compact: true })}/mo`
              : 'Zero net cash burn'
          }
          badge={
            metrics.cashRunwayMonths !== null && metrics.cashRunwayMonths <= 3
              ? 'Critical'
              : metrics.cashRunwayMonths !== null && metrics.cashRunwayMonths <= 6
              ? 'Caution'
              : 'Safe'
          }
          badgeColor={
            metrics.cashRunwayMonths !== null && metrics.cashRunwayMonths <= 3
              ? 'bg-red-100 text-red-800'
              : metrics.cashRunwayMonths !== null && metrics.cashRunwayMonths <= 6
              ? 'bg-amber-100 text-amber-800'
              : 'bg-emerald-100 text-emerald-800'
          }
          icon={Hourglass}
          iconBg="bg-amber-50"
          iconColor="text-amber-700"
          isPositive={metrics.cashRunwayMonths === null || metrics.cashRunwayMonths >= 6}
          tooltip="Estimated months until cash reserve is exhausted at current burn rate"
          onClick={() => navigateTo('/cash-runway')}
        />
      </div>

      {/* If No Data Empty State */}
      {!hasData && (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
            <PlusCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Financial Records Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Add your first revenue or expense transaction, or load the Demo Café business profile to preview all charts and calculations.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => setIsTxModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl"
            >
              Add First Transaction
            </button>
            <button
              onClick={loadDemoData}
              className="px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200"
            >
              Load Demo Café
            </button>
          </div>
        </div>
      )}

      {/* Charts Section */}
      {hasData && (
        <div className="space-y-6">
          {/* Row 1: Monthly Revenue vs Expenses & Monthly Profit Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Monthly Revenue vs Expenses */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Monthly Revenue vs. Expenses</h3>
                  <p className="text-xs text-slate-500">Inflows compared with operational outflows</p>
                </div>
                <span className="text-xs font-semibold text-slate-400">Monthly</span>
              </div>

              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyMetrics} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="displayMonth"
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={formatYAxis}
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(val: any) => [formatCurrency(Number(val), currency), '']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="revenue" name="Revenue" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={32} />
                    <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Monthly Profit Trend */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Monthly Net Profit Trend</h3>
                  <p className="text-xs text-slate-500">Net operating surplus after all expenses</p>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Margin Trajectory
                </span>
              </div>

              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyMetrics} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="displayMonth"
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={formatYAxis}
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(val: any) => [formatCurrency(Number(val), currency), 'Net Profit']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="netProfit"
                      name="Net Profit"
                      stroke="#059669"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#profitGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Row 2: Expense Breakdown & Cash Flow Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 3: Expense Category Breakdown (1 col) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-900">Expense Distribution</h3>
                  <PieChartIcon className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500 mb-3">Where your business spends capital</p>

                <div className="h-48 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseCategories}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={2}
                      >
                        {expenseCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || '#64748B'} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any) => [formatCurrency(Number(val), currency), 'Amount']}
                        contentStyle={{ borderRadius: '10px', fontSize: '11px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 max-h-40 overflow-y-auto pr-1">
                {expenseCategories.slice(0, 5).map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="text-slate-600 truncate">{cat.category}</span>
                    </div>
                    <span className="font-mono font-semibold text-slate-900 shrink-0 ml-2">
                      {(cat.percentage ?? 0).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 4: Cumulative Cash Flow Trend (2 cols) */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Cumulative Cash Flow Trajectory</h3>
                  <p className="text-xs text-slate-500">Cumulative net cash generated over active months</p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-700">
                  Total: {formatCurrency(metrics.netProfit, currency, { showSign: true })}
                </span>
              </div>

              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyMetrics} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="cashFlowGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="displayMonth"
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={formatYAxis}
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(val: any) => [formatCurrency(Number(val), currency), 'Cumulative Cash']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="cumulativeCash"
                      name="Cumulative Cash"
                      stroke="#2563EB"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#cashFlowGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Chart 5: Revenue Growth % MoM */}
          {monthlyMetrics.length > 1 && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Month-Over-Month Revenue Growth</h3>
                  <p className="text-xs text-slate-500">Percentage expansion or contraction per monthly period</p>
                </div>
              </div>

              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyMetrics.filter((m) => m.revenueGrowthPct !== null)}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="displayMonth"
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(v) => `${v}%`}
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(val: any) => [
                        val != null && !isNaN(Number(val)) ? `${Number(val).toFixed(1)}%` : '—',
                        'Revenue Growth',
                      ]}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                    />
                    <Bar
                      dataKey="revenueGrowthPct"
                      name="Growth %"
                      fill="#3B82F6"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={28}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transaction Modal */}
      <TransactionModal isOpen={isTxModalOpen} onClose={() => setIsTxModalOpen(false)} />
    </div>
  );
};
