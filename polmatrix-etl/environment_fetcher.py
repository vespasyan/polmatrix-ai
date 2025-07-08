import os
import sys
import io
import zipfile
import pandas as pd
import requests
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from requests.exceptions import JSONDecodeError

# — Optional: force UTF-8 console output on Windows —
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Load environment variables from .env
load_dotenv()

# — CONFIGURATION —
WB_BASE    = "http://api.worldbank.org/v2"
COUNTRY    = "USA"
YEARS      = list(range(2000, 2026))

# Map World Bank indicator codes → your environment table columns
INDICATORS = {
    #"EN.GHG.CO2.PC.CE.AR5": "co2_emissions",             # CO₂ emissions (metric tons per capita)
    #"EN.ATM.CO2E.SF.KT":    "co2_emissions",             # CO₂ (metric tons per capita)
    "EG.FEC.RNEW.ZS":    "renewable_energy_percentage",  # Renewable energy (% of total)
    "AG.LND.FRST.ZS":    "forest_area_pct",           # Forest area (% of land area)
    "EN.ATM.PM25.MC.M3": "pm25"                       # PM2.5 (µg/m³)
}
# EDGAR base path (you added this line)
EDGAR_BASE = "https://jeodpp.jrc.ec.europa.eu/ftp/jrc-opendata/EDGAR/datasets/v80_FT2022_GHG"

# We’ll pull CO2 in kilotons (for example) from EDGAR, then compute per‐capita if desired.
# Inside the EDGAR folder, there’s “IEA_EDGAR_CO2_1970_2022.zip” which contains an .xlsx file.

CO2_ZIP_NAME = "IEA_EDGAR_CO2_1970_2022.zip"  # the ZIP containing CO2 by country

# EDGAR data files to download
EDGAR_FILES = {
    "IEA_EDGAR_CO2_1970_2022.zip": "co2_emissions",
    "EDGAR_CH4_1970_2022.zip": "ch4_emissions",
    "EDGAR_N2O_1970_2022.zip": "n2o_emissions"
}

# — DATABASE CONNECTION —
db_host = os.getenv("DB_HOST", "localhost")
db_name = os.getenv("DB_NAME", "polmatrix")
db_user = os.getenv("DB_USER", "postgres")
db_pass = os.getenv("DB_PASSWORD", "")
db_port = os.getenv("DB_PORT", "5432")

if db_pass:
    db_url = f"postgresql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}"
else:
    db_url = f"postgresql://{db_user}@{db_host}:{db_port}/{db_name}"

engine = create_engine(db_url)

# — HELPERS —
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

def download_and_extract_edgar_data(file_name):
    """Download and extract EDGAR data file"""
    url = f"{EDGAR_BASE}/{file_name}"
    
    try:
        print(f"[INFO] Downloading EDGAR data: {file_name}")
        resp = requests.get(url, timeout=300)  # 5 minute timeout for large files
        resp.raise_for_status()
        
        # Extract the Excel file from the ZIP
        with zipfile.ZipFile(io.BytesIO(resp.content)) as z:
            # Look for Excel files in the ZIP
            excel_files = [f for f in z.namelist() if f.endswith(('.xlsx', '.xls'))]
            if not excel_files:
                print(f"[WARN] No Excel files found in {file_name}")
                return None
            
            # Use the first Excel file found
            excel_file = excel_files[0]
            print(f"[INFO] Extracting {excel_file} from {file_name}")
            
            with z.open(excel_file) as excel_data:
                # Read Excel file into pandas DataFrame
                df = pd.read_excel(excel_data)
                return df
                
    except Exception as e:
        print(f"[ERROR] Failed to download/extract {file_name}: {e}")
        return None

def process_edgar_data(df, country_code, col_name):
    """Process EDGAR DataFrame and return records for database insertion"""
    if df is None:
        return []
    
    records = []
    
    # EDGAR files typically have countries as rows and years as columns
    # Find the row for the specified country
    country_row = None
    
    # Look for country code in various possible column names
    for col in df.columns:
        if 'country' in col.lower() or 'code' in col.lower():
            mask = df[col].astype(str).str.upper() == country_code.upper()
            if mask.any():
                country_row = df[mask].iloc[0]
                break
    
    if country_row is None:
        print(f"[WARN] Country {country_code} not found in EDGAR data")
        return []
    
    # Process year columns
    for col in df.columns:
        try:
            year = int(col)
            if year in YEARS:
                value = country_row[col]
                if pd.notna(value) and str(value).strip() != '' and value != 0:
                    try:
                        value = float(value)
                        records.append({
                            'year': year,
                            'value': value,
                            'indicator_code': f"EDGAR_{col_name.upper()}",
                            'column_name': col_name
                        })
                    except (ValueError, TypeError):
                        continue
        except (ValueError, TypeError):
            continue
    
    return records

