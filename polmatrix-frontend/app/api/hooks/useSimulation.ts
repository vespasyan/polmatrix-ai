import { useState } from "react";
import { simulatePolicy } from "../../api/ai/simulate";

interface SelectedMetrics {
  economy: string[];
  education: string[];
  environment: string[];
  health: string[];
}

export function useSimulation() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function run(question: string, selectedMetrics?: SelectedMetrics) {
    setLoading(true);
    try {
      const simData = await simulatePolicy(question, selectedMetrics);
      console.log("SIMULATOR DATA:", simData);
      setData(simData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return { data, loading, run };
}
// This hook manages the state for running a simulation based on a question.
// It provides a `run` function to trigger the simulation and updates the state with the results.