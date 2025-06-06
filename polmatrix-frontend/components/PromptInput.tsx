"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import api from "@lib/api" // assumes you already use axios instance
import SamplePrompts from "./SamplePrompts"


interface PromptInputProps {
  initialPrompt?: string;
  onSubmit?: (prompt: string) => void;
}

export default function PromptInput({ initialPrompt, onSubmit }: PromptInputProps) {
  const [prompt, setPrompt] = useState(initialPrompt || "")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [aiResponse, setAIResponse] = useState("")

  // Handle initialPrompt changes
  useEffect(() => {
    if (initialPrompt && initialPrompt !== prompt) {
      setPrompt(initialPrompt);
      // Optionally auto-submit when initialPrompt is provided
      handleSubmit(new Event('submit') as any);
    }
  }, [initialPrompt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setLoading(true)
    setSubmitted(true)

    if (onSubmit) {
      onSubmit(prompt)
    } else {
      // fallback logic for /dashboard
      try {
        const res = await api.post("/ai/summary", {
          prompt, // assuming backend supports free-form prompt
          geography_id: 1,
          time_id: 4,
          correlations: [
            { correlation_type: "GDP vs Literacy Rate", correlation_value: 0.73 },
            { correlation_type: "Unemployment vs Mental Health", correlation_value: -0.6 },
          ],
        })
        setAIResponse(res.data.summary)
        console.log("✅ AI Response:", res.data.summary)
      } catch (err) {
        console.error("❌ AI Error:", err)
        setAIResponse("AI failed to respond. Try again.")
      } finally {
        setLoading(false)
      }
    }
  }

  const handleSelectPrompt = (selectedPrompt: string) => {
    setPrompt(selectedPrompt)
    // Optional: auto-submit when a sample prompt is selected
    // handleSubmit(new Event('submit') as any)
  }

  return (
    <>
      <SamplePrompts onSelectPrompt={handleSelectPrompt} />
      <div className="fixed bottom-4 left-0 right-0 flex justify-center pointer-events-none z-50">
        <form
          onSubmit={handleSubmit}
          className="relative pointer-events-auto w-full max-w-xl"
        >
          <motion.div
            className="relative"
            initial={{ width: "100%", x: 0 }}
            animate={
              submitted
                ? { width: "280px", x: "-200px", opacity: 0.85 }
                : { width: "100%", x: 0, opacity: 1 }
            }
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask PolMatrix AI..."
              className="w-full px-4 py-3 pr-10 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
              disabled={loading}
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-[var(--accent-color)]" />
            )}
          </motion.div>
          
        </form>
      </div>
      
    </>
    
  )
}
