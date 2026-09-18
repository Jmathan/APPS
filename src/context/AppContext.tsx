import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Transaction,
  User,
  CurrencyCode,
  ScenarioInputs,
  DashboardMetrics,
  MonthlyMetric,
  CategoryBreakdown,
  HealthScoreResult,
  FinancialAlert,
} from '../types';
import {
  calculateDashboardMetrics,
  calculateMonthlyMetrics,
  calculateCategoryBreakdown,
  calculateHealthScore,
  generateDashboardAlerts,
  generateRuleBasedInsights,
} from '../utils/calculations';
import { DEMO_USER, DEMO_STARTING_CASH, getDemoTransactions, DEMO_SCENARIOS } from '../data/demoData';
import { exportTransactionsToCSV, parseTransactionsCSV } from '../utils/csv';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => boolean;
  signup: (userData: Omit<User, 'id' | 'createdAt'>, pass: string) => boolean;
  logout: () => void;
  loadDemoUser: () => void;

  // Settings
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  startingCash: number;
  setStartingCash: (amt: number) => void;
  isDemoActive: boolean;

  // Transactions
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  loadDemoData: () => void;
  clearDemoData: () => void;
  clearAllTransactions: () => void;
  importCSV: (csvText: string) => { count: number; errors: string[] };
  exportCSV: () => void;

  // Scenarios
  scenarios: ScenarioInputs[];
  saveScenario: (scenario: ScenarioInputs) => void;
  deleteScenario: (id: string) => void;

  // Real-time Calculated States
  metrics: DashboardMetrics;
  monthlyMetrics: MonthlyMetric[];
  revenueCategories: CategoryBreakdown[];
  expenseCategories: CategoryBreakdown[];
  healthScore: HealthScoreResult;
  alerts: FinancialAlert[];
  insights: string[];

  // Navigation state (for in-app single page view routing)
  currentRoute: string;
  navigateTo: (route: string) => void;

  // Notification Toasts
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
}

