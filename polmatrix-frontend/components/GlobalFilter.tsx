"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Filter, Globe, Calendar, Target, Activity, Leaf } from "lucide-react"

type GlobalFilterProps = {
  geographies?: { geography_id: number; name: string; region?: string }[]
  times?: {
    time_id: number
    year: number
    quarter: string | null
    month: string | null
  }[]
  onFilterChange: (filters: {
    geography_id: string[];
    time_id: string[];
    economic_filter?: number;
    health_filter?: number;
    education_filter?: number;
    sustainability_filter?: number;
    pollution_filter?: number;
    conservation_filter?: number;
  }) => void
  className?: string
}

// Default data if not provided
const defaultGeographies = [
  { geography_id: 1, name: "United States", region: "North America" },
  { geography_id: 3, name: "United Kingdom", region: "Europe" },
  { geography_id: 4, name: "Germany", region: "Europe" },
  { geography_id: 5, name: "France", region: "Europe" },
  { geography_id: 6, name: "Japan", region: "Asia" },
  { geography_id: 7, name: "China", region: "Asia" },
  { geography_id: 8, name: "India", region: "Asia" },
  { geography_id: 9, name: "Brazil", region: "South America" },
  { geography_id: 10, name: "Canada", region: "North America" },
  { geography_id: 11, name: "Australia", region: "Oceania" },
]

const defaultTimes = [
  { time_id: 52, year: 2020, quarter: null, month: null },
  { time_id: 53, year: 2021, quarter: null, month: null },
  { time_id: 54, year: 2022, quarter: null, month: null },
  { time_id: 55, year: 2023, quarter: null, month: null },
  { time_id: 56, year: 2024, quarter: null, month: null },
]

