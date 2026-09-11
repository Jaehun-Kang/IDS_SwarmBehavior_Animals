import { STARLING_DETAILS } from "./details/starling.js";
import { SARDINE_DETAILS } from "./details/sardine.js";
import { GRASSHOPPER_DETAILS } from "./details/grasshopper.js";
import { ANT_DETAILS } from "./details/ant.js";
import { BAT_DETAILS } from "./details/bat.js";
import { SHEEP_DETAILS } from "./details/sheep.js";
import { PENGUIN_DETAILS } from "./details/penguin.js";
import { BEE_DETAILS } from "./details/bee.js";
import { FIREFLY_DETAILS } from "./details/firefly.js";
import { SPINY_LOBSTER_DETAILS } from "./details/spinyLobster.js";
import { KRILL_DETAILS } from "./details/krill.js";

// 각 동물별 상세 정보 (이름, 학명, 설명 등)
export const ANIMAL_DETAILS = {
  starling: STARLING_DETAILS,
  sardine: SARDINE_DETAILS,
  grasshopper: GRASSHOPPER_DETAILS,
  ant: ANT_DETAILS,
  bat: BAT_DETAILS,
  sheep: SHEEP_DETAILS,
  penguin: PENGUIN_DETAILS,
  bee: BEE_DETAILS,
  firefly: FIREFLY_DETAILS,
  spiny_lobster: SPINY_LOBSTER_DETAILS,
  krill: KRILL_DETAILS,
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
