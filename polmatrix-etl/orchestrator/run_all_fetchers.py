import os
import sys
import logging
import schedule
import time
from datetime import datetime, timedelta
import pandas as pd

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import our modules
from extract.worldbank_fetch import WorldBankFetcher
from extract.who_fetch import WHOFetcher
from extract.unicef_fetch import UNICEFFetcher
from extract.oecd_fetch import OECDFetcher
from transform.normalize import DataTransformer
from load.db_loader import DatabaseLoader

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('etl_logs/etl_process.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class ETLOrchestrator:
    def __init__(self):
        """Initialize ETL orchestrator"""
        self.wb_fetcher = WorldBankFetcher()
        self.who_fetcher = WHOFetcher()
        self.unicef_fetcher = UNICEFFetcher()
        self.oecd_fetcher = OECDFetcher()
        self.transformer = DataTransformer()
        self.db_loader = DatabaseLoader()
        
        # ETL configuration
        self.countries = [
            'USA', 'GBR', 'DEU', 'JPN', 'CHN', 'FRA', 'IND', 'AUS', 'BRA', 'CAN',
            'RUS', 'ZAF', 'KOR', 'TUR', 'ITA', 'ESP', 'NLD', 'BEL', 'CHE', 'SWE',
            'NOR', 'DNK', 'FIN', 'AUT', 'POL', 'MEX', 'IDN', 'THA', 'VNM', 'PHL',
            'MYS', 'SGP', 'NZL', 'EGY', 'NGA', 'KEN', 'MAR', 'ARE', 'SAU', 'ISR',
            'IRN', 'IRQ', 'PAK', 'BGD', 'LKA'
        ]
        
        # Historical data range
        self.start_year = 2010
        self.end_year = datetime.now().year
        
        # Data cache directory
        self.cache_dir = os.path.join(os.path.dirname(__file__), '../data_cache')
        os.makedirs(self.cache_dir, exist_ok=True)
    
    def extract_data(self):
        """Extract data from all sources"""
        logger.info("Starting data extraction process")
        
        # Extract World Bank data
        logger.info("Extracting World Bank data...")
        wb_data = self.wb_fetcher.fetch_data(
            start_year=self.start_year,
            end_year=self.end_year,
            countries=self.countries
        )
        wb_data.to_csv(os.path.join(self.cache_dir, 'worldbank_data.csv'), index=False)
        
        # Extract WHO data  
        logger.info("Extracting WHO data...")
        who_data = self.who_fetcher.fetch_all_data(
            countries=self.countries,
            start_year=self.start_year,
            end_year=self.end_year
        )
        if not who_data.empty:
            who_data = self.who_fetcher.clean_who_data(who_data)
            who_data.to_csv(os.path.join(self.cache_dir, 'who_data.csv'), index=False)
        
        # Extract UNICEF data
        logger.info("Extracting UNICEF data...")
        unicef_data = self.unicef_fetcher.fetch_all_data(
            countries=self.countries,
            start_year=self.start_year,
            end_year=self.end_year
        )
        if not unicef_data.empty:
            unicef_data = self.unicef_fetcher.clean_unicef_data(unicef_data)
            unicef_data.to_csv(os.path.join(self.cache_dir, 'unicef_data.csv'), index=False)
        
        # Extract OECD data
        logger.info("Extracting OECD data...")
        oecd_data = self.oecd_fetcher.fetch_all_data(
            countries=self.countries,
            start_year=self.start_year,
            end_year=self.end_year
        )
        if not oecd_data.empty:
            oecd_data = self.oecd_fetcher.clean_oecd_data(oecd_data)
            oecd_data.to_csv(os.path.join(self.cache_dir, 'oecd_data.csv'), index=False)
        
        logger.info("Data extraction completed")
        return {
            'worldbank': wb_data,
            'who': who_data,
            'unicef': unicef_data,
            'oecd': oecd_data
        }
    
    def load_cached_data(self):
        """Load data from cache files"""
        cached_data = {}
        
        cache_files = {
            'worldbank': 'worldbank_data.csv',
            'who': 'who_data.csv',
            'unicef': 'unicef_data.csv',
            'oecd': 'oecd_data.csv'
        }
        
        for source, filename in cache_files.items():
            filepath = os.path.join(self.cache_dir, filename)
            if os.path.exists(filepath):
                logger.info(f"Loading cached {source} data...")
                try:
                    cached_data[source] = pd.read_csv(filepath)
                except Exception as e:
                    logger.error(f"Error loading {source} cache: {e}")
                    cached_data[source] = pd.DataFrame()
            else:
                logger.warning(f"No cache file found for {source}")
                cached_data[source] = pd.DataFrame()
        
        return cached_data
    
    def transform_data(self, raw_data):
        """Transform data to match database schema"""
        logger.info("Starting data transformation")
        
        # Normalize all data
        normalized_data = self.transformer.normalize_all_data(raw_data)
        
        # Combine normalized data from all sources
        combined_data = pd.DataFrame()
        for source, df in normalized_data.items():
            if not df.empty:
                combined_data = pd.concat([combined_data, df], ignore_index=True)
        
        # Split into domain-specific DataFrames
        domain_data = self.transformer.split_by_domain(combined_data)
        
        logger.info("Data transformation completed")
        return domain_data
    
    def load_data(self, domain_data):
        """Load transformed data into database"""
        logger.info("Starting data loading process")
        
        try:
            # Load all domain data
            self.db_loader.load_all_data(domain_data)
            
            # Update metadata tables
            self.update_metadata()
            
            logger.info("Data loading completed successfully")
            
        except Exception as e:
            logger.error(f"Error during data loading: {e}")
            raise
        
        finally:
            self.db_loader.close()
    
    def update_metadata(self):
        """Update indicator and source metadata"""
        # Update source metadata
        sources = [
            {
                'name': 'world_bank',
                'description': 'World Bank Open Data',
                'url': 'https://data.worldbank.org/',
                'type': 'api'
            },
            {
                'name': 'who',
                'description': 'World Health Organization Global Health Observatory',
                'url': 'https://www.who.int/data/gho',
                'type': 'api'
            },
            {
                'name': 'unicef',
                'description': 'UNICEF Data Portal',
                'url': 'https://data.unicef.org/',
                'type': 'api'
            },
            {
                'name': 'oecd',
                'description': 'OECD Statistics',
                'url': 'https://stats.oecd.org/',
                'type': 'api'
            }
        ]
        
        self.db_loader.update_source_metadata(sources)
        
        # Update indicator metadata (you can expand this list)
        indicators = [
            {
                'code': 'NY.GDP.MKTP.CD',
                'name': 'GDP (current US$)',
                'description': 'Gross domestic product in current US dollars',
                'source': 'world_bank',
                'unit': 'USD'
            },
            {
                'code': 'WHOSIS_000001',
                'name': 'Life expectancy at birth',
                'description': 'Life expectancy at birth (years)',
                'source': 'who',
                'unit': 'years'
            }
            # Add more indicators as needed
        ]
        
        self.db_loader.update_indicator_metadata(indicators)
    
    def run_full_etl(self):
        """Run the complete ETL process"""
        logger.info("Starting full ETL process")
        
        try:
            # Extract
            raw_data = self.extract_data()
            
            # Transform
            domain_data = self.transform_data(raw_data)
            
            # Load
            self.load_data(domain_data)
            
            logger.info("Full ETL process completed successfully")
            
        except Exception as e:
            logger.error(f"ETL process failed: {e}")
            raise
    
    def run_incremental_etl(self):
        """Run ETL for only recent data (last 2 years)"""
        logger.info("Starting incremental ETL process")
        
        # Update date range for incremental updates
        self.start_year = datetime.now().year - 2
        
        try:
            # Run full ETL with updated date range
            self.run_full_etl()
            
            logger.info("Incremental ETL process completed successfully")
            
        except Exception as e:
            logger.error(f"Incremental ETL process failed: {e}")
            raise
    
    def schedule_jobs(self):
        """Schedule regular ETL jobs"""
        logger.info("Setting up scheduled jobs")
        
        # Full ETL runs monthly
        schedule.every().month.at("02:00").do(self.run_full_etl)
        
        # Incremental ETL runs weekly
        schedule.every().week.at("02:00").do(self.run_incremental_etl)
        
        # Test job (runs every hour for testing)
        # schedule.every().hour.do(self.run_incremental_etl)
        
        logger.info("Scheduled jobs configured")


def main():
    """Main entry point for ETL orchestrator"""
    orchestrator = ETLOrchestrator()
    
    # Parse command line arguments
    if len(sys.argv) > 1:
        if sys.argv[1] == 'full':
            orchestrator.run_full_etl()
        elif sys.argv[1] == 'incremental':
            orchestrator.run_incremental_etl()
        elif sys.argv[1] == 'schedule':
            orchestrator.schedule_jobs()
            logger.info("Scheduler started. Press Ctrl+C to exit.")
            while True:
                schedule.run_pending()
                time.sleep(1)
        else:
            print("Usage: python run_all_fetchers.py [full|incremental|schedule]")
    else:
        # Default to full ETL
        orchestrator.run_full_etl()


if __name__ == "__main__":
    main()