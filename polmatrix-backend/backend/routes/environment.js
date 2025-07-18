const express = require("express")
const router = express.Router()
const db = require("../db")

router.get("/", async (req, res) => {
  console.log("🔍 Environment API called with filters:", req.query);
  
  let { geography_id, time_id } = req.query

  try {
    let query = `
      SELECT 
        e.id as environment_id,
        e.geography_id,
        e.time_id,
        CAST(e.co2_emissions AS DECIMAL) as co2_emissions,
        CAST(e.renewable_energy_percentage AS DECIMAL) as renewable_energy_percentage,
        CAST(e.forest_area_pct AS DECIMAL) as forest_area_percentage,
        CAST(e.pm25 AS DECIMAL) as air_pollution_index,
        CAST(e.energy_use AS DECIMAL) as energy_consumption_per_capita,
        CAST(e.water_usage AS DECIMAL) as water_quality_index,
        CAST(e.deforestation_rate AS DECIMAL) as deforestation_rate,
        e.source,
        CAST(e.co2_emissions_filter AS INTEGER) as sustainability_filter,
        g.country_name,
        t.year,
        CONCAT(g.country_name, ' ', t.year) as label
      FROM environment e
      JOIN geography g ON e.geography_id = g.geography_id  
      JOIN time t ON e.time_id = t.time_id
      WHERE 1=1
    `
    const values = []

    // Handle geography_id array
    if (geography_id) {
      const geoIds = Array.isArray(geography_id) ? geography_id : [geography_id];
      const placeholders = geoIds.map((_, i) => `$${values.length + i + 1}`).join(',');
      values.push(...geoIds);
      query += ` AND e.geography_id IN (${placeholders})`;
    }

    // Handle time_id array
    if (time_id) {
      const timeIds = Array.isArray(time_id) ? time_id : [time_id];
      const placeholders = timeIds.map((_, i) => `$${values.length + i + 1}`).join(',');
      values.push(...timeIds);
      query += ` AND e.time_id IN (${placeholders})`;
    }

    const result = await db.query(query, values)
    console.log("🔍 Environment results found:", result.rows.length);
    
    res.json({ data: result.rows })
  } catch (err) {
    console.error("❌ Environment query error:", err)
    res.status(500).json({ error: "Failed to fetch environment data" })
  }
})

module.exports = router