# train_models.py
import pandas as pd
import lightgbm as lgb
import joblib
import os

# Load training data
df = pd.read_csv("training_data.csv")

# Define base input features (covariates) - excluding targets
base_features = ['year', 'education_index', 'health_index']

# All potential features (targets can be features for other models)
all_potential_features = ['year', 'education_index', 'health_index', 'gdp', 'co2_emissions', 'green_jobs', 'spending']

# Automatically detect all target metrics
predictable_metrics = [
    col for col in df.columns
    if col not in ['year', 'region']
]

# Create output dir
os.makedirs("models", exist_ok=True)

# Train a model per metric
for metric in predictable_metrics:
    print(f"🔧 Training model for {metric}...")
    
    # Features for this model: base features + other metrics (excluding the target)
    features = [f for f in all_potential_features if f != metric and f in df.columns]
    
    print(f"Features for {metric}: {features}")
    
    X = df[features]
    y = df[metric]

    model = lgb.LGBMRegressor(
        min_data_in_leaf=1,
        min_data_in_bin=1,
        num_leaves=2,
        learning_rate=0.1,
        n_estimators=50
    )
    model.fit(X, y)

    filename = f"models/{metric}_US.joblib"
    joblib.dump(model, filename)
    print(f"✅ Saved {filename}")

print("✅ All models trained and saved successfully!")
# This script trains models for each metric in the training data
# and saves them in the "models" directory.