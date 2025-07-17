// backend/services/simulator.js
const axios = require("axios");
const db = require("../db");
const eduModel = require('./domainModels/educationModel');
const envModel = require('./domainModels/environmentModel');
const ecoModel = require('./domainModels/economyModel');
const hlthModel = require('./domainModels/healthModel');
const domainModels = require('./domainModels/policyEffects');

const FORECAST_API = "http://localhost:8000/forecast";

async function runSimulation({ region = "US", metrics, startYear, endYear, levers = [] }) {
  // 1️⃣ Pull real data from DB for years before the start
  const result = await db.query(
    `SELECT year, metric_code, value
     FROM facts
     WHERE region_id = $1 AND year < $2 AND metric_code = ANY($3)
     ORDER BY year`,
    [region, startYear, metrics]
  );

  const history = result.rows.map(row => ({
    year: row.year,
    region,
    source: "real",
    [row.metric_code]: Number(row.value)
  }));

  // 2️⃣ Generate baseline forecast from Python service
  const context = getContextFromHistory(history, metrics);

  const future = [];

  for (const metric of metrics) {
    try {
      const response = await axios.post(FORECAST_API, {
        metric,
        region,
        startYear,
        endYear,
        context
      });

      const forecasted = response.data.map(row => ({
        year: row.year,
        region: row.region,
        source: "simulated",
        [metric]: applyPolicyEffect(row[metric], metric, levers, row.year - startYear)
      }));

      // Merge forecasted metric into unified future[]
      forecasted.forEach(pt => {
        const yearRow = future.find(r => r.year === pt.year) || { year: pt.year, region: pt.region, source: "simulated" };
        Object.assign(yearRow, pt);
        if (!future.includes(yearRow)) future.push(yearRow);
      });
    } catch (err) {
      console.error(`Forecast failed for ${metric}:`, err.message);
    }
  }

  // 3️⃣ Merge history + future data
  const merged = [...history, ...future].sort((a, b) => a.year - b.year);
  return merged;
}

function applyPolicyEffect(value, metric, levers, yearOffset) {
  const decay = 1 / (1 + 0.2 * yearOffset);
  let delta = 0;

  for (const lever of levers) {
    const coeff = domainModels.getPolicyEffect(lever.name, metric);
    if (coeff) {
      delta += coeff * lever.magnitude * decay;
    }
  }

  return value + delta;
}

function getContextFromHistory(history, metrics) {
  const latestYear = Math.max(...history.map(h => h.year));
  const latest = history.find(r => r.year === latestYear);

  return metrics.reduce((acc, metricKey) => {
    const key = typeof metricKey === "string" ? metricKey : metricKey.metricKey;
    if (latest?.[key] !== undefined) acc[key] = latest[key];
    return acc;
  }, {});
}

module.exports = { runSimulation };
// backend/src/services/simulator.js