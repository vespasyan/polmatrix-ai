"""
This script directly inserts basic test data into the database without using CSV files
"""
import os
import sys
import logging
import psycopg2
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def insert_test_data():
    """Insert basic test data directly into the database"""
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
        
        # Insert geography data
        logger.info("Inserting test countries...")
        countries = [
            ('USA', 'United States', 'North America'),
            ('GBR', 'United Kingdom', 'Europe'),
            ('DEU', 'Germany', 'Europe'),
            ('FRA', 'France', 'Europe'),
            ('JPN', 'Japan', 'Asia')
        ]
        
        for country in countries:
            try:
                cursor.execute("""
                    INSERT INTO geography (country_code, country_name, region)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (country_code) DO NOTHING
                """, country)
            except Exception as e:
                logger.error(f"Error inserting country {country[0]}: {e}")
        
        # Insert time periods
        logger.info("Inserting time periods...")
        years = [2020, 2021, 2022, 2023]
        
        for year in years:
            try:
                cursor.execute("""
                    INSERT INTO time (year, quarter)
                    VALUES (%s, %s)
                    ON CONFLICT (year, quarter) DO NOTHING
                """, (year, None))
            except Exception as e:
                logger.error(f"Error inserting year {year}: {e}")
        
        # Insert sample economy data
        logger.info("Inserting economy data...")
        economy_data = [
            # country_code, year, gdp_growth, unemployment, inflation, source
            ('USA', 2020, 2.5, 8.1, 1.8, 'test_data'),
            ('USA', 2021, 3.2, 6.7, 2.3, 'test_data'),
            ('USA', 2022, 1.8, 5.2, 4.7, 'test_data'),
            ('GBR', 2020, 1.2, 7.5, 1.5, 'test_data'),
            ('GBR', 2021, 2.1, 6.9, 2.0, 'test_data'),
            ('DEU', 2020, 1.5, 6.2, 1.1, 'test_data')
        ]
        
        for data in economy_data:
            try:
                # Get geography_id
                cursor.execute("SELECT geography_id FROM geography WHERE country_code = %s", (data[0],))
                geography_id = cursor.fetchone()[0]
                
                # Get time_id
                cursor.execute("SELECT time_id FROM time WHERE year = %s AND quarter IS NULL", (data[1],))
                time_id = cursor.fetchone()[0]
                
                # Insert economy data
                cursor.execute("""
                    INSERT INTO economy (
                        geography_id, time_id, indicator_code, gdp_growth, unemployment_rate, 
                        inflation_rate, source
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s
                    )
                """, (
                    geography_id, 
                    time_id, 
                    'TEST_GDP', 
                    data[2], 
                    data[3], 
                    data[4], 
                    data[5]
                ))
                
            except Exception as e:
                logger.error(f"Error inserting economy data for {data[0]}, {data[1]}: {e}")
        
        # Close the connection
        cursor.close()
        conn.close()
        logger.info("Data insertion completed")
        
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False
        
    return True

if __name__ == "__main__":
    if insert_test_data():
        logger.info("Test data successfully inserted")
    else:
        logger.error("Failed to insert test data")