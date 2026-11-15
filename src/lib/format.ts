/** Formato de quetzales: 1350 → "Q1,350". */
export function formatQ(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '';
  return 'Q' + Math.round(n).toLocaleString('en-US');
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-GT', {
    timeZone: 'America/Guatemala',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}
