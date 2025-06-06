"use client";

import { useEffect, useState, useCallback } from "react";
import ChartTabs from "@/components/ChartTabs";
import GlobalFilter from "@/components/GlobalFilter";
import SimulationResults from "@/components/SimulationResults";
import GridCharts from "@/components/GridCharts";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion"
import { LayoutGrid, Layers, Plus, GitCompare, RefreshCw, Settings, AlertCircle, Brain, TrendingUp, Users, Heart, Leaf } from "lucide-react";
import { 
  fetchEconomyData, 
  fetchEducationData, 
  fetchHealthData, 
  fetchEnvironmentData 
} from "@/lib/api";

interface DashboardViewProps {
  initialPrompt?: string;
}

// Smart Analysis Interfaces
interface Analysis {
  domains: string[]
  primary_domain: string
  metrics: string[]
  time_focus: string
  geographic_scope: string
  visualization_type: string
  key_relationships: string[]
  confidence: number
}

interface DataResponse {
  success: boolean
  data: Record<string, {
    count: number
    data: any[]
    error?: string
  }>
  summary?: {
    totalDomains: number
    totalRecords: number
    countries: number[]
    timeRange: { start: number; end: number }
  }
}

interface InsightsResponse {
  insights: string
  metadata: {
    question?: string
    domains?: string[]
    confidence: number
    dataPoints: number
  }
}

const DOMAIN_ICONS = {
  economy: TrendingUp,
  health: Heart,
  education: Users,
  environment: Leaf
}

const DOMAIN_COLORS = {
  economy: 'bg-blue-100 text-blue-700 border-blue-200',
  health: 'bg-red-100 text-red-700 border-red-200',
  education: 'bg-purple-100 text-purple-700 border-purple-200',
  environment: 'bg-green-100 text-green-700 border-green-200'
}

