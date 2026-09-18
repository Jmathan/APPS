import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { calculateBreakEven } from '../utils/calculations';
import { formatCurrency, formatPercent } from '../utils/currency';
import {
  Scale,
  DollarSign,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceDot,
  ReferenceLine,
} from 'recharts';

export const BreakEvenPage: React.FC = () => {
  const { metrics, currency } = useApp();

  // Inputs with sensible defaults (e.g. for a café or small manufacturing business)
  const [fixedCosts, setFixedCosts] = useState<number>(100000);
  const [sellingPrice, setSellingPrice] = useState<number>(250);
  const [variableCost, setVariableCost] = useState<number>(100);
  const [estimatedUnits, setEstimatedUnits] = useState<number>(1000);

  // Auto-populate fixed costs from current average monthly expenses
  const handleAutoPopulateFixedCosts = () => {
    if (metrics.avgMonthlyExpenses > 0) {
      // Typically fixed costs are ~60-70% of total expenses (Rent, Salaries, Utilities)
      const approxFixed = Math.round(metrics.avgMonthlyExpenses * 0.7);
      setFixedCosts(approxFixed);
    }
  };

  // Perform calculation
  const result = useMemo(() => {
    return calculateBreakEven({
      fixedCosts,
      sellingPricePerUnit: sellingPrice,
      variableCostPerUnit: variableCost,
      expectedSalesUnits: estimatedUnits,
    });
  }, [fixedCosts, sellingPrice, variableCost, estimatedUnits]);

  const isProfitable = result.expectedProfit > 0;
  const currentNetProfit = result.expectedProfit;
  const marginOfSafetyUnits = result.marginOfSafetyUnits ?? 0;
  const marginOfSafetyPercent = result.marginOfSafetyPercentage ?? 0;
  const unitsNeededToBreakEven = Math.max(0, (result.breakEvenUnits || 0) - estimatedUnits);

  // Generate data points for the Break-even Chart
  const chartData = useMemo(() => {
    const beUnits = result.breakEvenUnits !== null ? result.breakEvenUnits : 1000;
    const maxUnits = Math.max(beUnits * 1.8, estimatedUnits * 1.4, 500);
    const steps = 10;
    const stepSize = Math.round(maxUnits / steps);

    const points = [];
    for (let i = 0; i <= steps; i++) {
      const units = i * stepSize;
      const totalRevenue = units * sellingPrice;
      const totalCost = fixedCosts + units * variableCost;
      const profit = totalRevenue - totalCost;

      points.push({
        units,
        fixedCost: fixedCosts,
        totalCost,
        totalRevenue,
        profit,
      });
    }

    return points;
  }, [result, fixedCosts, sellingPrice, variableCost, estimatedUnits]);

  const formatYAxis = (tick: number) => formatCurrency(tick, currency, { compact: true });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            Break-Even Calculator
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Determine the exact unit volume and revenue needed to cover all operational overhead and begin generating profit.
          </p>
        </div>

        {metrics.avgMonthlyExpenses > 0 && (
          <button
            onClick={handleAutoPopulateFixedCosts}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors"
            title="Auto-fill fixed costs based on your recorded monthly rent & salary transactions"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Auto-fill from Monthly Expenses ({formatCurrency(metrics.avgMonthlyExpenses, currency, { compact: true })})</span>
          </button>
        )}
      </div>

      {/* Inputs & Status Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Sliders and Inputs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Unit & Overhead Variables
          </h3>

          {/* Fixed Costs */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Monthly Fixed Costs</span>
              <span className="font-mono text-emerald-700">{formatCurrency(fixedCosts, currency)}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="1000000"
              step="5000"
              value={fixedCosts}
              onChange={(e) => setFixedCosts(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
              <span>Rent, Salaries, Software</span>
              <input
                type="number"
                value={fixedCosts}
                onChange={(e) => setFixedCosts(Math.max(0, Number(e.target.value)))}
                className="w-24 text-right px-1.5 py-0.5 border border-slate-200 rounded text-xs font-mono"
              />
            </div>
          </div>

          {/* Selling Price Per Unit */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Selling Price Per Unit</span>
              <span className="font-mono text-emerald-700">{formatCurrency(sellingPrice, currency)}</span>
            </div>
            <input
              type="range"
              min="10"
              max="10000"
              step="10"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
              <span>Customer price per meal/item</span>
              <input
                type="number"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Math.max(1, Number(e.target.value)))}
                className="w-20 text-right px-1.5 py-0.5 border border-slate-200 rounded text-xs font-mono"
              />
            </div>
          </div>

          {/* Variable Cost Per Unit */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Variable Cost Per Unit</span>
              <span className="font-mono text-red-600">{formatCurrency(variableCost, currency)}</span>
            </div>
            <input
              type="range"
              min="1"
              max={sellingPrice * 0.99 || 5000}
              step="5"
              value={variableCost}
              onChange={(e) => setVariableCost(Number(e.target.value))}
              className="w-full accent-red-500 cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
              <span>Ingredients, packaging, courier</span>
              <input
                type="number"
                value={variableCost}
                onChange={(e) => setVariableCost(Math.max(0, Number(e.target.value)))}
                className="w-20 text-right px-1.5 py-0.5 border border-slate-200 rounded text-xs font-mono"
              />
            </div>
          </div>

          {/* Estimated Monthly Volume */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Target Sales Volume (Units)</span>
              <span className="font-mono text-blue-600">{estimatedUnits.toLocaleString()} units</span>
            </div>
            <input
              type="range"
              min="50"
              max="10000"
              step="50"
              value={estimatedUnits}
              onChange={(e) => setEstimatedUnits(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
              <span>Expected sales this month</span>
              <input
                type="number"
                value={estimatedUnits}
                onChange={(e) => setEstimatedUnits(Math.max(0, Number(e.target.value)))}
                className="w-20 text-right px-1.5 py-0.5 border border-slate-200 rounded text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Output Status & KPI Cards */}
        <div className="lg:col-span-2 space-y-4">
          {/* Real-time Profit / Loss Callout Banner */}
          <div
            className={`p-5 rounded-2xl border ${
              isProfitable
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : marginOfSafetyUnits === 0
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-red-50 border-red-300 text-red-950'
            } shadow-xs`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              {isProfitable ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Profitable Operation</span>
                </>
              ) : marginOfSafetyUnits === 0 ? (
                <>
                  <Scale className="w-5 h-5 text-amber-600" />
                  <span>Exact Break-Even Equilibrium</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span>Operating at a Loss</span>
                </>
              )}
            </div>

            <p className="mt-2 text-sm font-medium leading-relaxed">
              {isProfitable && (
                <>
                  At <strong className="font-mono font-bold">{estimatedUnits.toLocaleString()} units</strong>,
                  you generate{' '}
                  <strong className="font-mono font-bold text-emerald-700">
                    {formatCurrency(currentNetProfit, currency, { showSign: true })}
                  </strong>{' '}
                  net profit per month. You have a safety cushion of{' '}
                  <strong className="font-mono font-bold">
                    {marginOfSafetyUnits.toLocaleString()} units
                  </strong>{' '}
                  ({marginOfSafetyPercent.toFixed(1)}%) before entering loss territory.
                </>
              )}

              {!isProfitable && marginOfSafetyUnits !== 0 && (
                <>
                  At <strong className="font-mono font-bold">{estimatedUnits.toLocaleString()} units</strong>,
                  you are losing{' '}
                  <strong className="font-mono font-bold text-red-700">
                    {formatCurrency(Math.abs(currentNetProfit), currency)}
                  </strong>{' '}
                  per month. You need to sell{' '}
                  <strong className="font-mono font-bold text-slate-900">
                    {unitsNeededToBreakEven.toLocaleString()} more units
                  </strong>{' '}
                  to reach zero-loss equilibrium.
                </>
              )}

              {marginOfSafetyUnits === 0 && (
                <>
                  Revenues exactly equal operational expenses at this volume. Every additional unit sold from here on generates{' '}
                  <strong className="font-mono font-bold text-emerald-700">
                    {formatCurrency(result.contributionMargin, currency)}
                  </strong>{' '}
                  in pure net profit.
                </>
              )}
            </p>
          </div>

          {/* 4 Key Math Outputs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Break Even Units */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Break-Even Units</span>
              <p className="text-xl font-black font-mono text-slate-900 mt-1">
                {result.breakEvenUnits !== null ? result.breakEvenUnits.toLocaleString() : 'N/A'}
              </p>
              <span className="text-[10px] text-slate-400">Fixed ÷ Contribution</span>
            </div>

            {/* Break Even Revenue */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Break-Even Rev</span>
              <p className="text-xl font-black font-mono text-emerald-700 mt-1">
                {result.breakEvenRevenue !== null ? formatCurrency(result.breakEvenRevenue, currency, { compact: true }) : 'N/A'}
              </p>
              <span className="text-[10px] text-slate-400">Units × Price</span>
            </div>

            {/* Contribution Margin */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Contrib Margin</span>
              <p className="text-xl font-black font-mono text-slate-900 mt-1">
                {formatCurrency(result.contributionMargin, currency)}
              </p>
              <span className="text-[10px] text-slate-400">
                {result.contributionMarginRatio.toFixed(1)}% of price
              </span>
            </div>

            {/* Margin of Safety */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Safety Margin</span>
              <p
                className={`text-xl font-black font-mono mt-1 ${
                  marginOfSafetyUnits >= 0
                    ? 'text-emerald-600'
                    : 'text-red-600'
                }`}
              >
                {`${marginOfSafetyUnits.toLocaleString()} u`}
              </p>
              <span className="text-[10px] text-slate-400">
                {`${marginOfSafetyPercent.toFixed(1)}% buffer`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Break-Even Visual Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Break-Even Crossover Visualization</h3>
            <p className="text-xs text-slate-500">
              The crossover point between Total Cost and Total Revenue marks the start of business profitability
            </p>
          </div>
          {result.breakEvenUnits !== null && (
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Break-Even Point: {result.breakEvenUnits.toLocaleString()} units ({formatCurrency(result.breakEvenRevenue || 0, currency)})
            </span>
          )}
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 15, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="units"
                tickFormatter={(v) => `${v.toLocaleString()} u`}
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
                formatter={(val: any, name: any) => [formatCurrency(Number(val), currency), name]}
                labelFormatter={(label) => `Sales Volume: ${Number(label).toLocaleString()} units`}
                contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

              {/* Fixed Cost Baseline (Flat gray line) */}
              <Line
                type="monotone"
                dataKey="fixedCost"
                name="Fixed Costs"
                stroke="#94A3B8"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />

              {/* Total Cost Line (Red) */}
              <Line
                type="monotone"
                dataKey="totalCost"
                name="Total Costs (Fixed + Variable)"
                stroke="#EF4444"
                strokeWidth={2.5}
                dot={false}
              />

              {/* Total Revenue Line (Green) */}
              <Line
                type="monotone"
                dataKey="totalRevenue"
                name="Total Revenue (Units × Price)"
                stroke="#10B981"
                strokeWidth={3}
                dot={false}
              />

              {/* Target Sales Volume Marker */}
              <ReferenceLine
                x={estimatedUnits}
                stroke="#3B82F6"
                strokeDasharray="3 3"
                label={{ value: 'Target Volume', fill: '#2563EB', fontSize: 11, position: 'top' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
