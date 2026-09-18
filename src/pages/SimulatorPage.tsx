import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ScenarioInputs } from '../types';
import { calculateScenario } from '../utils/calculations';
import { formatCurrency, formatPercent } from '../utils/currency';
import {
  SlidersHorizontal,
  Users,
  Building,
  Tag,
  Megaphone,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Save,
  Trash2,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';

type DecisionPreset = 'hire' | 'rent' | 'pricing' | 'marketing' | 'equipment' | 'custom';

export const SimulatorPage: React.FC = () => {
  const { metrics, currency, scenarios, saveScenario, deleteScenario } = useApp();

  // Selected Decision Template Preset
  const [selectedPreset, setSelectedPreset] = useState<DecisionPreset>('hire');
  const [activeTab, setActiveTab] = useState<'simulator' | 'saved'>('simulator');

  // Scenario Input Form State
  const [scenarioName, setScenarioName] = useState('Hire Head Barista & Prep Cook');
  const [scenarioDesc, setScenarioDesc] = useState('Adding 2 staff members to expand dinner & weekend revenue');
  const [durationMonths, setDurationMonths] = useState(12);

  // Assumption parameters
  const [hiringCost, setHiringCost] = useState(35000);
  const [additionalMonthlyRevenue, setAdditionalMonthlyRevenue] = useState(55000);
  const [additionalMonthlyFixedCost, setAdditionalMonthlyFixedCost] = useState(0);
  const [revenueChangePct, setRevenueChangePct] = useState(0);
  const [expenseChangePct, setExpenseChangePct] = useState(0);
  const [oneTimeInvestment, setOneTimeInvestment] = useState(0);

  // Switch preset helper
  const handlePresetSelect = (preset: DecisionPreset) => {
    setSelectedPreset(preset);
    if (preset === 'hire') {
      setScenarioName('Hire 2 Key Staff Members');
      setScenarioDesc('Expand operational capacity with additional payroll');
      setHiringCost(35000);
      setAdditionalMonthlyRevenue(55000);
      setAdditionalMonthlyFixedCost(0);
      setRevenueChangePct(0);
      setExpenseChangePct(0);
      setOneTimeInvestment(0);
    } else if (preset === 'rent') {
      setScenarioName('Lease Expanded Space');
      setScenarioDesc('Rent adjacent unit to double dine-in seating');
      setHiringCost(0);
      setAdditionalMonthlyRevenue(45000);
      setAdditionalMonthlyFixedCost(20000);
      setRevenueChangePct(0);
      setExpenseChangePct(0);
      setOneTimeInvestment(50000);
    } else if (preset === 'pricing') {
      setScenarioName('12% Price Increase');
      setScenarioDesc('Adjust price tier across core service lines');
      setHiringCost(0);
      setAdditionalMonthlyRevenue(0);
      setAdditionalMonthlyFixedCost(0);
      setRevenueChangePct(12);
      setExpenseChangePct(0);
      setOneTimeInvestment(0);
    } else if (preset === 'marketing') {
      setScenarioName('Digital Marketing Expansion');
      setScenarioDesc('Dedicated monthly ad spend with expected acquisition boost');
      setHiringCost(0);
      setAdditionalMonthlyRevenue(40000);
      setAdditionalMonthlyFixedCost(15000);
      setRevenueChangePct(0);
      setExpenseChangePct(0);
      setOneTimeInvestment(10000);
    } else if (preset === 'equipment') {
      setScenarioName('Commercial Equipment Financing');
      setScenarioDesc('Purchase new high-throughput hardware with monthly installment');
      setHiringCost(0);
      setAdditionalMonthlyRevenue(30000);
      setAdditionalMonthlyFixedCost(12000);
      setRevenueChangePct(0);
      setExpenseChangePct(0);
      setOneTimeInvestment(80000);
    } else {
      setScenarioName('Custom Business Scenario');
      setScenarioDesc('Custom revenue and cost assumptions');
      setHiringCost(0);
      setAdditionalMonthlyRevenue(20000);
      setAdditionalMonthlyFixedCost(10000);
      setRevenueChangePct(5);
      setExpenseChangePct(0);
      setOneTimeInvestment(0);
    }
  };

  const baseRevenue = metrics.avgMonthlyRevenue || 200000;
  const baseExpenses = metrics.avgMonthlyExpenses || 140000;
  const startingCash = metrics.currentCash || 300000;

  // Run simulation using calculation engine
  const currentScenarioInputs: ScenarioInputs = useMemo(() => ({
    id: 'current_simulation',
    name: scenarioName,
    description: scenarioDesc,
    baseRevenue,
    baseExpenses,
    startingCash,
    revenueChangePct,
    expenseChangePct,
    additionalMonthlyFixedCost,
    additionalMonthlyRevenue,
    hiringCost,
    expansionCost: 0,
    oneTimeInvestment,
    durationMonths,
    createdAt: new Date().toISOString(),
  }), [
    scenarioName,
    scenarioDesc,
    baseRevenue,
    baseExpenses,
    startingCash,
    revenueChangePct,
    expenseChangePct,
    additionalMonthlyFixedCost,
    additionalMonthlyRevenue,
    hiringCost,
    oneTimeInvestment,
    durationMonths,
  ]);

  const result = useMemo(() => {
    return calculateScenario(currentScenarioInputs);
  }, [currentScenarioInputs]);

  // Comparative metrics
  const baselineProfit = baseRevenue - baseExpenses;
  const simulatedProfit = result.scenarioProfit;
  const profitDelta = simulatedProfit - baselineProfit;

  // Risk rating calculation
  let riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical' = 'Low';
  let riskMessage = '';

  if (result.scenarioMonthlyCashFlow < 0) {
    if (result.cashRunwayMonths !== null && result.cashRunwayMonths < 3) {
      riskLevel = 'Critical';
      riskMessage = 'Insolvent within 3 months under these assumptions. Severe capital depletion risk.';
    } else if (result.cashRunwayMonths !== null && result.cashRunwayMonths < 6) {
      riskLevel = 'High';
      riskMessage = 'Cash runway drops below 6 months. Strongly recommend securing credit or cutting baseline overhead first.';
    } else {
      riskLevel = 'Moderate';
      riskMessage = 'Business is burning cash temporarily. Ensure expansion produces quick payback.';
    }
  } else {
    if (simulatedProfit > baselineProfit) {
      riskLevel = 'Low';
      riskMessage = 'Safe to proceed. Net monthly earnings expand while maintaining positive cash flow.';
    } else {
      riskLevel = 'Moderate';
      riskMessage = 'Operational profit is compressed. Double check if revenue returns justify the added expenses.';
    }
  }

  // Handle saving scenario
  const handleSaveScenario = () => {
    const newId = `sc_${Date.now()}`;
    saveScenario({
      ...currentScenarioInputs,
      id: newId,
      createdAt: new Date().toISOString(),
    });
    alert('Scenario successfully saved to your decision library!');
  };

  // Bar comparison chart data
  const comparisonData = [
    {
      name: 'Monthly Revenue',
      Baseline: baseRevenue,
      Simulated: result.scenarioRevenue,
    },
    {
      name: 'Monthly Expenses',
      Baseline: baseExpenses,
      Simulated: result.scenarioExpenses,
    },
    {
      name: 'Operating Profit',
      Baseline: baselineProfit,
      Simulated: simulatedProfit,
    },
  ];

  const formatYAxis = (tick: number) => formatCurrency(tick, currency, { compact: true });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              What-If Business Decision Simulator
            </h1>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Core Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Test business expansion, payroll additions, rent commitments, and pricing changes in real time before risking capital.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab(activeTab === 'simulator' ? 'saved' : 'simulator')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            <span>{activeTab === 'simulator' ? `Saved Scenarios (${scenarios.length})` : 'Back to Active Simulator'}</span>
          </button>

          <button
            onClick={handleSaveScenario}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Scenario</span>
          </button>
        </div>
      </div>

      {activeTab === 'saved' ? (
        /* Saved Library */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Saved Scenario Library</h3>
          {scenarios.length === 0 ? (
            <p className="text-xs text-slate-500 py-10 text-center">
              No saved scenarios yet. Use the simulator and click "Save Scenario" to compare multiple strategic paths.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scenarios.map((sc) => {
                const scResult = calculateScenario(sc);
                return (
                  <div key={sc.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{sc.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{sc.description}</p>
                      </div>
                      <button
                        onClick={() => deleteScenario(sc.id)}
                        className="text-slate-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-500">Projected Profit</span>
                        <p className="font-mono font-bold text-slate-900">
                          {formatCurrency(scResult.scenarioProfit, currency)}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500">Ending Cash</span>
                        <p className="font-mono font-bold text-emerald-700">
                          {formatCurrency(scResult.endingCash, currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Active Simulator */
        <div className="space-y-6">
          {/* Preset Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              { id: 'hire', label: 'Hire Employee', icon: Users },
              { id: 'rent', label: 'Rent Expansion', icon: Building },
              { id: 'pricing', label: 'Change Prices', icon: Tag },
              { id: 'marketing', label: 'Launch Marketing', icon: Megaphone },
              { id: 'equipment', label: 'Buy Equipment', icon: Wrench },
              { id: 'custom', label: 'Custom Hypothesis', icon: SlidersHorizontal },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = selectedPreset === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handlePresetSelect(item.id as DecisionPreset)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1.5" />
                  <span className="text-center">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Risk Level Banner */}
          <div
            className={`p-6 rounded-2xl border shadow-xs transition-all ${
              riskLevel === 'Critical'
                ? 'bg-red-50 border-red-300 text-red-950'
                : riskLevel === 'High'
                ? 'bg-rose-50 border-rose-300 text-rose-950'
                : riskLevel === 'Moderate'
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-emerald-50 border-emerald-300 text-emerald-950'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  {riskLevel === 'Critical' || riskLevel === 'High' ? (
                    <ShieldAlert className="w-5 h-5 text-red-600" />
                  ) : riskLevel === 'Moderate' ? (
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  )}
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Risk Assessment: {riskLevel} Risk
                  </span>
                </div>

                <h3 className="text-xl font-black mt-2">
                  {profitDelta >= 0
                    ? `Projected Net Profit Increases by ${formatCurrency(profitDelta, currency)} / month`
                    : `Projected Net Profit Drops by ${formatCurrency(Math.abs(profitDelta), currency)} / month`}
                </h3>

                <p className="mt-1 text-xs font-medium max-w-2xl leading-relaxed">
                  {riskMessage}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <span className="text-[10px] font-bold uppercase text-slate-500">Simulated Runway</span>
                <p className="text-2xl font-black font-mono">
                  {result.cashRunwayMonths !== null ? `${result.cashRunwayMonths} mo` : 'Self-Sustaining'}
                </p>
              </div>
            </div>
          </div>

          {/* Form Inputs & Comparison Output */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Inputs */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Scenario Configuration
              </h3>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Scenario Name</label>
                <input
                  type="text"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              {/* Monthly Hiring Cost */}
              {(selectedPreset === 'hire' || selectedPreset === 'custom') && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Monthly Payroll / Hiring Cost</span>
                    <span className="font-mono text-red-600">{formatCurrency(hiringCost, currency)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="150000"
                    step="2500"
                    value={hiringCost}
                    onChange={(e) => setHiringCost(Number(e.target.value))}
                    className="w-full accent-red-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Monthly Fixed Cost Addition (Rent, EMI, etc) */}
              {(selectedPreset === 'rent' || selectedPreset === 'marketing' || selectedPreset === 'equipment' || selectedPreset === 'custom') && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Monthly Added Fixed Overhead (Rent / EMI)</span>
                    <span className="font-mono text-red-600">{formatCurrency(additionalMonthlyFixedCost, currency)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="2000"
                    value={additionalMonthlyFixedCost}
                    onChange={(e) => setAdditionalMonthlyFixedCost(Number(e.target.value))}
                    className="w-full accent-red-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Additional Monthly Revenue */}
              {(selectedPreset === 'hire' || selectedPreset === 'rent' || selectedPreset === 'marketing' || selectedPreset === 'equipment' || selectedPreset === 'custom') && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Expected Monthly Revenue Expansion</span>
                    <span className="font-mono text-emerald-700">{formatCurrency(additionalMonthlyRevenue, currency)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200000"
                    step="5000"
                    value={additionalMonthlyRevenue}
                    onChange={(e) => setAdditionalMonthlyRevenue(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              )}

              {/* Revenue Change % (Pricing) */}
              {(selectedPreset === 'pricing' || selectedPreset === 'custom') && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Price Adjustment / Revenue Growth %</span>
                    <span className="font-mono text-blue-600">
                      {revenueChangePct > 0 ? `+${revenueChangePct}%` : `${revenueChangePct}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="50"
                    step="1"
                    value={revenueChangePct}
                    onChange={(e) => setRevenueChangePct(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              )}

              {/* One-Time Upfront Investment */}
              {(selectedPreset === 'equipment' || selectedPreset === 'rent' || selectedPreset === 'marketing' || selectedPreset === 'custom') && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>One-Time Upfront Capital Required</span>
                    <span className="font-mono text-slate-800">{formatCurrency(oneTimeInvestment, currency)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="300000"
                    step="10000"
                    value={oneTimeInvestment}
                    onChange={(e) => setOneTimeInvestment(Number(e.target.value))}
                    className="w-full accent-slate-700 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Comparison Table & Trajectory */}
            <div className="lg:col-span-2 space-y-6">
              {/* Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Baseline vs. Scenario Comparison</h3>
                  <span className="text-xs text-slate-400 font-medium">Real-Time Reactive Metrics</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-4">Financial Metric</th>
                        <th className="py-2.5 px-4 text-right">Current Baseline</th>
                        <th className="py-2.5 px-4 text-right">Simulated Scenario</th>
                        <th className="py-2.5 px-4 text-right">Net Impact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-slate-700">Monthly Revenue</td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-900">{formatCurrency(baseRevenue, currency)}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-700">{formatCurrency(result.scenarioRevenue, currency)}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-emerald-700">+{formatCurrency(result.scenarioRevenue - baseRevenue, currency)}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-slate-700">Monthly Expenses</td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-900">{formatCurrency(baseExpenses, currency)}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-red-600">{formatCurrency(result.scenarioExpenses, currency)}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-red-600">+{formatCurrency(result.scenarioExpenses - baseExpenses, currency)}</td>
                      </tr>
                      <tr className="bg-slate-50/60">
                        <td className="py-2.5 px-4 font-bold text-slate-900">Operating Net Profit</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{formatCurrency(baselineProfit, currency)}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-black text-emerald-700">{formatCurrency(simulatedProfit, currency)}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold">
                          <span className={profitDelta >= 0 ? 'text-emerald-700' : 'text-red-600'}>
                            {formatCurrency(profitDelta, currency, { showSign: true })}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-slate-700">Ending Cash Reserve ({durationMonths} mo)</td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-900">{formatCurrency(startingCash + baselineProfit * durationMonths, currency)}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{formatCurrency(result.endingCash, currency)}</td>
                        <td className="py-2.5 px-4 text-right font-mono">
                          <span className={result.endingCash >= startingCash ? 'text-emerald-700' : 'text-red-600'}>
                            {formatCurrency(result.endingCash - (startingCash + baselineProfit * durationMonths), currency, { showSign: true })}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Visual Recharts Bar Comparison */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4">
                  Visual Side-by-Side Comparison
                </h3>

                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(val: any) => [formatCurrency(Number(val), currency), '']}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                      <Bar dataKey="Baseline" fill="#94A3B8" radius={[4, 4, 0, 0]} maxBarSize={36} />
                      <Bar dataKey="Simulated" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={36} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