export default function DashboardView({ initialPrompt: propInitialPrompt }: DashboardViewProps) {
  const searchParams = useSearchParams();
  const urlInitialPrompt = searchParams.get("prompt");
  
  // Use prop initialPrompt or fall back to URL param
  const initialPrompt = propInitialPrompt || urlInitialPrompt;
  
  // Smart Analysis states
  const [smartAnalysis, setSmartAnalysis] = useState<Analysis | null>(null);
  const [smartData, setSmartData] = useState<DataResponse | null>(null);
  const [smartInsights, setSmartInsights] = useState<InsightsResponse | null>(null);
  const [analysisStep, setAnalysisStep] = useState(0);
  
  // Loading and UI states
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // View configuration
  const [viewMode, setViewMode] = useState<"tabs" | "grid">(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("viewMode") as "tabs" | "grid" || "tabs"
    }
    return "tabs"
  });

  // Correlation tab state
  const [correlationTab, setCorrelationTab] = useState<"impact" | "matrix">("impact");

  // Data states
  const [economyData, setEconomyData] = useState<any[]>([]);
  const [educationData, setEducationData] = useState<any[]>([]);
  const [environmentData, setEnvironmentData] = useState<any[]>([]);
  const [healthData, setHealthData] = useState<any[]>([]);

  // Metric selection states - using database column names
  const [economyMetrics, setEconomyMetrics] = useState<string[]>([
    "gdp_growth_rate", 
    "unemployment_rate", 
    "inflation_rate", 
    "trade_balance"
  ]);
  
  const [educationMetrics, setEducationMetrics] = useState<string[]>([
    "literacy_rate",
    "school_enrollment_rate",
    "education_expenditure_per_capita",
    "primary_completion_rate"
  ]);
  
  const [environmentMetrics, setEnvironmentMetrics] = useState<string[]>([
    "co2_emissions",
    "renewable_energy_percentage",
    "forest_area_percentage",
    "air_pollution_index"
  ]);
  
  const [healthMetrics, setHealthMetrics] = useState<string[]>([
    "life_expectancy",
    "maternal_mortality_rate",
    "healthcare_expenditure_per_capita",
    "physician_density"
  ]);

  // Filter states
  const [filters, setFilters] = useState({
    geography_id: ["1", "3", "4"], // Default: USA, UK, Germany
    time_id: ["54", "55", "56"], // Default: 2022-2024
    economic_filter: undefined as number | undefined,
    health_filter: undefined as number | undefined,
    education_filter: undefined as number | undefined,
    sustainability_filter: undefined as number | undefined,
    pollution_filter: undefined as number | undefined,
    conservation_filter: undefined as number | undefined,
  });

  // Save view mode preference
  useEffect(() => {
    localStorage.setItem("viewMode", viewMode)
  }, [viewMode]);

  // Smart AI Analysis function (replaces the old runAISimulation)
  const runSmartAnalysis = useCallback(async (question: string) => {
    console.log("🧠 Running Smart Analysis for:", question);
    setLoading(true);
    setError(null);
    setAnalysisStep(1);
    
    try {
      // Step 1: Analyze the question
      console.log("🔍 Step 1: Analyzing question...");
      const analysisResponse = await fetch('/api/ai/analyze-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      
      if (!analysisResponse.ok) {
        const errorText = await analysisResponse.text();
        throw new Error(`Analysis failed: ${analysisResponse.statusText}`);
      }
      
      const { analysis } = await analysisResponse.json();
      console.log("✅ Analysis completed:", analysis);
      setSmartAnalysis(analysis);
      setAnalysisStep(2);

      // Step 2: Fetch relevant data
      console.log("📊 Step 2: Fetching relevant data...");
      const dataResponse = await fetch('/api/ai/fetch-relevant-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domains: analysis.domains,
          countries: [1, 3, 4, 12], // Default countries with data
          timeRange: { start: 2020, end: 2024 },
          metrics: analysis.metrics
        })
      });

      if (!dataResponse.ok) {
        const errorText = await dataResponse.text();
        throw new Error(`Data fetch failed: ${dataResponse.statusText}`);
      }

      const relevantData = await dataResponse.json();
      console.log("✅ Data fetched:", relevantData);
      setSmartData(relevantData);
      setAnalysisStep(3);

      // Step 3: Generate AI insights
      console.log("💡 Step 3: Generating insights...");
      const insightsResponse = await fetch('/api/ai/generate-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          analysis,
          data: relevantData.data
        })
      });

      if (!insightsResponse.ok) {
        const errorText = await insightsResponse.text();
        throw new Error(`Insights generation failed: ${insightsResponse.statusText}`);
      }      const aiInsights = await insightsResponse.json();
      console.log("✅ Insights generated:", aiInsights);
      setSmartInsights(aiInsights);
      
      // Set summary for compatibility with existing SimulationResults
      setSummary(aiInsights.insights);      // Step 4: Update chart data states with analysis results
      console.log("🔄 Step 4: Updating chart data with analysis results...");
      if (relevantData.data) {
        // Update each domain's data state if present in the analysis results
        // Merge with existing data to preserve broader context while highlighting analysis results
        if (relevantData.data.economy && relevantData.data.economy.data) {
          // Merge analysis data with existing economy data
          const mergedEconomyData = [...relevantData.data.economy.data];
          // Add any existing data that's not in analysis results
          economyData.forEach(existingItem => {
            const exists = mergedEconomyData.some(analysisItem => 
              analysisItem.geography_id === existingItem.geography_id && 
              analysisItem.time_id === existingItem.time_id
            );
            if (!exists) {
              mergedEconomyData.push(existingItem);
            }
          });
          setEconomyData(mergedEconomyData);
          
          // Update economy metrics to show analysis-relevant metrics
          const economyAnalysisMetrics = analysis.metrics.filter((m: string) => 
            m.includes('gdp') || m.includes('unemployment') || m.includes('inflation') || 
            m.includes('trade') || m.includes('economic') || m.includes('economy')
          );
          if (economyAnalysisMetrics.length > 0) {
            setEconomyMetrics(economyAnalysisMetrics);
          }
        }
        
        if (relevantData.data.education && relevantData.data.education.data) {
          const mergedEducationData = [...relevantData.data.education.data];
          educationData.forEach(existingItem => {
            const exists = mergedEducationData.some(analysisItem => 
              analysisItem.geography_id === existingItem.geography_id && 
              analysisItem.time_id === existingItem.time_id
            );
            if (!exists) {
              mergedEducationData.push(existingItem);
            }
          });
          setEducationData(mergedEducationData);
          
          // Update education metrics to show analysis-relevant metrics
          const educationAnalysisMetrics = analysis.metrics.filter((m: string) => 
            m.includes('literacy') || m.includes('enrollment') || m.includes('education') || 
            m.includes('school') || m.includes('completion')
          );
          if (educationAnalysisMetrics.length > 0) {
            setEducationMetrics(educationAnalysisMetrics);
          }
        }
        
        if (relevantData.data.environment && relevantData.data.environment.data) {
          const mergedEnvironmentData = [...relevantData.data.environment.data];
          environmentData.forEach(existingItem => {
            const exists = mergedEnvironmentData.some(analysisItem => 
              analysisItem.geography_id === existingItem.geography_id && 
              analysisItem.time_id === existingItem.time_id
            );
            if (!exists) {
              mergedEnvironmentData.push(existingItem);
            }
          });
          setEnvironmentData(mergedEnvironmentData);
          
          // Update environment metrics to show analysis-relevant metrics
          const environmentAnalysisMetrics = analysis.metrics.filter((m: string) => 
            m.includes('co2') || m.includes('emission') || m.includes('renewable') || 
            m.includes('forest') || m.includes('pollution') || m.includes('environment')
          );
          if (environmentAnalysisMetrics.length > 0) {
            setEnvironmentMetrics(environmentAnalysisMetrics);
          }
        }
        
        if (relevantData.data.health && relevantData.data.health.data) {
          const mergedHealthData = [...relevantData.data.health.data];
          healthData.forEach(existingItem => {
            const exists = mergedHealthData.some(analysisItem => 
              analysisItem.geography_id === existingItem.geography_id && 
              analysisItem.time_id === existingItem.time_id
            );
            if (!exists) {
              mergedHealthData.push(existingItem);
            }
          });
          setHealthData(mergedHealthData);
          
          // Update health metrics to show analysis-relevant metrics
          const healthAnalysisMetrics = analysis.metrics.filter((m: string) => 
            m.includes('life_expectancy') || m.includes('mortality') || m.includes('healthcare') || 
            m.includes('physician') || m.includes('health')
          );
          if (healthAnalysisMetrics.length > 0) {
            setHealthMetrics(healthAnalysisMetrics);
          }
        }
      }

    } catch (err) {
      console.error('Smart Analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Smart analysis failed. Please try again.');
    } finally {
      setLoading(false);
      setAnalysisStep(0);
    }
  }, []);

  // Load data based on filters
  const loadData = useCallback(async () => {
    setDataLoading(true);
    setError(null);
    
    try {
      const fetchParams = {
        countries: filters.geography_id,
        timeIds: filters.time_id,
        economicFilter: filters.economic_filter,
        healthFilter: filters.health_filter,
        educationFilter: filters.education_filter,
        sustainabilityFilter: filters.sustainability_filter,
        pollutionFilter: filters.pollution_filter,
        conservationFilter: filters.conservation_filter,
      };

      // Fetch all domain data in parallel
      const [economy, education, environment, health] = await Promise.all([
        fetchEconomyData(fetchParams),
        fetchEducationData(fetchParams),
        fetchEnvironmentData(fetchParams),
        fetchHealthData(fetchParams)
      ]);

      setEconomyData(economy);
      setEducationData(education);
      setEnvironmentData(environment);
      setHealthData(health);
      
    } catch (err) {
      console.error("Data loading error:", err);
      setError("Failed to load data. Please check your connection and try again.");
    } finally {
      setDataLoading(false);
    }
  }, [filters]);

  // Load data when filters change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Run Smart Analysis on initial prompt
  useEffect(() => {
    if (initialPrompt) {
      runSmartAnalysis(initialPrompt);
    }
  }, [initialPrompt, runSmartAnalysis]);

  // Metric toggle functions
  const toggleMetric = useCallback((metric: string, setMetrics: Function, metrics: string[]) => {
    setMetrics((prev: string[]) => 
      prev.includes(metric) 
        ? prev.filter((m) => m !== metric)
        : [...prev, metric]
    );
  }, []);

  const toggleEconomyMetric = useCallback((metric: string) => {
    toggleMetric(metric, setEconomyMetrics, economyMetrics);
  }, [economyMetrics, toggleMetric]);

  const toggleEducationMetric = useCallback((metric: string) => {
    toggleMetric(metric, setEducationMetrics, educationMetrics);
  }, [educationMetrics, toggleMetric]);

  const toggleEnvironmentMetric = useCallback((metric: string) => {
    toggleMetric(metric, setEnvironmentMetrics, environmentMetrics);
  }, [environmentMetrics, toggleMetric]);

  const toggleHealthMetric = useCallback((metric: string) => {
    toggleMetric(metric, setHealthMetrics, healthMetrics);
  }, [healthMetrics, toggleMetric]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: {
    geography_id: string[];
    time_id: string[];
    economic_filter?: number;
    health_filter?: number;
    education_filter?: number;
    sustainability_filter?: number;
    pollution_filter?: number;
    conservation_filter?: number;
  }) => {
    setFilters({
      geography_id: newFilters.geography_id,
      time_id: newFilters.time_id,
      economic_filter: newFilters.economic_filter,
      health_filter: newFilters.health_filter,
      education_filter: newFilters.education_filter,
      sustainability_filter: newFilters.sustainability_filter,
      pollution_filter: newFilters.pollution_filter,
      conservation_filter: newFilters.conservation_filter,
    });
  }, []);

  // Refresh data
  const refreshData = useCallback(() => {
    loadData();
  }, [loadData]);
  // Smart Analysis progress steps
  const analysisSteps = [
    { id: 1, name: 'Analyzing Question', description: 'AI is understanding your policy question' },
    { id: 2, name: 'Fetching Data', description: 'Retrieving relevant data from database' },
    { id: 3, name: 'Generating Insights', description: 'Creating policy recommendations and updating charts' }
  ];

  return (
    <div className="w-full max-w-[1600px] px-6 pt-20 mx-auto">
      
      {/* Enhanced Loading overlay with Smart Analysis progress */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl text-center max-w-md w-full mx-4">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Brain className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                🧠 Smart Policy Analysis
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                AI is analyzing your policy question across multiple domains...
              </p>

              {/* Progress Steps */}
              <div className="space-y-3 mt-6">
                {analysisSteps.map((step) => (
                  <div key={step.id} className="flex items-center space-x-3">
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                      ${analysisStep >= step.id 
                        ? 'bg-green-500 text-white' 
                        : analysisStep === step.id 
                          ? 'bg-blue-500 text-white animate-pulse'
                          : 'bg-gray-200 text-gray-500'
                      }
                    `}>
                      {analysisStep > step.id ? '✓' : step.id}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{step.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                <LayoutGrid className="h-6 w-6 text-white" />
              </div>
              Policy Impact Dashboard
            </h1>
            <p className="text-[var(--text-secondary)] mt-2">
              Analyze cross-domain policy impacts with real-time data and AI insights
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => runSmartAnalysis("Generate comprehensive policy analysis across all domains")}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 shadow-lg"
            >
              <Brain size={16} />
              New Smart Analysis
            </button>
            
            <button 
              disabled
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--input-bg)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:bg-[var(--hover-bg)] transition-all duration-200 opacity-50 cursor-not-allowed"
            >
              <GitCompare size={16} />
              Compare Scenarios
            </button>

            <button 
              onClick={refreshData}
              disabled={dataLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--input-bg)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:bg-[var(--hover-bg)] transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw size={16} className={dataLoading ? 'animate-spin' : ''} />
              Refresh
            </button>

            {/* View Mode Toggle */}
            <div className="flex gap-1 p-1 bg-[var(--input-bg)] rounded-lg border border-[var(--border-color)]">
              <button
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ${
                  viewMode === "tabs" 
                    ? "bg-[var(--accent-color)] text-white shadow-sm" 
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
                onClick={() => setViewMode("tabs")}
              >
                <Layers size={16} />
                Tabs
              </button>
              <button
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ${
                  viewMode === "grid" 
                    ? "bg-[var(--accent-color)] text-white shadow-sm" 
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid size={16} />
                Grid
              </button>
            </div>
          </div>
        </div>        {/* Smart Analysis Results */}
        {smartAnalysis && !loading && (
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              Smart Analysis Overview
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {smartAnalysis.domains.map(domain => {
                const Icon = DOMAIN_ICONS[domain as keyof typeof DOMAIN_ICONS]
                const colorClass = DOMAIN_COLORS[domain as keyof typeof DOMAIN_COLORS]
                const isPrimary = domain === smartAnalysis.primary_domain
                
                return (
                  <div key={domain} className={`
                    p-4 rounded-lg border-2 transition-all duration-200
                    ${isPrimary ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                    ${colorClass}
                  `}>
                    <div className="flex items-center space-x-3 mb-2">
                      <Icon className="h-5 w-5" />
                      <h3 className="font-semibold capitalize">{domain}</h3>
                      {isPrimary && (
                        <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full">Primary</span>
                      )}
                    </div>
                    <p className="text-sm opacity-80">
                      {smartData?.data[domain]?.count || 0} data points
                    </p>
                  </div>
                )
              })}
            </div>            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold text-[var(--text-primary)] mb-2">Key Metrics</h4>
                <div className="flex flex-wrap gap-2">
                  {smartAnalysis.metrics.slice(0, 3).map(metric => (
                    <span key={metric} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                      {metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-[var(--text-primary)] mb-2">Analysis Focus</h4>
                <p className="text-[var(--text-secondary)] capitalize text-sm">
                  {smartAnalysis.time_focus.replace(/_/g, ' ')} • {smartAnalysis.geographic_scope}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[var(--text-primary)] mb-2">Confidence</h4>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-[var(--border-color)] rounded-full h-2">                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(smartAnalysis.confidence || 0.5) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {Math.round((smartAnalysis.confidence || 0.5) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-medium text-red-800 dark:text-red-200">Error</div>
              <div className="text-sm text-red-600 dark:text-red-300">{error}</div>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              ×
            </button>
          </div>
        )}

        {/* Filters */}
        <GlobalFilter 
          onFilterChange={handleFilterChange}
          className="mb-6"
        />

        {/* Main Charts Section */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {viewMode === "tabs" ? (
                <ChartTabs
                  economyData={economyData}
                  educationData={educationData}
                  environmentData={environmentData}
                  healthData={healthData}
                  economyMetrics={economyMetrics}
                  educationMetrics={educationMetrics}
                  environmentMetrics={environmentMetrics}
                  healthMetrics={healthMetrics}
                  onToggleEconomy={toggleEconomyMetric}
                  onToggleEducation={toggleEducationMetric}
                  onToggleEnvironment={toggleEnvironmentMetric}
                  onToggleHealth={toggleHealthMetric}
                  correlationTab={correlationTab}
                  setCorrelationTab={setCorrelationTab}
                  isLoading={dataLoading}
                />
              ) : (
                <GridCharts
                  economyData={economyData}
                  educationData={educationData}
                  environmentData={environmentData}
                  healthData={healthData}
                  economyMetrics={economyMetrics}
                  educationMetrics={educationMetrics}
                  environmentMetrics={environmentMetrics}
                  healthMetrics={healthMetrics}
                  onToggleEconomy={toggleEconomyMetric}
                  onToggleEducation={toggleEducationMetric}
                  onToggleEnvironment={toggleEnvironmentMetric}
                  onToggleHealth={toggleHealthMetric}
                  correlationTab={correlationTab}
                  setCorrelationTab={setCorrelationTab}
                  isLoading={dataLoading}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>        {/* Enhanced Simulation Results */}
        <SimulationResults 
          summary={summary}
          isLoading={loading}
        />
      </div>
    </div>
  );
}