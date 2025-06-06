const express = require("express")
const router = express.Router()
const axios = require("axios")
const db = require("../db")

// Test endpoint (GET)
router.get("/test", (req, res) => {
  console.log("🧪 AI Test endpoint called");
  res.json({ 
    message: "AI endpoint is working", 
    timestamp: new Date().toISOString(),
    openaiKey: !!process.env.OPENAI_API_KEY 
  });
});

// Original summary endpoint with improved error handling
router.post("/summary", async (req, res) => {
  console.log("🧠 AI Summary called with:", req.body);
  
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OpenAI API Key not found");
    return res.status(500).json({ error: "OpenAI API key not configured" });
  }

  try {
    const { prompt = "Generate a policy analysis summary" } = req.body;
    
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a policy analyst expert. Provide clear, actionable insights based on the data provided."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000
      }
    );

    const summary = response.data.choices[0].message.content;
    console.log("✅ AI Summary generated successfully");
    
    res.json({ summary });
  } catch (error) {
    console.error("❌ OpenAI Error:", error.response?.data || error.message);
    res.status(500).json({ 
      error: "AI Summary failed",
      details: error.response?.data?.error?.message || error.message
    });
  }
});

// Smart question analysis endpoint
router.post("/analyze-question", async (req, res) => {
  console.log("🔍 Question analysis called with:", req.body);
  
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "OpenAI API key not configured" });
  }

  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const analysisPrompt = `
Analyze this policy question and return ONLY a valid JSON response (no markdown, no explanation):

Question: "${question}"

Return exactly this JSON structure:
{
  "domains": ["economy", "health", "education", "environment"],
  "primary_domain": "economy",
  "metrics": ["gdp_growth_rate", "unemployment_rate", "inflation_rate"],
  "time_focus": "recent_trends",
  "geographic_scope": "comparative",
  "visualization_type": "trend_analysis",
  "key_relationships": ["education_spending -> economic_growth"],
  "confidence": 0.85
}

Available domains and their key metrics:
- Economy: gdp_growth_rate, unemployment_rate, inflation_rate, trade_balance, investment_rate, gdp_per_capita
- Health: life_expectancy, maternal_mortality_rate, healthcare_expenditure_per_capita, physician_density, infant_mortality
- Education: literacy_rate, school_enrollment_rate, education_expenditure_per_capita, primary_completion_rate, teacher_student_ratio
- Environment: co2_emissions, renewable_energy_percentage, forest_area_percentage, air_pollution_index, deforestation_rate

Time focus options: "historical_trends", "recent_trends", "current_snapshot", "future_projections"
Visualization types: "trend_analysis", "comparison", "correlation", "distribution", "geographic_mapping"
Geographic scope: "single_country", "comparative", "regional", "global"
`;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a policy analysis expert. Return only valid JSON responses with no additional text or markdown formatting."
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        max_tokens: 800,
        temperature: 0.3
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000
      }
    );

    const analysisText = response.data.choices[0].message.content.trim();
    
    // Clean the response to ensure it's valid JSON
    const cleanedText = analysisText.replace(/```json|```/g, '').trim();
    
    try {
      const analysis = JSON.parse(cleanedText);
      console.log("✅ Question analysis completed:", analysis);
      res.json({ analysis });
    } catch (parseError) {
      console.error("❌ JSON Parse Error:", parseError);
      console.error("❌ Raw response:", analysisText);
      
      // Fallback analysis
      const fallbackAnalysis = {
        domains: ["economy"],
        primary_domain: "economy",
        metrics: ["gdp_growth_rate", "unemployment_rate"],
        time_focus: "recent_trends",
        geographic_scope: "comparative", 
        visualization_type: "trend_analysis",
        key_relationships: [],
        confidence: 0.5
      };
      
      res.json({ analysis: fallbackAnalysis });
    }

  } catch (error) {
    console.error("❌ Question Analysis Error:", error.response?.data || error.message);
    res.status(500).json({ 
      error: "Question analysis failed",
      details: error.response?.data?.error?.message || error.message
    });
  }
});

