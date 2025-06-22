// backend/src/services/domainModels/environmentModel.js

const baseline2024 = { urban: 2500, rural: 800 }    // million tons
const trend =      { urban: -1.5, rural: -0.8 }     // %/year
const policyBoost = {
  tax_credit: { urban: -1.0, rural: -0.6 }
}

function getBaseline(region) { return baseline2024[region] }
function getTrend(region) { return trend[region] }
function applyPolicyEffect(region, lever, pct) {
  const effect = policyBoost[lever]
  return effect ? effect[region] : 0
}

module.exports = { getBaseline, getTrend, applyPolicyEffect }
