import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldLogo } from '../common/ShieldLogo';
import { CURRENCY_CONFIGS } from '../../utils/currency';
import { CurrencyCode } from '../../types';
import {
  Coins,
  Sparkles,
  LogOut,
  User,
  Menu,
  X,
  Building2,
  ChevronDown,
  Trash2,
  RotateCcw,
  Wallet,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    user,
    isAuthenticated,
    logout,
    currency,
    setCurrency,
    isDemoActive,
    loadDemoData,
    clearDemoData,
    startingCash,
    setStartingCash,
    currentRoute,
    navigateTo,
    loadDemoUser,
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [cashInput, setCashInput] = useState(String(startingCash));
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleCashSave = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(cashInput.replace(/,/g, ''));
    if (!isNaN(val) && val >= 0) {
      setStartingCash(val);
      setIsCashModalOpen(false);
    }
  };

  const isPublicPage = currentRoute === '/' || currentRoute === '/login' || currentRoute === '/signup';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigateTo(isAuthenticated ? '/dashboard' : '/')}
              className="text-left focus:outline-none"
              title="Go to Home"
            >
              <ShieldLogo />
            </button>

            {/* Public nav links if not in dashboard */}
            {isPublicPage && (
              <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600">
                <button
                  onClick={() => navigateTo('/')}
                  className={`hover:text-emerald-700 transition-colors ${currentRoute === '/' ? 'text-emerald-700 font-semibold' : ''}`}
                >
                  Overview
                </button>
                <button
                  onClick={() => {
                    navigateTo('/');
                    setTimeout(() => {
                      document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="hover:text-emerald-700 transition-colors"
                >
                  Features
                </button>
                <button
                  onClick={() => {
                    navigateTo('/');
                    setTimeout(() => {
                      document.getElementById('how-it-works-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="hover:text-emerald-700 transition-colors"
                >
                  How It Works
                </button>
                <button
                  onClick={() => {
                    navigateTo('/');
                    setTimeout(() => {
                      document.getElementById('why-bizguard-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="hover:text-emerald-700 transition-colors"
                >
                  Why BizGuard
                </button>
              </nav>
            )}
          </div>

          {/* Right Controls */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Currency Selector */}
            <div className="flex items-center bg-slate-100/90 rounded-lg p-1 border border-slate-200 text-xs font-medium">
              <Coins className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-1" />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer pr-1"
                title="Select Business Currency"
              >
                {Object.values(CURRENCY_CONFIGS).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Starting Cash adjustment button */}
            {isAuthenticated && (
              <button
                onClick={() => {
                  setCashInput(String(startingCash));
                  setIsCashModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-colors"
                title="Adjust Initial Starting Cash"
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cash Pool:</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {CURRENCY_CONFIGS[currency].symbol}
                  {startingCash.toLocaleString()}
                </span>
              </button>
            )}

            {/* Demo Business Indicator Badge */}
            {isDemoActive ? (
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg px-2.5 py-1 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span className="font-semibold">Demo Café Active</span>
                <button
                  onClick={clearDemoData}
                  className="ml-1.5 text-amber-700 hover:text-red-600 p-0.5 rounded transition-colors"
                  title="Remove sample data and start fresh"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={loadDemoData}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 transition-colors"
                title="Load realistic Demo Café data to test all calculators"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                <span>Load Demo Business</span>
              </button>
            )}

            {/* Auth Buttons */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[11px]">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                      {user.businessName}
                    </p>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      {user.fullName}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user.businessName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {user.industry}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigateTo('/dashboard');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      Dashboard
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        loadDemoUser();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Switch to Demo Café
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateTo('/login')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigateTo('/signup')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-all"
                >
                  Get Started Free
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3">
          {isAuthenticated && user && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-2">
              <p className="text-xs font-bold text-slate-900">{user.businessName}</p>
              <p className="text-[11px] text-slate-500">{user.fullName}</p>
            </div>
          )}

          <div className="flex items-center justify-between py-1">
            <span className="text-xs font-medium text-slate-600">Currency:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="text-xs font-semibold bg-slate-100 border border-slate-300 rounded px-2 py-1"
            >
              {Object.values(CURRENCY_CONFIGS).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.label}
                </option>
              ))}
            </select>
          </div>

          {isDemoActive ? (
            <button
              onClick={() => {
                clearDemoData();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-lg"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove Demo Data
            </button>
          ) : (
            <button
              onClick={() => {
                loadDemoData();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Load Demo Café
            </button>
          )}

          {isAuthenticated ? (
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  navigateTo('/dashboard');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  navigateTo('/login');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg text-center"
              >
                Log In
              </button>
              <button
                onClick={() => {
                  navigateTo('/signup');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg text-center"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      )}

      {/* Starting Cash Adjustment Modal */}
      {isCashModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Adjust Starting Cash Balance</h3>
            <p className="text-xs text-slate-500 mt-1">
              Set the liquid bank cash reserve available at the beginning of tracking. Current cash is calculated as Initial Cash + Net Operating Cash Flow.
            </p>

            <form onSubmit={handleCashSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Starting Cash Amount ({CURRENCY_CONFIGS[currency].symbol})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">
                    {CURRENCY_CONFIGS[currency].symbol}
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={cashInput}
                    onChange={(e) => setCashInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="300000"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCashModalOpen(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg"
                >
                  Update Cash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
