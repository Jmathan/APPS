import {
  Transaction,
  DashboardMetrics,
  MonthlyMetric,
  CategoryBreakdown,
  BreakEvenInputs,
  BreakEvenResult,
  CashRunwayInputs,
  CashRunwayResult,
  MonthCashForecast,
  ScenarioInputs,
  ScenarioCalculationResult,
  HealthScoreResult,
  FinancialAlert,
  TransactionType,
} from '../types';

export const CATEGORY_COLORS: Record<string, string> = {
  'Product Sales': '#10B981', // emerald
  'Service Income': '#3B82F6', // blue
  'Other Income': '#8B5CF6', // purple
  'Rent': '#F59E0B', // amber
  'Salaries': '#EF4444', // red
  'Utilities': '#06B6D4', // cyan
  'Materials': '#EC4899', // pink
  'Marketing': '#6366F1', // indigo
  'Transport': '#14B8A6', // teal
  'Loan Payment': '#F97316', // orange
  'Other Expenses': '#64748B', // slate
};

/**
 * Calculate Top-level KPIs from transaction list
 */
export function calculateDashboardMetrics(
  transactions: Transaction[],
  startingCash = 0
): DashboardMetrics {
  let totalRevenue = 0;
  let totalExpenses = 0;

  transactions.forEach((tx) => {
    if (tx.type === 'revenue') {
      totalRevenue += tx.amount;
    } else if (tx.type === 'expense') {
      totalExpenses += tx.amount;
    }
  });

  const netProfit = totalRevenue - totalExpenses;
  const currentCash = startingCash + netProfit;

  // Profit Margin = (Net Profit / Total Revenue) * 100
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : null;

  // Monthly stats to determine burn rate
  const monthlyData = calculateMonthlyMetrics(transactions);
  const monthCount = Math.max(monthlyData.length, 1);

  const avgMonthlyRevenue = totalRevenue / monthCount;
  const avgMonthlyExpenses = totalExpenses / monthCount;
  const avgMonthlyNetCashFlow = avgMonthlyRevenue - avgMonthlyExpenses;

  let cashRunwayMonths: number | null = null;
  let monthlyBurnRate = 0;

  if (avgMonthlyNetCashFlow < 0) {
    monthlyBurnRate = Math.abs(avgMonthlyNetCashFlow);
    if (currentCash > 0 && monthlyBurnRate > 0) {
      cashRunwayMonths = Math.round((currentCash / monthlyBurnRate) * 10) / 10;
    } else {
      cashRunwayMonths = 0;
    }
  } else {
    // If net cash flow is >= 0, business is profitable / self-sustaining
    cashRunwayMonths = null;
    monthlyBurnRate = 0;
  }

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    currentCash,
    profitMargin,
    cashRunwayMonths,
    monthlyBurnRate,
    avgMonthlyRevenue,
    avgMonthlyExpenses,
    transactionCount: transactions.length,
  };
}

/**
 * Calculate Monthly aggregated metrics
 */
export function calculateMonthlyMetrics(transactions: Transaction[]): MonthlyMetric[] {
  if (transactions.length === 0) return [];

  // Group by YYYY-MM
  const map: Record<string, { revenue: number; expenses: number }> = {};

  transactions.forEach((tx) => {
    const monthKey = tx.date.substring(0, 7); // "YYYY-MM"
    if (!map[monthKey]) {
      map[monthKey] = { revenue: 0, expenses: 0 };
    }
    if (tx.type === 'revenue') {
      map[monthKey].revenue += tx.amount;
    } else {
      map[monthKey].expenses += tx.amount;
    }
  });

  // Sort chronological
  const sortedKeys = Object.keys(map).sort();
  let runningCash = 0;

  const result: MonthlyMetric[] = sortedKeys.map((key, index) => {
    const { revenue, expenses } = map[key];
    const netProfit = revenue - expenses;
    runningCash += netProfit;

    // Growth calculation
    let revenueGrowthPct: number | null = null;
    let expenseGrowthPct: number | null = null;

    if (index > 0) {
      const prevKey = sortedKeys[index - 1];
      const prevRev = map[prevKey].revenue;
      const prevExp = map[prevKey].expenses;

      if (prevRev > 0) {
        revenueGrowthPct = ((revenue - prevRev) / prevRev) * 100;
      }
      if (prevExp > 0) {
        expenseGrowthPct = ((expenses - prevExp) / prevExp) * 100;
      }
    }

    // Format display month, e.g. "2026-03" -> "Mar 2026"
    const [yearStr, monthStr] = key.split('-');
    const dateObj = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, 1);
    const displayMonth = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : null;

    return {
      monthKey: key,
      displayMonth,
      revenue,
      expenses,
      netProfit,
      cumulativeCash: runningCash,
      profitMargin,
      revenueGrowthPct,
      expenseGrowthPct,
    };
  });

  return result;
}

