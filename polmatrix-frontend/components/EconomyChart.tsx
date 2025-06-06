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
import { Share2, Download, BarChart2, LineChart as LineChartIcon, AreaChart as AreaChartIcon, Check, Info } from 'lucide-react'
import { economyMetrics } from "@/lib/economyMetrics"

type ChartType = "bar" | "line" | "area"

type Props = {
  data: any[]
  selectedMetrics: string[]
  onToggleMetric: (metric: string) => void
}

const generateColor = (key: string) => {
  const colors = [
    "#4299e1", "#48bb78", "#f6ad55", "#ed64a6", "#9f7aea", "#f56565", "#4fd1c5", "#ed8936"
  ]
  return colors[key.length % colors.length]
}

const sampleData = [
  { label: "2020-Q1", value: 2.5 },
  { label: "2020-Q2", value: -1.2 },
  { label: "2020-Q3", value: 3.0 },
  { label: "2020-Q4", value: 1.8 },
]

// Generate metric config with descriptions
const metricMap: Record<string, { label: string; color: string; description: string }> = Object.fromEntries(
  economyMetrics.flatMap(group =>
    group.metrics.map(metric => [
      metric.key,
      {
        label: metric.label,
        color: generateColor(metric.key),
        description: `${group.category} - ${metric.label}` // Generate a basic description based on category
      }
    ])
  )
)

// Custom Tooltip Component with enhanced UX
const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-[var(--tooltip-bg)] border border-[var(--border-color)] rounded-lg shadow-lg text-sm text-[var(--text-secondary)] animate-in fade-in duration-200 max-w-[250px]">
        <p className="font-bold mb-2 text-[var(--text-primary)] border-b pb-1 border-[var(--border-color)]">{`${label}`}</p>
        {payload.map((entry) => {
          // Find the metric key by its label
          const metricKey = Object.keys(metricMap).find(
            key => metricMap[key].label === entry.name
          );
          const description = metricKey ? metricMap[metricKey].description : "";
          
          return (
            <div key={entry.name} className="mb-1.5">
              <p className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="font-medium">{`${entry.name}:`}</span>
                <span className="font-bold">{entry.value}</span>
              </p>
              {description && (
                <p className="text-xs mt-0.5 opacity-80 pl-1">{description}</p>
              )}
            </div>
          );
        })}
      </div>
    )
  }

  return null
}

// Helper function to download data as CSV
const downloadCSV = (data: Props["data"], metrics: string[], filename = "economy_data.csv") => {
  const headers = ["label", ...metrics]
  const csvRows = [
    headers.join(","), // header row
    ...data.map(row => {
      const values = headers.map(header => {
        const value = row[header]
        // Handle potential commas in string values by enclosing in quotes
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      })
      return values.join(",")
    })
  ]

  const csvString = csvRows.join("\n")
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement("a")
  if (link.download !== undefined) { // feature detection
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up by revoking the object URL
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  }
}

