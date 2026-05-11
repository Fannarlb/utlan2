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
