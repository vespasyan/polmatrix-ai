import requests
import pandas as pd
import logging
from datetime import datetime
import time
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WHOFetcher:
    def __init__(self):
        self.base_url = "https://ghoapi.azureedge.net/api"
        self.indicators = {
            'LIFE_EXPECTANCY': 'WHOSIS_000001',
            'MATERNAL_MORTALITY': 'MDG_0000000001',
            'ANAEMIA_WOMEN': 'NUTRITION_ANAEMIA',
            'MALARIA_CASES': 'MALARIA001',
            'INFANT_MORTALITY': 'MDG_0000000007',
            'HOSPITAL_BEDS': 'WHS4_544',
            'ADULTS_HIV': 'HIV_0000000001',
            'TB_INCIDENCE': 'TB_e_inc_num',
            'SUICIDE_RATE': 'MH_12',
            'BLOOD_PRESSURE': 'NCD_HYP_PREV'
        }
        
    def fetch_indicator_data(self, indicator_code, countries=None, start_year=None, end_year=None):
        """Fetch data for a single indicator"""
        try:
            # Set default parameters
            if not start_year:
                start_year = datetime.now().year - 10
            if not end_year:
                end_year = datetime.now().year
                
            url = f"{self.base_url}/{indicator_code}?"
            
            # Add filter parameters
            filters = []
            if countries:
                if isinstance(countries, list):
                    country_filter = ','.join(countries)
                else:
                    country_filter = countries
                filters.append(f"$filter=SpatialDim eq {country_filter}")
                
            if start_year and end_year:
                year_filter = " or ".join([f"TimeDim eq {year}" for year in range(start_year, end_year + 1)])
                filters.append(f"$filter=({year_filter})")
                
            if filters:
                url += "&".join(filters)
                
            logger.info(f"Fetching WHO data from: {url}")
            
            response = requests.get(url)
            response.raise_for_status()
            
            data = response.json()
            if 'value' not in data:
                logger.warning(f"No data found for indicator {indicator_code}")
                return pd.DataFrame()
                
            # Convert to DataFrame
            df = pd.DataFrame(data['value'])
            df['indicator_code'] = indicator_code
            df['source'] = 'who'
            
            return df
            
        except requests.exceptions.RequestException as e:
            logger.error(f"HTTP error fetching {indicator_code}: {e}")
            return pd.DataFrame()
        except Exception as e:
            logger.error(f"Error fetching {indicator_code}: {e}")
            return pd.DataFrame()
    
    def fetch_all_data(self, countries=None, start_year=None, end_year=None):
        """Fetch all WHO indicators"""
        all_data = []
        
        for indicator_name, indicator_code in self.indicators.items():
            logger.info(f"Fetching {indicator_name} ({indicator_code})")
            
            df = self.fetch_indicator_data(indicator_code, countries, start_year, end_year)
            if not df.empty:
                df['indicator_name'] = indicator_name
                all_data.append(df)
                
            # Be respectful of API limits
            time.sleep(1)
        
        if all_data:
            return pd.concat(all_data, ignore_index=True)
        else:
            return pd.DataFrame()
    
    def clean_who_data(self, df):
        """Clean and standardize WHO data format"""
        if df.empty:
            return df
            
        # Rename columns to match our schema
        column_mapping = {
            'SpatialDim': 'country_code',
            'TimeDim': 'year',
            'NumericValue': 'value',
            'Dim1': 'dimension1',
            'Dim2': 'dimension2',
            'Dim3': 'dimension3'
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
    
    def save_to_csv(self, df, filename="who_data.csv"):
        """Save DataFrame to CSV file"""
        try:
            df.to_csv(filename, index=False)
            logger.info(f"Data saved to {filename}")
        except Exception as e:
            logger.error(f"Error saving to CSV: {e}")


if __name__ == "__main__":
    fetcher = WHOFetcher()
    # Test with a few countries (WHO uses 3-letter codes)
    test_countries = ['USA', 'GBR', 'DEU', 'JPN', 'CHN']
    data = fetcher.fetch_all_data(countries=test_countries, start_year=2020, end_year=2023)
    
    if not data.empty:
        cleaned_data = fetcher.clean_who_data(data)
        fetcher.save_to_csv(cleaned_data)
        print(f"Fetched {len(data)} rows of WHO data")
    else:
        print("No WHO data was fetched")