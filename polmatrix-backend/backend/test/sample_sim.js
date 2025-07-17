const { runSimulation } = require("../services/simulator");

(async () => {
  const result = await runSimulation({
    region: "US",
    metrics: ["gdp", "education_index", "co2_emissions", "health_index"],
    startYear: 2024,
    endYear: 2035,
    levers: [
      { name: "green_investment", magnitude: 1 },
      { name: "education_funding", magnitude: 1 },
      { name: "healthcare_spending", magnitude: 1 }
    ]
  });

  console.log(JSON.stringify(result, null, 2));
})();
