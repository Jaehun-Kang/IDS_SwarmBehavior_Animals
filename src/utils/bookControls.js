export const resolveParameterValue = (parameter, rawValue) => {
  const candidate = rawValue == null || rawValue === "" ? NaN : Number(rawValue);
  const value = Number.isFinite(candidate) ? candidate : parameter.defaultValue;
  const bounded = Math.max(parameter.min, Math.min(parameter.max, value));
  const snapped = parameter.min +
    Math.round((bounded - parameter.min) / parameter.step) * parameter.step;
  return Number(Math.max(parameter.min, Math.min(parameter.max, snapped))
    .toFixed(parameter.decimals));
};

export const resolveRuleControls = (ruleGroup, storedControls = {}) =>
  Object.fromEntries((ruleGroup?.behaviors ?? [])
    .filter((behavior) => behavior.parameter)
    .map((behavior) => [behavior.id,
      resolveParameterValue(behavior.parameter, storedControls[behavior.id])]));

export const formatParameterValue = (value, parameter) => {
  const unit = { 퍼센트: "%", 도: "°" }[parameter.unit] ?? parameter.unit;
  const separator = unit === "%" || unit === "°" || !unit ? "" : " ";
  return `${resolveParameterValue(parameter, value).toFixed(parameter.decimals)}${separator}${unit ?? ""}`;
};

export const getParameterProgress = (value, parameter) =>
  parameter.max === parameter.min ? 0 :
    (resolveParameterValue(parameter, value) - parameter.min) /
    (parameter.max - parameter.min) * 100;
