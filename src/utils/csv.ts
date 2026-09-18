import { Transaction, TransactionType, RevenueCategory, ExpenseCategory, PaymentStatus } from '../types';

function escapeCSVField(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Export transactions array as a downloadable CSV file.
 * Required columns format:
 * Transaction ID,Date,Type,Title,Category,Amount,Description
 * Every transaction preserves its actual stored database/ledger date.
 */
export function exportTransactionsToCSV(transactions: Transaction[], filename = 'bizguard_transactions.csv'): void {
  const headers = ['Transaction ID', 'Date', 'Type', 'Title', 'Category', 'Amount', 'Description'];

  const rows = transactions.map((tx) => [
    escapeCSVField(tx.id),
    escapeCSVField(tx.date), // Actual stored transaction date from database/state
    escapeCSVField(tx.type === 'revenue' ? 'Revenue' : 'Expense'),
    escapeCSVField(tx.title || tx.category),
    escapeCSVField(tx.category),
    escapeCSVField(tx.amount),
    escapeCSVField(tx.description || tx.notes || ''),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate raw CSV string from transactions array (useful for testing or direct export).
 */
export function generateTransactionsCSVString(transactions: Transaction[]): string {
  const headers = ['Transaction ID', 'Date', 'Type', 'Title', 'Category', 'Amount', 'Description'];

  const rows = transactions.map((tx) => [
    escapeCSVField(tx.id),
    escapeCSVField(tx.date), // Actual stored transaction date
    escapeCSVField(tx.type === 'revenue' ? 'Revenue' : 'Expense'),
    escapeCSVField(tx.title || tx.category),
    escapeCSVField(tx.category),
    escapeCSVField(tx.amount),
    escapeCSVField(tx.description || tx.notes || ''),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

/**
 * Parse uploaded CSV content into Transaction objects
 */
export function parseTransactionsCSV(csvText: string): { transactions: Transaction[]; errors: string[] } {
  const lines = csvText.split(/\r\n|\n|\r/).filter((line) => line.trim().length > 0);
  const errors: string[] = [];
  const transactions: Transaction[] = [];

  if (lines.length < 2) {
    return { transactions: [], errors: ['CSV file is empty or missing data rows.'] };
  }

  // Parse header
  const headerLine = lines[0].toLowerCase();
  const headers = parseCSVLine(headerLine);

  const idIdx = headers.findIndex((h) => h.includes('id'));
  const typeIdx = headers.findIndex((h) => h.includes('type'));
  const amountIdx = headers.findIndex((h) => h.includes('amount'));
  const titleIdx = headers.findIndex((h) => h.includes('title'));
  const categoryIdx = headers.findIndex((h) => h.includes('category') || h.includes('cat'));
  const descIdx = headers.findIndex((h) => h.includes('desc'));
  const dateIdx = headers.findIndex((h) => h.includes('date'));
  const statusIdx = headers.findIndex((h) => h.includes('status'));
  const notesIdx = headers.findIndex((h) => h.includes('note'));

  if (amountIdx === -1) {
    return { transactions: [], errors: ['CSV must have an "Amount" column.'] };
  }

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    const cols = parseCSVLine(rawLine);
    try {
      const rawAmount = cols[amountIdx];
      const amount = parseFloat(rawAmount.replace(/[^0-9.-]+/g, ''));
      if (isNaN(amount) || amount <= 0) {
        errors.push(`Row ${i + 1}: Invalid positive amount "${rawAmount}". Skipped.`);
        continue;
      }

      let rawType = (typeIdx !== -1 && cols[typeIdx] ? cols[typeIdx].toLowerCase().trim() : 'expense') as TransactionType;
      if (rawType !== 'revenue' && rawType !== 'expense') {
        rawType = 'expense';
      }

      const title = titleIdx !== -1 && cols[titleIdx] ? cols[titleIdx].trim() : undefined;
      const category = (categoryIdx !== -1 && cols[categoryIdx] ? cols[categoryIdx].trim() : (rawType === 'revenue' ? 'Product Sales' : 'Other Expenses')) as (RevenueCategory | ExpenseCategory);
      const description = descIdx !== -1 && cols[descIdx] ? cols[descIdx].trim() : (title || 'Imported Transaction');
      
      let date = dateIdx !== -1 && cols[dateIdx] ? cols[dateIdx].trim() : new Date().toISOString().substring(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        // Attempt fallback date parse
        const parsed = new Date(date);
        if (!isNaN(parsed.getTime())) {
          date = parsed.toISOString().substring(0, 10);
        } else {
          date = new Date().toISOString().substring(0, 10);
        }
      }

      const paymentStatus: PaymentStatus = statusIdx !== -1 && cols[statusIdx]?.toLowerCase().includes('pend') ? 'pending' : 'completed';
      const notes = notesIdx !== -1 && cols[notesIdx] ? cols[notesIdx].trim() : 'Imported via CSV';
      const existingId = idIdx !== -1 && cols[idIdx] ? cols[idIdx].trim() : `csv-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`;

      transactions.push({
        id: existingId,
        type: rawType,
        title,
        amount,
        category,
        description,
        date,
        paymentStatus,
        notes,
        createdAt: new Date().toISOString(),
        isDemo: false,
      });
    } catch (err: any) {
      errors.push(`Row ${i + 1}: Parsing error (${err.message || 'Malformed row'}).`);
    }
  }

  return { transactions, errors };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur.trim());
  return result;
}
