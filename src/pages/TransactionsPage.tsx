import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Transaction, TransactionType } from '../types';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { formatCurrency } from '../utils/currency';
import {
  PlusCircle,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Upload,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const {
    transactions,
    deleteTransaction,
    currency,
    exportCSV,
    importCSV,
    isDemoActive,
    clearDemoData,
    loadDemoData,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'revenue' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [dateFilter, setDateFilter] = useState<'all' | '30days' | '90days'>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // CSV file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract unique categories from actual transactions
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((tx) => set.add(tx.category));
    return Array.from(set).sort();
  }, [transactions]);

  // Filtered & Sorted transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Type filter
        if (selectedType !== 'all' && tx.type !== selectedType) return false;

        // Category filter
        if (selectedCategory !== 'all' && tx.category !== selectedCategory) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchDesc = tx.description.toLowerCase().includes(q);
          const matchNotes = (tx.notes || '').toLowerCase().includes(q);
          const matchCat = tx.category.toLowerCase().includes(q);
          if (!matchDesc && !matchNotes && !matchCat) return false;
        }

        // Date filter
        if (dateFilter !== 'all') {
          const txDate = new Date(tx.date).getTime();
          const now = Date.now();
          const daysAgo = dateFilter === '30days' ? 30 : 90;
          const cutoff = now - daysAgo * 24 * 60 * 60 * 1000;
          if (txDate < cutoff) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortBy === 'date-asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (sortBy === 'amount-desc') {
          return b.amount - a.amount;
        }
        if (sortBy === 'amount-asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [transactions, selectedType, selectedCategory, searchQuery, dateFilter, sortBy]);

  // Handle CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        importCSV(text);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingTx(null);
    setIsModalOpen(true);
  };

  // Quick stats
  const totalFilteredRevenue = filteredTransactions
    .filter((t) => t.type === 'revenue')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalFilteredExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            Transactions & Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time management of cash inflows, vendor outflows, operational costs, and receipts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* CSV Import */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
            title="Import transactions from CSV file"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Import CSV</span>
          </button>

          {/* CSV Export */}
          <button
            onClick={exportCSV}
            disabled={transactions.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            title="Export all transactions to CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Add Transaction Button */}
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm shadow-emerald-700/20 active:scale-[0.98] transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search description, notes..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setSelectedType('all')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedType === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setSelectedType('revenue')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedType === 'revenue'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Inflows
            </button>
            <button
              onClick={() => setSelectedType('expense')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedType === 'expense'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Outflows
            </button>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="all">All Categories</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="date-desc">Newest Date First</option>
              <option value="date-asc">Oldest Date First</option>
              <option value="amount-desc">Highest Amount First</option>
              <option value="amount-asc">Lowest Amount First</option>
            </select>
          </div>
        </div>

        {/* Filter Summary Pill Bar */}
        <div className="flex flex-wrap items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-500 font-medium">
          <div className="flex items-center gap-3">
            <span>Showing {filteredTransactions.length} of {transactions.length} records</span>
            {(selectedType !== 'all' || selectedCategory !== 'all' || searchQuery || dateFilter !== 'all') && (
              <button
                onClick={() => {
                  setSelectedType('all');
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setDateFilter('all');
                }}
                className="text-emerald-700 font-semibold hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span>
              Inflows:{' '}
              <strong className="text-emerald-700 font-mono">
                {formatCurrency(totalFilteredRevenue, currency)}
              </strong>
            </span>
            <span>
              Outflows:{' '}
              <strong className="text-red-700 font-mono">
                {formatCurrency(totalFilteredExpense, currency)}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Transaction Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-800">No Transactions Found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No financial records match your current filters. Clear filters or add a new transaction.
            </p>
            <button
              onClick={handleAddNew}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800"
            >
              Add New Transaction
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredTransactions.map((tx) => {
                  const isRev = tx.type === 'revenue';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Date */}
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap font-mono">
                        {tx.date}
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isRev
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-red-50 text-red-800 border border-red-200'
                          }`}
                        >
                          {isRev ? '+ Inflow' : '- Outflow'}
                        </span>
                      </td>

                      {/* Description & Notes */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 truncate">
                          {tx.description}
                        </div>
                        {tx.notes && (
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            {tx.notes}
                          </div>
                        )}
                        {tx.isDemo && (
                          <span className="inline-block text-[9px] px-1 rounded bg-amber-50 text-amber-700 border border-amber-200 mt-0.5">
                            demo
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 bg-slate-100 rounded text-[11px] text-slate-700 font-medium">
                          {tx.category}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-bold text-sm">
                        <span className={isRev ? 'text-emerald-700' : 'text-red-600'}>
                          {isRev ? '+' : '-'}
                          {formatCurrency(tx.amount, currency)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            tx.paymentStatus === 'completed'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {tx.paymentStatus === 'completed' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Settled</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Pending</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(tx)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Edit transaction"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(tx.id)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-900">Delete Transaction?</h3>
            <p className="text-xs text-slate-500 mt-1">
              This will permanently delete this record and immediately recalculate all dashboard KPIs, runway projections, and health scores.
            </p>

            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteTransaction(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Add / Edit Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingTx}
      />
    </div>
  );
};
