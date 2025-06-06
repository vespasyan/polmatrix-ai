"""
Simple mock data generator for development and testing.
This script creates synthetic data for all the tables.
"""

import pandas as pd
import numpy as np
import os
import sys
import json
from datetime import datetime, timedelta
import random

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Output directory for mock data
output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'data_cache')
os.makedirs(output_dir, exist_ok=True)
print(f"Output directory: {output_dir}")

def generate_countries(count=50):
    """Generate mock country data"""
    countries = [
        {'code': 'USA', 'name': 'United States', 'region': 'North America'},
        {'code': 'GBR', 'name': 'United Kingdom', 'region': 'Europe'},
        {'code': 'DEU', 'name': 'Germany', 'region': 'Europe'},
        {'code': 'JPN', 'name': 'Japan', 'region': 'Asia'},
        {'code': 'CHN', 'name': 'China', 'region': 'Asia'},
        {'code': 'FRA', 'name': 'France', 'region': 'Europe'},
        {'code': 'IND', 'name': 'India', 'region': 'Asia'},
        {'code': 'AUS', 'name': 'Australia', 'region': 'Oceania'},
        {'code': 'BRA', 'name': 'Brazil', 'region': 'South America'},
        {'code': 'CAN', 'name': 'Canada', 'region': 'North America'},
        {'code': 'ZAF', 'name': 'South Africa', 'region': 'Africa'}
    ]
    
    # Generate additional countries if needed
    if count > len(countries):
        regions = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania']
        for i in range(len(countries), count):
            code = f"X{i:02d}"
            name = f"Country {i}"
            region = random.choice(regions)
            countries.append({'code': code, 'name': name, 'region': region})
    
    return pd.DataFrame(countries[:count])

def generate_economy_data(countries, years):
    """Generate mock economy data"""
    rows = []
    
    for country in countries['code']:
        for year in years:
            # Base values with some randomness
            gdp_growth = round(random.uniform(-2.0, 8.0), 2)
            unemployment = round(random.uniform(2.0, 15.0), 2)
            inflation = round(random.uniform(0.0, 12.0), 2)
            trade_balance = round(random.uniform(-10.0, 15.0), 2)
            fdi = round(random.uniform(0.0, 150.0), 2) * 1e9
            gdp_per_capita = round(random.uniform(1000, 80000), 2)
            
            # Add row
            rows.append({
                'country_code': country,
                'year': year,                'gdp_growth': gdp_growth,
                'unemployment_rate': unemployment,
                'inflation_rate': inflation,
                'trade_balance': trade_balance,
                'foreign_direct_investment': fdi,
                'gdp_per_capita': gdp_per_capita,
                'source': 'mock_data',
                'gdp_growth_filter': 3 if gdp_growth > 3 else 2 if gdp_growth > 0 else 1,  # Numeric codes: 3=High, 2=Medium, 1=Low
                'unemployment_rate_filter': 3 if unemployment > 10 else 2 if unemployment > 5 else 1,  # Numeric codes: 3=High, 2=Medium, 1=Low
                'inflation_rate_filter': 3 if inflation > 6 else 2 if inflation > 3 else 1,  # Numeric codes: 3=High, 2=Medium, 1=Low
                'average_gdp_growth': gdp_growth * 0.8,  # Simulated average
                'total_trade_balance': trade_balance * 3,  # Simulated total
                'gdp_growth_rate_percentage': gdp_growth,
                'gdp_per_capita_growth': round(random.uniform(-3.0, 7.0), 2),
                'indicator_code': 'ECON_MOCK'
            })
    
    return pd.DataFrame(rows)

def generate_health_data(countries, years):
    """Generate mock health data"""
    rows = []
    
    for country in countries['code']:
        for year in years:
            # Base values with some randomness
            life_expectancy = round(random.uniform(60.0, 85.0), 2)
            maternal_mortality = round(random.uniform(2.0, 300.0), 2)
            healthcare_expenditure = round(random.uniform(2.0, 18.0), 2)
            infant_mortality = round(random.uniform(1.0, 40.0), 2)
            
            # Add row
            rows.append({
                'country_code': country,
                'year': year,                'life_expectancy': life_expectancy,
                'maternal_mortality': maternal_mortality,
                'healthcare_expenditure': healthcare_expenditure,
                'infant_mortality': infant_mortality,
                'disease_burden': round(random.uniform(100, 500), 2),
                'source': 'mock_data',
                'life_expectancy_filter': 3 if life_expectancy > 80 else 2 if life_expectancy > 70 else 1,  # Numeric codes: 3=High, 2=Medium, 1=Low
                'maternal_mortality_filter': 3 if maternal_mortality > 100 else 2 if maternal_mortality > 20 else 1,  # Numeric codes: 3=High, 2=Medium, 1=Low
                'healthcare_expenditure_filter': 3 if healthcare_expenditure > 10 else 2 if healthcare_expenditure > 5 else 1,  # Numeric codes: 3=High, 2=Medium, 1=Low
                'average_life_expectancy': life_expectancy - 2,  # Simulated average
                'total_healthcare_expenditure': healthcare_expenditure * 3,  # Simulated total
                'under5_mortality_per_1k': round(infant_mortality * 1.2, 2),
                'maternal_mortality_ratio': maternal_mortality,
                'physicians_per_1k': round(random.uniform(0.5, 5.0), 2),
                'hospital_beds_per_10k': round(random.uniform(10, 80), 2),
                'suicide_rate_per_100k': round(random.uniform(3, 25), 2),
                'infant_mortality_rate': infant_mortality,  # Added for consistency
                'indicator_code': 'HLTH_MOCK'
            })
    
    return pd.DataFrame(rows)

