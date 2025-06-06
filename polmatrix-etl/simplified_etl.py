"""
This script runs a simplified ETL process with better error handling.
It uses mock data when the real APIs are not available.
"""

import os
import sys
import logging
import pandas as pd
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import required modules
from load.db_loader import DatabaseLoader
from tests.generate_mock_data import generate_all_mock_data

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_data_to_database():
    """Load mock data into the database"""
    try:
        # Get mock data
        logger.info("Generating mock data for database loading...")
        mock_data = generate_all_mock_data()
        
        # Create database loader
        logger.info("Connecting to database...")
        db_loader = DatabaseLoader()
        
        # Split data by domain
        logger.info("Preparing data for loading...")
        
        # Read the CSV files directly 
        data_dir = r"C:\Users\Ahmed\Projects\data_cache"
        logger.info(f"Reading data from: {data_dir}")
        
        domain_data = {
            'economy': pd.read_csv(os.path.join(data_dir, 'economy_data.csv')),
            'health': pd.read_csv(os.path.join(data_dir, 'health_data.csv')),
            'education': pd.read_csv(os.path.join(data_dir, 'education_data.csv')),
            'environment': pd.read_csv(os.path.join(data_dir, 'environment_data.csv')),
            'social_demographic': pd.read_csv(os.path.join(data_dir, 'social_demographic_data.csv')),
            'technology_innovation': pd.read_csv(os.path.join(data_dir, 'technology_data.csv')),
            'trade': pd.read_csv(os.path.join(data_dir, 'trade_data.csv'))
        }
        
        # Load data into the database
        logger.info("Loading economy data...")
        db_loader.insert_economy_data(domain_data['economy'])
        
        logger.info("Loading health data...")
        db_loader.insert_health_data(domain_data['health'])
        
        logger.info("Loading education data...")
        db_loader.insert_education_data(domain_data['education'])
        
        logger.info("Loading environment data...")
        db_loader.insert_environment_data(domain_data['environment'])
        
        logger.info("Loading social demographic data...")
        db_loader.insert_social_demographic_data(domain_data['social_demographic'])
        
        logger.info("Loading technology innovation data...")
        db_loader.insert_technology_innovation_data(domain_data['technology_innovation'])
        
        logger.info("Loading trade data...")
        db_loader.insert_trade_data(domain_data['trade'])
        
        # Update metadata
        logger.info("Updating metadata...")
        sources = [
            {
                'name': 'mock_data',
                'description': 'Mock data for development and testing',
                'url': 'http://localhost',
                'type': 'mock'
            }
        ]
        
        indicators = [
            {
                'code': 'ECON_MOCK',
                'name': 'Economy Metrics',
                'description': 'Mock economy data for testing',
                'source': 'mock_data',
                'unit': 'Various'
            },
            {
                'code': 'HLTH_MOCK',
                'name': 'Health Metrics',
                'description': 'Mock health data for testing',
                'source': 'mock_data',
                'unit': 'Various'
            },
            {
                'code': 'EDUC_MOCK',
                'name': 'Education Metrics',
                'description': 'Mock education data for testing',
                'source': 'mock_data',
                'unit': 'Various'
            },
            {
                'code': 'ENV_MOCK',
                'name': 'Environment Metrics',
                'description': 'Mock environment data for testing',
                'source': 'mock_data',
                'unit': 'Various'
            },
            {
                'code': 'SOCDEM_MOCK',
                'name': 'Social Demographic Metrics',
                'description': 'Mock social demographic data for testing',
                'source': 'mock_data',
                'unit': 'Various'
            },
            {
                'code': 'TECH_MOCK',
                'name': 'Technology Metrics',
                'description': 'Mock technology data for testing',
                'source': 'mock_data',
                'unit': 'Various'
            },
            {
                'code': 'TRADE_MOCK',
                'name': 'Trade Metrics',
                'description': 'Mock trade data for testing',
                'source': 'mock_data',
                'unit': 'Various'
            }
        ]
        
        # Close database connection
        db_loader.close()
        
        logger.info("Data loaded successfully into database!")
        
    except Exception as e:
        logger.error(f"Error during data loading: {e}")
        raise

if __name__ == "__main__":
    try:
        # Load data into the database
        load_data_to_database()
        
    except Exception as e:
        logger.error(f"ETL process failed: {e}")
        sys.exit(1)