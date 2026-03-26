// 꿀벌 - 중간 속도, 파동 움직임
export function initBee(rect, width, height) {
  const speed = Math.random() * 1 + 2;
  const angle = Math.random() * Math.PI * 2;
  return {
    x: Math.random() * (rect.width - width),
    y: Math.random() * (rect.height - height),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    baseSpeed: speed,
    width,
    height,
    pattern: "wave",
    time: 0,
  };
}

export function updateBee(animal, rect) {
  // 파동: 상하 움직임 추가
  animal.vy = Math.sin(animal.time * 0.1) * 2;

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

export default { init: initBee, update: updateBee };
