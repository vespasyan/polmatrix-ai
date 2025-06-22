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
import { Share2, Download, BarChart2, LineChart as LineChartIcon, AreaChart as AreaChartIcon, Check, Info, BarChart3 } from 'lucide-react'
import { metricsConfig } from "@/lib/metricsConfig"

type ChartType = "bar" | "line" | "area"

type Props = {
  data: any[]
  selectedMetrics: string[]
  onToggleMetric: (metric: string) => void
}

const generateColor = (index: number) => {
  const colors = [
    "#3B82F6", "#06B6D4", "#10B981", "#F59E0B", 
    "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6"
  ]
  return colors[index % colors.length]
}

// Generate metric config with colors and descriptions from metricsConfig
const metricMap: Record<string, { label: string; color: string; description: string; unit: string }> = Object.fromEntries(
  metricsConfig.economy.map((metric, index) => [
    metric.key,
    {
      label: metric.label,
      color: generateColor(index),
      description: `${metric.category} - ${metric.label}`,
      unit: metric.unit
    }
  ])
)

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--card-bg)] p-4 rounded-lg shadow-xl border border-[var(--border-color)] backdrop-blur-sm">
        <p className="font-semibold text-[var(--text-primary)] mb-2">{label}</p>
        {payload.map((entry, index) => {
          const metricKey = entry.dataKey as string
          const metricConfig = metricMap[metricKey]
          return (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-[var(--text-secondary)] text-sm">
                {metricConfig?.label || metricKey}:
              </span>
              <span className="font-medium text-[var(--text-primary)]">
                {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
                {metricConfig?.unit && ` ${metricConfig.unit}`}
              </span>
            </div>
          )
        })}
      </div>
    )
  }
  return null
}

export default function EconomyChart({
  data,
  selectedMetrics,
  onToggleMetric
}: Props) {
  const [chartType, setChartType] = useState<ChartType>("line")
  const [isExporting, setIsExporting] = useState(false)
  const chartRef = useRef<HTMLDivElement>(null)

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Economy Chart',
          text: 'Check out this economy data visualization',
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
      // You can implement chart export functionality here
      // For now, we'll just simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Chart exported successfully')
    } catch (error) {
      console.error('Error exporting chart:', error)
    } finally {
      setIsExporting(false)
    }
  }, [])

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
      strokeWidth: 2,
      dot: { strokeWidth: 2, r: 4 },
      activeDot: { r: 6, strokeWidth: 0 }
    }

    switch (chartType) {
      case "bar":
        return (
          <BarChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.9} />
            <XAxis 
              dataKey="year" 
              stroke="var(--text-secondary)"
              fontSize={12}
              tickLine={{ stroke: "var(--border-color)" }}
            />
            <YAxis 
              stroke="var(--text-secondary)"
              fontSize={12}
              tickLine={{ stroke: "var(--border-color)" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                paddingTop: "20px",
                fontSize: "12px",
                color: "var(--text-secondary)"
              }}
            />            {selectedMetrics.map((metric, index) => (
              <Bar 
                key={metric}
                dataKey={metric} 
                fill={generateColor(index)}
                name={metricMap[metric]?.label || metric}
                radius={[2, 2, 0, 0]}
              />
            ))}
          </BarChart>
        )
      case "area":
        return (
          <AreaChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
            <XAxis 
              dataKey="year" 
              stroke="var(--text-secondary)"
              fontSize={12}
              tickLine={{ stroke: "var(--border-color)" }}
            />
            <YAxis 
              stroke="var(--text-secondary)"
              fontSize={12}
              tickLine={{ stroke: "var(--border-color)" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                paddingTop: "20px",
                fontSize: "12px",
                color: "var(--text-secondary)"
              }}
            />            {selectedMetrics.map((metric, index) => (
              <Area 
                key={metric}
                type="monotone"
                dataKey={metric} 
                stroke={generateColor(index)}
                fill={generateColor(index)}
                fillOpacity={0.3}
                name={metricMap[metric]?.label || metric}
                {...commonProps}
              />
            ))}
          </AreaChart>
        )
      default:
        return (
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
            <XAxis 
              dataKey="year" 
              stroke="var(--text-secondary)"
              fontSize={12}
              tickLine={{ stroke: "var(--border-color)" }}
            />
            <YAxis 
              stroke="var(--text-secondary)"
              fontSize={12}
              tickLine={{ stroke: "var(--border-color)" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                paddingTop: "20px",
                fontSize: "12px",
                color: "var(--text-secondary)"
              }}
            />            {selectedMetrics.map((metric, index) => (
              <Line 
                key={metric}
                type="monotone"
                dataKey={metric} 
                stroke={generateColor(index)}
                name={metricMap[metric]?.label || metric}
                {...commonProps}
              />
            ))}
          </LineChart>
        )
    }
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-[var(--input-bg)] rounded-lg border border-dashed border-[var(--border-color)]">
        <div className="text-center space-y-3">
          <BarChart3 className="h-12 w-12 text-[var(--text-secondary)] mx-auto opacity-50" />
          <div>
            <p className="text-[var(--text-primary)] font-medium">No Economy Data Available</p>
            <p className="text-[var(--text-secondary)] text-sm">Economy metrics will appear here once data is loaded</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[var(--input-bg)] rounded-lg border border-[var(--border-color)]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold text-[var(--text-primary)]">Economy Analysis</h3>
          </div>
          <div className="text-sm text-[var(--text-secondary)]">
            {selectedMetrics.length} metrics • {data.length} data points
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Chart Type Selector */}
          <div className="flex rounded-lg overflow-hidden border border-[var(--border-color)]">
            {Object.entries(chartTypeConfig).map(([type, config]) => {
              const Icon = config.icon
              return (
                <button
                  key={type}
                  onClick={() => setChartType(type as ChartType)}
                  className={`p-2 transition-all duration-200 ${
                    chartType === type
                      ? "bg-blue-500 text-white"
                      : "bg-[var(--card-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)]"
                  }`}
                  title={config.description}
                >
                  <Icon size={16} />
                </button>
              )
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)] transition-all duration-200"
              title="Share chart"
            >
              <Share2 size={16} />
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)] transition-all duration-200 disabled:opacity-50"
              title="Export chart"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Selection */}
      <div className="p-4 bg-[var(--input-bg)] rounded-lg border border-[var(--border-color)]">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-[var(--text-primary)]">Available Metrics</span>
          <span className="text-xs text-[var(--text-secondary)]">Click to toggle visibility</span>
        </div>        <div className="flex flex-wrap gap-2">
          {Object.entries(metricMap).map(([key, metric]) => {
            const isSelected = selectedMetrics.includes(key)
            return (
              <button
                key={key}
                onClick={() => onToggleMetric(key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isSelected
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-[var(--card-bg)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)]"
                }`}
              >
                {isSelected && <Check size={14} />}
                <span>{metric.label}</span>
                {metric.unit && (
                  <span className={`text-xs ${isSelected ? 'text-blue-100' : 'text-[var(--text-secondary)]'}`}>
                    ({metric.unit})
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Chart */}
      <div 
        ref={chartRef}
        className="h-[400px] p-4 bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)]"
      >
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
