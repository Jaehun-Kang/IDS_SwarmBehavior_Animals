// 메뚜기 - 포물선 호핑 움직임
export function initGrasshopper(rect, width, height) {
  const startX = Math.random() * (rect.width - width);
  const startY = Math.random() * (rect.height - height);

  return {
    x: startX,
    y: startY,
    vx: 0,
    vy: 0,
    width,
    height,
    time: 0,
    baseY: startY,
    hopStartX: startX,
    hopStartY: startY,
    hopTargetX: startX,
    hopTargetY: startY,
    jumpHeight: 80,
  };
}

export function updateGrasshopper(animal, rect) {
  const hopCycle = 180; // 3초 (60fps 기준: 3 * 60 = 180 프레임)
  const hopAnimationTime = 30; // 점프 애니메이션 0.5초 (30프레임)
  const phaseInCycle = animal.time % hopCycle;

  // 범위 경계 정의
  const minX = 0;
  const maxX = rect.width - animal.width;
  const minY = 0;
  const maxY = rect.height - animal.height;

  // 새로운 목표 위치 설정 (180 프레임마다 = 3초)
  if (animal.time % hopCycle === 0) {
    animal.hopStartX = animal.x;
    animal.hopStartY = animal.y; // 현재 y 위치에서 시작 (baseY 대신)
    animal.baseY = animal.y; // baseY도 현재 위치로 업데이트

    // 현재 위치로부터 랜덤 방향의 목표 설정
    const maxRadius = 250;
    const angle = Math.random() * Math.PI * 2;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    // 목표 지점을 반지름 적용하여 계산하되, 범위를 벗어나지 않도록 함
    let targetX = animal.x + cosA * maxRadius;
    let targetY = animal.baseY + sinA * maxRadius;

    // 경계 내로 강제 제한
    animal.hopTargetX = Math.max(minX, Math.min(maxX, targetX));
    animal.hopTargetY = Math.max(minY, Math.min(maxY, targetY));
  }

  // 처음 30프레임만 점프 애니메이션, 나머지는 착지 상태 유지
  if (phaseInCycle < hopAnimationTime) {
    const hopPhase = phaseInCycle / hopAnimationTime;

    // ease-in-out easing
    const easePhase =
      hopPhase < 0.5
        ? 2 * hopPhase * hopPhase
        : -1 + (4 - 2 * hopPhase) * hopPhase;

    // X 위치: 시작점에서 목표점으로 ease-in-out로 이동
    animal.x =
      animal.hopStartX + (animal.hopTargetX - animal.hopStartX) * easePhase;

    // Y 위치: 시작점에서 목표점으로 ease-in-out로 이동하면서 동시에 포물선 점프
    const baseYPosition =
      animal.hopStartY + (animal.hopTargetY - animal.hopStartY) * easePhase;
    const parabola = 4 * hopPhase * (1 - hopPhase);
    animal.y = baseYPosition - animal.jumpHeight * parabola;
  } else {
    // 대기 중 - 착지 상태 유지
    animal.x = animal.hopTargetX;
    animal.y = animal.hopTargetY;
  }

  // 최종 경계 처리 (모든 경우에 적용)
  animal.x = Math.max(minX, Math.min(maxX, animal.x));
  animal.y = Math.max(minY, Math.min(maxY, animal.y));

  animal.vx = 0;
  animal.vy = 0;
}

export default { init: initGrasshopper, update: updateGrasshopper };
