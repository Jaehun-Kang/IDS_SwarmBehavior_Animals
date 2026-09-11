import React from "react";
import StarlingFlightPreview from "./StarlingFlightPreview";
import { turnEngine } from "./starlingTurnModel.js";

export default function StarlingTurnPreview(props) {
  return <StarlingFlightPreview {...props} engine={turnEngine} />;
}
