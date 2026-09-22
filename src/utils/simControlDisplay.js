export const formatRangePercent = (value, min, max) => {
  if (![value, min, max].every(Number.isFinite) || max <= min) return "-";
  const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return `${Math.round(ratio * 100)} %`;
};
export const getControlDisplayCandidates = (field) => {
  if (field.type === "toggle") return [false, true];
  if (field.type === "binary-toggle") return [field.offValue, field.onValue];
  if (field.type === "cycle-toggle") return field.values ?? [];
  if (field.type === "select") {
    return (field.options ?? []).map(option => typeof option === "string" ? option : option.value);
  }
  return [];
};
