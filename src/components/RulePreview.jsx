import { useEffect, useState } from 'react';
import { resolveRuleControls } from '../utils/bookControls.js';
import { getLoadedBookPreviews, loadBookPreviews } from './bookPreviews/loadBookPreviews.js';

function AnimalRulePreview({ animalId, ruleGroup, previewControls }) {
  const [previews, setPreviews] = useState(() => getLoadedBookPreviews(animalId));
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    loadBookPreviews(animalId).then(module => {
      if (active) setPreviews(module);
    }).catch(() => {
      if (active) setFailed(true);
    });
    return () => { active = false; };
  }, [animalId, attempt]);

  if (!previews) {
    return <div className="canvas-placeholder rule-preview"
      data-book-preview-loading={failed ? undefined : 'true'} aria-busy={!failed}>
      {failed ? <span role="alert">미니 시뮬레이션을 불러오지 못했습니다. <button type="button"
        onClick={() => { setFailed(false); setAttempt(value => value + 1); }}>다시 시도</button></span> : null}
    </div>;
  }
  const Preview = previews[ruleGroup?.previewId];
  if (!Preview) {
    return <div className="canvas-placeholder rule-preview rule-preview--pending">
      <span className="rule-preview__pending-text">[캔버스 영역 - {ruleGroup?.category}]</span>
    </div>;
  }
  return <Preview key={ruleGroup.id} ruleGroup={ruleGroup}
    controls={resolveRuleControls(ruleGroup, previewControls)} />;
}

export default function RulePreview(props) {
  return <AnimalRulePreview key={props.animalId} {...props} />;
}
