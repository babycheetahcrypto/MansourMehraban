export function formatNumber(num: number, useShortFormat: boolean = true): string {
  if (useShortFormat) {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'b';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'm';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'k';
    return num.toString();
  }
  return num.toLocaleString('en-US');
}
