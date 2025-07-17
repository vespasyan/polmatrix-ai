// backend/services/parser.js

function parsePolicyQuestion(text) {
  const now = new Date().getFullYear();

  const result = {
    regions: ["US"],
    time: {
      startYear: now,
      endYear: now + 11,
      periods: 12,
      unit: "year"
    },
    metrics: [
      { domain: "economy", metricKey: "gdp" },
      { domain: "education", metricKey: "education_index" },
      { domain: "environment", metricKey: "co2_emissions" },
      { domain: "health", metricKey: "health_index" }
    ],
    policies: []
  };

  // Add default levers
  result.policies.push(
    { domain: "environment", lever: "green_investment", pct: 1 },
    { domain: "education", lever: "education_funding", pct: 1 },
    { domain: "health", lever: "healthcare_spending", pct: 1 }
  );

  // Time horizon: match phrases like “through 2035” or “until 2040”
  const yearMatch = text.match(/(?:through|until)\s+(20\d{2})/i);
  if (yearMatch) {
    const endYear = parseInt(yearMatch[1], 10);
    result.time.endYear = endYear;
    result.time.periods = endYear - result.time.startYear + 1;
  }

  // Optional: still check for “next X years”
  const match = text.match(/next\s+(\d+)\s+years/i);
  if (match) {
    result.time.periods = parseInt(match[1], 10);
    result.time.endYear = result.time.startYear + result.time.periods - 1;
  }

  return result;
}

module.exports = { parsePolicyQuestion };
// backend/src/services/parser.js