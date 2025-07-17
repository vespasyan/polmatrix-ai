import pandas as pd, psycopg2, os
from dotenv import load_dotenv

load_dotenv()
conn = psycopg2.connect(
    host=os.getenv("DB_HOST"),
    port=os.getenv("DB_PORT"),
    dbname=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASS")
)
cur = conn.cursor()
df = pd.read_csv("data/us_co2.csv")

for _, row in df.iterrows():
    cur.execute("""
        INSERT INTO facts (region_id, year, metric_code, value)
        VALUES ('US', %s, 'co2', %s)
        ON CONFLICT (region_id, year, metric_code)
        DO UPDATE SET value = EXCLUDED.value
    """, (int(row['year']), float(row['co2'])))

conn.commit(); cur.close(); conn.close()
print("✅ CO2 loaded.")
# This script loads CO2 data for the USA into a PostgreSQL database.
# It reads from a CSV file and inserts or updates the data in the 'facts' table
