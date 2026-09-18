import { CurrencyCode, CurrencyConfig } from '../types';

export const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    label: 'Indian Rupee (₹)',
    locale: 'en-IN',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    label: 'US Dollar ($)',
    locale: 'en-US',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    label: 'Euro (€)',
    locale: 'de-DE',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    label: 'British Pound (£)',
    locale: 'en-GB',
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    label: 'Canadian Dollar (C$)',
    locale: 'en-CA',
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    label: 'Australian Dollar (A$)',
    locale: 'en-AU',
  },
};

/**
 * Format a number into currency representation.
 * If currency is INR, uses Indian numbering format (e.g., ₹2,00,000).
 */
export function formatCurrency(
  amount: number | null | undefined,
  currencyCode: CurrencyCode = 'INR',
  options?: {
    compact?: boolean;
    maximumFractionDigits?: number;
    showSign?: boolean;
  }
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '—';
  }

  const config = CURRENCY_CONFIGS[currencyCode] || CURRENCY_CONFIGS.INR;
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  let formattedNumber = '';

  if (options?.compact && absAmount >= 1000) {
    if (currencyCode === 'INR') {
      if (absAmount >= 10000000) {
        formattedNumber = (absAmount / 10000000).toFixed(1) + ' Cr';
      } else if (absAmount >= 100000) {
        formattedNumber = (absAmount / 100000).toFixed(1) + ' L';
      } else if (absAmount >= 1000) {
        formattedNumber = (absAmount / 1000).toFixed(1) + ' k';
      } else {
        formattedNumber = absAmount.toFixed(0);
      }
    } else {
      if (absAmount >= 1000000) {
        formattedNumber = (absAmount / 1000000).toFixed(1) + 'M';
      } else if (absAmount >= 1000) {
        formattedNumber = (absAmount / 1000).toFixed(1) + 'k';
      } else {
        formattedNumber = absAmount.toFixed(0);
      }
    }
  } else {
    try {
      formattedNumber = new Intl.NumberFormat(config.locale, {
        maximumFractionDigits: options?.maximumFractionDigits ?? 0,
        minimumFractionDigits: options?.maximumFractionDigits ? 2 : 0,
      }).format(absAmount);
    } catch {
      formattedNumber = absAmount.toLocaleString();
    }
  }

  const sign = isNegative ? '-' : options?.showSign && amount > 0 ? '+' : '';
  return `${sign}${config.symbol}${formattedNumber}`;
}

export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  return new Intl.NumberFormat().format(value);
}

export function safeNumber(val: any, fallback = 0): number {
  if (val === null || val === undefined || val === '') return fallback;
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/,/g, ''));
  return isNaN(num) ? fallback : num;
}
