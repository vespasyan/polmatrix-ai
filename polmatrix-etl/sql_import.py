"""
This script loads mock data directly into the database with SQL commands.
It doesn't rely on complex ETL pipelines and should be more reliable.
"""

import os
import sys
import logging
import pandas as pd
import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def clean_input(value):
    """Clean input values to prevent SQL injection"""
    if value is None:
        return "NULL"
    elif isinstance(value, (int, float)):
        return str(value)
    else:
        # Escape single quotes
        return f"'{str(value).replace('\'', '\'\'')}'"

def run_sql_import():
    """Import mock data using direct SQL commands"""
    # Database connection
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            database=os.getenv('DB_NAME', 'polmatrix'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', ''),
            port=os.getenv('DB_PORT', '5432')
        )
        conn.autocommit = True
        cursor = conn.cursor()
        logger.info("Database connection established")
        
        # Insert geography data (small sample)
        logger.info("Inserting sample countries...")
        countries = [
            ('USA', 'United States', 'North America'),
            ('GBR', 'United Kingdom', 'Europe'),
            ('DEU', 'Germany', 'Europe'),
            ('FRA', 'France', 'Europe'),
            ('JPN', 'Japan', 'Asia'),
            ('CHN', 'China', 'Asia'),
            ('IND', 'India', 'Asia'),
            ('BRA', 'Brazil', 'South America'),
            ('CAN', 'Canada', 'North America'),
            ('AUS', 'Australia', 'Oceania')
        ]
        
        for country in countries:
            try:
                cursor.execute(f"""
                    INSERT INTO geography (country_code, country_name, region)
                    VALUES ({clean_input(country[0])}, {clean_input(country[1])}, {clean_input(country[2])})
                    ON CONFLICT (country_code) DO NOTHING
                """)
            except Exception as e:
                logger.error(f"Error inserting country {country[0]}: {e}")
        
        # Insert time periods
        logger.info("Inserting time periods...")
        years = [2020, 2021, 2022, 2023]
        
        for year in years:
            try:
                # Try a simple insert without ON CONFLICT
                cursor.execute(f"""
                    INSERT INTO time (year, quarter)
                    VALUES ({year}, NULL)
                """)
            except Exception as e:
                # If there's an error (maybe duplicate), try to fetch the existing ID
                logger.warning(f"Could not insert year {year}, trying to find existing record: {e}")
                try:
                    cursor.execute(f"SELECT time_id FROM time WHERE year = {year} AND quarter IS NULL")
                    time_id_result = cursor.fetchone()
                    if time_id_result:
                        logger.info(f"Found existing time_id for year {year}: {time_id_result[0]}")
                    else:
                        logger.error(f"No time record found for year {year}")
                except Exception as find_error:
                    logger.error(f"Error finding time record for {year}: {find_error}")
        
        # Insert economy data (simple data first for testing)
        logger.info("Inserting economy data...")
        for country_code in ['USA', 'GBR', 'DEU', 'FRA', 'CHN']:
            for year in [2020, 2021, 2022, 2023]:
                # Generate random sample data
                import random
                gdp_growth = round(random.uniform(-2.0, 8.0), 2)
                unemployment = round(random.uniform(2.0, 15.0), 2)
                inflation = round(random.uniform(0.0, 12.0), 2)
                
                try:
                    # Get geography_id
                    cursor.execute(f"SELECT geography_id FROM geography WHERE country_code = {clean_input(country_code)}")
                    geography_id_result = cursor.fetchone()
                    
                    if not geography_id_result:
                        logger.warning(f"Country {country_code} not found in geography table")
                        continue
                        
                    geography_id = geography_id_result[0]
                    
                try:
                    # Check if this year already exists before attempting to insert
                    cursor.execute(f"SELECT time_id FROM time WHERE year = {year} AND quarter IS NULL")
                    time_id_result = cursor.fetchone()
                    
                    if time_id_result:
                        # Year already exists, use this time_id
                        time_id = time_id_result[0]
                        logger.info(f"Found existing time_id for year {year}: {time_id}")
                    else:
                        # Year doesn't exist yet, we need to find out what went wrong
                        logger.warning(f"Year {year} not found in time table and could not be inserted")
                        continue
                    
                    # Insert economy data with minimal columns (avoid the ON CONFLICT issues)
                    cursor.execute(f"""
                        INSERT INTO economy (
                            geography_id, time_id, indicator_code, gdp_growth, 
                            unemployment_rate, inflation_rate, source
                        ) VALUES (
                            {geography_id}, {time_id}, 'ECON_TEST', {gdp_growth}, 
                            {unemployment}, {inflation}, 'test_data'
                        )
                    """)
                    logger.info(f"Inserted economy data for {country_code}, {year}")
                    
                except Exception as e:
                    logger.error(f"Error inserting economy data for {country_code}, {year}: {e}")
                    continue
        
        # Close the connection
        cursor.close()
        conn.close()
        logger.info("Data insertion completed successfully")
        
    except Exception as e:
        logger.error(f"Database connection or execution failed: {e}")
        return False
        
    return True

if __name__ == "__main__":
    if run_sql_import():
        logger.info("SQL import completed successfully")
    else:
        logger.error("SQL import failed")
        sys.exit(1)