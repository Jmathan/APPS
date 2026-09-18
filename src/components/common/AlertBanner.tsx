import React from 'react';
import { FinancialAlert } from '../../types';
import { AlertTriangle, Info, CheckCircle2, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AlertBannerProps {
  alerts: FinancialAlert[];
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alerts }) => {
  const { navigateTo } = useApp();

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2.5 mb-6">
      {alerts.map((alert) => {
        const isDanger = alert.type === 'danger';
        const isWarning = alert.type === 'warning';
        const isSuccess = alert.type === 'success';

        const bg = isDanger
          ? 'bg-red-50 border-red-200 text-red-900'
          : isWarning
          ? 'bg-amber-50 border-amber-200 text-amber-900'
          : isSuccess
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
          : 'bg-blue-50 border-blue-200 text-blue-900';

        const Icon = isDanger || isWarning ? AlertTriangle : isSuccess ? CheckCircle2 : Info;
        const iconColor = isDanger
          ? 'text-red-600'
          : isWarning
          ? 'text-amber-600'
          : isSuccess
          ? 'text-emerald-600'
          : 'text-blue-600';

        return (
          <div
            key={alert.id}
            className={`flex items-center justify-between p-3.5 rounded-xl border ${bg} text-xs transition-all shadow-xs`}
          >
            <div className="flex items-center gap-3">
              <div className={`shrink-0 ${iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900">{alert.title}</p>
                <p className="text-slate-600 mt-0.5">{alert.message}</p>
              </div>
            </div>

            {alert.actionRoute && (
              <button
                onClick={() => navigateTo(alert.actionRoute!)}
                className="shrink-0 ml-4 inline-flex items-center gap-1 font-bold text-emerald-800 hover:text-emerald-950 underline decoration-emerald-500/50 hover:decoration-emerald-700"
              >
                <span>{alert.actionLabel || 'Inspect'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
