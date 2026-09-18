export const formatRangePercent = (value, min, max) => {
  if (![value, min, max].every(Number.isFinite) || max <= min) return "-";
  const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return `${Math.round(ratio * 100)} %`;
};
