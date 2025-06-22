// backend/src/services/simulator.js
const eduModel = require('./domainModels/educationModel')
const envModel = require('./domainModels/environmentModel')
const ecoModel = require('./domainModels/economyModel')
const hlthModel = require('./domainModels/healthModel')

/**
 * generateSimulatorData(parsed)
 * @param parsed { time, regions, metrics, policies }
 * @returns Array of { label, region, <metricKey>: value, ... }
 */
function generateSimulatorData(parsed) {
  const { time, regions, metrics, policies } = parsed
  const { startYear, periods, unit } = time

  // build labels [e.g. "2025","2026",…]
  const labels = Array.from({ length: periods }, (_, i) =>
    (startYear + i).toString()
  )

  const rows = []

  regions.forEach((region) => {
    // Initialize “lastValues” per metric
    const last = {}
    metrics.forEach(({ domain, metricKey }) => {
      if (domain === 'education') {
        last[metricKey] = eduModel.getBaseline(region)
      }
      if (domain === 'environment') {
        last[metricKey] = envModel.getBaseline(region)
      }
      if (domain === 'economy') {
        last[metricKey] = ecoModel.getBaseline(region, metricKey)
      }
      if (domain === 'health') {
        last[metricKey] = hlthModel.getBaseline(region)
      }
    })

    labels.forEach((label) => {
      const row = { label, region }

      metrics.forEach(({ domain, metricKey }) => {
        // pick model
        let baseTrend = 0, policySum = 0
        if (domain === 'education') {
          baseTrend = eduModel.getTrend(region)
          policies.forEach((p) => {
            policySum += eduModel.applyPolicyEffect(region, p.lever, p.pct)
          })
        }
        if (domain === 'environment') {
          baseTrend = envModel.getTrend(region)
          policies.forEach((p) => {
            policySum += envModel.applyPolicyEffect(region, p.lever, p.pct)
          })
        }
        if (domain === 'economy') {
          baseTrend = ecoModel.getTrend(region, metricKey)
          policies.forEach((p) => {
            policySum += ecoModel.applyPolicyEffect(region, p.lever, p.pct, metricKey)
          })
        }
        if (domain === 'health') {
          baseTrend = hlthModel.getTrend(region)
          policies.forEach((p) => {
            policySum += hlthModel.applyPolicyEffect(region, p.lever, p.pct)
          })
        }

        // apply change + minor noise
        const noise = (Math.random() - 0.5) * 0.1 * Math.abs(baseTrend + policySum)
        let newVal = last[metricKey] + baseTrend + policySum + noise

        // clamp percentages 0-100 if needed
        if (metricKey.includes('rate') || metricKey === 'education_rate' || metricKey === 'mental_health_rate' || metricKey === 'gdp_growth') {
          newVal = Math.max(0, Math.min(100, newVal))
        }
        if (metricKey === 'co2_emissions') {
          newVal = Math.max(0, newVal)
        }
        // tech_jobs is a percent too
        if (metricKey === 'tech_jobs') {
          newVal = Math.max(0, Math.min(100, newVal))
        }

        row[metricKey] = parseFloat(newVal.toFixed(2))
        last[metricKey] = newVal
      })

      rows.push(row)
    })
  })

  return rows
}

module.exports = { generateSimulatorData }
// This module generates simulation data based on parsed input
// including time, regions, metrics, and policies.