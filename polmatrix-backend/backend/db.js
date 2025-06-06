require("dotenv").config({ path: "../.env" });
const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const db = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync(path.join(__dirname, "us-east-2-bundle.pem")).toString()
  }
});

db.connect()
  .then(() => console.log("✅ Securely connected to PostgreSQL with SSL"))
  .catch((err) => console.error("❌ DB connection error:", err));

module.exports = db;
