import clsx, { type ClassValue } from 'clsx';

export function cx(...values: ClassValue[]) {
  return clsx(values);
}

export function money(value: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: value >= 1_000_000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 1_000_000 ? 1 : 0
  }).format(value);
}

export function shortDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

export function daysUntil(value: string) {
  const target = new Date(value).getTime();
  const now = new Date().setHours(0, 0, 0, 0);
  return Math.ceil((target - now) / 86_400_000);
}

export function percent(value: number) {
  return `${Math.round(value)}%`;
}

export function makeId(prefix: string) {
  const stamp = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${stamp}`;
}

export function downloadTextFile(fileName: string, text: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
