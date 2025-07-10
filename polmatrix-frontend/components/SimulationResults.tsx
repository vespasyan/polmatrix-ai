"use client"

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function SimulationResults({ summary, isLoading }: { summary: string | null; isLoading: boolean }) {
  const mockImpactScore = 85; // 👉 Later you can wire real values!
  const mockConfidence = 92; // 👉 Later you can wire real values!
  
  // State for hover effects and animations
  const [hoveredFinding, setHoveredFinding] = useState<number | null>(null);
  const [glowEffect, setGlowEffect] = useState(false);
  const [digitalRain, setDigitalRain] = useState<Array<{ id: number; x: number; delay: number }>>([]);

  // Create digital rain effect
  useEffect(() => {
    const rainDrops = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2
    }));
    setDigitalRain(rainDrops);
    
    const glowInterval = setInterval(() => {
      setGlowEffect(prev => !prev);
    }, 3000);
    
    return () => clearInterval(glowInterval);
  }, []);
  
  // Mock data for key findings with enhanced futuristic data
  const mockFindings = [
    { 
      icon: "⚡", 
      text: "GDP growth linked to literacy rate", 
      sentiment: "Positive",
      probability: 94,
      metrics: ["GDP: +2.3%", "Literacy: +15%"],
      threat_level: "LOW"
    },
    { 
      icon: "🚨", 
      text: "Unemployment patterns detected", 
      sentiment: "Neutral",
      probability: 78,
      metrics: ["Unemployment: +1.2%", "Job Creation: -5%"],
      threat_level: "MEDIUM"
    },
    { 
      icon: "🔥", 
      text: "Inflation risk identified", 
      sentiment: "Risky",
      probability: 87,
      metrics: ["Inflation: +3.1%", "Currency: -2%"],
      threat_level: "HIGH"
    },
  ];
  
  // Function to determine badge color based on sentiment
  function badgeColor(sentiment: string) {
    if (sentiment === "Positive") return "text-emerald-400";
    if (sentiment === "Neutral") return "text-cyan-400";
    if (sentiment === "Risky") return "text-red-400";
    return "text-gray-400";
  }
  
  // Function to determine badge style based on sentiment
  function badgeStyle(sentiment: string) {
    if (sentiment === "Positive") return "bg-emerald-500/20 text-emerald-300 border-emerald-500/50";
    if (sentiment === "Neutral") return "bg-cyan-500/20 text-cyan-300 border-cyan-500/50";
    if (sentiment === "Risky") return "bg-red-500/20 text-red-300 border-red-500/50";
    return "bg-gray-500/20 text-gray-300 border-gray-500/50";
  }

  // Function to get threat level styling
  function getThreatLevelStyle(level: string) {
    switch(level) {
      case "LOW": return "bg-emerald-500/30 text-emerald-200 border-emerald-400/50";
      case "MEDIUM": return "bg-yellow-500/30 text-yellow-200 border-yellow-400/50";
      case "HIGH": return "bg-red-500/30 text-red-200 border-red-400/50";
      default: return "bg-gray-500/30 text-gray-200 border-gray-400/50";
    }
  }

  if (isLoading) {
    return (
      <motion.aside
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative p-8 mt-10 bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl text-white rounded-2xl shadow-2xl border border-cyan-500/20 min-h-[400px] overflow-hidden"
      >
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80caff_1px,transparent_1px),linear-gradient(to_bottom,#80caff_1px,transparent_1px)] bg-[size:24px_24px] animate-pulse"></div>
        </div>

        {/* Digital rain effect */}
        <div className="absolute inset-0 overflow-hidden">
          {digitalRain.map((drop) => (
            <motion.div
              key={drop.id}
              className="absolute w-0.5 h-20 bg-gradient-to-b from-cyan-400/60 to-transparent"
              style={{ left: `${drop.x}%` }}
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 500, opacity: [0, 1, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: drop.delay,
                ease: "linear"
              }}
            />
          ))}
        </div>

        {/* Enhanced loading state with futuristic skeleton UI */}
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-8">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-spin">
                <div className="absolute inset-2 bg-slate-900 rounded-full"></div>
              </div>
              <div className="absolute inset-0 bg-cyan-400/20 rounded-full animate-ping"></div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                NEURAL SIMULATION ACTIVE
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-cyan-300 text-sm font-mono">Processing quantum algorithms...</span>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Holographic score displays */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="relative p-6 bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-xl border border-cyan-500/30 backdrop-blur-sm"
                  animate={{ 
                    boxShadow: [
                      "0 0 20px rgba(34, 211, 238, 0.3)",
                      "0 0 40px rgba(34, 211, 238, 0.5)",
                      "0 0 20px rgba(34, 211, 238, 0.3)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="absolute top-2 right-2 w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                  <div className="space-y-4">
                    <div className="h-6 bg-gradient-to-r from-cyan-400/30 to-transparent rounded animate-pulse"></div>
                    <div className="h-16 bg-gradient-to-r from-slate-600/50 to-slate-700/50 rounded-lg animate-pulse"></div>
                    <div className="h-4 bg-gradient-to-r from-cyan-400/20 to-transparent rounded animate-pulse w-3/4"></div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Neural network visualization */}
            <div className="relative p-6 bg-gradient-to-br from-slate-800/30 to-slate-700/30 rounded-xl border border-cyan-500/20">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-blue-400/5 rounded-xl"></div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-cyan-400 rounded-full animate-pulse"></div>
                  <div className="h-4 bg-gradient-to-r from-cyan-400/40 to-transparent rounded animate-pulse w-1/3"></div>
                </div>
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="h-3 bg-gradient-to-r from-slate-600/30 to-transparent rounded"
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
            
            {/* Quantum processing indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="relative p-4 bg-gradient-to-br from-slate-800/40 to-slate-700/40 rounded-lg border border-cyan-500/20"
                  animate={{ 
                    borderColor: ["rgba(34, 211, 238, 0.2)", "rgba(34, 211, 238, 0.6)", "rgba(34, 211, 238, 0.2)"]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                >
                  <div className="h-12 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded animate-pulse"></div>
                  <div className="mt-2 h-2 bg-gradient-to-r from-cyan-400/30 to-transparent rounded animate-pulse"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.aside>
    );
  }

  return (
    <motion.aside
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative p-6 mt-8 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl text-white rounded-2xl shadow-2xl border border-cyan-500/30 overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00d4ff_1px,transparent_1px),linear-gradient(to_bottom,#00d4ff_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Holographic header */}
      <div className="relative z-10 mb-6">
        <motion.div
          className="flex items-center space-x-4 mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-xl">
              🧠
            </div>
            <div className="absolute inset-0 bg-cyan-400/20 rounded-full animate-ping"></div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              NEURAL SIMULATION RESULTS
            </h1>
            <p className="text-cyan-300 font-mono text-sm mt-1">
              QUANTUM ANALYSIS COMPLETE • STATUS: ACTIVE
            </p>
          </div>
        </motion.div>
      </div>      {/* Holographic Impact Score + Confidence */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Quantum Impact Score */}
        <motion.div 
          className="relative p-6 bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-2xl border border-cyan-500/40 backdrop-blur-sm overflow-hidden"
          whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(34, 211, 238, 0.3)" }}
          transition={{ type: "spring", stiffness: 300 }}
          animate={{
            borderColor: glowEffect ? "rgba(34, 211, 238, 0.8)" : "rgba(34, 211, 238, 0.4)"
          }}
        >
          {/* Holographic overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-2xl"></div>
          
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-center mb-4 flex items-center justify-center">
              <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mr-2">
                <span className="text-white text-xs">⚡</span>
              </div>
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                QUANTUM IMPACT INDEX
              </span>
            </h3>
            
            <div className="relative mx-auto w-32 h-32 flex items-center justify-center mb-4">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-4 border-cyan-400/20"></div>
              
              {/* Animated progress ring */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke="rgba(34, 211, 238, 0.1)" 
                  strokeWidth="8" 
                />
                <motion.circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke="url(#impactGradient)" 
                  strokeWidth="8" 
                  strokeLinecap="round"
                  strokeDasharray="282.7"
                  initial={{ strokeDashoffset: 282.7 }}
                  animate={{ strokeDashoffset: 282.7 - (282.7 * mockImpactScore / 100) }}
                  transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                />
                <defs>
                  <linearGradient id="impactGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Center display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span 
                  className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                >
                  {mockImpactScore}
                </motion.span>
                <span className="text-cyan-300 text-xs font-mono">NEURAL UNITS</span>
              </div>
            </div>
            
            <div className="text-center">
              <motion.span 
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/50"
                animate={{ 
                  boxShadow: ["0 0 10px rgba(34, 211, 238, 0.3)", "0 0 20px rgba(34, 211, 238, 0.6)", "0 0 10px rgba(34, 211, 238, 0.3)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                HIGH IMPACT DETECTED
              </motion.span>
            </div>
          </div>
        </motion.div>

        {/* Neural Confidence Matrix */}
        <motion.div 
          className="relative p-6 bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-2xl border border-purple-500/40 backdrop-blur-sm overflow-hidden"
          whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(168, 85, 247, 0.3)" }}
          transition={{ type: "spring", stiffness: 300 }}
          animate={{
            borderColor: glowEffect ? "rgba(168, 85, 247, 0.8)" : "rgba(168, 85, 247, 0.4)"
          }}
        >
          {/* Holographic overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-blue-400/10 rounded-2xl"></div>
          
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-4 flex items-center justify-center">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex items-center justify-center mr-2">
                <span className="text-white text-xs">🎯</span>
              </div>
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                NEURAL CONFIDENCE
              </span>
            </h3>
            
            <div className="relative mb-4">
              <div className="w-full h-10 bg-slate-700/50 rounded-full overflow-hidden border border-purple-500/30">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex items-center justify-end pr-3 relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${mockConfidence}%` }}
                  transition={{ duration: 2, ease: "easeOut", delay: 0.8 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-blue-500/30 rounded-full"
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span className="text-sm font-bold text-white relative z-10">{mockConfidence}%</span>
                </motion.div>
              </div>
              
              {/* Quantum indicators */}
              <div className="flex justify-between text-xs text-purple-300 font-mono mt-1">
                <span>LOW</span>
                <span>MEDIUM</span>
                <span>HIGH</span>
                <span>QUANTUM</span>
              </div>
            </div>
            
            <div className="text-center">
              <motion.span 
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 border border-purple-500/50"
                animate={{ 
                  boxShadow: ["0 0 10px rgba(168, 85, 247, 0.3)", "0 0 20px rgba(168, 85, 247, 0.6)", "0 0 10px rgba(168, 85, 247, 0.3)"]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                QUANTUM VERIFIED
              </motion.span>
            </div>
          </div>
        </motion.div>
      </div>      {/* Neural data stream separator */}
      <div className="relative flex items-center justify-center my-8">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
        <div className="absolute bg-gradient-to-r from-cyan-400 to-blue-400 text-white px-4 py-1 rounded-full text-sm font-mono font-bold">
          DATA STREAM ACTIVE
        </div>
      </div>

      {/* Quantum AI Analysis Report */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative z-10"
      >
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-lg">🧠</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              QUANTUM ANALYSIS REPORT
            </h2>
            <p className="text-cyan-300 font-mono text-sm">Neural network deep learning analysis</p>
          </div>
        </div>

        {summary ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="relative"
          >
            <div className="relative p-6 bg-gradient-to-br from-slate-800/40 to-slate-700/40 rounded-2xl border border-cyan-500/30 backdrop-blur-sm overflow-hidden">
              {/* Holographic overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-blue-400/5 rounded-2xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mr-2"></div>
                  <h3 className="text-lg font-bold text-cyan-300">EXECUTIVE SUMMARY</h3>
                  <div className="ml-auto flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-emerald-300 text-sm font-mono">LIVE</span>
                  </div>
                </div>
                
                <div className="space-y-3 text-slate-200 leading-relaxed">
                  {summary.split('\n').map((line, index) => {
                    const trimmedLine = line.trim();
                    if (!trimmedLine) return null;
                    
                    // Check if this line is a section heading
                    const isKeyFindings = trimmedLine.toLowerCase().includes('**key findings:**') || trimmedLine.toLowerCase().includes('key findings:');
                    const isPotentialLimitations = trimmedLine.toLowerCase().includes('**potential limitations:**') || trimmedLine.toLowerCase().includes('potential limitations:');
                    const isPolicyRecommendations = trimmedLine.toLowerCase().includes('**policy recommendations:**') || trimmedLine.toLowerCase().includes('policy recommendations:');
                    const isNextSteps = trimmedLine.toLowerCase().includes('**next steps:**') || trimmedLine.toLowerCase().includes('next steps:');
                    const isSectionHeading = isKeyFindings || isPotentialLimitations || isPolicyRecommendations || isNextSteps;
                    
                    if (isSectionHeading) {
                      const cleanHeading = trimmedLine.replace(/\*\*/g, '').replace(':', '');
                      let headingIcon = '📋';
                      let headingColor = 'from-cyan-400 to-blue-400';
                      
                      if (isKeyFindings) {
                        headingIcon = '🔍';
                        headingColor = 'from-emerald-400 to-cyan-400';
                      } else if (isPotentialLimitations) {
                        headingIcon = '⚠️';
                        headingColor = 'from-yellow-400 to-orange-400';
                      } else if (isPolicyRecommendations) {
                        headingIcon = '📝';
                        headingColor = 'from-purple-400 to-blue-400';
                      } else if (isNextSteps) {
                        headingIcon = '🚀';
                        headingColor = 'from-blue-400 to-purple-400';
                      }
                      
                      return (
                        <motion.div 
                          key={index} 
                          className="flex items-center gap-3 mt-6 mb-4 p-4 rounded-xl bg-gradient-to-r from-slate-800/60 to-slate-700/60 border border-cyan-500/20"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          <div className="w-8 h-8 bg-gradient-to-r from-slate-700 to-slate-600 rounded-full flex items-center justify-center">
                            <span className="text-lg">{headingIcon}</span>
                          </div>
                          <h4 className={`text-lg font-bold bg-gradient-to-r ${headingColor} bg-clip-text text-transparent`}>
                            {cleanHeading}
                          </h4>
                        </motion.div>
                      );
                    }
                    
                    return (
                      <motion.div 
                        key={index} 
                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-cyan-500/5 transition-colors duration-200"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                      >
                        <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mt-1 flex-shrink-0"></div>
                        <span className="flex-1 text-slate-200">
                          {trimmedLine.includes(':') ? (
                            <>
                              <span className="font-bold text-cyan-300 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                {trimmedLine.split(':')[0]}:
                              </span>
                              <span className="ml-1">
                                {trimmedLine.split(':').slice(1).join(':')}
                              </span>
                            </>
                          ) : (
                            trimmedLine
                          )}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="p-6 bg-gradient-to-br from-slate-800/40 to-slate-700/40 rounded-2xl border border-cyan-500/30 text-center">
            <div className="text-5xl mb-3">🔮</div>
            <p className="text-cyan-300 font-mono italic">Quantum data stream initializing...</p>
          </div>
        )}
      </motion.div>      {/* Neural data stream separator */}
      <div className="relative flex items-center justify-center my-8">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
        <div className="absolute bg-gradient-to-r from-purple-400 to-blue-400 text-white px-4 py-1 rounded-full text-sm font-mono font-bold">
          THREAT ANALYSIS
        </div>
      </div>
      {/* Quantum Threat Assessment Matrix */}
      <motion.div 
        className="relative z-10 mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="relative p-6 bg-gradient-to-br from-slate-800/40 to-slate-700/40 rounded-2xl border border-purple-500/30 backdrop-blur-sm overflow-hidden">
          {/* Holographic overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/5 to-blue-400/5 rounded-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-lg">🔍</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  QUANTUM THREAT MATRIX
                </h3>
                <p className="text-purple-300 font-mono text-sm">Advanced policy risk assessment</p>
              </div>
            </div>
            
            <div className="grid gap-4">
              {mockFindings.map((finding, index) => (
                <motion.div 
                  key={index} 
                  className="group relative bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-2xl border border-purple-500/20 hover:border-purple-500/60 transition-all duration-500 cursor-pointer overflow-hidden"
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 20px 40px -10px rgba(168, 85, 247, 0.3)"
                  }}
                  onHoverStart={() => setHoveredFinding(index)}
                  onHoverEnd={() => setHoveredFinding(null)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + (index * 0.1) }}
                >
                  {/* Holographic scan line */}
                  <motion.div
                    className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent"
                    animate={{
                      x: ['-100%', '100%'],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.5
                    }}
                  />
                  
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Threat icon with animation */}
                      <div className="relative">
                        <motion.div 
                          className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-600 rounded-full flex items-center justify-center group-hover:from-purple-500/20 group-hover:to-blue-500/20 transition-all duration-500"
                          animate={{
                            boxShadow: hoveredFinding === index ? 
                              "0 0 30px rgba(168, 85, 247, 0.5)" : 
                              "0 0 10px rgba(168, 85, 247, 0.2)"
                          }}
                        >
                          <span className="text-2xl">{finding.icon}</span>
                        </motion.div>
                        
                        {/* Probability indicator */}
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {finding.probability}%
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {/* Threat description */}
                        <div className="flex items-start gap-2 mb-3">
                          <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mt-1 flex-shrink-0"></div>
                          <div>
                            <h4 className="text-white font-bold text-base mb-1">{finding.text}</h4>
                            <div className="flex flex-wrap gap-1">
                              {finding.metrics.map((metric, metricIndex) => (
                                <span 
                                  key={metricIndex}
                                  className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded-full text-xs font-mono"
                                >
                                  {metric}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {/* Status indicators */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border ${badgeStyle(finding.sentiment)}`}>
                              <div className={`w-1.5 h-1.5 rounded-full mr-1 ${badgeColor(finding.sentiment).replace('text-', 'bg-')}`}></div>
                              {finding.sentiment.toUpperCase()}
                            </span>
                            
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border ${getThreatLevelStyle(finding.threat_level)}`}>
                              <div className="w-1.5 h-1.5 rounded-full mr-1 bg-current"></div>
                              {finding.threat_level} RISK
                            </span>
                          </div>
                          
                          <AnimatePresence>
                            {hoveredFinding === index && (
                              <motion.div
                                className="flex items-center gap-1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                              >
                                <span className="text-purple-400 font-mono text-sm">ANALYZE</span>
                                <motion.div
                                  className="w-6 h-6 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </motion.div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Neural data stream separator */}
      <div className="relative flex items-center justify-center my-8">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent"></div>
        <div className="absolute bg-gradient-to-r from-emerald-400 to-cyan-400 text-white px-4 py-1 rounded-full text-sm font-mono font-bold">
          SYSTEM ACTIONS
        </div>
      </div>

      {/* Futuristic Control Panel */}
      <motion.div 
        className="relative z-10 mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <div className="relative p-6 bg-gradient-to-br from-slate-800/40 to-slate-700/40 rounded-2xl border border-emerald-500/30 backdrop-blur-sm overflow-hidden">
          {/* Holographic overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 to-cyan-400/5 rounded-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-lg">🎛️</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    QUANTUM CONTROL PANEL
                  </h3>
                  <p className="text-emerald-300 font-mono text-sm">Execute system operations</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-300 font-mono text-sm">ONLINE</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Export Button */}
              <motion.button 
                className="group relative p-4 bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-xl border border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-500 overflow-hidden"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 40px -10px rgba(34, 211, 238, 0.3)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-blue-400/5 rounded-xl"></div>
                
                <div className="relative z-10 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-base font-bold text-cyan-300 mb-1">EXPORT DATA</h4>
                  <p className="text-slate-400 text-xs font-mono">Download quantum analysis</p>
                </div>
                
                <motion.div
                  className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
              
              {/* Share Button */}
              <motion.button 
                className="group relative p-4 bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-xl border border-purple-500/30 hover:border-purple-500/60 transition-all duration-500 overflow-hidden"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 40px -10px rgba(168, 85, 247, 0.3)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/5 to-blue-400/5 rounded-xl"></div>
                
                <div className="relative z-10 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </div>
                  <h4 className="text-base font-bold text-purple-300 mb-1">SHARE NETWORK</h4>
                  <p className="text-slate-400 text-xs font-mono">Broadcast to quantum net</p>
                </div>
                
                <motion.div
                  className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-blue-500"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
              
              {/* Analyze Button */}
              <motion.button 
                className="group relative p-4 bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-xl border border-emerald-500/30 hover:border-emerald-500/60 transition-all duration-500 overflow-hidden"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 40px -10px rgba(16, 185, 129, 0.3)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 to-cyan-400/5 rounded-xl"></div>
                
                <div className="relative z-10 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h4 className="text-base font-bold text-emerald-300 mb-1">DEEP ANALYZE</h4>
                  <p className="text-slate-400 text-xs font-mono">Run advanced algorithms</p>
                </div>
                
                <motion.div
                  className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-500"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.aside>
  );
}
