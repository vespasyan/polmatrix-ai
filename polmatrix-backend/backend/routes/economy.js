const express = require("express")
const router = express.Router()
const db = require("../db")

router.get("/", async (req, res) => {
  console.log("🔍 Economy API called with filters:", req.query);
  
  // Frontend sends 'countries[]' and 'timeIds[]', not 'geography_id' and 'time_id'
  let { 'countries[]': countries, 'timeIds[]': timeIds } = req.query
  
  try {
    let query = `
      SELECT 
      e.id as economy_id,
      e.geography_id,
      e.time_id,
      CAST(e.gdp_growth AS DECIMAL) as gdp_growth_rate,
      CAST(e.unemployment_rate AS DECIMAL) as unemployment_rate,
      CAST(e.inflation_rate AS DECIMAL) as inflation_rate,
      CAST(e.trade_balance AS DECIMAL) as trade_balance,
      CAST(e.foreign_direct_investment AS DECIMAL) as investment_rate,
      CAST(e.gdp_per_capita AS DECIMAL) as gdp_per_capita,
      e.source,
      CAST(e.gdp_growth_filter AS INTEGER) as economic_filter,
      g.country_name,
      t.year,
      CONCAT(g.country_name, ' ', t.year) as label
      FROM economy e
      JOIN geography g ON e.geography_id = g.geography_id  
      JOIN time t ON e.time_id = t.time_id
      WHERE 1=1
    `
    const values = []

    // Handle countries array (geography_id)
    if (countries && countries.length > 0) {
      const geoIds = Array.isArray(countries) ? countries : [countries];
      const placeholders = geoIds.map((_, i) => `$${values.length + i + 1}`).join(',');
      values.push(...geoIds);
      query += ` AND e.geography_id IN (${placeholders})`;
    }

    // Handle timeIds array (time_id)
    if (timeIds && timeIds.length > 0) {
      const tIds = Array.isArray(timeIds) ? timeIds : [timeIds];
      const placeholders = tIds.map((_, i) => `$${values.length + i + 1}`).join(',');
      values.push(...tIds);
      query += ` AND e.time_id IN (${placeholders})`;
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

module.exports = router