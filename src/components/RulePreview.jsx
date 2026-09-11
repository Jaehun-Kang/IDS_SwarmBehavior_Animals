import StarlingInteractionPreview from "./bookPreviews/StarlingInteractionPreview";
import StarlingFlightPreview from "./bookPreviews/StarlingFlightPreview";
import StarlingTurnPreview from "./bookPreviews/StarlingTurnPreview";
import StarlingShapePreview from "./bookPreviews/StarlingShapePreview";
import SardineSwimmingPreview from "./bookPreviews/SardineSwimmingPreview";
import LocustGroundPreview from "./bookPreviews/LocustGroundPreview";
import LocustFlightPreview from "./bookPreviews/LocustFlightPreview";
import AntExplorationPreview from "./bookPreviews/AntExplorationPreview";
import BatFlightPreview from "./bookPreviews/BatFlightPreview";
import { resolveRuleControls } from "../utils/bookControls.js";

const PREVIEW_COMPONENTS = {
  starling_flight: StarlingFlightPreview,
  starling_interactions: StarlingInteractionPreview,
  starling_turns: StarlingTurnPreview,
  starling_shape: StarlingShapePreview,
  sardine_swimming: SardineSwimmingPreview,
  locust_ground: LocustGroundPreview,
  locust_flight: LocustFlightPreview,
  ant_exploration: AntExplorationPreview,
  ant_traffic: AntExplorationPreview,
  ant_mill: AntExplorationPreview,
  bat_flight: BatFlightPreview,
  bat_emergence: BatFlightPreview,
  bat_neighbors: BatFlightPreview,
  bat_return: BatFlightPreview,
};

export default function RulePreview({ animalId, ruleGroup, previewControls }) {
  const Preview = PREVIEW_COMPONENTS[ruleGroup?.previewId];
  if (!Preview) {
    return (
      <div className="canvas-placeholder rule-preview rule-preview--pending">
        <span className="rule-preview__pending-text">
          [캔버스 영역 - {ruleGroup?.category}]
        </span>
      </div>
    );
  }
  return <Preview key={`${animalId}:${ruleGroup.id}`}
    ruleGroup={ruleGroup}
    controls={resolveRuleControls(ruleGroup, previewControls)} />;
}
