import os
import re
import sys
import requests
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from requests.exceptions import JSONDecodeError

# --- FORCE UTF-8 OUTPUT (optional) ---
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Load .env
load_dotenv()

# --- CONFIGURATION ---
GHO_BASE = "http://apps.who.int/gho/athena/api/GHO"
INDICATORS = {
    "WHOSIS_000001":     "life_expectancy",
    "WHOSIS_000006":     "infant_mortality_rate",
    "WHOSIS_000012":     "maternal_mortality_ratio",
    "HEALTH_EXP_PC_GDP": "health_expenditure_pct_gdp"
}
COUNTRY_CODE = "USA"
YEARS       = list(range(2000, 2026))

# --- DB CONNECTION ---
db_host = os.getenv('DB_HOST', 'localhost')
db_name = os.getenv('DB_NAME', 'polmatrix')
db_user = os.getenv('DB_USER', 'postgres')
db_pass = os.getenv('DB_PASSWORD', '')
db_port = os.getenv('DB_PORT', '5432')

if db_pass:
    db_url = f"postgresql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}"
else:
    db_url = f"postgresql://{db_user}@{db_host}:{db_port}/{db_name}"

engine = create_engine(db_url)

# --- HELPERS ---
def get_geography_id(conn, code):
    geo = conn.execute(
        text("SELECT geography_id FROM geography WHERE country_code = :c"),
        {"c": code}
    ).scalar_one_or_none()
    if geo is None:
        raise RuntimeError(f"No geography entry for country_code={code}")
    return geo

def get_time_id(conn, year):
    row = conn.execute(
        text("""
          SELECT time_id
            FROM time
           WHERE year = :y
             AND quarter IS NULL
        ORDER BY time_id
           LIMIT 1
        """), {"y": year}
    ).fetchone()
    return row[0] if row else None

# --- ETL PROCESS ---
with engine.begin() as conn:
    geo_id = get_geography_id(conn, COUNTRY_CODE)

    for code, col in INDICATORS.items():
        url = f"{GHO_BASE}/{code}"
        resp = requests.get(url, params={
            "filter": f"COUNTRY:{COUNTRY_CODE}",
            "format": "json",
            "profile": "simple"
        })

        # 1) Try parsing JSON, else log & skip
        try:
            payload = resp.json()
        except JSONDecodeError:
            print(f"[WARN] Non-JSON response for indicator {code} (HTTP {resp.status_code}):")
            print(resp.text[:300].replace("\n"," "))
            continue
        text_body = resp.text.strip()
        # WHO sometimes returns "{ , }" for no-data stubs
        if re.fullmatch(r"\{\s*,\s*\}", text_body):
            print(f"[INFO] No JSON payload for {code}, skipping.")
            continue
        try:
            payload = resp.json()
        except JSONDecodeError:
            print(f"[WARN] Unexpected non-JSON for {code} (HTTP {resp.status_code}):")
            print(text_body[:300])
            continue

        facts = payload.get("fact", [])
        if not facts:
            print(f"[INFO] No data for {code}.")
            continue

        # 2) Process each fact
        for fact in facts:
            dim  = fact.get("dim", {})
            year = dim.get("YEAR")
            raw  = fact.get("Value")
            if year is None or raw is None:
                continue

            # Extract leading float (e.g. "23.3" from "23.3 [15.0-34.2]")
            m = re.match(r"^([0-9]+(?:\.[0-9]+)?)", raw)
            if not m:
                continue
            value = float(m.group(1))

            year = int(year)
            if year not in YEARS:
                continue

            time_id = get_time_id(conn, year)
            if time_id is None:
                continue

            params = {
                "geography_id":   geo_id,
                "time_id":        time_id,
                "indicator_code": code,
                col:               value,
                "source":         "WHO_GHO"
            }

            sql = f"""
            INSERT INTO health
              (geography_id, time_id, indicator_code, {col}, source)
            VALUES
              (:geography_id, :time_id, :indicator_code, :{col}, :source)
            ON CONFLICT (geography_id, time_id, indicator_code)
            DO UPDATE
              SET {col}   = EXCLUDED.{col},
                  source  = EXCLUDED.source;
            """
            conn.execute(text(sql), params)

    print("Health data for USA loaded successfully.")
