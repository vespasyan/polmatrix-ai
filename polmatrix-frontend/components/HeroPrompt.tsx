"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowRight, Paperclip, Send, Menu, X, Sparkles, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSimulation } from "../app/api/hooks/useSimulation";



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
  const [showDescription, setShowDescription] = useState(false);
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
      'nationwide', 'technology', 'startups', 'affect', 'combined',
      'CO₂', 'carbon', 'emissions', 'renewable', 'energy', 'climate',
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
    <div className="relative flex flex-col items-center justify-center min-h-screen text-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse"></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400/30 rounded-full animate-float"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-400/40 rounded-full animate-float animation-delay-1000"></div>
        <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-purple-400/30 rounded-full animate-float animation-delay-2000"></div>
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-pink-400/40 rounded-full animate-float animation-delay-1500"></div>
        
        {/* Gradient orbs */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 rounded-full blur-3xl animate-pulse animation-delay-500"></div>
      </div>

      {/* Content wrapper - centered vertically */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4 mb-8"
        >
        <div className="relative">
          {/* Holographic effect background */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 blur-2xl animate-pulse"></div>
          
          {/* Main title with multiple layers for visibility */}
          <h1 className="relative text-6xl font-black">
            {/* Background glow layer */}
            <span className="absolute inset-0 text-white opacity-20 blur-sm">
              Simulation AI
            </span>
            
            {/* Main gradient text */}
            <span className="relative inline-block bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent gradient-text-fallback text-glow">
              Simulation AI
            </span>
            
            {/* Fallback solid color text (hidden when gradient works) */}
            <span className="absolute inset-0 text-cyan-300 opacity-0 hover:opacity-100 transition-opacity duration-300">
              Simulation AI
            </span>
            
            {/* Glowing underline effect */}
            <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full opacity-70 animate-pulse shadow-lg"></div>
          </h1>
        </div>
        
        <div className="relative">
          {/* Subtitle with enhanced visibility */}
          <h3 className="text-xl md:text-xl lg:text-xl font-bold">
            {/* Background glow for subtitle */}
            <span className="absolute inset-0 text-slate-200 opacity-30 blur-sm">
              Smart Policy Impact Analyzer
            </span>
            
            {/* Main subtitle text */}
            <span className="relative bg-gradient-to-r from-slate-100 via-cyan-200 to-slate-100 bg-clip-text text-transparent text-glow-white">
              Smart Policy Impact Analyzer
            </span>
            
            {/* Fallback solid color text */}
            <span className="absolute inset-0 text-slate-200 opacity-0 hover:opacity-100 transition-opacity duration-300">
              Smart Policy Impact Analyzer
            </span>
            
            {/* Scan line effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent animate-pulse"></div>
          </h3>
        </div>
        
        {/* Collapsible Description */}
        <div className="flex justify-center">
          <motion.button
            onClick={() => setShowDescription(!showDescription)}
            className="relative flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-600/30 bg-slate-900/20 backdrop-blur-md hover:bg-slate-800/30 hover:border-cyan-400/40 transition-all duration-300 text-slate-300 hover:text-cyan-400 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
          <Sparkles size={14} className="text-cyan-400" />
          <span className="text-sm font-medium">
            {showDescription ? 'Hide Details' : 'Show AI Details'}
          </span>
          <motion.div
            animate={{ rotate: showDescription ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ArrowRight size={12} className="rotate-90" />
          </motion.div>
        </motion.button>
        </div>
        
        <AnimatePresence>
          {showDescription && (
            <motion.div 
              className="relative backdrop-blur-xs bg-white/5 dark:bg-black/100 border border-white/10 rounded-xl p-4 max-w-xl mx-auto"
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-sm text-slate-500 dark:text-slate-300 leading-relaxed">
                <span className="text-cyan-400 font-semibold">Neural-powered insights</span> meet 
                <span className="text-grey-400 font-semibold"> real-time analytics</span>.
                Ask any US policy question and witness AI transform complex data into 
                <span className="text-grey-400 font-semibold"> actionable intelligence</span> across 
                economy, health, education, and environment domains.
              </p>
              {/* Floating particles effect */}
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping"></div>
              <div className="absolute bottom-1 left-1 w-1 h-1 bg-purple-400 rounded-full animate-ping animation-delay-300"></div>
              <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-ping animation-delay-700"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Main Input Section - Centered */}      
      <motion.div 
        className="w-full max-w-2xl relative group mb-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        whileHover={{ scale: 1.01 }}
      >
        {/* Holographic border effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 blur-sm group-hover:blur-md transition-all duration-500"></div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-purple-500/30 animate-pulse"></div>
        
        {/* Scanning line effect */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse animation-delay-500"></div>
        </div>
        
        <motion.input
          type="text"
          placeholder="◉ Initialize neural query interface... (e.g., How does US education spending affect economic growth?)"
          value={inputValue}
          onChange={handleInputChange}
          disabled={loading}
          className={`relative w-full px-6 py-4 pr-24 rounded-full border-2 backdrop-blur-md ${
            loading 
              ? 'border-cyan-400/50 bg-slate-900/40 shadow-[0_0_20px_rgba(34,211,238,0.3)]' 
              : languageWarning
              ? 'border-red-400/50 bg-red-900/20 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
              : 'border-slate-600/30 bg-slate-900/30 hover:bg-slate-800/40 shadow-[0_0_15px_rgba(30,41,59,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]'
          } focus:outline-none focus:ring-2 focus:ring-cyan-400/50 text-slate-100 placeholder:text-slate-400 transition-all duration-500 ${
            loading ? 'opacity-90 cursor-not-allowed animate-pulse' : ''
          } font-mono text-base`}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !loading && inputValue.trim() && isCompleteQuestion(inputValue.trim()) && !languageWarning) handleSend();
          }}
          animate={{
            boxShadow: loading 
              ? "0 0 30px rgba(34, 211, 238, 0.4)" 
              : languageWarning
              ? "0 0 20px rgba(239, 68, 68, 0.4)"
              : "0 10px 25px rgba(0, 0, 0, 0.2)"
          }}
        />

        {/* Neural network visualization */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
          <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse animation-delay-200"></div>
          <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse animation-delay-400"></div>
        </div>

        {/* Enhanced Language Warning */}
        <AnimatePresence>
          {languageWarning && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full left-0 right-0 mt-3 px-4 py-3 bg-gradient-to-r from-red-900/30 to-red-800/30 backdrop-blur-md border border-red-500/30 rounded-xl flex items-center gap-2 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.2)] z-50"
            >
              <div className="w-5 h-5 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle size={14} className="text-red-400" />
              </div>
              <span className="font-medium text-sm">{languageWarning}</span>
              <div className="ml-auto w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Action Buttons */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          <motion.button 
            onClick={handleAttach}
            disabled={loading}
            className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/60 border border-slate-600/30 backdrop-blur-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Paperclip size={16} className="text-slate-300 group-hover:text-cyan-400 transition-colors" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </motion.button>
          
          <motion.button 
            onClick={handleSend}
            disabled={loading || !inputValue.trim() || !isCompleteQuestion(inputValue.trim()) || !!languageWarning}
            className={`p-2 rounded-full transition-all duration-300 disabled:cursor-not-allowed relative overflow-hidden ${
              inputValue.trim() && !loading && !languageWarning && isCompleteQuestion(inputValue.trim())
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]' 
                : 'bg-slate-700/50 border border-slate-600/30 text-slate-400 hover:bg-slate-600/50'
            } ${loading ? 'animate-pulse' : ''}`}
            whileHover={inputValue.trim() && !loading && !languageWarning && isCompleteQuestion(inputValue.trim()) ? { scale: 1.05 } : {}}
            whileTap={inputValue.trim() && !loading && !languageWarning && isCompleteQuestion(inputValue.trim()) ? { scale: 0.95 } : {}}
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-[16px] h-[16px] border-2 border-current border-t-transparent rounded-full"
              />
            ) : (
              <Send size={16} />
            )}
            
            {/* Pulse effect for active button */}
            {inputValue.trim() && !loading && !languageWarning && isCompleteQuestion(inputValue.trim()) && (
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-400/20 animate-pulse"></div>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Sample Questions Toggle - Compact */}
      <motion.button
        onClick={() => setShowSampleQuestions(!showSampleQuestions)}
        className="relative flex items-center gap-2 px-4 py-2 rounded-full border border-slate-600/30 bg-slate-900/20 backdrop-blur-md hover:bg-slate-800/30 hover:border-cyan-400/40 transition-all duration-300 text-slate-300 hover:text-cyan-400 group overflow-hidden"
        style={{ marginTop: languageWarning ? '60px' : '12px' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Icon with rotation effect */}
        <motion.div
          animate={{ rotate: showSampleQuestions ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {showSampleQuestions ? <X size={14} /> : <Menu size={14} />}
        </motion.div>
        
        <span className="relative font-medium text-sm">
          {showSampleQuestions ? 'Close Neural Samples' : 'Access Neural Samples'}
        </span>
        
        {/* Holographic dots */}
        <div className="flex gap-0.5">
          <div className="w-0.5 h-0.5 bg-cyan-400 rounded-full animate-pulse"></div>
          <div className="w-0.5 h-0.5 bg-blue-400 rounded-full animate-pulse animation-delay-200"></div>
          <div className="w-0.5 h-0.5 bg-purple-400 rounded-full animate-pulse animation-delay-400"></div>
        </div>
      </motion.button>

      {/* Sample Questions - Compact Layout */}
      <AnimatePresence>
        {showSampleQuestions && (
          <motion.div 
            className="flex flex-wrap justify-center gap-2 mb-4 max-w-3xl"
            style={{ marginTop: '16px' }}
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-full text-center mb-3 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent h-px top-1/2"></div>
              <p className="relative inline-block bg-slate-900 px-3 text-slate-300 font-medium text-xs">
                <span className="text-cyan-400">◉</span> Neural Query Samples
              </p>
            </div>
            
            {samplePrompts.map((prompt, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={`relative group text-xs px-3 py-2 rounded-lg border transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-sm ${
                  focusedSample === idx
                    ? 'border-cyan-400/50 text-cyan-300 bg-slate-800/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                    : 'border-slate-600/30 text-slate-300 bg-slate-900/20 hover:border-cyan-400/40 hover:text-cyan-400 hover:bg-slate-800/40 hover:shadow-[0_0_8px_rgba(34,211,238,0.1)]'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !loading && handleSampleClick(prompt.text)}
                onMouseEnter={() => setFocusedSample(idx)}
                onMouseLeave={() => setFocusedSample(null)}
                disabled={loading}
                whileHover={!loading ? { scale: 1.01, y: -1 } : {}}
                whileTap={!loading ? { scale: 0.99 } : {}}
              >
                {/* Background gradient effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Content */}
                <span className="relative font-medium">{prompt.text}</span>
                
                {/* Corner indicators */}
                <div className="absolute top-0.5 right-0.5 w-0.5 h-0.5 bg-cyan-400/30 rounded-full group-hover:bg-cyan-400 transition-colors duration-300"></div>
                
                {/* Scan line effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feature Highlights - Compact */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <motion.div 
          className="relative text-center p-4 rounded-xl border border-slate-600/30 bg-slate-900/20 backdrop-blur-md hover:border-cyan-400/40 hover:bg-slate-800/30 transition-all duration-500 group overflow-hidden"
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ duration: 0.3 }}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Icon container */}
          <div className="relative w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all duration-500">
            <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-md flex items-center justify-center text-sm animate-pulse">
              🧠
            </div>
            {/* Orbital rings */}
            <div className="absolute inset-0 rounded-lg border border-cyan-400/20 animate-spin-slow"></div>
          </div>
          
          <h4 className="font-bold text-base bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
            Neural Intelligence
          </h4>
          <p className="text-slate-300 text-xs leading-relaxed">
            Advanced AI consciousness with 
            <span className="text-cyan-400 font-medium"> contextual insights</span>
          </p>
          
          {/* Corner decorations */}
          <div className="absolute top-1.5 right-1.5 w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
        </motion.div>
        
        <motion.div 
          className="relative text-center p-4 rounded-xl border border-slate-600/30 bg-slate-900/20 backdrop-blur-md hover:border-emerald-400/40 hover:bg-slate-800/30 transition-all duration-500 group overflow-hidden"
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ duration: 0.3 }}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Icon container */}
          <div className="relative w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-500">
            <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-green-500 rounded-md flex items-center justify-center text-sm animate-pulse">
              📊
            </div>
            {/* Data flow lines */}
            <div className="absolute inset-0 rounded-lg border border-emerald-400/20 animate-pulse"></div>
          </div>
          
          <h4 className="font-bold text-base bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent mb-2">
            Quantum Data Stream
          </h4>
          <p className="text-slate-300 text-xs leading-relaxed">
            Real-time processing across 
            <span className="text-emerald-400 font-medium"> multi-dimensional domains</span>
          </p>
          
          {/* Corner decorations */}
          <div className="absolute top-1.5 right-1.5 w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></div>
        </motion.div>
        
        <motion.div 
          className="relative text-center p-4 rounded-xl border border-slate-600/30 bg-slate-900/20 backdrop-blur-md hover:border-purple-400/40 hover:bg-slate-800/30 transition-all duration-500 group overflow-hidden"
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ duration: 0.3 }}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Icon container */}
          <div className="relative w-10 h-10 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all duration-500">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-cyan-500 rounded-md flex items-center justify-center text-sm animate-pulse">
              🎯
            </div>
            {/* Target rings */}
            <div className="absolute inset-0 rounded-lg border border-purple-400/20 animate-pulse"></div>
          </div>
          
          <h4 className="font-bold text-base bg-gradient-to-r from-purple-400 to-cyan-500 bg-clip-text text-transparent mb-2">
            Precision Targeting
          </h4>
          <p className="text-slate-300 text-xs leading-relaxed">
            Evidence-based recommendations with 
            <span className="text-purple-400 font-medium"> predictive modeling</span>
          </p>
          
          {/* Corner decorations */}
          <div className="absolute top-1.5 right-1.5 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
        </motion.div>
      </motion.div>
      </div>
      
    </div>
  );
}