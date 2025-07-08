import os
import requests
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load environment variables from .env
load_dotenv()

# --- CONFIGURATION ---
SDG_API_BASE = "https://unstats.un.org/SDGAPI/v1/sdg/Indicator/Data"
INDICATORS = {
    "4.1.1": "primary_completion_rate",
    "4.2.1": "secondary_enrollment",
    "4.1.3": "pupil_teacher_ratio"
}
COUNTRY_CODE = "USA"
YEARS = list(range(2000, 2026))

# --- DATABASE CONNECTION PARAMS ---
db_host = os.getenv('DB_HOST', 'localhost')
db_name = os.getenv('DB_NAME', 'polmatrix')
db_user = os.getenv('DB_USER', 'postgres')
db_pass = os.getenv('DB_PASSWORD', '')
db_port = os.getenv('DB_PORT', '5432')

# Build SQLAlchemy URL, omitting password if empty
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
        # 1) Fetch from SDG API
        resp = requests.get(
            SDG_API_BASE,
            params={
                "indicator": indicator_code,
                "area": COUNTRY_CODE,
                "period": f"{YEARS[0]}-{YEARS[-1]}"
            }
        )
        resp.raise_for_status()
        data = resp.json().get("data", [])

        # 2) Upsert each year’s value
        for entry in data:
            year = entry.get("timePeriod")
            value = entry.get("value")
            if year is None or value is None:
                continue

            time_id = get_time_id(conn, int(year))
            if time_id is None:
                continue  # skip missing time rows

            params = {
                "geography_id":   geo_id,
                "time_id":        time_id,
                "indicator_code": indicator_code,
                col_name:         float(value),
                "source":         "UNSDG"
            }

            sql = f"""
            INSERT INTO education
              (geography_id, time_id, indicator_code, {col_name}, source)
            VALUES
              (:geography_id, :time_id, :indicator_code, :{col_name}, :source)
            ON CONFLICT (geography_id, time_id, indicator_code)
            DO UPDATE
              SET {col_name} = EXCLUDED.{col_name},
                  source    = EXCLUDED.source;
            """
            conn.execute(text(sql), params)

    print("✅ Education data for USA loaded successfully.")
# Note: This code assumes the existence of a 'education' table with appropriate columns.