// 각 동물별 상세 정보 (이름, 학명, 설명 등)
export const ANIMAL_DETAILS = {
  starling: {
    korean: "흰점찌르레기",
    english: "Starling",
    scientific: "Sturnus vulgaris Linnaeus",
    rules: [
      {
        id: "individual_parameters",
        category: "개별 비행 규칙",
        behaviors: [
          {
            name: "비행 속도",

            description:
              "찌르레기는 비행 중 속력의 크기를 거의 일정하게 유지하려는 성질을 보이며, 연구에서는 대체로 약 7~12 m/s 범위가 제시됩니다. 방향 전환 시에도 가속도는 속력 자체를 바꾸기보다 진행 방향을 꺾는 데 더 크게 쓰이는 것으로 설명됩니다.",
          },
          {
            name: "배제 구역", //(Hard Core)

            description:
              "각 개체 주변에는 다른 새가 침범하지 않는 절대적인 최소 거리 구간이 존재하며, 그 직경은 약 0.38~0.4m로 제시됩니다. 이 값은 찌르레기의 평균 날개 길이와 비슷한 척도로, 군집의 밀도와 무관하게 유지되는 물리적 기준으로 해석됩니다.",
          },
          {
            name: "반응 시간 지연", //(Reaction Time Delay)
            description:
              "찌르레기는 이웃의 변화를 감지한 직후 즉시 반응하지 않고, 평균 약 0.076초, 표준편차 약 0.01초의 짧은 시간 지연을 둔 뒤 반응하는 것으로 보고됩니다. 이 미세한 지연은 군집 전체가 동시에 움직이기보다, 정보가 파동처럼 순차적으로 전달되는 원인으로 설명됩니다.",
          },
          {
            name: "비등방적 시야", //(Anisotropic Vision)
            description:
              "찌르레기의 시야는 모든 방향에서 동일한 민감도를 보이지 않으며, 일반적으로 전후방보다 측면에 있는 이웃의 움직임에 더 민감하게 반응하는 특성이 강조됩니다. 이러한 시야 특성은 군집 내 개체 배치가 측면 방향으로 더 밀집되는 이방성 구조와도 연결됩니다.",
          },
        ],
      },
      {
        id: "interaction_rules",
        category: "위상적 상호작용",
        behaviors: [
          {
            name: "위상학적 이웃", //(Topological Neighbors)
            description:
              "찌르레기는 물리적 거리 기준으로 일정 반경 안의 개체를 모두 참고하기보다, 자신과 가장 가까운 약 6~7마리의 이웃만을 선택적으로 인식하는 것으로 설명됩니다. 연구에서는 이 숫자가 외부 불확실성 속에서도 군집 응집력과 정보 전달 효율을 안정적으로 유지하는 범위로 제시됩니다.",
          },
          {
            name: "단일 이웃 회피", //(Single Neighbor Avoidance)
            description:
              "충돌 회피는 인식한 모든 이웃을 동시에 피하는 것보다, 가장 가까운 단 한 마리의 위치에 우선 반응하는 방식이 실제 군집의 부피와 확산 양상을 더 잘 재현하는 것으로 보고됩니다. 이 규칙은 인지 부담을 줄이면서도 안정적인 분리 행동을 유지하게 합니다.",
          },
          {
            name: "정렬 및 응집", //(Alignment / Cohesion)
            description:
              "각 개체는 가까운 이웃들의 평균적인 비행 방향에 맞추려는 정렬 성향과, 무리의 중심에서 지나치게 멀어지지 않으려는 응집 성향 사이에서 균형을 이룹니다. 찌르레기 군집은 특히 높은 편극도(Φ≈0.96)를 보이는 경우가 많아, 작은 방향 변동도 전체 군집으로 빠르게 확산될 수 있는 상태를 유지합니다.",
          },
        ],
      },
      {
        id: "specific_maneuvers",
        category: "초유체적 정보 전파",
        behaviors: [
          {
            name: "등반경 경로 회전", //(Equal-Radius Paths)
            description:
              "군집이 방향을 틀 때 각 개체는 서로 다른 회전 중심을 가지더라도 유사한 곡률 반경을 유지하며 회전하는 것으로 설명됩니다. 이 특성은 속도를 크게 줄이지 않고도 전체 대형을 유지한 채 빠른 집단 회전을 가능하게 하며, 정보 전달 방식이 물리학의 스핀 보존과 유사하다는 해석도 제시됩니다.",
          },
          {
            name: "뱅킹 및 고도 손실", //(Banking)
            description:
              "급회전 시 찌르레기는 몸을 옆으로 기울이는 뱅킹 동작을 수행하며, 이 과정에서 양력의 방향이 변해 중력 방향으로 약간의 고도 손실이 동반될 수 있습니다. 따라서 방향 전환은 단순한 평면 회전이 아니라 3차원적인 비행 기동으로 이해됩니다.",
          },
          {
            name: "동요파 전파", //(Agitation Wave)
            description:
              "포식자 위협 시 관찰되는 어두운 띠는 밀도 변화보다 개체들이 지그재그 또는 스키터 기동을 수행하며 날개의 넓은 면을 드러내는 데서 생기는 시각적 현상으로 설명됩니다. 이 파동은 약 20~40 m/s의 속도로 매우 빠르게 전파되며, 포식자로부터 멀어질수록 기울기 각도가 대략 0.25%~1%씩 줄어들어 점차 감쇠하는 경향을 보입니다.",
          },
        ],
      },
      {
        id: "flock_structure",
        category: "군집의 구조적 속성",
        behaviors: [
          {
            name: "군집 형태", //(Aspect Ratio)
            description:
              "찌르레기 군집은 중력 방향으로는 얇고 수평 방향으로는 더 넓게 퍼진 판형 구조를 보이는 경우가 많습니다. 세 축의 비율은 약 1:2.8:5.6으로 보고되며, 이는 군집이 구형보다 납작하고 길게 늘어난 형태를 선호함을 보여줍니다.",
          },
          {
            name: "밀도 기울기", //(Density Gradient)
            description:
              "군집의 밀도는 중심부보다 가장자리에서 더 높게 형성되는 경향이 보고됩니다. 이러한 분포는 포식자의 침입에 대비해 외곽에 더 견고한 층을 형성하려는 방어 기제로 해석되며, 동시에 가장자리에서의 정보 전달 효율과도 관련된 특성으로 논의됩니다.",
          },
          {
            name: "회전 시작점", //(Edge Initiation)
            description:
              "자발적인 방향 전환은 군집의 중심보다 가장 가늘게 늘어난 가장자리 부근의 소수 개체에서 먼저 시작되는 경우가 많은 것으로 설명됩니다. 가장자리 개체는 이웃의 피드백이 상대적으로 적어 기존 진행 방향에서 더 자유롭게 벗어날 수 있고, 이러한 편차가 주변 이웃을 따라 전체 군집의 새로운 진행 방향으로 확산됩니다.",
          },
        ],
      },
    ],
  },
  sardine: {
    korean: "태평양정어리",
    english: "Pacific Sardine",
    scientific: "Sardinops sagax caerulea",
    rules: [],
  },
  grasshopper: {
    korean: "사막메뚜기",
    english: "Desert Locust",
    scientific: "Schistocerca gregaria",
    rules: [],
  },
  ant: {
    korean: "군대개미",
    english: "Army Ant",
    scientific: "Eciton burchellii",
    rules: [],
  },
  bat: {
    korean: "멕시코자유꼬리박쥐",
    english: "Mexican Free-tailed Bat",
    scientific: "Tadarida brasiliensis",
    rules: [],
  },
  sheep: {
    korean: "메리노(양)",
    english: "Merino",
    scientific: "-학명없음-",
    rules: [],
  },
  penguin: {
    korean: "황제펭귄",
    english: "Emperor Penguin",
    scientific: "Aptenodytes forsteri",
    rules: [],
  },
  bee: {
    korean: "재래꿀벌",
    english: "Eastern Honey Bee",
    scientific: "Apis cerana Fabricius",
    rules: [],
  },
  firefly: {
    korean: "동기반딧불이",
    english: "Synchronous Firefly",
    scientific: "Photinus carolinus",
    rules: [],
  },
  spiny_lobster: {
    korean: "카리브해닭새우",
    english: "Caribbean Spiny Lobster",
    scientific: "Panulirus argus",
    rules: [],
  },
  krill: {
    korean: "남극크릴",
    english: "Antarctic Krill",
    scientific: "Euphausia superba",
    rules: [],
  },
};

/**
 * 동물 ID로 상세 정보를 조회합니다.
 * @param {string} animalId - 동물 ID (예: 'starling', 'sardine')
 * @returns {Object} 동물의 상세 정보
 */
export const getAnimalDetails = (animalId) => {
  return ANIMAL_DETAILS[animalId] || null;
};

/**
 * 동물 ID로 행동 규칙을 조회합니다.
 * @param {string} animalId - 동물 ID (예: 'starling')
 * @returns {Array} 행동 규칙 배열
 */
export const getAnimalRules = (animalId) => {
  const details = ANIMAL_DETAILS[animalId];
  return details?.rules || [];
};
