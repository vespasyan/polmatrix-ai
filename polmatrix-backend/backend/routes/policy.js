const express = require("express")
const router = express.Router()
const pool = require("../db")

// GET policy by geography + time
router.get("/", async (req, res) => {
  const { geography_id, time_id } = req.query

  try {
    const result = await pool.query(
      `SELECT * FROM policy WHERE geography_id = $1 AND time_id = $2`,
      [geography_id, time_id]
    )
    res.json({ data: result.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to fetch policy data" })
  }
})

module.exports = router
