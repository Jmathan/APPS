import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { BreakEvenPage } from './pages/BreakEvenPage';
import { CashRunwayPage } from './pages/CashRunwayPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { HealthScorePage } from './pages/HealthScorePage';
import { ReportsPage } from './pages/ReportsPage';
import { TransactionModal } from './components/transactions/TransactionModal';

const AppContent: React.FC = () => {
  const { currentRoute, isAuthenticated } = useApp();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Check if current route is a public marketing/auth page
  const isPublic = currentRoute === '/' || currentRoute === '/login' || currentRoute === '/signup';

  const renderContent = () => {
    switch (currentRoute) {
      case '/':
        return <LandingPage />;
      case '/login':
        return <LoginPage />;
      case '/signup':
        return <SignupPage />;
      case '/dashboard':
        return <DashboardPage />;
      case '/transactions':
        return <TransactionsPage />;
      case '/analytics':
        return <AnalyticsPage />;
      case '/break-even':
        return <BreakEvenPage />;
      case '/cash-runway':
        return <CashRunwayPage />;
      case '/simulator':
        return <SimulatorPage />;
      case '/health-score':
        return <HealthScorePage />;
      case '/reports':
        return <ReportsPage />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col antialiased selection:bg-emerald-200 selection:text-emerald-900">
      <Navbar />

      {isPublic ? (
        <main className="flex-1">{renderContent()}</main>
      ) : (
        <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
          {/* Authenticated Desktop Sidebar */}
          <div className="hidden md:block">
            <Sidebar onOpenAddTx={() => setIsQuickAddOpen(true)} />
          </div>

          {/* Main App Page Content */}
          <main className="flex-1 overflow-y-auto min-h-[calc(100vh-4rem)]">
            {renderContent()}
          </main>
        </div>
      )}

      {/* Global Quick Add Transaction Modal */}
      <TransactionModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
