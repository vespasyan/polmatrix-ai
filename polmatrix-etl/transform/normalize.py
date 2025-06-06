import pandas as pd
import numpy as np
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DataTransformer:
    def __init__(self):
        # Mapping between source indicators and our database columns
        self.indicator_mappings = {
            # Economy indicators
            'GDP_GROWTH': 'gdp_growth',
            'GDP_PER_CAPITA_GROWTH': 'gdp_per_capita_growth',
            'UNEMPLOYMENT': 'unemployment_rate',
            'INFLATION': 'inflation_rate',
            'CURRENT_ACCOUNT': 'trade_balance',
            'FDI': 'foreign_direct_investment',
            'GDP_PER_CAPITA': 'gdp_per_capita',
            
            # Health indicators
            'LIFE_EXPECTANCY': 'life_expectancy',
            'MATERNAL_MORTALITY': 'maternal_mortality',
            'HEALTH_EXPENDITURE': 'healthcare_expenditure',
            'INFANT_MORTALITY': 'infant_mortality',
            'UNDER5_MORTALITY': 'under5_mortality_per_1k',
            'MATERNAL_MORTALITY': 'maternal_mortality_ratio',
            'PHYSICIANS_PER_1000': 'physicians_per_1k',
            'HOSPITAL_BEDS': 'hospital_beds_per_10k',
            'SUICIDE_RATE': 'suicide_rate_per_100k',
            
            # Education indicators
            'LITERACY_RATE': 'literacy_rate',
            'PRIMARY_ENROLLMENT': 'enrollment_primary',
            'SECONDARY_ENROLLMENT': 'enrollment_secondary',
            'TERTIARY_ENROLLMENT': 'enrollment_tertiary',
            'EDUCATION_EXPENDITURE': 'government_expenditure_pct_gdp',
            'PRIMARY_COMPLETION': 'primary_completion_rate',
            
            # Environment indicators
            'CO2_EMISSIONS': 'co2_emissions',
            'PM25': 'pm25',
            'FOREST_AREA': 'forest_area_pct',
            'FRESHWATER_WITHDRAWAL': 'freshwater_withdrawal_pct',
            'ELECTRIC_POWER': 'electric_power_kwh_pc',
            'ENERGY_USE': 'energy_use_kg_oil_pc',
            
            # Social demographic indicators
            'POPULATION_TOTAL': 'population_total',
            'POPULATION_GROWTH': 'population_growth',
            'FERTILITY_RATE': 'fertility_rate',
            'AGE_DEPENDENCY': 'age_dependency_ratio',
            'GINI': 'gini_index',
            'POVERTY_RATE': 'poverty_rate',
            'HOMICIDE_RATE': 'homicide_rate',
            'CHILD_LABOR': 'child_labor',
            'STUNTING': 'stunting_rate',
            'DPT_IMMUNIZATION': 'immunization_dpt',
            
            # Technology indicators
            'INTERNET_USERS': 'internet_usage',
            'MOBILE_SUBSCRIPTIONS': 'mobile_subscriptions',
            'SCIENTIFIC_ARTICLES': 'scientific_articles',
            'PATENT_APPLICATIONS': 'patent_applications',
            'RESEARCH_EXPENDITURE': 'research_expenditure',
            'BROADBAND': 'broadband_subscriptions',
            'INNOVATION_INDEX': 'innovation_index',
            
            # Trade indicators
            'TRADE_PCT_GDP': 'trade_percentage_of_gdp',
            'IP_PAYMENTS': 'ip_payments',
            'HIGH_TECH_EXPORTS': 'high_tech_exports',
            'TRADE_BALANCE_GOODS': 'trade_balance_goods',
            'TRADE_BALANCE_SERVICES': 'trade_balance_services'
        }
        
        # Country code standardization (ISO2 to ISO3)
        self.country_code_mapping = {
            'US': 'USA', 'GB': 'GBR', 'DE': 'DEU', 'JP': 'JPN', 'CN': 'CHN',
            'FR': 'FRA', 'IN': 'IND', 'AU': 'AUS', 'BR': 'BRA', 'CA': 'CAN',
            'RU': 'RUS', 'ZA': 'ZAF', 'KR': 'KOR', 'TR': 'TUR', 'IT': 'ITA',
            'ES': 'ESP', 'NL': 'NLD', 'BE': 'BEL', 'CH': 'CHE', 'SE': 'SWE',
            'NO': 'NOR', 'DK': 'DNK', 'FI': 'FIN', 'AT': 'AUT', 'PL': 'POL',
            'MX': 'MEX', 'ID': 'IDN', 'TH': 'THA', 'VN': 'VNM', 'PH': 'PHL',
            'MY': 'MYS', 'SG': 'SGP', 'NZ': 'NZL', 'EG': 'EGY', 'NG': 'NGA',
            'KE': 'KEN', 'MA': 'MAR', 'AE': 'ARE', 'SA': 'SAU', 'IL': 'ISR',
            'IR': 'IRN', 'IQ': 'IRQ', 'PK': 'PAK', 'BD': 'BGD', 'LK': 'LKA'
        }
    
    def standardize_country_codes(self, df):
        """Convert country codes to 3-letter ISO format"""
        if 'country_code' not in df.columns:
            return df
            
        df = df.copy()
        
        # Map 2-letter codes to 3-letter codes
        df['country_code'] = df['country_code'].map(
            lambda x: self.country_code_mapping.get(x, x) if isinstance(x, str) else x
        )
        
        return df
    
    def pivot_indicators(self, df):
        """Transform long format data to wide format for easier database insertion"""
        if df.empty:
            return df
            
        # Ensure required columns exist
        required_cols = ['country_code', 'year', 'indicator_name', 'value', 'source']
        for col in required_cols:
            if col not in df.columns:
                logger.warning(f"Missing required column: {col}")
                return df
        
        # Pivot the data
        try:
            # First, create a unique identifier for each row
            df['row_id'] = df.groupby(['country_code', 'year', 'source']).ngroup()
            
            # Pivot the data
            pivoted = df.pivot_table(
                index=['country_code', 'year', 'source', 'row_id'],
                columns='indicator_name',
                values='value',
                aggfunc='first'
            ).reset_index()
            
            # Drop the temporary row_id
            pivoted = pivoted.drop('row_id', axis=1)
            
            # Rename columns according to our mapping
            for source_name, db_name in self.indicator_mappings.items():
                if source_name in pivoted.columns:
                    pivoted.rename(columns={source_name: db_name}, inplace=True)
            
            return pivoted
            
        except Exception as e:
            logger.error(f"Error in pivot_indicators: {e}")
            return df
    
    def calculate_derived_metrics(self, df):
        """Calculate derived metrics like averages, totals, etc."""
        df = df.copy()
        
        # Economy derived metrics
        if 'gdp_growth' in df.columns:
            df['average_gdp_growth'] = df.groupby('country_code')['gdp_growth'].transform('mean')
            df['gdp_growth_rate_percentage'] = df['gdp_growth']  # Already in percentage
        
        # Health derived metrics
        if 'life_expectancy' in df.columns:
            df['average_life_expectancy'] = df.groupby('country_code')['life_expectancy'].transform('mean')
        
        if 'healthcare_expenditure' in df.columns:
            df['total_healthcare_expenditure'] = df.groupby('country_code')['healthcare_expenditure'].transform('sum')
        
        # Education derived metrics
        if 'literacy_rate' in df.columns:
            df['average_literacy_rate'] = df.groupby('country_code')['literacy_rate'].transform('mean')
        
        if 'government_expenditure_pct_gdp' in df.columns:
            df['total_education_expenditure'] = df.groupby('country_code')['government_expenditure_pct_gdp'].transform('sum')
        
        # Environment derived metrics
        if 'co2_emissions' in df.columns:
            df['total_co2_emissions'] = df.groupby('country_code')['co2_emissions'].transform('sum')
        
        if 'energy_use_kg_oil_pc' in df.columns:
            df['renewable_energy_percentage'] = np.nan  # We'll need actual renewable energy data
        
        return df
    
    def add_filter_values(self, df):
        """Add filter values for UI filtering"""
        df = df.copy()
        
        # Add filter values based on quartiles or ranges
        if 'gdp_growth' in df.columns:
            df['gdp_growth_filter'] = pd.qcut(df['gdp_growth'], 
                                              q=4, 
                                              labels=['Low', 'Medium-Low', 'Medium-High', 'High'], 
                                              duplicates='drop')
        
        if 'unemployment_rate' in df.columns:
            df['unemployment_rate_filter'] = pd.qcut(df['unemployment_rate'], 
                                                     q=4, 
                                                     labels=['Low', 'Medium-Low', 'Medium-High', 'High'], 
                                                     duplicates='drop')
        
        if 'inflation_rate' in df.columns:
            df['inflation_rate_filter'] = pd.qcut(df['inflation_rate'], 
                                                  q=4, 
                                                  labels=['Low', 'Medium-Low', 'Medium-High', 'High'], 
                                                  duplicates='drop')
        
        # Add more filter columns as needed for other domains
        
        return df
    
    def normalize_all_data(self, data_sources):
        """Main function to normalize data from all sources"""
        normalized_data = {}
        
        for source_name, df in data_sources.items():
            logger.info(f"Normalizing data from {source_name}")
            
            if df.empty:
                logger.warning(f"No data to normalize for {source_name}")
                continue
            
            # Apply transformations
            df = self.standardize_country_codes(df)
            df = self.pivot_indicators(df)
            df = self.calculate_derived_metrics(df)
            df = self.add_filter_values(df)
            
            normalized_data[source_name] = df
        
        return normalized_data
    
    def split_by_domain(self, df):
        """Split normalized data into domain-specific DataFrames"""
        domains = {
            'economy': [],
            'health': [],
            'education': [],
            'environment': [],
            'social_demographic': [],
            'technology_innovation': [],
            'trade': []
        }
        
        # Map columns to domains
        column_to_domain = {
            # Economy
            'gdp_growth': 'economy',
            'gdp_per_capita_growth': 'economy',
            'unemployment_rate': 'economy',
            'inflation_rate': 'economy',
            'trade_balance': 'economy',
            'foreign_direct_investment': 'economy',
            'gdp_per_capita': 'economy',
            
            # Health
            'life_expectancy': 'health',
            'maternal_mortality': 'health',
            'healthcare_expenditure': 'health',
            'infant_mortality': 'health',
            
            # Education
            'literacy_rate': 'education',
            'enrollment_primary': 'education',
            'enrollment_secondary': 'education',
            'enrollment_tertiary': 'education',
            'government_expenditure_pct_gdp': 'education',
            
            # Environment
            'co2_emissions': 'environment',
            'pm25': 'environment',
            'forest_area_pct': 'environment',
            'energy_use_kg_oil_pc': 'environment',
            
            # Social demographic
            'population_total': 'social_demographic',
            'population_growth': 'social_demographic',
            'fertility_rate': 'social_demographic',
            'gini_index': 'social_demographic',
            
            # Technology
            'internet_usage': 'technology_innovation',
            'mobile_subscriptions': 'technology_innovation',
            'research_expenditure': 'technology_innovation',
            
            # Trade
            'trade_percentage_of_gdp': 'trade',
            'high_tech_exports': 'trade',
            'trade_balance_goods': 'trade'
        }
        
        # Create base columns for all domains
        base_columns = ['country_code', 'year', 'source']
        
        # Create domain-specific DataFrames
        for domain, columns in domains.items():
            domain_columns = base_columns.copy()
            
            # Add domain-specific columns
            for col, col_domain in column_to_domain.items():
                if col_domain == domain and col in df.columns:
                    domain_columns.append(col)
            
            # Create domain DataFrame
            if len(domain_columns) > len(base_columns):
                domains[domain] = df[domain_columns].copy()
            else:
                domains[domain] = pd.DataFrame()  # Empty DataFrame if no relevant columns
        
        return domains


if __name__ == "__main__":
    # Test the transformer
    transformer = DataTransformer()
    
    # Create sample data for testing
    sample_data = {
        'worldbank': pd.DataFrame({
            'country_code': ['US', 'GB', 'DE'],
            'year': [2020, 2020, 2020],
            'indicator_name': ['GDP_GROWTH', 'GDP_GROWTH', 'GDP_GROWTH'],
            'value': [2.1, 1.5, 3.4],
            'source': ['world_bank', 'world_bank', 'world_bank']
        })
    }
    
    normalized = transformer.normalize_all_data(sample_data)
    print("Normalized data:")
    for source, df in normalized.items():
        print(f"\n{source}:")
        print(df.head())