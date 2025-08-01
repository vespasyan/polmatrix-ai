// Comprehensive metrics configuration based on actual database structure
export const metricsConfig = {
  economy: [
    { key: "gdp_growth", label: "GDP Growth Rate", unit: "%", category: "Growth" },
    { key: "gdp_per_capita", label: "GDP per Capita", unit: "USD", category: "Growth" },
    { key: "gdp_per_capita_growth", label: "GDP per Capita Growth", unit: "%", category: "Growth" },
    { key: "unemployment_rate", label: "Unemployment Rate", unit: "%", category: "Employment" },
    { key: "inflation_rate", label: "Inflation Rate", unit: "%", category: "Monetary" },
    { key: "trade_balance", label: "Trade Balance", unit: "USD", category: "Trade" },
    { key: "foreign_direct_investment", label: "Foreign Direct Investment", unit: "USD", category: "Investment" },
    { key: "average_gdp_growth", label: "Average GDP Growth", unit: "%", category: "Growth" },
    { key: "total_trade_balance", label: "Total Trade Balance", unit: "USD", category: "Trade" },
  ],
  
  health: [
    { key: "life_expectancy", label: "Life Expectancy", unit: "years", category: "Outcomes" },
    { key: "maternal_mortality", label: "Maternal Mortality", unit: "per 100,000", category: "Outcomes" },
    { key: "healthcare_expenditure", label: "Healthcare Expenditure", unit: "% of GDP", category: "Spending" },
    { key: "infant_mortality", label: "Infant Mortality", unit: "per 1,000", category: "Outcomes" },
    { key: "infant_mortality_rate", label: "Infant Mortality Rate", unit: "per 1,000", category: "Outcomes" },
    { key: "under5_mortality_per_1k", label: "Under-5 Mortality", unit: "per 1,000", category: "Outcomes" },
    { key: "maternal_mortality_ratio", label: "Maternal Mortality Ratio", unit: "per 100,000", category: "Outcomes" },
    { key: "physicians_per_1k", label: "Physicians per 1,000", unit: "per 1,000", category: "Resources" },
    { key: "hospital_beds_per_10k", label: "Hospital Beds per 10,000", unit: "per 10,000", category: "Resources" },
    { key: "suicide_rate_per_100k", label: "Suicide Rate", unit: "per 100,000", category: "Mental Health" },
    { key: "disease_burden", label: "Disease Burden", unit: "index", category: "Outcomes" },
    { key: "average_life_expectancy", label: "Average Life Expectancy", unit: "years", category: "Outcomes" },
    { key: "total_healthcare_expenditure", label: "Total Healthcare Expenditure", unit: "USD", category: "Spending" },
  ],
  
  education: [
    { key: "literacy_rate", label: "Literacy Rate", unit: "%", category: "Outcomes" },
    { key: "school_enrollment_rate", label: "School Enrollment Rate", unit: "%", category: "Access" },
    { key: "education_expenditure", label: "Education Expenditure", unit: "% of GDP", category: "Spending" },
    { key: "teacher_student_ratio", label: "Teacher-Student Ratio", unit: "ratio", category: "Resources" },
    { key: "gender_parity_in_education", label: "Gender Parity Index", unit: "ratio", category: "Equity" },
    { key: "enrollment_primary", label: "Primary Enrollment", unit: "%", category: "Access" },
    { key: "enrollment_secondary", label: "Secondary Enrollment", unit: "%", category: "Access" },
    { key: "enrollment_tertiary", label: "Tertiary Enrollment", unit: "%", category: "Access" },
    { key: "government_expenditure_pct_gdp", label: "Government Education Expenditure", unit: "% of GDP", category: "Spending" },
    { key: "primary_completion_rate", label: "Primary Completion Rate", unit: "%", category: "Outcomes" },
    { key: "average_literacy_rate", label: "Average Literacy Rate", unit: "%", category: "Outcomes" },
    { key: "total_education_expenditure", label: "Total Education Expenditure", unit: "USD", category: "Spending" },
    { key: "teacher_student_ratio_metric", label: "Teacher-Student Ratio Metric", unit: "ratio", category: "Resources" },
  ],
  
  environment: [
    { key: "co2_emissions", label: "CO₂ Emissions", unit: "tons per capita", category: "Emissions" },
    { key: "renewable_energy_usage", label: "Renewable Energy Usage", unit: "%", category: "Energy" },
    { key: "forest_area_pct", label: "Forest Area", unit: "% of land", category: "Land Use" },
    { key: "energy_use_kg_oil_pc", label: "Energy Use", unit: "kg oil eq. per capita", category: "Energy" },
    { key: "total_co2_emissions", label: "Total CO₂ Emissions", unit: "tons", category: "Emissions" },
    { key: "renewable_energy_percentage", label: "Renewable Energy Percentage", unit: "%", category: "Energy" },
    { key: "deforestation_rate", label: "Deforestation Rate", unit: "%", category: "Land Use" },
    { key: "average_deforestation_rate", label: "Average Deforestation Rate", unit: "%", category: "Land Use" },
    { key: "water_usage", label: "Water Usage", unit: "m³ per capita", category: "Water" },
    { key: "pm25", label: "PM2.5 Air Pollution", unit: "µg/m³", category: "Air Quality" },
    { key: "electric_power_kwh_pc", label: "Electric Power Consumption", unit: "kWh per capita", category: "Energy" },
    { key: "freshwater_withdrawal_pct", label: "Freshwater Withdrawal", unit: "% of resources", category: "Water" },
  ],
  
  socialDemographic: [
    { key: "population_total", label: "Total Population", unit: "people", category: "Demographics" },
    { key: "population_growth", label: "Population Growth", unit: "%", category: "Demographics" },
    { key: "fertility_rate", label: "Fertility Rate", unit: "births per woman", category: "Demographics" },
    { key: "age_dependency_ratio", label: "Age Dependency Ratio", unit: "%", category: "Demographics" },
    { key: "gini_index", label: "Gini Index", unit: "index", category: "Inequality" },
    { key: "poverty_rate", label: "Poverty Rate", unit: "%", category: "Poverty" },
    { key: "homicide_rate", label: "Homicide Rate", unit: "per 100,000", category: "Safety" },
    { key: "child_labor", label: "Child Labor", unit: "%", category: "Child Welfare" },
    { key: "stunting_rate", label: "Stunting Rate", unit: "%", category: "Nutrition" },
    { key: "immunization_dpt", label: "DPT Immunization", unit: "%", category: "Health" },
  ],
  
  technology: [
    { key: "internet_usage", label: "Internet Usage", unit: "%", category: "Digital Access" },
    { key: "mobile_subscriptions", label: "Mobile Subscriptions", unit: "per 100 people", category: "Digital Access" },
    { key: "scientific_articles", label: "Scientific Articles", unit: "count", category: "Research" },
    { key: "patent_applications", label: "Patent Applications", unit: "count", category: "Innovation" },
    { key: "research_expenditure", label: "Research Expenditure", unit: "% of GDP", category: "Research" },
    { key: "broadband_subscriptions", label: "Broadband Subscriptions", unit: "per 100 people", category: "Digital Access" },
    { key: "innovation_index", label: "Innovation Index", unit: "index", category: "Innovation" },
  ],
  
  trade: [
    { key: "trade_percentage_of_gdp", label: "Trade as % of GDP", unit: "%", category: "Trade Volume" },
    { key: "ip_payments", label: "IP Payments", unit: "USD", category: "Intellectual Property" },
    { key: "high_tech_exports", label: "High-tech Exports", unit: "% of exports", category: "Technology Trade" },
    { key: "trade_balance_goods", label: "Trade Balance (Goods)", unit: "USD", category: "Trade Balance" },
    { key: "trade_balance_services", label: "Trade Balance (Services)", unit: "USD", category: "Trade Balance" },
    { key: "exports_of_goods_services", label: "Exports of Goods & Services", unit: "% of GDP", category: "Trade Volume" },
  ]
}

