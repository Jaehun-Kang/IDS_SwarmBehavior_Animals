// 닭새우 - 중간 속도, 직선 움직임
export function initSpinyLobster(rect, width, height) {
  const speed = Math.random() * 1 + 1.5;
  const angle = Math.random() * Math.PI * 2;
  return {
    x: Math.random() * (rect.width - width),
    y: Math.random() * (rect.height - height),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    baseSpeed: speed,
    width,
    height,
    pattern: "uniform",
    time: 0,
  };
}

export function updateSpinyLobster(animal, rect) {
  // uniform 패턴: 직진 움직임만

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

export default { init: initSpinyLobster, update: updateSpinyLobster };
