import React from "react";
import { getAnimalDetails } from "../behaviors/animalDetails";
import "../styles/Detail.scss";

const headerArtworkModules = import.meta.glob("../assets/detail/*.svg", {
  eager: true,
  import: "default",
});

const HEADER_ARTWORK_ASSET_KEYS = {
  spiny_lobster: {
    assetKey: "spinylobster",
  },
};

const getHeaderArtwork = (animalId) => {
  const assetKey = HEADER_ARTWORK_ASSET_KEYS[animalId]?.assetKey || animalId;
  const src = headerArtworkModules[`../assets/detail/${assetKey}.svg`];

  if (!src) {
    return null;
  }

  return { src };
};

function Detail({
  animalId,
  enterDuration = 400,
  onBackClick,
  onEnterComplete,
}) {
  const [isAnimating, setIsAnimating] = React.useState(true);
  const animal = getAnimalDetails(animalId);
  const artwork = getHeaderArtwork(animalId);

  React.useEffect(() => {
    const timerId = window.setTimeout(() => {
      onEnterComplete?.();
    }, enterDuration);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [enterDuration, onEnterComplete]);

  if (!animal) {
    return <div>동물 정보를 찾을 수 없습니다.</div>;
  }

  const handleBack = () => {
    setIsAnimating(false);
    window.setTimeout(() => {
      onBackClick();
    }, enterDuration);
  };

  return (
    <div
      className={`detail-container ${isAnimating ? "slide-up" : "slide-down"}`}
    >
      {/* 헤더 */}
      <div className="detail-header">
        <button className="detail-back-btn theme-button" onClick={handleBack}>
          ← 뒤로가기
        </button>
        <div className="detail-header-content">
          <div className="detail-title">
            <h1 className="theme-page-title">{animal.korean}</h1>
            <p className="detail-english">{animal.english}</p>
            <p className="detail-scientific">{animal.scientific}</p>
          </div>
          {artwork ? (
            <div className="detail-header-artwork" aria-hidden="true">
              <img
                className="detail-header-artwork__image"
                src={artwork.src}
                alt=""
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* 규칙 섹션 */}
      <div className="rules-scroll-layer">
        <div className="rules-container">
          {animal.rules && animal.rules.length > 0 ? (
            animal.rules.map((ruleGroup) => (
              <div key={ruleGroup.id} className="rule-section">
                <div className="rule-header">
                  <h2 className="rule-category">{ruleGroup.category}</h2>
                  <p className="rule-title">{ruleGroup.title}</p>
                </div>

                <div className="behaviors-list">
                  {ruleGroup.behaviors.map((behavior, idx) => (
                    <div key={idx} className="behavior-item">
                      <h3 className="behavior-name">{behavior.name}</h3>
                      <p className="behavior-description">
                        {behavior.description}
                      </p>
                      {/* 추후 캔버스 추가 예정 */}
                      <div className="canvas-placeholder">
                        [캔버스 영역 - {behavior.name}]
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="no-rules">아직 규칙이 등록되지 않았습니다.</p>
          )}
        </div>
      </div>

      {/* 푸터 */}
      <div className="detail-footer">
        <button
          className="detail-back-btn-bottom theme-button"
          onClick={handleBack}
        >
          ← 돌아가기
        </button>
      </div>
    </div>
  );
}

export default Detail;
