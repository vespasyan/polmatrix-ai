"use client"

import React, { useState, useRef, useCallback } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from "recharts"
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"
import { Share2, Download, BarChart2, LineChart as LineChartIcon, AreaChart as AreaChartIcon, Check, Info, Leaf, ChevronDown, ChevronUp, TreePine, Activity, TrendingUp, Eye, EyeOff, Maximize2, Settings, Play, Pause, Sprout, Globe, Recycle } from 'lucide-react'
import { metricsConfig } from "@/lib/metricsConfig"

type ChartType = "bar" | "line" | "area"

type Props = {
  data: any[]
  selectedMetrics: string[]
  onToggleMetric: (metric: string) => void
}

const generateColor = (index: number) => {
  const colors = [
    "#10B981", "#22C55E", "#84CC16", "#65A30D", 
    "#16A34A", "#15803D", "#047857", "#059669",
    "#0D9488", "#0F766E", "#14B8A6", "#5EEAD4",
    "#6EE7B7", "#86EFAC", "#BBF7D0", "#34D399"
  ]
  return colors[index % colors.length]
}

// Generate metric config with colors and descriptions from metricsConfig
const metricMap: Record<string, { label: string; color: string; description: string; unit: string }> = Object.fromEntries(
  metricsConfig.environment.map((metric, index) => [
    metric.key,
    {
      label: metric.label,
      color: generateColor(index),
      description: `${metric.category} - ${metric.label}`,
      unit: metric.unit
    }
  ])
)