def generate_education_data(countries, years):
    """Generate mock education data"""
    rows = []
    
    for country in countries['code']:
        for year in years:
            # Base values with some randomness
            literacy_rate = round(random.uniform(60.0, 100.0), 2)
            enrollment_primary = round(random.uniform(80.0, 100.0), 2)
            enrollment_secondary = round(random.uniform(40.0, 98.0), 2)
            enrollment_tertiary = round(random.uniform(20.0, 90.0), 2)
            government_expenditure = round(random.uniform(2.0, 8.0), 2)
            
            # Add row
            rows.append({
                'country_code': country,
                'year': year,                'literacy_rate': literacy_rate,
                'enrollment_primary': enrollment_primary,
                'enrollment_secondary': enrollment_secondary,
                'enrollment_tertiary': enrollment_tertiary,
                'government_expenditure_pct_gdp': government_expenditure,
                'source': 'mock_data',
                'literacy_rate_filter': 3 if literacy_rate > 90 else 2 if literacy_rate > 75 else 1,  # Numeric codes: 3=High, 2=Medium, 1=Low
                'school_enrollment_rate': (enrollment_primary + enrollment_secondary) / 2,
                'education_expenditure': government_expenditure,
                'education_expenditure_filter': 3 if government_expenditure > 6 else 2 if government_expenditure > 4 else 1,  # Numeric codes: 3=High, 2=Medium, 1=Low
                'average_literacy_rate': literacy_rate * 0.95,  # Simulated average
                'total_education_expenditure': government_expenditure * 10,  # Simulated total
                'teacher_student_ratio': round(random.uniform(10, 40), 2),
                'teacher_student_ratio_metric': round(random.uniform(0.025, 0.1), 3),
                'primary_completion_rate': round(random.uniform(60, 100), 2),
                'indicator_code': 'EDUC_MOCK',
                'gender_parity_in_education': round(random.uniform(0.7, 1.1), 2),
                'school_enrollment_rate_filter': 3 if (enrollment_primary + enrollment_secondary) / 2 > 85 else 2 if (enrollment_primary + enrollment_secondary) / 2 > 70 else 1  # Numeric codes: 3=High, 2=Medium, 1=Low
            })
    
    return pd.DataFrame(rows)

def generate_environment_data(countries, years):
    """Generate mock environment data"""
    rows = []
    
    for country in countries['code']:
        for year in years:
            # Base values with some randomness
            co2_emissions = round(random.uniform(0.5, 20.0), 2)
            renewable_energy = round(random.uniform(5.0, 80.0), 2)
            forest_area = round(random.uniform(10.0, 70.0), 2)
            energy_use = round(random.uniform(500, 10000), 2)
            
            # Add row
            rows.append({
                'country_code': country,
                'year': year,                'co2_emissions': co2_emissions,
                'renewable_energy_usage': renewable_energy,
                'forest_area_pct': forest_area,
                'energy_use_kg_oil_pc': energy_use,
                'source': 'mock_data',
                'co2_emissions_filter': 3 if co2_emissions > 10 else 2 if co2_emissions > 5 else 1,  # Numeric codes: 3=High, 2=Medium, 1=Low
                'renewable_energy_usage_filter': 3 if renewable_energy > 50 else 2 if renewable_energy > 20 else 1,  # Numeric codes: 3=High, 2=Medium, 1=Low
                'energy_use_filter': 3 if energy_use > 5000 else 2 if energy_use > 2000 else 1,  # Numeric codes: 3=High, 2=Medium, 1=Low
                'total_co2_emissions': co2_emissions * 1000000,  # Simulated total
                'renewable_energy_percentage': renewable_energy,
                'deforestation_rate': round(random.uniform(-2.0, 1.0), 2),
                'average_deforestation_rate': round(random.uniform(-1.5, 0.5), 2),
                'water_usage': round(random.uniform(100, 1000), 2),
                'pm25': round(random.uniform(5, 60), 2),
                'electric_power_kwh_pc': round(random.uniform(500, 15000), 2),
                'freshwater_withdrawal_pct': round(random.uniform(1, 100), 2),
                'indicator_code': 'ENV_MOCK'
            })
    
    return pd.DataFrame(rows)

