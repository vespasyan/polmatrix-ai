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
df = pd.read_csv("data/us_gdp.csv")

for _, row in df.iterrows():
    cur.execute("""
        INSERT INTO facts (region_id, year, metric_code, value)
        VALUES ('US', %s, 'gdp', %s)
        ON CONFLICT (region_id, year, metric_code)
        DO UPDATE SET value = EXCLUDED.value
    """, (int(row['year']), float(row['gdp'])))

conn.commit(); cur.close(); conn.close()
print("✅ GDP loaded.")
# This script loads GDP data for the USA into a PostgreSQL database.
# It reads from a CSV file and inserts or updates the data in the 'facts' table