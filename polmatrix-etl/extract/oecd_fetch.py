import requests
import pandas as pd
import logging
from datetime import datetime
import time
import json
from urllib.parse import urlencode

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OECDFetcher:
    def __init__(self):
        self.base_url = "https://stats.oecd.org/SDMX-JSON/data"
        self.indicators = {
            # Environment
            'GHG_EMISSIONS': 'AIR_GHG',
            'WATER_QUALITY': 'WATER_QUALITY',
            'BIODIVERSITY': 'BIODIV',
            
            # Technology
            'BROADBAND': 'BROADBAND',
            'INNOVATION_INDEX': 'MSTI_PUB',
            
            # Trade
            'TRADE_BALANCE_GOODS': 'ITGS',
            'TRADE_BALANCE_SERVICES': 'ITSI'
        }
        
    def fetch_indicator_data(self, indicator_code, countries=None, start_year=None, end_year=None):
        """Fetch data for a single indicator"""
        try:
            # Set default parameters
            if not start_year:
                start_year = datetime.now().year - 10
            if not end_year:
                end_year = datetime.now().year
                
            # Build country filter
            if countries:
                if isinstance(countries, list):
                    country_filter = '+'.join(countries)
                else:
                    country_filter = countries
            else:
                country_filter = ""
                
            # OECD API uses different URL patterns for different datasets
            # We'll need to adapt based on the indicator
            if indicator_code == 'AIR_GHG':
                url = f"{self.base_url}/AIR_GHG/FLOW.{country_filter}../A/{start_year}:{end_year}?dimensionAtObservation=allDimensions"
            elif indicator_code == 'BROADBAND':
                url = f"{self.base_url}/BROADBAND/.{country_filter}./A/{start_year}:{end_year}?dimensionAtObservation=allDimensions"
            else:
                # Generic pattern for other datasets
                url = f"{self.base_url}/{indicator_code}/.{country_filter}./A/{start_year}:{end_year}?dimensionAtObservation=allDimensions"
                
            headers = {
                'Accept': 'application/vnd.sdmx.data+json;version=1.0.0',
                'User-Agent': 'PolmatrixETL/1.0'
            }
            
            logger.info(f"Fetching OECD data from: {url}")
            
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    response = requests.get(url, headers=headers, timeout=30)
                    response.raise_for_status()
                    break
                except requests.exceptions.RequestException as e:
                    if attempt < max_retries - 1:
                        time.sleep(2)
                        continue
                    else:
                        logger.error(f"HTTP error fetching {indicator_code}: {e}")
                        return pd.DataFrame()
            
            # Parse SDMX JSON response
            data = response.json()
            
            # Extract observations
            if 'data' not in data or 'dataSets' not in data['data']:
                logger.warning(f"No data found for indicator {indicator_code}")
                return pd.DataFrame()
                
            dataset = data['data']['dataSets'][0]
            observations = dataset.get('observations', {})
            
            if not observations:
                logger.warning(f"No observations found for indicator {indicator_code}")
                return pd.DataFrame()
                
            # Parse structure
            structure = data['data']['structure']
            dimensions = structure['dimensions']['observation']
            attributes = structure['attributes']['observation']
            
            # Create mappings for dimensions
            dimension_mappings = {}
            for dim in dimensions:
                dim_id = dim['id']
                values = dim['values']
                dimension_mappings[dim_id] = {i: val['id'] for i, val in enumerate(values)}
            
            # Parse observations into rows
            rows = []
            for obs_key, obs_value in observations.items():
                # Parse observation key
                key_parts = obs_key.split(':')
                
                # Extract dimensions
                row_data = {
                    'indicator_code': indicator_code,
                    'source': 'oecd',
                    'value': obs_value[0] if isinstance(obs_value, list) and obs_value else None
                }
                
                # Map dimension values
                for i, dim in enumerate(dimensions):
                    if i < len(key_parts):
                        dim_id = dim['id']
                        dim_idx = int(key_parts[i])
                        if dim_id in dimension_mappings and dim_idx in dimension_mappings[dim_id]:
                            row_data[dim_id.lower()] = dimension_mappings[dim_id][dim_idx]
                
                rows.append(row_data)
            
            if rows:
                df = pd.DataFrame(rows)
                return df
            else:
                return pd.DataFrame()
                
        except Exception as e:
            logger.error(f"Error fetching {indicator_code}: {e}")
            return pd.DataFrame()
    
    def fetch_all_data(self, countries=None, start_year=None, end_year=None):
        """Fetch all OECD indicators"""
        all_data = []
        
        for indicator_name, indicator_code in self.indicators.items():
            logger.info(f"Fetching {indicator_name} ({indicator_code})")
            
            df = self.fetch_indicator_data(indicator_code, countries, start_year, end_year)
            if not df.empty:
                df['indicator_name'] = indicator_name
                all_data.append(df)
                
            # Be respectful of API limits
            time.sleep(2)
        
        if all_data:
            return pd.concat(all_data, ignore_index=True)
        else:
            return pd.DataFrame()
    
    def clean_oecd_data(self, df):
        """Clean and standardize OECD data format"""
        if df.empty:
            return df
            
        # Rename common columns
        column_mapping = {
            'cou': 'country_code',
            'ref_area': 'country_code',
            'time_period': 'year',
            'time': 'year'
        }
        
        for old_col, new_col in column_mapping.items():
            if old_col in df.columns:
                df.rename(columns={old_col: new_col}, inplace=True)
        
        # Convert year to integer
        if 'year' in df.columns:
            df['year'] = pd.to_numeric(df['year'], errors='coerce').astype('Int64')
            
        # Convert value to float
        if 'value' in df.columns:
            df['value'] = pd.to_numeric(df['value'], errors='coerce')
            
        return df
    
    def save_to_csv(self, df, filename="oecd_data.csv"):
        """Save DataFrame to CSV file"""
        try:
            df.to_csv(filename, index=False)
            logger.info(f"Data saved to {filename}")
        except Exception as e:
            logger.error(f"Error saving to CSV: {e}")


if __name__ == "__main__":
    fetcher = OECDFetcher()
    # Test with a few OECD member countries
    test_countries = ['USA', 'GBR', 'DEU', 'JPN', 'FRA']
    data = fetcher.fetch_all_data(countries=test_countries, start_year=2020, end_year=2023)
    
    if not data.empty:
        cleaned_data = fetcher.clean_oecd_data(data)
        fetcher.save_to_csv(cleaned_data)
        print(f"Fetched {len(data)} rows of OECD data")
    else:
        print("No OECD data was fetched")