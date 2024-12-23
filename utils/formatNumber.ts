const formatNumberWithSuffix = (num: number): string => {
  if (num >= 1e9) return Math.floor(num / 1e9) + 'b';
  if (num >= 1e6) return Math.floor(num / 1e6) + 'm';
  if (num >= 1e3) return Math.floor(num / 1e3) + 'k';
  return Math.floor(num).toString();
};

const formatNumber = (num: number, useShortFormat: boolean = true): string => {
  if (useShortFormat) {
    return formatNumberWithSuffix(Math.floor(num));
  }
  return Math.floor(num).toLocaleString('en-US');
};