"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "../lib/utils";

type SamplePrompt = {
  text: string;
};

const samplePrompts: SamplePrompt[] = [
  { text: "How does education spending impact GDP?" },
  { text: "Simulate a health policy" },
  { text: "Compare CO2 emissions by year" },
  { text: "Analyze tax policy effects" }
];

interface HeroProps {
  onSubmit?: (prompt: string) => void;
}

export default function Hero({ onSubmit }: HeroProps) {
  const [prompt, setPrompt] = useState<string>("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      if (onSubmit) {
        onSubmit(prompt);
      } else {
        router.push(`/dashboard?prompt=${encodeURIComponent(prompt)}`);
      }
    }
  };
  
  const handleSamplePromptClick = (text: string) => {
    setPrompt(text);
    if (onSubmit) {
      onSubmit(text);
    } else {
      router.push(`/dashboard?prompt=${encodeURIComponent(text)}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 bg-background">
      <motion.div 
        className="w-full max-w-4xl text-center space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1 
          className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          Polmatrix AI
        </motion.h1>
        
        <motion.p 
          className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          I'm your policy impact simulator
        </motion.p>

        <motion.button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          Start Simulation
        </motion.button>

        <motion.form 
          onSubmit={handleSubmit} 
          className="w-full max-w-2xl mx-auto mt-12"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="flex w-full rounded-full border border-input bg-background shadow-lg">
            <input
              className="flex-1 px-6 py-4 text-base md:text-lg rounded-l-full focus:outline-none bg-transparent"
              placeholder="How can I help you?"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button 
              type="submit"
              className={cn(
                "h-14 w-14 rounded-full flex items-center justify-center transition-all",
                "bg-primary hover:bg-primary/90 text-primary-foreground",
                "shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]", // Glow effect
                !prompt.trim() && "opacity-70 cursor-not-allowed"
              )}
              disabled={!prompt.trim()}
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </motion.form>

        <motion.div 
          className="flex flex-wrap gap-3 justify-center mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
        >
          {samplePrompts.map((item, index) => (
            <motion.button
              key={index}
              onClick={() => handleSamplePromptClick(item.text)}
              className="px-5 py-2.5 text-sm bg-secondary/50 hover:bg-secondary/80 rounded-full transition-all border border-border hover:shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {item.text}
            </motion.button>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}