# model_runner.py
import joblib
import pandas as pd
import logging

logger = logging.getLogger(__name__)

# Expected features for each model (derived from training)
MODEL_FEATURES = {
    'co2_emissions': ['year', 'education_index', 'health_index', 'gdp', 'green_jobs', 'spending'],
    'education_index': ['year', 'health_index', 'gdp', 'co2_emissions', 'green_jobs', 'spending'],
    'gdp': ['year', 'education_index', 'health_index', 'co2_emissions', 'green_jobs', 'spending'],
    'green_jobs': ['year', 'education_index', 'health_index', 'gdp', 'co2_emissions', 'spending'],
    'health_index': ['year', 'education_index', 'gdp', 'co2_emissions', 'green_jobs', 'spending'],
    'spending': ['year', 'education_index', 'health_index', 'gdp', 'co2_emissions', 'green_jobs']
}

# Default values for missing features (based on latest historical data)
DEFAULT_VALUES = {
    'education_index': 0.92,
    'health_index': 0.84, 
    'gdp': 24.1,
    'co2_emissions': 15.1,
    'green_jobs': 0.87,
    'spending': 0.26
}

def predict_future(metric, region, start_year, end_year, context):
    try:
        import os
        model_path = os.path.join(os.path.dirname(__file__), f"models/{metric}_{region}.joblib")
        logger.info(f"Loading model from: {model_path}")
        model = joblib.load(model_path)
    except FileNotFoundError:
        error_msg = f"No model found for {metric} in {region}"
        logger.error(error_msg)
        return {"error": error_msg}

    years = list(range(start_year, end_year + 1))
    results = []
    
    logger.info(f"Predicting {metric} for years {start_year}-{end_year}")
    logger.info(f"Context provided: {context}")
    
    # Get the features this model expects
    expected_features = MODEL_FEATURES.get(metric, ['year'])
    logger.info(f"Model expects features: {expected_features}")

    for year in years:
        # Start with empty row
        row = {}
        
        # Add features in the order the model expects
        for feature in expected_features:
            if feature == 'year':
                row[feature] = year
            elif feature in context:
                row[feature] = context[feature]
            else:
                row[feature] = DEFAULT_VALUES.get(feature, 0)
        
        logger.debug(f"Prediction features for year {year}: {row}")
        
        # Create DataFrame with features in correct order
        X = pd.DataFrame([row])[expected_features]
        y_pred = model.predict(X)[0]
        results.append({ "year": year, "region": region, metric: round(y_pred, 2) })

    logger.info(f"Successfully predicted {len(results)} points for {metric}")
    return results
