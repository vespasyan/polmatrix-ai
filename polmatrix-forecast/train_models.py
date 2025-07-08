# train_models.py
import pandas as pd
import lightgbm as lgb
import joblib
import os

# Load training data
df = pd.read_csv("training_data.csv")

# Define input features (covariates)
features = ['year', 'education_index', 'health_index', 'spending']

# Automatically detect all target metrics
predictable_metrics = [
    col for col in df.columns
    if col not in ['year', 'region'] + features
]

# Create output dir
os.makedirs("models", exist_ok=True)

# Train a model per metric
for metric in predictable_metrics:
    print(f"🔧 Training model for {metric}...")

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