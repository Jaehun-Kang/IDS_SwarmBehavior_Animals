import React from "react";

const animalNames = {
  starling: "찌르레기",
  sardine: "정어리",
  grasshopper: "메뚜기",
  ant: "개미",
  bat: "박쥐",
  sheep: "양",
  penguin: "펭귄",
  bee: "꿀벌",
  firefly: "반딧불이",
  spiny_lobster: "닭새우",
  krill: "크릴",
};

// 동적으로 모든 Swarm 모듈 로드
const swarmModuleFiles = import.meta.glob("./behaviors/swarm/[0-9]*_*.jsx", {
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
function SwarmCanvas({ animalId }) {
  const [SwarmComponent, setSwarmComponent] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState(null);
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

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 언마운트 시 제거
      setSwarmComponent(null);

      // 모든 캔버스, WebGL 정리
      const container = containerRef.current;
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

  if (isLoading) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
          color: "oklch(0.4777 0.0208 81.25)",
          backgroundColor: "oklch(0.99 0.01 91)",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <p>시뮬레이션 로딩 중...</p>
        {retryCount > 0 && (
          <p style={{ fontSize: "0.9rem", opacity: 0.7 }}>
            재시도 중... ({retryCount}/2)
          </p>
        )}
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ff6b6b",
          backgroundColor: "oklch(0.99 0.01 91)",
          flexDirection: "column",
          gap: "1rem",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div>
          <p style={{ marginBottom: "1rem", fontSize: "1.2rem" }}>
            ⚠ 시뮬레이션 로드 실패
          </p>
          <p
            style={{ marginBottom: "0.5rem", fontSize: "0.9rem", opacity: 0.7 }}
          >
            {String(loadError?.message || "Unknown error")}
          </p>
          <p style={{ fontSize: "0.85rem", opacity: 0.6 }}>
            페이지를 새로고침하거나 나중에 다시 시도해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      {SwarmComponent ? (
        <SwarmComponent />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "oklch(0.4777 0.0208 81.25)",
            backgroundColor: "oklch(0.99 0.01 91)",
          }}
        >
          <p>컴포넌트 준비 중...</p>
        </div>
      )}
    </div>
  );
}

function Sim(props) {
  const { selectedAnimal, onBackClick } = props;

  return (
    <div className="sim">
      <button className="back_btn" onClick={onBackClick}>
        ← 뒤로가기
      </button>

      {selectedAnimal && (
        <div className="animal_name">{animalNames[selectedAnimal]}</div>
      )}

      {selectedAnimal && (
        <SwarmCanvas key={selectedAnimal} animalId={selectedAnimal} />
      )}
    </div>
  );
}

export default Sim;
