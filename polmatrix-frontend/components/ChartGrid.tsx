"use client"

import React from "react"
import EconomyChart from "./EconomyChart"
import EducationChart from "./EducationChart"
import EnvironmentChart from "./EnvironmentChart"
import HealthChart from "./HealthChart"
import CorrelationChart from "./CorrelationChart"
import CorrelationMatrix from "./CorrelationMatrix"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, Grid3X3, BarChart3, GraduationCap, Leaf, Heart } from "lucide-react"
import { sign } from "crypto"
import { pivotSimulationData } from "@/lib/chartTransforms";

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
  simulatedData: any[]
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
  isLoading = false,
  simulatedData,
}: GridChartsProps) {
  // Pivot the simulated data for economy chart
  // This assumes simulatedData is structured similarly to the economy data
  //Sample Questions...
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

  // Futuristic Loading skeleton component
  const ChartSkeleton = ({ icon: Icon, title, color }: { icon: any, title: string, color: string }) => (
    <div className="p-6 rounded-2xl shadow-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-slate-700/50 overflow-hidden backdrop-blur-xl relative">
      {/* Futuristic background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      
      {/* Animated border glow */}
      <div className="absolute inset-0 rounded-2xl opacity-60">
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-pink-500/30 animate-pulse"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-r from-slate-700 to-slate-600 shadow-lg">
            <Icon className="h-6 w-6 text-slate-300" />
          </div>
          <div className="h-6 bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg w-32 animate-pulse"></div>
        </div>
        <div className="h-[300px] bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-xl border border-dashed border-slate-600/50 flex items-center justify-center backdrop-blur-sm">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="animate-spin h-12 w-12 border-3 border-t-transparent rounded-full mx-auto" style={{ borderColor: `${color}40`, borderTopColor: color }}></div>
              <div className="absolute inset-0 animate-ping h-12 w-12 border-2 rounded-full mx-auto opacity-30" style={{ borderColor: `${color}60` }}></div>
            </div>
            <p className="text-slate-300 font-medium">Loading {title.toLowerCase()} data...</p>
            <div className="flex justify-center gap-1">
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: color }}></div>
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: color, animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: color, animationDelay: '0.2s' }}></div>
            </div>
          </div>
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
      simulationData: economy,
      icon: BarChart3,
      title: "Economy",
      color: "#00D4FF",
      gradient: "from-cyan-400 via-blue-500 to-indigo-600",
      neonShadow: "0 0 20px #00D4FF40, 0 0 40px #00D4FF20",
      delay: 0
    },
    {
      component: EducationChart,
      data: educationData,
      metrics: educationMetrics,
      onToggle: onToggleEducation,
      simulationData: education,
      icon: GraduationCap,
      title: "Education",
      color: "#8B5CF6",
      gradient: "from-purple-400 via-violet-500 to-purple-600",
      neonShadow: "0 0 20px #8B5CF640, 0 0 40px #8B5CF620",
      delay: 0.1
    },
    {
      component: EnvironmentChart,
      data: environmentData,
      metrics: environmentMetrics,
      onToggle: onToggleEnvironment,
      simulationData: environment,
      icon: Leaf,
      title: "Environment",
      color: "#10B981",
      gradient: "from-emerald-400 via-green-500 to-teal-600",
      neonShadow: "0 0 20px #10B98140, 0 0 40px #10B98120",
      delay: 0.2
    },
    {
      component: HealthChart,
      data: healthData,
      metrics: healthMetrics,
      onToggle: onToggleHealth,
      simulationData: health,
      icon: Heart,
      title: "Health",
      color: "#F59E0B",
      gradient: "from-yellow-400 via-orange-500 to-red-600",
      neonShadow: "0 0 20px #F59E0B40, 0 0 40px #F59E0B20",
      delay: 0.3
    }
  ]

  return (
    <div className="space-y-8">
      {/* Futuristic Grid Header */}
      <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-slate-700/50 overflow-hidden backdrop-blur-xl relative p-8">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-cyan-500/5 to-green-500/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(168,85,247,0.1),transparent_50%)]"></div>
        
        {/* Animated border */}
        <div className="absolute inset-0 rounded-2xl opacity-60">
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-purple-500/30 via-cyan-500/30 to-green-500/30 animate-pulse"></div>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500 via-cyan-500 to-green-500 shadow-2xl">
              <Grid3X3 className="h-7 w-7 text-white drop-shadow-lg" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
                Multi-Domain Analysis Grid
              </h2>
              <p className="text-slate-400 mt-1 font-medium">
                Comprehensive view across all policy domains
              </p>
            </div>
          </div>
          
          {/* Futuristic Data Status Indicators */}
          <div className="flex flex-wrap items-center gap-6 text-sm">
            {chartConfigs.map(({ title, data, metrics, color, gradient }) => (
              <div key={title} className="flex items-center gap-3 group">
                <div className="relative">
                  <div 
                    className="w-4 h-4 rounded-full shadow-lg transition-all duration-300 group-hover:scale-110" 
                    style={{ 
                      backgroundColor: data?.length > 0 ? color : '#64748b',
                      boxShadow: data?.length > 0 ? `0 0 10px ${color}40` : 'none'
                    }}
                  />
                  {data?.length > 0 && (
                    <div className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ backgroundColor: color }}></div>
                  )}
                </div>
                <div className="text-slate-300 font-medium">
                  <span className="text-white">{title}:</span> {data?.length || 0} records
                  <div className="text-xs text-slate-400">{metrics?.length || 0} active metrics</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Futuristic Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {chartConfigs.map(({ component: ChartComponent, data, metrics, onToggle, simulationData, icon, title, color, gradient, neonShadow, delay }) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay, ease: "easeOut" }}
            className="w-full"
          >
            {isLoading ? (
              <ChartSkeleton icon={icon} title={title} color={color} />
            ) : (
              <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-slate-700/50 overflow-hidden backdrop-blur-xl relative group">
                {/* Background effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
                
                {/* Animated border glow */}
                <div className="absolute inset-0 rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                  <div className={`absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r ${gradient} opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>
                </div>

                {/* Chart header */}
                <div className="relative z-10 p-6 pb-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient} shadow-lg`} style={{ boxShadow: neonShadow }}>
                      {React.createElement(icon, { className: "h-6 w-6 text-white drop-shadow-lg" })}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{title}</h3>
                      <p className="text-sm text-slate-400">{data?.length || 0} data points • {metrics?.length || 0} metrics</p>
                    </div>
                  </div>
                </div>

                {/* Chart container */}
                <div className="relative z-10 px-6 pb-6">
                  <div className="relative rounded-xl bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-slate-700/50 overflow-hidden backdrop-blur-sm">
                    {/* Holographic grid overlay */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(59,130,246,0.3)_50%,transparent_100%)] animate-pulse"></div>
                    </div>
                    
                    <div className="relative z-10">
                      <ChartComponent
                        data={data}
                        selectedMetrics={metrics}
                        onToggleMetric={onToggle}
                        simulationData={simulationData}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Enhanced Futuristic Correlations Section */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
        className="w-full"
      >
        <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-slate-700/50 overflow-hidden backdrop-blur-xl relative">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-cyan-500/5 to-green-500/5"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(34,197,94,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.1),transparent_50%)]"></div>
          
          {/* Animated border */}
          <div className="absolute inset-0 rounded-2xl opacity-60">
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-purple-500/30 via-cyan-500/30 to-green-500/30 animate-pulse"></div>
          </div>

          {/* Correlation Header */}
          <div className="relative bg-gradient-to-r from-slate-900/50 to-slate-800/50 px-8 py-6 backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 via-cyan-500 to-green-500 shadow-2xl">
                  <TrendingUp className="h-6 w-6 text-white drop-shadow-lg" />
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
                    Cross-Domain Correlations
                  </h3>
                  <p className="text-slate-400 mt-1 font-medium">
                    Discover relationships between different policy domains
                  </p>
                </div>
              </div>
              
              {/* Enhanced Futuristic Tab Switcher */}
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

          {/* Correlation Content */}
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
                    <div className="h-[400px] bg-slate-800/30 rounded-xl border border-dashed border-slate-600/50 flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="relative">
                          <div className="animate-spin h-12 w-12 border-3 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                          <div className="absolute inset-0 animate-ping h-12 w-12 border-2 border-purple-400 rounded-full mx-auto opacity-30"></div>
                        </div>
                        <p className="text-slate-300 font-medium">
                          Loading correlation analysis...
                        </p>
                        <div className="flex justify-center gap-1">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
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
      </motion.div>

      {/* Futuristic Grid Summary Stats */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {chartConfigs.map(({ title, data, metrics, color, gradient, neonShadow }) => (
            <div key={title} className="rounded-2xl shadow-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-slate-700/50 overflow-hidden backdrop-blur-xl relative group hover:scale-105 transition-all duration-500">
              {/* Background effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5"></div>
              <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              {/* Animated border glow */}
              <div className="absolute inset-0 rounded-2xl opacity-40 group-hover:opacity-80 transition-opacity duration-500">
                <div className={`absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r ${gradient} opacity-20`}></div>
              </div>

              <div className="relative z-10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
                    <p className="text-2xl font-bold text-white mt-2">
                      {data?.length || 0}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {metrics?.length || 0} active metrics
                    </p>
                  </div>
                  <div className="relative">
                    <div 
                      className="w-6 h-6 rounded-full shadow-lg transition-all duration-300 group-hover:scale-110" 
                      style={{ 
                        backgroundColor: color,
                        boxShadow: neonShadow
                      }}
                    />
                    <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: color }}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}