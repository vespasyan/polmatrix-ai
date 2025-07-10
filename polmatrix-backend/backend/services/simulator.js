// backend/src/services/simulator.js
const axios = require("axios");
const db = require("../db");
const eduModel = require('./domainModels/educationModel')
const envModel = require('./domainModels/environmentModel')
const ecoModel = require('./domainModels/economyModel')
const hlthModel = require('./domainModels/healthModel')

const FORECAST_API = "http://localhost:8000/forecast";

async function runSimulation({ region = "US", metrics, startYear, endYear, levers = [] }) {
  // 1️⃣ Pull real data from facts table
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
    [row.metric_code]: Number(row.value)
  }));

  // 2️⃣ Estimate future baseline via Python service
  const context = getContextFromHistory(history, metrics); // pulls latest feature values

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
        [metric]: applyPolicyEffect(row[metric], metric, levers, row.year - startYear)
      }));

      // Merge forecasted metric into `future[]` by year
      forecasted.forEach(pt => {
        const yearRow = future.find(r => r.year === pt.year) || { year: pt.year, region };
        Object.assign(yearRow, pt);
        if (!future.includes(yearRow)) future.push(yearRow);
      });
    } catch (err) {
      console.error(`Forecast failed for ${metric}:`, err.message);
    }
  }

  // 3️⃣ Merge history + future
  const merged = [...history, ...future].sort((a, b) => a.year - b.year);
  return merged;
}

function applyPolicyEffect(value, metric, levers, yearOffset) {
  const decay = 1 / (1 + 0.2 * yearOffset); // simple decay curve
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
  const latest = history.filter(r => r.year === Math.max(...history.map(h => h.year)))[0];
  return metrics.reduce((acc, m) => {
    if (latest[m] !== undefined) acc[m] = latest[m];
    return acc;
  }, {});
}

module.exports = { runSimulation };