def generate_social_demographic_data(countries, years):
    """Generate mock social demographic data"""
    rows = []
    
    for country in countries['code']:
        for year in years:
            # Base values with some randomness
            population = round(random.uniform(1000000, 1500000000), 0)
            population_growth = round(random.uniform(-0.5, 2.5), 2)
            fertility_rate = round(random.uniform(1.2, 5.0), 2)
            age_dependency = round(random.uniform(20, 80), 2)
            
            # Add row
            rows.append({
                'country_code': country,
                'year': year,
                'population_total': population,
                'population_growth': population_growth,
                'fertility_rate': fertility_rate,
                'age_dependency_ratio': age_dependency,
                'gini_index': round(random.uniform(25, 65), 2),
                'poverty_rate': round(random.uniform(0.5, 40), 2),
                'homicide_rate': round(random.uniform(0.5, 25), 2),
                'child_labor': round(random.uniform(0, 20), 2),
                'stunting_rate': round(random.uniform(1, 30), 2),
                'immunization_dpt': round(random.uniform(50, 99), 2),
                'source': 'mock_data',
                'indicator_code': 'SOCDEM_MOCK'
            })
    
    return pd.DataFrame(rows)

def generate_technology_innovation_data(countries, years):
    """Generate mock technology and innovation data"""
    rows = []
    
    for country in countries['code']:
        for year in years:
            # Base values with some randomness
            internet_usage = round(random.uniform(20, 95), 2)
            mobile_subs = round(random.uniform(50, 150), 2)
            research_exp = round(random.uniform(0.1, 4.5), 2)
            
            # Add row
            rows.append({
                'country_code': country,
                'year': year,
                'internet_usage': internet_usage,
                'mobile_subscriptions': mobile_subs,
                'scientific_articles': round(random.uniform(100, 100000), 0),
                'patent_applications': round(random.uniform(50, 50000), 0),
                'research_expenditure': research_exp,
                'broadband_subscriptions': round(random.uniform(5, 45), 2),
                'innovation_index': round(random.uniform(20, 65), 2),
                'source': 'mock_data',
                'indicator_code': 'TECH_MOCK'
            })
    
    return pd.DataFrame(rows)

def generate_trade_data(countries, years):
    """Generate mock trade data"""
    rows = []
    
    for country in countries['code']:
        for year in years:
            # Base values with some randomness
            trade_pct_gdp = round(random.uniform(20, 200), 2)
            exports = round(random.uniform(10, 50), 2)
            
            # Add row
            rows.append({
                'country_code': country,
                'year': year,
                'trade_percentage_of_gdp': trade_pct_gdp,
                'ip_payments': round(random.uniform(100000, 10000000), 2),
                'high_tech_exports': round(random.uniform(5, 40), 2),
                'trade_balance_goods': round(random.uniform(-20, 20), 2),
                'trade_balance_services': round(random.uniform(-10, 15), 2),
                'exports_of_goods_services': exports,
                'source': 'mock_data',
                'indicator_code': 'TRADE_MOCK'
            })
    
    return pd.DataFrame(rows)

def generate_all_mock_data():
    """Generate all mock data and save to CSV files"""
    print("Generating mock data...")
    
    # Generate base countries
    countries = generate_countries(count=20)
    
    # Generate years (2010-2023)
    years = list(range(2010, 2024))
    
    # Generate all data types
    economy_data = generate_economy_data(countries, years)
    health_data = generate_health_data(countries, years)
    education_data = generate_education_data(countries, years)
    environment_data = generate_environment_data(countries, years)
    social_demographic_data = generate_social_demographic_data(countries, years)
    technology_data = generate_technology_innovation_data(countries, years)
    trade_data = generate_trade_data(countries, years)
    
    # Save to CSV files
    countries.to_csv(os.path.join(output_dir, 'countries.csv'), index=False)
    economy_data.to_csv(os.path.join(output_dir, 'economy_data.csv'), index=False)
    health_data.to_csv(os.path.join(output_dir, 'health_data.csv'), index=False)
    education_data.to_csv(os.path.join(output_dir, 'education_data.csv'), index=False)
    environment_data.to_csv(os.path.join(output_dir, 'environment_data.csv'), index=False)
    social_demographic_data.to_csv(os.path.join(output_dir, 'social_demographic_data.csv'), index=False)
    technology_data.to_csv(os.path.join(output_dir, 'technology_data.csv'), index=False)
    trade_data.to_csv(os.path.join(output_dir, 'trade_data.csv'), index=False)
    
    # Create a combined file for each data source
    combined_data = {
        'worldbank': pd.concat([
            economy_data, health_data, education_data, environment_data,
            social_demographic_data, technology_data, trade_data
        ], ignore_index=True)
    }
    
    # Save combined data
    for source, df in combined_data.items():
        df.to_csv(os.path.join(output_dir, f'{source}_data.csv'), index=False)
    
    print(f"Mock data generated and saved to {output_dir}")
    return combined_data

if __name__ == "__main__":
    generate_all_mock_data()