// backend/src/services/parser.js

/**
 * parsePolicyQuestion(text)
 * Returns an object:
 * {
 *   time: { startYear: 2025, periods: 7, unit: 'year' },
 *   regions: ['urban','rural'],
 *   metrics: [ { domain, metricKey }… ],
 *   policies: [ { domain, lever, pct }… ]
 * }
 */
function parsePolicyQuestion(text) {
  const result = {
    time: { startYear: new Date().getFullYear() + 1, periods: 7, unit: 'year' },
    regions: ['urban', 'rural'],  // hardcoded for now
    metrics: [
      { domain: 'education', metricKey: 'education_rate' },
      { domain: 'environment', metricKey: 'co2_emissions' },
      { domain: 'economy', metricKey: 'gdp_growth' },
      { domain: 'economy', metricKey: 'tech_jobs' },
      { domain: 'health', metricKey: 'mental_health_rate' }
    ],
    policies: []
  }

  // STEM funding
  if (/15\s*%.*STEM/.test(text)) {
    result.policies.push({
      domain: 'education',
      lever: 'funding_increase',
      pct: 0.15
    })
    result.policies.push({
      domain: 'economy',
      lever: 'tech_job_boost',
      pct: 0.15
    })
  }

  // Renewable tax credit
  if (/10\s*%.*renewable/.test(text)) {
    result.policies.push({
      domain: 'environment',
      lever: 'tax_credit',
      pct: 0.10
    })
    result.policies.push({
      domain: 'economy',
      lever: 'green_growth',
      pct: 0.10
    })
  }

  // Income tax hike
  if (/5\s*%.*tax/.test(text) && /high earners/.test(text)) {
    result.policies.push({
      domain: 'economy',
      lever: 'income_tax_hike',
      pct: 0.05
    })
    result.policies.push({
      domain: 'health',
      lever: 'healthcare_subsidy',
      pct: 0.05
    })
  }

  // Spending cuts
  if (/10\s*%.*cuts/.test(text)) {
    result.policies.push({
      domain: 'economy',
      lever: 'spending_cuts',
      pct: 0.10
    })
    result.policies.push({
      domain: 'education',
      lever: 'education_cuts',
      pct: 0.10
    })
  }

  // Healthcare subsidies
  if (/10\s*%.*healthcare/.test(text)) {
    result.policies.push({
      domain: 'health',
      lever: 'healthcare_subsidies',
      pct: 0.10
    })
    result.policies.push({
      domain: 'economy',
      lever: 'healthy_growth',
      pct: 0.10
    })
  }

  // Time horizon: look for “next X years”
  const match = text.match(/next\s+(\d+)\s+years/i)
  if (match) {
    result.time.periods = parseInt(match[1], 10)
  }

  return result
}

module.exports = { parsePolicyQuestion }
// This function parses a policy question text and extracts structured data
// about time periods, regions, metrics, and policies.