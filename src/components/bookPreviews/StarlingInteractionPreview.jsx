import React from "react";
import StarlingFlightPreview from "./StarlingFlightPreview.jsx";
import { interactionEngine } from "./starlingInteractionModel.js";

export default function StarlingInteractionPreview(props) {
  return <StarlingFlightPreview {...props} engine={interactionEngine} />;
}
