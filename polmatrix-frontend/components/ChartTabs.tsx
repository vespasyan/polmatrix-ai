"use client"

import { useState } from "react"
import EconomyChart from "./EconomyChart"
import EducationChart from "./EducationChart"
import EnvironmentChart from "./EnvironmentChart"
import HealthChart from "./HealthChart"
import CorrelationChart from "./CorrelationChart"
import CorrelationMatrix from "./CorrelationMatrix"
import { motion, AnimatePresence } from "framer-motion"
import { BarChart3, GraduationCap, Leaf, Heart, TrendingUp, Grid3X3 } from "lucide-react"
import { pivotSimulationData } from "@/lib/chartTransforms";

type Props = {
  economyData: any[]
  educationData: any[]
  environmentData: any[]
  healthData: any[]
  economyMetrics: string[]
  educationMetrics: string[]
  environmentMetrics: string[]
  healthMetrics: string[]
  onToggleEconomy: (metric: string) => void
  onToggleEducation: (metric: string) => void
  onToggleEnvironment: (metric: string) => void
  onToggleHealth: (metric: string) => void
  correlationTab?: "impact" | "matrix"
  setCorrelationTab?: (tab: "impact" | "matrix") => void
  isLoading?: boolean
  simulatedData: any[]
}

const tabConfig = [
  { 
    key: "economy", 
    label: "Economy", 
    color: "#00D4FF",
    gradient: "from-cyan-400 via-blue-500 to-indigo-600",
    glowColor: "cyan",
    icon: BarChart3,
    description: "Economic indicators and growth metrics",
    neonShadow: "0 0 20px #00D4FF40, 0 0 40px #00D4FF20"
  },
  { 
    key: "education", 
    label: "Education", 
    color: "#8B5CF6",
    gradient: "from-purple-400 via-violet-500 to-purple-600", 
    glowColor: "purple",
    icon: GraduationCap,
    description: "Educational outcomes and access metrics",
    neonShadow: "0 0 20px #8B5CF640, 0 0 40px #8B5CF620"
  },
  { 
    key: "environment", 
    label: "Environment", 
    color: "#10B981",
    gradient: "from-emerald-400 via-green-500 to-teal-600",
    glowColor: "emerald",
    icon: Leaf,
    description: "Environmental sustainability and impact",
    neonShadow: "0 0 20px #10B98140, 0 0 40px #10B98120"
  },
  { 
    key: "health", 
    label: "Health", 
    color: "#F59E0B",
    gradient: "from-yellow-400 via-orange-500 to-red-600",
    glowColor: "orange",
    icon: Heart,
    description: "Health outcomes and healthcare access",
    neonShadow: "0 0 20px #F59E0B40, 0 0 40px #F59E0B20"
  },
]

