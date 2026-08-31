import React from "react";

const STARLING_PREVIEW_RULES = new Set(["interaction_rules"]);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const createStarlingAgents = (width, height) =>
  Array.from({ length: 38 }, (_, index) => {
    const angle = (index / 38) * Math.PI * 2;
    const radius = Math.min(width, height) * (0.18 + (index % 7) * 0.012);
    const speed = 0.62 + (index % 5) * 0.035;

    return {
      x: width * 0.5 + Math.cos(angle) * radius + ((index * 19) % 37) - 18,
      y: height * 0.5 + Math.sin(angle) * radius * 0.58 + ((index * 23) % 29) - 14,
      vx: Math.cos(angle + Math.PI * 0.48) * speed,
      vy: Math.sin(angle + Math.PI * 0.48) * speed * 0.52,
      size: 2.6 + (index % 4) * 0.35,
    };
  });

function drawStarlingPreview(
  ctx,
  agents,
  width,
  height,
  time,
  previewControls,
) {
  ctx.clearRect(0, 0, width, height);

  const centerX = width * (0.5 + Math.sin(time * 0.42) * 0.08);
  const centerY = height * (0.5 + Math.cos(time * 0.36) * 0.08);
  const ruleStrength = clamp(previewControls?.ruleStrength ?? 68, 0, 100) / 100;
  const responseRange = clamp(previewControls?.responseRange ?? 54, 0, 100) / 100;
  const neighborCount = Math.round(4 + responseRange * 6);
  const separationDistance = 13 + responseRange * 14;
  const cohesionStrength = 0.1 + ruleStrength * 0.12;
  const separationStrength = 0.055 + ruleStrength * 0.09;

  agents.forEach((agent, index) => {
    const neighbors = agents
      .filter((other) => other !== agent)
      .map((other) => ({
        agent: other,
        distance: Math.hypot(other.x - agent.x, other.y - agent.y),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, neighborCount);

    let alignX = 0;
    let alignY = 0;
    let separateX = 0;
    let separateY = 0;

    neighbors.forEach(({ agent: other, distance }) => {
      alignX += other.vx;
      alignY += other.vy;

      if (distance < separationDistance) {
        const push = (separationDistance - distance) / separationDistance;
        separateX -= ((other.x - agent.x) / Math.max(distance, 1)) * push;
        separateY -= ((other.y - agent.y) / Math.max(distance, 1)) * push;
      }
    });

    alignX /= neighborCount;
    alignY /= neighborCount;

    const toCenterX = (centerX - agent.x) / Math.max(width, 1);
    const toCenterY = (centerY - agent.y) / Math.max(height, 1);
    const wave = Math.sin(time * 1.4 + index * 0.41) * 0.018;

    agent.vx +=
      alignX * (0.008 + ruleStrength * 0.012) +
      toCenterX * cohesionStrength +
      separateX * separationStrength +
      wave;
    agent.vy +=
      alignY * (0.008 + ruleStrength * 0.012) +
      toCenterY * cohesionStrength +
      separateY * separationStrength;

    const speed = Math.hypot(agent.vx, agent.vy) || 1;
    const targetSpeed = 0.64 + ruleStrength * 0.32;
    agent.vx = (agent.vx / speed) * targetSpeed;
    agent.vy = (agent.vy / speed) * targetSpeed;

    agent.x += agent.vx;
    agent.y += agent.vy;

    if (agent.x < -24) agent.vx += 0.08;
    if (agent.x > width + 24) agent.vx -= 0.08;
    if (agent.y < -24) agent.vy += 0.08;
    if (agent.y > height + 24) agent.vy -= 0.08;
  });

  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = "rgb(62 54 42)";
  ctx.lineWidth = 1;
  agents.forEach((agent) => {
    const neighbors = agents
      .filter((other) => other !== agent)
      .map((other) => ({
        agent: other,
        distance: Math.hypot(other.x - agent.x, other.y - agent.y),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 2);

    neighbors.forEach(({ agent: other, distance }) => {
      if (distance > 56) return;
      ctx.beginPath();
      ctx.moveTo(agent.x, agent.y);
      ctx.lineTo(other.x, other.y);
      ctx.stroke();
    });
  });
  ctx.restore();

  ctx.fillStyle = "rgb(43 38 30 / 0.78)";
  agents.forEach((agent) => {
    const angle = Math.atan2(agent.vy, agent.vx);
    const wing = clamp(Math.sin(time * 8 + agent.x * 0.03) * 0.45, -0.38, 0.38);

    ctx.save();
    ctx.translate(agent.x, agent.y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(agent.size * 2.7, 0);
    ctx.lineTo(-agent.size * 1.5, agent.size * (0.72 + wing));
    ctx.lineTo(-agent.size * 0.65, 0);
    ctx.lineTo(-agent.size * 1.5, -agent.size * (0.72 - wing));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });
}

function useCanvasPreview(canvasRef, enabled, previewControls) {
  const previewControlsRef = React.useRef(previewControls);

  React.useEffect(() => {
    previewControlsRef.current = previewControls;
  }, [previewControls]);

  React.useEffect(() => {
    const canvas = canvasRef.current;

    if (!enabled || !canvas) {
      return undefined;
    }

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return undefined;
    }

    let frameId = 0;
    let agents = [];
    let lastWidth = 0;
    let lastHeight = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(1, Math.floor(rect.width * dpr));
      const height = Math.max(1, Math.floor(rect.height * dpr));

      if (width === lastWidth && height === lastHeight) {
        return;
      }

      lastWidth = width;
      lastHeight = height;
      canvas.width = width;
      canvas.height = height;
      agents = createStarlingAgents(width, height);
    };

    const draw = (now) => {
      resize();
      drawStarlingPreview(
        ctx,
        agents,
        lastWidth,
        lastHeight,
        now * 0.001,
        previewControlsRef.current,
      );
      frameId = window.requestAnimationFrame(draw);
    };

    frameId = window.requestAnimationFrame(draw);
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef, enabled]);
}

function RulePreview({ animalId, ruleGroup, previewControls }) {
  const canvasRef = React.useRef(null);
  const canPreview =
    animalId === "starling" && STARLING_PREVIEW_RULES.has(ruleGroup?.id);

  useCanvasPreview(canvasRef, canPreview, previewControls);

  if (!canPreview) {
    return (
      <div className="canvas-placeholder rule-preview rule-preview--pending">
        <span className="rule-preview__pending-text">
          [캔버스 영역 - {ruleGroup?.category}]
        </span>
      </div>
    );
  }

  return (
    <div
      className="canvas-placeholder rule-preview"
      aria-label={`${ruleGroup.category} 미니 시뮬레이션`}
    >
      <canvas
        ref={canvasRef}
        className="rule-preview__canvas"
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          background: "transparent",
        }}
      />
    </div>
  );
}

export default RulePreview;
