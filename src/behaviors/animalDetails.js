// 각 동물별 상세 정보 (이름, 학명, 설명 등)
export const ANIMAL_DETAILS = {
  starling: {
    korean: "흰점찌르레기",
    english: "Starling",
    scientific: "Sturnus vulgaris Linnaeus",
    description:
      "흰점찌르레기의 군집 비행은 한 개체의 단순한 반응이 여러 마리 사이에서 반복되며 형성되는 집단 행동으로 알려져 있습니다. 각 개체는 가까운 이웃의 위치와 방향을 참고해 간격을 조절하고, 흐름을 맞추고, 회전과 파동 같은 큰 움직임을 만들어 냅니다. 아래 항목은 이러한 비행 특성을 행동 유형별로 정리한 설명입니다.",
    rules: [
      {
        id: "individual_parameters",
        category: "한 마리가 움직이는 기본 방식",
        title: "How One Bird Maintains Flight",
        summary:
          "이 분류는 한 마리의 찌르레기가 비행 중 어떤 기본 조건을 유지하는지를 다룹니다. 속도의 안정성, 최소 간격, 반응 지연, 시야 방향에 따른 민감도처럼 개체 단위의 비행 특성이 여기에 포함됩니다.",
        behaviors: [
          {
            name: "항속 유지 (Constant Speed)",
            description:
              "찌르레기는 비행 중 속도를 크게 흔들기보다 비교적 일정한 속력 범위를 유지하는 경향이 있습니다. 방향 전환은 자주 일어나지만, 속력 자체는 급격하게 변하지 않는 것으로 설명됩니다.",
          },
          {
            name: "배제 구역 (Hard Core)",
            description:
              "각 개체 주변에는 다른 새가 지나치게 가까이 접근하지 않는 최소 거리 구간이 존재하는 것으로 봅니다. 이 영역은 군집이 조밀하게 모여도 서로 겹치지 않고 일정 간격을 유지하게 만드는 기준이 됩니다.",
          },
          {
            name: "반응 시간 지연 (Reaction Time Delay)",
            description:
              "찌르레기는 주변 개체의 변화에 즉시 반응하는 것이 아니라, 매우 짧은 시간차를 두고 반응하는 것으로 알려져 있습니다. 이 지연은 군집 전체의 움직임이 순간적으로 동기화되기보다, 짧은 간격을 두고 이어지는 연속 반응처럼 나타나게 합니다.",
          },
          {
            name: "비등방적 시야 (Anisotropic Vision)",
            description:
              "찌르레기의 시야는 모든 방향에 대해 동일한 민감도를 갖지 않습니다. 일반적으로 앞뒤보다 몸의 측면에 있는 이웃의 움직임에 더 민감하게 반응하는 특성이 강조됩니다.",
          },
        ],
      },
      {
        id: "interaction_rules",
        category: "가까운 이웃을 읽고 맞추는 방식",
        title: "How Nearby Birds Influence Each Other",
        summary:
          "이 분류는 한 개체가 주변 이웃과 어떤 방식으로 상호작용하는지를 정리합니다. 군집의 질서는 전체 무리를 한 번에 인식해서 생기기보다, 가까운 이웃 몇 마리와의 국소적 상호작용이 반복되며 형성됩니다.",
        behaviors: [
          {
            name: "위상학적 이웃 (Topological Neighbors)",
            description:
              "찌르레기는 고정된 거리 반경 안의 모든 개체를 동일하게 참고하기보다, 자신에게 가장 가까운 몇 마리의 이웃을 우선적으로 인식하는 것으로 설명됩니다. 즉 기준은 거리 범위보다 이웃의 순서에 가깝습니다.",
          },
          {
            name: "단일 이웃 회피 (Single Neighbor Avoidance)",
            description:
              "충돌 회피는 여러 이웃을 동시에 피하는 방식보다, 가장 가까운 한 마리의 위치에 우선 반응하는 방식으로 자주 설명됩니다. 이러한 규칙은 군집의 부피와 확산 양상을 재현하는 데 중요한 요소로 다뤄집니다.",
          },
          {
            name: "정렬 및 응집 (Alignment & Cohesion)",
            description:
              "각 개체는 가까운 이웃들의 평균적인 진행 방향에 맞추어 날아가려는 경향을 보이며, 동시에 무리에서 지나치게 멀어지지 않도록 중심 쪽으로 되돌아가려는 성향도 가집니다. 이 두 특성이 결합되면 군집은 하나의 흐름처럼 유지됩니다.",
          },
        ],
      },
      {
        id: "specific_maneuvers",
        category: "급회전과 파동에서 드러나는 움직임",
        title: "Turning, Banking, and Wave-Like Motion",
        summary:
          "이 분류는 군집이 급하게 방향을 바꾸거나, 한쪽의 변화가 빠르게 전체로 퍼질 때 나타나는 특징적인 기동을 다룹니다. 집단 회전, 몸 기울임, 파동 전파는 찌르레기 비행에서 자주 언급되는 대표적 장면입니다.",
        behaviors: [
          {
            name: "등반경 경로 회전 (Equal-Radius Paths)",
            description:
              "군집이 방향을 틀 때 각 개체는 서로 다른 위치에 있어도 유사한 곡률 반경을 유지하며 회전하는 것으로 설명됩니다. 이 성질은 속도를 크게 바꾸지 않고도 집단 전체가 빠르게 방향을 전환하는 데 기여합니다.",
          },
          {
            name: "뱅킹 (Banking) 및 고도 손실",
            description:
              "급회전 시 찌르레기는 몸을 옆으로 기울이는 뱅킹 동작을 보이며, 이 과정에서 중력 방향으로 약간의 고도 손실이 동반될 수 있습니다. 따라서 회전은 단순한 평면 이동이 아니라 입체적인 비행 변화로 이해됩니다.",
          },
          {
            name: "동요파 (Agitation Wave) 전파",
            description:
              "포식자 회피와 같은 상황에서는 한쪽에서 시작된 급격한 변화가 군집 전체로 매우 빠르게 전달되며, 지그재그 또는 스키터와 유사한 파동처럼 관찰되기도 합니다. 이 과정에서 기울기의 세기는 전달될수록 점차 약해지는 경향이 함께 언급됩니다.",
          },
        ],
      },
      {
        id: "flock_structure",
        category: "무리의 모양과 변화가 시작되는 자리",
        title: "Shape, Density, and Where Change Begins",
        summary:
          "이 분류는 군집이 공간 속에서 어떤 형태와 밀도를 보이는지, 그리고 큰 방향 변화가 주로 어디서 시작되는지를 설명합니다. 찌르레기 군집은 모양과 분포 자체도 중요한 행동 특징으로 다뤄집니다.",
        behaviors: [
          {
            name: "군집 형태 (Aspect Ratio)",
            description:
              "찌르레기 군집은 중력 방향으로 얇고 수평 방향으로 더 넓게 퍼진 판형 구조로 자주 설명됩니다. 따라서 무리의 전체 형상은 구형보다 납작하고 길게 늘어난 형태에 가깝습니다.",
          },
          {
            name: "밀도 기울기 (Density Gradient)",
            description:
              "군집의 밀도는 내부와 외부가 완전히 균일하지 않으며, 가장자리에서 더 높은 밀도가 나타나는 경향이 논의됩니다. 이러한 분포는 포식자에 대한 방어와 연관된 구조적 특징으로 해석됩니다.",
          },
          {
            name: "회전 시작점 (Edge Initiation)",
            description:
              "큰 방향 전환은 군집의 중심보다 가늘게 늘어난 가장자리 부근의 소수 개체에서 먼저 시작되는 경우가 많은 것으로 설명됩니다. 이후 이 변화는 주변 이웃을 따라 군집 전체로 전파됩니다.",
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
