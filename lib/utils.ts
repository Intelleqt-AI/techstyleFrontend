import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateObj(dateStr) {
  const [year, month, day] = dateStr.split('-');
  return { year, month, day };
}

export function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0]; // "YYYY-MM-DD"
}

export function parseMoney(value) {
  if (!value) return 0;

  // Remove currency symbols, spaces, commas, etc.
  const cleaned = value.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
}
