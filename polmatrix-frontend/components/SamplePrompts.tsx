"use client"

import { useState } from "react"
import { motion } from "framer-motion"

interface SamplePromptsProps {
  onSelectPrompt: (prompt: string) => void
}

export default function SamplePrompts({ onSelectPrompt }: SamplePromptsProps) {
  const samplePrompts = [
    "What if we increase education spending?",
    "How does CO2 affect health?",
    "Show me unemployment trends in Q2",
    "Compare healthcare outcomes across policies",
    "Simulate tax reduction impact"
  ]

  return (
    <div className="w-full max-w-4xl mx-auto my-4 px-4 overflow-x-auto">
      <div className="flex space-x-3 pb-2">
        {samplePrompts.map((prompt, index) => (
          <motion.button
            key={index}
            onClick={() => onSelectPrompt(prompt)}
            className="px-4 py-2 rounded-full text-sm whitespace-nowrap 
                      bg-[var(--bg-secondary)] border border-[var(--border-color)] 
                      hover:bg-[var(--bg-hover)] hover:border-[var(--accent-color)] 
                      transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {prompt}
          </motion.button>
        ))}
      </div>
    </div>
  )
}