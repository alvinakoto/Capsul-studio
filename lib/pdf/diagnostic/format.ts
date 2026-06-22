import { stripNbsp } from '@/lib/pdf/helpers';

export function fmtInt(value: number | string | undefined | null): string {
  const n = toNumber(value);
  if (n === null) return '—';
  return stripNbsp(Math.round(n).toLocaleString('fr-FR'));
}

export function fmtDec(value: number | string | undefined | null, decimals = 2): string {
  const n = toNumber(value);
  if (n === null) return '—';
  return stripNbsp(n.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }));
}

export function fmtPct(value: number | string | undefined | null): string {
  return fmtDec(value, 1);
}

export function toNumber(value: number | string | undefined | null): number | null {
  if (value === undefined || value === null || value === '') return null;
  const n = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'));
  return Number.isNaN(n) ? null : n;
}