// Custom Tooltip Component with enhanced UX
const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-green-500/30 relative overflow-hidden">
        {/* Glowing border effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 blur-xl"></div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <p className="font-bold text-white text-lg tracking-wide">{label}</p>
          </div>
          {payload.map((entry, index) => {
            const metricKey = entry.dataKey as string
            const metricConfig = metricMap[metricKey]
            return (
              <div key={index} className="flex items-center gap-3 mb-2 last:mb-0">
                <div 
                  className="w-4 h-4 rounded-full shadow-lg animate-pulse" 
                  style={{ backgroundColor: entry.color, boxShadow: `0 0 10px ${entry.color}` }}
                />
                <span className="text-gray-300 text-sm font-medium min-w-0 flex-1">
                  {metricConfig?.label || metricKey}:
                </span>
                <span className="font-bold text-white text-sm bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
                  {metricConfig?.unit && ` ${metricConfig.unit}`}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  return null
}

export default function EnvironmentChart({ data, selectedMetrics, onToggleMetric }: Props) {
  const [chartType, setChartType] = useState<ChartType>("line")
  const [isExporting, setIsExporting] = useState(false)
  const [isMetricsExpanded, setIsMetricsExpanded] = useState(false)
  const [isAnimating, setIsAnimating] = useState(true)
  const [showAdvancedControls, setShowAdvancedControls] = useState(false)
  const chartRef = useRef<HTMLDivElement>(null)

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Environment Chart',
          text: 'Check out this environment data visualization',
          url: window.location.href,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      } catch (error) {
        console.error('Error copying to clipboard:', error)
      }
    }
  }, [])

  const handleExport = useCallback(async () => {
    if (!chartRef.current) return
    
    setIsExporting(true)
    try {
      // Download CSV functionality
      const headers = ["label", ...selectedMetrics]
      const csvRows = [
        headers.join(","),
        ...data.map(row => {
          const values = headers.map(header => {
            const value = row[header]
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
          })
          return values.join(",")
        })
      ]

      const csvString = csvRows.join("\n")
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement("a")
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", "environment_data.csv")
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        setTimeout(() => {
          URL.revokeObjectURL(url)
        }, 100)
      }
    } catch (error) {
      console.error('Error exporting chart:', error)
    } finally {
      setIsExporting(false)
    }
  }, [data, selectedMetrics])

  const chartTypeConfig = {
    bar: { 
      icon: BarChart2, 
      label: "Bar Chart",
      description: "Compare values across categories"
    },
    line: { 
      icon: LineChartIcon, 
      label: "Line Chart",
      description: "Show trends over time"
    },
    area: { 
      icon: AreaChartIcon, 
      label: "Area Chart",
      description: "Visualize cumulative data"
    }
  }

  const renderChart = () => {
    const chartProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    }

    const commonProps = {
      strokeWidth: 3,
      dot: { 
        strokeWidth: 2, 
        r: 5,
        fill: '#fff',
        stroke: '#10B981',
        filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.6))'
      },
      activeDot: { 
        r: 8, 
        strokeWidth: 0,
        fill: '#10B981',
        filter: 'drop-shadow(0 0 12px rgba(16, 185, 129, 0.8))'
      }
    }

    switch (chartType) {
      case "bar":
        return (
          <BarChart {...chartProps}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#047857" stopOpacity="0.9"/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(16, 185, 129, 0.2)" 
              opacity={0.5}
            />
            <XAxis 
              dataKey="label" 
              stroke="#10B981"
              fontSize={12}
              fontWeight="600"
              tickLine={{ stroke: "#10B981", strokeWidth: 1 }}
              axisLine={{ stroke: "#10B981", strokeWidth: 1 }}
              tickFormatter={value => {
                // Extract year from label like "United States 2023" -> "2023"
                const yearMatch = value?.toString().match(/\d{4}$/)
                return yearMatch ? yearMatch[0] : value
              }}
            />
            <YAxis 
              stroke="#10B981"
              fontSize={12}
              fontWeight="600"
              tickLine={{ stroke: "#10B981", strokeWidth: 1 }}
              axisLine={{ stroke: "#10B981", strokeWidth: 1 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                paddingTop: "20px",
                fontSize: "12px",
                color: "#10B981",
                fontWeight: "600"
              }}
            />
            {selectedMetrics.map((metric, index) => (
              <Bar 
                key={metric}
                dataKey={metric} 
                fill={generateColor(index)}
                name={metricMap[metric]?.label || metric}
                radius={[4, 4, 0, 0]}
                style={{
                  filter: `drop-shadow(0 0 8px ${generateColor(index)}40)`
                }}
              />
            ))}
          </BarChart>
        )
      case "area":
        return (
          <AreaChart {...chartProps}>
            <defs>
              {selectedMetrics.map((metric, index) => (
                <linearGradient key={metric} id={`areaGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={generateColor(index)} stopOpacity="0.8"/>
                  <stop offset="100%" stopColor={generateColor(index)} stopOpacity="0.1"/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(16, 185, 129, 0.2)" 
              opacity={0.5}
            />
            <XAxis 
              dataKey="label" 
              stroke="#10B981"
              fontSize={12}
              fontWeight="600"
              tickLine={{ stroke: "#10B981", strokeWidth: 1 }}
              axisLine={{ stroke: "#10B981", strokeWidth: 1 }}
              tickFormatter={value => {
                // Extract year from label like "United States 2023" -> "2023"
                const yearMatch = value?.toString().match(/\d{4}$/)
                return yearMatch ? yearMatch[0] : value
              }}
            />
            <YAxis 
              stroke="#10B981"
              fontSize={12}
              fontWeight="600"
              tickLine={{ stroke: "#10B981", strokeWidth: 1 }}
              axisLine={{ stroke: "#10B981", strokeWidth: 1 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                paddingTop: "20px",
                fontSize: "12px",
                color: "#10B981",
                fontWeight: "600"
              }}
            />
            {selectedMetrics.map((metric, index) => (
              <Area 
                key={metric}
                type="monotone"
                dataKey={metric} 
                stroke={generateColor(index)}
                fill={`url(#areaGradient-${index})`}
                name={metricMap[metric]?.label || metric}
                strokeWidth={3}
                style={{
                  filter: `drop-shadow(0 0 8px ${generateColor(index)}40)`
                }}
                dot={{ 
                  strokeWidth: 2, 
                  r: 4,
                  fill: '#fff',
                  stroke: generateColor(index),
                  filter: `drop-shadow(0 0 6px ${generateColor(index)}60)`
                }}
                activeDot={{ 
                  r: 7, 
                  strokeWidth: 0,
                  fill: generateColor(index),
                  filter: `drop-shadow(0 0 12px ${generateColor(index)}80)`
                }}
              />
            ))}
          </AreaChart>
        )
      default:
        return (
          <LineChart {...chartProps}>
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10B981" stopOpacity="1"/>
                <stop offset="100%" stopColor="#22C55E" stopOpacity="1"/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(16, 185, 129, 0.2)" 
              opacity={0.5}
            />
            <XAxis 
              dataKey="label" 
              stroke="#10B981"
              fontSize={12}
              fontWeight="600"
              tickLine={{ stroke: "#10B981", strokeWidth: 1 }}
              axisLine={{ stroke: "#10B981", strokeWidth: 1 }}
              tickFormatter={value => {
                // Extract year from label like "United States 2023" -> "2023"
                const yearMatch = value?.toString().match(/\d{4}$/)
                return yearMatch ? yearMatch[0] : value
              }}
            />
            <YAxis 
              stroke="#10B981"
              fontSize={12}
              fontWeight="600"
              tickLine={{ stroke: "#10B981", strokeWidth: 1 }}
              axisLine={{ stroke: "#10B981", strokeWidth: 1 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                paddingTop: "20px",
                fontSize: "12px",
                color: "#10B981",
                fontWeight: "600"
              }}
            />
            {selectedMetrics.map((metric, index) => (
              <Line 
                key={metric}
                type="monotone"
                dataKey={metric} 
                stroke={generateColor(index)}
                name={metricMap[metric]?.label || metric}
                strokeWidth={3}
                style={{
                  filter: `drop-shadow(0 0 8px ${generateColor(index)}40)`
                }}
                dot={{ 
                  strokeWidth: 2, 
                  r: 5,
                  fill: '#fff',
                  stroke: generateColor(index),
                  filter: `drop-shadow(0 0 6px ${generateColor(index)}60)`
                }}
                activeDot={{ 
                  r: 8, 
                  strokeWidth: 0,
                  fill: generateColor(index),
                  filter: `drop-shadow(0 0 12px ${generateColor(index)}80)`
                }}
              />
            ))}
          </LineChart>
        )
    }
  }

  if (!data || data.length === 0) {
    return (
      <div className="relative h-[400px] flex items-center justify-center bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-green-500/30 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 animate-pulse"></div>
        
        {/* Glowing orb effect */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl animate-pulse delay-700"></div>
        
        <div className="text-center space-y-4 relative z-10">
          <div className="relative">
            <TreePine className="h-16 w-16 text-green-400 mx-auto animate-pulse" />
            <div className="absolute inset-0 h-16 w-16 text-green-400 mx-auto animate-ping opacity-20">
              <TreePine className="h-16 w-16" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-white font-bold text-xl bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Environment Data Loading
            </p>
            <p className="text-gray-400 text-sm">
              Sustainability metrics will appear here once data is loaded
            </p>
          </div>
          <div className="flex justify-center">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <div className="relative flex flex-wrap items-center justify-between gap-4 p-6 bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-xl rounded-2xl border border-green-500/30 overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 animate-pulse"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Globe className="h-6 w-6 text-green-400 animate-pulse" />
              <div className="absolute inset-0 h-6 w-6 text-green-400 animate-ping opacity-20">
                <Globe className="h-6 w-6" />
              </div>
            </div>
            <h3 className="font-bold text-xl bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Environment Matrix
            </h3>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-black/40 rounded-full border border-green-500/30">
            <Leaf className="h-4 w-4 text-green-400" />
            <span className="text-sm text-gray-300 font-medium">
              {selectedMetrics.length} active • {data.length} points
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          {/* Chart Type Selector */}
          <div className="flex rounded-xl overflow-hidden border border-green-500/30 bg-black/40 backdrop-blur-sm">
            {Object.entries(chartTypeConfig).map(([type, config]) => {
              const Icon = config.icon
              return (
                <button
                  key={type}
                  onClick={() => setChartType(type as ChartType)}
                  className={`p-3 transition-all duration-300 relative group ${
                    chartType === type
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                      : "text-gray-400 hover:text-green-400 hover:bg-green-500/10"
                  }`}
                  title={config.description}
                >
                  <Icon size={18} className={chartType === type ? "animate-pulse" : ""} />
                  {chartType === type && (
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse opacity-20 rounded"></div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Advanced Controls Toggle */}
          <button
            onClick={() => setShowAdvancedControls(!showAdvancedControls)}
            className="p-3 rounded-xl bg-black/40 border border-green-500/30 text-gray-400 hover:text-green-400 hover:bg-green-500/10 transition-all duration-300"
            title="Advanced Controls"
          >
            <Settings size={18} className={showAdvancedControls ? "animate-spin" : ""} />
          </button>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className="p-3 rounded-xl bg-black/40 border border-green-500/30 text-gray-400 hover:text-green-400 hover:bg-green-500/10 transition-all duration-300"
              title={isAnimating ? "Pause animations" : "Resume animations"}
            >
              {isAnimating ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button
              onClick={handleShare}
              className="p-3 rounded-xl bg-black/40 border border-green-500/30 text-gray-400 hover:text-green-400 hover:bg-green-500/10 transition-all duration-300 relative group"
              title="Share analysis"
            >
              <Share2 size={18} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="p-3 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 text-green-400 hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-300 disabled:opacity-50 relative overflow-hidden"
              title="Export data"
            >
              <Download size={18} className={isExporting ? "animate-bounce" : ""} />
              {isExporting && (
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 animate-pulse"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Controls Panel */}
      {showAdvancedControls && (
        <div className="relative p-6 bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-xl rounded-2xl border border-green-500/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 animate-pulse"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Sprout className="h-5 w-5 text-green-400" />
              <h4 className="font-bold text-white">Sustainability Analytics</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-black/40 rounded-xl border border-green-500/30">
                <div className="text-sm text-gray-400 mb-1">Data Points</div>
                <div className="text-2xl font-bold text-green-400">{data.length}</div>
              </div>
              <div className="p-4 bg-black/40 rounded-xl border border-green-500/30">
                <div className="text-sm text-gray-400 mb-1">Active Metrics</div>
                <div className="text-2xl font-bold text-emerald-400">{selectedMetrics.length}</div>
              </div>
              <div className="p-4 bg-black/40 rounded-xl border border-green-500/30">
                <div className="text-sm text-gray-400 mb-1">Chart Type</div>
                <div className="text-2xl font-bold text-teal-400 capitalize">{chartType}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Selection */}
      <div className="relative bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-xl rounded-2xl border border-green-500/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 animate-pulse"></div>
        
        <button
          onClick={() => setIsMetricsExpanded(!isMetricsExpanded)}
          className="relative z-10 w-full flex items-center justify-between p-6 hover:bg-green-500/10 transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Eye className="h-5 w-5 text-green-400" />
              {isMetricsExpanded && (
                <div className="absolute inset-0 h-5 w-5 text-green-400 animate-ping opacity-20">
                  <Eye className="h-5 w-5" />
                </div>
              )}
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Eco Metrics Hub
            </span>
            <div className="flex items-center gap-2 px-3 py-1 bg-black/40 rounded-full border border-green-500/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-300">
                {Object.keys(metricMap).length} available • {selectedMetrics.length} selected
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full border-2 border-green-400 flex items-center justify-center transition-all duration-300 ${
              isMetricsExpanded ? 'bg-green-400' : 'bg-transparent'
            }`}>
              {isMetricsExpanded ? (
                <ChevronUp className="h-4 w-4 text-black" />
              ) : (
                <ChevronDown className="h-4 w-4 text-green-400" />
              )}
            </div>
          </div>
        </button>
        
        {isMetricsExpanded && (
          <div className="relative z-10 px-6 pb-6 border-t border-green-500/30">
            <div className="text-xs text-gray-400 mb-4 flex items-center gap-2">
              <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
              Interactive environmental metrics - Click to toggle visibility
            </div>
            
            {/* Group metrics by category */}
            {Object.entries(
              Object.entries(metricMap).reduce((acc, [key, metric]) => {
                const category = metric.description.split(' - ')[0] || 'Other'
                if (!acc[category]) acc[category] = []
                acc[category].push([key, metric])
                return acc
              }, {} as Record<string, Array<[string, typeof metricMap[string]]>>)
            ).map(([category, metrics]) => (
              <div key={category} className="mb-6 last:mb-0">
                <h4 className="text-sm font-bold text-green-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"></div>
                  {category}
                </h4>
                <div className="flex flex-wrap gap-3">
                  {metrics.map(([key, metric]) => {
                    const isSelected = selectedMetrics.includes(key)
                    const color = generateColor(selectedMetrics.indexOf(key))
                    return (
                      <button
                        key={key}
                        onClick={() => onToggleMetric(key)}
                        className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 overflow-hidden ${
                          isSelected
                            ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-white border border-green-500/50 shadow-lg"
                            : "bg-black/40 text-gray-400 border border-gray-700/50 hover:text-white hover:bg-gray-800/60 hover:border-green-500/30"
                        }`}
                        style={isSelected ? {
                          boxShadow: `0 0 20px ${color}20`
                        } : {}}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 animate-pulse"></div>
                        )}
                        <div className="relative z-10 flex items-center gap-2">
                          {isSelected ? (
                            <Check size={16} className="text-green-400 animate-pulse" />
                          ) : (
                            <EyeOff size={16} className="opacity-50" />
                          )}
                          <span className="text-sm">{metric.label}</span>
                          {metric.unit && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              isSelected 
                                ? 'bg-green-500/20 text-green-300' 
                                : 'bg-gray-700/50 text-gray-500'
                            }`}>
                              {metric.unit}
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="relative group">
        <div 
          ref={chartRef}
          className="relative h-[500px] p-6 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-2xl border border-green-500/30 overflow-hidden"
        >
          {/* Animated background effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 animate-pulse"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse opacity-50"></div>
          <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-green-500 to-emerald-500 animate-pulse opacity-50"></div>
          
          {/* Corner decorations */}
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-green-500/50 rounded-tr-lg"></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-green-500/50 rounded-bl-lg"></div>
          
          {/* Chart container */}
          <div className="relative z-10 h-full">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
          
          {/* Floating action button */}
          <button
            className="absolute top-4 right-16 p-2 bg-black/60 backdrop-blur-sm rounded-lg border border-green-500/30 text-green-400 hover:text-white hover:bg-green-500/20 transition-all duration-300 opacity-0 group-hover:opacity-100"
            title="Fullscreen"
          >
            <Maximize2 size={16} />
          </button>
        </div>
        
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl blur-xl -z-10 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
    </div>
  )
}