"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowRight, Paperclip, Send, Menu, X, Sparkles, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSimulation } from "../app/api/hooks/useSimulation";
import TestGrid from "./TestGrid"; // Assuming you have a TestGrid component


type SamplePrompt = {
  text: string;
};

const samplePrompts: SamplePrompt[] = [
  { text: "How does US education spending impact GDP growth rates?" },
  { text: "What's the relationship between American healthcare investment and life expectancy?" },
  { text: "How do US environmental policies affect economic indicators?" },
  { text: "What factors contribute to reducing unemployment rates in America?" },
  { text: "How does literacy rate correlate with economic development in the United States?" }
];

interface HeroPromptProps {
  onStartSimulation: (prompt?: string) => void;
}

export default function HeroPrompt({ onStartSimulation }: HeroPromptProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSampleQuestions, setShowSampleQuestions] = useState(false);
  const [focusedSample, setFocusedSample] = useState<number | null>(null);
  const [charCount, setCharCount] = useState(0);
  const [languageWarning, setLanguageWarning] = useState("");
  const { data, loading, run } = useSimulation();  // Function to detect if text is in English
  const isEnglish = (text: string): boolean => {
    // More comprehensive English pattern including various dashes, quotes, and symbols
    const englishPattern = /^[a-zA-Z0-9\s.,!?;:'"()\-–—\u2010-\u2015\u2018-\u201F%$&@#\/\\]+$/;
    const commonEnglishWords = [
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'how', 'what', 'when', 'where', 'why', 'who', 'which', 'that', 'this', 'these',
      'those', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have',
      'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
      'might', 'can', 'must', 'shall', 'policy', 'government', 'economic', 'social',
      'infrastructure', 'spending', 'tax', 'incentive', 'gdp', 'growth', 'tech',
      'sector', 'job', 'creation', 'urban', 'rural', 'regions', 'years', 'increase',
      'nationwide', 'technology', 'startups', 'affect', 'combined'
    ];
    
    // Check if text contains only valid English characters (including various dashes and punctuation)
    if (!englishPattern.test(text)) {
      return false;
    }
    
    // Check if text contains at least one common English word
    const words = text.toLowerCase().split(/\s+/);
    const hasEnglishWords = words.some(word => 
      commonEnglishWords.includes(word.replace(/[.,!?;:'"()\-–—%$&@#\/\\]/g, ''))
    );
    
    return hasEnglishWords;
  };

  // Function to check if the input forms a complete question
  const isCompleteQuestion = (text: string): boolean => {
    const trimmed = text.trim();
    
    // Must be at least 10 characters long
    if (trimmed.length < 10) return false;
    
    // Must contain at least 3 words
    const words = trimmed.split(/\s+/).filter(word => word.length > 0);
    if (words.length < 3) return false;
    
    // Should end with question mark OR contain question words OR be a statement that implies a question
    const endsWithQuestionMark = trimmed.endsWith('?');
    const containsQuestionWords = /\b(how|what|when|where|why|who|which|does|do|did|is|are|was|were|will|would|could|should|can)\b/i.test(trimmed);
    const isStatement = trimmed.length > 15 && words.length >= 4; // Longer statements that imply questions
    
    return endsWithQuestionMark || containsQuestionWords || isStatement;
  };
  // Function to detect if question is about policy domains (economy, education, environment, health)
  const isPolicyDomainQuestion = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    
    // Economy-related keywords
    const economyKeywords = [
      'economy', 'economic', 'gdp', 'growth', 'employment', 'unemployment', 'job', 'jobs',
      'tax', 'taxes', 'taxation', 'budget', 'spending', 'investment', 'finance', 'financial',
      'income', 'salary', 'wage', 'wages', 'inflation', 'deflation', 'recession', 'market',
      'business', 'industry', 'trade', 'commerce', 'export', 'import', 'debt', 'deficit',
      'surplus', 'fiscal', 'monetary', 'revenue', 'profit', 'cost', 'price', 'startup',
      'entrepreneurship', 'innovation', 'technology sector', 'manufacturing', 'agriculture',
      'banking', 'insurance', 'real estate', 'stock market', 'bonds', 'securities'
    ];

    // Education-related keywords
    const educationKeywords = [
      'education', 'educational', 'school', 'schools', 'university', 'universities', 'college',
      'colleges', 'student', 'students', 'teacher', 'teachers', 'learning', 'literacy',
      'curriculum', 'graduation', 'degree', 'diploma', 'tuition', 'scholarship', 'grant',
      'funding', 'academic', 'achievement', 'performance', 'test scores', 'standardized test',
      'classroom', 'kindergarten', 'elementary', 'secondary', 'higher education', 'vocational',
      'training', 'skill development', 'research', 'science education', 'stem', 'arts education',
      'special education', 'online learning', 'distance learning', 'educational technology'
    ];

    // Environment-related keywords
    const environmentKeywords = [
      'environment', 'environmental', 'climate', 'pollution', 'emissions', 'carbon', 'greenhouse',
      'renewable', 'energy', 'solar', 'wind', 'sustainability', 'sustainable', 'conservation',
      'biodiversity', 'ecosystem', 'wildlife', 'forest', 'deforestation', 'recycling',
      'waste', 'landfill', 'water quality', 'air quality', 'clean air', 'clean water',
      'toxic', 'contamination', 'pesticides', 'chemicals', 'green technology', 'electric vehicles',
      'fossil fuels', 'oil', 'gas', 'coal', 'nuclear', 'hydroelectric', 'geothermal',
      'environmental protection', 'epa', 'national parks', 'protected areas', 'endangered species'
    ];

    // Health-related keywords
    const healthKeywords = [
      'health', 'healthcare', 'medical', 'medicine', 'hospital', 'hospitals', 'doctor',
      'doctors', 'nurse', 'nurses', 'patient', 'patients', 'disease', 'illness', 'treatment',
      'therapy', 'drug', 'drugs', 'medication', 'prescription', 'vaccine', 'vaccination',
      'immunization', 'epidemic', 'pandemic', 'public health', 'mental health', 'obesity',
      'diabetes', 'cancer', 'heart disease', 'stroke', 'mortality', 'life expectancy',
      'infant mortality', 'maternal health', 'elderly care', 'disability', 'insurance',
      'medicare', 'medicaid', 'affordable care act', 'obamacare', 'health policy',
      'prevention', 'wellness', 'nutrition', 'fitness', 'smoking', 'tobacco', 'alcohol'
    ];

    // Check if text contains any policy domain keywords
    const allPolicyKeywords = [
      ...economyKeywords,
      ...educationKeywords,
      ...environmentKeywords,
      ...healthKeywords
    ];

    return allPolicyKeywords.some(keyword => lowerText.includes(keyword));
  };

  // Function to detect if question is about a country other than the US
  const isAboutNonUSCountry = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    
    // List of countries and their variations (excluding US)
    const nonUSCountries = [
      // Major countries
      'canada', 'canadian', 'mexico', 'mexican', 'brazil', 'brazilian', 'argentina', 'argentinian',
      'uk', 'united kingdom', 'britain', 'british', 'england', 'english', 'scotland', 'scottish',
      'ireland', 'irish', 'france', 'french', 'germany', 'german', 'italy', 'italian',
      'spain', 'spanish', 'portugal', 'portuguese', 'netherlands', 'dutch', 'belgium', 'belgian',
      'switzerland', 'swiss', 'austria', 'austrian', 'sweden', 'swedish', 'norway', 'norwegian',
      'denmark', 'danish', 'finland', 'finnish', 'russia', 'russian', 'poland', 'polish',
      'ukraine', 'ukrainian', 'czech', 'slovakia', 'hungary', 'hungarian', 'romania', 'romanian',
      'greece', 'greek', 'turkey', 'turkish', 'israel', 'israeli', 'egypt', 'egyptian',
      'saudi arabia', 'saudi', 'iran', 'iranian', 'iraq', 'iraqi', 'afghanistan', 'afghan',
      'pakistan', 'pakistani', 'india', 'indian', 'china', 'chinese', 'japan', 'japanese',
      'south korea', 'korean', 'north korea', 'thailand', 'thai', 'vietnam', 'vietnamese',
      'philippines', 'filipino', 'indonesia', 'indonesian', 'malaysia', 'malaysian',
      'singapore', 'australia', 'australian', 'new zealand', 'south africa', 'african',
      'nigeria', 'nigerian', 'kenya', 'kenyan', 'ethiopia', 'ethiopian',
      // European Union
      'european union', 'eu', 'europe', 'european',
      // Regions that might indicate non-US focus
      'asia', 'asian', 'africa', 'latin america', 'middle east'
    ];

    // US terms that should NOT trigger the warning
    const usTerms = [
      'united states', 'america', 'american', 'usa', 'us', 'state', 'states', 'federal',
      'washington', 'congress', 'senate', 'house', 'biden', 'trump', 'california', 'texas',
      'new york', 'florida', 'illinois', 'pennsylvania', 'ohio', 'georgia', 'north carolina',
      'michigan', 'virginia', 'washington state', 'arizona', 'massachusetts', 'indiana',
      'tennessee', 'missouri', 'maryland', 'wisconsin', 'colorado', 'minnesota', 'south carolina',
      'alabama', 'louisiana', 'kentucky', 'oregon', 'oklahoma', 'connecticut', 'utah',
      'iowa', 'nevada', 'arkansas', 'mississippi', 'kansas', 'new mexico', 'nebraska',
      'west virginia', 'idaho', 'hawaii', 'new hampshire', 'maine', 'montana', 'rhode island',
      'delaware', 'south dakota', 'north dakota', 'alaska', 'vermont', 'wyoming'
    ];

    // First check if it's clearly about the US
    const mentionsUS = usTerms.some(term => lowerText.includes(term));
    
    // If no explicit US mention, check for non-US countries
    if (!mentionsUS) {
      return nonUSCountries.some(country => lowerText.includes(country));
    }
    
    // If US is mentioned, still check if other countries are also mentioned
    // This handles cases like "compared to Canada" or "unlike Germany"
    const mentionsOtherCountry = nonUSCountries.some(country => lowerText.includes(country));
    
    return mentionsOtherCountry && !mentionsUS;
  };  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setCharCount(value.length);
    
    // Only validate if there's input and it looks like a complete question
    if (value.trim() && isCompleteQuestion(value)) {
      if (!isEnglish(value)) {
        setLanguageWarning("Please enter your question in English only.");
      } else if (isAboutNonUSCountry(value)) {
        setLanguageWarning("This platform focuses on US policy analysis. Please ask questions about United States policies.");
      } else if (!isPolicyDomainQuestion(value)) {
        setLanguageWarning("Please ask questions related to US policy areas: Economy, Education, Environment, or Health.");
      } else {
        setLanguageWarning("");
      }
    } else {
      setLanguageWarning("");
    }
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
      }      // Ctrl/Cmd + Enter to send
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && inputValue.trim() && isCompleteQuestion(inputValue.trim()) && !loading && !languageWarning) {
        handleSend();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSampleQuestions, inputValue, loading, languageWarning]);  const handleSend = async () => {
    if (!inputValue.trim()) {
      console.log("⚠️ Cannot start simulation: No question provided");
      return;
    }
    
    // Check if the input is in English
    if (!isEnglish(inputValue.trim())) {
      setLanguageWarning("Please enter your question in English only.");
      return;
    }
    
    // Check if the question is about a non-US country
    if (isAboutNonUSCountry(inputValue.trim())) {
      setLanguageWarning("This platform focuses on US policy analysis. Please ask questions about United States policies.");
      return;
    }
    
    // Check if the question is about policy domains
    if (!isPolicyDomainQuestion(inputValue.trim())) {
      setLanguageWarning("Please ask questions related to US policy areas: Economy, Education, Environment, or Health.");
      return;
    }
    
    // Clear any warnings and proceed
    setLanguageWarning("");
    console.log("🚀 Starting simulation with prompt:", inputValue);
    await run(inputValue.trim());
    onStartSimulation(inputValue.trim());
  };const handleSampleClick = useCallback(async (promptText: string) => {
    if (loading) return;
    setInputValue(promptText);
    setCharCount(promptText.length);
    setLanguageWarning(""); // Clear any warnings for sample questions
    console.log("🚀 Starting simulation with sample prompt:", promptText);
    await run(promptText);
    onStartSimulation(promptText);
  }, [loading, onStartSimulation, run]);

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
        </h3>        <p className="text-md text-gray-500 dark:text-gray-500 max-w-xl mx-auto">
          Ask any US policy question and get AI-powered insights with real-time data analysis across economy, health, education, and environment domains.
        </p>
      </motion.div>
      
      {/* Input Section */}      <motion.div 
        className="w-full max-w-2xl relative"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        whileHover={{ scale: 1.02 }}
      >        <motion.input
          type="text"
          placeholder="Ask a US policy question... (e.g., How does US education spending affect economic growth?)"
          value={inputValue}
          onChange={handleInputChange}
          disabled={loading}className={`w-full px-6 py-4 pr-24 rounded-full border-2 ${
            loading 
              ? 'border-blue-300 dark:border-blue-600' 
              : languageWarning
              ? 'border-red-300 dark:border-red-600 focus:border-red-500'
              : 'border-gray-200 dark:border-gray-700 focus:border-blue-500'
          } bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 ${
            languageWarning ? 'focus:ring-red-500' : 'focus:ring-blue-500'
          } text-gray-900 dark:text-white placeholder:text-gray-400 shadow-lg transition-all duration-200 ${
            loading ? 'opacity-75 cursor-not-allowed' : ''
          }`}          onKeyPress={(e) => {
            if (e.key === 'Enter' && !loading && inputValue.trim() && isCompleteQuestion(inputValue.trim()) && !languageWarning) handleSend();
          }}
          animate={{
            boxShadow: loading 
              ? "0 0 20px rgba(59, 130, 246, 0.3)" 
              : languageWarning
              ? "0 0 15px rgba(239, 68, 68, 0.3)"
              : "0 10px 25px rgba(0, 0, 0, 0.1)"
          }}
        />

        {/* Language Warning */}
        <AnimatePresence>
          {languageWarning && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm"
            >
              <AlertTriangle size={16} />
              {languageWarning}
            </motion.div>
          )}
        </AnimatePresence><div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
          <button 
            onClick={handleAttach}
            disabled={loading}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition mr-1 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Attach file"
          >
            <Paperclip size={18} className="text-gray-500" />
          </button>          <button 
            onClick={handleSend}
            disabled={loading || !inputValue.trim() || !isCompleteQuestion(inputValue.trim()) || !!languageWarning}
            className={`p-2 rounded-full transition disabled:cursor-not-allowed ${
              inputValue.trim() && !loading && !languageWarning && isCompleteQuestion(inputValue.trim())
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg' 
                : 'bg-gray-200 dark:bg-gray-600 text-gray-400 hover:bg-gray-300'
            } ${loading ? 'animate-pulse' : ''}`}
            aria-label="Send message"
          >
            {loading ? (
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
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !loading && handleSampleClick(prompt.text)}
                onMouseEnter={() => setFocusedSample(idx)}
                onMouseLeave={() => setFocusedSample(null)}
                disabled={loading}
                whileHover={!loading ? { scale: 1.05, y: -2 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
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
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🧠</span>
          </div>
          <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">AI-Powered Analysis</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Advanced AI understands your policy questions and provides contextual insights
          </p>
        </div>
        
        <div className="text-center p-4">
          <div className="w-8 h-8 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">📊</span>
          </div>
          <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Real-Time Data</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Access live data across economy, health, education, and environment domains
          </p>
        </div>
        
        <div className="text-center p-4">
          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🎯</span>
          </div>
          <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Actionable Insights</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Get evidence-based recommendations and policy impact predictions
          </p>
        </div>
      </motion.div>
      
    </div>
  );
}