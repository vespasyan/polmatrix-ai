'use client'

import React, { useState } from 'react'
import { Brain, Search, TrendingUp, Users, Heart, Leaf, ChevronRight, Loader2, AlertCircle } from 'lucide-react'
// import DynamicCharts from './DynamicCharts' // COMMENTED OUT FOR NOW

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

const SAMPLE_QUESTIONS = [
  "How does education spending affect economic growth?",
  "What's the relationship between healthcare investment and life expectancy?",
  "How do environmental policies impact economic indicators?",
  "What factors contribute to reducing unemployment rates?",
  "How does literacy rate correlate with GDP growth?"
]

export default function SmartPolicyAnalyzer() {
  const [question, setQuestion] = useState("")
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [data, setData] = useState<DataResponse | null>(null)
  const [insights, setInsights] = useState<InsightsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    { id: 1, name: 'Analyzing Question', description: 'AI is understanding your policy question' },
    { id: 2, name: 'Fetching Data', description: 'Retrieving relevant data from database' },
    { id: 3, name: 'Generating Insights', description: 'Creating policy recommendations' }
  ]

  const analyzeQuestion = async () => {
    if (!question.trim()) {
      setError("Please enter a policy question")
      return
    }

    setLoading(true)
    setError(null)
    setCurrentStep(1)
    
    try {
      console.log("🔍 Starting analysis for:", question)
      
      // Step 1: Analyze the question
      const analysisResponse = await fetch('/api/ai/analyze-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      })
      
      console.log("📡 Analysis response status:", analysisResponse.status)
      
      if (!analysisResponse.ok) {
        const errorText = await analysisResponse.text()
        console.error("❌ Analysis failed:", errorText)
        throw new Error(`Analysis failed: ${analysisResponse.statusText}`)
      }
      
      const { analysis: questionAnalysis } = await analysisResponse.json()
      console.log("✅ Analysis completed:", questionAnalysis)
      setAnalysis(questionAnalysis)
      setCurrentStep(2)

      // Step 2: Fetch relevant data
      const dataResponse = await fetch('/api/ai/fetch-relevant-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domains: questionAnalysis.domains,
          countries: [1, 3, 4, 12], // Default countries with data
          timeRange: { start: 2020, end: 2024 },
          metrics: questionAnalysis.metrics
        })
      })

      console.log("📡 Data response status:", dataResponse.status)

      if (!dataResponse.ok) {
        const errorText = await dataResponse.text()
        console.error("❌ Data fetch failed:", errorText)
        throw new Error(`Data fetch failed: ${dataResponse.statusText}`)
      }

      const relevantData = await dataResponse.json()
      console.log("✅ Data fetched:", relevantData)
      setData(relevantData)
      setCurrentStep(3)

      // Step 3: Generate AI insights
      const insightsResponse = await fetch('/api/ai/generate-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          analysis: questionAnalysis,
          data: relevantData.data
        })
      })

      console.log("📡 Insights response status:", insightsResponse.status)

      if (!insightsResponse.ok) {
        const errorText = await insightsResponse.text()
        console.error("❌ Insights generation failed:", errorText)
        throw new Error(`Insights generation failed: ${insightsResponse.statusText}`)
      }

      const aiInsights = await insightsResponse.json()
      console.log("✅ Insights generated:", aiInsights)
      setInsights(aiInsights)

    } catch (err) {
      console.error('Analysis failed:', err)
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
      setCurrentStep(0)
    }
  }

  const resetAnalysis = () => {
    setAnalysis(null)
    setData(null)
    setInsights(null)
    setError(null)
    setCurrentStep(0)
  }

  const useSampleQuestion = (sampleQuestion: string) => {
    setQuestion(sampleQuestion)
    resetAnalysis()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Smart Policy Analyzer</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Ask any policy question and get AI-powered insights with dynamic data visualization and evidence-based recommendations.
          </p>
        </div>

        {/* Question Input Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="question" className="block text-lg font-semibold text-gray-900 mb-3">
                What policy question would you like to analyze?
              </label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., How would a 10% increase in education spending affect economic growth over 5 years?"
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 h-24 text-gray-900 placeholder-gray-500"
                disabled={loading}
              />
            </div>

            {/* Sample Questions */}
            {!loading && !analysis && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Try these sample questions:</p>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_QUESTIONS.map((sample, index) => (
                    <button
                      key={index}
                      onClick={() => useSampleQuestion(sample)}
                      className="text-sm px-3 py-2 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full transition-colors duration-200"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={analyzeQuestion}
                disabled={loading || !question.trim()}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors duration-200 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
                <span>{loading ? 'Analyzing...' : 'Analyze Policy Impact'}</span>
              </button>

              {(analysis || error) && (
                <button
                  onClick={resetAnalysis}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200"
                >
                  Ask New Question
                </button>
              )}
            </div>
          </div>

          {/* Progress Steps */}
          {loading && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center space-x-2">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${currentStep >= step.id 
                        ? 'bg-blue-600 text-white' 
                        : currentStep === step.id 
                          ? 'bg-blue-100 text-blue-600 animate-pulse'
                          : 'bg-gray-200 text-gray-500'
                      }
                    `}>
                      {currentStep > step.id ? '✓' : step.id}
                    </div>
                    <div className="hidden sm:block">
                      <p className="font-medium text-gray-900">{step.name}</p>
                      <p className="text-sm text-gray-500">{step.description}</p>
                    </div>
                    {index < steps.length - 1 && (
                      <ChevronRight className="h-5 w-5 text-gray-400 mx-4" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">Analysis Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Analysis Results */}
        {analysis && !loading && (
          <div className="space-y-8">
            {/* Domain Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Analysis Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {analysis.domains.map(domain => {
                  const Icon = DOMAIN_ICONS[domain as keyof typeof DOMAIN_ICONS]
                  const colorClass = DOMAIN_COLORS[domain as keyof typeof DOMAIN_COLORS]
                  const isPrimary = domain === analysis.primary_domain
                  
                  return (
                    <div key={domain} className={`
                      p-4 rounded-lg border-2 transition-all duration-200
                      ${isPrimary ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                      ${colorClass}
                    `}>
                      <div className="flex items-center space-x-3 mb-2">
                        <Icon className="h-6 w-6" />
                        <h3 className="font-semibold capitalize">{domain}</h3>
                        {isPrimary && (
                          <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full">Primary</span>
                        )}
                      </div>
                      <p className="text-sm opacity-80">
                        {data?.data[domain]?.count || 0} data points available
                      </p>
                    </div>
                  )
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Key Metrics</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.metrics.map(metric => (
                      <span key={metric} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Analysis Focus</h4>
                  <p className="text-gray-600 capitalize">
                    {analysis.time_focus.replace(/_/g, ' ')} • {analysis.geographic_scope}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Confidence Level</h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(analysis.confidence || 0.5) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {Math.round((analysis.confidence || 0.5) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Summary - Replacing DynamicCharts for now */}
            {data && data.success && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(data.data).map(([domain, domainData]) => (
                    <div key={domain} className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold capitalize text-gray-900 mb-2">{domain}</h3>
                      <p className="text-2xl font-bold text-blue-600">{domainData.count}</p>
                      <p className="text-sm text-gray-600">data points available</p>
                      {domainData.error && (
                        <p className="text-xs text-red-500 mt-1">Error: {domainData.error}</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    📊 Charts and visualizations will be available once DynamicCharts component is created.
                  </p>
                </div>
              </div>
            )}

            {/* AI Insights */}
            {insights && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <Brain className="h-6 w-6 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-900">AI-Powered Insights</h2>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    {insights.metadata.dataPoints} data points analyzed
                  </span>
                </div>
                
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {insights.insights}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Analysis Metadata</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700 font-medium">Domains:</span>
                      <p className="text-blue-800">{insights.metadata.domains?.join(', ') || 'Economy'}</p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Confidence:</span>
                      <p className="text-blue-800">{Math.round(insights.metadata.confidence * 100)}%</p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Data Points:</span>
                      <p className="text-blue-800">{insights.metadata.dataPoints}</p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Generated:</span>
                      <p className="text-blue-800">{new Date().toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}