/**
 * Category breakdown for Revenue or Expense
 */
export function calculateCategoryBreakdown(
  transactions: Transaction[],
  type: TransactionType
): CategoryBreakdown[] {
  const filtered = transactions.filter((tx) => tx.type === type);
  const total = filtered.reduce((sum, tx) => sum + tx.amount, 0);

  const categoryMap: Record<string, { amount: number; count: number }> = {};

  filtered.forEach((tx) => {
    if (!categoryMap[tx.category]) {
      categoryMap[tx.category] = { amount: 0, count: 0 };
    }
    categoryMap[tx.category].amount += tx.amount;
    categoryMap[tx.category].count += 1;
  });

  return Object.entries(categoryMap)
    .map(([cat, data]) => ({
      category: cat,
      amount: data.amount,
      percentage: total > 0 ? (data.amount / total) * 100 : 0,
      count: data.count,
      color: CATEGORY_COLORS[cat] || '#64748B',
    }))
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Break-even calculation with complete validations
 */
export function calculateBreakEven(inputs: BreakEvenInputs): BreakEvenResult {
  const { fixedCosts, sellingPricePerUnit, variableCostPerUnit, expectedSalesUnits } = inputs;

  // Validation
  if (sellingPricePerUnit < 0 || variableCostPerUnit < 0 || fixedCosts < 0 || expectedSalesUnits < 0) {
    return {
      contributionMargin: 0,
      contributionMarginRatio: 0,
      breakEvenUnits: 0,
      breakEvenRevenue: 0,
      expectedRevenue: 0,
      expectedTotalCost: 0,
      expectedProfit: 0,
      marginOfSafetyUnits: 0,
      marginOfSafetyRevenue: 0,
      marginOfSafetyPercentage: 0,
      isViable: false,
      errorMessage: 'Financial values cannot be negative.',
    };
  }

  const contributionMargin = sellingPricePerUnit - variableCostPerUnit;

  if (contributionMargin <= 0) {
    const expectedRevenue = sellingPricePerUnit * expectedSalesUnits;
    const expectedTotalCost = fixedCosts + variableCostPerUnit * expectedSalesUnits;
    return {
      contributionMargin,
      contributionMarginRatio: sellingPricePerUnit > 0 ? (contributionMargin / sellingPricePerUnit) * 100 : 0,
      breakEvenUnits: 0,
      breakEvenRevenue: 0,
      expectedRevenue,
      expectedTotalCost,
      expectedProfit: expectedRevenue - expectedTotalCost,
      marginOfSafetyUnits: 0,
      marginOfSafetyRevenue: 0,
      marginOfSafetyPercentage: 0,
      isViable: false,
      errorMessage: 'Break-even cannot be reached under these assumptions (Selling Price must exceed Variable Cost).',
    };
  }

  const breakEvenUnits = Math.ceil(fixedCosts / contributionMargin);
  const breakEvenRevenue = breakEvenUnits * sellingPricePerUnit;
  const contributionMarginRatio = (contributionMargin / sellingPricePerUnit) * 100;

  const expectedRevenue = sellingPricePerUnit * expectedSalesUnits;
  const expectedTotalCost = fixedCosts + variableCostPerUnit * expectedSalesUnits;
  const expectedProfit = expectedRevenue - expectedTotalCost;

  const marginOfSafetyUnits = expectedSalesUnits - breakEvenUnits;
  const marginOfSafetyRevenue = marginOfSafetyUnits * sellingPricePerUnit;
  const marginOfSafetyPercentage = expectedSalesUnits > 0 ? (marginOfSafetyUnits / expectedSalesUnits) * 100 : 0;

  return {
    contributionMargin,
    contributionMarginRatio,
    breakEvenUnits,
    breakEvenRevenue,
    expectedRevenue,
    expectedTotalCost,
    expectedProfit,
    marginOfSafetyUnits,
    marginOfSafetyRevenue,
    marginOfSafetyPercentage,
    isViable: true,
  };
}

/**
 * Cash Runway calculation & 12-Month Projection Forecast
 */
export function calculateCashRunway(inputs: CashRunwayInputs): CashRunwayResult {
  const { availableCash, avgMonthlyExpenses, avgMonthlyRevenue, additionalMonthlyCashOutflow } = inputs;

  const totalMonthlyOutflow = avgMonthlyExpenses + additionalMonthlyCashOutflow;
  const monthlyCashFlow = avgMonthlyRevenue - totalMonthlyOutflow;
  const isBurningCash = monthlyCashFlow < 0;
  const monthlyCashBurn = isBurningCash ? Math.abs(monthlyCashFlow) : 0;

  let cashRunwayMonths: number | null = null;
  let estimatedCashExhaustionDate: string | null = null;
  let financialStatus: CashRunwayResult['financialStatus'] = 'Profitable / Self-Sustaining';
  let statusColor: CashRunwayResult['statusColor'] = 'green';
  let statusMessage = '';

  if (isBurningCash) {
    if (availableCash <= 0) {
      cashRunwayMonths = 0;
      financialStatus = 'Cash Depleted';
      statusColor = 'red';
      statusMessage = 'Cash reserves are depleted. Immediate financing or aggressive expense reduction is required.';
    } else if (monthlyCashBurn > 0) {
      const rawMonths = availableCash / monthlyCashBurn;
      cashRunwayMonths = Math.round(rawMonths * 10) / 10;

      // Project date
      const now = new Date();
      const exhaustionDate = new Date(now.getFullYear(), now.getMonth() + Math.floor(rawMonths), 1);
      estimatedCashExhaustionDate = exhaustionDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      if (rawMonths < 3) {
        financialStatus = 'Critical Runway (<6 mos)';
        statusColor = 'red';
        statusMessage = `Critical emergency: Business has approximately ${cashRunwayMonths} months of cash left at current burn rate.`;
      } else if (rawMonths < 6) {
        financialStatus = 'Critical Runway (<6 mos)';
        statusColor = 'red';
        statusMessage = `High alert: Estimated runway is ${cashRunwayMonths} months. Plan fundraising, credit, or revenue boost.`;
      } else if (rawMonths <= 12) {
        financialStatus = 'Moderate Runway (6-12 mos)';
        statusColor = 'amber';
        statusMessage = `Moderate cushion: Estimated runway is ${cashRunwayMonths} months. Monitor discretionary outflows closely.`;
      } else {
        financialStatus = 'Healthy Runway (>12 mos)';
        statusColor = 'green';
        statusMessage = `Strong cushion: Estimated runway exceeds 12 months (${cashRunwayMonths} months available).`;
      }
    }
  } else {
    cashRunwayMonths = null;
    financialStatus = 'Profitable / Self-Sustaining';
    statusColor = 'green';
    statusMessage = 'Your business is not currently burning cash under these assumptions. Monthly revenues cover all obligations.';
  }

  // Generate 12-month projection
  const forecast12Months: MonthCashForecast[] = [];
  let runningCash = availableCash;
  const now = new Date();

  for (let i = 1; i <= 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const openingCash = runningCash;
    const closingCash = openingCash + monthlyCashFlow;
    runningCash = closingCash;

    const isDepleted = closingCash <= 0;
    let status: MonthCashForecast['status'] = 'Healthy';
    if (isDepleted) {
      status = 'Depleted';
    } else if (closingCash < totalMonthlyOutflow * 2) {
      status = 'Caution';
    }

    forecast12Months.push({
      monthIndex: i,
      monthName,
      openingCash,
      revenue: avgMonthlyRevenue,
      expenses: totalMonthlyOutflow,
      netCashFlow: monthlyCashFlow,
      closingCash,
      isDepleted,
      status,
    });
  }

  return {
    monthlyCashFlow,
    monthlyCashBurn,
    isBurningCash,
    cashRunwayMonths,
    estimatedCashExhaustionDate,
    financialStatus,
    statusColor,
    statusMessage,
    forecast12Months,
  };
}

/**
 * What-If Scenario Calculation
 */
export function calculateScenario(inputs: ScenarioInputs): ScenarioCalculationResult {
  const {
    baseRevenue,
    baseExpenses,
    startingCash,
    revenueChangePct,
    expenseChangePct,
    additionalMonthlyFixedCost,
    additionalMonthlyRevenue,
    hiringCost,
    expansionCost,
    oneTimeInvestment,
    durationMonths,
  } = inputs;

  // Scenario Monthly Revenue
  const scenarioRevenue = baseRevenue * (1 + revenueChangePct / 100) + additionalMonthlyRevenue;

  // Scenario Monthly Expenses
  const scenarioExpenses =
    baseExpenses * (1 + expenseChangePct / 100) + additionalMonthlyFixedCost + hiringCost;

  // Scenario Profit
  const scenarioProfit = scenarioRevenue - scenarioExpenses;

  // Scenario Monthly Cash Flow (subtract monthly expansion amortization or outflow if any)
  const scenarioMonthlyCashFlow = scenarioProfit - (expansionCost > 0 ? expansionCost / Math.max(durationMonths, 1) : 0);

  // Profit Margin
  const profitMargin = scenarioRevenue > 0 ? (scenarioProfit / scenarioRevenue) * 100 : null;

  // Cash Runway
  let cashRunwayMonths: number | null = null;
  const netStartingCashAfterOneTime = Math.max(0, startingCash - oneTimeInvestment);

  if (scenarioMonthlyCashFlow < 0) {
    const burn = Math.abs(scenarioMonthlyCashFlow);
    cashRunwayMonths = burn > 0 ? Math.round((netStartingCashAfterOneTime / burn) * 10) / 10 : 0;
  }

  // Rough break-even units if assume standard unit price of base revenue ratio
  const breakEvenUnitsEstimated = scenarioExpenses > 0 ? Math.round(scenarioExpenses / Math.max(scenarioRevenue * 0.4, 100)) : 0;

  // Generate monthly trajectory
  const monthlyTrajectory = [];
  let currentCash = netStartingCashAfterOneTime;

  for (let m = 1; m <= durationMonths; m++) {
    currentCash += scenarioMonthlyCashFlow;
    monthlyTrajectory.push({
      month: m,
      monthLabel: `Mo ${m}`,
      revenue: scenarioRevenue,
      expenses: scenarioExpenses,
      profit: scenarioProfit,
      projectedCash: currentCash,
    });
  }

  const endingCash = currentCash;

  return {
    scenarioRevenue,
    scenarioExpenses,
    scenarioProfit,
    scenarioMonthlyCashFlow,
    endingCash,
    cashRunwayMonths,
    breakEvenUnitsEstimated,
    profitMargin,
    monthlyTrajectory,
  };
}

/**
 * Financial Health Score (0-100) across 5 core transparent pillars:
 * 1. Profitability (30 pts)
 * 2. Cash Position (25 pts)
 * 3. Expense Control (20 pts)
 * 4. Revenue Trend (15 pts)
 * 5. Cash Runway (10 pts)
 */
export function calculateHealthScore(
  metrics: DashboardMetrics,
  monthlyData: MonthlyMetric[]
): HealthScoreResult {
  const { totalRevenue, totalExpenses, netProfit, currentCash, avgMonthlyExpenses, cashRunwayMonths } = metrics;

  // 1. Profitability (Max 30)
  let profitScore = 0;
  let profitStatus: HealthScoreResult['status'] = 'Needs Attention';
  let profitExplanation = '';
  const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : null;

  if (margin === null) {
    profitScore = 10;
    profitStatus = 'Needs Attention';
    profitExplanation = 'No recorded revenue yet. Record sales to evaluate profitability.';
  } else if (margin >= 25) {
    profitScore = 30;
    profitStatus = 'Strong';
    profitExplanation = `Exceptional profit margin of ${margin.toFixed(1)}% generates healthy retained earnings.`;
  } else if (margin >= 15) {
    profitScore = 24;
    profitStatus = 'Strong';
    profitExplanation = `Solid profit margin of ${margin.toFixed(1)}% outperforms typical small business benchmarks.`;
  } else if (margin >= 5) {
    profitScore = 18;
    profitStatus = 'Stable';
    profitExplanation = `Modest profitability (${margin.toFixed(1)}%). Consider price optimization or efficiency gains.`;
  } else if (margin >= 0) {
    profitScore = 12;
    profitStatus = 'Needs Attention';
    profitExplanation = `Near break-even (${margin.toFixed(1)}%). Sensitive to minor cost spikes.`;
  } else {
    profitScore = 4;
    profitStatus = 'High Risk';
    profitExplanation = `Negative margin (${margin.toFixed(1)}%). Business is incurring operational losses.`;
  }

  // 2. Cash Position (Max 25) - Cash buffer in months of average expenses
  let cashScore = 0;
  let cashStatus: HealthScoreResult['status'] = 'Needs Attention';
  let cashExplanation = '';
  const expenseMonthsBuffer = avgMonthlyExpenses > 0 ? currentCash / avgMonthlyExpenses : currentCash > 0 ? 12 : 0;

  if (expenseMonthsBuffer >= 6) {
    cashScore = 25;
    cashStatus = 'Strong';
    cashExplanation = `Outstanding liquidity: ${expenseMonthsBuffer.toFixed(1)} months of operational expense reserves.`;
  } else if (expenseMonthsBuffer >= 3) {
    cashScore = 20;
    cashStatus = 'Stable';
    cashExplanation = `Adequate liquidity: ${expenseMonthsBuffer.toFixed(1)} months of operating expenses in reserve.`;
  } else if (expenseMonthsBuffer >= 1) {
    cashScore = 12;
    cashStatus = 'Needs Attention';
    cashExplanation = `Tight liquidity: Only ${expenseMonthsBuffer.toFixed(1)} months of expenses reserved. Build safety cushion.`;
  } else {
    cashScore = 4;
    cashStatus = 'High Risk';
    cashExplanation = `Critical cash vulnerability: Under 1 month of operating expense liquidity.`;
  }

  // 3. Expense Control (Max 20) - Expense to Revenue Ratio
  let expenseScore = 0;
  let expenseStatus: HealthScoreResult['status'] = 'Needs Attention';
  let expenseExplanation = '';
  const expenseRatio = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 100;

  if (totalRevenue === 0 && totalExpenses === 0) {
    expenseScore = 10;
    expenseStatus = 'Stable';
    expenseExplanation = 'Awaiting initial transactions.';
  } else if (expenseRatio <= 65) {
    expenseScore = 20;
    expenseStatus = 'Strong';
    expenseExplanation = `Disciplined expense control (${expenseRatio.toFixed(1)}% of revenue).`;
  } else if (expenseRatio <= 80) {
    expenseScore = 16;
    expenseStatus = 'Stable';
    expenseExplanation = `Healthy expense ratio (${expenseRatio.toFixed(1)}% of revenue).`;
  } else if (expenseRatio <= 95) {
    expenseScore = 10;
    expenseStatus = 'Needs Attention';
    expenseExplanation = `High cost ratio (${expenseRatio.toFixed(1)}%). Little margin for error.`;
  } else {
    expenseScore = 3;
    expenseStatus = 'High Risk';
    expenseExplanation = `Expenses consume ${expenseRatio.toFixed(1)}% of revenue, depleting working capital.`;
  }

  // 4. Revenue Trend (Max 15) - Recent Month-over-Month trajectory
  let revenueScore = 0;
  let revenueStatus: HealthScoreResult['status'] = 'Stable';
  let revenueExplanation = '';

  if (monthlyData.length >= 2) {
    const latestMonth = monthlyData[monthlyData.length - 1];
    const growth = latestMonth.revenueGrowthPct;

    if (growth === null) {
      revenueScore = 10;
      revenueExplanation = 'Revenue is steady across initial reporting periods.';
    } else if (growth >= 15) {
      revenueScore = 15;
      revenueStatus = 'Strong';
      revenueExplanation = `Accelerating top-line revenue (+${growth.toFixed(1)}% vs previous period).`;
    } else if (growth >= 5) {
      revenueScore = 13;
      revenueStatus = 'Strong';
      revenueExplanation = `Positive revenue growth (+${growth.toFixed(1)}%).`;
    } else if (growth >= -5) {
      revenueScore = 10;
      revenueStatus = 'Stable';
      revenueExplanation = `Consistent revenue stability (${growth.toFixed(1)}%).`;
    } else {
      revenueScore = 4;
      revenueStatus = 'High Risk';
      revenueExplanation = `Revenue contracted by ${Math.abs(growth).toFixed(1)}% in the latest period.`;
    }
  } else {
    revenueScore = 10;
    revenueExplanation = 'Single period recorded. Track multiple months to assess growth dynamics.';
  }

  // 5. Cash Runway (Max 10)
  let runwayScore = 0;
  let runwayStatus: HealthScoreResult['status'] = 'Strong';
  let runwayExplanation = '';

  if (cashRunwayMonths === null) {
    // Profitable / not burning cash
    runwayScore = 10;
    runwayStatus = 'Strong';
    runwayExplanation = 'Self-sustaining operations: Business is generating net positive cash flow.';
  } else if (cashRunwayMonths >= 12) {
    runwayScore = 9;
    runwayStatus = 'Strong';
    runwayExplanation = `${cashRunwayMonths} months runway available. Comfortable runway buffer.`;
  } else if (cashRunwayMonths >= 6) {
    runwayScore = 6;
    runwayStatus = 'Stable';
    runwayExplanation = `${cashRunwayMonths} months runway available. Plan next milestones proactively.`;
  } else if (cashRunwayMonths >= 3) {
    runwayScore = 3;
    runwayStatus = 'Needs Attention';
    runwayExplanation = `${cashRunwayMonths} months runway remaining. Cash conservation recommended.`;
  } else {
    runwayScore = 1;
    runwayStatus = 'High Risk';
    runwayExplanation = `Critical runway alert: ${cashRunwayMonths} months or less before cash exhaustion.`;
  }

  const overallScore = Math.min(
    100,
    Math.max(0, profitScore + cashScore + expenseScore + revenueScore + runwayScore)
  );

  let overallStatus: HealthScoreResult['status'] = 'Stable';
  let statusColor = '#3B82F6'; // blue
  let summaryText = '';

  if (overallScore >= 80) {
    overallStatus = 'Strong';
    statusColor = '#10B981'; // emerald
    summaryText = 'Strong financial resilience. Your business maintains healthy profitability, steady cash reserves, and disciplined overhead control.';
  } else if (overallScore >= 60) {
    overallStatus = 'Stable';
    statusColor = '#3B82F6'; // blue
    summaryText = 'Stable operational baseline with viable fundamentals. Targeted improvements in margin or expense control will elevate safety.';
  } else if (overallScore >= 40) {
    overallStatus = 'Needs Attention';
    statusColor = '#F59E0B'; // amber
    summaryText = 'Financial health requires focused attention. High expense ratios or limited cash cushions expose the business to downside shocks.';
  } else {
    overallStatus = 'High Risk';
    statusColor = '#EF4444'; // red
    summaryText = 'High financial risk profile. Operating losses or rapid cash burn threaten continuity without swift corrective actions.';
  }

  // Actionable recommendations
  const recommendations: string[] = [];
  if (profitScore < 20) {
    recommendations.push('Audit product/service unit economics and eliminate negative-margin offerings.');
  }
  if (cashScore < 15) {
    recommendations.push('Establish a disciplined cash buffer target of at least 3 months of fixed operating expenses.');
  }
  if (expenseScore < 15) {
    recommendations.push('Renegotiate top vendor agreements and audit subscription/utility recurring overhead.');
  }
  if (runwayScore < 6) {
    recommendations.push('Prepare an emergency cash preservation plan and defer non-essential capital investments.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Maintain current financial discipline and model growth scenarios before committing to large expansions.');
    recommendations.push('Periodically review break-even points as supplier costs or staff levels fluctuate.');
  }

  return {
    overallScore,
    status: overallStatus,
    statusColor,
    summaryText,
    components: {
      profitability: {
        id: 'profitability',
        name: 'Profitability',
        score: profitScore,
        maxScore: 30,
        status: profitStatus,
        explanation: profitExplanation,
        metricLabel: 'Net Margin',
        metricValue: margin !== null ? `${margin.toFixed(1)}%` : 'N/A',
      },
      cashPosition: {
        id: 'cashPosition',
        name: 'Cash Position',
        score: cashScore,
        maxScore: 25,
        status: cashStatus,
        explanation: cashExplanation,
        metricLabel: 'Expense Coverage',
        metricValue: `${expenseMonthsBuffer.toFixed(1)} mo`,
      },
      expenseControl: {
        id: 'expenseControl',
        name: 'Expense Control',
        score: expenseScore,
        maxScore: 20,
        status: expenseStatus,
        explanation: expenseExplanation,
        metricLabel: 'Expense Ratio',
        metricValue: `${expenseRatio.toFixed(1)}%`,
      },
      revenueTrend: {
        id: 'revenueTrend',
        name: 'Revenue Trend',
        score: revenueScore,
        maxScore: 15,
        status: revenueStatus,
        explanation: revenueExplanation,
        metricLabel: 'Trend',
        metricValue: monthlyData.length > 1 && monthlyData[monthlyData.length - 1].revenueGrowthPct !== null
          ? `${monthlyData[monthlyData.length - 1].revenueGrowthPct! > 0 ? '+' : ''}${monthlyData[monthlyData.length - 1].revenueGrowthPct!.toFixed(1)}%`
          : 'Baseline',
      },
      cashRunway: {
        id: 'cashRunway',
        name: 'Cash Runway',
        score: runwayScore,
        maxScore: 10,
        status: runwayStatus,
        explanation: runwayExplanation,
        metricLabel: 'Runway',
        metricValue: cashRunwayMonths !== null ? `${cashRunwayMonths} mo` : 'Self-sustaining',
      },
    },
    recommendations,
  };
}

/**
 * Generate transparent, calculation-grounded Alerts for the Dashboard
 */
export function generateDashboardAlerts(
  metrics: DashboardMetrics,
  monthlyData: MonthlyMetric[]
): FinancialAlert[] {
  const alerts: FinancialAlert[] = [];

  // Alert 1: Negative profit
  if (metrics.netProfit < 0) {
    alerts.push({
      id: 'net-loss',
      type: 'danger',
      title: 'Operating Loss Detected',
      message: `Total expenses exceed revenue by ${Math.abs(metrics.netProfit).toLocaleString()}. Focus on immediate cost-cutting or revenue acceleration.`,
      actionRoute: '/break-even',
      actionLabel: 'Check Break-Even',
    });
  }

  // Alert 2: Low cash runway
  if (metrics.cashRunwayMonths !== null) {
    if (metrics.cashRunwayMonths <= 3) {
      alerts.push({
        id: 'critical-runway',
        type: 'danger',
        title: 'Critical Cash Runway Warning',
        message: `Only ${metrics.cashRunwayMonths} months of cash remaining at current net burn rate. Action is urgently required.`,
        actionRoute: '/cash-runway',
        actionLabel: 'View Runway Details',
      });
    } else if (metrics.cashRunwayMonths <= 6) {
      alerts.push({
        id: 'caution-runway',
        type: 'warning',
        title: 'Tight Cash Runway',
        message: `Current reserves will sustain operations for approximately ${metrics.cashRunwayMonths} months.`,
        actionRoute: '/cash-runway',
        actionLabel: 'Forecast Cash',
      });
    }
  }

  // Alert 3: Declining revenue
  if (monthlyData.length >= 2) {
    const latest = monthlyData[monthlyData.length - 1];
    if (latest.revenueGrowthPct !== null && latest.revenueGrowthPct < -10) {
      alerts.push({
        id: 'declining-revenue',
        type: 'warning',
        title: 'Top-Line Revenue Decline',
        message: `Revenue contracted by ${Math.abs(latest.revenueGrowthPct).toFixed(1)}% in the latest monthly period.`,
        actionRoute: '/analytics',
        actionLabel: 'Analyze Revenue',
      });
    }

    // High expense growth
    if (latest.expenseGrowthPct !== null && latest.expenseGrowthPct > 25) {
      alerts.push({
        id: 'expense-spike',
        type: 'warning',
        title: 'Rapid Expense Acceleration',
        message: `Monthly operating expenses surged by +${latest.expenseGrowthPct.toFixed(1)}%. Review recent outflows.`,
        actionRoute: '/transactions',
        actionLabel: 'Audit Outflows',
      });
    }
  }

  // Alert 4: Zero transactions
  if (metrics.transactionCount === 0) {
    alerts.push({
      id: 'no-data',
      type: 'info',
      title: 'Welcome to BizGuard',
      message: 'Start by adding your first transaction or load Demo Café to see real-time financial survival metrics.',
      actionRoute: '/transactions',
      actionLabel: 'Add Transaction',
    });
  }

  return alerts;
}

/**
 * Rule-based business insights based on real data
 */
export function generateRuleBasedInsights(
  metrics: DashboardMetrics,
  monthlyData: MonthlyMetric[],
  expenseCategories: CategoryBreakdown[]
): string[] {
  const insights: string[] = [];

  if (metrics.transactionCount === 0) {
    return ['Add transactions to generate data-driven survival insights for your business.'];
  }

  // 1. Revenue vs Expense rule
  if (metrics.totalExpenses > metrics.totalRevenue) {
    insights.push(
      'Your cumulative expenses are currently higher than revenue. Review non-essential overhead to reach operating profitability.'
    );
  } else if (typeof metrics.profitMargin === 'number' && metrics.profitMargin > 20) {
    insights.push(
      `Your business is operating at a healthy ${metrics.profitMargin.toFixed(1)}% net profit margin, well above typical small business benchmarks.`
    );
  }

  // 2. Largest expense category dominance
  if (expenseCategories.length > 0) {
    const topCat = expenseCategories[0];
    if (topCat && typeof topCat.percentage === 'number' && topCat.percentage > 40) {
      insights.push(
        `"${topCat.category}" accounts for ${topCat.percentage.toFixed(1)}% of your total expenditures. Optimizing this single category will have the greatest impact on cash flow.`
      );
    }
  }

  // 3. Month trend
  if (monthlyData.length >= 2) {
    const latest = monthlyData[monthlyData.length - 1];
    if (latest.revenueGrowthPct !== null && latest.revenueGrowthPct < 0) {
      insights.push('Revenue is lower than the previous comparable period. Monitor customer acquisition and retention.');
    }
    if (latest.netProfit > 0) {
      insights.push(
        `The most recent month achieved a positive net profit of ${latest.netProfit.toLocaleString()}.`
      );
    }
  }

  // 4. Runway insight
  if (metrics.cashRunwayMonths !== null && metrics.cashRunwayMonths < 6) {
    insights.push(
      `Estimated cash runway is under 6 months (${metrics.cashRunwayMonths} mo). Avoid unnecessary capital outlays until positive monthly cash flow is re-established.`
    );
  } else if (metrics.cashRunwayMonths === null && metrics.totalRevenue > 0) {
    insights.push('Your business is currently self-sustaining and generating net positive cash flow.');
  }

  return insights;
}
