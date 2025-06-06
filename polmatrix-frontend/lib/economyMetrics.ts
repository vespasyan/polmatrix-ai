// Economy metrics based on actual database structure
export const economyMetrics = [
  {
    category: "GDP Metrics",
    metrics: [
      { key: "gdp_growth", label: "GDP Growth Rate", unit: "%", description: "Annual GDP growth percentage" },
      { key: "gdp_per_capita", label: "GDP per Capita", unit: "USD", description: "GDP per capita in current USD" },
      { key: "gdp_per_capita_growth", label: "GDP per Capita Growth", unit: "%", description: "Annual GDP per capita growth" },
      { key: "gdp_growth_rate_percentage", label: "GDP Growth Rate", unit: "%", description: "GDP growth rate percentage" },
      { key: "average_gdp_growth", label: "Average GDP Growth", unit: "%", description: "Historical average GDP growth" },
    ]
  },
  {
    category: "Employment",
    metrics: [
      { key: "unemployment_rate", label: "Unemployment Rate", unit: "%", description: "Percentage of total labor force unemployed" },
    ]
  },
  {
    category: "Inflation",
    metrics: [
      { key: "inflation_rate", label: "Inflation Rate", unit: "%", description: "Annual inflation rate" },
    ]
  },
  {
    category: "Trade & Investment",
    metrics: [
      { key: "trade_balance", label: "Trade Balance", unit: "USD", description: "Trade balance in current USD" },
      { key: "foreign_direct_investment", label: "Foreign Direct Investment", unit: "USD", description: "FDI net inflows" },
      { key: "total_trade_balance", label: "Total Trade Balance", unit: "USD", description: "Cumulative trade balance" },
    ]
  }
]

// Filter configurations for economy domain
export const economyFilters = [
  { 
    key: "gdp_growth_filter", 
    label: "GDP Growth Level", 
    options: [
      { value: 1, label: "Low Growth" },
      { value: 2, label: "Medium Growth" },
      { value: 3, label: "High Growth" }
    ]
  },
  { 
    key: "unemployment_rate_filter", 
    label: "Unemployment Level", 
    options: [
      { value: 1, label: "Low Unemployment" },
      { value: 2, label: "Medium Unemployment" },
      { value: 3, label: "High Unemployment" }
    ]
  },
  { 
    key: "inflation_rate_filter", 
    label: "Inflation Level", 
    options: [
      { value: 1, label: "Low Inflation" },
      { value: 2, label: "Medium Inflation" },
      { value: 3, label: "High Inflation" }
    ]
  }
]

// Chart configuration for economy metrics
export const economyChartConfig = {
  gdp_growth: {
    type: 'line',
    color: '#3B82F6',
    yAxisLabel: 'GDP Growth (%)'
  },
  unemployment_rate: {
    type: 'line',
    color: '#EF4444',
    yAxisLabel: 'Unemployment Rate (%)'
  },
  inflation_rate: {
    type: 'line',
    color: '#F59E0B',
    yAxisLabel: 'Inflation Rate (%)'
  },
  gdp_per_capita: {
    type: 'bar',
    color: '#10B981',
    yAxisLabel: 'GDP per Capita (USD)'
  },
  trade_balance: {
    type: 'line',
    color: '#8B5CF6',
    yAxisLabel: 'Trade Balance (USD)'
  },
  foreign_direct_investment: {
    type: 'bar',
    color: '#F97316',
    yAxisLabel: 'FDI (USD)'
  }
}

// Key performance indicators for economy
export const economyKPIs = [
  {
    key: "gdp_growth",
    label: "GDP Growth",
    format: "percentage",
    trend: "higher_better"
  },
  {
    key: "unemployment_rate",
    label: "Unemployment",
    format: "percentage",
    trend: "lower_better"
  },
  {
    key: "inflation_rate",
    label: "Inflation",
    format: "percentage",
    trend: "lower_better"
  },
  {
    key: "gdp_per_capita",
    label: "GDP per Capita",
    format: "currency",
    trend: "higher_better"
  }
]