import { useEffect, useRef, useState } from "react";

// 동적으로 모든 동물 behavior 모듈 로드
const behaviorModules = import.meta.glob(
  "./behaviors/individual/[0-9]*_*.jsx",
  { eager: true },
);

// 캐멜케이스를 스네이크케이스로 변환 (첫 글자는 소문자만)
const camelToSnake = (str) => {
  return (
    str.charAt(0).toLowerCase() +
    str.slice(1).replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`)
  );
};

// 한글 이름 매핑
const ANIMAL_KOREAN_NAMES = {
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

// 동물 데이터 자동 생성
const generateAnimalsData = () => {
  const fileEntries = Object.entries(behaviorModules)
    .map(([path, moduleExport]) => {
      // "./behaviors/individual/01_Starling.jsx" -> "01_Starling"
      const filename = path.split("/").pop().replace(".jsx", "");
      const match = filename.match(/^\d+_(.+)$/);
      if (!match) return null;

      const name = match[1]; // "Starling"
      const id = camelToSnake(name); // "starling"

      // default export가 있으면 사용, 없으면 모듈 자체 사용
      const behavior = moduleExport.default || moduleExport;

      // 한글 이름 조회
      const koreanName = ANIMAL_KOREAN_NAMES[id];

      return {
        path,
        id,
        name,
        koreanName: koreanName || name,
        behavior,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.id.localeCompare(b.id));

  return fileEntries;
};

const animalsData = generateAnimalsData();
const behaviorMap = Object.fromEntries(
  animalsData.map((animal) => [animal.id, animal.behavior]),
);
const animals = animalsData.map((animal) => ({
  id: animal.id,
  name: animal.koreanName,
}));

class Particle {
  constructor(effect, x, y, color) {
    this.effect = effect;
    this.x = Math.random() * this.effect.canvasWidth;
    this.y = Math.random() * this.effect.canvasHeight;
    this.color = color;
    this.originX = x;
    this.originY = y;
    this.size = this.effect.gap;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
    this.friction = Math.random() * 0.5 + 0.25;
    this.ease = 0.045;
  }

  draw() {
    // effect.context 체크
    if (!this.effect || !this.effect.context) {
      return;
    }

    this.effect.context.fillStyle = this.color;
    this.effect.context.fillRect(this.x, this.y, this.size, this.size);
  }

  update() {
    if (!this.effect) {
      return;
    }

    // 목표 복귀
    this.x += (this.originX - this.x) * this.ease;
    this.y += (this.originY - this.y) * this.ease;

    // 마우스 회피
    const dx = this.x - this.effect.mouse.x;
    const dy = this.y - this.effect.mouse.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const forceDirectionX = dx / distance;
    const forceDirectionY = dy / distance;

    const force =
      (this.effect.mouse.radius - distance) / this.effect.mouse.radius;

    if (distance < this.effect.mouse.radius) {
      const xForce = forceDirectionX * force * this.effect.mouse.force;
      const yForce = forceDirectionY * force * this.effect.mouse.force;

      this.vx += xForce;
      this.vy += yForce;
    }

    // 속도 적용
    this.x += this.vx;
    this.y += this.vy;

    // 마찰력
    this.vx *= this.friction;
    this.vy *= this.friction;

    // 경계 처리
    if (this.x < 0 || this.x > this.effect.canvasWidth) this.vx *= -1;
    if (this.y < 0 || this.y > this.effect.canvasHeight) this.vy *= -1;

    this.x = Math.max(0, Math.min(this.effect.canvasWidth, this.x));
    this.y = Math.max(0, Math.min(this.effect.canvasHeight, this.y));
  }
}

class Effect {
  constructor(context, canvasWidth, canvasHeight) {
    this.context = context;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.textX = this.canvasWidth / 2;
    this.textY = this.canvasHeight / 2 - 80;
    this.fontSize = this.canvasHeight * 0.12;
    this.gap = 2;
    this.particles = [];
    this.mouse = {
      radius: 300,
      force: 5,
      x: 0,
      y: 0,
    };
  }

  setMouseListener(callback) {
    this.mouseListener = (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      if (callback) callback();
    };
    window.addEventListener("mousemove", this.mouseListener);
  }

  wrapText(text, offsetY = 0) {
    if (!this.context) {
      return;
    }

    this.context.fillStyle = "oklch(0.4777 0.0208 81.25)";
    this.context.font = `bold ${this.fontSize}px Playfair`;
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";

    const y = this.textY + offsetY;
    this.context.fillText(text, this.textX, y);
    this.convertToParticles();
  }

  convertToParticles() {
    if (!this.context) {
      return;
    }

    const pixels = this.context.getImageData(
      0,
      0,
      this.canvasWidth,
      this.canvasHeight,
    );
    const data = pixels.data;

    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    for (let y = 0; y < this.canvasHeight; y += this.gap) {
      for (let x = 0; x < this.canvasWidth; x += this.gap) {
        const index = (y * this.canvasWidth + x) * 4;
        const alpha = data[index + 3];

        if (alpha > 0) {
          const color = `oklch(0.4777 0.0208 81.25)`;
          this.particles.push(new Particle(this, x, y, color));
        }
      }
    }
  }

  render() {
    if (!this.context) {
      return;
    }

    this.particles.forEach((particle) => {
      particle.update();
      particle.draw();
    });
  }

  cleanup() {
    if (this.mouseListener) {
      window.removeEventListener("mousemove", this.mouseListener);
    }
    // 파티클 정리
    this.particles = [];
    // context 명시적으로 null 처리
    this.context = null;
  }
}

function Home(props) {
  const homeRef = useRef(null);
  const canvasRef = useRef(null);
  const animalsRef = useRef({});
  const animationRef = useRef(null);
  const hoveredIdRef = useRef(null);
  const effectRef = useRef(null); // Effect 인스턴스 ref 추가
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [animalsLoaded, setAnimalsLoaded] = useState(false);
  // const mousePosRef = useRef({ x: 0, y: 0 });

  // 폰트 로드 대기
  useEffect(() => {
    const loadFonts = async () => {
      try {
        // 타임아웃과 함께 document.fonts.ready 처리
        const fontLoadPromise = document.fonts.ready;
        const timeoutPromise = new Promise((resolve) =>
          setTimeout(resolve, 5000),
        ); // 5초 타임아웃

        await Promise.race([fontLoadPromise, timeoutPromise]);
        setFontsLoaded(true);
      } catch (e) {
        // 에러 발생해도 진행
        setFontsLoaded(true);
      }
    };

    // 페이지 로드 후 충분한 시간이 지난 후에 폰트 체크
    const initialDelay = setTimeout(() => {
      loadFonts();
    }, 100);

    return () => clearTimeout(initialDelay);
  }, []);

  // 캔버스 초기화 및 Swarm Behavior
  useEffect(() => {
    if (!fontsLoaded) {
      return;
    }

    if (!homeRef.current) {
      return;
    }

    // 이전 canvas 제거
    const oldCanvas = canvasRef.current;
    if (oldCanvas) {
      oldCanvas.remove();
      canvasRef.current = null;
    }

    // 새로운 canvas 생성
    const canvas = document.createElement("canvas");
    canvas.style.display = "block";
    homeRef.current.prepend(canvas);
    canvasRef.current = canvas;

    // 캔버스 크기 설정
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Context 획득
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      return;
    }

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resizeCanvas);

    // 이전 effect 정리
    if (effectRef.current) {
      effectRef.current.cleanup();
    }

    // Effect 인스턴스 생성
    const effect = new Effect(ctx, canvas.width, canvas.height);
    effectRef.current = effect; // ref에 저장

    // 마우스 리스너 설정
    effect.setMouseListener();

    // 텍스트를 파티클로 변환
    effect.wrapText("Swarm", 0);
    effect.wrapText("Behavior", effect.fontSize);

    // 애니메이션 루프
    let animationId;
    const animate = () => {
      // context 체크 추가
      if (!ctx || canvas.width === 0 || canvas.height === 0) {
        return;
      }
      ctx.fillStyle = "oklch(0.9909 0.0123 91.51)";
      // ctx.fillStyle = "red";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      effect.render();

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      effect.cleanup();
      effectRef.current = null; // cleanup 후 ref 제거
      window.removeEventListener("resize", resizeCanvas);
      // Canvas 제거는 다음 effect에서 처리
    };
  }, [fontsLoaded]);

  // 동물 초기화
  useEffect(() => {
    if (!homeRef.current || !fontsLoaded) {
      return;
    }

    const creatures = homeRef.current.querySelectorAll(".creature");

    creatures.forEach((el) => {
      if (!animalsRef.current[el.id]) {
        const rect = {
          width: homeRef.current.clientWidth || window.innerWidth,
          height: homeRef.current.clientHeight || window.innerHeight,
        };
        const width = el.offsetWidth;
        const height = el.offsetHeight;

        const behavior = behaviorMap[el.id];
        if (behavior) {
          animalsRef.current[el.id] = behavior.init(rect, width, height);
        }

        const animal = animalsRef.current[el.id];
        el.style.position = "absolute";
        el.style.left = animal.x + "px";
        el.style.top = animal.y + "px";
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    setAnimalsLoaded(true);
  }, [fontsLoaded]);

  // 애니메이션 루프
  useEffect(() => {
    if (!animalsLoaded) return;

    const creatures = homeRef.current?.querySelectorAll(".creature");
    if (!creatures) return;

    const animate = () => {
      const rect = {
        width: homeRef.current.clientWidth || window.innerWidth,
        height: homeRef.current.clientHeight || window.innerHeight,
      };

      creatures.forEach((el) => {
        const animal = animalsRef.current[el.id];
        if (!animal) return;

        // 호버
        if (el.id === hoveredIdRef.current) {
          return;
        }

        animal.time += 1;

        const behavior = behaviorMap[el.id];
        if (behavior) {
          behavior.update(animal, rect);
        }

        el.style.left = animal.x + "px";
        el.style.top = animal.y + "px";
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animalsLoaded]);

  // 동물 위치 복원
  useEffect(() => {
    if (!homeRef.current || !props.savedPosition) return;

    const el = homeRef.current.querySelector(
      `#${props.savedPosition.animalId}`,
    );
    if (el && animalsRef.current[props.savedPosition.animalId]) {
      const animal = animalsRef.current[props.savedPosition.animalId];
      animal.x = props.savedPosition.position.x;
      animal.y = props.savedPosition.position.y;
      el.style.left = animal.x + "px";
      el.style.top = animal.y + "px";
    }
  }, [props.savedPosition]);

  return (
    <div className="home" ref={homeRef}>
      {!fontsLoaded && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 1000,
            color: "oklch(0.4777 0.0208 81.25)",
            fontSize: "1.5rem",
          }}
        >
          <p>리소스 로딩 중...</p>
        </div>
      )}

      {animals.map((animal) => (
        <div
          key={animal.id}
          onClick={props.onAnimalClick}
          onMouseEnter={() => (hoveredIdRef.current = animal.id)}
          onMouseLeave={() => (hoveredIdRef.current = null)}
          className="creature"
          id={animal.id}
          style={{ zIndex: 10, opacity: animalsLoaded ? 1 : 0 }}
        >
          <p>{animal.name}</p>
        </div>
      ))}
    </div>
  );
}

export default Home;
