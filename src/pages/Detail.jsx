import React from "react";
import { getAnimalDetails } from "../behaviors/animalDetails";
import "../styles/Detail.css";

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
  const [tocTop, setTocTop] = React.useState(32);
  const animal = getAnimalDetails(animalId);
  const artwork = getHeaderArtwork(animalId);
  const headerRef = React.useRef(null);
  const sectionRefs = React.useRef(new Map());
  const bibliography = React.useMemo(() => {
    if (Array.isArray(animal?.bibliography) && animal.bibliography.length > 0) {
      return animal.bibliography;
    }

    if (!animal?.rules?.length) {
      return [];
    }

    return Array.from(
      new Set(
        animal.rules.flatMap((ruleGroup) =>
          Array.isArray(ruleGroup.references) ? ruleGroup.references : [],
        ),
      ),
    ).map((reference) => ({ id: reference, citation: reference }));
  }, [animal]);
  const bibliographyIndexMap = React.useMemo(
    () =>
      new Map(
        bibliography.map((reference, index) => [reference.id, index + 1]),
      ),
    [bibliography],
  );
  const tocItems = React.useMemo(() => {
    const items = Array.isArray(animal?.rules)
      ? animal.rules.map((ruleGroup) => ({
          key: ruleGroup.id,
          label: ruleGroup.category,
        }))
      : [];

    if (bibliography.length > 0) {
      items.push({ key: "bibliography", label: "참고문헌" });
    }

    return items;
  }, [animal, bibliography.length]);

  const setSectionRef = React.useCallback((key, node) => {
    if (!key) {
      return;
    }

    if (node) {
      sectionRefs.current.set(key, node);
      return;
    }

    sectionRefs.current.delete(key);
  }, []);

  const handleTocClick = React.useCallback((key) => {
    const target = sectionRefs.current.get(key);

    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  React.useEffect(() => {
    const timerId = window.setTimeout(() => {
      onEnterComplete?.();
    }, enterDuration);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [enterDuration, onEnterComplete]);

  React.useEffect(() => {
    const headerNode = headerRef.current;

    if (!headerNode) {
      return undefined;
    }

    const updateTocTop = () => {
      setTocTop(headerNode.offsetHeight + 16);
    };

    updateTocTop();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateTocTop);

      return () => {
        window.removeEventListener("resize", updateTocTop);
      };
    }

    const resizeObserver = new ResizeObserver(() => {
      updateTocTop();
    });

    resizeObserver.observe(headerNode);
    window.addEventListener("resize", updateTocTop);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateTocTop);
    };
  }, []);

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
      style={{ "--detail-toc-top": `${tocTop}px` }}
    >
      {/* 헤더 */}
      <div ref={headerRef} className="detail-header">
        {/* <button className="detail-back-btn theme-button" onClick={handleBack}>
          ← 뒤로가기
        </button> */}
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

      {tocItems.length ? (
        <nav className="detail-toc" aria-label="상세 목차">
          <ol className="detail-toc__list">
            {tocItems.map((item) => (
              <li key={item.key} className="detail-toc__item">
                <button
                  type="button"
                  className="detail-toc__button"
                  onClick={() => handleTocClick(item.key)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      {/* 규칙 섹션 */}
      <div className="rules-scroll-layer">
        <div className="rules-container">
          {animal.rules && animal.rules.length > 0 ? (
            animal.rules.map((ruleGroup) => (
              <div
                key={ruleGroup.id}
                className="rule-section"
                ref={(node) => setSectionRef(ruleGroup.id, node)}
              >
                <div className="rule-header">
                  <h2 className="rule-category">{ruleGroup.category}</h2>
                  <p className="rule-title">{ruleGroup.title}</p>
                  {ruleGroup.summary ? (
                    <p className="rule-summary">{ruleGroup.summary}</p>
                  ) : null}
                </div>

                <div className="behaviors-list">
                  <div className="behaviors-group">
                    {/* 추후 캔버스 추가 예정 */}
                    <div className="canvas-placeholder">
                      [캔버스 영역 - {ruleGroup.category}]
                    </div>
                    {ruleGroup.behaviors.map((behavior, idx) => (
                      <div key={idx} className="behavior-item">
                        <h3 className="behavior-name">{behavior.name}</h3>
                        <p className="behavior-description">
                          {behavior.description}
                          {Array.isArray(behavior.citationIds)
                            ? behavior.citationIds.map((citationId) => {
                                const footnoteNumber =
                                  bibliographyIndexMap.get(citationId);

                                if (!footnoteNumber) {
                                  return null;
                                }

                                return (
                                  <sup
                                    key={citationId}
                                    className="behavior-footnote"
                                  >
                                    [{footnoteNumber}]
                                  </sup>
                                );
                              })
                            : null}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="no-rules">아직 규칙이 등록되지 않았습니다.</p>
          )}

          {bibliography.length ? (
            <section
              className="detail-bibliography"
              aria-labelledby="detail-bibliography-title"
              ref={(node) => setSectionRef("bibliography", node)}
            >
              <div className="detail-bibliography__header">
                <h2
                  id="detail-bibliography-title"
                  className="detail-bibliography__title"
                >
                  참고문헌
                </h2>
                <p className="detail-bibliography__subtitle">
                  본 페이지 하단의 참고문헌은 위 행동 설명에 사용된 주요 실증
                  연구를 모아 정리한 목록입니다.
                </p>
              </div>
              <ol className="detail-bibliography__list">
                {bibliography.map((reference) => (
                  <li key={reference.id} className="detail-bibliography__item">
                    {reference.citation}
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
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
