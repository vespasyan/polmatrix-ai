"""
This script examines the database structure and inserts minimal test data.
It's very simplified to work around any potential database structure issues.
"""

import os
import sys
import logging
import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def check_database_structure():
    """Check the database structure and identify primary keys"""
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            database=os.getenv('DB_NAME', 'polmatrix'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', ''),
            port=os.getenv('DB_PORT', '5432')
        )
        
        cursor = conn.cursor()
        logger.info("Database connection established")
        
        # Get list of tables
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """)
        tables = [row[0] for row in cursor.fetchall()]
        logger.info(f"Tables found: {tables}")
        
        # Get primary keys for each table
        for table in tables:
            cursor.execute(f"""
                SELECT a.attname
                FROM   pg_index i
                JOIN   pg_attribute a ON a.attrelid = i.indrelid
                                     AND a.attnum = ANY(i.indkey)
                WHERE  i.indrelid = '{table}'::regclass
                AND    i.indisprimary;
            """)
            pkey_columns = [row[0] for row in cursor.fetchall()]
            logger.info(f"Primary key columns for {table}: {pkey_columns}")
            
            # Get all columns for the table
            cursor.execute(f"""
                SELECT column_name, data_type
                FROM information_schema.columns
                WHERE table_name = '{table}'
            """)
            columns = [(row[0], row[1]) for row in cursor.fetchall()]
            logger.info(f"Columns in {table}: {columns}")
        
        # Insert minimal data into geography table
        try:
            logger.info("Inserting test country")
            cursor.execute("""
                INSERT INTO geography (country_name, country_code, region)
                VALUES ('Test Country', 'TST', 'Test Region')
            """)
            conn.commit()
            
            # Get the geography_id
            cursor.execute("SELECT geography_id FROM geography WHERE country_code = 'TST'")
            geography_id = cursor.fetchone()[0]
            logger.info(f"Inserted test country with ID: {geography_id}")
            
            # Insert a time record
            logger.info("Inserting test time record")
            cursor.execute("""
                INSERT INTO time (year, quarter)
                VALUES (2025, NULL)
            """)
            conn.commit()
            
            # Get the time_id
            cursor.execute("SELECT time_id FROM time WHERE year = 2025 AND quarter IS NULL")
            time_id = cursor.fetchone()[0]
            logger.info(f"Inserted test time record with ID: {time_id}")
            
            # Insert a basic economy record
            logger.info("Inserting test economy record")
            cursor.execute(f"""
                INSERT INTO economy (
                    geography_id, time_id, gdp_growth, unemployment_rate,
                    inflation_rate, source, indicator_code
                ) VALUES (
                    {geography_id}, {time_id}, 3.5, 5.2, 2.1, 'test_data', 'TEST_GDP'
                )
            """)
            conn.commit()
            logger.info("Successfully inserted test economy record")
            
        except Exception as insert_error:
            logger.error(f"Error inserting test data: {insert_error}")
            conn.rollback()
        
        cursor.close()
        conn.close()
        logger.info("Database inspection completed")
        
    except Exception as e:
        logger.error(f"Error connecting to database: {e}")
        return False
    
    return True

if __name__ == "__main__":
    if check_database_structure():
        logger.info("Database structure check completed successfully")
    else:
        logger.error("Database structure check failed")
        sys.exit(1)