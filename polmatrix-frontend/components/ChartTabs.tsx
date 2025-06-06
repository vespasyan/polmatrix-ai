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
}

const tabConfig = [
  { 
    key: "economy", 
    label: "Economy", 
    color: "#3B82F6",
    gradient: "from-blue-500 to-blue-600",
    icon: BarChart3,
    description: "Economic indicators and growth metrics"
  },
  { 
    key: "education", 
    label: "Education", 
    color: "#06B6D4",
    gradient: "from-cyan-500 to-cyan-600", 
    icon: GraduationCap,
    description: "Educational outcomes and access metrics"
  },
  { 
    key: "environment", 
    label: "Environment", 
    color: "#22C55E",
    gradient: "from-green-500 to-green-600",
    icon: Leaf,
    description: "Environmental sustainability and impact"
  },
  { 
    key: "health", 
    label: "Health", 
    color: "#EF4444",
    gradient: "from-red-500 to-red-600",
    icon: Heart,
    description: "Health outcomes and healthcare access"
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
  isLoading = false
}: Props) {
  const [activeTab, setActiveTab] = useState("economy")
  const [hoveredTab, setHoveredTab] = useState<string | null>(null)

  const renderChart = () => {
    if (isLoading) {
      return (
        <div className="h-[400px] flex items-center justify-center bg-[var(--input-bg)] rounded-lg border border-dashed border-[var(--border-color)]">
          <div className="text-center space-y-3">
            <div className="animate-spin h-8 w-8 border-2 border-[var(--accent-color)] border-t-transparent rounded-full mx-auto"></div>
            <p className="text-[var(--text-secondary)]">Loading chart data...</p>
          </div>
        </div>
      )
    }

    switch (activeTab) {
      case "economy":
        return <EconomyChart data={economyData} selectedMetrics={economyMetrics} onToggleMetric={onToggleEconomy} />
      case "education":
        return <EducationChart data={educationData} selectedMetrics={educationMetrics} onToggleMetric={onToggleEducation} />
      case "environment":
        return <EnvironmentChart data={environmentData} selectedMetrics={environmentMetrics} onToggleMetric={onToggleEnvironment} />
      case "health":
        return <HealthChart data={healthData} selectedMetrics={healthMetrics} onToggleMetric={onToggleHealth} />
      default:
        return <EconomyChart data={economyData} selectedMetrics={economyMetrics} onToggleMetric={onToggleEconomy} />
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
      <div className="rounded-xl shadow-lg bg-[var(--card-bg)] border border-[var(--border-color)] overflow-hidden">
        {/* Enhanced Tabs Header */}
        <div className="bg-gradient-to-r from-[var(--card-bg)] to-[var(--input-bg)] px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Policy Impact Analysis</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Explore cross-domain impacts and correlations
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-[var(--text-secondary)]">Active Domain</div>
              <div className="font-semibold text-[var(--text-primary)] capitalize">{activeTab}</div>
            </div>
          </div>

          {/* Enhanced Tab Navigation */}
          <div className="flex gap-2 relative">
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
                  className={`relative flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 group ${
                    isActive
                      ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg transform translate-y-[-2px]`
                      : "bg-[var(--input-bg)] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)] hover:shadow-md"
                  }`}
                  style={{
                    boxShadow: isActive ? `0 8px 25px -8px ${tab.color}40` : undefined
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Icon 
                      size={16} 
                      className={`transition-all duration-300 ${
                        isActive ? 'scale-110' : 'group-hover:scale-105'
                      }`}
                    />
                    <span>{tab.label}</span>
                  </div>
                  
                  {/* Metric count indicator */}
                  {metricCount > 0 && (
                    <div className={`absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs flex items-center justify-center font-semibold ${
                      isActive 
                        ? 'bg-white text-gray-700' 
                        : 'bg-[var(--accent-color)] text-white'
                    }`}>
                      {metricCount}
                    </div>
                  )}

                  {/* Hover tooltip */}
                  {isHovered && !isActive && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 z-10 px-3 py-1 bg-[var(--tooltip-bg)] text-[var(--text-primary)] text-xs rounded-lg shadow-lg border border-[var(--border-color)] whitespace-nowrap">
                      {tab.description}
                      <div className="text-[var(--text-secondary)]">
                        {dataCount} data points, {metricCount} metrics
                      </div>
                    </div>
                  )}

                  {/* Active indicator line */}
                  {isActive && (
                    <div 
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 w-8 h-1 rounded-full bg-current"
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Chart Container */}
        <div className="px-6 pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {renderChart()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Enhanced Correlations Section */}
      <div className="rounded-xl shadow-lg bg-[var(--card-bg)] border border-[var(--border-color)] overflow-hidden mt-6">
        <div className="bg-gradient-to-r from-[var(--card-bg)] to-[var(--input-bg)] px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Cross-Domain Correlations
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  Discover relationships between different policy domains
                </p>
              </div>
            </div>
            
            {/* Enhanced Correlation Tab Switcher */}
            <div className="flex rounded-lg overflow-hidden border border-[var(--border-color)] bg-[var(--input-bg)]">
              <button
                onClick={() => setCorrelationTab("impact")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  correlationTab === "impact"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)]"
                }`}
              >
                <TrendingUp size={14} />
                Impact Analysis
              </button>
              <button
                onClick={() => setCorrelationTab("matrix")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  correlationTab === "matrix"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)]"
                }`}
              >
                <Grid3X3 size={14} />
                Correlation Matrix
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={correlationTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center bg-[var(--input-bg)] rounded-lg border border-dashed border-[var(--border-color)]">
                  <div className="text-center space-y-3">
                    <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-[var(--text-secondary)]">Loading correlation data...</p>
                  </div>
                </div>
              ) : (
                correlationTab === "impact" ? <CorrelationChart /> : <CorrelationMatrix />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}