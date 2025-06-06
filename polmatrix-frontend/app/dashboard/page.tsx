"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import HeroPrompt from "@/components/HeroPrompt"
import DashboardView from "@/components/DashboardView"
import { motion, AnimatePresence } from "framer-motion"
import { Brain, Activity, TrendingUp, BarChart3, Users, Heart, Leaf } from "lucide-react"

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const promptFromUrl = searchParams.get("prompt")
  
  const [simulationStarted, setSimulationStarted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null)

  // Auto-start simulation if there's a prompt in URL
  useEffect(() => {
    if (promptFromUrl) {
      setInitialPrompt(promptFromUrl)
      setSimulationStarted(true)
    }
  }, [promptFromUrl])

  const handleStartSimulation = (prompt?: string) => {
    setLoading(true)
    setInitialPrompt(prompt || null)
    
    // Simulate initialization time with realistic loading
    setTimeout(() => {
      setSimulationStarted(true)
      setLoading(false)
    }, 2000) // Slightly longer to show the enhanced loading
  }

  const handleBackToPrompt = () => {
    setSimulationStarted(false)
    setInitialPrompt(null)
    // Clear URL params
    window.history.replaceState({}, '', '/dashboard')
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen"
          >
            {/* Enhanced Loading Screen with Smart Analysis Theme */}
            <div className="text-center space-y-8 max-w-md mx-auto px-6">
              {/* Animated Logo/Icon */}
              <div className="relative">
                <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Brain className="h-12 w-12 text-white" />
                </div>
                
                {/* Pulse animations */}
                <div className="absolute inset-0 w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl animate-ping opacity-20"></div>
                <div className="absolute inset-2 w-20 h-20 mx-auto bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl animate-ping opacity-30 animation-delay-300"></div>
              </div>

              {/* Loading Animation */}
              <div className="space-y-6">
                <div className="flex justify-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce"></div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    🧠 Initializing Smart Policy Analyzer
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {initialPrompt 
                      ? "Preparing AI analysis for your policy question..." 
                      : "Loading data models and preparing analysis engines..."
                    }
                  </p>
                  {initialPrompt && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 italic bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      "{initialPrompt}"
                    </p>
                  )}
                </div>
              </div>

              {/* Progress Steps */}
              <div className="space-y-4 max-w-xs mx-auto">
                <div className="flex items-center space-x-3 text-sm">
                  <Activity className="h-5 w-5 text-green-500" />
                  <span className="text-[var(--text-secondary)]">Database connection established</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <BarChart3 className="h-5 w-5 text-green-500" />
                  <span className="text-[var(--text-secondary)]">Loading cross-domain indicators</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="flex space-x-1">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <Users className="h-4 w-4 text-purple-500" />
                    <Heart className="h-4 w-4 text-red-500" />
                    <Leaf className="h-4 w-4 text-green-500" />
                  </div>
                  <span className="text-[var(--text-secondary)]">Syncing economy, education, health & environment data</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Brain className="h-5 w-5 text-blue-500 animate-pulse" />
                  <span className="text-[var(--text-secondary)]">
                    {initialPrompt ? "Preparing AI question analysis" : "Preparing AI analysis tools"}
                  </span>
                </div>
              </div>

              {/* Loading Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
              </div>
            </div>
          </motion.div>
        ) : !simulationStarted ? (
          <motion.div
            key="hero"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <HeroPrompt onStartSimulation={handleStartSimulation} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
          

            <DashboardView initialPrompt={initialPrompt || undefined} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}