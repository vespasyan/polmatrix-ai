// backend/src/services/domainModels/economyModel.js

const baseline2024 = { urban: 2.2, rural: 1.6 }         // % GDP growth
const trend =      { urban: 0.1, rural: 0.05 }
const techBaseline = { urban: 5.0, rural: 1.5 }         // % workforce
const techTrend =    { urban: 0.4, rural: 0.2 }
const policyBoost = {
  green_growth:      { urban: 0.1, rural: 0.05 },
  income_tax_hike:   { urban: -0.2, rural: -0.1 },
  spending_cuts:     { urban: -0.3, rural: -0.2 },
  tech_job_boost:    { urban: 0.2, rural: 0.1 },
  healthy_growth:    { urban: 0.1, rural: 0.1 }
}

function getBaseline(region, metric) {
  if (metric === 'gdp_growth') return baseline2024[region]
  if (metric === 'tech_jobs') return techBaseline[region]
}

function getTrend(region, metric) {
  if (metric === 'gdp_growth') return trend[region]
  if (metric === 'tech_jobs') return techTrend[region]
}

function applyPolicyEffect(region, lever, pct, metric) {
  // Some levers only apply to one metric:
  if (lever === 'income_tax_hike' && metric === 'gdp_growth') {
    return policyBoost[lever][region]
  }
  if (lever === 'spending_cuts' && metric === 'gdp_growth') {
    return policyBoost[lever][region]
  }
  if (lever === 'tech_job_boost' && metric === 'tech_jobs') {
    return policyBoost[lever][region]
  }
  if (lever === 'green_growth' && metric === 'gdp_growth') {
    return policyBoost[lever][region]
  }
  // others no effect:
  return 0
}

module.exports = { getBaseline, getTrend, applyPolicyEffect }
