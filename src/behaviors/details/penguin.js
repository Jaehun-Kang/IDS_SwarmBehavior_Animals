export const PENGUIN_DETAILS = {
  korean: "황제펭귄", english: "Emperor Penguin", scientific: "Aptenodytes forsteri",
  rules: [{
    id: "cold_and_warmth", previewId: "penguin_cold", category: "추위와 체온",
    behaviors: [
      { id: "air_temperature", name: "차가운 공기",
        description: "황제펭귄은 추운 환경에서 몸을 모아 열 손실을 줄인다. 모이는 정도는 기온뿐 아니라 바람과 햇빛 등 주변 조건의 영향을 함께 받는다.",
        parameter: { label: "기온", unit: "°C", min: -40, max: -5, step: 1, decimals: 0, defaultValue: -20 } },
      { id: "wind_speed", name: "바람에 노출되기",
        description: "바람은 몸과 주변 공기 사이의 열 교환에 영향을 준다. 서로 밀착하면 바람에 직접 노출되는 면적이 줄어든다.",
        parameter: { label: "풍속", unit: "미터/초", min: 0, max: 20, step: 1, decimals: 0, defaultValue: 8 } },
      { id: "body_temperature", name: "깃털 안의 온기",
        description: "황제펭귄의 두꺼운 깃털은 몸속의 열이 빠져나가는 것을 줄인다. 차가운 깃털 표면과 몸속의 온도, 무리 안의 공기 온도는 서로 다르다." },
      { id: "response_variation", name: "서로 다른 반응",
        description: "황제펭귄은 모두 같은 순간에 모이지 않는다. 같은 날씨에도 몸을 밀착한 무리와 느슨하게 서 있는 개체들이 함께 나타난다.",
        parameter: { label: "개체별 반응 차이", unit: "퍼센트", min: 0, max: 100, step: 5, decimals: 0, defaultValue: 60 } },
    ],
  }],
};
