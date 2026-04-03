// 찌르레기 starling
import React from "react";

export function App() {
  const canvasRef = React.useRef(null);
  const mousePosRef = React.useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const handleMouseMove = (e) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);

    let animationId;
    const particles = [];
    const particleCount = 2000; // 파티클 개수
    const maxDistance = 80; // 최대 거리
    const mouseAvoidDistance = 150; // 마우스 회피 거리

    // 파티클 초기화
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        ax: 0,
        ay: 0,
        size: 3,
      });
    }

    const animate = () => {
      // 캔버스 비우기
      ctx.fillStyle = "rgba(250, 250, 250, 1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const mouseX = mousePosRef.current.x;
      const mouseY = mousePosRef.current.y;

      // 파티클 업데이트
      particles.forEach((p, i) => {
        p.ax = 0;
        p.ay = 0;

        // 근처 파티클만 확인 (성능 최적화)
        for (let j = i + 1; j < particles.length; j++) {
          const other = particles[j];
          const dx = other.x - p.x;
          const dy = other.y - p.y;
          const distSq = dx * dx + dy * dy;
          const maxDistSq = maxDistance * maxDistance;

          if (distSq < maxDistSq && distSq > 100) {
            const dist = Math.sqrt(distSq);

            // Cohesion
            p.ax += (dx / dist) * 0.08;
            p.ay += (dy / dist) * 0.08;

            // Separation
            const force = 1 - dist / maxDistance;
            p.ax -= (dx / dist) * force * 0.15;
            p.ay -= (dy / dist) * force * 0.15;
          }
        }

        // 마우스 회피
        const mdx = p.x - mouseX;
        const mdy = p.y - mouseY;
        const mouseDist = Math.sqrt(mdx * mdx + mdy * mdy);

        if (mouseDist < mouseAvoidDistance && mouseDist > 0) {
          const avoidForce = 1 - mouseDist / mouseAvoidDistance;
          p.ax += (mdx / mouseDist) * avoidForce * 0.4;
          p.ay += (mdy / mouseDist) * avoidForce * 0.4;
        }

        // 속도 업데이트
        p.vx += p.ax;
        p.vy += p.ay;

        // 속도 제한
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 2.5) {
          p.vx = (p.vx / speed) * 2.5;
          p.vy = (p.vy / speed) * 2.5;
        }

        // 위치 업데이트
        p.x += p.vx;
        p.y += p.vy;

        // 경계 처리
        if (p.x < 0 || p.x > canvas.width) {
          p.vx *= -0.5;
          p.x = Math.max(0, Math.min(canvas.width, p.x));
        }
        if (p.y < 0 || p.y > canvas.height) {
          p.vy *= -0.5;
          p.y = Math.max(0, Math.min(canvas.height, p.y));
        }
      });

      // 파티클 그리기
      ctx.fillStyle = "rgba(70, 130, 180, 0.8)";
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
      }}
    />
  );
}
