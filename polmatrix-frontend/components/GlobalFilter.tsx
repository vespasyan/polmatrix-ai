"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Filter, Globe, Calendar, Target, Activity, Leaf, Zap, Cpu, Layers, Sparkles, Eye } from "lucide-react"

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
  
  // Main component collapse state
  const [isCollapsed, setIsCollapsed] = useState(false)

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
      case 'education': return <Cpu className="h-4 w-4" />
      case 'sustainability': return <Leaf className="h-4 w-4" />
      case 'pollution': return <Zap className="h-4 w-4" />
      case 'conservation': return <Eye className="h-4 w-4" />
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
    <div className="space-y-3 p-4 bg-gradient-to-br from-slate-900/50 to-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm">
      <div className="flex items-center gap-3 text-sm font-medium text-slate-100">
        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30">
          {getFilterIcon(filterType)}
        </div>
        <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {title}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setValue(undefined)}
          className={`group relative px-4 py-3 text-xs rounded-xl border transition-all duration-300 overflow-hidden ${
            value === undefined
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-400 shadow-lg shadow-blue-500/25'
              : 'bg-slate-800/50 text-slate-300 border-slate-600/50 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/10'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative z-10 font-medium">All Levels</span>
        </button>
        {options.map((option, index) => (
          <button
            key={option.value}
            onClick={() => setValue(option.value)}
            className={`group relative px-4 py-3 text-xs rounded-xl border transition-all duration-300 overflow-hidden ${
              value === option.value
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-400 shadow-lg shadow-blue-500/25'
                : 'bg-slate-800/50 text-slate-300 border-slate-600/50 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/10'
            }`}
            title={option.description}
            style={{
              animationDelay: `${index * 0.1}s`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                value === option.value 
                  ? 'bg-white' 
                  : 'bg-slate-500 group-hover:bg-blue-400'
              } transition-colors duration-300`} />
              <span className="font-medium">{option.label}</span>
            </div>
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
    <div className={`relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden ${className}`}>
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-0 w-16 h-16 bg-cyan-500/10 rounded-full blur-lg animate-pulse delay-500" />
      </div>
      
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 backdrop-blur-sm">
              <Layers className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-xl bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Global Filters
              </h3>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Sparkles className="h-3 w-3" />
                <span>Advanced Analytics Dashboard</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-600/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="font-medium">{selectedGeographies.length}</span>
                <span className="text-slate-500">countries</span>
              </div>
              <div className="w-px h-4 bg-slate-600" />
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span className="font-medium">{selectedTimes.length}</span>
                <span className="text-slate-500">years</span>
              </div>
            </div>
            {/* Collapse/Expand Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="group p-2 bg-slate-800/50 rounded-lg border border-slate-600/50 hover:border-blue-400/50 transition-all duration-300 backdrop-blur-sm"
              title={isCollapsed ? "Expand filters" : "Collapse filters"}
            >
              <ChevronDown className={`h-4 w-4 text-slate-400 group-hover:text-blue-400 transition-all duration-300 ${
                isCollapsed ? 'rotate-180' : ''
              }`} />
            </button>
          </div>
        </div>

        {/* Collapsible Content */}
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'
        }`}>
          <div className="space-y-6">
            {/* Geography Filter */}
            <div className="space-y-3">
              <button
                onClick={() => toggleSection('geography')}
                className="group flex items-center justify-between w-full text-left p-4 bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-xl border border-slate-600/50 hover:border-blue-400/50 transition-all duration-300 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 text-sm font-medium text-slate-100">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30">
                    <Globe className="h-4 w-4 text-green-400" />
                  </div>
                  <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    Countries & Regions
                  </span>
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 group-hover:text-blue-400 transition-all duration-300 ${
                  expandedSections.geography ? 'rotate-180' : ''
                }`} />
              </button>
              
              {!expandedSections.geography && (
                <div className="ml-4 px-4 py-2 bg-slate-800/30 rounded-lg border border-slate-700/50 backdrop-blur-sm">
                  <div className="text-xs text-slate-400 truncate">
                    <span className="text-green-400 font-medium">Selected: </span>
                    {selectedGeoNames.slice(0, 3).join(', ')}
                    {selectedGeoNames.length > 3 && (
                      <span className="text-blue-400 font-medium"> +{selectedGeoNames.length - 3} more</span>
                    )}
                  </div>
                </div>
              )}

              {expandedSections.geography && (
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto custom-scrollbar p-1">
                  {geographies.map((geo, index) => (
                    <button
                      key={geo.geography_id}
                      onClick={() => toggleGeography(geo.geography_id.toString())}
                      className={`group relative px-4 py-3 text-xs rounded-xl border text-left transition-all duration-300 overflow-hidden ${
                        selectedGeographies.includes(geo.geography_id.toString())
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-400 shadow-lg shadow-green-500/25'
                          : 'bg-slate-800/50 text-slate-300 border-slate-600/50 hover:border-green-400/50 hover:shadow-lg hover:shadow-green-500/10'
                      }`}
                      style={{
                        animationDelay: `${index * 0.05}s`
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative z-10">
                        <div className="font-medium flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            selectedGeographies.includes(geo.geography_id.toString())
                              ? 'bg-white' 
                              : 'bg-slate-500 group-hover:bg-green-400'
                          } transition-colors duration-300`} />
                          {geo.name}
                        </div>
                        {geo.region && (
                          <div className="text-xs opacity-75 mt-1">{geo.region}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Time Filter */}
            <div className="space-y-3">
              <button
                onClick={() => toggleSection('time')}
                className="group flex items-center justify-between w-full text-left p-4 bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-xl border border-slate-600/50 hover:border-blue-400/50 transition-all duration-300 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 text-sm font-medium text-slate-100">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30">
                    <Calendar className="h-4 w-4 text-blue-400" />
                  </div>
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Time Period
                  </span>
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 group-hover:text-blue-400 transition-all duration-300 ${
                  expandedSections.time ? 'rotate-180' : ''
                }`} />
              </button>
              
              {!expandedSections.time && (
                <div className="ml-4 px-4 py-2 bg-slate-800/30 rounded-lg border border-slate-700/50 backdrop-blur-sm">
                  <div className="text-xs text-slate-400">
                    <span className="text-blue-400 font-medium">Selected: </span>
                    {selectedTimeLabels.join(', ')}
                  </div>
                </div>
              )}

              {expandedSections.time && (
                <div className="grid grid-cols-3 gap-3">
                  {times.map((time, index) => (
                    <button
                      key={time.time_id}
                      onClick={() => toggleTime(time.time_id.toString())}
                      className={`group relative px-4 py-3 text-xs rounded-xl border transition-all duration-300 overflow-hidden ${
                        selectedTimes.includes(time.time_id.toString())
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-blue-400 shadow-lg shadow-blue-500/25'
                          : 'bg-slate-800/50 text-slate-300 border-slate-600/50 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/10'
                      }`}
                      style={{
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative z-10 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          selectedTimes.includes(time.time_id.toString())
                            ? 'bg-white' 
                            : 'bg-slate-500 group-hover:bg-blue-400'
                        } transition-colors duration-300`} />
                        <span className="font-medium">
                          {time.year}
                          {time.quarter && ` Q${time.quarter}`}
                          {time.month && ` ${time.month}`}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Domain Filters */}
            <div className="space-y-3">
              <button
                onClick={() => toggleSection('filters')}
                className="group flex items-center justify-between w-full text-left p-4 bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-xl border border-slate-600/50 hover:border-purple-400/50 transition-all duration-300 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 text-sm font-medium text-slate-100">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30">
                    <Filter className="h-4 w-4 text-purple-400" />
                  </div>
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Domain Filters
                  </span>
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 group-hover:text-purple-400 transition-all duration-300 ${
                  expandedSections.filters ? 'rotate-180' : ''
                }`} />
              </button>

              {expandedSections.filters && (
                <div className="space-y-4">
                  {renderFilterSection(
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
        </div>

        {/* Quick Reset - only show when expanded */}
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isCollapsed ? 'max-h-0 opacity-0 mt-0 pt-0' : 'max-h-20 opacity-100 mt-6 pt-6'
        } border-t border-slate-700/50`}>
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
            className="group relative w-full px-6 py-3 text-sm font-medium bg-gradient-to-r from-slate-800/50 to-slate-700/50 text-slate-300 border border-slate-600/50 rounded-xl hover:border-purple-400/50 transition-all duration-300 overflow-hidden backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10 flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 group-hover:text-purple-400 transition-colors duration-300" />
              <span className="group-hover:text-purple-400 transition-colors duration-300">
                Reset to Defaults
              </span>
            </div>
          </button>
        </div>
      </div>
      
      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}</style>
    </div>
  )
}