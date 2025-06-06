const express = require("express");
const db = require("./db");
const app = express()

require('dotenv').config()
const cors = require("cors")

// Import route files
const economyRoutes = require("./routes/economy")
const healthRoutes = require("./routes/health")
const educationRoutes = require("./routes/education")
const environmentRoutes = require("./routes/environment")
const policyRoutes = require("./routes/policy")
const aiRoutes = require("./routes/ai")

// Middleware
app.use(cors())
app.use(express.json())

// API Routes (these should be your ONLY route definitions)
app.use("/api/economy", economyRoutes)
app.use("/api/health", healthRoutes)        
app.use("/api/education", educationRoutes)  
app.use("/api/environment", environmentRoutes) 
app.use("/api/policy", policyRoutes)
app.use("/api/ai", aiRoutes)

const PORT = process.env.PORT || 3000;

// Root test endpoint
app.get("/", async (req, res) => {
  const result = await db.query("SELECT NOW()");
  res.json({ message: "PolMatrix API is live!", time: result.rows[0] });
});

// Debug endpoint to list all tables
app.get("/debug/tables", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    res.json({ 
      tables: result.rows.map(row => row.table_name),
      count: result.rows.length 
    });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Debug endpoint to check data counts
app.get("/debug/data-count", async (req, res) => {
  try {
    const tables = ['economy', 'health', 'education', 'environment', 'geography', 'time'];
    const counts = {};
    
    for (const table of tables) {
      const result = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
      counts[table] = parseInt(result.rows[0].count);
    }
    
    res.json({ tableCounts: counts });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Debug endpoint for one-time data population
app.post("/debug/populate-tables", async (req, res) => {
  try {
    // Get all geography and time combinations from economy table
    const economyData = await db.query(`
      SELECT DISTINCT geography_id, time_id 
      FROM economy 
      ORDER BY geography_id, time_id
    `);

    let healthCount = 0;
    let educationCount = 0;
    let environmentCount = 0;

    for (const row of economyData.rows) {
      const { geography_id, time_id } = row;

      // Insert health data
      try {
        await db.query(`
          INSERT INTO health (geography_id, time_id, life_expectancy, disease_rate, healthcare_spending, vaccination_rate, source)
          VALUES ($1, $2, $3, $4, $5, $6, 'mock_data')
        `, [
          geography_id, 
          time_id,
          Math.random() * 20 + 65, // life_expectancy: 65-85
          Math.random() * 50 + 10,  // disease_rate: 10-60
          Math.random() * 5000 + 1000, // healthcare_spending: 1000-6000
          Math.random() * 30 + 70   // vaccination_rate: 70-100
        ]);
        healthCount++;
      } catch (e) {
        // Record might already exist
      }

      // Insert education data
      try {
        await db.query(`
          INSERT INTO education (geography_id, time_id, literacy_rate, education_spending, school_enrollment_rate, higher_education_attainment, source)
          VALUES ($1, $2, $3, $4, $5, $6, 'mock_data')
        `, [
          geography_id,
          time_id,
          Math.random() * 20 + 80,  // literacy_rate: 80-100
          Math.random() * 3000 + 500, // education_spending: 500-3500
          Math.random() * 20 + 80,  // school_enrollment_rate: 80-100
          Math.random() * 40 + 20   // higher_education_attainment: 20-60
        ]);
        educationCount++;
      } catch (e) {
        // Record might already exist
      }

      // Insert environment data
      try {
        await db.query(`
          INSERT INTO environment (geography_id, time_id, co2_emissions, air_quality_index, deforestation_rate, renewable_energy_usage, source)
          VALUES ($1, $2, $3, $4, $5, $6, 'mock_data')
        `, [
          geography_id,
          time_id,
          Math.random() * 200 + 50,  // co2_emissions: 50-250
          Math.random() * 150 + 50,  // air_quality_index: 50-200
          Math.random() * 5 + 0.1,   // deforestation_rate: 0.1-5.1
          Math.random() * 80 + 10    // renewable_energy_usage: 10-90
        ]);
        environmentCount++;
      } catch (e) {
        // Record might already exist
      }
    }

    res.json({
      message: "✅ Mock data populated successfully",
      inserted: {
        health: healthCount,
        education: educationCount,
        environment: environmentCount
      }
    });

  } catch (err) {
    console.error("❌ Population Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Debug endpoint to inspect table columns
app.get("/debug/columns/:table", async (req, res) => {
  try {
    const { table } = req.params;
    const result = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = $1 AND table_schema = 'public'
      ORDER BY ordinal_position
    `, [table]);
    
    res.json({ 
      table: table,
      columns: result.rows 
    });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Specific debug endpoints for table columns
app.get("/debug/health-columns", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'health' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    res.json({ columns: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/debug/education-columns", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'education' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    res.json({ columns: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/debug/environment-columns", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'environment' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    res.json({ columns: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Legacy endpoint for testing (keep for now)
app.get("/economy", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM economy LIMIT 10;");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Query error:", err);
    res.status(500).json({ error: "Database query failed." });
  }
});

// Enhanced economy API endpoint with logging and array support
app.get("/api/economy", async (req, res) => {
  console.log("🔍 Economy API called with filters:", req.query);
  
  const { geography_id, time_id } = req.query
  
  try {
    let query = `
      SELECT 
        id as economy_id,
        geography_id,
        time_id,
        CAST(gdp_growth AS DECIMAL) as gdp_growth_rate,
        CAST(unemployment_rate AS DECIMAL) as unemployment_rate,
        CAST(inflation_rate AS DECIMAL) as inflation_rate,
        CAST(trade_balance AS DECIMAL) as trade_balance,
        CAST(foreign_direct_investment AS DECIMAL) as investment_rate,
        CAST(gdp_per_capita AS DECIMAL) as gdp_per_capita,
        source,
        CAST(gdp_growth_filter AS INTEGER) as economic_filter
      FROM economy WHERE 1=1
    `
    const values = []

    if (geography_id) {
      // Handle array of geography_ids from frontend
      if (Array.isArray(geography_id)) {
        const placeholders = geography_id.map((_, i) => `$${values.length + i + 1}`).join(',');
        values.push(...geography_id);
        query += ` AND geography_id IN (${placeholders})`;
      } else {
        values.push(geography_id)
        query += ` AND geography_id = $${values.length}`
      }
    }

    if (time_id) {
      // Handle array of time_ids from frontend
      if (Array.isArray(time_id)) {
        const placeholders = time_id.map((_, i) => `$${values.length + i + 1}`).join(',');
        values.push(...time_id);
        query += ` AND time_id IN (${placeholders})`;
      } else {
        values.push(time_id)
        query += ` AND time_id = $${values.length}`
      }
    }

    console.log("🔍 Final query:", query);
    console.log("🔍 Values:", values);

    const result = await db.query(query, values)
    console.log("🔍 Results found:", result.rows.length);
    
    res.json({ data: result.rows })
  } catch (err) {
    console.error("❌ Economy query error:", err)
    res.status(500).json({ error: "Failed to fetch economy data" })
  }
})

// Geography and Time endpoints (these don't have route files)
app.get("/api/geography", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM geography");
    res.json({ data: result.rows });
  } catch (err) {
    console.error("❌ Fetch Geography Error:", err);
    res.status(500).json({ error: "Failed to fetch geography data." });
  }
});

app.get("/api/time", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM time ORDER BY year DESC");
    res.json({ data: result.rows });
  } catch (err) {
    console.error("❌ Fetch Time Error:", err);
    res.status(500).json({ error: "Failed to fetch time data." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
