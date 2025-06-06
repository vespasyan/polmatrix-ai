import wbdata
import pandas as pd
import logging
from datetime import datetime, timedelta
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WorldBankFetcher:
    def __init__(self):
        self.indicators = {
            # Economy
            'GDP_TOTAL': 'NY.GDP.MKTP.CD',
            'GDP_PER_CAPITA': 'NY.GDP.PCAP.CD',
            'GDP_GROWTH': 'NY.GDP.MKTP.KD.ZG',
            'GDP_PER_CAPITA_GROWTH': 'NY.GDP.PCAP.KD.ZG',
            'INFLATION': 'FP.CPI.TOTL.ZG',
            'UNEMPLOYMENT': 'SL.UEM.TOTL.ZS',
            'FDI': 'BX.KLT.DINV.CD.WD',
            'GOVERNMENT_DEBT': 'GC.DOD.TOTL.GD.ZS',
            'EXPORTS': 'NE.EXP.GNFS.ZS',
            'IMPORTS': 'NE.IMP.GNFS.ZS',
            'CURRENT_ACCOUNT': 'BN.CAB.XOKA.GD.ZS',
            
            # Health
            'HEALTH_EXPENDITURE': 'SH.XPD.CHEX.GD.ZS',
            'UNDER5_MORTALITY': 'SH.DYN.MORT',
            'MEASLES_IMMUNIZATION': 'SH.IMM.MEAS',
            'MATERNAL_MORTALITY': 'SH.STA.MMRT',
            'PHYSICIANS_PER_1000': 'SH.MED.PHYS.ZS',
            'BIRTHS_ATTENDED': 'SH.STA.BRTC.ZS',
            
            # Education
            'PRIMARY_ENROLLMENT': 'SE.PRM.ENRR',
            'SECONDARY_ENROLLMENT': 'SE.SEC.ENRR',
            'TERTIARY_ENROLLMENT': 'SE.TER.ENRR',
            'EDUCATION_EXPENDITURE': 'SE.XPD.TOTL.GD.ZS',
            'LITERACY_RATE': 'SE.ADT.LITR.ZS',
            
            # Environment
            'CO2_EMISSIONS': 'EN.ATM.CO2E.PC',
            'PM25': 'EN.ATM.PM25.MC.M3',
            'FOREST_AREA': 'AG.LND.FRST.ZS',
            'FRESHWATER_WITHDRAWAL': 'ER.H2O.FWTL.ZS',
            'ELECTRIC_POWER': 'EG.USE.ELEC.KH.PC',
            'ENERGY_USE': 'EG.USE.PCAP.KG.OE',
            
            # Social Demographics
            'POPULATION_TOTAL': 'SP.POP.TOTL',
            'POPULATION_GROWTH': 'SP.POP.GROW',
            'FERTILITY_RATE': 'SP.DYN.TFRT.IN',
            'AGE_DEPENDENCY': 'SP.POP.DPND.OL',
            'GINI': 'SI.POV.GINI',
            'POVERTY_RATE': 'SI.POV.NAHC',
            'HOMICIDE_RATE': 'VC.IHR.PSRC.P5',
            
            # Technology
            'INTERNET_USERS': 'IT.NET.USER.ZS',
            'MOBILE_SUBSCRIPTIONS': 'IT.CEL.SETS.P2',
            'SCIENTIFIC_ARTICLES': 'IP.JRN.ARTC.SC',
            'PATENT_APPLICATIONS': 'IP.PAT.RESD',
            'RESEARCH_EXPENDITURE': 'GB.XPD.RSDV.GD.ZS',
            
            # Trade
            'TRADE_PCT_GDP': 'TG.VAL.TOTL.GD.ZS',
            'IP_PAYMENTS': 'BM.GSR.ROYL.CD',
            'HIGH_TECH_EXPORTS': 'TX.VAL.TECH.MF.ZS'
        }
        
    def fetch_data(self, start_year=None, end_year=None, countries=None):
        """Fetch data from World Bank API"""
        try:
            # Set default date range if not provided
            if not start_year:
                start_year = datetime.now().year - 10
            if not end_year:
                end_year = datetime.now().year
                
            # If no countries specified, get all countries
            if not countries:
                countries = [country['id'] for country in wbdata.get_country()]
                
            date_range = (f"{start_year}", f"{end_year}")  # Changed to tuple format that wbdata expects
            all_data = []
            
            # Fetch data for each indicator
            for indicator_name, indicator_code in self.indicators.items():
                logger.info(f"Fetching {indicator_name} ({indicator_code})")
                
                try:
                    # Add retry logic for API calls
                    max_retries = 3
                    for attempt in range(max_retries):
                        try:
                            # Updated API call format
                            data = wbdata.get_dataframe(
                                {indicator_code: indicator_name},
                                country=countries,
                                date=date_range  # Changed from data_date to date
                            )
                            break
                        except Exception as e:
                            if attempt < max_retries - 1:
                                time.sleep(2)  # Wait before retry
                                continue
                            else:
                                logger.error(f"Failed to fetch {indicator_name}: {e}")
                                raise
                    
                    if not data.empty:
                        # Reset index to make country and date as columns
                        data = data.reset_index()
                        data['indicator'] = indicator_name
                        data['indicator_code'] = indicator_code
                        all_data.append(data)
                        
                except Exception as e:
                    logger.error(f"Error fetching {indicator_name}: {e}")
                    continue
                    
                # Add delay between requests to be respectful of API limits
                time.sleep(0.5)
            
            if all_data:
                df = pd.concat(all_data, ignore_index=True)
                df['source'] = 'world_bank'
                return df
            else:
                logger.warning("No data was fetched successfully")
                return pd.DataFrame()
                
        except Exception as e:
            logger.error(f"Error in fetch_data: {e}")
            return pd.DataFrame()
    
    def save_to_csv(self, df, filename="worldbank_data.csv"):
        """Save DataFrame to CSV file"""
        try:
            df.to_csv(filename, index=False)
            logger.info(f"Data saved to {filename}")
        except Exception as e:
            logger.error(f"Error saving to CSV: {e}")


if __name__ == "__main__":
    fetcher = WorldBankFetcher()
    # Test with a few countries
    test_countries = ['US', 'GB', 'DE', 'JP', 'CN']
    data = fetcher.fetch_data(start_year=2020, end_year=2023, countries=test_countries)
    if not data.empty:
        fetcher.save_to_csv(data)
        print(f"Fetched {len(data)} rows of data")