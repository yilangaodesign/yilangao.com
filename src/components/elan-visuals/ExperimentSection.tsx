"use client";

import GraphCanvas from "./GraphCanvas";
import EvalComparisonGrid from "./EvalComparisonGrid";

export default function ExperimentSection() {
  return (
    <div>
      <GraphCanvas />
      <EvalComparisonGrid />
    </div>
  );
}
