import React from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatPercent } from '../utils/currency';
import {
  TrendingUp,
  TrendingDown,
  Percent,
  Calendar,
  Award,
  AlertTriangle,
  Scale,
  LineChart as LineChartIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { metrics, monthlyMetrics, expenseCategories, revenueCategories, currency, navigateTo } = useApp();

  const formatYAxis = (tick: number) => formatCurrency(tick, currency, { compact: true });

  // Calculate Best & Worst revenue months
  let bestMonth: { name: string; revenue: number } | null = null;
  let worstMonth: { name: string; revenue: number } | null = null;

  if (monthlyMetrics.length > 0) {
    const sortedByRev = [...monthlyMetrics].sort((a, b) => b.revenue - a.revenue);
    bestMonth = { name: sortedByRev[0].displayMonth, revenue: sortedByRev[0].revenue };
    worstMonth = {
      name: sortedByRev[sortedByRev.length - 1].displayMonth,
      revenue: sortedByRev[sortedByRev.length - 1].revenue,
    };
  }

  // Expense ratio
  const expenseRatio =
    metrics.totalRevenue > 0 ? (metrics.totalExpenses / metrics.totalRevenue) * 100 : null;

  // Latest month growth
  const latestMonth = monthlyMetrics.length > 1 ? monthlyMetrics[monthlyMetrics.length - 1] : null;

  const highestExpenseCategory = expenseCategories.length > 0 ? expenseCategories[0] : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
          Financial Data Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Deep diagnostic ratios, monthly growth trends, and category cost distributions calculated from your real entries.
        </p>
      </div>

      {/* Primary Analytics KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Profit Margin */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Net Margin</span>
            <Percent className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-mono font-black text-slate-900 mt-2">
            {typeof metrics.profitMargin === 'number' ? `${metrics.profitMargin.toFixed(1)}%` : 'N/A'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {typeof metrics.profitMargin === 'number' && metrics.profitMargin >= 20
              ? 'Strong operational efficiency'
              : 'Benchmark target: >15%'}
          </p>
        </div>

        {/* Expense Ratio */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Expense-to-Revenue</span>
            <Scale className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-mono font-black text-slate-900 mt-2">
            {typeof expenseRatio === 'number' ? `${expenseRatio.toFixed(1)}%` : 'N/A'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {typeof expenseRatio === 'number' && expenseRatio < 75
              ? 'Safe cost proportion'
              : 'Warning: High overhead share'}
          </p>
        </div>

        {/* MoM Revenue Growth */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>MoM Revenue Growth</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-mono font-black text-slate-900 mt-2">
            {latestMonth && latestMonth.revenueGrowthPct !== null
              ? formatPercent(latestMonth.revenueGrowthPct)
              : 'Baseline'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Latest period top-line momentum</p>
        </div>

        {/* MoM Expense Growth */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>MoM Expense Growth</span>
            <TrendingDown className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-mono font-black text-slate-900 mt-2">
            {latestMonth && latestMonth.expenseGrowthPct !== null
              ? formatPercent(latestMonth.expenseGrowthPct)
              : 'Baseline'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {latestMonth && latestMonth.expenseGrowthPct !== null && latestMonth.expenseGrowthPct > 20
              ? 'Rapid overhead surge'
              : 'Controlled operational costs'}
          </p>
        </div>
      </div>

      {/* Secondary Benchmark Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
          <span className="text-slate-500 font-medium">Avg Monthly Revenue</span>
          <p className="text-lg font-bold font-mono text-slate-900 mt-1">
            {formatCurrency(metrics.avgMonthlyRevenue, currency)}
          </p>
          <span className="text-[10px] text-slate-400">Across active recording periods</span>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
          <span className="text-slate-500 font-medium">Avg Monthly Expenses</span>
          <p className="text-lg font-bold font-mono text-slate-900 mt-1">
            {formatCurrency(metrics.avgMonthlyExpenses, currency)}
          </p>
          <span className="text-[10px] text-slate-400">Average operational cash outflow</span>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
          <span className="text-slate-500 font-medium">Top Cost Driver</span>
          <p className="text-lg font-bold font-mono text-slate-900 mt-1 truncate">
            {highestExpenseCategory ? highestExpenseCategory.category : 'N/A'}
          </p>
          <span className="text-[10px] text-slate-400">
            {highestExpenseCategory
              ? `${formatCurrency(highestExpenseCategory.amount, currency)} (${(highestExpenseCategory.percentage ?? 0).toFixed(0)}%)`
              : 'No expenses recorded'}
          </span>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
          <span className="text-slate-500 font-medium">Peak Revenue Period</span>
          <p className="text-lg font-bold font-mono text-emerald-700 mt-1">
            {bestMonth ? bestMonth.name : 'N/A'}
          </p>
          <span className="text-[10px] text-slate-400">
            {bestMonth ? formatCurrency(bestMonth.revenue, currency) : 'No data'}
          </span>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="space-y-6">
        {/* Chart 1: Revenue vs Expenses Multi-Line Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Revenue & Expense Trend Comparison</h3>
              <p className="text-xs text-slate-500">Dual line progression over reporting months</p>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-600">
              Ratio: {typeof expenseRatio === 'number' ? `${expenseRatio.toFixed(1)}%` : '—'}
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyMetrics} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Monthly Revenue"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10B981' }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  name="Monthly Expenses"
                  stroke="#EF4444"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#EF4444' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 2: Expense Category Bar Chart & Monthly Net Profit Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 2: Expense Category Breakdown Bar Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Expense Ranking by Category</h3>
                <p className="text-xs text-slate-500">Ranked by total outflow volume</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={expenseCategories}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" tickFormatter={formatYAxis} tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis
                    dataKey="category"
                    type="category"
                    tick={{ fontSize: 10, fill: '#334155' }}
                    width={75}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val), currency), 'Amount']}
                    contentStyle={{ borderRadius: '10px', fontSize: '11px' }}
                  />
                  <Bar dataKey="amount" name="Expenditure" fill="#EF4444" radius={[0, 4, 4, 0]} maxBarSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Monthly Net Profit Comparison */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Monthly Operating Profit (P&L)</h3>
                <p className="text-xs text-slate-500">Surplus or deficit per recording month</p>
              </div>
            </div>

            <div className="h-64 w-full">
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
                    formatter={(val: any) => [formatCurrency(Number(val), currency), 'Net Profit']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                  />
                  <Bar
                    dataKey="netProfit"
                    name="Net Operating Profit"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
