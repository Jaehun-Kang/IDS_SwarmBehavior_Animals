export const BAT_DETAILS = {
  korean: "멕시코자유꼬리박쥐", english: "Mexican Free-tailed Bat", scientific: "Tadarida brasiliensis",
  rules: [{
    id: "flight_sensing", previewId: "bat_flight", category: "한 마리의 비행과 감각",
    behaviors: [
      { id: "flight_speed", name: "속도와 선회",
        description: "멕시코자유꼬리박쥐는 동굴에서 나와 빠르게 날아간다. 비행 속도와 경로는 상황에 따라 달라지며, 방향을 바꿀 때는 곡선을 그리며 선회한다.",
        parameter: { label: "비행 속도", unit: "미터/초", min: 4, max: 12, step: 0.5, decimals: 1, defaultValue: 9 } },
      { id: "light_level", name: "눈과 귀로 살피기",
        description: "박쥐는 눈으로 주변을 보면서, 자신이 낸 소리의 메아리로도 공간을 살핀다. 어둠 속에서는 이 메아리를 이용해 주변 물체의 위치를 알아낸다.",
        parameter: { label: "주변 밝기", unit: "퍼센트", min: 0, max: 100, step: 5, decimals: 0, defaultValue: 30 } },
      { id: "sound_masking", name: "겹쳐 들리는 소리",
        description: "여러 박쥐의 소리가 겹치면 약한 메아리를 구별하기 어려워질 수 있다. 그렇다고 무리 안에서 반향정위가 언제나 불가능한 것은 아니다.",
        parameter: { label: "소리 간섭", unit: "퍼센트", min: 0, max: 100, step: 5, decimals: 0, defaultValue: 30 } },
      { id: "social_calls", name: "상황에 따른 발성",
        description: "박쥐는 사회적 상호작용에서도 여러 소리를 낸다. 둥지에서 밀쳐지거나 접촉할 때의 항의 발성은 비행 중 주변을 살피는 반향정위와 구분된다." },
    ],
  }, {
    id: "cave_emergence", previewId: "bat_emergence", category: "동굴에서 나오기",
    behaviors: [
      { id: "emergence_activity", name: "저녁의 출발",
        description: "박쥐는 해 질 무렵 동굴을 나와 먹이를 찾으러 간다. 출발 시각은 밝기뿐 아니라 계절과 날씨, 새끼를 기르는 상태 등에 따라서도 달라진다.",
        parameter: { label: "출현량", unit: "퍼센트", min: 0, max: 100, step: 5, decimals: 0, defaultValue: 60 } },
      { id: "exit_width", name: "좁은 출구",
        description: "많은 박쥐가 한 출구를 통과하면 비행 흐름이 좁은 공간에 모인다. 출구를 지나는 흐름과 개체들이 멈춰 차례를 기다리는 행동은 서로 다르다.",
        parameter: { label: "출구 폭", unit: "미터", min: 3, max: 12, step: 0.5, decimals: 1, defaultValue: 7 } },
      { id: "stream_spread", name: "바깥의 흐름",
        description: "동굴에서 나온 박쥐 무리는 길게 굽이치는 띠를 이루기도 한다. 언제나 빽빽한 대열을 유지하는 것은 아니며, 밖으로 퍼지는 모습도 나타난다.",
        parameter: { label: "퍼지는 정도", unit: "퍼센트", min: 0, max: 100, step: 5, decimals: 0, defaultValue: 30 } },
    ],
  }],
};
