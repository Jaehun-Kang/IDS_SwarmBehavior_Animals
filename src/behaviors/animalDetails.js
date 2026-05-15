// 각 동물별 상세 정보 (이름, 학명, 설명 등)
export const ANIMAL_DETAILS = {
  starling: {
    korean: "흰점찌르레기",
    english: "Starling",
    scientific: "Sturnus vulgaris Linnaeus",
    // description:
    //   "흰점찌르레기의 군집 비행은 개체 수준의 단순한 반응이 국소적으로 연결되며 형성되는 집단 행동입니다. 각 개체는 가까운 이웃의 위치와 방향을 참고해 간격을 조절하고, 비행 방향을 맞추고, 급회전이나 파동처럼 보이는 큰 움직임을 만들어 냅니다. 아래 항목은 실증 연구에서 반복적으로 언급되는 비행 특성을 행동 유형별로 정리한 설명입니다.",
    bibliography: [
      {
        id: "attanasi2014_turning",
        citation:
          "Attanasi, A. et al. (2014). Superfluid transport of information in turning flocks of starlings. Nature Physics, 10(9), 691-696.",
      },
      {
        id: "ballerini2008_benchmark",
        citation:
          "Ballerini, M. et al. (2008). Empirical investigation of starling flocks: a benchmark study in collective animal behaviour. Animal Behaviour, 76(1), 201-215.",
      },
      {
        id: "hemelrijk2015_waves",
        citation:
          "Hemelrijk, C. K. et al. (2015). What underlies waves of agitation in starling flocks. Behavioral Ecology and Sociobiology, 69(5), 755-764.",
      },
      {
        id: "ballerini2008_large_flocks",
        citation:
          "Ballerini, M. et al. (2008). An empirical study of large, naturally occurring starling flocks: a benchmark in collective animal behaviour.",
      },
      {
        id: "young2013_consensus",
        citation:
          "Young, G. F. et al. (2013). Starling flock networks manage uncertainty in consensus at low cost. PLoS Computational Biology, 9(1), e1002894.",
      },
      {
        id: "hemelrijk2015_topological",
        citation:
          "Hemelrijk, C. K., & Hildenbrandt, H. (2015). Diffusion and Topological Neighbours in Flocks of Starlings: Relating a Model to Empirical Data. PLoS ONE, 10(5), e0126913.",
      },
      {
        id: "cavagna2010_scalefree",
        citation:
          "Cavagna, A. et al. (2010). Scale-free correlations in starling flocks. Proceedings of the National Academy of Sciences, 107(26), 11865-11870.",
      },
      {
        id: "hemelrijk2019_damping",
        citation:
          "Hemelrijk, C. K., & Hildenbrandt, H. (2019). Damping of waves of agitation in starling flocks. Behavioral Ecology and Sociobiology, 73, 125.",
      },
      {
        id: "storms2019_escape",
        citation:
          "Storms, R. F. et al. (2019). Complex patterns of collective escape in starling flocks under predation. Behavioral Ecology and Sociobiology, 73, 10.",
      },
      {
        id: "attanasi2015_direction_change",
        citation:
          "Attanasi, A. et al. (2015). Emergence of collective changes in travel direction of starling flocks from individual birds fluctuations. (Source 9 PDF).",
      },
    ],
    rules: [
      {
        id: "individual_parameters",
        category: "개별 비행 규칙",
        // title: "Individual Rules",
        // summary:
        //   "이 분류는 한 마리의 찌르레기가 비행 중 어떤 기본 제약과 감각 조건 안에서 움직이는지를 다룹니다. 속도의 안정성, 약 0.38~0.4m의 최소 간격, 평균 0.076초의 반응 지연, 시야 방향에 따른 민감도는 모두 개체 수준에서 군집 행동의 기반이 되는 요소입니다.",
        behaviors: [
          {
            name: "항속 유지 ", //(Constant Speed)

            description:
              "찌르레기는 비행 중 속력의 크기를 거의 일정하게 유지하려는 성질을 보이며, 연구에서는 대체로 약 7~12 m/s 범위가 제시됩니다. 방향 전환 시에도 가속도는 속력 자체를 바꾸기보다 진행 방향을 꺾는 데 더 크게 쓰이는 것으로 설명됩니다.",
            citationIds: ["attanasi2014_turning"],
            source:
              "Attanasi, A. et al. (2014). Superfluid transport of information in turning flocks of starlings. Nature Physics, 10(9), 691-696.",
          },
          {
            name: "배제 구역 ", //(Hard Core)

            description:
              "각 개체 주변에는 다른 새가 침범하지 않는 절대적인 최소 거리 구간이 존재하며, 그 직경은 약 0.38~0.4m로 제시됩니다. 이 값은 찌르레기의 평균 날개 길이와 비슷한 척도로, 군집의 밀도와 무관하게 유지되는 물리적 기준으로 해석됩니다.",
            citationIds: ["ballerini2008_benchmark"],
            source:
              "Ballerini, M. et al. (2008). Empirical investigation of starling flocks: a benchmark study in collective animal behaviour. Animal Behaviour, 76(1), 201-215.",
          },
          {
            name: "반응 시간 지연 ", //(Reaction Time Delay)
            description:
              "찌르레기는 이웃의 변화를 감지한 직후 즉시 반응하지 않고, 평균 약 0.076초, 표준편차 약 0.01초의 짧은 시간 지연을 둔 뒤 반응하는 것으로 보고됩니다. 이 미세한 지연은 군집 전체가 동시에 움직이기보다, 정보가 파동처럼 순차적으로 전달되는 원인으로 설명됩니다.",
            citationIds: ["hemelrijk2015_waves"],
            source:
              "Hemelrijk, C. K. et al. (2015). What underlies waves of agitation in starling flocks. Behavioral Ecology and Sociobiology, 69(5), 755-764.",
          },
          {
            name: "비등방적 시야 ", //(Anisotropic Vision)
            description:
              "찌르레기의 시야는 모든 방향에서 동일한 민감도를 보이지 않으며, 일반적으로 전후방보다 측면에 있는 이웃의 움직임에 더 민감하게 반응하는 특성이 강조됩니다. 이러한 시야 특성은 군집 내 개체 배치가 측면 방향으로 더 밀집되는 이방성 구조와도 연결됩니다.",
            citationIds: ["ballerini2008_large_flocks"],
            source:
              "Ballerini, M. et al. (2008). An empirical study of large, naturally occurring starling flocks: a benchmark in collective animal behaviour.",
          },
        ],
        references: [
          "Attanasi, A. et al. (2014). Superfluid transport of information in turning flocks of starlings. Nature Physics, 10(9), 691-696.",
          "Ballerini, M. et al. (2008). Empirical investigation of starling flocks: a benchmark study in collective animal behaviour. Animal Behaviour, 76(1), 201-215.",
          "Hemelrijk, C. K. et al. (2015). What underlies waves of agitation in starling flocks. Behavioral Ecology and Sociobiology, 69(5), 755-764.",
          "Ballerini, M. et al. (2008). An empirical study of large, naturally occurring starling flocks: a benchmark in collective animal behaviour.",
        ],
      },
      {
        id: "interaction_rules",
        category: "위상적 상호작용",
        // title: "Topological Interaction",
        // summary:
        //   "이 분류는 한 개체가 가까운 이웃과 어떤 규칙으로 상호작용하는지를 정리합니다. 찌르레기 군집의 질서는 전체 무리를 한 번에 계산하는 방식이 아니라, 주로 가장 가까운 6~7마리의 이웃과 주고받는 국소적 피드백이 반복되며 만들어집니다.",
        behaviors: [
          {
            name: "위상학적 이웃 ", //(Topological Neighbors)
            description:
              "찌르레기는 물리적 거리 기준으로 일정 반경 안의 개체를 모두 참고하기보다, 자신과 가장 가까운 약 6~7마리의 이웃만을 선택적으로 인식하는 것으로 설명됩니다. 연구에서는 이 숫자가 외부 불확실성 속에서도 군집 응집력과 정보 전달 효율을 안정적으로 유지하는 범위로 제시됩니다.",
            citationIds: ["young2013_consensus"],
            source:
              "Young, G. F. et al. (2013). Starling flock networks manage uncertainty in consensus at low cost. PLoS Computational Biology, 9(1), e1002894.",
          },
          {
            name: "단일 이웃 회피 ", //(Single Neighbor Avoidance)
            description:
              "충돌 회피는 인식한 모든 이웃을 동시에 피하는 것보다, 가장 가까운 단 한 마리의 위치에 우선 반응하는 방식이 실제 군집의 부피와 확산 양상을 더 잘 재현하는 것으로 보고됩니다. 이 규칙은 인지 부담을 줄이면서도 안정적인 분리 행동을 유지하게 합니다.",
            citationIds: ["hemelrijk2015_topological"],
            source:
              "Hemelrijk, C. K., & Hildenbrandt, H. (2015). Diffusion and Topological Neighbours in Flocks of Starlings: Relating a Model to Empirical Data. PLoS ONE, 10(5), e0126913.",
          },
          {
            name: "정렬 및 응집 ", //(Alignment / Cohesion)
            description:
              "각 개체는 가까운 이웃들의 평균적인 비행 방향에 맞추려는 정렬 성향과, 무리의 중심에서 지나치게 멀어지지 않으려는 응집 성향 사이에서 균형을 이룹니다. 찌르레기 군집은 특히 높은 편극도(Φ≈0.96)를 보이는 경우가 많아, 작은 방향 변동도 전체 군집으로 빠르게 확산될 수 있는 상태를 유지합니다.",
            citationIds: ["cavagna2010_scalefree"],
            source:
              "Cavagna, A. et al. (2010). Scale-free correlations in starling flocks. Proceedings of the National Academy of Sciences, 107(26), 11865-11870.",
          },
        ],
        references: [
          "Young, G. F. et al. (2013). Starling flock networks manage uncertainty in consensus at low cost. PLoS Computational Biology, 9(1), e1002894.",
          "Hemelrijk, C. K., & Hildenbrandt, H. (2015). Diffusion and Topological Neighbours in Flocks of Starlings: Relating a Model to Empirical Data. PLoS ONE, 10(5), e0126913.",
          "Cavagna, A. et al. (2010). Scale-free correlations in starling flocks. Proceedings of the National Academy of Sciences, 107(26), 11865-11870.",
        ],
      },
      {
        id: "specific_maneuvers",
        category: "초유체적 정보 전파",
        // title: "Superfluid Propagation",
        // summary:
        //   "이 분류는 집단 회전과 파동 전파처럼, 정보 전달 속도가 개체 비행 속도와 구분되어 드러나는 역동적 기동을 다룹니다. 찌르레기 군집은 급격한 방향 전환과 포식자 회피 상황에서 특히 강한 집단 반응을 보이며, 동요파는 약 20~40 m/s의 속도로 퍼지고 전달 과정에서 약 0.25%~1% 수준의 감쇠가 나타나는 것으로 설명됩니다.",
        behaviors: [
          {
            name: "등반경 경로 회전 ", //(Equal-Radius Paths)
            description:
              "군집이 방향을 틀 때 각 개체는 서로 다른 회전 중심을 가지더라도 유사한 곡률 반경을 유지하며 회전하는 것으로 설명됩니다. 이 특성은 속도를 크게 줄이지 않고도 전체 대형을 유지한 채 빠른 집단 회전을 가능하게 하며, 정보 전달 방식이 물리학의 스핀 보존과 유사하다는 해석도 제시됩니다.",
            citationIds: ["attanasi2014_turning"],
            source:
              "Attanasi, A. et al. (2014). Superfluid transport of information in turning flocks of starlings. Nature Physics, 10(9), 691-696.",
          },
          {
            name: "뱅킹 및 고도 손실", //(Banking)
            description:
              "급회전 시 찌르레기는 몸을 옆으로 기울이는 뱅킹 동작을 수행하며, 이 과정에서 양력의 방향이 변해 중력 방향으로 약간의 고도 손실이 동반될 수 있습니다. 따라서 방향 전환은 단순한 평면 회전이 아니라 3차원적인 비행 기동으로 이해됩니다.",
            citationIds: ["ballerini2008_benchmark"],
            source:
              "Ballerini, M. et al. (2008). Empirical investigation of starling flocks: a benchmark study in collective animal behaviour. Animal Behaviour, 76(1), 201-215.",
          },
          {
            name: "동요파 전파", //(Agitation Wave)
            description:
              "포식자 위협 시 관찰되는 어두운 띠는 밀도 변화보다 개체들이 지그재그 또는 스키터 기동을 수행하며 날개의 넓은 면을 드러내는 데서 생기는 시각적 현상으로 설명됩니다. 이 파동은 약 20~40 m/s의 속도로 매우 빠르게 전파되며, 포식자로부터 멀어질수록 기울기 각도가 대략 0.25%~1%씩 줄어들어 점차 감쇠하는 경향을 보입니다.",
            citationIds: ["hemelrijk2019_damping"],
            source:
              "Hemelrijk, C. K., & Hildenbrandt, H. (2019). Damping of waves of agitation in starling flocks. Behavioral Ecology and Sociobiology, 73, 125.",
          },
        ],
        references: [
          "Attanasi, A. et al. (2014). Superfluid transport of information in turning flocks of starlings. Nature Physics, 10(9), 691-696.",
          "Ballerini, M. et al. (2008). Empirical investigation of starling flocks: a benchmark study in collective animal behaviour. Animal Behaviour, 76(1), 201-215.",
          "Hemelrijk, C. K., & Hildenbrandt, H. (2019). Damping of waves of agitation in starling flocks. Behavioral Ecology and Sociobiology, 73, 125.",
        ],
      },
      {
        id: "flock_structure",
        category: "군집의 구조적 속성",
        // title: "Structural Properties",
        // summary:
        //   "이 분류는 찌르레기 군집이 공간 속에서 어떤 기하학적 구조를 보이는지, 그리고 큰 방향 변화가 어디서 시작되어 전체로 확산되는지를 다룹니다. 군집은 대체로 1:2.8:5.6의 종횡비를 갖는 얇은 판형 구조로 설명되며, 형상과 분포는 정보 전달과 방어 전략을 반영하는 구조적 특성으로 해석됩니다.",
        behaviors: [
          {
            name: "군집 형태 ", //(Aspect Ratio)
            description:
              "찌르레기 군집은 중력 방향으로는 얇고 수평 방향으로는 더 넓게 퍼진 판형 구조를 보이는 경우가 많습니다. 세 축의 비율은 약 1:2.8:5.6으로 보고되며, 이는 군집이 구형보다 납작하고 길게 늘어난 형태를 선호함을 보여줍니다.",
            citationIds: ["ballerini2008_large_flocks"],
            source:
              "Ballerini, M. et al. (2008). An empirical study of large, naturally occurring starling flocks: a benchmark in collective animal behaviour.",
          },
          {
            name: "밀도 기울기 ", //(Density Gradient)
            description:
              "군집의 밀도는 중심부보다 가장자리에서 더 높게 형성되는 경향이 보고됩니다. 이러한 분포는 포식자의 침입에 대비해 외곽에 더 견고한 층을 형성하려는 방어 기제로 해석되며, 동시에 가장자리에서의 정보 전달 효율과도 관련된 특성으로 논의됩니다.",
            citationIds: ["storms2019_escape"],
            source:
              "Storms, R. F. et al. (2019). Complex patterns of collective escape in starling flocks under predation. Behavioral Ecology and Sociobiology, 73, 10.",
          },
          {
            name: "회전 시작점 ", //(Edge Initiation)
            description:
              "자발적인 방향 전환은 군집의 중심보다 가장 가늘게 늘어난 가장자리 부근의 소수 개체에서 먼저 시작되는 경우가 많은 것으로 설명됩니다. 가장자리 개체는 이웃의 피드백이 상대적으로 적어 기존 진행 방향에서 더 자유롭게 벗어날 수 있고, 이러한 편차가 주변 이웃을 따라 전체 군집의 새로운 진행 방향으로 확산됩니다.",
            citationIds: ["attanasi2015_direction_change"],
            source:
              "Attanasi, A. et al. (2015). Emergence of collective changes in travel direction of starling flocks from individual birds fluctuations. (Source 9 PDF).",
          },
        ],
        references: [
          "Ballerini, M. et al. (2008). An empirical study of large, naturally occurring starling flocks: a benchmark in collective animal behaviour.",
          "Storms, R. F. et al. (2019). Complex patterns of collective escape in starling flocks under predation. Behavioral Ecology and Sociobiology, 73, 10.",
          "Attanasi, A. et al. (2015). Emergence of collective changes in travel direction of starling flocks from individual birds fluctuations. (Source 9 PDF).",
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