export default function ChartTabs({
  economyData,
  educationData,
  environmentData,
  healthData,
  economyMetrics,
  educationMetrics,
  environmentMetrics,
  healthMetrics,
  onToggleEconomy,
  onToggleEducation,
  onToggleEnvironment,
  onToggleHealth,
  correlationTab = "impact",
  setCorrelationTab = () => {},
  isLoading = false,
  simulatedData
}: Props) {
  const [activeTab, setActiveTab] = useState("economy")
  const [hoveredTab, setHoveredTab] = useState<string | null>(null)

  const pivoted = pivotSimulationData(simulatedData || []);

  const economy = pivoted.map(row => ({
    year: row.year,
    gdp: row.gdp,
    unemployment_rate: row.unemployment_rate,
  }));

  const education = pivoted.map(row => ({
    year: row.year,
    literacy_rate: row.literacy_rate,
    school_enrollment_rate: row.school_enrollment_rate,
  }));

  const environment = pivoted.map(row => ({
    year: row.year,
    co2_emissions: row.co2_emissions,
    renewable_energy_percentage: row.renewable_energy_percentage,
  }));

  const health = pivoted.map(row => ({
    year: row.year,
    life_expectancy: row.life_expectancy,
    healthcare_expenditure_per_capita: row.healthcare_expenditure_per_capita,
  }));

  const renderChart = () => {
    if (isLoading) {
      return (
        <div className="h-[400px] flex items-center justify-center bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-xl border border-dashed border-slate-600/50 backdrop-blur-sm">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="animate-spin h-12 w-12 border-3 border-cyan-400 border-t-transparent rounded-full mx-auto"></div>
              <div className="absolute inset-0 animate-ping h-12 w-12 border-2 border-cyan-300 rounded-full mx-auto opacity-30"></div>
            </div>
            <p className="text-slate-300 font-medium">Loading chart data...</p>
            <div className="flex justify-center gap-1">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      )
    }

    switch (activeTab) {
      case "economy":
        return <EconomyChart data={economyData} selectedMetrics={economyMetrics} onToggleMetric={onToggleEconomy} simulationData={economy} />
      case "education":
        return <EducationChart data={educationData} selectedMetrics={educationMetrics} onToggleMetric={onToggleEducation} simulationData={education} />
      case "environment":
        return <EnvironmentChart data={environmentData} selectedMetrics={environmentMetrics} onToggleMetric={onToggleEnvironment} simulationData={environment} />
      case "health":
        return <HealthChart data={healthData} selectedMetrics={healthMetrics} onToggleMetric={onToggleHealth} simulationData={health} />
      default:
        return <EconomyChart data={economyData} selectedMetrics={economyMetrics} onToggleMetric={onToggleEconomy} simulationData={economy} />
    }
  }

  const getDataCount = (tabKey: string) => {
    switch (tabKey) {
      case "economy":
        return economyData?.length || 0
      case "education":
        return educationData?.length || 0
      case "environment":
        return environmentData?.length || 0
      case "health":
        return healthData?.length || 0
      default:
        return 0
    }
  }

  const getMetricCount = (tabKey: string) => {
    switch (tabKey) {
      case "economy":
        return economyMetrics?.length || 0
      case "education":
        return educationMetrics?.length || 0
      case "environment":
        return environmentMetrics?.length || 0
      case "health":
        return healthMetrics?.length || 0
      default:
        return 0
    }
  }

  return (
    <>
      <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-slate-700/50 overflow-hidden backdrop-blur-xl relative">
        {/* Futuristic Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.1),transparent_50%)]"></div>
        
        {/* Animated border glow */}
        <div className="absolute inset-0 rounded-2xl opacity-75">
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-pink-500/30 animate-pulse"></div>
        </div>

        {/* Enhanced Tabs Header */}
        <div className="relative bg-gradient-to-r from-slate-900/50 to-slate-800/50 px-8 pt-8 pb-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Policy Impact Analysis
              </h2>
              <p className="text-sm text-slate-400 mt-2 font-medium">
                Explore cross-domain impacts and correlations
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Active Domain</div>
              <div className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent capitalize">
                {activeTab}
              </div>
            </div>
          </div>

          {/* Enhanced Tab Navigation */}
          <div className="flex gap-3 relative">
            {tabConfig.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.key
              const isHovered = hoveredTab === tab.key
              const dataCount = getDataCount(tab.key)
              const metricCount = getMetricCount(tab.key)
              
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  onMouseEnter={() => setHoveredTab(tab.key)}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={`relative flex-1 px-6 py-4 rounded-xl font-semibold text-sm transition-all duration-500 group overflow-hidden ${
                    isActive
                      ? `bg-gradient-to-r ${tab.gradient} text-white shadow-2xl transform translate-y-[-3px] scale-105`
                      : "bg-slate-800/40 text-slate-300 hover:bg-slate-700/60 hover:text-white hover:shadow-xl hover:scale-102 border border-slate-700/50"
                  }`}
                  style={{
                    boxShadow: isActive ? tab.neonShadow : undefined
                  }}
                >
                  {/* Holographic overlay */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-30 animate-pulse"></div>
                  )}
                  
                  {/* Hover glow effect */}
                  {isHovered && !isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} opacity-20 animate-pulse`}></div>
                  )}

                  <div className="relative flex items-center justify-center gap-3">
                    <Icon 
                      size={18} 
                      className={`transition-all duration-500 ${
                        isActive ? 'scale-110 drop-shadow-lg' : 'group-hover:scale-105'
                      }`}
                    />
                    <span className="tracking-wide">{tab.label}</span>
                  </div>
                  
                  {/* Futuristic metric count indicator */}
                  {metricCount > 0 && (
                    <div className={`absolute -top-2 -right-2 h-6 w-6 rounded-full text-xs flex items-center justify-center font-bold border-2 transition-all duration-300 ${
                      isActive 
                        ? 'bg-white text-slate-800 border-white shadow-lg' 
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-cyan-400 shadow-lg'
                    }`}>
                      {metricCount}
                    </div>
                  )}

                  {/* Enhanced hover tooltip */}
                  {isHovered && !isActive && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-3 z-20 px-4 py-2 bg-slate-900/95 backdrop-blur-sm text-white text-xs rounded-lg shadow-2xl border border-slate-600/50 whitespace-nowrap">
                      <div className="font-medium text-slate-200">{tab.description}</div>
                      <div className="text-slate-400 mt-1">
                        {dataCount} data points • {metricCount} metrics
                      </div>
                      {/* Arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-900/95"></div>
                    </div>
                  )}

                  {/* Active indicator with glow */}
                  {isActive && (
                    <div 
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-3 w-12 h-1 rounded-full bg-white shadow-lg"
                      style={{
                        boxShadow: `0 0 10px ${tab.color}, 0 0 20px ${tab.color}40`
                      }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Chart Container */}
        <div className="relative px-8 pb-8">
          {/* Futuristic chart container with holographic effects */}
          <div className="relative rounded-xl bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-slate-700/50 overflow-hidden backdrop-blur-sm">
            {/* Holographic grid overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(59,130,246,0.3)_50%,transparent_100%)] animate-pulse"></div>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 30, rotateY: 15 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                exit={{ opacity: 0, x: -30, rotateY: -15 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="relative z-10"
              >
                {renderChart()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Enhanced Correlations Section */}
      <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-slate-700/50 overflow-hidden backdrop-blur-xl relative mt-8">
        {/* Futuristic background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-cyan-500/5 to-green-500/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(34,197,94,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.1),transparent_50%)]"></div>
        
        {/* Animated border */}
        <div className="absolute inset-0 rounded-2xl opacity-60">
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-purple-500/30 via-cyan-500/30 to-green-500/30 animate-pulse"></div>
        </div>

        <div className="relative bg-gradient-to-r from-slate-900/50 to-slate-800/50 px-8 py-6 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 via-cyan-500 to-green-500 shadow-2xl">
                <TrendingUp className="h-6 w-6 text-white drop-shadow-lg" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
                  Cross-Domain Correlations
                </h2>
                <p className="text-sm text-slate-400 mt-1 font-medium">
                  Discover relationships between different policy domains
                </p>
              </div>
            </div>
            
            {/* Enhanced Correlation Tab Switcher */}
            <div className="flex rounded-xl overflow-hidden border border-slate-600/50 bg-slate-800/40 backdrop-blur-sm shadow-lg">
              <button
                onClick={() => setCorrelationTab("impact")}
                className={`flex items-center gap-3 px-6 py-3 text-sm font-semibold transition-all duration-500 relative overflow-hidden ${
                  correlationTab === "impact"
                    ? "bg-gradient-to-r from-purple-500 via-cyan-500 to-yellow-500 text-white shadow-2xl"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/60"
                }`}
                style={{
                  boxShadow: correlationTab === "impact" ? "0 0 20px rgba(168,85,247,0.5)" : undefined
                }}
              >
                {correlationTab === "impact" && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-30 animate-pulse"></div>
                )}
                <TrendingUp size={16} className="relative z-10" />
                <span className="relative z-10">Impact Analysis</span>
              </button>
              <button
                onClick={() => setCorrelationTab("matrix")}
                className={`flex items-center gap-3 px-6 py-3 text-sm font-semibold transition-all duration-500 relative overflow-hidden ${
                  correlationTab === "matrix"
                    ? "bg-gradient-to-r from-cyan-500 via-blue-500 to-green-500 text-white shadow-2xl"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/60"
                }`}
                style={{
                  boxShadow: correlationTab === "matrix" ? "0 0 20px rgba(34,197,94,0.5)" : undefined
                }}
              >
                {correlationTab === "matrix" && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-30 animate-pulse"></div>
                )}
                <Grid3X3 size={16} className="relative z-10" />
                <span className="relative z-10">Correlation Matrix</span>
              </button>
            </div>
          </div>
        </div>

        <div className="relative p-8">
          <div className="relative rounded-xl bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-slate-700/50 overflow-hidden backdrop-blur-sm">
            {/* Holographic grid overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_0%,rgba(34,197,94,0.3)_50%,transparent_100%)] animate-pulse"></div>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={correlationTab}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.95 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="relative z-10"
              >
                {isLoading ? (
                  <div className="h-[300px] flex items-center justify-center bg-slate-800/30 rounded-lg border border-dashed border-slate-600/50">
                    <div className="text-center space-y-4">
                      <div className="relative">
                        <div className="animate-spin h-12 w-12 border-3 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                        <div className="absolute inset-0 animate-ping h-12 w-12 border-2 border-purple-400 rounded-full mx-auto opacity-30"></div>
                      </div>
                      <p className="text-slate-300 font-medium">Loading correlation data...</p>
                    </div>
                  </div>
                ) : (
                  correlationTab === "impact" ? <CorrelationChart /> : <CorrelationMatrix />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  )
}