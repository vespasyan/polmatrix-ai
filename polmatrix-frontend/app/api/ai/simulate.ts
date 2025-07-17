//import api from './axiosInstance'  // or however you have axios configured
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";
export async function simulatePolicy(question: string) {
  try {
    const resp = await fetch(`${BACKEND}/api/ai/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: question })
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