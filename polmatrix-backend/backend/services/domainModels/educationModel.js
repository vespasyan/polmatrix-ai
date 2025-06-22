// backend/src/services/domainModels/educationModel.js

const baseline2024 = { urban: 28, rural: 15 }      // percent
const trend =      { urban: 0.5, rural: 0.3 }      // ppt/year
const policyBoost = {
  funding_increase: { urban: 0.7, rural: 0.5 },
  education_cuts:    { urban: -0.2, rural: -0.1 }
}

function getBaseline(region) {
  return baseline2024[region]
}

function getTrend(region) {
  return trend[region]
}

function applyPolicyEffect(region, lever, pct) {
  const effect = policyBoost[lever]
  return effect ? effect[region] : 0
}

module.exports = { getBaseline, getTrend, applyPolicyEffect }
