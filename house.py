# model_training.py - Train the ML model
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import joblib

# Read the dataset
df = pd.read_csv('houses.csv')

# Prepare features
df['age'] = 2024 - df['yr_built']
df['has_renovation'] = (df['yr_renovated'] > 0).astype(int)
df['total_sqft'] = df['sqft_above'] + df['sqft_basement']

feature_columns = [
    'bedrooms', 'bathrooms', 'sqft_living', 'floors', 'waterfront', 
    'view', 'condition', 'grade', 'sqft_above', 'sqft_basement',
    'age', 'has_renovation', 'lat', 'long', 'sqft_living15',
    'total_sqft'
]

X = df[feature_columns]
y = df['price']

# Split and train
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = GradientBoostingRegressor(
    n_estimators=200,
    learning_rate=0.1,
    max_depth=5,
    random_state=42
)

model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
print(f"R² Score: {r2_score(y_test, y_pred):.4f}")
print(f"RMSE: ${np.sqrt(mean_squared_error(y_test, y_pred)):.2f}k")

# Save model
joblib.dump(model, 'house_price_model.pkl')