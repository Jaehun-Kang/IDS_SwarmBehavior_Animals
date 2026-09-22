// Upright original residents can be walking; new arrivals must not chain docking.
export const isPenguinEntryAnchor = (agent, coolingExitMode) =>
  !agent.countTransition &&
  !agent.countTransitionSource &&
  agent.mode !== coolingExitMode;
