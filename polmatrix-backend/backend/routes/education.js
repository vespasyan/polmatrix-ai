const express = require("express")
const router = express.Router()
const db = require("../db")

router.get("/", async (req, res) => {
  console.log("🔍 Education API called with filters:", req.query);
  
  let { geography_id, time_id } = req.query

  try {
    let query = `
      SELECT 
        e.id as education_id,
        e.geography_id,
        e.time_id,
        CAST(e.literacy_rate AS DECIMAL) as literacy_rate,
        CAST(e.school_enrollment_rate AS DECIMAL) as school_enrollment_rate,
        CAST(e.education_expenditure AS DECIMAL) as education_expenditure_per_capita,
        CAST(e.primary_completion_rate AS DECIMAL) as primary_completion_rate,
        CAST(e.teacher_student_ratio AS DECIMAL) as teacher_student_ratio,
        CAST(e.enrollment_primary AS DECIMAL) as enrollment_primary,
        CAST(e.enrollment_secondary AS DECIMAL) as enrollment_secondary,
        CAST(e.enrollment_tertiary AS DECIMAL) as enrollment_tertiary,
        e.source,
        CAST(e.literacy_rate_filter AS INTEGER) as education_filter,
        g.country_name,
        t.year,
        CONCAT(g.country_name, ' ', t.year) as label
      FROM education e
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
    console.log("🔍 Education results found:", result.rows.length);
    
    res.json({ data: result.rows })
  } catch (err) {
    console.error("❌ Education query error:", err)
    res.status(500).json({ error: "Failed to fetch education data" })
  }
})

module.exports = router