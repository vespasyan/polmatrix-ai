const express = require("express")
const router = express.Router()
const db = require("../db")

router.get("/", async (req, res) => {
  console.log("🔍 Health API called with filters:", req.query);
  
  let { 'countries[]': countries, 'timeIds[]': timeIds } = req.query

  try {
    let query = `
      SELECT 
        h.id as health_id,
        h.geography_id,
        h.time_id,
        CAST(h.life_expectancy AS DECIMAL) as life_expectancy,
        CAST(h.maternal_mortality AS DECIMAL) as maternal_mortality_rate,
        CAST(h.healthcare_expenditure AS DECIMAL) as healthcare_expenditure_per_capita,
        CAST(h.physicians_per_1k AS DECIMAL) as physician_density,
        CAST(h.infant_mortality AS DECIMAL) as infant_mortality,
        CAST(h.disease_burden AS DECIMAL) as disease_burden,
        h.source,
        CAST(h.life_expectancy_filter AS INTEGER) as health_filter,
        g.country_name,
        t.year,
        CONCAT(g.country_name, ' ', t.year) as label
      FROM health h
      JOIN geography g ON h.geography_id = g.geography_id  
      JOIN time t ON h.time_id = t.time_id
      WHERE 1=1
    `
    const values = []

    // Handle countries array
    if (countries && countries.length > 0) {
      const geoIds = Array.isArray(countries) ? countries : [countries];
      const placeholders = geoIds.map((_, i) => `$${values.length + i + 1}`).join(',');
      values.push(...geoIds);
      query += ` AND h.geography_id IN (${placeholders})`;
    }

    // Handle timeIds array
    if (timeIds && timeIds.length > 0) {
      const tIds = Array.isArray(timeIds) ? timeIds : [timeIds];
      const placeholders = tIds.map((_, i) => `$${values.length + i + 1}`).join(',');
      values.push(...tIds);
      query += ` AND h.time_id IN (${placeholders})`;
    }

    const result = await db.query(query, values)
    console.log("🔍 Health results found:", result.rows.length);
    
    res.json({ data: result.rows })
  } catch (err) {
    console.error("❌ Health query error:", err)
    res.status(500).json({ error: "Failed to fetch health data" })
  }
})

module.exports = router