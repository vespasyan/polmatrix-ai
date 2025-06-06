// /app/page.tsx
"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import HeroPrompt from "@/components/HeroPrompt"
import DashboardView from "@/components/DashboardView"

export default function HomePage() {
  const [simulationStarted, setSimulationStarted] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  const handleStartSimulation = () => {
    setSimulationStarted(true);
    setTimeout(() => {
      setShowDashboard(true);
    }, 600); // ⏳ delay of 600ms to match the exit animation
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg-primary)]">
      <AnimatePresence mode="wait">
        {!simulationStarted && (
          <motion.div
            key="hero"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -200 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="absolute inset-0 backdrop-blur-md bg-black/20"
          >
            <HeroPrompt onStartSimulation={handleStartSimulation} />
          </motion.div>
        )}

        {showDashboard && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 200 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <DashboardView />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
