import React, { useState, useEffect } from 'react';
import {
  Transaction,
  TransactionType,
  RevenueCategory,
  ExpenseCategory,
  PaymentStatus,
} from '../../types';
import { useApp } from '../../context/AppContext';
import { CURRENCY_CONFIGS } from '../../utils/currency';
import { X, Check } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Transaction | null;
}

const REVENUE_CATEGORIES: RevenueCategory[] = ['Product Sales', 'Service Income', 'Other Income'];

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Rent',
  'Salaries',
  'Utilities',
  'Materials',
  'Marketing',
  'Transport',
  'Loan Payment',
  'Other Expenses',
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const { addTransaction, updateTransaction, currency } = useApp();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('Materials');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('completed');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(String(initialData.amount));
      setCategory(initialData.category);
      setDescription(initialData.description);
      setDate(initialData.date);
      setPaymentStatus(initialData.paymentStatus);
      setNotes(initialData.notes || '');
    } else {
      setType('expense');
      setAmount('');
      setCategory('Materials');
      setDescription('');
      setDate(new Date().toISOString().substring(0, 10));
      setPaymentStatus('completed');
      setNotes('');
    }
    setError('');
  }, [initialData, isOpen]);

  // When type toggles, reset default category
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'revenue') {
      setCategory('Product Sales');
    } else {
      setCategory('Materials');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a brief description.');
      return;
    }

    if (!date) {
      setError('Please specify a valid transaction date.');
      return;
    }

    if (initialData) {
      updateTransaction(initialData.id, {
        type,
        amount: numAmount,
        category: category as RevenueCategory | ExpenseCategory,
        description: description.trim(),
        date,
        paymentStatus,
        notes: notes.trim(),
      });
    } else {
      addTransaction({
        type,
        amount: numAmount,
        category: category as RevenueCategory | ExpenseCategory,
        description: description.trim(),
        date,
        paymentStatus,
        notes: notes.trim(),
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {initialData ? 'Edit Transaction' : 'Record New Transaction'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Instantly updates dashboard KPIs, runway projections, and survival metrics.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          {/* Type Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => handleTypeChange('revenue')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  type === 'revenue'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                + Revenue (Inflow)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  type === 'expense'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                - Expense (Outflow)
              </button>
            </div>
          </div>

          {/* Amount & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Amount ({CURRENCY_CONFIGS[currency].symbol}) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">
                  {CURRENCY_CONFIGS[currency].symbol}
                </span>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="25000"
                  className="w-full pl-8 pr-3 py-2 text-sm font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {type === 'revenue'
                  ? REVENUE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))
                  : EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description / Payee *
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                type === 'revenue'
                  ? 'e.g. Catering Invoice #1042'
                  : 'e.g. Commercial space lease'
              }
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Date & Payment Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Transaction Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Settlement Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="completed">Completed / Settled</option>
                <option value="pending">Pending Settlement</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Internal Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Vendor contract details, invoice number, or cost center remarks"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-all active:scale-[0.98] ${
                type === 'revenue'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{initialData ? 'Save Changes' : 'Record Transaction'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
