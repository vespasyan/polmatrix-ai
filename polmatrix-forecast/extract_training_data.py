from dotenv import load_dotenv
import os
import psycopg2
import pandas as pd

load_dotenv()

# 🔧 Update with your actual credentials
conn = psycopg2.connect(
    host=os.getenv("DB_HOST"),
    port=os.getenv("DB_PORT"),
    dbname=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASS")
)

# List of metrics you want to include in training
target_metrics = ['gdp', 'education_index', 'health_index', 'spending', 'co2_emissions', 'green_jobs']
# Step 1: Query all relevant data
query = f"""
SELECT region_id AS region, year, metric_code, value
FROM facts
WHERE metric_code IN %s
"""

df = pd.read_sql(query, conn, params=[tuple(target_metrics)])

# Step 2: Pivot data: one row per (year, region), one column per metric
pivot_df = df.pivot_table(index=['year', 'region'], columns='metric_code', values='value').reset_index()

# Step 3: Optional cleanup
pivot_df = pivot_df.dropna()  # remove rows with missing values
pivot_df = pivot_df.sort_values(by=['region', 'year'])

# Step 4: Export
pivot_df.to_csv("training_data.csv", index=False)
print("✅ Saved training_data.csv")
