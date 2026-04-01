// 박쥐 - 빠른 속도, 지그재그 움직임
export function initBat(rect, width, height) {
  const speed = Math.random() * 2 + 3;
  const angle = Math.random() * Math.PI * 2;
  return {
    x: Math.random() * (rect.width - width),
    y: Math.random() * (rect.height - height),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    baseVy: Math.sin(angle) * speed,
    baseSpeed: speed,
    width,
    height,
    pattern: "zigzag",
    time: 0,
  };
}

export function updateBat(animal, rect) {
  // 지그재그: 사인파 움직임 (기본 vy에 오프셋 추가)
  // animal.vy = animal.baseVy + Math.sin(animal.time * 0.05) * 0.3;

  // 위치 업데이트
  animal.x += animal.vx;
  animal.y += animal.vy;

  // 벽 충돌 감지
  if (animal.x <= 0 || animal.x + animal.width >= rect.width) {
    animal.vx *= -1;
    animal.x = Math.max(0, Math.min(rect.width - animal.width, animal.x));
  }
  if (animal.y <= 0 || animal.y + animal.height >= rect.height) {
    animal.vy *= -1;
    animal.y = Math.max(0, Math.min(rect.height - animal.height, animal.y));
  }
}

export default { init: initBat, update: updateBat };