// Category groupings for better organization
export const metricCategories = {
  economy: ["Growth", "Employment", "Monetary", "Trade", "Investment"],
  health: ["Outcomes", "Spending", "Resources", "Mental Health"],
  education: ["Outcomes", "Access", "Spending", "Resources", "Equity"],
  environment: ["Emissions", "Energy", "Land Use", "Water", "Air Quality"],
  socialDemographic: ["Demographics", "Inequality", "Poverty", "Safety", "Child Welfare", "Nutrition", "Health"],
  technology: ["Digital Access", "Research", "Innovation"],
  trade: ["Trade Volume", "Intellectual Property", "Technology Trade", "Trade Balance"]
}


// Default metrics to display for each domain
export const defaultMetrics = {
  economy: ["gdp_growth", "unemployment_rate", "inflation_rate", "gdp_per_capita"],
  health: ["life_expectancy", "maternal_mortality", "healthcare_expenditure", "infant_mortality"],
  education: ["literacy_rate", "school_enrollment_rate", "education_expenditure", "primary_completion_rate"],
  environment: ["co2_emissions", "renewable_energy_usage", "forest_area_pct", "pm25"],
  socialDemographic: ["population_growth", "gini_index", "poverty_rate", "fertility_rate"],
  technology: ["internet_usage", "mobile_subscriptions", "research_expenditure", "innovation_index"],
  trade: ["trade_percentage_of_gdp", "high_tech_exports", "trade_balance_goods", "exports_of_goods_services"]
}
  
