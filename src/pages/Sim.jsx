import React from "react";
import "../styles/Sim.css";

const animalNames = {
  starling: "흰점찌르레기",
  sardine: "태평양정어리",
  grasshopper: "사막메뚜기",
  ant: "군대개미",
  bat: "멕시코자유꼬리박쥐",
  sheep: "메리노양",
  penguin: "황제펭귄",
  bee: "재래꿀벌",
  firefly: "동기반딧불이",
  spiny_lobster: "카리브해닭새우",
  krill: "남극크릴",
};

const DETAIL_PAGE_DISABLED = true;

const FIREFLY_SIM_THEME = {
  background: "oklch(0.14 0.015 91.51)",
  "--theme-bg": "oklch(0.14 0.015 91.51)",
  "--theme-bg-soft": "oklch(0.18 0.018 91.51)",
  "--theme-text-strong": "oklch(0.9 0.028 95)",
  "--theme-text": "rgb(232 226 207 / 0.88)",
  "--theme-text-muted": "rgb(206 198 176 / 0.74)",
  "--theme-text-soft": "rgb(184 176 156 / 0.62)",
  "--theme-border": "rgb(224 214 188 / 0.18)",
  "--theme-border-soft": "rgb(224 214 188 / 0.1)",
  "--theme-panel": "rgb(10 14 17 / 0.7)",
  "--theme-panel-strong": "rgb(18 23 28 / 0.9)",
  "--theme-panel-hover": "rgb(28 35 42 / 0.96)",
  "--theme-shadow": "0 0.875rem 2.5rem rgb(0 0 0 / 0.34)",
  "--theme-shadow-soft": "0 0.375rem 1rem rgb(0 0 0 / 0.3)",
  "--theme-surface-tint": "rgb(212 201 153 / 0.08)",
  "--theme-accent": "rgb(247 220 116 / 0.32)",
  "--theme-accent-strong": "rgb(255 229 126)",
};

// 동적으로 모든 Swarm 모듈 로드
const swarmModuleFiles = import.meta.glob("../behaviors/swarm/[0-9]*_*.jsx", {
  eager: false,
});

