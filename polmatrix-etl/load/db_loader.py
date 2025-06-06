import psycopg2
import pandas as pd
import logging
from datetime import datetime
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseLoader:
    def __init__(self):
        """Initialize database connection"""
        try:
            self.conn = psycopg2.connect(
                host=os.getenv('DB_HOST', 'localhost'),
                database=os.getenv('DB_NAME', 'polmatrix'),
                user=os.getenv('DB_USER', 'postgres'),
                password=os.getenv('DB_PASSWORD', ''),
                port=os.getenv('DB_PORT', '5432')
            )
            self.conn.autocommit = True
            logger.info("Database connection established")
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            raise
    
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
            logger.info("Database connection closed")
    
    def get_geography_id(self, country_code):
        """Get or create geography_id for a country"""
        try:
            cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            
            # Check if country exists
            cursor.execute("""
                SELECT geography_id FROM geography 
                WHERE country_code = %s
            """, (country_code,))
            
            result = cursor.fetchone()
            
            if result:
                return result['geography_id']
            else:
                # Insert new country
                cursor.execute("""
                    INSERT INTO geography (country_code, country_name) 
                    VALUES (%s, %s) 
                    RETURNING geography_id
                """, (country_code, country_code))  # We'll update country_name later
                
                new_result = cursor.fetchone()
                cursor.close()
                return new_result['geography_id']
        
        except Exception as e:
            logger.error(f"Error getting geography_id for {country_code}: {e}")
            return None
    
    def get_time_id(self, year, quarter=None):
        """Get or create time_id for a year/quarter"""
        try:
            cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            
            # Check if time entry exists
            cursor.execute("""
                SELECT time_id FROM time 
                WHERE year = %s AND quarter = %s
            """, (year, quarter))
            
            result = cursor.fetchone()
            
            if result:
                return result['time_id']
            else:
                # Insert new time entry                cursor.execute("""
                    INSERT INTO time (year, quarter) 
                    VALUES (%s, %s) 
                    RETURNING time_id
                """, (year, quarter))
                
                new_result = cursor.fetchone()
                cursor.close()
                return new_result['time_id']
                
        except Exception as e:
            logger.error(f"Error getting time_id for year {year}, quarter {quarter}: {e}")
            return None

    def insert_economy_data(self, df):
        """Insert data into economy table"""
        if df.empty:
            logger.warning("No economy data to insert")
            return
        
        try:
            cursor = self.conn.cursor()
            
            # Define all economy table columns that can be updated
            update_columns = [
                'gdp_growth', 'unemployment_rate', 'inflation_rate', 'trade_balance',
                'foreign_direct_investment', 'gdp_per_capita', 'gdp_growth_filter',
                'unemployment_rate_filter', 'inflation_rate_filter', 'average_gdp_growth',
                'total_trade_balance', 'gdp_growth_rate_percentage', 'gdp_per_capita_growth'
            ]
            
            # Build UPDATE clauses with special handling for inflation_rate
            update_clauses = []
            for col in update_columns:
                if col == 'inflation_rate':
                    update_clauses.append(
                        f"{col} = GREATEST(COALESCE(economy.{col}, -1e99), "
                        f"COALESCE(EXCLUDED.{col}, -1e99))"
                    )
                else:
                    update_clauses.append(f"{col} = COALESCE(EXCLUDED.{col}, economy.{col})")
            
            update_clause_str = ", ".join(update_clauses)
            
            insert_query = f"""
                INSERT INTO economy (
                    geography_id, time_id, indicator_code, gdp_growth, unemployment_rate,
                    inflation_rate, trade_balance, foreign_direct_investment, gdp_per_capita,
                    source, gdp_growth_filter, unemployment_rate_filter, inflation_rate_filter,
                    average_gdp_growth, total_trade_balance, gdp_growth_rate_percentage,
                    gdp_per_capita_growth
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                ON CONFLICT (geography_id, time_id, indicator_code, source) 
                DO UPDATE SET
                    {update_clause_str}
            """
            
            for _, row in df.iterrows():
                geography_id = self.get_geography_id(row.get('country_code'))
                time_id = self.get_time_id(row.get('year'))
                
                if geography_id and time_id:
                    cursor.execute(insert_query, (
                        geography_id,
                        time_id,
                        row.get('indicator_code', ''),
                        row.get('gdp_growth'),
                        row.get('unemployment_rate'),
                        row.get('inflation_rate'),
                        row.get('trade_balance'),
                        row.get('foreign_direct_investment'),
                        row.get('gdp_per_capita'),
                        row.get('source'),
                        row.get('gdp_growth_filter'),
                        row.get('unemployment_rate_filter'),
                        row.get('inflation_rate_filter'),
                        row.get('average_gdp_growth'),
                        row.get('total_trade_balance'),
                        row.get('gdp_growth_rate_percentage'),
                        row.get('gdp_per_capita_growth')
                    ))
            
            cursor.close()
            logger.info(f"Inserted {len(df)} rows into economy table")
            
        except Exception as e:
            logger.error(f"Error inserting economy data: {e}")
            self.conn.rollback()
    
    def insert_health_data(self, df):
        """Insert data into health table"""
        if df.empty:
            logger.warning("No health data to insert")
            return
        
        try:
            cursor = self.conn.cursor()
            insert_query = """
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
                ON CONFLICT (geography_id, time_id, indicator_code, source) 
                DO UPDATE SET
                    life_expectancy = EXCLUDED.life_expectancy,
                    maternal_mortality = EXCLUDED.maternal_mortality,
                    healthcare_expenditure = EXCLUDED.healthcare_expenditure,
                    infant_mortality = EXCLUDED.infant_mortality,
                    disease_burden = EXCLUDED.disease_burden,
                    life_expectancy_filter = EXCLUDED.life_expectancy_filter,
                    maternal_mortality_filter = EXCLUDED.maternal_mortality_filter,
                    healthcare_expenditure_filter = EXCLUDED.healthcare_expenditure_filter,
                    average_life_expectancy = EXCLUDED.average_life_expectancy,
                    total_healthcare_expenditure = EXCLUDED.total_healthcare_expenditure,
                    infant_mortality_rate = EXCLUDED.infant_mortality_rate,
                    under5_mortality_per_1k = EXCLUDED.under5_mortality_per_1k,
                    maternal_mortality_ratio = EXCLUDED.maternal_mortality_ratio,
                    physicians_per_1k = EXCLUDED.physicians_per_1k,
                    hospital_beds_per_10k = EXCLUDED.hospital_beds_per_10k,
                    suicide_rate_per_100k = EXCLUDED.suicide_rate_per_100k
            """
            
            for _, row in df.iterrows():
                geography_id = self.get_geography_id(row.get('country_code'))
                time_id = self.get_time_id(row.get('year'))
                
                if geography_id and time_id:
                    cursor.execute(insert_query, (
                        geography_id,
                        time_id,
                        row.get('indicator_code', ''),
                        row.get('life_expectancy'),
                        row.get('maternal_mortality'),
                        row.get('healthcare_expenditure'),
                        row.get('infant_mortality'),
                        row.get('disease_burden'),
                        row.get('source'),
                        row.get('life_expectancy_filter'),
                        row.get('maternal_mortality_filter'),
                        row.get('healthcare_expenditure_filter'),
                        row.get('average_life_expectancy'),
                        row.get('total_healthcare_expenditure'),
                        row.get('infant_mortality_rate'),
                        row.get('under5_mortality_per_1k'),
                        row.get('maternal_mortality_ratio'),
                        row.get('physicians_per_1k'),
                        row.get('hospital_beds_per_10k'),
                        row.get('suicide_rate_per_100k')
                    ))
            
            cursor.close()
            logger.info(f"Inserted {len(df)} rows into health table")
            
        except Exception as e:
            logger.error(f"Error inserting health data: {e}")
            self.conn.rollback()
    
    def insert_education_data(self, df):
        """Insert data into education table"""
        if df.empty:
            logger.warning("No education data to insert")
            return
        
        try:
            cursor = self.conn.cursor()
            insert_query = """
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
                ON CONFLICT (geography_id, time_id, indicator_code, source) 
                DO UPDATE SET
                    literacy_rate = EXCLUDED.literacy_rate,
                    school_enrollment_rate = EXCLUDED.school_enrollment_rate,
                    education_expenditure = EXCLUDED.education_expenditure,
                    teacher_student_ratio = EXCLUDED.teacher_student_ratio,
                    gender_parity_in_education = EXCLUDED.gender_parity_in_education,
                    literacy_rate_filter = EXCLUDED.literacy_rate_filter,
                    school_enrollment_rate_filter = EXCLUDED.school_enrollment_rate_filter,
                    education_expenditure_filter = EXCLUDED.education_expenditure_filter,
                    average_literacy_rate = EXCLUDED.average_literacy_rate,
                    total_education_expenditure = EXCLUDED.total_education_expenditure,
                    teacher_student_ratio_metric = EXCLUDED.teacher_student_ratio_metric,
                    enrollment_primary = EXCLUDED.enrollment_primary,
                    enrollment_secondary = EXCLUDED.enrollment_secondary,
                    enrollment_tertiary = EXCLUDED.enrollment_tertiary,
                    government_expenditure_pct_gdp = EXCLUDED.government_expenditure_pct_gdp,
                    primary_completion_rate = EXCLUDED.primary_completion_rate
            """
            
            for _, row in df.iterrows():
                geography_id = self.get_geography_id(row.get('country_code'))
                time_id = self.get_time_id(row.get('year'))
                
                if geography_id and time_id:
                    cursor.execute(insert_query, (
                        geography_id,
                        time_id,
                        row.get('indicator_code', ''),
                        row.get('literacy_rate'),
                        row.get('school_enrollment_rate'),
                        row.get('education_expenditure'),
                        row.get('teacher_student_ratio'),
                        row.get('gender_parity_in_education'),
                        row.get('source'),
                        row.get('literacy_rate_filter'),
                        row.get('school_enrollment_rate_filter'),
                        row.get('education_expenditure_filter'),
                        row.get('average_literacy_rate'),
                        row.get('total_education_expenditure'),
                        row.get('teacher_student_ratio_metric'),
                        row.get('enrollment_primary'),
                        row.get('enrollment_secondary'),
                        row.get('enrollment_tertiary'),
                        row.get('government_expenditure_pct_gdp'),
                        row.get('primary_completion_rate')
                    ))
            
            cursor.close()
            logger.info(f"Inserted {len(df)} rows into education table")
            
        except Exception as e:
            logger.error(f"Error inserting education data: {e}")
            self.conn.rollback()
            
    def insert_environment_data(self, df):
        """Insert data into environment table"""
        if df.empty:
            logger.warning("No environment data to insert")
            return
        
        try:
            cursor = self.conn.cursor()
            insert_query = """
                INSERT INTO environment (
                    geography_id, time_id, indicator_code, co2_emissions, renewable_energy_usage,
                    forest_area_pct, energy_use_kg_oil_pc, source, co2_emissions_filter,
                    renewable_energy_usage_filter, energy_use_filter, total_co2_emissions,
                    renewable_energy_percentage, deforestation_rate, average_deforestation_rate,
                    water_usage, pm25, electric_power_kwh_pc, freshwater_withdrawal_pct
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                ON CONFLICT (geography_id, time_id, indicator_code, source) 
                DO UPDATE SET
                    co2_emissions = EXCLUDED.co2_emissions,
                    renewable_energy_usage = EXCLUDED.renewable_energy_usage,
                    forest_area_pct = EXCLUDED.forest_area_pct,
                    energy_use_kg_oil_pc = EXCLUDED.energy_use_kg_oil_pc,
                    co2_emissions_filter = EXCLUDED.co2_emissions_filter,
                    renewable_energy_usage_filter = EXCLUDED.renewable_energy_usage_filter,
                    energy_use_filter = EXCLUDED.energy_use_filter,
                    total_co2_emissions = EXCLUDED.total_co2_emissions,
                    renewable_energy_percentage = EXCLUDED.renewable_energy_percentage,
                    deforestation_rate = EXCLUDED.deforestation_rate,
                    average_deforestation_rate = EXCLUDED.average_deforestation_rate,
                    water_usage = EXCLUDED.water_usage,
                    pm25 = EXCLUDED.pm25,
                    electric_power_kwh_pc = EXCLUDED.electric_power_kwh_pc,
                    freshwater_withdrawal_pct = EXCLUDED.freshwater_withdrawal_pct
            """
            
            for _, row in df.iterrows():
                geography_id = self.get_geography_id(row.get('country_code'))
                time_id = self.get_time_id(row.get('year'))
                
                if geography_id and time_id:
                    cursor.execute(insert_query, (
                        geography_id,
                        time_id,
                        row.get('indicator_code', ''),
                        row.get('co2_emissions'),
                        row.get('renewable_energy_usage'),
                        row.get('forest_area_pct'),
                        row.get('energy_use_kg_oil_pc'),
                        row.get('source'),
                        row.get('co2_emissions_filter'),
                        row.get('renewable_energy_usage_filter'),
                        row.get('energy_use_filter'),
                        row.get('total_co2_emissions'),
                        row.get('renewable_energy_percentage'),
                        row.get('deforestation_rate'),
                        row.get('average_deforestation_rate'),
                        row.get('water_usage'),
                        row.get('pm25'),
                        row.get('electric_power_kwh_pc'),
                        row.get('freshwater_withdrawal_pct')
                    ))
            
            cursor.close()
            logger.info(f"Inserted {len(df)} rows into environment table")
            
        except Exception as e:
            logger.error(f"Error inserting environment data: {e}")
            self.conn.rollback()
    def insert_social_demographic_data(self, df):
        """Insert data into social_demographic table"""
        if df.empty:
            logger.warning("No social demographic data to insert")
            return
        
        try:
            cursor = self.conn.cursor()
            insert_query = """
                INSERT INTO social_demographic (
                    geography_id, time_id, indicator_code, population_total, population_growth,
                    fertility_rate, age_dependency_ratio, gini_index, poverty_rate, homicide_rate,
                    child_labor, stunting_rate, immunization_dpt, source
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                ON CONFLICT (geography_id, time_id, indicator_code, source) 
                DO UPDATE SET
                    population_total = EXCLUDED.population_total,
                    population_growth = EXCLUDED.population_growth,
                    fertility_rate = EXCLUDED.fertility_rate,
                    age_dependency_ratio = EXCLUDED.age_dependency_ratio,
                    gini_index = EXCLUDED.gini_index,
                    poverty_rate = EXCLUDED.poverty_rate,
                    homicide_rate = EXCLUDED.homicide_rate,
                    child_labor = EXCLUDED.child_labor,
                    stunting_rate = EXCLUDED.stunting_rate,
                    immunization_dpt = EXCLUDED.immunization_dpt
            """
            
            for _, row in df.iterrows():
                geography_id = self.get_geography_id(row.get("country_code"))
                time_id = self.get_time_id(row.get("year"))
                
                if geography_id and time_id:
                    cursor.execute(insert_query, (
                        geography_id,
                        time_id,
                        row.get("indicator_code", ""),
                        row.get("population_total"),
                        row.get("population_growth"),
                        row.get("fertility_rate"),
                        row.get("age_dependency_ratio"),
                        row.get("gini_index"),
                        row.get("poverty_rate"),
                        row.get("homicide_rate"),
                        row.get("child_labor"),
                        row.get("stunting_rate"),
                        row.get("immunization_dpt"),
                        row.get("source")
                    ))
            
            cursor.close()
            logger.info(f"Inserted {len(df)} rows into social_demographic table")
            
        except Exception as e:
            logger.error(f"Error inserting social demographic data: {e}")
            self.conn.rollback()

    
    def insert_technology_innovation_data(self, df):
        """Insert data into technology_innovation table"""
        if df.empty:
            logger.warning("No technology innovation data to insert")
            return
        
        try:
            cursor = self.conn.cursor()
            insert_query = """
                INSERT INTO technology_innovation (
                    geography_id, time_id, indicator_code, internet_usage, mobile_subscriptions,
                    scientific_articles, patent_applications, research_expenditure, 
                    broadband_subscriptions, innovation_index, source
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                ON CONFLICT (geography_id, time_id, indicator_code, source) 
                DO UPDATE SET
                    internet_usage = EXCLUDED.internet_usage,
                    mobile_subscriptions = EXCLUDED.mobile_subscriptions,
                    scientific_articles = EXCLUDED.scientific_articles,
                    patent_applications = EXCLUDED.patent_applications,
                    research_expenditure = EXCLUDED.research_expenditure,
                    broadband_subscriptions = EXCLUDED.broadband_subscriptions,
                    innovation_index = EXCLUDED.innovation_index
            """
            
            for _, row in df.iterrows():
                geography_id = self.get_geography_id(row.get("country_code"))
                time_id = self.get_time_id(row.get("year"))
                
                if geography_id and time_id:
                    cursor.execute(insert_query, (
                        geography_id,
                        time_id,
                        row.get("indicator_code", ""),
                        row.get("internet_usage"),
                        row.get("mobile_subscriptions"),
                        row.get("scientific_articles"),
                        row.get("patent_applications"),
                        row.get("research_expenditure"),
                        row.get("broadband_subscriptions"),
                        row.get("innovation_index"),
                        row.get("source")
                    ))
            
            cursor.close()
            logger.info(f"Inserted {len(df)} rows into technology_innovation table")
            
        except Exception as e:
            logger.error(f"Error inserting technology innovation data: {e}")
            self.conn.rollback()

    
    def insert_trade_data(self, df):
        """Insert data into trade table"""
        if df.empty:
            logger.warning("No trade data to insert")
            return
        
        try:
            cursor = self.conn.cursor()
            insert_query = """
                INSERT INTO trade (
                    geography_id, time_id, indicator_code, trade_percentage_of_gdp,
                    ip_payments, high_tech_exports, trade_balance_goods,
                    trade_balance_services, exports_of_goods_services, source
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                ON CONFLICT (geography_id, time_id, indicator_code, source) 
                DO UPDATE SET
                    trade_percentage_of_gdp = EXCLUDED.trade_percentage_of_gdp,
                    ip_payments = EXCLUDED.ip_payments,
                    high_tech_exports = EXCLUDED.high_tech_exports,
                    trade_balance_goods = EXCLUDED.trade_balance_goods,
                    trade_balance_services = EXCLUDED.trade_balance_services,
                    exports_of_goods_services = EXCLUDED.exports_of_goods_services
            """
            
            for _, row in df.iterrows():
                geography_id = self.get_geography_id(row.get("country_code"))
                time_id = self.get_time_id(row.get("year"))
                
                if geography_id and time_id:
                    cursor.execute(insert_query, (
                        geography_id,
                        time_id,
                        row.get("indicator_code", ""),
                        row.get("trade_percentage_of_gdp"),
                        row.get("ip_payments"),
                        row.get("high_tech_exports"),
                        row.get("trade_balance_goods"),
                        row.get("trade_balance_services"),
                        row.get("exports_of_goods_services"),
                        row.get("source")
                    ))
            
            cursor.close()
            logger.info(f"Inserted {len(df)} rows into trade table")
            
        except Exception as e:
            logger.error(f"Error inserting trade data: {e}")
            self.conn.rollback()

    
    def update_source_metadata(self, sources):
        """Update or insert source metadata"""
        try:
            cursor = self.conn.cursor()
            
            for source in sources:
                # Check if source exists
                cursor.execute("""
                    SELECT name FROM data_source 
                    WHERE name = %s
                """, (source["name"],))
                
                result = cursor.fetchone()
                
                if result:
                    # Update existing source
                    cursor.execute("""
                        UPDATE data_source 
                        SET description = %s, url = %s, type = %s, last_updated = CURRENT_TIMESTAMP
                        WHERE name = %s
                    """, (
                        source.get("description", ""),
                        source.get("url", ""),
                        source.get("type", ""),
                        source["name"]
                    ))
                else:
                    # Insert new source
                    cursor.execute("""
                        INSERT INTO data_source (name, description, url, type, last_updated)
                        VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP)
                    """, (
                        source["name"],
                        source.get("description", ""),
                        source.get("url", ""),
                        source.get("type", "")
                    ))
            
            cursor.close()
            logger.info(f"Updated {len(sources)} source metadata records")
            
        except Exception as e:
            logger.error(f"Error updating source metadata: {e}")
            self.conn.rollback()
    
    def update_indicator_metadata(self, indicators):
        """Update or insert indicator metadata"""
        try:
            cursor = self.conn.cursor()
            
            for indicator in indicators:
                # Check if indicator exists
                cursor.execute("""
                    SELECT code FROM indicator 
                    WHERE code = %s
                """, (indicator["code"],))
                
                result = cursor.fetchone()
                
                if result:
                    # Update existing indicator
                    cursor.execute("""
                        UPDATE indicator 
                        SET name = %s, description = %s, source = %s, unit = %s, last_updated = CURRENT_TIMESTAMP
                        WHERE code = %s
                    """, (
                        indicator.get("name", ""),
                        indicator.get("description", ""),
                        indicator.get("source", ""),
                        indicator.get("unit", ""),
                        indicator["code"]
                    ))
                else:
                    # Insert new indicator
                    cursor.execute("""
                        INSERT INTO indicator (code, name, description, source, unit, last_updated)
                        VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
                    """, (
                        indicator["code"],
                        indicator.get("name", ""),
                        indicator.get("description", ""),
                        indicator.get("source", ""),
                        indicator.get("unit", "")
                    ))
            
            cursor.close()
            logger.info(f"Updated {len(indicators)} indicator metadata records")
            
        except Exception as e:
            logger.error(f"Error updating indicator metadata: {e}")
            self.conn.rollback()
