import {createSwimmingModel,advanceSwimmingModel,swimmingPose} from "./sardineSwimmingModel.js";
export const createKrillSocial=createSwimmingModel;
export const krillSocialPose=swimmingPose;
export function krillSocialControls(c){
  return {swim_speed:0.9,turn_rate:180,neighbor_radius:c.neighbor_range??1.6,
    spacing_strength:c.spacing_response??55,alignment_strength:45,cohesion_strength:c.group_attraction??50};
}
// Reuse the tested local-interaction engine; coefficients are not krill measurements.
export function advanceKrillSocial(m,c,elapsed){advanceSwimmingModel(m,krillSocialControls(c),elapsed);}
