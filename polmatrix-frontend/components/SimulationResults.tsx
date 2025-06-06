"use client"

import { motion } from "framer-motion";
import { useState } from "react";

export default function SimulationResults({ summary, isLoading }: { summary: string | null; isLoading: boolean }) {
  const mockImpactScore = 85; // 👉 Later you can wire real values!
  const mockConfidence = 92; // 👉 Later you can wire real values!
  
  // State for hover effects
  const [hoveredFinding, setHoveredFinding] = useState<number | null>(null);
  
  // Mock data for key findings
  const mockFindings = [
    { icon: "📈", text: "GDP growth linked to literacy rate", sentiment: "Positive" },
    { icon: "⚠️", text: "Unemployment slightly rising", sentiment: "Neutral" },
    { icon: "🔥", text: "Inflation risk detected", sentiment: "Risky" },
  ];
  
  // Function to determine badge color based on sentiment
  function badgeColor(sentiment: string) {
    if (sentiment === "Positive") return "text-green-400";
    if (sentiment === "Neutral") return "text-yellow-400";
    if (sentiment === "Risky") return "text-red-400";
    return "text-gray-400";
  }
  
  // Function to determine badge style based on sentiment
  function badgeStyle(sentiment: string) {
    if (sentiment === "Positive") return "bg-green-100 text-green-600";
    if (sentiment === "Neutral") return "bg-yellow-100 text-yellow-600";
    if (sentiment === "Risky") return "bg-red-100 text-red-600";
    return "bg-gray-100 text-gray-600";
  }

  if (isLoading) {
    return (
      <motion.aside
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="p-6 mt-10 bg-[var(--card-bg)] text-[var(--text-primary)] rounded-xl shadow-lg min-h-[300px]"
      >
        {/* Enhanced loading state with skeleton UI */}
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-6 h-6 bg-[var(--accent-color)] rounded-full animate-pulse"></div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Running simulation...</h2>
        </div>

        <div className="space-y-6">
          {/* Score skeleton */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1 p-4 bg-[var(--bg-secondary)] rounded-lg shadow-md animate-pulse h-24"></div>
            <div className="flex-1 p-4 bg-[var(--bg-secondary)] rounded-lg shadow-md animate-pulse h-24"></div>
          </div>
          
          {/* Summary skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-[var(--bg-secondary)] rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-[var(--bg-secondary)] rounded animate-pulse w-full"></div>
            <div className="h-4 bg-[var(--bg-secondary)] rounded animate-pulse w-5/6"></div>
            <div className="h-4 bg-[var(--bg-secondary)] rounded animate-pulse w-4/5"></div>
          </div>
          
          {/* Findings skeleton */}
          <div className="mt-8 space-y-4">
            <div className="h-6 bg-[var(--bg-secondary)] rounded animate-pulse w-1/4 mb-3"></div>
            <div className="h-16 bg-[var(--bg-secondary)] rounded animate-pulse"></div>
            <div className="h-16 bg-[var(--bg-secondary)] rounded animate-pulse"></div>
            <div className="h-16 bg-[var(--bg-secondary)] rounded animate-pulse"></div>
          </div>
        </div>
      </motion.aside>
    );
  }

  return (
    <motion.aside
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-6 mt-10 bg-[var(--card-bg)] text-[var(--text-primary)] rounded-xl shadow-lg"
    >
      {/* Impact Score + Confidence */}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        {/* Impact Score Card with animated gauge */}
        <motion.div 
          className="flex-1 p-4 bg-[var(--bg-secondary)] rounded-lg shadow-md"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 text-center">Overall Impact Score</h3>
          <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle 
                cx="50" cy="50" r="45" 
                fill="none" 
                stroke="var(--input-bg)" 
                strokeWidth="10" 
              />
              {/* Progress arc */}
              <motion.circle 
                cx="50" cy="50" r="45" 
                fill="none" 
                stroke="var(--accent-color)" 
                strokeWidth="10" 
                strokeLinecap="round"
                strokeDasharray="282.7"
                initial={{ strokeDashoffset: 282.7 }}
                animate={{ strokeDashoffset: 282.7 - (282.7 * mockImpactScore / 100) }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                transform="rotate(-90 50 50)"
              />
              {/* Score text rendered inside the circle */}
              <text 
                x="50" y="50" 
                dominantBaseline="middle" 
                textAnchor="middle" 
                fill="var(--text-primary)" 
                fontSize="18" 
                fontWeight="bold"
              >
                {mockImpactScore}
              </text>
              <text 
                x="50" y="65" 
                dominantBaseline="middle" 
                textAnchor="middle" 
                fill="var(--text-secondary)" 
                fontSize="10"
              >
                out of 100
              </text>
            </svg>
          </div>
        </motion.div>

        {/* Confidence Progress with animation */}
        <motion.div 
          className="flex-1 p-4 bg-[var(--bg-secondary)] rounded-lg shadow-md"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-4">Prediction Confidence</h3>
          <div className="w-full bg-[var(--input-bg)] rounded-full h-6 overflow-hidden mb-2">
            <motion.div
              className="bg-[var(--accent-color)] h-6 rounded-full flex items-center justify-end pr-2"
              initial={{ width: 0 }}
              animate={{ width: `${mockConfidence}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <span className="text-xs font-bold text-white">{mockConfidence}%</span>
            </motion.div>
          </div>
          <div className="flex justify-between text-xs text-[var(--text-secondary)]">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
        </motion.div>
      </div>

      {/* Colored separator line */}
      <div className="w-full h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full my-8"></div>

      {/* AI Summary Text with animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-[var(--text-primary)] flex items-center">
          <span className="mr-2 text-[var(--accent-color)]">📊</span>
          Simulation Results
        </h2>

        {summary ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-[var(--text-secondary)] whitespace-pre-line leading-relaxed bg-[var(--bg-secondary)] p-4 rounded-lg shadow-sm border-l-4 border-[var(--accent-color)]">{summary}</p>
          </motion.div>
        ) : (
          <p className="text-[var(--text-secondary)] italic">No summary available yet.</p>
        )}
      </motion.div>
      
      {/* Colored separator line */}
      <div className="w-full h-1 bg-gradient-to-r from-green-400 via-teal-500 to-blue-500 rounded-full my-8"></div>
      
      {/* Key Findings with hover effects */}
      <motion.div 
        className="mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)] flex items-center">
          <span className="mr-2 text-[var(--accent-color)]">🔍</span>
          Key Findings
        </h3>
        <ul className="space-y-4">
          {mockFindings.map((finding, index) => (
            <motion.li 
              key={index} 
              className="flex items-center gap-4 bg-[var(--bg-secondary)] p-4 rounded-lg cursor-pointer"
              whileHover={{ 
                scale: 1.02, 
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              onHoverStart={() => setHoveredFinding(index)}
              onHoverEnd={() => setHoveredFinding(null)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + (index * 0.1) }}
            >
              <div className="p-3 bg-[var(--card-bg)] rounded-full">
                <span className="text-2xl">{finding.icon}</span>
              </div>
              <div className="flex-1">
                <span className="text-[var(--text-primary)] font-medium">{finding.text}</span>
                <div className="flex items-center justify-between mt-2">
                  <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${badgeStyle(finding.sentiment)}`}>
                    {finding.sentiment}
                  </span>
                  {hoveredFinding === index && (
                    <motion.span 
                      className="text-[var(--accent-color)] text-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      Tap for details →
                    </motion.span>
                  )}
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Colored separator line */}
      <div className="w-full h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-full my-8"></div>

      {/* Download/Share buttons */}
      <motion.div 
        className="mt-8 pt-4 border-t border-[var(--border-color)] flex justify-end space-x-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
      >
        <button className="px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-md hover:bg-opacity-80 transition-all flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Export
        </button>
        <button className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-md hover:bg-opacity-90 transition-all flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
      </motion.div>
    </motion.aside>
  );
}
