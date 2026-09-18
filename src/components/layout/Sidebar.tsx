import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/currency';
import {
  LayoutDashboard,
  Receipt,
  LineChart,
  Scale,
  Hourglass,
  SlidersHorizontal,
  Activity,
  FileText,
  PlusCircle,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  onOpenAddTx?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenAddTx }) => {
  const { currentRoute, navigateTo, metrics, currency, alerts } = useApp();

  const navItems = [
    {
      label: 'Main Dashboard',
      route: '/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: 'Transactions',
      route: '/transactions',
      icon: Receipt,
      badge: metrics.transactionCount ? String(metrics.transactionCount) : null,
    },
    {
      label: 'Financial Analytics',
      route: '/analytics',
      icon: LineChart,
      badge: null,
    },
    {
      label: 'Break-even Calculator',
      route: '/break-even',
      icon: Scale,
      badge: null,
    },
    {
      label: 'Cash Runway',
      route: '/cash-runway',
      icon: Hourglass,
      badge: metrics.cashRunwayMonths !== null ? `${metrics.cashRunwayMonths} mo` : 'Safe',
      badgeColor: metrics.cashRunwayMonths !== null && metrics.cashRunwayMonths < 6 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800',
    },
    {
      label: 'What-If Simulator',
      route: '/simulator',
      icon: SlidersHorizontal,
      badge: 'Core',
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Financial Health',
      route: '/health-score',
      icon: Activity,
      badge: null,
    },
    {
      label: 'Reports & Insights',
      route: '/reports',
      icon: FileText,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-3 select-none">
      <div className="space-y-4">
        {/* Quick Add Transaction CTA */}
        {onOpenAddTx && (
          <button
            onClick={onOpenAddTx}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm shadow-emerald-700/20 active:scale-[0.98] transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Transaction</span>
          </button>
        )}

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.route;

            return (
              <button
                key={item.route}
                onClick={() => navigateTo(item.route)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      item.badgeColor || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Summary Widget */}
      <div className="pt-4 border-t border-slate-200 space-y-3">
        {alerts.length > 0 && alerts[0].type === 'danger' && (
          <div
            onClick={() => navigateTo(alerts[0].actionRoute || '/dashboard')}
            className="p-2.5 bg-red-50 hover:bg-red-100/70 border border-red-200 rounded-xl cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-1.5 text-red-800 text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-600" />
              <span className="truncate">{alerts[0].title}</span>
            </div>
            <p className="text-[11px] text-red-600 line-clamp-1 mt-0.5">
              {alerts[0].message}
            </p>
          </div>
        )}

        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/90 text-xs">
          <div className="flex items-center justify-between text-slate-500 font-medium text-[11px] mb-1">
            <span>Net Liquid Cash</span>
            <span className={metrics.currentCash >= 0 ? 'text-emerald-600' : 'text-red-600'}>
              {metrics.currentCash >= 0 ? 'Surplus' : 'Deficit'}
            </span>
          </div>
          <div className="text-sm font-extrabold text-slate-900 font-mono tracking-tight">
            {formatCurrency(metrics.currentCash, currency)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600">
            <span>Burn / Mo:</span>
            <span className="font-mono font-semibold text-slate-800">
              {metrics.monthlyBurnRate > 0 ? formatCurrency(metrics.monthlyBurnRate, currency) : '₹0'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
