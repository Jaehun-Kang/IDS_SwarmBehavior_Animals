import {
  formatParameterValue,
  getParameterProgress,
  resolveParameterValue,
} from "../utils/bookControls.js";

export default function BookBehaviorPanel({ ruleGroup, controls, accentColor, onChange }) {
  return (
    <section className="detail-parameter-panel" aria-label="규칙 조절">
      <div className="behaviors-list">
        <div className="behaviors-group">
          {ruleGroup.behaviors.map((behavior) => {
            const parameter = behavior.parameter;
            const value = parameter ? resolveParameterValue(parameter, controls[behavior.id]) : null;
            return (
              <article key={behavior.id} className="behavior-item">
                <h3 className="behavior-name" style={{ color: accentColor }}>{behavior.name}</h3>
                <div className="behavior-body">
                  <p className="behavior-description">{behavior.description}</p>
                  {parameter && (
                    <label className="detail-parameter-row">
                      <span className="detail-parameter-row__label">{parameter.label}</span>
                      <span className="detail-parameter-row__value">{formatParameterValue(value, parameter)}</span>
                      <input
                        type="range"
                        min={parameter.min}
                        max={parameter.max}
                        step={parameter.step}
                        value={value}
                        style={{
                          "--detail-range-progress": `${getParameterProgress(value, parameter)}%`,
                          "--detail-range-accent": accentColor,
                        }}
                        aria-label={`${behavior.name} ${parameter.label}`}
                        onChange={(event) => onChange(behavior.id,
                          resolveParameterValue(parameter, event.target.value))}
                        onWheel={(event) => {
                          event.stopPropagation();
                          if (!event.deltaY) return;
                          const direction = event.deltaY > 0 ? -1 : 1;
                          onChange(behavior.id, resolveParameterValue(parameter,
                            value + direction * parameter.step * (event.shiftKey ? 5 : 1)));
                        }}
                      />
                    </label>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
