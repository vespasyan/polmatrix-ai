// backend/services/domainModels/policyEffects.js

// backend/services/domainModels/policyEffects.js

const policyEffects = {
  green_investment: {
    co2_emissions: -0.5,
    gdp_growth_rate: 0.2,
    renewable_energy_percentage: 0.8,
    unemployment_rate: -0.1
  },
  education_funding: {
    literacy_rate: 0.05,
    school_enrollment_rate: 0.03,
    education_expenditure_per_capita: 0.15,
    gdp_growth_rate: 0.1,
    unemployment_rate: -0.05
  },
  healthcare_spending: {
    life_expectancy: 0.06,
    healthcare_expenditure_per_capita: 0.2,
    maternal_mortality_rate: -0.1,
    gdp_growth_rate: 0.05
  },
  tax_policy: {
    gdp_growth_rate: -0.1,
    unemployment_rate: 0.05,
    inflation_rate: -0.02
  },
  spending_policy: {
    gdp_growth_rate: 0.15,
    unemployment_rate: -0.08,
    investment_rate: 0.1
  }
};

function getPolicyEffect(leverName, metric) {
  return policyEffects?.[leverName]?.[metric] || 0;
}

module.exports = { getPolicyEffect };
// This module defines the effects of various policy levers on different metrics.
// It exports a function to retrieve the effect of a specific lever on a given metric.