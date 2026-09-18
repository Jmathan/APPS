import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldLogo } from '../components/common/ShieldLogo';
import {
  TrendingUp,
  Scale,
  Hourglass,
  SlidersHorizontal,
  Activity,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  DollarSign,
  AlertOctagon,
  CheckCircle2,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { navigateTo, loadDemoUser } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28 border-b border-slate-200 bg-linear-to-b from-white via-slate-50 to-emerald-50/30">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-6">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Understand your money. Protect your business. Plan your future.</span>
            </div>

            {/* Hero Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.15]">
              Make Smarter Business Decisions With Your{' '}
              <span className="text-emerald-700 underline decoration-emerald-300 decoration-wavy decoration-2">
                Financial Data
              </span>
            </h1>

            {/* Hero Description */}
            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Track your business finances, understand your cash flow, and simulate important decisions before taking real financial risks.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                onClick={() => navigateTo('/signup')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-lg shadow-emerald-700/25 active:scale-[0.98] transition-all"
              >
                <span>Start Managing Your Business</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={loadDemoUser}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-emerald-900 bg-emerald-100/70 hover:bg-emerald-200/70 border border-emerald-300 active:scale-[0.98] transition-all"
                title="Instant preview with 6 months of Demo Café data"
              >
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>Explore Demo Café (No Sign-up)</span>
              </button>
            </div>

            {/* Micro proof badges */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Real-Time Recalculations</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero Spreadsheets Needed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Transparent Survival Math</span>
              </div>
            </div>
          </div>

          {/* Product Preview Card */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl bg-white border border-slate-200 shadow-2xl p-4 sm:p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400"></span>
                <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                <span className="ml-2 text-xs font-mono text-slate-400">bizguard.internal/dashboard</span>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Live Simulation Engine
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left mb-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500">Monthly Revenue</p>
                <p className="text-lg font-bold text-slate-900 font-mono mt-0.5">₹2,20,000</p>
                <span className="text-[10px] text-emerald-600 font-semibold">+12.5% MoM</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500">Monthly Expenses</p>
                <p className="text-lg font-bold text-slate-900 font-mono mt-0.5">₹1,55,500</p>
                <span className="text-[10px] text-slate-500">70.6% ratio</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500">Net Profit</p>
                <p className="text-lg font-bold text-emerald-600 font-mono mt-0.5">+₹64,500</p>
                <span className="text-[10px] text-emerald-700 font-semibold">29.3% Margin</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500">Cash Runway</p>
                <p className="text-lg font-bold text-emerald-600 font-mono mt-0.5">Self-Sustaining</p>
                <span className="text-[10px] text-slate-500 font-semibold">₹3,00,000 Liquid</span>
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Interactive Stress Testing
                </p>
                <p className="text-sm font-semibold text-slate-200 mt-0.5">
                  "What if bean supplier prices increase by 15% and we hire 2 baristas?"
                </p>
              </div>
              <button
                onClick={() => navigateTo('/simulator')}
                className="shrink-0 px-4 py-2 rounded-lg text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 transition-colors"
              >
                Launch Simulator
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section id="features-section" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Decision & Survival Modules
            </h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Everything Small Businesses Need to Survive & Thrive
            </p>
            <p className="mt-3 text-slate-600 text-base">
              Built on transparent financial equations, not black-box estimates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Real-Time Revenue & Expense Tracking</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Log transactions with custom categories, payment statuses, and notes. Filter, search, import, and export CSV files with zero lag.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-4">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Break-Even Calculator</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Calculate contribution margins, break-even unit volume, and safety margins. Interactive charts show exactly where profitability begins.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
                <Hourglass className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Cash Runway & Burn Forecast</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Know your exact cash burn and remaining months before exhaustion. 12-month projection table highlights critical depletion milestones.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-4">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">What-If Business Simulator</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                BizGuard's core innovation. Model hiring, store expansion, price changes, or marketing campaigns side-by-side across Scenarios A, B, and C.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center mb-4">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">0-100 Financial Health Score</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Transparent rating based on 5 weighted pillars: Profitability, Cash Position, Expense Control, Revenue Trend, and Runway buffer.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Reports & Rule-Based Insights</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Generate monthly P&L summaries, category cost distributions, and actionable warnings automatically derived from your transactions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works-section" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              The Workflow
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-950 tracking-tight">
              From Raw Transactions to Confident Decisions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs relative">
              <span className="text-3xl font-mono font-extrabold text-slate-300">01</span>
              <h4 className="text-base font-bold text-slate-900 mt-2">Enter or Import Data</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Add revenues and expenses manually, import via CSV, or start instantly with Demo Café.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs relative">
              <span className="text-3xl font-mono font-extrabold text-slate-300">02</span>
              <h4 className="text-base font-bold text-slate-900 mt-2">Instant Real-Time Math</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Every edit immediately recalculates profit, runway, margin, and category trends without page reloads.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs relative">
              <span className="text-3xl font-mono font-extrabold text-slate-300">03</span>
              <h4 className="text-base font-bold text-slate-900 mt-2">Simulate Before Spending</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Model wage increases, new branches, or product line expansions in the What-If Simulator.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs relative">
              <span className="text-3xl font-mono font-extrabold text-slate-300">04</span>
              <h4 className="text-base font-bold text-slate-900 mt-2">Protect & Grow</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Keep cash runway safe, heed early-warning alerts, and export executive financial summaries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why BizGuard Section */}
      <section id="why-bizguard-section" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-4 border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Small Business Survival</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                Most Businesses Fail Due to Unexpected Cash Exhaustion, Not Bad Products.
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed text-sm sm:text-base">
                Accounting software looks backward at tax compliance. BizGuard looks forward at operational survival. By continuously calculating your cash runway and allowing risk-free hypothesis testing, BizGuard gives you the foresight of a CFO.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">No Complex Financial Jargon</h5>
                    <p className="text-xs text-slate-500">Clear metrics designed for owners, operators, and founders.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Multi-Currency & Indian Rupee (₹) Support</h5>
                    <p className="text-xs text-slate-500">Native support for Lakhs/Crores notation and international currencies.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Complete Data Privacy</h5>
                    <p className="text-xs text-slate-500">Your financial numbers are calculated in real time with private persistence.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => navigateTo('/signup')}
                  className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-slate-950 hover:bg-slate-900 shadow-sm transition-all"
                >
                  Create Your Free Business Account
                </button>
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-xl">
              <h4 className="text-lg font-bold text-emerald-400 font-mono">
                // The BizGuard Survival Rule
              </h4>
              <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                "Never commit real capital or recurring payroll until your scenario models prove you can endure at least 6 months of unexpected downside."
              </p>
              <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] text-slate-400 uppercase font-semibold">Survival Metric</p>
                  <p className="text-xl font-bold font-mono text-white mt-1">Cash Runway</p>
                  <p className="text-xs text-slate-400 mt-0.5">Available Cash ÷ Monthly Burn</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 uppercase font-semibold">Safety Metric</p>
                  <p className="text-xl font-bold font-mono text-emerald-400 mt-1">Margin of Safety</p>
                  <p className="text-xs text-slate-400 mt-0.5">Expected Units − Break-Even Units</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <ShieldLogo textColor="text-white" />
            </div>

            <div className="flex flex-wrap items-center gap-6 text-slate-400 font-medium">
              <button onClick={() => navigateTo('/dashboard')} className="hover:text-white transition-colors">
                Dashboard
              </button>
              <button onClick={() => navigateTo('/transactions')} className="hover:text-white transition-colors">
                Transactions
              </button>
              <button onClick={() => navigateTo('/break-even')} className="hover:text-white transition-colors">
                Break-Even
              </button>
              <button onClick={() => navigateTo('/cash-runway')} className="hover:text-white transition-colors">
                Cash Runway
              </button>
              <button onClick={() => navigateTo('/simulator')} className="hover:text-white transition-colors">
                What-If Simulator
              </button>
              <button onClick={() => navigateTo('/health-score')} className="hover:text-white transition-colors">
                Health Score
              </button>
            </div>

            <p className="text-slate-500">
              &copy; {new Date().getFullYear()} BizGuard Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