export default function GlobalFilter({
  geographies = defaultGeographies,
  times = defaultTimes,
  onFilterChange,
  className = ""
}: GlobalFilterProps) {
  // Multi-select states
  const [selectedGeographies, setSelectedGeographies] = useState<string[]>(["1", "3", "4"])
  const [selectedTimes, setSelectedTimes] = useState<string[]>(["54", "55", "56"]) // 2022-2024
  
  // Domain filters
  const [economicFilter, setEconomicFilter] = useState<number | undefined>(undefined)
  const [healthFilter, setHealthFilter] = useState<number | undefined>(undefined)
  const [educationFilter, setEducationFilter] = useState<number | undefined>(undefined)
  const [sustainabilityFilter, setSustainabilityFilter] = useState<number | undefined>(undefined)
  const [pollutionFilter, setPollutionFilter] = useState<number | undefined>(undefined)
  const [conservationFilter, setConservationFilter] = useState<number | undefined>(undefined)

  // UI states
  const [expandedSections, setExpandedSections] = useState({
    geography: false,
    time: false,
    filters: false
  })

  useEffect(() => {
    onFilterChange({
      geography_id: selectedGeographies,
      time_id: selectedTimes,
      economic_filter: economicFilter,
      health_filter: healthFilter,
      education_filter: educationFilter,
      sustainability_filter: sustainabilityFilter,
      pollution_filter: pollutionFilter,
      conservation_filter: conservationFilter,
    })
  }, [
    selectedGeographies,
    selectedTimes,
    economicFilter,
    healthFilter,
    educationFilter,
    sustainabilityFilter,
    pollutionFilter,
    conservationFilter,
    onFilterChange
  ])

  const toggleGeography = (geoId: string) => {
    setSelectedGeographies(prev =>
      prev.includes(geoId)
        ? prev.filter(id => id !== geoId)
        : [...prev, geoId]
    )
  }

  const toggleTime = (timeId: string) => {
    setSelectedTimes(prev =>
      prev.includes(timeId)
        ? prev.filter(id => id !== timeId)
        : [...prev, timeId]
    )
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const getFilterIcon = (filterType: string) => {
    switch (filterType) {
      case 'economic': return <Target className="h-4 w-4" />
      case 'health': return <Activity className="h-4 w-4" />
      case 'education': return <Target className="h-4 w-4" />
      case 'sustainability': return <Leaf className="h-4 w-4" />
      case 'pollution': return <Leaf className="h-4 w-4" />
      case 'conservation': return <Leaf className="h-4 w-4" />
      default: return <Filter className="h-4 w-4" />
    }
  }

  const renderFilterSection = (
    title: string,
    filterType: string,
    value: number | undefined,
    setValue: (value: number | undefined) => void,
    options: { value: number; label: string; description?: string }[]
  ) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
        {getFilterIcon(filterType)}
        {title}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setValue(undefined)}
          className={`px-3 py-2 text-xs rounded-lg border transition-all duration-200 ${
            value === undefined
              ? 'bg-[var(--accent-color)] text-white border-[var(--accent-color)]'
              : 'bg-[var(--input-bg)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--accent-color)]'
          }`}
        >
          All Levels
        </button>
        {options.map(option => (
          <button
            key={option.value}
            onClick={() => setValue(option.value)}
            className={`px-3 py-2 text-xs rounded-lg border transition-all duration-200 ${
              value === option.value
                ? 'bg-[var(--accent-color)] text-white border-[var(--accent-color)]'
                : 'bg-[var(--input-bg)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--accent-color)]'
            }`}
            title={option.description}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )

  const selectedGeoNames = geographies
    .filter(geo => selectedGeographies.includes(geo.geography_id.toString()))
    .map(geo => geo.name)

  const selectedTimeLabels = times
    .filter(time => selectedTimes.includes(time.time_id.toString()))
    .map(time => time.year)

  return (
    <div className={`bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border-color)] ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-[var(--accent-color)]" />
            <h3 className="font-semibold text-[var(--text-primary)]">Global Filters</h3>
          </div>
          <div className="text-xs text-[var(--text-secondary)]">
            {selectedGeographies.length} countries, {selectedTimes.length} years
          </div>
        </div>

        <div className="space-y-4">
          {/* Geography Filter */}
          <div className="space-y-2">
            <button
              onClick={() => toggleSection('geography')}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                <Globe className="h-4 w-4" />
                Countries/Regions
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.geography ? 'rotate-180' : ''}`} />
            </button>
            
            {!expandedSections.geography && (
              <div className="text-xs text-[var(--text-secondary)] truncate">
                {selectedGeoNames.slice(0, 3).join(', ')}
                {selectedGeoNames.length > 3 && ` +${selectedGeoNames.length - 3} more`}
              </div>
            )}

            {expandedSections.geography && (
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {geographies.map(geo => (
                  <button
                    key={geo.geography_id}
                    onClick={() => toggleGeography(geo.geography_id.toString())}
                    className={`px-3 py-2 text-xs rounded-lg border text-left transition-all duration-200 ${
                      selectedGeographies.includes(geo.geography_id.toString())
                        ? 'bg-[var(--accent-color)] text-white border-[var(--accent-color)]'
                        : 'bg-[var(--input-bg)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--accent-color)]'
                    }`}
                  >
                    <div className="font-medium">{geo.name}</div>
                    {geo.region && (
                      <div className="text-xs opacity-75">{geo.region}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Time Filter */}
          <div className="space-y-2">
            <button
              onClick={() => toggleSection('time')}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                <Calendar className="h-4 w-4" />
                Time Period
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.time ? 'rotate-180' : ''}`} />
            </button>
            
            {!expandedSections.time && (
              <div className="text-xs text-[var(--text-secondary)]">
                {selectedTimeLabels.join(', ')}
              </div>
            )}

            {expandedSections.time && (
              <div className="grid grid-cols-3 gap-2">
                {times.map(time => (
                  <button
                    key={time.time_id}
                    onClick={() => toggleTime(time.time_id.toString())}
                    className={`px-3 py-2 text-xs rounded-lg border transition-all duration-200 ${
                      selectedTimes.includes(time.time_id.toString())
                        ? 'bg-[var(--accent-color)] text-white border-[var(--accent-color)]'
                        : 'bg-[var(--input-bg)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--accent-color)]'
                    }`}
                  >
                    {time.year}
                    {time.quarter && ` Q${time.quarter}`}
                    {time.month && ` ${time.month}`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Domain Filters */}
          <div className="space-y-2">
            <button
              onClick={() => toggleSection('filters')}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                <Filter className="h-4 w-4" />
                Domain Filters
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.filters ? 'rotate-180' : ''}`} />
            </button>

            {expandedSections.filters && (
              <div className="space-y-4">                {renderFilterSection(
                  "Economic Level",
                  "economic",
                  economicFilter,
                  setEconomicFilter,
                  [
                    { value: 1, label: "Low" },
                    { value: 2, label: "Medium" },
                    { value: 3, label: "High" }
                  ]
                )}
                
                {renderFilterSection(
                  "Health Level",
                  "health",
                  healthFilter,
                  setHealthFilter,
                  [
                    { value: 1, label: "Low" },
                    { value: 2, label: "Medium" },
                    { value: 3, label: "High" }
                  ]
                )}
                
                {renderFilterSection(
                  "Education Level",
                  "education",
                  educationFilter,
                  setEducationFilter,
                  [
                    { value: 1, label: "Low" },
                    { value: 2, label: "Medium" },
                    { value: 3, label: "High" }
                  ]
                )}
                
                {renderFilterSection(
                  "Sustainability",
                  "sustainability",
                  sustainabilityFilter,
                  setSustainabilityFilter,
                  [
                    { value: 1, label: "Low" },
                    { value: 2, label: "Medium" },
                    { value: 3, label: "High" }
                  ]
                )}
                
                {renderFilterSection(
                  "Pollution Level",
                  "pollution",
                  pollutionFilter,
                  setPollutionFilter,
                  [
                    { value: 1, label: "Low" },
                    { value: 2, label: "Medium" },
                    { value: 3, label: "High" }
                  ]
                )}
                
                {renderFilterSection(
                  "Conservation",
                  "conservation",
                  conservationFilter,
                  setConservationFilter,
                  [
                    { value: 1, label: "Low" },
                    { value: 2, label: "Medium" },
                    { value: 3, label: "High" }
                  ]
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Reset */}
        <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
          <button
            onClick={() => {
              setSelectedGeographies(["1", "3", "4"])
              setSelectedTimes(["54", "55", "56"])
              setEconomicFilter(undefined)
              setHealthFilter(undefined)
              setEducationFilter(undefined)
              setSustainabilityFilter(undefined)
              setPollutionFilter(undefined)
              setConservationFilter(undefined)
            }}
            className="w-full px-3 py-2 text-xs bg-[var(--input-bg)] text-[var(--text-secondary)] border border-[var(--border-color)] rounded-lg hover:border-[var(--accent-color)] transition-all duration-200"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  )
}