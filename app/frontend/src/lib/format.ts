// Centralized date/time formatters. Three flavors, one place.
//
// - formatDateTime: on-screen, Icelandic locale, short
// - formatCSVDateTime: CSV export — "DD.MM.YYYY HH:mm"
// - formatBCDateTime:  BC export  — "DD.MM.YYYY HH:mm:ss"
//
// All three accept null and return a sentinel so callers don't need to branch.

const pad = (n: number) => String(n).padStart(2, '0');

/** Short on-screen format: "8. maí 14:30". Returns "—" for null. */
export function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('is-IS', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  });
}

/** CSV export format: "08.05.2026 14:30". Returns "" for null. */
export function formatCSVDateTime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Business Central export format: "08.05.2026 14:30:00". Returns "" for null. */
export function formatBCDateTime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// ---------- Overdue helpers ----------
// Global threshold, two-tier. No per-loan field, no settings UI.
//   <24h: 'none'   24–48h: 'yellow'   ≥48h: 'red'

export type OverdueLevel = 'none' | 'yellow' | 'red';

export function getOverdueLevel(checkoutIso: string, now: number = Date.now()): OverdueLevel {
  const hours = (now - new Date(checkoutIso).getTime()) / 3_600_000;
  if (hours >= 48) return 'red';
  if (hours >= 24) return 'yellow';
  return 'none';
}

/** Dwell time since checkout. "2 dagar 4 klst", "5 klst 12 mín", "8 mín". */
export function formatDwell(checkoutIso: string, now: number = Date.now()): string {
  const ms = Math.max(0, now - new Date(checkoutIso).getTime());
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const mins = Math.floor((ms % 3_600_000) / 60_000);
  if (days > 0) return `${days} ${days === 1 ? 'dagur' : 'dagar'} ${hours} klst`;
  if (hours > 0) return `${hours} klst ${mins} mín`;
  return `${mins} mín`;
}
