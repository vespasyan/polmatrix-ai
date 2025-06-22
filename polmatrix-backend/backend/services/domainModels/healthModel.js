// backend/src/services/domainModels/healthModel.js

const baseline2024 = { urban: 20, rural: 18 }    // %
const trend =      { urban: 0.6, rural: 0.8 }    // ppt/year
const policyBoost = {
  healthcare_subsidy: { urban: -0.5, rural: -0.7 },
  income_tax_hike:    { urban: -0.3, rural: -0.4 }
}

function getBaseline(region) { return baseline2024[region] }
function getTrend(region) { return trend[region] }
function applyPolicyEffect(region, lever, pct) {
  const effect = policyBoost[lever]
  return effect ? effect[region] : 0
}

module.exports = { getBaseline, getTrend, applyPolicyEffect }