// Dynamic data fetcher endpoint
router.post("/fetch-relevant-data", async (req, res) => {
  console.log("📊 Data fetch called with:", req.body);
  
  try {
    const { 
      domains = ["economy"], 
      countries = [1, 3, 4], 
      timeRange = { start: 2020, end: 2024 },
      metrics = []
    } = req.body;

    const relevantData = {};

    // Fetch data for each relevant domain
    for (const domain of domains) {
      let query;
      let tableName;
      
      switch (domain) {
        case 'economy':
          tableName = 'economy';
          query = `
            SELECT e.*, g.country_name, t.year,
                   CONCAT(g.country_name, ' ', t.year) as label
            FROM economy e
            JOIN geography g ON e.geography_id = g.geography_id  
            JOIN time t ON e.time_id = t.time_id
            WHERE e.geography_id = ANY($1::int[])
            AND t.year BETWEEN $2 AND $3
            ORDER BY t.year, g.country_name
          `;
          break;
        
        case 'health':
          tableName = 'health';
          query = `
            SELECT h.*, g.country_name, t.year,
                   CONCAT(g.country_name, ' ', t.year) as label
            FROM health h
            JOIN geography g ON h.geography_id = g.geography_id  
            JOIN time t ON h.time_id = t.time_id
            WHERE h.geography_id = ANY($1::int[])
            AND t.year BETWEEN $2 AND $3
            ORDER BY t.year, g.country_name
          `;
          break;
        
        case 'education':
          tableName = 'education';
          query = `
            SELECT e.*, g.country_name, t.year,
                   CONCAT(g.country_name, ' ', t.year) as label
            FROM education e
            JOIN geography g ON e.geography_id = g.geography_id  
            JOIN time t ON e.time_id = t.time_id
            WHERE e.geography_id = ANY($1::int[])
            AND t.year BETWEEN $2 AND $3
            ORDER BY t.year, g.country_name
          `;
          break;

        case 'environment':
          tableName = 'environment';
          query = `
            SELECT e.*, g.country_name, t.year,
                   CONCAT(g.country_name, ' ', t.year) as label
            FROM environment e
            JOIN geography g ON e.geography_id = g.geography_id  
            JOIN time t ON e.time_id = t.time_id
            WHERE e.geography_id = ANY($1::int[])
            AND t.year BETWEEN $2 AND $3
            ORDER BY t.year, g.country_name
          `;
          break;
      }

      if (query) {
        try {
          console.log(`🔍 Fetching ${domain} data for countries:`, countries);
          const result = await db.query(query, [countries, timeRange.start, timeRange.end]);
          relevantData[domain] = {
            count: result.rows.length,
            data: result.rows
          };
          console.log(`✅ Found ${result.rows.length} ${domain} records`);
        } catch (dbError) {
          console.error(`❌ Database error for ${domain}:`, dbError.message);
          relevantData[domain] = {
            count: 0,
            data: [],
            error: dbError.message
          };
        }
      }
    }

    res.json({ 
      success: true,
      data: relevantData,
      summary: {
        totalDomains: domains.length,
        totalRecords: Object.values(relevantData).reduce((sum, domain) => sum + (domain.count || 0), 0),
        countries: countries,
        timeRange: timeRange
      }
    });

  } catch (error) {
    console.error("❌ Data Fetch Error:", error);
    res.status(500).json({ 
      error: "Failed to fetch relevant data",
      details: error.message
    });
  }
});

// AI insights generator endpoint
router.post("/generate-insights", async (req, res) => {
  console.log("💡 Insights generation called");
  
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "OpenAI API key not configured" });
  }

  try {
    const { question, analysis, data } = req.body;

    if (!question || !analysis || !data) {
      return res.status(400).json({ error: "Question, analysis, and data are required" });
    }

    // Prepare data summary for AI analysis
    const dataSummary = Object.entries(data).map(([domain, domainData]) => {
      return `${domain}: ${domainData.count} records from ${domainData.data.length > 0 ? 
        domainData.data[0].country_name : 'unknown'} countries`;
    }).join(', ');

    const insightsPrompt = `
Based on the following policy question and data analysis, provide comprehensive insights:

Question: "${question}"

Analysis Context:
- Primary Domain: ${analysis.primary_domain}
- Key Metrics: ${analysis.metrics.join(', ')}
- Time Focus: ${analysis.time_focus}
- Geographic Scope: ${analysis.geographic_scope}

Available Data: ${dataSummary}

Please provide:
1. Key Findings (2-3 main insights)
2. Policy Recommendations (3-4 actionable suggestions)
3. Potential Limitations (2-3 caveats about the analysis)
4. Next Steps (2-3 recommended follow-up actions)

Keep the response clear, actionable, and evidence-based. Focus on practical policy implications.
`;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a senior policy analyst with expertise in economic, health, education, and environmental policy. Provide clear, evidence-based insights that policymakers can act upon."
          },
          {
            role: "user",
            content: insightsPrompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000
      }
    );

    const insights = response.data.choices[0].message.content;
    console.log("✅ AI Insights generated successfully");
    
    res.json({ 
      insights,
      metadata: {
        question,
        domains: analysis.domains,
        confidence: analysis.confidence || 0.8,
        dataPoints: Object.values(data).reduce((sum, domain) => sum + (domain.count || 0), 0)
      }
    });

  } catch (error) {
    console.error("❌ Insights Generation Error:", error.response?.data || error.message);
    res.status(500).json({ 
      error: "Failed to generate insights",
      details: error.response?.data?.error?.message || error.message
    });
  }
});

module.exports = router