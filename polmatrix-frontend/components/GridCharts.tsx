"use client"

import EconomyChart from "./EconomyChart"
import EducationChart from "./EducationChart"
import EnvironmentChart from "./EnvironmentChart"
import HealthChart from "./HealthChart"
import CorrelationChart from "./CorrelationChart"
import CorrelationMatrix from "./CorrelationMatrix"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, Grid3X3, BarChart3, GraduationCap, Leaf, Heart } from "lucide-react"

type GridChartsProps = {
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

export default function GridCharts({
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
}: GridChartsProps) {

  // Loading skeleton component
  const ChartSkeleton = ({ icon: Icon, title, color }: { icon: any, title: string, color: string }) => (
    <div className="p-6 rounded-xl shadow-lg bg-[var(--card-bg)] border border-[var(--border-color)] animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <div className="h-6 bg-[var(--input-bg)] rounded w-32"></div>
      </div>
      <div className="h-[300px] bg-[var(--input-bg)] rounded-lg flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-transparent rounded-full mx-auto" style={{ borderTopColor: color }}></div>
          <p className="text-sm text-[var(--text-secondary)]">Loading {title.toLowerCase()} data...</p>
        </div>
      </div>
    </div>
  )

  const chartConfigs = [
    {
      component: EconomyChart,
      data: economyData,
      metrics: economyMetrics,
      onToggle: onToggleEconomy,
      icon: BarChart3,
      title: "Economy",
      color: "#3B82F6",
      delay: 0
    },
    {
      component: EducationChart,
      data: educationData,
      metrics: educationMetrics,
      onToggle: onToggleEducation,
      icon: GraduationCap,
      title: "Education",
      color: "#06B6D4",
      delay: 0.1
    },
    {
      component: EnvironmentChart,
      data: environmentData,
      metrics: environmentMetrics,
      onToggle: onToggleEnvironment,
      icon: Leaf,
      title: "Environment",
      color: "#22C55E",
      delay: 0.2
    },
    {
      component: HealthChart,
      data: healthData,
      metrics: healthMetrics,
      onToggle: onToggleHealth,
      icon: Heart,
      title: "Health",
      color: "#EF4444",
      delay: 0.3
    }
  ]

  return (
    <div className="space-y-6">
      {/* Grid Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
            <Grid3X3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              Multi-Domain Analysis Grid
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Comprehensive view across all policy domains
            </p>
          </div>
        </div>
        
        {/* Data Status Indicators */}
        <div className="flex items-center gap-4 text-xs">
          {chartConfigs.map(({ title, data, metrics, color }) => (
            <div key={title} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: data?.length > 0 ? color : '#d1d5db' }}
              />
              <span className="text-[var(--text-secondary)]">
                {title}: {data?.length || 0} records, {metrics?.length || 0} metrics
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartConfigs.map(({ component: ChartComponent, data, metrics, onToggle, icon, title, color, delay }) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="w-full"
          >
            {isLoading ? (
              <ChartSkeleton icon={icon} title={title} color={color} />
            ) : (
              <ChartComponent
                data={data}
                selectedMetrics={metrics}
                onToggleMetric={onToggle}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Enhanced Correlations Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-full"
      >
        <div className="rounded-xl shadow-lg bg-[var(--card-bg)] border border-[var(--border-color)] overflow-hidden">
          {/* Correlation Header */}
          <div className="bg-gradient-to-r from-[var(--card-bg)] to-[var(--input-bg)] px-6 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-yellow-500">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    Cross-Domain Correlations
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Discover relationships between different policy domains
                  </p>
                </div>
              </div>
              
              {/* Enhanced Tab Switcher */}
              <div className="flex rounded-lg overflow-hidden border border-[var(--border-color)] bg-[var(--input-bg)]">
                <button
                  onClick={() => setCorrelationTab("impact")}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    correlationTab === "impact"
                      ? "bg-gradient-to-r from-blue-500 to-yellow-500 text-white shadow-lg"
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
                      ? "bg-gradient-to-r from-blue-500 to-yellow-500 text-white shadow-lg"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)]"
                  }`}
                >
                  <Grid3X3 size={14} />
                  Correlation Matrix
                </button>
              </div>
            </div>
          </div>

          {/* Correlation Content */}
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
                  <div className="h-[400px] bg-[var(--input-bg)] rounded-lg border border-dashed border-[var(--border-color)] flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                      <p className="text-[var(--text-secondary)]">
                        Loading correlation analysis...
                      </p>
                    </div>
                  </div>
                ) : (
                  correlationTab === "impact" ? <CorrelationChart /> : <CorrelationMatrix />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Grid Summary Stats */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {chartConfigs.map(({ title, data, metrics, color }) => (
            <div key={title} className="bg-[var(--card-bg)] p-4 rounded-lg border border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">{title}</p>
                  <p className="text-lg font-bold text-[var(--text-primary)]">
                    {data?.length || 0}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {metrics?.length || 0} active metrics
                  </p>
                </div>
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: color }}
                />
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}