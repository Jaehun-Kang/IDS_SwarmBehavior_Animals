import React from "react";

// 동물 이름 매핑
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

// 동적 import로 Swarm 컴포넌트 로드
const swarmModules = {
  starling: () => import("./behaviors/swarm/01_Starling.jsx"),
  sardine: () => import("./behaviors/swarm/02_Sardine.jsx"),
  grasshopper: () => import("./behaviors/swarm/03_Grasshopper.jsx"),
  ant: () => import("./behaviors/swarm/04_Ant.jsx"),
  bat: () => import("./behaviors/swarm/05_Bat.jsx"),
  sheep: () => import("./behaviors/swarm/06_Sheep.jsx"),
  penguin: () => import("./behaviors/swarm/07_Penguin.jsx"),
  bee: () => import("./behaviors/swarm/08_Bee.jsx"),
  firefly: () => import("./behaviors/swarm/09_Firefly.jsx"),
  spiny_lobster: () => import("./behaviors/swarm/10_SpinyLobster.jsx"),
  krill: () => import("./behaviors/swarm/11_Krill.jsx"),
};

// 캔버스를 렌더링하는 컴포넌트
function SwarmCanvas({ animalId }) {
  const [SwarmComponent, setSwarmComponent] = React.useState(null);
  const [loadError, setLoadError] = React.useState(null);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    if (!animalId) return;

    const container = containerRef.current;
    const loader = swarmModules[animalId];
    if (loader) {
      loader()
        .then((module) => {
          setSwarmComponent(() => module.App);
        })
        .catch((err) => {
          console.error(`Failed to load ${animalId}:`, err);
          setLoadError(err);
        });
    }

    return () => {
      // 언마운트 시 cleanup
      setSwarmComponent(null);

      // 동기적으로 모든 canvas와 WebGL 정리
      if (container) {
        const canvases = container.querySelectorAll("canvas");
        canvases.forEach((canvas) => {
          // WebGL 컨텍스트 정리
          const gl = canvas.getContext("webgl") || canvas.getContext("webgl2");
          if (gl) {
            const ext = gl.getExtension("WEBGL_lose_context");
            if (ext) ext.loseContext();
          }
          // canvas 요소 제거
          canvas.remove();
        });
      }
    };
  }, [animalId]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      {loadError && (
        <div style={{ color: "red" }}>로딩 에러: {String(loadError)}</div>
      )}
      {SwarmComponent ? <SwarmComponent /> : <div>로딩 중...</div>}
    </div>
  );
}

function Sim(props) {
  const { selectedAnimal, onBackClick } = props;

  return (
    <div
      className="sim"
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      <button
        onClick={onBackClick}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 100,
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          backgroundColor: "#333",
          color: "white",
          border: "none",
          borderRadius: "4px",
        }}
      >
        ← 뒤로가기
      </button>

      {selectedAnimal && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            zIndex: 100,
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            padding: "10px 20px",
            borderRadius: "4px",
          }}
        >
          {animalNames[selectedAnimal]}
        </div>
      )}

      {selectedAnimal && (
        <SwarmCanvas key={selectedAnimal} animalId={selectedAnimal} />
      )}
    </div>
  );
}

export default Sim;
