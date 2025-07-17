// backend/services/domainModels/policyEffects.js

const policyEffects = {
green_investment: {
  co2_emissions: -0.5,
  gdp: 0.2
},
education_funding: {
  education_index: 0.05,
  gdp: 0.1
},
healthcare_spending: {
  health_index: 0.06,
  gdp: 0.05
},
  stimulus_check: {
    gdp: 0.15,
    spending: 0.1
  }
};

function getPolicyEffect(leverName, metric) {
  return policyEffects?.[leverName]?.[metric] || 0;
}

module.exports = { getPolicyEffect };
// This module defines the effects of various policy levers on different metrics.
// It exports a function to retrieve the effect of a specific lever on a given metric.