import StarlingInteractionPreview from "./bookPreviews/StarlingInteractionPreview";
import StarlingFlightPreview from "./bookPreviews/StarlingFlightPreview";
import StarlingTurnPreview from "./bookPreviews/StarlingTurnPreview";
import StarlingShapePreview from "./bookPreviews/StarlingShapePreview";
import SardineSwimmingPreview from "./bookPreviews/SardineSwimmingPreview";
import LocustGroundPreview from "./bookPreviews/LocustGroundPreview";
import LocustFlightPreview from "./bookPreviews/LocustFlightPreview";
import AntExplorationPreview from "./bookPreviews/AntExplorationPreview";
import BatFlightPreview from "./bookPreviews/BatFlightPreview";
import SheepMovementPreview from "./bookPreviews/SheepMovementPreview";
import PenguinColdPreview from "./bookPreviews/PenguinColdPreview";
import BeeDailyPreview from "./bookPreviews/BeeDailyPreview";
import BeeDancePreview from "./bookPreviews/BeeDancePreview";
import { resolveRuleControls } from "../utils/bookControls.js";

import BeeFanningPreview from "./bookPreviews/BeeFanningPreview";
import BeeDefensePreview from "./bookPreviews/BeeDefensePreview";
import FireflyIndividualPreview from "./bookPreviews/FireflyIndividualPreview";
import FireflyCouplingPreview from "./bookPreviews/FireflyCouplingPreview";
import FireflyCourtshipPreview from "./bookPreviews/FireflyCourtshipPreview";
import FireflyEnvironmentPreview from "./bookPreviews/FireflyEnvironmentPreview";
import LobsterWalkingPreview from "./bookPreviews/LobsterWalkingPreview";
import LobsterShelterPreview from "./bookPreviews/LobsterShelterPreview";
import LobsterQueuePreview from "./bookPreviews/LobsterQueuePreview";
import LobsterChemicalPreview from "./bookPreviews/LobsterChemicalPreview";
import LobsterDefensePreview from "./bookPreviews/LobsterDefensePreview";
import LobsterDiseasePreview from "./bookPreviews/LobsterDiseasePreview";
import KrillFeedingPreview from "./bookPreviews/KrillFeedingPreview";
import KrillLightPreview from "./bookPreviews/KrillLightPreview";
import KrillRestPreview from "./bookPreviews/KrillRestPreview";
import KrillThreatPreview from "./bookPreviews/KrillThreatPreview";

const PREVIEW_COMPONENTS = {
  firefly_individual: FireflyIndividualPreview,
  firefly_coupling: FireflyCouplingPreview,
  firefly_courtship: FireflyCourtshipPreview,
  firefly_environment: FireflyEnvironmentPreview,
  lobster_walking: LobsterWalkingPreview,
  lobster_shelter: LobsterShelterPreview,
  lobster_queue: LobsterQueuePreview,
  lobster_chemical: LobsterChemicalPreview,
  lobster_defense: LobsterDefensePreview,
  lobster_disease: LobsterDiseasePreview,
  krill_feeding: KrillFeedingPreview,
  krill_social: KrillFeedingPreview,
  krill_light: KrillLightPreview,
  krill_rest: KrillRestPreview,
  krill_threat: KrillThreatPreview,
  bee_defense: BeeDefensePreview,
  bee_fanning: BeeFanningPreview,
  bee_daily: BeeDailyPreview,
  bee_dance: BeeDancePreview,
  penguin_cold: PenguinColdPreview,
  penguin_huddle: PenguinColdPreview,
  penguin_wave: PenguinColdPreview,
  penguin_cooling: PenguinColdPreview,
  sheep_movement: SheepMovementPreview,
  sheep_neighbors: SheepMovementPreview,
  sheep_leaders: SheepMovementPreview,
  sheep_threat: SheepMovementPreview,
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
