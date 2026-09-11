export const STARLING_DETAILS = {
  korean: "흰점찌르레기",
  english: "Starling",
  scientific: "Sturnus vulgaris Linnaeus",
  rules: [
    {
      id: "individual_parameters",
      previewId: "starling_flight",
      category: "한 마리의 비행",
      behaviors: [
        {
          id: "flight_speed",
          name: "비행 속도",
          parameter: {
            label: "비행 속도",
            unit: "미터/초",
            min: 7,
            max: 12,
            decimals: 1,
            step: 0.1,
            defaultValue: 9.5,
          },
          description:
            "찌르레기는 해 질 녘 잠자리 위에서 무리 지어 날아다닌다. 무리가 함께 방향을 바꿀 때에도 속력을 크게 바꾸지 않고 비행을 이어간다.",
        },
        {
          id: "minimum_spacing",
          name: "충돌을 피하는 거리",
          parameter: {
            label: "최소 간격",
            unit: "미터",
            min: 0.3,
            max: 0.6,
            decimals: 2,
            step: 0.01,
            defaultValue: 0.39,
          },
          description:
            "찌르레기는 가까운 이웃과 부딪히지 않도록 거리를 벌린다. 이웃과의 간격은 날개를 펼친 폭과 비슷한 약 40cm보다 좁아지는 경우가 드물다.",
        },
        {
          id: "reaction_time",
          name: "반응 시간",
          parameter: {
            label: "반응 시간",
            unit: "초",
            min: 0.03,
            max: 0.12,
            decimals: 3,
            step: 0.001,
            defaultValue: 0.076,
          },
          description:
            "찌르레기의 움직임 변화는 짧은 시간 차를 두고 이웃으로 이어진다. 무리의 방향 전환도 이러한 시간 차를 두고 차례로 진행된다.",
        },
        {
          id: "lateral_influence",
          name: "이웃의 위치",
          parameter: {
            label: "측면 이웃의 영향",
            unit: "퍼센트",
            min: 0,
            max: 100,
            decimals: 0,
            step: 1,
            defaultValue: 50,
          },
          description:
            "찌르레기 무리에서는 바로 앞뒤보다 옆쪽에 이웃이 더 많이 자리한다. 각 개체는 주변 이웃과 위치를 조절하며 함께 날아간다.",
        },
      ],
    },
    {
      id: "interaction_rules",
      previewId: "starling_interactions",
      category: "이웃과 함께 날기",
      behaviors: [
        {
          id: "neighbor_count",
          parameter: {
            label: "참고 이웃 수",
            unit: "마리",
            min: 3,
            max: 10,
            step: 1,
            defaultValue: 7,
            decimals: 0,
          },
          name: "참고하는 이웃 수",
          description:
            "찌르레기는 가까운 이웃들의 움직임에 맞춰 날아간다. 무리 안에서 서로 영향을 주고받는 범위는 가까운 이웃 약 6~7마리로 나타난다.",
        },
        {
          id: "avoidance_priority",
          parameter: {
            label: "회피 강도",
            unit: "퍼센트",
            min: 0,
            max: 100,
            step: 1,
            defaultValue: 50,
            decimals: 0,
          },
          name: "가까운 이웃 피하기",
          description:
            "이웃이 너무 가까워지면 부딪히지 않도록 움직임을 조절한다. 이렇게 거리를 벌리는 동안 무리 안에서 서로의 위치도 달라진다.",
        },
        {
          id: "alignment_strength",
          parameter: {
            label: "방향 맞추기 강도",
            unit: "퍼센트",
            min: 0,
            max: 100,
            step: 1,
            defaultValue: 50,
            decimals: 0,
          },
          name: "방향 맞추기",
          description:
            "찌르레기는 가까운 이웃들과 비슷한 방향으로 날아간다. 이웃의 움직임에 맞춰 방향을 조절하며 함께 이동한다.",
        },
        {
          id: "cohesion_strength",
          name: "무리에서 떨어지지 않기",
          parameter: {
            label: "이웃 접근 강도",
            unit: "퍼센트",
            min: 0,
            max: 100,
            step: 1,
            defaultValue: 50,
            decimals: 0,
          },
          description:
            "찌르레기는 가까운 이웃들과 거리를 조절하며 무리를 유지한다. 방향을 맞추는 것과 함께, 이웃 곁에서 비행을 이어가는 움직임이다.",
        },
      ],
    },
    {
      id: "specific_maneuvers",
      previewId: "starling_turns",
      category: "함께 방향 바꾸기",
      behaviors: [
        {
          id: "turn_radius",
          parameter: {
            label: "회전 반경",
            unit: "미터",
            min: 5,
            max: 30,
            step: 1,
            defaultValue: 15,
            decimals: 0,
          },
          name: "회전 경로",
          description:
            "찌르레기는 무리 전체가 한 점을 중심으로 돌기보다, 각자 비슷한 크기의 곡선을 그리며 방향을 바꾼다. 이때 비행 속력을 크게 바꾸지 않고 회전을 이어간다.",
        },
        {
          id: "bank_angle",
          parameter: {
            label: "기울기 각도",
            unit: "도",
            min: 0,
            max: 60,
            step: 1,
            defaultValue: 23,
            decimals: 0,
          },
          name: "몸 기울이기",
          description:
            "찌르레기는 방향을 바꿀 때 몸을 옆으로 기울인다. 기울어진 몸과 날개는 바라보는 위치에 따라 넓거나 좁게 보인다.",
        },
        {
          id: "turn_wave_speed",
          parameter: {
            label: "회전 전달 속도",
            unit: "미터/초",
            min: 20,
            max: 40,
            step: 1,
            defaultValue: 30,
            decimals: 0,
          },
          name: "회전의 전달",
          description:
            "몇 마리가 먼저 방향을 바꾸면 이웃들이 짧은 시간 차를 두고 뒤따른다. 이 변화는 새가 날아가는 속도보다 빠르게 무리 안으로 퍼질 수 있다.",
        },
        {
          id: "agitation_wave",
          name: "위협 때 보이는 파동",
          description:
            "포식자가 공격할 때는 어두운 띠가 무리를 가로질러 흐르기도 한다. 몸과 날개의 방향 변화가 이 띠를 만든다는 설명이 있지만, 정확한 원리는 아직 밝혀지는 중이다.",
        },
      ],
    },
    {
      id: "flock_structure",
      previewId: "starling_shape",
      category: "무리의 모양",
      behaviors: [
        {
          id: "flock_shape",
          parameter: {
            label: "넓이와 두께 비",
            unit: "배",
            min: 3,
            max: 8,
            step: 0.1,
            defaultValue: 5.6,
            decimals: 1,
          },
          name: "넓이와 두께",
          description:
            "찌르레기 무리는 위아래로 얇고 옆으로 넓게 펼쳐진 모습을 보이기도 한다. 무리의 크기와 윤곽은 달라지며, 늘 같은 모양을 유지하지는 않는다.",
        },
        {
          id: "density_difference",
          parameter: {
            label: "밀도 차이",
            unit: "퍼센트",
            min: 0,
            max: 100,
            step: 1,
            defaultValue: 50,
            decimals: 0,
          },
          name: "안쪽과 가장자리",
          description:
            "잠자리 위를 나는 무리에서는 안쪽보다 가장자리의 새들이 더 가까이 모인 모습이 관찰된다. 멀리서 보이는 짙은 부분은 새들이 앞뒤로 겹쳐 보인 결과일 수도 있다.",
        },
        {
          id: "view_angle",
          parameter: {
            label: "관찰 각도",
            unit: "도",
            min: 0,
            max: 90,
            step: 1,
            defaultValue: 30,
            decimals: 0,
          },
          name: "바라보는 방향",
          description:
            "같은 무리도 옆에서 보면 얇은 띠로, 위에서 보면 넓게 펼쳐진 모습으로 보인다. 새들이 시선 방향으로 겹치므로 화면의 짙기만으로 실제 밀도를 판단하기는 어렵다.",
        },
        {
          id: "turn_origin",
          name: "회전의 시작",
          description:
            "포식자가 없어도 길게 뻗은 가장자리의 몇 마리가 먼저 방향을 바꾸며 무리의 회전이 시작되기도 한다. 주변 이웃들이 이 움직임을 따라가면서 무리 전체의 진행 방향이 달라진다.",
        },
      ],
    },
  ],
};
