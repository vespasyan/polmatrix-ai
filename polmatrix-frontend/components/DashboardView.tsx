"use client";

import { useEffect, useState, useCallback } from "react";
import ChartTabs from "@/components/ChartTabs";
import GlobalFilter from "@/components/GlobalFilter";
import SimulationResults from "@/components/SimulationResults";
import GridCharts from "@/components/GridCharts";
import { useSearchParams, useRouter } from "next/navigation";
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
  const router = useRouter();
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

          {/* Futuristic Action Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Primary AI Analysis Button - Advanced Holographic Effect */}
            <button 
              onClick={() => router.push('/')}
              disabled={loading}
              className="btn-holographic btn-particle group relative overflow-hidden px-3 py-2 text-white font-medium rounded-lg shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-cyan-500/50 disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
            >
              {/* Multi-layered animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-75"></div>
              <div className="absolute inset-0 bg-gradient-to-l from-pink-400 via-purple-500 to-indigo-600 opacity-50 animate-pulse"></div>
              
              {/* Advanced holographic overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
              
              {/* Double border glow effect */}
              <div className="absolute inset-0 rounded-lg border border-cyan-300/50 group-hover:border-cyan-300 transition-colors duration-300"></div>
              <div className="absolute inset-0.5 rounded border border-white/20 group-hover:border-white/40 transition-colors duration-300"></div>
              
              {/* Scan lines */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
                <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse" style={{animationDelay: '0.5s'}}></div>
              </div>
              
              {/* Content with enhanced effects */}
              <div className="relative flex items-center gap-2 z-10">
                <div className="relative">
                  <Brain size={14} className="animate-pulse text-cyan-200" />
                  <div className="absolute inset-0 animate-ping">
                    <Brain size={14} className="text-cyan-400 opacity-30" />
                  </div>
                </div>
                <span className="bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent font-semibold tracking-wide text-sm">
                  New Smart Analysis
                </span>
                {/* Status indicator */}
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              </div>
            </button>
            
            {/* Compare Scenarios Button - Futuristic Disabled State */}
            <button 
              disabled
              className="btn-glitch group relative px-3 py-2 font-medium rounded-lg border overflow-hidden transition-all duration-300 cursor-not-allowed"
              data-text=""
            >
              {/* Glitched background layers */}
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-red-500/10 to-orange-500/5 animate-pulse"></div>
              
              {/* Corrupted data pattern */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0.5 left-1 w-4 h-px bg-red-400/50 animate-pulse"></div>
                <div className="absolute top-2 right-2 w-3 h-px bg-orange-400/50 animate-pulse" style={{animationDelay: '0.3s'}}></div>
                <div className="absolute bottom-1 left-1/3 w-2 h-px bg-yellow-400/50 animate-pulse" style={{animationDelay: '0.6s'}}></div>
              </div>
              
              {/* Warning border */}
              <div className="absolute inset-0 rounded-lg border border-gray-700 group-hover:border-orange-500/30 transition-colors duration-300"></div>
              
              {/* Static interference lines */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 w-full h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent animate-pulse"></div>
                <div className="absolute top-3/4 w-full h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent animate-pulse" style={{animationDelay: '0.5s'}}></div>
              </div>
              
              {/* Content with disabled styling */}
              <div className="relative flex items-center gap-2 z-10">
                <div className="relative">
                  <GitCompare size={14} className="text-gray-500 group-hover:text-orange-400/70 transition-colors duration-300" />
                  {/* Error indicator */}
                  <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse opacity-60"></div>
                </div>
                <span className="text-gray-400 group-hover:text-orange-400/70 transition-colors duration-300 tracking-wide text-sm">
                  Compare
                </span>
                {/* Status badges */}
                <div className="flex items-center space-x-1">
                  <span className="text-xs bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 px-1.5 py-0.5 rounded-full border border-orange-500/30 animate-pulse">
                    v2.0
                  </span>
                  <div className="flex space-x-0.5">
                    <div className="w-0.5 h-0.5 bg-red-400 rounded-full animate-ping"></div>
                    <div className="w-0.5 h-0.5 bg-orange-400 rounded-full animate-ping" style={{animationDelay: '0.3s'}}></div>
                    <div className="w-0.5 h-0.5 bg-yellow-400 rounded-full animate-ping" style={{animationDelay: '0.6s'}}></div>
                  </div>
                </div>
              </div>
            </button>

            {/* Refresh Button - Advanced Cyberpunk Style */}
            <button 
              onClick={refreshData}
              disabled={dataLoading}
              className="btn-cyberpunk btn-neon group relative px-3 py-2 font-medium rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:scale-100 overflow-hidden"
            >
              {/* Base cyberpunk background */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800"></div>
              
              {/* Animated circuit pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1 left-1 w-0.5 h-0.5 bg-emerald-400 rounded-full animate-ping"></div>
                <div className="absolute top-2 right-2 w-0.5 h-0.5 bg-emerald-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute bottom-1.5 left-1/2 w-0.5 h-0.5 bg-emerald-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
              </div>
              
              {/* Matrix-style background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Enhanced border system */}
              <div className="absolute inset-0 rounded-lg border border-emerald-500/30 group-hover:border-emerald-400/60 transition-colors duration-300"></div>
              <div className="absolute inset-0 rounded-lg border border-transparent group-hover:border-emerald-400/20 transition-colors duration-300"></div>
              
              {/* Data stream effect */}
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-pulse" style={{animationDelay: '0.3s'}}></div>
              
              {/* Content with enhanced styling */}
              <div className="relative flex items-center gap-2 z-10">
                <div className="relative">
                  <RefreshCw 
                    size={14} 
                    className={`${
                      dataLoading 
                        ? 'animate-spin text-emerald-300' 
                        : 'group-hover:rotate-180 text-emerald-400 group-hover:text-emerald-300'
                    } transition-all duration-500`} 
                  />
                  {/* Orbital ring effect */}
                  <div className="absolute inset-0 w-3.5 h-3.5 border border-emerald-400/30 rounded-full group-hover:animate-spin" style={{animationDuration: '3s'}}></div>
                </div>
                <span className="text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300 font-medium tracking-wide text-sm">
                  {dataLoading ? 'Sync' : 'Refresh'}
                </span>
                {/* Network status indicator */}
                <div className="flex space-x-0.5">
                  <div className="w-0.5 h-2 bg-emerald-400 rounded-sm animate-pulse"></div>
                  <div className="w-0.5 h-2 bg-emerald-400 rounded-sm animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-0.5 h-2 bg-emerald-400 rounded-sm animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            </button>


          </div>
        </div>        {/* Futuristic Smart Analysis Results */}
        {smartAnalysis && !loading && (
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/80 via-blue-900/20 to-purple-900/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl shadow-2xl p-6 mb-6">
            {/* Animated background matrix effect */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-8 w-1 h-1 bg-cyan-400 rounded-full animate-ping"></div>
              <div className="absolute top-12 right-16 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute bottom-8 left-20 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-16 right-8 w-1 h-1 bg-pink-400 rounded-full animate-ping" style={{animationDelay: '1.5s'}}></div>
            </div>

            {/* Circuit pattern overlay */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-1/4 w-px h-8 bg-gradient-to-b from-cyan-400 to-transparent"></div>
              <div className="absolute top-0 left-1/4 w-8 h-px bg-gradient-to-r from-cyan-400 to-transparent"></div>
              <div className="absolute bottom-0 right-1/4 w-px h-8 bg-gradient-to-t from-purple-400 to-transparent"></div>
              <div className="absolute bottom-0 right-1/4 w-8 h-px bg-gradient-to-l from-purple-400 to-transparent"></div>
            </div>

            {/* Glowing border effect */}
            <div className="absolute inset-0 rounded-2xl border border-blue-400/20 shadow-[0_0_30px_rgba(59,130,246,0.15)]"></div>
            
            {/* Header with enhanced styling */}
            <div className="relative mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                    <Brain className="h-6 w-6 text-white" />
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 to-pink-400/30 rounded-xl animate-pulse"></div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                      Neural Analysis Overview
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">AI-powered policy insights across multiple domains</p>
                  </div>
                </div>
                
                {/* Status indicator */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-400/30 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-300 text-sm font-medium">Analysis Complete</span>
                </div>
              </div>
              
              {/* Data flow line */}
              <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent animate-pulse mt-4"></div>
            </div>
            
            {/* Domain Cards with Futuristic Design */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {smartAnalysis.domains.map((domain, index) => {
                const Icon = DOMAIN_ICONS[domain as keyof typeof DOMAIN_ICONS]
                const isPrimary = domain === smartAnalysis.primary_domain
                const dataCount = smartData?.data[domain]?.count || 0
                
                // Dynamic color themes for each domain
                const domainThemes = {
                  economy: { 
                    bg: 'from-blue-500/20 to-cyan-500/20', 
                    border: 'border-blue-400/40',
                    glow: 'shadow-blue-500/20',
                    text: 'text-blue-300',
                    accent: 'bg-blue-500'
                  },
                  health: { 
                    bg: 'from-red-500/20 to-pink-500/20', 
                    border: 'border-red-400/40',
                    glow: 'shadow-red-500/20',
                    text: 'text-red-300',
                    accent: 'bg-red-500'
                  },
                  education: { 
                    bg: 'from-purple-500/20 to-violet-500/20', 
                    border: 'border-purple-400/40',
                    glow: 'shadow-purple-500/20',
                    text: 'text-purple-300',
                    accent: 'bg-purple-500'
                  },
                  environment: { 
                    bg: 'from-green-500/20 to-emerald-500/20', 
                    border: 'border-green-400/40',
                    glow: 'shadow-green-500/20',
                    text: 'text-green-300',
                    accent: 'bg-green-500'
                  }
                }
                
                const theme = domainThemes[domain as keyof typeof domainThemes]
                
                return (
                  <div 
                    key={domain} 
                    className={`group relative overflow-hidden bg-gradient-to-br ${theme.bg} backdrop-blur-sm border ${theme.border} rounded-xl p-4 transition-all duration-500 hover:scale-105 hover:shadow-lg ${theme.glow} ${isPrimary ? 'ring-2 ring-cyan-400/50 ring-offset-2 ring-offset-slate-900' : ''}`}
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    {/* Animated background particle */}
                    <div className="absolute top-2 right-2 w-1 h-1 bg-white/50 rounded-full animate-ping"></div>
                    
                    {/* Holographic overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 ${theme.accent} rounded-lg shadow-lg`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <h3 className={`font-semibold capitalize ${theme.text} text-sm`}>{domain}</h3>
                        </div>
                        
                        {isPrimary && (
                          <div className="px-2 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs rounded-full font-medium shadow-lg animate-pulse">
                            Primary
                          </div>
                        )}
                      </div>
                      
                      {/* Data visualization */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-xs">Data Points</span>
                          <span className={`${theme.text} font-bold text-lg`}>{dataCount.toLocaleString()}</span>
                        </div>
                        
                        {/* Mini progress bar */}
                        <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 ${theme.accent} rounded-full transition-all duration-1000 shadow-sm`}
                            style={{ width: `${Math.min((dataCount / 100) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Advanced Metrics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Key Metrics Panel */}
              <div className="relative bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 rounded-xl p-4 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <h4 className="font-semibold text-cyan-300 text-sm">Neural Metrics</h4>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {smartAnalysis.metrics.slice(0, 3).map((metric, index) => (
                      <div 
                        key={metric} 
                        className="group relative px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 text-cyan-200 rounded-lg text-xs font-medium overflow-hidden transition-all duration-300 hover:scale-105"
                        style={{animationDelay: `${index * 0.1}s`}}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-500"></div>
                        <span className="relative z-10">
                          {metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Analysis Focus Panel */}
              <div className="relative bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-xl p-4 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent animate-pulse" style={{animationDelay: '0.3s'}}></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                    <h4 className="font-semibold text-purple-300 text-sm">Temporal Scope</h4>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                      <span className="text-purple-200 text-sm capitalize">
                        {smartAnalysis.time_focus.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-pink-400 rounded-full"></div>
                      <span className="text-pink-200 text-sm">
                        {smartAnalysis.geographic_scope}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confidence Panel with Advanced Visualization */}
              <div className="relative bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-xl p-4 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400/50 to-transparent animate-pulse" style={{animationDelay: '0.6s'}}></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
                    <h4 className="font-semibold text-green-300 text-sm">AI Confidence</h4>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Circular progress indicator */}
                    <div className="flex items-center justify-between">
                      <div className="relative w-12 h-12">
                        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 24 24">
                          <circle 
                            cx="12" 
                            cy="12" 
                            r="8" 
                            fill="none" 
                            stroke="rgb(34 197 94 / 0.2)" 
                            strokeWidth="2"
                          />
                          <circle 
                            cx="12" 
                            cy="12" 
                            r="8" 
                            fill="none" 
                            stroke="rgb(34 197 94)" 
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeDasharray={`${(smartAnalysis.confidence || 0.5) * 50.27} 50.27`}
                            className="transition-all duration-1000"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-green-300 font-bold text-xs">
                            {Math.round((smartAnalysis.confidence || 0.5) * 100)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-1 ml-3">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex-1 bg-slate-700/50 rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full transition-all duration-1000 shadow-lg shadow-green-400/50"
                              style={{ width: `${(smartAnalysis.confidence || 0.5) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-slate-400 text-xs">Neural Network Accuracy</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Futuristic Error Alert */}
        {error && (
          <div className="relative overflow-hidden bg-gradient-to-r from-red-900/20 via-red-800/10 to-pink-900/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-5 shadow-2xl">
            {/* Animated background pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5 animate-pulse"></div>
            
            {/* Glowing border effect */}
            <div className="absolute inset-0 rounded-xl border border-red-400/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]"></div>
            
            <div className="relative flex items-center gap-4 z-10">
              <div className="flex-shrink-0 p-2 bg-red-500/20 rounded-lg border border-red-400/30">
                <AlertCircle className="h-5 w-5 text-red-400 animate-pulse" />
              </div>
              
              <div className="flex-1">
                <div className="font-semibold text-red-300 mb-1 flex items-center gap-2">
                  System Alert
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
                </div>
                <div className="text-sm text-red-200/80">{error}</div>
              </div>
              
              {/* Futuristic close button */}
              <button 
                onClick={() => setError(null)}
                className="group relative p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 hover:border-red-400/60 rounded-lg transition-all duration-300 hover:scale-110"
              >
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-red-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                
                <div className="relative text-red-400 group-hover:text-red-300 transition-colors duration-300 text-lg font-bold leading-none">
                  ×
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <GlobalFilter 
          onFilterChange={handleFilterChange}
          className="mb-6"
        />

        {/* Ultra-Futuristic View Mode Toggle - Above Charts - Expanded */}
        <div className="flex justify-center mb-8">
          <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-2 rounded-xl border border-slate-600/50 shadow-2xl overflow-hidden">
            {/* Enhanced background matrix effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/8 via-purple-500/15 to-blue-500/8 animate-pulse"></div>
            
            {/* Enhanced circuit board pattern */}
            <div className="absolute inset-0 opacity-25">
              <div className="absolute top-1 left-2 w-px h-4 bg-blue-400"></div>
              <div className="absolute top-1 left-2 w-4 h-px bg-blue-400"></div>
              <div className="absolute bottom-1 right-2 w-px h-4 bg-purple-400"></div>
              <div className="absolute bottom-1 right-2 w-4 h-px bg-purple-400"></div>
              {/* Additional circuit elements */}
              <div className="absolute top-3 left-8 w-2 h-px bg-cyan-400/60"></div>
              <div className="absolute bottom-3 right-8 w-2 h-px bg-pink-400/60"></div>
            </div>
            
            {/* Expanded animated toggle indicator - Transform-based positioning for perfect alignment */}
            <div className={`absolute top-2 h-10 w-28 rounded-lg shadow-xl transition-all duration-500 ease-out transform ${
              viewMode === "tabs" ? "translate-x-2" : "translate-x-32"
            }`}>
              {/* Enhanced primary glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
              {/* Enhanced secondary glow layer */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-pink-400 rounded-lg opacity-60 animate-pulse"></div>
              {/* Enhanced holographic overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent rounded-lg transform skew-x-12 animate-pulse"></div>
              {/* Enhanced border highlight */}
              <div className="absolute inset-0 border-2 border-white/40 rounded-lg"></div>
              {/* Additional glow effects */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-lg blur-sm"></div>
            </div>
            
            {/* Enhanced data flow lines */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400/60 to-transparent animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400/60 to-transparent animate-pulse" style={{animationDelay: '0.5s'}}></div>
            
            {/* Side glow effects */}
            <div className="absolute left-0 top-0 h-full w-0.5 bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent animate-pulse" style={{animationDelay: '0.25s'}}></div>
            <div className="absolute right-0 top-0 h-full w-0.5 bg-gradient-to-b from-transparent via-pink-400/50 to-transparent animate-pulse" style={{animationDelay: '0.75s'}}></div>
            
            <div className="relative flex gap-2 z-10">
              <button
                className={`flex items-center gap-3 px-5 py-2.5 rounded-lg transition-all duration-500 font-semibold relative overflow-hidden ${
                  viewMode === "tabs" 
                    ? "text-white transform scale-105 shadow-lg" 
                    : "text-slate-400 hover:text-slate-200 hover:scale-102"
                }`}
                onClick={() => setViewMode("tabs")}
              >
                {/* Enhanced button background effect */}
                {viewMode !== "tabs" && (
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-700/60 to-slate-600/60 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                )}
                
                {/* Enhanced icon with effects */}
                <div className="relative">
                  <Layers size={18} className={viewMode === "tabs" ? "animate-pulse text-cyan-200" : "transition-colors duration-300"} />
                  {viewMode === "tabs" && (
                    <div className="absolute inset-0 animate-ping">
                      <Layers size={18} className="text-cyan-400 opacity-30" />
                    </div>
                  )}
                  {/* Icon glow effect */}
                  <div className={`absolute -inset-1 rounded-full transition-opacity duration-300 ${
                    viewMode === "tabs" ? "bg-cyan-400/20 blur-sm opacity-100" : "opacity-0"
                  }`}></div>
                </div>
                
                <span className={`relative transition-all duration-300 text-base font-bold ${
                  viewMode === "tabs" ? "text-white font-bold tracking-wider" : "tracking-normal"
                }`}>
                  Tabs View
                </span>
                
                {/* Enhanced active indicator */}
                {viewMode === "tabs" && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"></div>
                    <div className="w-1 h-1 bg-cyan-300 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  </div>
                )}
              </button>

              <button
                className={`flex items-center gap-3 px-5 py-2.5 rounded-lg transition-all duration-500 font-semibold relative overflow-hidden ${
                  viewMode === "grid" 
                    ? "text-white transform scale-105 shadow-lg" 
                    : "text-slate-400 hover:text-slate-200 hover:scale-102"
                }`}
                onClick={() => setViewMode("grid")}
              >
                {/* Enhanced button background effect */}
                {viewMode !== "grid" && (
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-700/60 to-slate-600/60 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                )}
                
                {/* Enhanced icon with effects */}
                <div className="relative">
                  <LayoutGrid size={18} className={viewMode === "grid" ? "animate-pulse text-purple-200" : "transition-colors duration-300"} />
                  {viewMode === "grid" && (
                    <div className="absolute inset-0 animate-ping">
                      <LayoutGrid size={18} className="text-purple-400 opacity-30" />
                    </div>
                  )}
                  {/* Icon glow effect */}
                  <div className={`absolute -inset-1 rounded-full transition-opacity duration-300 ${
                    viewMode === "grid" ? "bg-purple-400/20 blur-sm opacity-100" : "opacity-0"
                  }`}></div>
                </div>
                
                <span className={`relative transition-all duration-300 text-base font-bold ${
                  viewMode === "grid" ? "text-white font-bold tracking-wider" : "tracking-normal"
                }`}>
                  Grid View
                </span>
                
                {/* Enhanced active indicator */}
                {viewMode === "grid" && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50"></div>
                    <div className="w-1 h-1 bg-purple-300 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  </div>
                )}
              </button>
            </div>
            
            {/* Corner accent elements */}
            <div className="absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2 border-blue-400/50 rounded-tl"></div>
            <div className="absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2 border-purple-400/50 rounded-tr"></div>
            <div className="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2 border-cyan-400/50 rounded-bl"></div>
            <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-pink-400/50 rounded-br"></div>
          </div>
        </div>

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
        </div>

        {/* Enhanced Simulation Results */}
        <SimulationResults 
          summary={summary}
          isLoading={loading}
        />
      </div>
    </div>
  );
}