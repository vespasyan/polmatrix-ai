// Filters configuration based on actual database structure
export const filtersConfig = {
  // Economy filters (numeric codes: 1=Low, 2=Medium, 3=High)
  economy: [
    { 
      key: "gdp_growth_filter", 
      label: "GDP Growth Level",
      type: "select",
      options: [
        { value: "", label: "All Levels" },
        { value: 1, label: "Low Growth (< 0%)" },
        { value: 2, label: "Medium Growth (0-3%)" },
        { value: 3, label: "High Growth (> 3%)" }
      ]
    },
    { 
      key: "unemployment_rate_filter", 
      label: "Unemployment Level",
      type: "select",
      options: [
        { value: "", label: "All Levels" },
        { value: 1, label: "Low Unemployment (< 5%)" },
        { value: 2, label: "Medium Unemployment (5-10%)" },
        { value: 3, label: "High Unemployment (> 10%)" }
      ]
    },
    { 
      key: "inflation_rate_filter", 
      label: "Inflation Level",
      type: "select",
      options: [
        { value: "", label: "All Levels" },
        { value: 1, label: "Low Inflation (< 3%)" },
        { value: 2, label: "Medium Inflation (3-6%)" },
        { value: 3, label: "High Inflation (> 6%)" }
      ]
    }
  ],

  // Health filters
  health: [
    { 
      key: "life_expectancy_filter", 
      label: "Life Expectancy Level",
      type: "select",
      options: [
        { value: "", label: "All Levels" },
        { value: 1, label: "Low (< 70 years)" },
        { value: 2, label: "Medium (70-80 years)" },
        { value: 3, label: "High (> 80 years)" }
      ]
    },
    { 
      key: "maternal_mortality_filter", 
      label: "Maternal Mortality Level",
      type: "select",
      options: [
        { value: "", label: "All Levels" },
        { value: 1, label: "Low (< 20 per 100k)" },
        { value: 2, label: "Medium (20-100 per 100k)" },
        { value: 3, label: "High (> 100 per 100k)" }
      ]
    },
    { 
      key: "healthcare_expenditure_filter", 
      label: "Healthcare Spending Level",
      type: "select",
      options: [
        { value: "", label: "All Levels" },
        { value: 1, label: "Low (< 5% of GDP)" },
        { value: 2, label: "Medium (5-10% of GDP)" },
        { value: 3, label: "High (> 10% of GDP)" }
      ]
    }
  ],

  // Education filters
  education: [
    { 
      key: "literacy_rate_filter", 
      label: "Literacy Level",
      type: "select",
      options: [
        { value: "", label: "All Levels" },
        { value: 1, label: "Low (< 75%)" },
        { value: 2, label: "Medium (75-90%)" },
        { value: 3, label: "High (> 90%)" }
      ]
    },
    { 
      key: "school_enrollment_rate_filter", 
      label: "School Enrollment Level",
      type: "select",
      options: [
        { value: "", label: "All Levels" },
        { value: 1, label: "Low (< 70%)" },
        { value: 2, label: "Medium (70-85%)" },
        { value: 3, label: "High (> 85%)" }
      ]
    },
    { 
      key: "education_expenditure_filter", 
      label: "Education Spending Level",
      type: "select",
      options: [
        { value: "", label: "All Levels" },
        { value: 1, label: "Low (< 4% of GDP)" },
        { value: 2, label: "Medium (4-6% of GDP)" },
        { value: 3, label: "High (> 6% of GDP)" }
      ]
    }
  ],

  // Environment filters
  environment: [
    { 
      key: "co2_emissions_filter", 
      label: "CO₂ Emissions Level",
      type: "select",
      options: [
        { value: "", label: "All Levels" },
        { value: 1, label: "Low (< 5 tons per capita)" },
        { value: 2, label: "Medium (5-10 tons per capita)" },
        { value: 3, label: "High (> 10 tons per capita)" }
      ]
    },
    { 
      key: "renewable_energy_usage_filter", 
      label: "Renewable Energy Level",
      type: "select",
      options: [
        { value: "", label: "All Levels" },
        { value: 1, label: "Low (< 20%)" },
        { value: 2, label: "Medium (20-50%)" },
        { value: 3, label: "High (> 50%)" }
      ]
    },
    { 
      key: "energy_use_filter", 
      label: "Energy Use Level",
      type: "select",
      options: [
        { value: "", label: "All Levels" },
        { value: 1, label: "Low (< 2000 kg per capita)" },
        { value: 2, label: "Medium (2000-5000 kg per capita)" },
        { value: 3, label: "High (> 5000 kg per capita)" }
      ]
    }
  ]
}

// Global filters that apply to all domains
export const globalFilters = [
  {
    key: "country_code",
    label: "Country",
    type: "select",
    options: [
      { value: "", label: "All Countries" },
      { value: "USA", label: "United States" },
      { value: "GBR", label: "United Kingdom" },
      { value: "DEU", label: "Germany" },
      { value: "FRA", label: "France" },
      { value: "CHN", label: "China" },
      { value: "IND", label: "India" },
      { value: "BRA", label: "Brazil" },
      { value: "CAN", label: "Canada" },
      { value: "AUS", label: "Australia" },
      { value: "JPN", label: "Japan" }
    ]
  },
  {
    key: "year",
    label: "Year",
    type: "select",
    options: [
      { value: "", label: "All Years" },
      { value: 2020, label: "2020" },
      { value: 2021, label: "2021" },
      { value: 2022, label: "2022" },
      { value: 2023, label: "2023" },
      { value: 2024, label: "2024" }
    ]
  },
  {
    key: "year_range",
    label: "Year Range",
    type: "range",
    min: 2020,
    max: 2024,
    defaultValue: [2020, 2024]
  }
]

// Filter value mappings for display
export const filterValueMappings = {
  1: { label: "Low", color: "#10B981", description: "Below average performance" },
  2: { label: "Medium", color: "#F59E0B", description: "Average performance" },
  3: { label: "High", color: "#EF4444", description: "Above average performance" }
}

// Helper function to get filter options for a specific domain
export const getFilterOptions = (domain: keyof typeof filtersConfig) => {
  return filtersConfig[domain] || []
}

// Helper function to get all available filters
export const getAllFilters = () => {
  return {
    global: globalFilters,
    ...filtersConfig
  }
}

// Default filter values
export const defaultFilters = {
  economy: {},
  health: {},
  education: {},
  environment: {},
  global: {
    country_code: "",
    year: "",
    year_range: [2020, 2024]
  }
}