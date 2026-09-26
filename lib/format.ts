export function pct(n: number, digits = 1): string {
  return `${(n * 100).toFixed(digits)}%`;
}

export function compact(n: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export function num(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export function relDeadline(iso: string): { label: string; tone: "past" | "soon" | "future" } {
  const now = Date.now();
  const t = new Date(iso).getTime();
  const days = Math.round((t - now) / (24 * 60 * 60 * 1000));
  if (days < 0) return { label: `${Math.abs(days)}d ago`, tone: "past" };
  if (days === 0) return { label: "Today", tone: "soon" };
  if (days <= 3) return { label: `In ${days}d`, tone: "soon" };
  return { label: `In ${days}d`, tone: "future" };
}

export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}
