import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/currency';
import { calculateCashRunway } from '../utils/calculations';
import {
  Hourglass,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  Calendar,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Wallet,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';

export const CashRunwayPage: React.FC = () => {
  const { metrics, currency } = useApp();

  // Inputs
  const [cashBalance, setCashBalance] = useState<number>(metrics.currentCash);
  const [burnType, setBurnType] = useState<'net' | 'gross'>('net');
  const [revChangePct, setRevChangePct] = useState<number>(0);
  const [expChangePct, setExpChangePct] = useState<number>(0);

  // Compute burn rate based on selected type and user changes
  const baseMonthlyRev = metrics.avgMonthlyRevenue * (1 + revChangePct / 100);
  const baseMonthlyExp = metrics.avgMonthlyExpenses * (1 + expChangePct / 100);

  const monthlyBurn = useMemo(() => {
    if (burnType === 'gross') {
      return baseMonthlyExp;
    }
    // Net Burn is only positive when expenses exceed revenue
    return Math.max(0, baseMonthlyExp - baseMonthlyRev);
  }, [burnType, baseMonthlyRev, baseMonthlyExp]);

  // Run calculation
  const runway = useMemo(() => {
    return calculateCashRunway({
      availableCash: cashBalance,
      avgMonthlyExpenses: baseMonthlyExp,
      avgMonthlyRevenue: burnType === 'net' ? baseMonthlyRev : 0,
      additionalMonthlyCashOutflow: 0,
    });
  }, [cashBalance, baseMonthlyExp, baseMonthlyRev, burnType]);

  // Generate 12-month projection table
  const projectionTable = useMemo(() => {
    const rows = [];
    let currentPool = cashBalance;
    const now = new Date();

    for (let i = 1; i <= 12; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const starting = currentPool;

      const monthlyRev = burnType === 'net' ? baseMonthlyRev : 0;
      const monthlyExp = baseMonthlyExp;
      const netCashChange = monthlyRev - monthlyExp;
      const ending = starting + netCashChange;

      currentPool = ending;

      rows.push({
        monthIndex: i,
        monthName,
        startingCash: starting,
        revenue: monthlyRev,
        expenses: monthlyExp,
        netCashChange,
        endingCash: ending,
        isNegative: ending < 0,
      });
    }

    return rows;
  }, [cashBalance, baseMonthlyRev, baseMonthlyExp, burnType]);

  const formatYAxis = (tick: number) => formatCurrency(tick, currency, { compact: true });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            Cash Runway & Survival Forecaster
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            The decisive metric for business longevity. Pinpoint the exact month when liquid capital is exhausted.
          </p>
        </div>

        <button
          onClick={() => {
            setCashBalance(metrics.currentCash);
            setRevChangePct(0);
            setExpChangePct(0);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50"
          title="Reset to current ledger balance"
        >
          <Sparkles className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset to Current Balance</span>
        </button>
      </div>

      {/* Main Status Hero Widget */}
      <div
        className={`p-6 rounded-2xl border shadow-xs transition-all ${
          runway.statusColor === 'red'
            ? 'bg-red-50 border-red-300 text-red-950'
            : runway.statusColor === 'amber'
            ? 'bg-amber-50 border-amber-300 text-amber-950'
            : 'bg-emerald-50 border-emerald-300 text-emerald-950'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              {runway.statusColor === 'red' ? (
                <ShieldAlert className="w-6 h-6 text-red-600" />
              ) : runway.statusColor === 'amber' ? (
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              )}
              <span className="text-xs font-bold uppercase tracking-wider">
                Runway Solvency Status: {runway.financialStatus}
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight">
                {runway.cashRunwayMonths !== null ? `${runway.cashRunwayMonths} Months` : 'Self-Sustaining'}
              </span>
              {runway.cashRunwayMonths !== null && (
                <span className="text-xs font-semibold opacity-75">
                  ({Math.round(runway.cashRunwayMonths * 30.4)} days of operational runway)
                </span>
              )}
            </div>

            {runway.estimatedCashExhaustionDate && (
              <p className="mt-2 text-xs font-semibold">
                Projected cash exhaustion date:{' '}
                <strong className="underline underline-offset-2">{runway.estimatedCashExhaustionDate}</strong>
              </p>
            )}

            <p className="mt-3 text-sm font-medium max-w-2xl leading-relaxed">
              {runway.statusMessage}
            </p>
          </div>

          {/* Quick Metrics Column */}
          <div className="shrink-0 bg-white/80 backdrop-blur-xs p-4 rounded-xl border border-black/5 space-y-2 min-w-[220px]">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Tested Cash Pool</span>
              <p className="text-base font-bold font-mono text-slate-900">
                {formatCurrency(cashBalance, currency)}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                {burnType === 'net' ? 'Monthly Net Burn' : 'Gross Monthly Burn'}
              </span>
              <p className="text-base font-bold font-mono text-red-600">
                {monthlyBurn > 0 ? formatCurrency(monthlyBurn, currency) : '₹0 / Month'}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Burn Methodology</span>
              <p className="text-xs font-semibold text-slate-700">
                {burnType === 'net' ? 'Net Burn (Expenses - Revenue)' : 'Gross Burn (Total Outflow)'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Modifiers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Runway Parameters
          </h3>

          {/* Liquid Cash Balance Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Liquid Cash Balance</span>
              <span className="font-mono text-emerald-700">{formatCurrency(cashBalance, currency)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2000000"
              step="10000"
              value={cashBalance}
              onChange={(e) => setCashBalance(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Burn Type Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Burn Rate Calculation Model
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setBurnType('net')}
                className={`py-1.5 rounded-lg transition-all ${
                  burnType === 'net' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Net burn considers your incoming customer revenue"
              >
                Net Burn
              </button>
              <button
                onClick={() => setBurnType('gross')}
                className={`py-1.5 rounded-lg transition-all ${
                  burnType === 'gross' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Gross burn assumes zero revenue (worst case disaster)"
              >
                Gross Burn (Zero Rev)
              </button>
            </div>
          </div>

          {/* Expected Revenue Change % */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Expected Monthly Revenue Change</span>
              <span className={`font-mono ${revChangePct >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                {revChangePct > 0 ? `+${revChangePct}%` : `${revChangePct}%`}
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="100"
              step="5"
              value={revChangePct}
              onChange={(e) => setRevChangePct(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Expected Expense Change % */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Expected Monthly Expense Change</span>
              <span className={`font-mono ${expChangePct <= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                {expChangePct > 0 ? `+${expChangePct}%` : `${expChangePct}%`}
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="100"
              step="5"
              value={expChangePct}
              onChange={(e) => setExpChangePct(Number(e.target.value))}
              className="w-full accent-red-500 cursor-pointer"
            />
          </div>
        </div>

        {/* 12-Month Projection Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">12-Month Cash Depletion Curve</h3>
              <p className="text-xs text-slate-500">Projected bank balance trajectory under current burn rate</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionTable} margin={{ top: 15, right: 20, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="runwayGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="monthName"
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
                  formatter={(val: any) => [formatCurrency(Number(val), currency), 'Ending Cash']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <ReferenceLine y={0} stroke="#EF4444" strokeWidth={1.5} strokeDasharray="3 3" />
                <Area
                  type="monotone"
                  dataKey="endingCash"
                  name="Ending Cash"
                  stroke="#059669"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#runwayGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 12-Month Projection Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">12-Month Cash Flow Schedule</h3>
          <span className="text-xs text-slate-500 font-medium">Months with red background indicate insolvency</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-4">Period</th>
                <th className="py-2.5 px-4 text-right">Starting Cash</th>
                <th className="py-2.5 px-4 text-right">Inflows (Rev)</th>
                <th className="py-2.5 px-4 text-right">Outflows (Exp)</th>
                <th className="py-2.5 px-4 text-right">Net Change</th>
                <th className="py-2.5 px-4 text-right">Ending Balance</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {projectionTable.map((row) => (
                <tr
                  key={row.monthIndex}
                  className={`transition-colors ${
                    row.isNegative ? 'bg-red-50/70 text-red-950 font-bold' : 'hover:bg-slate-50/70'
                  }`}
                >
                  <td className="py-2.5 px-4 font-semibold">{row.monthName}</td>
                  <td className="py-2.5 px-4 text-right font-mono">
                    {formatCurrency(row.startingCash, currency)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-emerald-700">
                    +{formatCurrency(row.revenue, currency)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-red-600">
                    -{formatCurrency(row.expenses, currency)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono">
                    <span className={row.netCashChange >= 0 ? 'text-emerald-700' : 'text-red-600'}>
                      {formatCurrency(row.netCashChange, currency, { showSign: true })}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold">
                    <span className={row.isNegative ? 'text-red-600' : 'text-slate-900'}>
                      {formatCurrency(row.endingCash, currency)}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.isNegative
                          ? 'bg-red-200 text-red-900'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {row.isNegative ? 'Deficit' : 'Solvent'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
