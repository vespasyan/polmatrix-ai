"""
This script loads mock data directly into the database for all major tables.
Based on the actual database structure found during inspection.
"""

import os
import sys
import logging
import random
from datetime import datetime
import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def insert_mock_data():
    """Insert mock data for all major tables directly using SQL"""
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            database=os.getenv('DB_NAME', 'polmatrix'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', ''),
            port=os.getenv('DB_PORT', '5432')
        )
        conn.autocommit = False
        cursor = conn.cursor()
        logger.info("Database connection established")
        
        # Insert countries
        country_ids = {}  # Store country codes and their IDs
        countries = [
            ('USA', 'United States', 'North America'),
            ('GBR', 'United Kingdom', 'Europe'),
            ('DEU', 'Germany', 'Europe'),
            ('FRA', 'France', 'Europe'),
            ('CHN', 'China', 'Asia'),
            ('IND', 'India', 'Asia'),
            ('BRA', 'Brazil', 'South America'),
            ('CAN', 'Canada', 'North America'),
            ('AUS', 'Australia', 'Oceania'),
            ('JPN', 'Japan', 'Asia')
        ]
        
        logger.info("Inserting countries...")
        for country_code, country_name, region in countries:
            cursor.execute("""
                INSERT INTO geography (country_code, country_name, region)
                VALUES (%s, %s, %s)
                ON CONFLICT (country_code) DO UPDATE
                SET country_name = EXCLUDED.country_name,
                    region = EXCLUDED.region
                RETURNING geography_id
            """, (country_code, country_name, region))
            
            geography_id = cursor.fetchone()[0]
            country_ids[country_code] = geography_id
            logger.info(f"Inserted/updated country {country_code} with ID {geography_id}")
        
        # Insert time periods
        time_ids = {}  # Store years and their IDs
        years = [2020, 2021, 2022, 2023, 2024]
        
        logger.info("Inserting time periods...")
        for year in years:
            # First check if year exists
            cursor.execute("SELECT time_id FROM time WHERE year = %s AND quarter IS NULL", (year,))
            result = cursor.fetchone()
            
            if result:
                time_id = result[0]
                logger.info(f"Year {year} already exists with ID {time_id}")
            else:
                cursor.execute("""
                    INSERT INTO time (year, quarter)
                    VALUES (%s, %s)
                    RETURNING time_id
                """, (year, None))
                
                time_id = cursor.fetchone()[0]
                logger.info(f"Inserted year {year} with ID {time_id}")
            
            time_ids[year] = time_id
        
        # Insert economy data
        logger.info("Inserting economy data...")
        for country_code in country_ids:
            for year in time_ids:
                # Generate random values
                gdp_growth = round(random.uniform(-3.0, 8.0), 2)
                unemployment = round(random.uniform(2.0, 15.0), 2)
                inflation = round(random.uniform(0.5, 12.0), 2)
                trade_balance = round(random.uniform(-10.0, 15.0), 2)
                fdi = round(random.uniform(1e9, 5e10), 2)
                gdp_pc = round(random.uniform(5000, 80000), 2)
                
                cursor.execute("""
                    INSERT INTO economy (
                        geography_id, time_id, indicator_code, gdp_growth, unemployment_rate,
                        inflation_rate, trade_balance, foreign_direct_investment, gdp_per_capita,
                        source, gdp_growth_filter, unemployment_rate_filter, inflation_rate_filter,
                        average_gdp_growth, total_trade_balance, gdp_growth_rate_percentage,
                        gdp_per_capita_growth
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                    )
                """, (
                    country_ids[country_code],
                    time_ids[year],
                    'ECON_MOCK',
                    gdp_growth,
                    unemployment,
                    inflation,
                    trade_balance,
                    fdi,
                    gdp_pc,
                    'mock_data',
                    3 if gdp_growth > 3 else 2 if gdp_growth > 0 else 1,  # gdp_growth_filter
                    3 if unemployment > 10 else 2 if unemployment > 5 else 1,  # unemployment_rate_filter
                    3 if inflation > 5 else 2 if inflation > 2 else 1,  # inflation_rate_filter
                    gdp_growth * 0.9,  # average_gdp_growth
                    trade_balance * 10,  # total_trade_balance
                    gdp_growth,  # gdp_growth_rate_percentage
                    round(random.uniform(-2.0, 5.0), 2)  # gdp_per_capita_growth
                ))
                
        logger.info(f"Inserted economy data for {len(country_ids)} countries over {len(time_ids)} years")
        
        # Insert health data
        logger.info("Inserting health data...")
        for country_code in country_ids:
            for year in time_ids:
                # Generate random values
                life_expectancy = round(random.uniform(65.0, 85.0), 2)
                maternal_mortality = round(random.uniform(3.0, 500.0), 2)
                healthcare_exp = round(random.uniform(3.0, 17.0), 2)
                infant_mortality = round(random.uniform(1.5, 40.0), 2)
                
                cursor.execute("""
                    INSERT INTO health (
                        geography_id, time_id, indicator_code, life_expectancy, maternal_mortality,
                        healthcare_expenditure, infant_mortality, disease_burden, source,
                        life_expectancy_filter, maternal_mortality_filter, healthcare_expenditure_filter,
                        average_life_expectancy, total_healthcare_expenditure, infant_mortality_rate,
                        under5_mortality_per_1k, maternal_mortality_ratio, physicians_per_1k,
                        hospital_beds_per_10k, suicide_rate_per_100k
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                    )
                """, (
                    country_ids[country_code],
                    time_ids[year],
                    'HLTH_MOCK',
                    life_expectancy,
                    maternal_mortality,
                    healthcare_exp,
                    infant_mortality,
                    round(random.uniform(200, 800), 2),  # disease_burden
                    'mock_data',
                    3 if life_expectancy > 80 else 2 if life_expectancy > 70 else 1,  # life_expectancy_filter
                    3 if maternal_mortality > 200 else 2 if maternal_mortality > 50 else 1,  # maternal_mortality_filter
                    3 if healthcare_exp > 10 else 2 if healthcare_exp > 5 else 1,  # healthcare_expenditure_filter
                    life_expectancy * 0.95,  # average_life_expectancy
                    healthcare_exp * 100,  # total_healthcare_expenditure
                    infant_mortality,  # infant_mortality_rate
                    infant_mortality * 1.4,  # under5_mortality_per_1k
                    maternal_mortality,  # maternal_mortality_ratio
                    round(random.uniform(1.0, 5.0), 2),  # physicians_per_1k
                    round(random.uniform(10, 60), 2),  # hospital_beds_per_10k
                    round(random.uniform(5, 25), 2)  # suicide_rate_per_100k
                ))
                
        logger.info(f"Inserted health data for {len(country_ids)} countries over {len(time_ids)} years")
        
        # Insert education data
        logger.info("Inserting education data...")
        for country_code in country_ids:
            for year in time_ids:
                # Generate random values
                literacy_rate = round(random.uniform(70.0, 99.0), 2)
                enrollment_rate = round(random.uniform(80.0, 98.0), 2)
                edu_exp = round(random.uniform(2.0, 8.0), 2)
                
                cursor.execute("""
                    INSERT INTO education (
                        geography_id, time_id, indicator_code, literacy_rate, school_enrollment_rate,
                        education_expenditure, teacher_student_ratio, gender_parity_in_education,
                        source, literacy_rate_filter, school_enrollment_rate_filter,
                        education_expenditure_filter, average_literacy_rate, total_education_expenditure,
                        teacher_student_ratio_metric, enrollment_primary, enrollment_secondary,
                        enrollment_tertiary, government_expenditure_pct_gdp, primary_completion_rate
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                    )
                """, (
                    country_ids[country_code],
                    time_ids[year],
                    'EDUC_MOCK',
                    literacy_rate,
                    enrollment_rate,
                    edu_exp,
                    round(random.uniform(10, 40), 2),  # teacher_student_ratio
                    round(random.uniform(0.8, 1.2), 2),  # gender_parity_in_education
                    'mock_data',
                    3 if literacy_rate > 90 else 2 if literacy_rate > 80 else 1,  # literacy_rate_filter
                    3 if enrollment_rate > 95 else 2 if enrollment_rate > 85 else 1,  # school_enrollment_rate_filter
                    3 if edu_exp > 6 else 2 if edu_exp > 4 else 1,  # education_expenditure_filter
                    literacy_rate * 0.9,  # average_literacy_rate
                    edu_exp * 10,  # total_education_expenditure
                    round(random.uniform(0.02, 0.1), 3),  # teacher_student_ratio_metric
                    round(random.uniform(90, 100), 2),  # enrollment_primary
                    round(random.uniform(75, 95), 2),  # enrollment_secondary
                    round(random.uniform(30, 80), 2),  # enrollment_tertiary
                    edu_exp,  # government_expenditure_pct_gdp
                    round(random.uniform(75, 99), 2)  # primary_completion_rate
                ))
                
        logger.info(f"Inserted education data for {len(country_ids)} countries over {len(time_ids)} years")
        
        # Insert environment data
        logger.info("Inserting environment data...")
        for country_code in country_ids:
            for year in time_ids:
                # Generate random values
                co2 = round(random.uniform(1.0, 20.0), 2)
                renewable = round(random.uniform(5.0, 60.0), 2)
                forest = round(random.uniform(10.0, 70.0), 2)
                energy = round(random.uniform(1000, 10000), 2)
                
                cursor.execute("""
                    INSERT INTO environment (
                        geography_id, time_id, indicator_code, co2_emissions, renewable_energy_usage,
                        forest_area_pct, energy_use_kg_oil_pc, source, co2_emissions_filter,
                        renewable_energy_usage_filter, energy_use_filter, total_co2_emissions,
                        renewable_energy_percentage, deforestation_rate, average_deforestation_rate,
                        water_usage, pm25, electric_power_kwh_pc, freshwater_withdrawal_pct
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                    )
                """, (
                    country_ids[country_code],
                    time_ids[year],
                    'ENV_MOCK',
                    co2,
                    renewable,
                    forest,
                    energy,
                    'mock_data',
                    3 if co2 > 10 else 2 if co2 > 5 else 1,  # co2_emissions_filter
                    3 if renewable > 40 else 2 if renewable > 20 else 1,  # renewable_energy_usage_filter
                    3 if energy > 6000 else 2 if energy > 3000 else 1,  # energy_use_filter
                    co2 * 1000000,  # total_co2_emissions
                    renewable,  # renewable_energy_percentage
                    round(random.uniform(-2.0, 1.0), 2),  # deforestation_rate
                    round(random.uniform(-1.5, 0.5), 2),  # average_deforestation_rate
                    round(random.uniform(100, 1000), 2),  # water_usage
                    round(random.uniform(5, 60), 2),  # pm25
                    round(random.uniform(1000, 15000), 2),  # electric_power_kwh_pc
                    round(random.uniform(5, 100), 2)  # freshwater_withdrawal_pct
                ))
        
        logger.info(f"Inserted environment data for {len(country_ids)} countries over {len(time_ids)} years")
        
        # Commit changes
        conn.commit()
        logger.info("All data committed to database")
        
        # Close connections
        cursor.close()
        conn.close()
        logger.info("Database connection closed")
        
    except Exception as e:
        logger.error(f"Error during data insertion: {e}")
        if 'conn' in locals() and conn:
            conn.rollback()
            conn.close()
        return False
    
    return True

if __name__ == "__main__":
    if insert_mock_data():
        logger.info("Mock data insertion completed successfully")
    else:
        logger.error("Mock data insertion failed")
        sys.exit(1)