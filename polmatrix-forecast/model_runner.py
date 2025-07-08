# model_runner.py
import joblib
import pandas as pd

def predict_future(metric, region, start_year, end_year, context):
    try:
        model = joblib.load(f"models/{metric}_{region}.joblib")
    except FileNotFoundError:
        return {"error": f"No model found for {metric} in {region}"}

    years = list(range(start_year, end_year + 1))
    results = []

    for year in years:
        row = { "year": year, **context }
        X = pd.DataFrame([row])
        y_pred = model.predict(X)[0]
        results.append({ "year": year, "region": region, metric: round(y_pred, 2) })

    return results
