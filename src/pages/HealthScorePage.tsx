import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Activity,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const HealthScorePage: React.FC = () => {
  const { healthScore, metrics } = useApp();

  const { overallScore, status, statusColor, summaryText, components, recommendations } =
    healthScore;

  const componentList = [
    components.profitability,
    components.cashPosition,
    components.expenseControl,
    components.revenueTrend,
    components.cashRunway,
  ];

  // Grade color configs
  const strokeColor =
    overallScore >= 80
      ? '#059669' // Emerald
      : overallScore >= 60
      ? '#2563EB' // Blue
      : overallScore >= 40
      ? '#D97706' // Amber
      : '#DC2626'; // Red

  // SVG Gauge calculations
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
          Financial Health Score
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          A composite 0-100 diagnostic index measuring profitability, cash reserves, expense discipline, and growth resilience.
        </p>
      </div>

      {/* Main Score Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Circular Gauge */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="#E2E8F0"
                  strokeWidth="12"
                  fill="transparent"
                />
                {/* Score Progress Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke={strokeColor}
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-5xl font-black font-mono tracking-tight text-slate-950">
                  {overallScore}
                </span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Out of 100
                </span>
              </div>
            </div>

            <div
              className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                overallScore >= 80
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : overallScore >= 60
                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                  : overallScore >= 40
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              <span>{status}</span>
            </div>
          </div>

          {/* Description & Action Plan */}
          <div className="flex-1 space-y-4 text-left">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Executive Health Assessment
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {summaryText}
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                BizGuard continuously evaluates 5 core financial pillars. Your current score reflects{' '}
                <strong className="text-slate-900">
                  {typeof metrics.profitMargin === 'number'
                    ? `${metrics.profitMargin.toFixed(1)}% profit margin`
                    : 'baseline margin'}
                </strong>{' '}
                and a cash buffer of{' '}
                <strong className="text-slate-900">
                  {metrics.cashRunwayMonths !== null ? `${metrics.cashRunwayMonths} months` : 'self-sustaining cash flow'}
                </strong>.
              </p>
            </div>

            {/* Recommendations Chips */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Action Steps to Increase Score:
              </span>
              <div className="mt-2 space-y-1.5">
                {recommendations.slice(0, 3).map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Pillar Breakdown Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Pillar-by-Pillar Diagnostic Breakdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {componentList.map((item) => {
            const pct = Math.round((item.score / item.maxScore) * 100);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>{item.name}</span>
                    <span className="font-mono text-emerald-700">
                      {item.score}/{item.maxScore}
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 mt-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="mt-2.5">
                    <span className="text-[10px] font-bold uppercase text-slate-400">{item.metricLabel}</span>
                    <p className="text-xs font-black font-mono text-slate-900">{item.metricValue}</p>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-2 leading-tight">
                    {item.explanation}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                  <span
                    className={
                      item.status === 'Strong'
                        ? 'text-emerald-600 font-bold'
                        : item.status === 'Stable'
                        ? 'text-blue-600 font-bold'
                        : item.status === 'Needs Attention'
                        ? 'text-amber-600 font-bold'
                        : 'text-red-600 font-bold'
                    }
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
