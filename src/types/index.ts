export type TransactionType = 'revenue' | 'expense';

export type RevenueCategory = 
  | 'Product Sales'
  | 'Service Income'
  | 'Other Income';

export type ExpenseCategory =
  | 'Rent'
  | 'Salaries'
  | 'Utilities'
  | 'Materials'
  | 'Marketing'
  | 'Transport'
  | 'Loan Payment'
  | 'Other Expenses';

export type PaymentStatus = 'completed' | 'pending';

export interface Transaction {
  id: string;
  type: TransactionType;
  title?: string;
  amount: number;
  category: RevenueCategory | ExpenseCategory;
  description: string;
  date: string; // ISO format YYYY-MM-DD
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: string;
  isDemo?: boolean;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  businessName: string;
  industry: string;
  createdAt: string;
}

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
  locale: string;
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  currentCash: number;
  profitMargin: number | null;
  cashRunwayMonths: number | null; // null if profitable / not burning cash
  monthlyBurnRate: number;
  avgMonthlyRevenue: number;
  avgMonthlyExpenses: number;
  transactionCount: number;
}

export interface MonthlyMetric {
  monthKey: string; // YYYY-MM
  displayMonth: string; // "Jan 2026"
  revenue: number;
  expenses: number;
  netProfit: number;
  cumulativeCash: number;
  profitMargin?: number | null;
  revenueGrowthPct: number | null;
  expenseGrowthPct: number | null;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  count: number;
  color?: string;
}

export interface BreakEvenInputs {
  fixedCosts: number;
  sellingPricePerUnit: number;
  variableCostPerUnit: number;
  expectedSalesUnits: number;
}

export interface BreakEvenResult {
  contributionMargin: number;
  contributionMarginRatio: number;
  breakEvenUnits: number;
  breakEvenRevenue: number;
  expectedRevenue: number;
  expectedTotalCost: number;
  expectedProfit: number;
  marginOfSafetyUnits: number;
  marginOfSafetyRevenue: number;
  marginOfSafetyPercentage: number;
  isViable: boolean;
  errorMessage?: string;
}

export interface CashRunwayInputs {
  availableCash: number;
  avgMonthlyExpenses: number;
  avgMonthlyRevenue: number;
  additionalMonthlyCashOutflow: number;
}

export interface MonthCashForecast {
  monthIndex: number;
  monthName: string;
  openingCash: number;
  revenue: number;
  expenses: number;
  netCashFlow: number;
  closingCash: number;
  isDepleted: boolean;
  status: 'Healthy' | 'Caution' | 'Depleted';
}

export interface CashRunwayResult {
  monthlyCashFlow: number;
  monthlyCashBurn: number;
  isBurningCash: boolean;
  cashRunwayMonths: number | null;
  estimatedCashExhaustionDate: string | null;
  financialStatus: 'Profitable / Self-Sustaining' | 'Healthy Runway (>12 mos)' | 'Moderate Runway (6-12 mos)' | 'Critical Runway (<6 mos)' | 'Cash Depleted';
  statusColor: 'green' | 'amber' | 'red';
  statusMessage: string;
  forecast12Months: MonthCashForecast[];
}

export interface ScenarioInputs {
  id: string;
  name: string;
  description?: string;
  // Base numbers (optional override or auto-filled)
  baseRevenue: number;
  baseExpenses: number;
  startingCash: number;
  // Assumptions
  revenueChangePct: number;
  expenseChangePct: number;
  additionalMonthlyFixedCost: number;
  additionalMonthlyRevenue: number;
  hiringCost: number;
  expansionCost: number;
  oneTimeInvestment: number;
  durationMonths: number;
  createdAt: string;
}

export interface ScenarioCalculationResult {
  scenarioRevenue: number;
  scenarioExpenses: number;
  scenarioProfit: number;
  scenarioMonthlyCashFlow: number;
  endingCash: number;
  cashRunwayMonths: number | null;
  breakEvenUnitsEstimated: number;
  profitMargin: number | null;
  monthlyTrajectory: {
    month: number;
    monthLabel: string;
    revenue: number;
    expenses: number;
    profit: number;
    projectedCash: number;
  }[];
}

export interface HealthScoreComponent {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  status: 'Strong' | 'Stable' | 'Needs Attention' | 'High Risk';
  explanation: string;
  metricLabel: string;
  metricValue: string;
}

export interface HealthScoreResult {
  overallScore: number; // 0-100
  status: 'Strong' | 'Stable' | 'Needs Attention' | 'High Risk';
  statusColor: string;
  summaryText: string;
  components: {
    profitability: HealthScoreComponent;
    cashPosition: HealthScoreComponent;
    expenseControl: HealthScoreComponent;
    revenueTrend: HealthScoreComponent;
    cashRunway: HealthScoreComponent;
  };
  recommendations: string[];
}

export interface FinancialAlert {
  id: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  actionRoute?: string;
  actionLabel?: string;
}
