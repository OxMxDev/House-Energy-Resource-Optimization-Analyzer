# ================================================
# HOME ENERGY RESOURCE OPTIMIZATION ANALYZER
# Model Training Script
# ================================================

"""
This script demonstrates the machine learning models used for energy demand forecasting.
Models: ARIMA, Prophet, LSTM

Requirements:
    pip install pandas numpy matplotlib scikit-learn statsmodels prophet tensorflow
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error
import warnings
warnings.filterwarnings('ignore')

# ================================================
# 1. DATA LOADING AND PREPARATION
# ================================================

def load_and_prepare_data():
    """
    Load and prepare the merged dataset.
    In production, this would load from: data/merged_dataset.csv
    """
    np.random.seed(42)
    
    # Create hourly timestamps for 1 year
    dates = pd.date_range(start='2016-01-01', end='2016-12-31 23:00:00', freq='H')
    
    hours = dates.hour
    days = dates.dayofweek
    
    # Base load + morning peak + evening peak + weekend effect + temperature effect
    base_load = 0.8
    morning_peak = np.exp(-((hours - 8) ** 2) / 8) * 1.2
    evening_peak = np.exp(-((hours - 19) ** 2) / 6) * 2.0
    weekend_effect = np.where(days >= 5, 0.3, 0)
    
    # Temperature (seasonal pattern)
    day_of_year = dates.dayofyear
    temperature = 28 + 8 * np.sin(2 * np.pi * (day_of_year - 100) / 365) + np.random.randn(len(dates)) * 2
    temp_effect = np.abs(temperature - 26) * 0.05
    
    # Combine all effects
    consumption = base_load + morning_peak + evening_peak + weekend_effect + temp_effect + np.random.randn(len(dates)) * 0.2
    consumption = np.maximum(consumption, 0.3)  # Minimum consumption
    
    # Create pricing tiers
    def get_price(hour):
        if hour >= 22 or hour < 6:
            return 4.5  # Off-peak
        elif hour >= 18 and hour < 22:
            return 8.5  # Peak
        else:
            return 6.0  # Normal
    
    prices = np.array([get_price(h) for h in hours])
    
    # Create DataFrame
    df = pd.DataFrame({
        'timestamp': dates,
        'consumption_kwh': consumption,
        'temperature': temperature,
        'humidity': 60 + np.random.randn(len(dates)) * 10,
        'price_per_kwh': prices,
        'hour': hours,
        'day_of_week': days,
        'is_weekend': (days >= 5).astype(int),
        'is_peak_hour': ((hours >= 18) & (hours < 22)).astype(int)
    })
    
    return df

# ================================================
# 2. ARIMA MODEL
# ================================================

def train_arima_model(df, train_size=0.8):
    """
    Train ARIMA model for time series forecasting.
    ARIMA: AutoRegressive Integrated Moving Average
    """
    from statsmodels.tsa.arima.model import ARIMA
    
    # Prepare data
    data = df['consumption_kwh'].values
    split_idx = int(len(data) * train_size)
    train, test = data[:split_idx], data[split_idx:]
    
    print("Training ARIMA Model...")
    print(f"  Train size: {len(train)}, Test size: {len(test)}")
    
    # Fit ARIMA(5,1,2) model
    model = ARIMA(train, order=(5, 1, 2))
    fitted = model.fit()
    
    # Forecast
    predictions = fitted.forecast(steps=len(test))
    
    # Calculate metrics
    mae = mean_absolute_error(test, predictions)
    rmse = np.sqrt(mean_squared_error(test, predictions))
    mape = np.mean(np.abs((test - predictions) / test)) * 100
    
    print(f"  MAE: {mae:.2f}")
    print(f"  RMSE: {rmse:.2f}")
    print(f"  MAPE: {mape:.2f}%")
    
    return {'model': fitted, 'predictions': predictions, 'test': test, 
            'metrics': {'mae': mae, 'rmse': rmse, 'mape': mape}}

# ================================================
# 3. PROPHET MODEL
# ================================================

def train_prophet_model(df, train_size=0.8):
    """
    Train Facebook Prophet model for time series forecasting.
    Prophet handles seasonality and holidays automatically.
    """
    try:
        from prophet import Prophet
    except ImportError:
        print("Prophet not installed. Install with: pip install prophet")
        return None
    
    # Prepare data for Prophet (requires 'ds' and 'y' columns)
    prophet_df = df[['timestamp', 'consumption_kwh']].copy()
    prophet_df.columns = ['ds', 'y']
    
    split_idx = int(len(prophet_df) * train_size)
    train = prophet_df.iloc[:split_idx]
    test = prophet_df.iloc[split_idx:]
    
    print("\nTraining Prophet Model...")
    print(f"  Train size: {len(train)}, Test size: {len(test)}")
    
    # Initialize and fit Prophet
    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=True,
        seasonality_mode='multiplicative'
    )
    model.fit(train)
    
    # Make predictions
    future = model.make_future_dataframe(periods=len(test), freq='H')
    forecast = model.predict(future)
    predictions = forecast['yhat'].iloc[-len(test):].values
    
    # Calculate metrics
    test_values = test['y'].values
    mae = mean_absolute_error(test_values, predictions)
    rmse = np.sqrt(mean_squared_error(test_values, predictions))
    mape = np.mean(np.abs((test_values - predictions) / test_values)) * 100
    
    print(f"  MAE: {mae:.2f}")
    print(f"  RMSE: {rmse:.2f}")
    print(f"  MAPE: {mape:.2f}%")
    
    return {'model': model, 'predictions': predictions, 'test': test_values,
            'metrics': {'mae': mae, 'rmse': rmse, 'mape': mape}}

# ================================================
# 4. LSTM MODEL
# ================================================

def train_lstm_model(df, train_size=0.8, sequence_length=24):
    """
    Train LSTM (Long Short-Term Memory) neural network.
    Deep learning model that captures long-term dependencies.
    """
    try:
        from tensorflow.keras.models import Sequential
        from tensorflow.keras.layers import LSTM, Dense, Dropout
        from tensorflow.keras.callbacks import EarlyStopping
    except ImportError:
        print("TensorFlow not installed. Install with: pip install tensorflow")
        return None
    
    # Prepare features
    features = ['consumption_kwh', 'temperature', 'hour', 'is_peak_hour']
    data = df[features].values
    
    # Scale data
    scaler = MinMaxScaler()
    scaled_data = scaler.fit_transform(data)
    
    # Create sequences
    def create_sequences(data, seq_length):
        X, y = [], []
        for i in range(len(data) - seq_length):
            X.append(data[i:i+seq_length])
            y.append(data[i+seq_length, 0])  # Predict consumption
        return np.array(X), np.array(y)
    
    X, y = create_sequences(scaled_data, sequence_length)
    
    # Split data
    split_idx = int(len(X) * train_size)
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]
    
    print("\nTraining LSTM Model...")
    print(f"  Train size: {len(X_train)}, Test size: {len(X_test)}")
    print(f"  Sequence length: {sequence_length}")
    
    # Build LSTM model
    model = Sequential([
        LSTM(64, return_sequences=True, input_shape=(sequence_length, len(features))),
        Dropout(0.2),
        LSTM(32),
        Dropout(0.2),
        Dense(16, activation='relu'),
        Dense(1)
    ])
    
    model.compile(optimizer='adam', loss='mse', metrics=['mae'])
    
    # Train with early stopping
    early_stop = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)
    
    history = model.fit(
        X_train, y_train,
        epochs=50,
        batch_size=32,
        validation_split=0.1,
        callbacks=[early_stop],
        verbose=0
    )
    
    # Make predictions
    predictions = model.predict(X_test, verbose=0).flatten()
    
    # Inverse transform for metrics
    # Create dummy array for inverse transform
    dummy = np.zeros((len(predictions), len(features)))
    dummy[:, 0] = predictions
    predictions_orig = scaler.inverse_transform(dummy)[:, 0]
    
    dummy[:, 0] = y_test
    y_test_orig = scaler.inverse_transform(dummy)[:, 0]
    
    # Calculate metrics
    mae = mean_absolute_error(y_test_orig, predictions_orig)
    rmse = np.sqrt(mean_squared_error(y_test_orig, predictions_orig))
    mape = np.mean(np.abs((y_test_orig - predictions_orig) / y_test_orig)) * 100
    
    print(f"  MAE: {mae:.2f}")
    print(f"  RMSE: {rmse:.2f}")
    print(f"  MAPE: {mape:.2f}%")
    
    return {'model': model, 'predictions': predictions_orig, 'test': y_test_orig,
            'metrics': {'mae': mae, 'rmse': rmse, 'mape': mape}, 'scaler': scaler}

# ================================================
# 5. MODEL COMPARISON
# ================================================

def compare_models(results):
    """Compare all models and visualize results."""
    
    print("\n" + "="*50)
    print("MODEL COMPARISON")
    print("="*50)
    
    comparison = []
    for name, result in results.items():
        if result is not None:
            comparison.append({
                'Model': name,
                'MAE': result['metrics']['mae'],
                'RMSE': result['metrics']['rmse'],
                'MAPE (%)': result['metrics']['mape']
            })
    
    comparison_df = pd.DataFrame(comparison)
    print(comparison_df.to_string(index=False))
    
    # Find best model
    best_model = comparison_df.loc[comparison_df['MAPE (%)'].idxmin(), 'Model']
    print(f"\n🏆 Best Model: {best_model}")
    
    return comparison_df

# ================================================
# MAIN EXECUTION
# ================================================

if __name__ == "__main__":
    print("="*50)
    print("HOME ENERGY OPTIMIZATION - MODEL TRAINING")
    print("="*50)
    
    # Load data
    print("\n📊 Loading and preparing data...")
    df = load_and_prepare_data()
    print(f"  Dataset shape: {df.shape}")
    print(f"  Date range: {df['timestamp'].min()} to {df['timestamp'].max()}")
    
    # Train models
    results = {}
    
    # ARIMA
    results['ARIMA'] = train_arima_model(df)
    
    # Prophet (may not be installed)
    try:
        results['Prophet'] = train_prophet_model(df)
    except Exception as e:
        print(f"\nProphet training failed: {e}")
        results['Prophet'] = None
    
    # LSTM (may not be installed)
    try:
        results['LSTM'] = train_lstm_model(df)
    except Exception as e:
        print(f"\nLSTM training failed: {e}")
        results['LSTM'] = None
    
    # Compare models
    comparison = compare_models(results)
    
    print("\n✅ Training complete!")
