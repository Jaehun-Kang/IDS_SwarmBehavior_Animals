// 각 동물별 상세 정보 (이름, 학명, 설명 등)
export const ANIMAL_DETAILS = {
  starling: {
    korean: "흰점찌르레기",
    english: "Starling",
    scientific: "Sturnus vulgaris Linnaeus",
    description: "",
    rules: [
      {
        id: "individual_parameters",
        category: "개체 물리 및 환경 변수",
        title: "Individual Parameters",
        behaviors: [
          {
            name: "항속 유지 (Constant Speed)",
            description:
              "찌르레기는 비행 중 속력을 일정하게 유지하려는 경향이 있습니다. 속력 값은 7∼12 m/s 사이의 고정된 크기로 설정하고, 가속도는 방향 전환에만 사용해야 합니다.",
          },
          {
            name: "배제 구역 (Hard Core)",
            description:
              "개체 간의 절대적인 침범 불가 구역으로, 직경은 날개 길이와 유사한 약 0.38m∼0.4m입니다.",
          },
          {
            name: "반응 시간 지연 (Reaction Time Delay)",
            description:
              "이웃의 변화를 감지하고 반응하는 데 걸리는 평균 시간은 0.076s (표준편차 0.01s)입니다.",
          },
          {
            name: "비등방적 시야 (Anisotropic Vision)",
            description:
              "눈의 구조상 앞뒤보다는 측면에 위치한 이웃의 움직임에 더 민감하게 반응하도록 가중치를 설정합니다.",
          },
        ],
      },
      {
        id: "interaction_rules",
        category: "인지 및 사회적 상호작용 규칙",
        title: "Interaction Rules",
        behaviors: [
          {
            name: "위상학적 이웃 (Topological Neighbors)",
            description:
              "거리와 관계없이 가장 가까운 6∼7마리의 이웃만을 인식하여 정보를 교환합니다. 고정 반경(Radius) 대신 nearest neighbors 로직을 사용합니다.",
          },
          {
            name: "단일 이웃 회피 (Single Neighbor Avoidance)",
            description:
              "충돌 방지(Separation) 시 6∼7마리 전체를 피하는 것보다, 가장 가까운 단 한 마리의 이웃만을 집중적으로 피하는 것이 실제 군집의 부피와 확산 데이터를 재현하는 데 더 효과적입니다.",
          },
          {
            name: "정렬 및 응집 (Alignment & Cohesion)",
            description:
              "인식한 6∼7마리 이웃의 평균 비행 방향과 자신의 방향을 일치시키고, 그들의 평균 위치를 향해 이동합니다.",
          },
        ],
      },
      {
        id: "specific_maneuvers",
        category: "특정 기동 및 파동 동작",
        title: "Specific Maneuvers",
        behaviors: [
          {
            name: "등반경 경로 회전 (Equal-Radius Paths)",
            description:
              "군집이 방향을 틀 때, 모든 개체는 서로 다른 회전 중심을 가질 수 있으나 동일한 곡률 반경 (R)을 유지하며 회전합니다. 이를 통해 속력 변화 없이 빠른 집단 회전이 가능해집니다.",
          },
          {
            name: "뱅킹 (Banking) 및 고도 손실",
            description:
              "급격한 회전 시 몸을 옆으로 기울이는데(Banking), 이때 중력 방향으로 약간의 고도 손실이 발생하는 물리적 특성을 반영해야 합니다.",
          },
          {
            name: "동요파 (Agitation Wave) 전파",
            description:
              "지그재그(Zigzag) 또는 스키터(Skitter) 기동으로, 한쪽으로 구르는(Roll) 동작을 포함합니다. 정보는 군집을 가로질러 20∼40 m/s의 속도로 매우 빠르게 전파되며, 전달될 때마다 최대 기울기 각도를 약 0.25%∼1%씩 감소시켜 파동이 서서히 사라집니다.",
          },
        ],
      },
      {
        id: "flock_structure",
        category: "군집 구조 및 분포",
        title: "Flock Structure",
        behaviors: [
          {
            name: "군집 형태 (Aspect Ratio)",
            description:
              "무리는 중력 방향으로 얇은 판 모양을 띠며, 세 축의 비율(I₁:I₂:I₃)은 약 1:2.8:5.6입니다.",
          },
          {
            name: "밀도 기울기 (Density Gradient)",
            description:
              "군집의 가장자리 밀도를 중심부보다 높게 설정해야 합니다 (포식자 방어 기제).",
          },
          {
            name: "회전 시작점 (Edge Initiation)",
            description:
              "방향 전환은 군집의 중심이 아닌, 가늘게 늘어진 가장자리(Elongated edge)에 위치한 소수 개체의 변동에서 시작되어 전체로 퍼져 나갑니다.",
          },
        ],
      },
    ],
  },
  sardine: {
    korean: "태평양정어리",
    english: "Pacific Sardine",
    scientific: "Sardinops sagax caerulea",
    description: "",
    rules: [],
  },
  grasshopper: {
    korean: "사막메뚜기",
    english: "Desert Locust",
    scientific: "Schistocerca gregaria",
    description: "",
    rules: [],
  },
  ant: {
    korean: "군대개미",
    english: "Army Ant",
    scientific: "Eciton burchellii",
    description: "",
    rules: [],
  },
  bat: {
    korean: "멕시코자유꼬리박쥐",
    english: "Mexican Free-tailed Bat",
    scientific: "Tadarida brasiliensis",
    description: "",
    rules: [],
  },
  sheep: {
    korean: "메리노(양)",
    english: "Merino",
    scientific: "-학명없음-",
    description: "",
    rules: [],
  },
  penguin: {
    korean: "황제펭귄",
    english: "Emperor Penguin",
    scientific: "Aptenodytes forsteri",
    description: "",
    rules: [],
  },
  bee: {
    korean: "재래꿀벌",
    english: "Eastern Honey Bee",
    scientific: "Apis cerana Fabricius",
    description: "",
    rules: [],
  },
  firefly: {
    korean: "동기반딧불이",
    english: "Synchronous Firefly",
    scientific: "Photinus carolinus",
    description: "",
    rules: [],
  },
  spiny_lobster: {
    korean: "카리브해닭새우",
    english: "Caribbean Spiny Lobster",
    scientific: "Panulirus argus",
    description: "",
    rules: [],
  },
  krill: {
    korean: "남극크릴",
    english: "Antarctic Krill",
    scientific: "Euphausia superba",
    description: "",
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
