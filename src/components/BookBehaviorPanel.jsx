import { useEffect, useRef } from "react";
import {
  formatParameterValue,
  getParameterProgress,
  resolveParameterValue,
} from "../utils/bookControls.js";
import refreshIconUrl from "../assets/icons/refresh.svg";

export default function BookBehaviorPanel({ ruleGroup, controls, accentColor, onChange }) {
  const resetFrames = useRef(new Map());
  useEffect(() => {
    const frames = resetFrames.current;
    return () => {
      frames.forEach(cancelAnimationFrame);
      frames.clear();
    };
  }, [ruleGroup.id]);
  const cancelReset = (id) => {
    const frame = resetFrames.current.get(id);
    if (frame !== undefined) cancelAnimationFrame(frame);
    resetFrames.current.delete(id);
  };
  const changeValue = (id, value) => {
    cancelReset(id);
    onChange(id, value);
  };
  const resetValue = (id, parameter, value) => {
    cancelReset(id);
    const target = resolveParameterValue(parameter, parameter.defaultValue);
    let start;
    const tick = (now) => {
      start ??= now;
      const progress = Math.min(1, (now - start) / 300);
      const amount = 1 - (1 - progress) ** 3;
      onChange(id, resolveParameterValue(parameter, value + (target - value) * amount));
      if (progress < 1) resetFrames.current.set(id, requestAnimationFrame(tick));
      else resetFrames.current.delete(id);
    };
    resetFrames.current.set(id, requestAnimationFrame(tick));
  };
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
                    <div className="detail-parameter-row">
                      <span className="detail-parameter-row__label">{parameter.label}</span>
                      <span className="detail-parameter-row__value">
                        {formatParameterValue(value, parameter)}
                        <button type="button" className="detail-parameter-reset"
                          title={`${parameter.label} 초기화`} aria-label={`${parameter.label} 초기화`}
                          onClick={() => resetValue(behavior.id, parameter, value)}>
                          <img src={refreshIconUrl} alt="" aria-hidden="true" draggable="false" />
                        </button>
                      </span>
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
                        onChange={(event) => changeValue(behavior.id,
                          resolveParameterValue(parameter, event.target.value))}
                        onWheel={(event) => {
                          event.stopPropagation();
                          if (!event.deltaY) return;
                          const direction = event.deltaY > 0 ? -1 : 1;
                          changeValue(behavior.id, resolveParameterValue(parameter,
                            value + direction * parameter.step * (event.shiftKey ? 5 : 1)));
                        }}
                      />
                    </div>
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
