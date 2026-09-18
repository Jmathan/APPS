import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldLogo } from '../components/common/ShieldLogo';
import { Lock, Mail, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loadDemoUser, navigateTo } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both your email address and password.');
      return;
    }

    const success = login(email.trim(), password);
    if (!success) {
      setError('Invalid login credentials. Please check your email and password.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl p-8 animate-in fade-in zoom-in-95">
        <div className="text-center">
          <div className="inline-flex justify-center mb-4">
            <ShieldLogo size={42} showText={false} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">
            Sign In to BizGuard
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your business financial dashboard & survival metrics
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@mybusiness.com"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-md shadow-emerald-700/20 active:scale-[0.98] transition-all"
          >
            <span>Sign In to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400 font-semibold">Or explore without credentials</span>
          </div>
        </div>

        <button
          type="button"
          onClick={loadDemoUser}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-emerald-700" />
          <span>Quick Login with Demo Café</span>
        </button>

        <p className="mt-6 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <button
            onClick={() => navigateTo('/signup')}
            className="font-bold text-emerald-700 hover:underline"
          >
            Register your business
          </button>
        </p>
      </div>
    </div>
  );
};
