// backend/services/parser.js

function parsePolicyQuestion(text) {
  const now = new Date().getFullYear();

  const result = {
    regions: ["US"],
    time: {
      startYear: now,
      endYear: now + 11,
      periods: 12,
      unit: "year"
    },
    metrics: [],
    policies: []
  };

  // Define available metrics by domain
  const availableMetrics = {
    economy: [
      "gdp_growth_rate", "unemployment_rate", "inflation_rate", 
      "trade_balance", "investment_rate", "gdp_per_capita"
    ],
    education: [
      "literacy_rate", "school_enrollment_rate", "education_expenditure_per_capita",
      "primary_completion_rate", "teacher_student_ratio"
    ],
    environment: [
      "co2_emissions", "renewable_energy_percentage", "forest_area_percentage",
      "air_pollution_index", "deforestation_rate", "pm25"
    ],
    health: [
      "life_expectancy", "maternal_mortality_rate", "healthcare_expenditure_per_capita",
      "physician_density", "infant_mortality_rate"
    ]
  };

  // Keywords to identify specific metrics from the question
  const metricKeywords = {
    // Economy metrics
    "gdp_growth_rate": ["gdp", "gross domestic product", "economic growth", "economic output", "gdp growth"],
    "unemployment_rate": ["unemployment", "jobless", "job rate", "employment rate"],
    "inflation_rate": ["inflation", "price increase", "cost of living"],
    "trade_balance": ["trade", "exports", "imports", "trade balance"],
    "investment_rate": ["investment", "fdi", "foreign direct investment"],
    "gdp_per_capita": ["gdp per capita", "income per person", "per capita income"],
    
    // Education metrics  
    "literacy_rate": ["literacy", "reading rate", "education access"],
    "school_enrollment_rate": ["school enrollment", "enrollment rate", "school attendance"],
    "education_expenditure_per_capita": ["education spending", "education funding", "education budget", "stem funding"],
    "primary_completion_rate": ["primary completion", "graduation rate", "completion rate"],
    "teacher_student_ratio": ["teacher ratio", "class size", "student teacher"],
    
    // Environment metrics
    "co2_emissions": ["co2", "carbon", "emissions", "greenhouse gas", "climate"],
    "renewable_energy_percentage": ["renewable energy", "clean energy", "green energy", "solar", "wind"],
    "forest_area_percentage": ["forest", "deforestation", "tree coverage"],
    "air_pollution_index": ["air quality", "pollution", "smog", "air pollution"],
    "pm25": ["pm2.5", "particulate matter", "air particles"],
    "deforestation_rate": ["deforestation", "forest loss", "tree cutting"],
    
    // Health metrics
    "life_expectancy": ["life expectancy", "lifespan", "longevity", "public health"],
    "maternal_mortality_rate": ["maternal mortality", "childbirth deaths", "pregnancy deaths"],
    "healthcare_expenditure_per_capita": ["healthcare spending", "health budget", "medical costs"],
    "physician_density": ["doctors", "physicians", "medical staff", "healthcare workers"],
    "infant_mortality_rate": ["infant mortality", "child mortality", "baby deaths"]
  };

  // Analyze the question text to identify mentioned metrics
  const lowerText = text.toLowerCase();
  const detectedMetrics = new Set();

  // Check for specific metric keywords
  for (const [metricKey, keywords] of Object.entries(metricKeywords)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        detectedMetrics.add(metricKey);
        break;
      }
    }
  }

  // If specific metrics were detected, use those
  if (detectedMetrics.size > 0) {
    for (const metricKey of detectedMetrics) {
      // Find which domain this metric belongs to
      for (const [domain, metrics] of Object.entries(availableMetrics)) {
        if (metrics.includes(metricKey)) {
          result.metrics.push({ domain, metricKey });
          break;
        }
      }
    }
  } else {
    // If no specific metrics detected, check for domain mentions and use defaults
    const domains = {
      economy: ["economic", "economy", "gdp", "financial", "fiscal", "monetary"],
      education: ["education", "school", "learning", "student", "academic"],
      environment: ["environment", "climate", "green", "carbon", "renewable", "pollution"],
      health: ["health", "medical", "healthcare", "disease", "mortality"]
    };

    const detectedDomains = new Set();
    for (const [domain, keywords] of Object.entries(domains)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          detectedDomains.add(domain);
          break;
        }
      }
    }

    // Use default metrics for detected domains
    if (detectedDomains.size > 0) {
      for (const domain of detectedDomains) {
        // Use the first metric as default for each domain
        const defaultMetric = availableMetrics[domain][0];
        result.metrics.push({ domain, metricKey: defaultMetric });
      }
    } else {
      // Fallback: use basic default metrics if nothing detected
      result.metrics = [
        { domain: "economy", metricKey: "gdp_growth_rate" },
        { domain: "education", metricKey: "literacy_rate" },
        { domain: "environment", metricKey: "co2_emissions" },
        { domain: "health", metricKey: "life_expectancy" }
      ];
    }
  }

  // Add relevant policy levers based on detected domains and question content
  const policyKeywords = {
    environment: {
      "green_investment": ["green investment", "green jobs", "renewable investment", "clean energy investment"],
      "carbon_tax": ["carbon tax", "carbon pricing", "emissions tax"],
      "environmental_regulation": ["environmental regulation", "pollution control", "emissions standards"]
    },
    education: {
      "education_funding": ["education funding", "education spending", "school funding", "stem funding", "education budget"],
      "teacher_investment": ["teacher training", "teacher hiring", "teacher salaries"],
      "education_reform": ["education reform", "curriculum changes", "school improvements"]
    },
    health: {
      "healthcare_spending": ["healthcare spending", "medicaid", "health coverage", "health investment", "medical funding"],
      "public_health": ["public health programs", "vaccination programs", "health initiatives"],
      "healthcare_reform": ["healthcare reform", "health system changes"]
    },
    economy: {
      "tax_policy": ["tax increase", "tax cut", "income tax", "corporate tax"],
      "spending_policy": ["government spending", "fiscal spending", "budget changes"],
      "investment_incentives": ["investment incentives", "economic stimulus", "business incentives"]
    }
  };

  // Detect policies mentioned in the question
  const detectedPolicies = [];
  for (const [domain, policies] of Object.entries(policyKeywords)) {
    for (const [lever, keywords] of Object.entries(policies)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          detectedPolicies.push({ domain, lever, pct: 1 });
          break;
        }
      }
    }
  }

  // If specific policies were detected, use those
  if (detectedPolicies.length > 0) {
    result.policies = detectedPolicies;
  } else {
    // Otherwise, add default levers based on detected domains
    const detectedDomainsList = [...new Set(result.metrics.map(m => m.domain))];
    const defaultPolicies = {
      environment: { lever: "green_investment", pct: 1 },
      education: { lever: "education_funding", pct: 1 },
      health: { lever: "healthcare_spending", pct: 1 },
      economy: { lever: "spending_policy", pct: 1 }
    };

    for (const domain of detectedDomainsList) {
      if (defaultPolicies[domain]) {
        result.policies.push({ domain, ...defaultPolicies[domain] });
      }
    }
  }

  // Time horizon: match phrases like "through 2035", "until 2040", or "by 2032"
  const yearMatch = text.match(/(?:through|until|by)\s+(20\d{2})/i);
  if (yearMatch) {
    const endYear = parseInt(yearMatch[1], 10);
    result.time.endYear = endYear;
    result.time.periods = endYear - result.time.startYear + 1;
  }

  // Optional: still check for "next X years"
  const match = text.match(/next\s+(\d+)\s+years/i);
  if (match) {
    result.time.periods = parseInt(match[1], 10);
    result.time.endYear = result.time.startYear + result.time.periods - 1;
  }

  return result;
}

module.exports = { parsePolicyQuestion };
