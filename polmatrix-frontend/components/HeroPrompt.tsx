"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowRight, Paperclip, Send, Menu, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import TestGrid from "./TestGrid"; // Assuming you have a TestGrid component


type SamplePrompt = {
  text: string;
};

const samplePrompts: SamplePrompt[] = [
  { text: "How does education spending impact GDP growth rates?" },
  { text: "What's the relationship between healthcare investment and life expectancy?" },
  { text: "How do environmental policies affect economic indicators?" },
  { text: "What factors contribute to reducing unemployment rates?" },
  { text: "How does literacy rate correlate with economic development?" }
];

interface HeroPromptProps {
  onStartSimulation: (prompt?: string) => void;
}

export default function HeroPrompt({ onStartSimulation }: HeroPromptProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSampleQuestions, setShowSampleQuestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedSample, setFocusedSample] = useState<number | null>(null);
  const [charCount, setCharCount] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setCharCount(value.length);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to hide sample questions
      if (e.key === 'Escape' && showSampleQuestions) {
        setShowSampleQuestions(false);
      }
      // Ctrl/Cmd + K to focus input
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        input?.focus();
      }
      // Ctrl/Cmd + Enter to send
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && inputValue.trim() && !isLoading) {
        handleSend();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSampleQuestions, inputValue, isLoading]);
  const handleSend = async () => {
    if (inputValue.trim()) {
      setIsLoading(true);
      console.log("🚀 Starting simulation with prompt:", inputValue);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing
      onStartSimulation(inputValue.trim());
      setIsLoading(false);
    } else {
      // Start simulation without a specific prompt
      onStartSimulation();
    }
  };
  const handleSampleClick = useCallback(async (promptText: string) => {
    if (isLoading) return;
    setInputValue(promptText);
    setCharCount(promptText.length);
    setIsLoading(true);
    console.log("🚀 Starting simulation with sample prompt:", promptText);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing
    onStartSimulation(promptText);
    setIsLoading(false);
  }, [isLoading, onStartSimulation]);

  const handleAttach = () => {
    console.log("Attach file clicked");
    // You can implement file attachment logic here
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] text-center space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-4"
      >
        <h1 className="text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Polmatrix AI
        </h1>
        <h3 className="text-2xl text-gray-600 dark:text-gray-400">
          Smart Policy Impact Analyzer
        </h3>
        <p className="text-lg text-gray-500 dark:text-gray-500 max-w-2xl mx-auto">
          Ask any policy question and get AI-powered insights with real-time data analysis across economy, health, education, and environment domains.
        </p>
      </motion.div>
      
      {/* Input Section */}      <motion.div 
        className="w-full max-w-2xl relative"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        whileHover={{ scale: 1.02 }}
      >        
        <motion.input
          type="text"
          placeholder="Ask a policy question... (e.g., How does education spending affect economic growth?)"
          value={inputValue}
          onChange={handleInputChange}
          disabled={isLoading}
          className={`w-full px-6 py-4 pr-24 rounded-full border-2 ${
            isLoading 
              ? 'border-blue-300 dark:border-blue-600' 
              : 'border-gray-200 dark:border-gray-700 focus:border-blue-500'
          } bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder:text-gray-400 shadow-lg transition-all duration-200 ${
            isLoading ? 'opacity-75 cursor-not-allowed' : ''
          }`}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !isLoading) handleSend();
          }}
          animate={{
            boxShadow: isLoading 
              ? "0 0 20px rgba(59, 130, 246, 0.3)" 
              : "0 10px 25px rgba(0, 0, 0, 0.1)"
          }}
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
          <button 
            onClick={handleAttach}
            disabled={isLoading}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition mr-1 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Attach file"
          >
            <Paperclip size={18} className="text-gray-500" />
          </button>
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className={`p-2 rounded-full transition disabled:cursor-not-allowed ${
              inputValue.trim() && !isLoading
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg' 
                : 'bg-gray-200 dark:bg-gray-600 text-gray-400 hover:bg-gray-300'
            } ${isLoading ? 'animate-pulse' : ''}`}
            aria-label="Send message"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-[18px] h-[18px] border-2 border-current border-t-transparent rounded-full"
              />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </motion.div>{/* Sample Questions Toggle Button */}
      <motion.button
        onClick={() => setShowSampleQuestions(!showSampleQuestions)}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 text-sm text-gray-600 dark:text-gray-400"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        {showSampleQuestions ? <X size={16} /> : <Menu size={16} />}
        {showSampleQuestions ? 'Hide' : 'Show'} sample questions
      </motion.button>

      {/* Sample Questions */}
      <AnimatePresence>
        {showSampleQuestions && (
          <motion.div 
            className="flex flex-wrap justify-center gap-3 mt-6 max-w-4xl"
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="w-full text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
              Try these sample questions:
            </p>            {samplePrompts.map((prompt, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={`text-sm px-4 py-2 rounded-full border transition-all duration-200 cursor-pointer ${
                  focusedSample === idx
                    ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !isLoading && handleSampleClick(prompt.text)}
                onMouseEnter={() => setFocusedSample(idx)}
                onMouseLeave={() => setFocusedSample(null)}
                disabled={isLoading}
                whileHover={!isLoading ? { scale: 1.05, y: -2 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
              >
                {prompt.text}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
          {/* Feature Highlights */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >        <div className="text-center p-4">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🧠</span>
          </div>
          <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">AI-Powered Analysis</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Advanced AI understands your policy questions and provides contextual insights
          </p>
        </div>
        
        <div className="text-center p-4">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">📊</span>
          </div>
          <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Real-Time Data</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Access live data across economy, health, education, and environment domains
          </p>
        </div>
        
        <div className="text-center p-4">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🎯</span>
          </div>
          <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Actionable Insights</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Get evidence-based recommendations and policy impact predictions
          </p>
        </div>
      </motion.div>
      <TestGrid />
    </div>
  );
}