// 캐멜케이스를 스네이크케이스로 변환 (첫 글자는 소문자만)
const camelToSnake = (str) => {
  return (
    str.charAt(0).toLowerCase() +
    str.slice(1).replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`)
  );
};

// 파일명으로부터 동물 ID 추출 및 매핑
const generateSwarmModules = () => {
  const moduleMap = {};

  Object.entries(swarmModuleFiles).forEach(([path, moduleLoader]) => {
    // "./behaviors/swarm/01_Starling.jsx" -> "01_Starling"
    const filename = path.split("/").pop().replace(".jsx", "");
    const match = filename.match(/^\d+_(.+)$/);
    if (match) {
      const name = match[1]; // "Starling"
      const id = camelToSnake(name); // "starling"
      moduleMap[id] = moduleLoader;
    }
  });

  return moduleMap;
};

const swarmModules = generateSwarmModules();

// 캔버스 렌더링 컴포넌트
function SwarmCanvas({
  animalId,
  animalLabel,
  onBackClick,
  onDetailClick,
  isPaused,
}) {
  const [SwarmComponent, setSwarmComponent] = React.useState(null);
  const [swarmUi, setSwarmUi] = React.useState(null);
  const [sanitizeControls, setSanitizeControls] = React.useState(() => null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState(null);
  const [gpuError, setGpuError] = React.useState("");
  const [controls, setControls] = React.useState(null);
  const [controlValueTime, setControlValueTime] = React.useState(0);
  const [isControlPanelOpen, setIsControlPanelOpen] = React.useState(true);
  const [retryCount, setRetryCount] = React.useState(0);
  const containerRef = React.useRef(null);
  const timeoutRef = React.useRef(null);

  const loadSwarmModule = React.useCallback(
    async (attempt = 0) => {
      if (!animalId) return;

      try {
        setIsLoading(true);
        setLoadError(null);

        const loader = swarmModules[animalId];
        if (!loader) {
          throw new Error(`Module loader not found for ${animalId}`);
        }

        // 타임아웃 설정 (15초)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Module load timeout")), 15000),
        );

        const modulePromise = loader();
        const module = await Promise.race([modulePromise, timeoutPromise]);

        setSwarmComponent(() => module.App);
        setSwarmUi(module.App?.ui ?? null);
        setSanitizeControls(() => module.App?.sanitizeControlState ?? null);
        setControls(
          module.App?.ui?.defaultControlState
            ? { ...module.App.ui.defaultControlState }
            : null,
        );
        setGpuError("");
        setIsControlPanelOpen(true);
        setIsLoading(false);
        setRetryCount(0);
      } catch (err) {
        // 최대 3회까지 재시도
        if (attempt < 2) {
          timeoutRef.current = setTimeout(() => {
            setRetryCount(attempt + 1);
            loadSwarmModule(attempt + 1);
          }, 2000); // 2초 후 재시도
        } else {
          setLoadError(err);
          setIsLoading(false);
        }
      }
    },
    [animalId],
  );

  React.useEffect(() => {
    loadSwarmModule();
    const container = containerRef.current;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 언마운트 시 제거
      setSwarmComponent(null);
      setSwarmUi(null);
      setSanitizeControls(null);
      setControls(null);
      setGpuError("");

      // 모든 캔버스, WebGL 정리
      if (container) {
        const canvases = container.querySelectorAll("canvas");
        canvases.forEach((canvas) => {
          const gl = canvas.getContext("webgl") || canvas.getContext("webgl2");
          if (gl) {
            const ext = gl.getExtension("WEBGL_lose_context");
            if (ext) ext.loseContext();
          }
          canvas.remove();
        });
      }
    };
  }, [animalId, loadSwarmModule]);

  React.useEffect(() => {
    if (!SwarmComponent?.ui) {
      return;
    }

    setSwarmUi(SwarmComponent.ui);
    setSanitizeControls(() => SwarmComponent.sanitizeControlState ?? null);
    setControls((current) => {
      const defaults = SwarmComponent.ui?.defaultControlState;
      if (!defaults) {
        return current;
      }

      if (!current) {
        return { ...defaults };
      }

      const merged = {
        ...defaults,
        ...current,
      };
      return SwarmComponent.sanitizeControlState
        ? SwarmComponent.sanitizeControlState(merged)
        : merged;
    });
  }, [SwarmComponent]);

  React.useEffect(() => {
    const hasAnimatedValue = swarmUi?.controlFields?.some(
      (field) => field.animatedValue,
    );
    if (!hasAnimatedValue) {
      return undefined;
    }

    setControlValueTime(window.performance.now() * 0.001);
    const intervalId = window.setInterval(() => {
      setControlValueTime(window.performance.now() * 0.001);
    }, 250);

    return () => window.clearInterval(intervalId);
  }, [swarmUi]);

  if (isLoading) {
    return (
      <div className="sim-state sim-state--loading">
        <p>시뮬레이션 로딩 중...</p>
        {retryCount > 0 && (
          <p className="sim-state__subtext">재시도 중... ({retryCount}/2)</p>
        )}
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="sim-state sim-state--error">
        <div className="sim-state__content">
          <p className="sim-state__title">⚠ 시뮬레이션 로드 실패</p>
          <p className="sim-state__subtext sim-state__subtext--tight">
            {String(loadError?.message || "Unknown error")}
          </p>
          <p className="sim-state__caption">
            페이지를 새로고침하거나 나중에 다시 시도해주세요.
          </p>
        </div>
      </div>
    );
  }

  const resolvedControls = controls
    ? sanitizeControls
      ? sanitizeControls(controls)
      : controls
    : null;

  const handleControlChange = (key, rawValue) => {
    const nextValue =
      typeof rawValue === "boolean"
        ? rawValue
        : typeof rawValue === "string" &&
            rawValue.trim() !== "" &&
            !Number.isNaN(Number(rawValue))
          ? Number(rawValue)
          : rawValue;

    setControls((current) => {
      if (!current) {
        return current;
      }

      const nextControls = {
        ...current,
        [key]: nextValue,
      };

      return sanitizeControls ? sanitizeControls(nextControls) : nextControls;
    });
  };

  const handleControlReset = (key) => {
    if (!swarmUi?.defaultControlState) {
      return;
    }

    handleControlChange(key, swarmUi.defaultControlState[key]);
  };

  return (
    <div ref={containerRef} className="sim-canvas">
      {SwarmComponent ? (
        <SwarmComponent
          controls={resolvedControls}
          onGpuErrorChange={setGpuError}
          isPaused={isPaused}
        />
      ) : (
        <div className="sim-state sim-state--placeholder">
          <p>컴포넌트 준비 중...</p>
        </div>
      )}
      <div className="sim-overlay-stack">
        <button
          className="sim-overlay-button theme-button"
          onClick={onBackClick}
        >
          ← 뒤로가기
        </button>
      </div>
      <button
        className="info_btn sim-overlay-button theme-button"
        onClick={onDetailClick}
        disabled={DETAIL_PAGE_DISABLED}
        aria-disabled={DETAIL_PAGE_DISABLED}
        title={
          DETAIL_PAGE_DISABLED
            ? "상세 페이지는 현재 비활성화되어 있습니다."
            : undefined
        }
        style={
          DETAIL_PAGE_DISABLED
            ? {
                cursor: "not-allowed",
                opacity: 0.45,
              }
            : undefined
        }
      >
        자세히 보기
      </button>
      {gpuError ? (
        <div className="sim-gpu-error sim-overlay-panel">{gpuError}</div>
      ) : null}
      {animalLabel ? (
        <div className="animal_name theme-panel-title sim-animal-title">
          {animalLabel}
        </div>
      ) : null}
      {swarmUi?.controlFields && resolvedControls ? (
        <div
          className={[
            "sim-control-panel",
            "sim-overlay-panel",
            isControlPanelOpen ? "is-open" : "is-collapsed",
          ].join(" ")}
        >
          <div className="sim-control-panel__header">
            <div className="theme-panel-title sim-control-panel__title">
              Simulation Params
              {/* 시뮬레이션 옵션 */}
            </div>
            <button
              type="button"
              onClick={() => setIsControlPanelOpen((current) => !current)}
              className="theme-button theme-button-compact sim-control-toggle"
              aria-label={isControlPanelOpen ? "패널 접기" : "패널 펼치기"}
              aria-expanded={isControlPanelOpen}
            >
              <svg
                className={[
                  "sim-control-toggle__icon",
                  isControlPanelOpen ? "is-open" : "is-collapsed",
                ].join(" ")}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M6 14.5L12 8.5L18 14.5" />
              </svg>
            </button>
          </div>
          <div
            className={[
              "sim-control-panel__body",
              isControlPanelOpen ? "is-open" : "is-collapsed",
            ].join(" ")}
          >
            {swarmUi.controlFields.map((field) => (
              <label
                key={field.key}
                className={[
                  "sim-control-field",
                  field.type === "toggle" || field.type === "binary-toggle"
                    ? "sim-control-field--toggle"
                    : "",
                ].join(" ")}
              >
                <div className="sim-control-field__row">
                  <span>{field.label}</span>
                  <div className="sim-control-field__value-group">
                    <span className="sim-control-field__value">
                      {field.formatValue(
                        resolvedControls[field.key],
                        resolvedControls,
                        controlValueTime,
                      )}
                    </span>
                    {field.type === "toggle" ? (
                      <button
                        type="button"
                        className={[
                          "sim-control-toggle-switch",
                          "sim-control-toggle-switch--inline",
                          resolvedControls[field.key] ? "is-on" : "is-off",
                        ].join(" ")}
                        onClick={() =>
                          handleControlChange(
                            field.key,
                            !resolvedControls[field.key],
                          )
                        }
                        aria-pressed={resolvedControls[field.key]}
                      >
                        <span className="sim-control-toggle-switch__track">
                          <span className="sim-control-toggle-switch__thumb" />
                        </span>
                      </button>
                    ) : field.type === "binary-toggle" ? (
                      <button
                        type="button"
                        className={[
                          "sim-control-toggle-switch",
                          "sim-control-toggle-switch--inline",
                          resolvedControls[field.key] === field.onValue
                            ? "is-on"
                            : "is-off",
                        ].join(" ")}
                        onClick={() =>
                          handleControlChange(
                            field.key,
                            resolvedControls[field.key] === field.onValue
                              ? field.offValue
                              : field.onValue,
                          )
                        }
                        aria-pressed={
                          resolvedControls[field.key] === field.onValue
                        }
                      >
                        <span className="sim-control-toggle-switch__track">
                          <span className="sim-control-toggle-switch__thumb" />
                        </span>
                      </button>
                    ) : field.type === "select" ? (
                      <select
                        value={resolvedControls[field.key]}
                        onChange={(event) =>
                          handleControlChange(field.key, event.target.value)
                        }
                      >
                        {field.options?.map((option) => {
                          const optionValue =
                            typeof option === "string" ? option : option.value;
                          const optionLabel =
                            typeof option === "string" ? option : option.label;
                          return (
                            <option key={optionValue} value={optionValue}>
                              {optionLabel}
                            </option>
                          );
                        })}
                      </select>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleControlReset(field.key)}
                        className="theme-button theme-button-compact sim-control-reset"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
                {field.type === "toggle" ||
                field.type === "binary-toggle" ||
                field.type === "select" ? null : (
                  <input
                    className="sim-control-slider"
                    type="range"
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={resolvedControls[field.key]}
                    onChange={(event) =>
                      handleControlChange(field.key, event.target.value)
                    }
                  />
                )}
              </label>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Sim(props) {
  const { selectedAnimal, onBackClick, onDetailClick, isPaused } = props;
  const animalLabel = selectedAnimal ? animalNames[selectedAnimal] : "";
  const simStyle = selectedAnimal === "firefly" ? FIREFLY_SIM_THEME : undefined;

  return (
    <div className="sim" style={simStyle}>
      {selectedAnimal && (
        <SwarmCanvas
          key={selectedAnimal}
          animalId={selectedAnimal}
          animalLabel={animalLabel}
          onBackClick={onBackClick}
          onDetailClick={onDetailClick}
          isPaused={isPaused}
        />
      )}
    </div>
  );
}

export default Sim;