# — ETL PROCESS —
with engine.begin() as conn:
    geo_id = get_geography_id(conn, COUNTRY)

    for indicator_code, col_name in INDICATORS.items():
        url = f"{WB_BASE}/country/{COUNTRY}/indicator/{indicator_code}"
        params = {
            "date":     f"{YEARS[0]}:{YEARS[-1]}",
            "format":   "json",
            "per_page": 1000
        }
        resp = requests.get(url, params=params)

        # 1) Try to parse JSON
        try:
            payload = resp.json()
        except JSONDecodeError:
            print(f"[WARN] Indicator {indicator_code} returned non-JSON:")
            print(resp.text[:300].replace("\n", " "))
            continue

        # 2) Check that payload is a list of length ≥ 2 (metadata + data array)
        if not isinstance(payload, list):
            print(f"[WARN] Indicator {indicator_code} JSON is not a list (type={type(payload)}). Full payload:")
            print(payload)
            continue

        if len(payload) < 2:
            print(f"[INFO] Indicator {indicator_code} JSON list has fewer than 2 elements (len={len(payload)}). Full payload:")
            print(payload)
            continue

        # 3) Grab data_array = payload[1]
        data_array = payload[1]
        if not isinstance(data_array, list) or len(data_array) == 0:
            print(f"[INFO] Indicator {indicator_code} data array is empty (len={len(data_array)}).")
            continue

        # 4) Upsert each entry in the array
        for entry in data_array:
            year_str = entry.get("date")
            raw_val  = entry.get("value")
            if not year_str or raw_val is None:
                continue

            year = int(year_str)
            if year not in YEARS:
                continue

            time_id = get_time_id(conn, year)
            if time_id is None:
                continue

            # Cast to float; skip if invalid
            try:
                value = float(raw_val)
            except (TypeError, ValueError):
                continue

            params = {
                "geography_id":   geo_id,
                "time_id":        time_id,
                "indicator_code": indicator_code,
                col_name:         value,
                "source":         "WorldBank"
            }

            sql = f"""
            INSERT INTO environment
              (geography_id, time_id, indicator_code, {col_name}, source)
            VALUES
              (:geography_id, :time_id, :indicator_code, :{col_name}, :source)
            ON CONFLICT (geography_id, time_id, indicator_code)
            DO UPDATE SET
              {col_name}  = EXCLUDED.{col_name},
              source      = EXCLUDED.source;            """
            conn.execute(text(sql), params)

        print(f"[OK] Upserted {col_name} for USA.")

    # — EDGAR DATA PROCESSING —
    print("\n[INFO] Processing EDGAR greenhouse gas data...")
    
    for file_name, col_name in EDGAR_FILES.items():
        print(f"\n[INFO] Processing EDGAR file: {file_name}")
        
        # Download and extract data
        df = download_and_extract_edgar_data(file_name)
        if df is None:
            continue
        
        # Process the data to get records
        records = process_edgar_data(df, COUNTRY, col_name)
        
        if not records:
            print(f"[INFO] No data found for {COUNTRY} in {file_name}")
            continue
        
        # Insert records into database
        for record in records:
            year = record['year']
            value = record['value']
            indicator_code = record['indicator_code']
            column_name = record['column_name']
            
            time_id = get_time_id(conn, year)
            if time_id is None:
                continue
            
            params = {
                "geography_id":   geo_id,
                "time_id":        time_id,
                "indicator_code": indicator_code,
                column_name:      value,
                "source":         "EDGAR"
            }
            
            sql = f"""
            INSERT INTO environment
              (geography_id, time_id, indicator_code, {column_name}, source)
            VALUES
              (:geography_id, :time_id, :indicator_code, :{column_name}, :source)
            ON CONFLICT (geography_id, time_id, indicator_code)
            DO UPDATE SET
              {column_name}  = EXCLUDED.{column_name},
              source         = EXCLUDED.source;
            """
            conn.execute(text(sql), params)
        
        print(f"[OK] Inserted {len(records)} EDGAR {col_name} records for USA.")

    print("Environment data for USA loaded successfully.")
