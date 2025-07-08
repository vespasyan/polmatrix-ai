import os
import requests
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load .env into environment
load_dotenv()

# --- CONFIGURATION ---
WB_BASE = "http://api.worldbank.org/v2"
INDICATORS = {
    "NY.GDP.MKTP.KD.ZG": "gdp_growth",
    "SL.UEM.TOTL.ZS":    "unemployment_rate",
    "FP.CPI.TOTL.ZG":    "inflation_rate",
    "BX.GSR.GNFS.CD":    "trade_balance",
    "BX.KLT.DINV.CD.WD": "foreign_direct_investment",
    "NY.GDP.PCAP.KD":    "gdp_per_capita"
}
COUNTRY_CODE = "USA"
YEARS = list(range(2000, 2026))

# --- DATABASE CONNECTION PARAMS ---
db_host = os.getenv('DB_HOST', 'localhost')
db_name = os.getenv('DB_NAME', 'polmatrix')
db_user = os.getenv('DB_USER', 'postgres')
db_pass = os.getenv('DB_PASSWORD', '')  # may be empty
db_port = os.getenv('DB_PORT', '5432')

# Build the SQLAlchemy URL
if db_pass:
    db_url = f"postgresql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}"
else:
    db_url = f"postgresql://{db_user}@{db_host}:{db_port}/{db_name}"

engine = create_engine(db_url)

# --- HELPERS ---
def get_geography_id(conn, code):
    geo_id = conn.execute(
        text("SELECT geography_id FROM geography WHERE country_code = :code"),
        {"code": code}
    ).scalar_one_or_none()
    if geo_id is None:
        raise RuntimeError(f"No geography entry for country_code={code}")
    return geo_id

def get_time_id(conn, year):
    row = conn.execute(
        text("""
          SELECT time_id
            FROM time
           WHERE year = :year
             AND quarter IS NULL
        ORDER BY time_id
           LIMIT 1
        """),
        {"year": year}
    ).fetchone()
    return row[0] if row else None

# --- ETL PROCESS ---
with engine.begin() as conn:
    geo_id = get_geography_id(conn, COUNTRY_CODE)

    for indicator_code, col_name in INDICATORS.items():
        # 1) Fetch from World Bank
        resp = requests.get(
            f"{WB_BASE}/country/{COUNTRY_CODE}/indicator/{indicator_code}",
            params={"date": f"{YEARS[0]}:{YEARS[-1]}",
                    "format": "json",
                    "per_page": 1000}
        )
        resp.raise_for_status()
        _, data = resp.json()

        # 2) Upsert each year’s value
        for entry in data:
            year_str = entry.get("date")
            value = entry.get("value")
            if not year_str or value is None:
                continue

            year = int(year_str)
            time_id = get_time_id(conn, year)
            if time_id is None:
                # Skip if you don’t have this year in your table
                continue

            params = {
                "geography_id":   geo_id,
                "time_id":        time_id,
                "indicator_code": indicator_code,
                col_name:         value,
                "source":         "WorldBank"
            }

            sql = f"""
            INSERT INTO economy
              (geography_id, time_id, indicator_code, {col_name}, source)
            VALUES
              (:geography_id, :time_id, :indicator_code, :{col_name}, :source)
            ON CONFLICT (geography_id, time_id, indicator_code)
            DO UPDATE
              SET {col_name} = EXCLUDED.{col_name},
                  source    = EXCLUDED.source;
            """

            # Pass params dict as second argument, not keywords
            conn.execute(text(sql), params)

    print("✅ Economy data for USA loaded successfully.")