const STORAGE_KEYS = {
  USER: 'bizguard_user_v1',
  TRANSACTIONS: 'bizguard_tx_v1',
  STARTING_CASH: 'bizguard_cash_v1',
  CURRENCY: 'bizguard_curr_v1',
  SCENARIOS: 'bizguard_scenarios_v1',
  IS_DEMO: 'bizguard_is_demo_v1',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || '/';
  });

  const navigateTo = useCallback((route: string) => {
    setCurrentRoute(route);
    window.location.hash = route;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) setCurrentRoute(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // User Auth
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) {
        const parsed: User = JSON.parse(saved);
        if (parsed && parsed.email && parsed.email.toLowerCase() === 'arjun@democafe.com') {
          parsed.email = 'Yash@Democafe.com';
          if (parsed.fullName === 'Arjun Sharma') {
            parsed.fullName = 'Yash Sharma';
          }
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    // Default to Demo Café user so app is immediately alive and previewable
    return DEMO_USER;
  });

  // Settings
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENCY) as CurrencyCode;
      if (saved) return saved;
    } catch (e) {
      console.error(e);
    }
    return 'INR';
  });

  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENCY, c);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const [startingCash, setStartingCashState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STARTING_CASH);
      if (saved) return Number(saved);
    } catch (e) {
      console.error(e);
    }
    return DEMO_STARTING_CASH;
  });

  const setStartingCash = useCallback((amt: number) => {
    setStartingCashState(amt);
    try {
      localStorage.setItem(STORAGE_KEYS.STARTING_CASH, String(amt));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const [isDemoActive, setIsDemoActive] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.IS_DEMO);
      if (saved !== null) return saved === 'true';
    } catch (e) {
      console.error(e);
    }
    return true; // default demo active on first launch
  });

  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    // Default to Demo Café transactions so live charts, KPIs, break-even work instantly
    return getDemoTransactions();
  });

  // Scenarios
  const [scenarios, setScenarios] = useState<ScenarioInputs[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCENARIOS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEMO_SCENARIOS;
  });

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error(e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify(scenarios));
    } catch (e) {
      console.error(e);
    }
  }, [scenarios]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.IS_DEMO, String(isDemoActive));
    } catch (e) {
      console.error(e);
    }
  }, [isDemoActive]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  // Real-time calculations: memoized directly from transactions
  const metrics = useMemo(() => {
    return calculateDashboardMetrics(transactions, startingCash);
  }, [transactions, startingCash]);

  const monthlyMetrics = useMemo(() => {
    return calculateMonthlyMetrics(transactions);
  }, [transactions]);

  const revenueCategories = useMemo(() => {
    return calculateCategoryBreakdown(transactions, 'revenue');
  }, [transactions]);

  const expenseCategories = useMemo(() => {
    return calculateCategoryBreakdown(transactions, 'expense');
  }, [transactions]);

  const healthScore = useMemo(() => {
    return calculateHealthScore(metrics, monthlyMetrics);
  }, [metrics, monthlyMetrics]);

  const alerts = useMemo(() => {
    return generateDashboardAlerts(metrics, monthlyMetrics);
  }, [metrics, monthlyMetrics]);

  const insights = useMemo(() => {
    return generateRuleBasedInsights(metrics, monthlyMetrics, expenseCategories);
  }, [metrics, monthlyMetrics, expenseCategories]);

  // Transaction CRUD handlers
  const addTransaction = useCallback((txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      isDemo: false,
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Added ${newTx.type === 'revenue' ? 'Revenue' : 'Expense'}: ${newTx.description}`, 'success');
  }, [showToast]);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx))
    );
    showToast('Transaction updated successfully', 'success');
  }, [showToast]);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    showToast('Transaction deleted', 'info');
  }, [showToast]);

  const loadDemoData = useCallback(() => {
    const demoTx = getDemoTransactions();
    setTransactions(demoTx);
    setScenarios(DEMO_SCENARIOS);
    setStartingCashState(DEMO_STARTING_CASH);
    setIsDemoActive(true);
    setUser(DEMO_USER);
    showToast('Loaded Demo Café financial data (6 months history)', 'success');
  }, [showToast]);

  const clearDemoData = useCallback(() => {
    setTransactions((prev) => prev.filter((tx) => !tx.isDemo));
    setIsDemoActive(false);
    showToast('Demo data removed. Only your entered data remains.', 'info');
  }, [showToast]);

  const clearAllTransactions = useCallback(() => {
    setTransactions([]);
    setIsDemoActive(false);
    showToast('All transaction records cleared.', 'info');
  }, [showToast]);

  const importCSV = useCallback((csvText: string) => {
    const { transactions: parsedTx, errors } = parseTransactionsCSV(csvText);
    if (parsedTx.length > 0) {
      setTransactions((prev) => [...parsedTx, ...prev]);
      showToast(`Imported ${parsedTx.length} transactions from CSV`, 'success');
    }
    return { count: parsedTx.length, errors };
  }, [showToast]);

  const exportCSV = useCallback(() => {
    exportTransactionsToCSV(transactions, `bizguard_${user?.businessName.toLowerCase().replace(/\s+/g, '_') || 'business'}_transactions.csv`);
    showToast('CSV export downloaded', 'success');
  }, [transactions, user, showToast]);

  // Scenarios CRUD
  const saveScenario = useCallback((scenario: ScenarioInputs) => {
    setScenarios((prev) => {
      const idx = prev.findIndex((s) => s.id === scenario.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = scenario;
        return next;
      }
      return [scenario, ...prev];
    });
    showToast(`Saved simulation scenario: "${scenario.name}"`, 'success');
  }, [showToast]);

  const deleteScenario = useCallback((id: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
    showToast('Scenario deleted', 'info');
  }, [showToast]);

  // Auth methods
  const login = useCallback((email: string, pass: string): boolean => {
    if (!email || !pass) {
      showToast('Please enter both email and password', 'error');
      return false;
    }
    // Simulate user login verification
    const newUser: User = {
      id: `usr-${Date.now()}`,
      fullName: email.split('@')[0].replace('.', ' '),
      email,
      businessName: `${email.split('@')[0]} Enterprises`,
      industry: 'General Services',
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    showToast(`Welcome back, ${newUser.fullName}!`, 'success');
    navigateTo('/dashboard');
    return true;
  }, [navigateTo, showToast]);

  const signup = useCallback((userData: Omit<User, 'id' | 'createdAt'>, pass: string): boolean => {
    if (!userData.email || !userData.fullName || !pass || !userData.businessName) {
      showToast('Please complete all required signup fields', 'error');
      return false;
    }
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    showToast(`Account created for ${newUser.businessName}!`, 'success');
    navigateTo('/dashboard');
    return true;
  }, [navigateTo, showToast]);

  const logout = useCallback(() => {
    setUser(null);
    showToast('Logged out successfully', 'info');
    navigateTo('/');
  }, [navigateTo, showToast]);

  const loadDemoUser = useCallback(() => {
    setUser(DEMO_USER);
    loadDemoData();
    navigateTo('/dashboard');
  }, [loadDemoData, navigateTo]);

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        loadDemoUser,
        currency,
        setCurrency,
        startingCash,
        setStartingCash,
        isDemoActive,
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        loadDemoData,
        clearDemoData,
        clearAllTransactions,
        importCSV,
        exportCSV,
        scenarios,
        saveScenario,
        deleteScenario,
        metrics,
        monthlyMetrics,
        revenueCategories,
        expenseCategories,
        healthScore,
        alerts,
        insights,
        currentRoute,
        navigateTo,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
