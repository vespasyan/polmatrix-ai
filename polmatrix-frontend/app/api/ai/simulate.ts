//import api from './axiosInstance'  // or however you have axios configured
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

interface SimulationRequest {
  text: string;
  selectedMetrics?: {
    economy: string[];
    education: string[];
    environment: string[];
    health: string[];
  };
}

export async function simulatePolicy(question: string, selectedMetrics?: SimulationRequest['selectedMetrics']) {
  try {
    const requestBody: SimulationRequest = {
      text: question
    };
    
    // Include selected metrics if provided
    if (selectedMetrics) {
      requestBody.selectedMetrics = selectedMetrics;
    }

    const resp = await fetch(`${BACKEND}/api/ai/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    if (!resp.ok) {
      throw new Error(`HTTP error! status: ${resp.status}`);
    }

    const simData = await resp.json();  // Direct array now, not { data: [...] }
    console.log("SIMULATOR DATA:", simData);
    return simData;
  } catch (error) {
    console.error("Error simulating policy:", error);
    throw error;
  }
}