export function formatNumber(num: number, useShortFormat: boolean = true): string {
  if (useShortFormat) {
    if (num >= 1e9) return Math.floor(num / 1e9) + 'b';
    if (num >= 1e6) return Math.floor(num / 1e6) + 'm';
    if (num >= 1e3) return Math.floor(num / 1e3) + 'k';
    return Math.floor(num).toString();
  }
  return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
}