export default function EconomyChart({ data, selectedMetrics, onToggleMetric }: Props) {
  const [chartType, setChartType] = useState<ChartType>("line")
  const chartRef = useRef(null)
  const [shareTooltip, setShareTooltip] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showInfoTooltip, setShowInfoTooltip] = useState<string | null>(null);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [buttonPress, setButtonPress] = useState<string | null>(null);
  
  // Default metrics to show if none are selected
  const defaultMetrics = ["gdp", "unemployment_rate", "inflation_rate", "trade_balance"];
  
  // Use defaultMetrics if selectedMetrics is empty
  const effectiveMetrics = selectedMetrics.length > 0 ? selectedMetrics : 
    defaultMetrics.filter(m => data && data.length > 0 && data[0]?.hasOwnProperty(m));



  const renderChart = useCallback(() => {
    const commonProps = {
      data: data,
      margin: { top: 5, right: 20, left: 10, bottom: 5 },
    }



    // Helper to render the specific data series (Line, Area, or Bar)
    const renderDataSeries = () => {
      return effectiveMetrics.map((key: string) => {
        const config = metricMap[key]
        if (!config) return null

        switch (chartType) {
          case "line":
            return <Line 
              key={key} 
              type="monotone" 
              dataKey={key} 
              stroke={config.color} 
              name={config.label} 
              strokeWidth={2} 
              dot={{ r: 4 }} 
              activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
              animationDuration={800}
              animationEasing="ease-in-out"
            />
          case "area":
            return <Area 
              key={key} 
              type="monotone" 
              dataKey={key} 
              stroke={config.color} 
              fillOpacity={0.6} 
              fill={config.color} 
              name={config.label} 
              strokeWidth={2} 
              dot={{ r: 4 }} 
              activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }} 
              animationDuration={800}
              animationEasing="ease-in-out"
            />
          case "bar":
          default:
            return <Bar 
              key={key} 
              dataKey={key} 
              fill={config.color} 
              name={config.label} 
              radius={[4, 4, 0, 0]} 
              barSize={30}
              animationDuration={800}
              animationEasing="ease-in-out" 
            />        }
      })
    }

    // Common elements like Grid, Axes, Tooltip, Legend
    const commonElements = (
      <>
        <CartesianGrid
          stroke="var(--color-border)" 
          strokeDasharray="5 5" 
          strokeOpacity={0.8} 
          strokeWidth={2} 
          vertical 
          horizontal 
        />
        <XAxis 
          dataKey="label" 
          stroke="var(--text-secondary)" 
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: 'var(--primary)' }}
          axisLine={{ stroke: 'var(--primary)', strokeWidth: 1 }}
        />
        <YAxis 
          stroke="var(--text-secondary)" 
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: 'var(--primary)' }}
          axisLine={{ stroke: 'var(--primary)', strokeWidth: 1 }}
          width={40}
          // Add more vertical grid lines
          tickCount={5}
        />
        <Tooltip 
          content={<CustomTooltip />} 
          cursor={{ fill: "rgba(200, 200, 200, 0.1)" }}
          wrapperStyle={{ outline: 'none' }}
          animationDuration={200}
        />
      </>
    )

    // Construct the final chart based on the type
    switch (chartType) {
      case "line":
        return (
          <LineChart {...commonProps}>
            {commonElements}
            {renderDataSeries()}
          </LineChart>
        )
      case "area":
        return (
          <AreaChart {...commonProps}>
            {commonElements}
            {renderDataSeries()}
          </AreaChart>
        )
      case "bar":
      default:
        return (
          <BarChart {...commonProps} barGap={8}>
            {commonElements}
            {renderDataSeries()}
          </BarChart>
        )
    }
  }, [chartType, data, onToggleMetric, effectiveMetrics])

  const handleChartTypeChange = (type: ChartType) => {
    setButtonPress(type);
    setChartType(type);
    
    // Remove the press effect after animation completes
    setTimeout(() => {
      setButtonPress(null);
    }, 300);
  };

  const handleShare = useCallback(() => {
    setIsLoading(true);
    setActiveButton("share");
    setButtonPress("share");
    
    // Use Web Share API if available, otherwise fallback to clipboard
    if (navigator.share) {
      navigator.share({
        title: 'Economy Metrics Data',
        url: window.location.href
      })
      .then(() => {
        setIsLoading(false);
        setActiveButton(null);
        setTimeout(() => setButtonPress(null), 300);
      })
      .catch(err => {
        console.error('Failed to share: ', err);
        setIsLoading(false);
        setActiveButton(null);
        setTimeout(() => setButtonPress(null), 300);
        // Fallback to clipboard
        fallbackToClipboard();
      });
    } else {
      fallbackToClipboard();
    }
  }, []);

  const fallbackToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        setIsLoading(false);
        setShareTooltip("Link copied!");
        setActiveButton(null);
        setTimeout(() => setButtonPress(null), 300);
        setTimeout(() => setShareTooltip(""), 2000);
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
        setIsLoading(false);
        setShareTooltip("Failed to copy link");
        setActiveButton(null);
        setTimeout(() => setButtonPress(null), 300);
        setTimeout(() => setShareTooltip(""), 2000);
      });
  };

  const handleDownload = useCallback(() => {
    if (effectiveMetrics.length === 0) return;
    
    setIsLoading(true);
    setActiveButton("download");
    setButtonPress("download");
    
    try {
      downloadCSV(data, effectiveMetrics);
      setTimeout(() => {
        setIsLoading(false);
        setActiveButton(null);
        setTimeout(() => setButtonPress(null), 300);
      }, 600);
    } catch (error) {
      console.error('Failed to download data: ', error);
      setIsLoading(false);
      setActiveButton(null);
      setTimeout(() => setButtonPress(null), 300);
    }
  }, [data, effectiveMetrics]);

  const handleInfoHover = (metric: string | null) => {
    setShowInfoTooltip(metric);
  };

  return (
    <div className="p-6 rounded-xl shadow bg-[var(--card-bg)] transition-transform transform hover:scale-[1.005] hover:shadow-2xl hover:cursor-pointer relative hover:border hover:border-[var(--turquoise)] hover:opacity-100 opacity-90">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            Economic Impact
          </h3>
          {effectiveMetrics.length === 0 && (
            <p className="text-sm mt-1 text-[var(--text-secondary)]">
              Select metrics from the sidebar to visualize economic trends
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Enhanced Chart Type Switcher with Icons and Effects */} 
          <div className="flex items-center p-1.5 bg-[var(--input-bg)] rounded-xl shadow-inner backdrop-blur-sm">
            {(['bar', 'line', 'area'] as ChartType[]).map((type) => {
              const isActive = chartType === type;
              const isPressed = buttonPress === type;
              
              return (
                <button
                  key={type}
                  onClick={() => handleChartTypeChange(type)}
                  className={`relative flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 
                    ${isPressed ? 'animate-press' : ''}
                    ${isActive 
                      ? 'bg-gradient-to-br from-[var(--button-primary-bg)] to-[var(--button-primary-bg-alt)] text-[var(--button-primary-text)] translate-y-[-1px]' 
                      : 'text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)]'}`}
                  aria-label={`Switch to ${type} chart`}
                  title={`Switch to ${type} chart`}
                >
                  {type === 'bar' && (
                    <BarChart2 
                      size={isActive ? 18 : 16} 
                      className={`transition-all duration-300 ${isActive ? 'drop-shadow-sm' : ''}`}
                    />
                  )}
                  {type === 'line' && (
                    <LineChartIcon 
                      size={isActive ? 18 : 16} 
                      className={`transition-all duration-300 ${isActive ? 'drop-shadow-sm' : ''}`}
                    />
                  )}
                  {type === 'area' && (
                    <AreaChartIcon 
                      size={isActive ? 18 : 16} 
                      className={`transition-all duration-300 ${isActive ? 'drop-shadow-sm' : ''}`}
                    />
                  )}
                  
                  {/* Enhanced active indicator with gradient border */}
                  {isActive && (
                    <>
                      <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      <span className="absolute inset-0 rounded-lg ring-2 ring-white/20 shadow-glow"></span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Advanced Action Buttons with Effects */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button 
                onClick={handleShare}
                disabled={isLoading}
                className={`group relative flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300
                  ${buttonPress === 'share' ? 'animate-press' : ''}
                  ${activeButton === 'share' ? 'bg-blue-500 text-white scale-95' : 'bg-[var(--input-bg)] text-[var(--text-secondary)]'}
                  hover:bg-blue-500/10 hover:text-blue-500 disabled:opacity-50 disabled:hover:bg-[var(--input-bg)] disabled:hover:text-[var(--text-secondary)]
                  backdrop-blur-sm shadow-sm`}
                aria-label="Share chart" 
                title="Share chart"
              >
                <Share2 
                  size={18} 
                  className={`transition-all duration-300 ${activeButton === 'share' ? 'animate-pulse' : 'group-hover:scale-110 group-active:scale-95'}`} 
                />
                
                {/* Enhanced hover effect with gradient border */}
                <span className="absolute inset-0 rounded-lg border border-blue-500/0 group-hover:border-blue-500/30 group-focus:border-blue-500/50 transition-all duration-300"></span>
                <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 group-hover:bg-gradient-to-br from-blue-500/5 to-blue-600/5 transition-all duration-300"></span>
                
                {/* Subtle glow effect on hover */}
                <span className="absolute inset-0 -z-10 rounded-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 blur-md bg-blue-500/10"></span>
              </button>
              
              {shareTooltip && (
                <div className="absolute -bottom-10 right-0 whitespace-nowrap bg-[var(--tooltip-bg)] text-xs py-1.5 px-3 rounded-md shadow-md border border-[var(--border-color)] animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-1.5">
                    <Check size={12} className="text-green-500" />
                    {shareTooltip}
                  </div>
                </div>
              )}
            </div>
            
            <button 
              onClick={handleDownload} 
              disabled={isLoading || effectiveMetrics.length === 0}
              className={`group relative flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300
                ${buttonPress === 'download' ? 'animate-press' : ''}
                ${activeButton === 'download' ? 'bg-emerald-500 text-white scale-95' : 'bg-[var(--input-bg)] text-[var(--text-secondary)]'}
                hover:bg-emerald-500/10 hover:text-emerald-500 
                disabled:opacity-50 disabled:hover:bg-[var(--input-bg)] disabled:hover:text-[var(--text-secondary)]
                backdrop-blur-sm shadow-sm`}
              aria-label="Download chart data" 
              title={effectiveMetrics.length === 0 ? "Select metrics to download" : "Download Data (CSV)"}
            >
              <Download 
                size={18} 
                className={`transition-all duration-300 ${activeButton === 'download' ? 'animate-bounce-subtle' : 'group-hover:scale-110 group-hover:translate-y-[1px] group-active:scale-95'}`} 
              />
              
              {/* Enhanced hover effect with gradient border */}
              <span className="absolute inset-0 rounded-lg border border-emerald-500/0 group-hover:border-emerald-500/30 group-focus:border-emerald-500/50 transition-all duration-300"></span>
              <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 group-hover:bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 transition-all duration-300"></span>
              
              {/* Subtle glow effect on hover */}
              <span className="absolute inset-0 -z-10 rounded-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 blur-md bg-emerald-500/10"></span>
            </button>
          </div>
        </div>
      </div>

      {/* Display selected metrics as chips */}
      {effectiveMetrics.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {effectiveMetrics.map(metric => {
            const config = metricMap[metric];
            if (!config) return null;
            
            return (
              <div 
                key={metric}
                className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-xs font-medium transition-all bg-opacity-15 border border-opacity-30"
                style={{
                  backgroundColor: `${config.color}20`,
                  borderColor: config.color,
                  color: config.color
                }}
                onClick={() => onToggleMetric(metric)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onToggleMetric(metric)}
              >
                {config.label}
                <div 
                  className="relative" 
                  onMouseEnter={() => handleInfoHover(metric)}
                  onMouseLeave={() => handleInfoHover(null)}
                >
                  <Info size={12} className="opacity-70" />
                  {showInfoTooltip === metric && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 z-10 w-48 p-2 bg-[var(--tooltip-bg)] border border-[var(--border-color)] rounded shadow-lg text-xs text-[var(--text-secondary)] animate-in fade-in duration-200">
                      {config.description}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {effectiveMetrics.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center flex-col text-[var(--text-secondary)] bg-[var(--input-bg)] rounded-lg border border-dashed border-[var(--border-color)]">
          <BarChart2 size={40} className="opacity-40 mb-3" />
          <p className="font-medium">Select metrics to visualize economic data</p>
          <p className="text-sm mt-1 opacity-70">Click on metrics from the sidebar or legend items below</p>
        </div>
      ) : (
        <div className="transition-all duration-300 ease-in-out">
          <ResponsiveContainer width="100%" height={300} ref={chartRef}>
            {renderChart()}
          </ResponsiveContainer>
          
          {effectiveMetrics.length > 0 && (
            <div className="text-xs text-center mt-2 text-[var(--text-secondary)] opacity-70">
              Click on legend items to toggle visibility
            </div>
          )}
        </div>
      )}
    </div>
  )
}
