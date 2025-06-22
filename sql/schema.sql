
---

## 🧱 New: `sql/schema.sql` (add this file)

```sql
CREATE TABLE regions (
  region_id   TEXT PRIMARY KEY,
  region_name TEXT
);

CREATE TABLE metrics (
  metric_code TEXT PRIMARY KEY,
  domain      TEXT,
  unit        TEXT,
  description TEXT
);

CREATE TABLE facts (
  region_id   TEXT REFERENCES regions,
  year        INT,
  metric_code TEXT REFERENCES metrics,
  value       NUMERIC,
  PRIMARY KEY (region_id, year, metric_code)
);
CREATE TABLE metadata (
  region_id   TEXT REFERENCES regions,
  year        INT,
  metric_code TEXT REFERENCES metrics,
  source      TEXT,
  PRIMARY KEY (region_id, year, metric_code)
);