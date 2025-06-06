import requests
import pandas as pd
import logging
from datetime import datetime
import time
import json
from urllib.parse import urlencode

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class UNICEFFetcher:
    def __init__(self):
        self.base_url = "https://sdmx.data.unicef.org/ws/public/sdmxapi/rest/data"
        self.indicators = {
            'CHILD_LABOR': 'CHILD_LABOUR',
            'STUNTING': 'NUTRITION',
            'DPT_IMMUNIZATION': 'IMMUNIZATION',
            'PRIMARY_COMPLETION': 'EDUCATION',
            'YOUTH_LITERACY': 'EDUCATION'
        }
        
    def fetch_indicator_data(self, indicator_code, countries=None, start_year=None, end_year=None):
        """Fetch data for a single indicator"""
        try:
            # Build URL for UNICEF SDMX API
            # Note: UNICEF uses SDMX format which requires different URL structure
            
            # Set default parameters
            if not start_year:
                start_year = datetime.now().year - 10
            if not end_year:
                end_year = datetime.now().year
                
            # Build time range
            time_range = f"{start_year}-12-31/{end_year}-12-31"
            
            # Build country filter
            if countries:
                if isinstance(countries, list):
                    country_filter = '+'.join(countries)
                else:
                    country_filter = countries
            else:
                country_filter = ""
                
            # UNICEF API URL format
            url = f"{self.base_url}/UNICEF,{indicator_code},1.0/A.{country_filter}./time={time_range}?format=jsondata"
            
            headers = {
                'Accept': 'application/vnd.sdmx.data+json;version=1.0.0-wd',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            logger.info(f"Fetching UNICEF data from: {url}")
            
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
                
            # Parse observations into rows
            rows = []
            series = dataset.get('series', {})
            
            for series_key, series_info in series.items():
                # Parse series key to get dimensions
                dimensions = series_key.split(':')
                country_idx = int(dimensions[1]) if len(dimensions) > 1 else 0
                
                # Get country code from structure
                structure = data['data']['structure']
                dimensions_info = structure['dimensions']['series']
                country_dim = None
                for dim in dimensions_info:
                    if dim['id'] == 'REF_AREA':
                        country_dim = dim
                        break
                        
                if country_dim and country_idx < len(country_dim['values']):
                    country_code = country_dim['values'][country_idx]['id']
                else:
                    country_code = 'Unknown'
                    
                # Get observations for this series
                series_obs = series_info.get('observations', {})
                for time_idx, obs_data in series_obs.items():
                    time_point = int(time_idx)
                    value = obs_data[0] if isinstance(obs_data, list) and obs_data else None
                    
                    # Get year from time dimension
                    time_dim = None
                    for dim in structure['dimensions']['observation']:
                        if dim['id'] == 'TIME_PERIOD':
                            time_dim = dim
                            break
                            
                    if time_dim and time_point < len(time_dim['values']):
                        year = time_dim['values'][time_point]['id']
                    else:
                        year = None
                        
                    rows.append({
                        'country_code': country_code,
                        'year': year,
                        'value': value,
                        'indicator_code': indicator_code,
                        'source': 'unicef'
                    })
            
            if rows:
                df = pd.DataFrame(rows)
                return df
            else:
                return pd.DataFrame()
                
        except Exception as e:
            logger.error(f"Error fetching {indicator_code}: {e}")
            return pd.DataFrame()
    
    def fetch_all_data(self, countries=None, start_year=None, end_year=None):
        """Fetch all UNICEF indicators"""
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
    
    def clean_unicef_data(self, df):
        """Clean and standardize UNICEF data format"""
        if df.empty:
            return df
            
        # Convert year to integer
        if 'year' in df.columns:
            df['year'] = pd.to_numeric(df['year'], errors='coerce').astype('Int64')
            
        # Convert value to float
        if 'value' in df.columns:
            df['value'] = pd.to_numeric(df['value'], errors='coerce')
            
        return df
    
    def save_to_csv(self, df, filename="unicef_data.csv"):
        """Save DataFrame to CSV file"""
        try:
            df.to_csv(filename, index=False)
            logger.info(f"Data saved to {filename}")
        except Exception as e:
            logger.error(f"Error saving to CSV: {e}")


if __name__ == "__main__":
    fetcher = UNICEFFetcher()
    # Test with a few countries (UNICEF uses 3-letter codes)
    test_countries = ['USA', 'GBR', 'DEU', 'JPN', 'CHN']
    data = fetcher.fetch_all_data(countries=test_countries, start_year=2020, end_year=2023)
    
    if not data.empty:
        cleaned_data = fetcher.clean_unicef_data(data)
        fetcher.save_to_csv(cleaned_data)
        print(f"Fetched {len(data)} rows of UNICEF data")
    else:
        print("No UNICEF data was fetched")