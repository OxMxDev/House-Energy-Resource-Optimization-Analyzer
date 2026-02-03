"""
Dataset Generator Script
Generates 1000+ rows of realistic data for each dataset
Updated: Uses current dates (2026) instead of 2016
"""

import csv
import math
import random
from datetime import datetime, timedelta

random.seed(42)

# Generate 1000 hours of data (~42 days) starting from January 2026
START_DATE = datetime(2026, 1, 1, 0, 0, 0)
NUM_HOURS = 1000

print("Generating datasets with 1000 rows each...")
print(f"Date range: {START_DATE} to {START_DATE + timedelta(hours=NUM_HOURS)}")

# ================================================
# 1. ENERGY CONSUMPTION DATASET
# ================================================
print("\n1. Generating energy_consumption.csv...")

with open('data/energy_consumption.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow([
        'timestamp', 'global_active_power_kw', 'global_reactive_power_kw',
        'voltage', 'global_intensity', 'sub_metering_1', 'sub_metering_2', 'sub_metering_3'
    ])
    
    for i in range(NUM_HOURS):
        dt = START_DATE + timedelta(hours=i)
        hour = dt.hour
        day_of_week = dt.weekday()
        is_weekend = 1 if day_of_week >= 5 else 0
        
        # Base consumption pattern
        base = 0.8
        
        # Morning peak (7-9 AM)
        morning = 1.5 * math.exp(-((hour - 8) ** 2) / 4) if 5 <= hour <= 11 else 0
        
        # Evening peak (6-10 PM)
        evening = 2.5 * math.exp(-((hour - 19) ** 2) / 6) if 16 <= hour <= 23 else 0
        
        # Weekend adjustment
        weekend_adj = 0.3 if is_weekend else 0
        
        # Random noise
        noise = random.uniform(-0.2, 0.2)
        
        power = max(0.5, base + morning + evening + weekend_adj + noise)
        reactive = power * random.uniform(0.12, 0.16)
        voltage = 240 + random.uniform(-3, 4)
        intensity = power * 4.2 + random.uniform(-0.5, 0.5)
        
        # Sub-meters based on time
        sub1 = max(0, (power - 1) * 3 + random.uniform(-1, 1)) if hour >= 6 else 0
        sub2 = max(0, (power - 1) * 2 + random.uniform(-1, 1)) if hour >= 6 else 0
        sub3 = 15 + power * 3 + random.uniform(-2, 2)
        
        writer.writerow([
            dt.strftime('%Y-%m-%d %H:%M:%S'),
            round(power, 2),
            round(reactive, 2),
            round(voltage, 1),
            round(intensity, 1),
            round(sub1, 1),
            round(sub2, 1),
            round(sub3, 1)
        ])

print("   ✓ energy_consumption.csv created (1000 rows)")

# ================================================
# 2. WEATHER DATASET (Chennai - Current conditions)
# ================================================
print("\n2. Generating weather_chennai.csv...")

with open('data/weather_chennai.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow([
        'timestamp', 'temperature_c', 'humidity_pct', 'wind_speed_kmh',
        'pressure_hpa', 'precipitation_mm', 'weather_condition'
    ])
    
    conditions = ['Clear', 'Sunny', 'Partly Cloudy', 'Cloudy', 'Hazy']
    
    for i in range(NUM_HOURS):
        dt = START_DATE + timedelta(hours=i)
        hour = dt.hour
        day_of_year = (dt - datetime(2026, 1, 1)).days
        
        # Temperature: Chennai January pattern (22-32°C range, cooler in Jan)
        # Current Chennai weather in early Feb is around 23-28°C
        base_temp = 25 + 2 * math.sin(2 * math.pi * day_of_year / 365)
        daily_cycle = 4 * math.sin(2 * math.pi * (hour - 6) / 24)
        temp = base_temp + daily_cycle + random.uniform(-1, 1)
        temp = max(20, min(32, temp))
        
        # Humidity: inverse of temperature (Chennai Jan is less humid)
        humidity = 70 - (temp - 24) * 2 + random.uniform(-5, 5)
        humidity = max(40, min(80, humidity))
        
        # Wind speed
        wind = 8 + 4 * math.sin(2 * math.pi * hour / 24) + random.uniform(-2, 2)
        wind = max(2, min(18, wind))
        
        # Pressure
        pressure = 1012 + random.uniform(-3, 3)
        
        # Precipitation (rare in Jan-Feb for Chennai)
        precip = 0 if random.random() > 0.02 else round(random.uniform(0.1, 1.0), 1)
        
        # Weather condition based on hour and temp
        if hour >= 6 and hour <= 17:
            if temp > 28:
                condition = 'Sunny'
            elif temp > 25:
                condition = random.choice(['Sunny', 'Partly Cloudy'])
            else:
                condition = random.choice(['Partly Cloudy', 'Clear'])
        else:
            condition = random.choice(['Clear', 'Clear', 'Hazy'])
        
        writer.writerow([
            dt.strftime('%Y-%m-%d %H:%M:%S'),
            round(temp, 1),
            round(humidity, 0),
            round(wind, 1),
            round(pressure, 0),
            precip,
            condition
        ])

print("   ✓ weather_chennai.csv created (1000 rows)")

# ================================================
# 3. MERGED DATASET (for model training)
# ================================================
print("\n3. Generating merged_dataset.csv...")

with open('data/merged_dataset.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow([
        'timestamp', 'consumption_kwh', 'temperature_c', 'humidity_pct',
        'price_per_kwh', 'hour', 'day_of_week', 'is_weekend', 'is_peak_hour',
        'hour_sin', 'hour_cos', 'temp_sensitivity'
    ])
    
    for i in range(NUM_HOURS):
        dt = START_DATE + timedelta(hours=i)
        hour = dt.hour
        day_of_week = dt.weekday()
        is_weekend = 1 if day_of_week >= 5 else 0
        day_of_year = (dt - datetime(2026, 1, 1)).days
        
        # Temperature (matching weather dataset)
        base_temp = 25 + 2 * math.sin(2 * math.pi * day_of_year / 365)
        daily_cycle = 4 * math.sin(2 * math.pi * (hour - 6) / 24)
        temp = base_temp + daily_cycle + random.uniform(-1, 1)
        
        # Humidity
        humidity = 70 - (temp - 24) * 2 + random.uniform(-5, 5)
        
        # Price (ToU)
        if hour >= 22 or hour < 6:
            price = 4.50
            is_peak = 0
        elif hour >= 18 and hour < 22:
            price = 8.50
            is_peak = 1
        else:
            price = 6.00
            is_peak = 0
        
        # Consumption with temperature effect
        base = 0.8
        morning = 1.5 * math.exp(-((hour - 8) ** 2) / 4) if 5 <= hour <= 11 else 0
        evening = 2.5 * math.exp(-((hour - 19) ** 2) / 6) if 16 <= hour <= 23 else 0
        weekend_adj = 0.3 if is_weekend else 0
        temp_effect = max(0, (temp - 26) * 0.08)  # AC usage when hot
        noise = random.uniform(-0.2, 0.2)
        
        consumption = max(0.5, base + morning + evening + weekend_adj + temp_effect + noise)
        
        # Cyclical features
        hour_sin = round(math.sin(2 * math.pi * hour / 24), 4)
        hour_cos = round(math.cos(2 * math.pi * hour / 24), 4)
        temp_sensitivity = round(abs(temp - 26) * 0.1, 3)
        
        writer.writerow([
            dt.strftime('%Y-%m-%d %H:%M:%S'),
            round(consumption, 2),
            round(temp, 1),
            round(humidity, 0),
            price,
            hour,
            day_of_week,
            is_weekend,
            is_peak,
            hour_sin,
            hour_cos,
            temp_sensitivity
        ])

print("   ✓ merged_dataset.csv created (1000 rows)")

# ================================================
# 4. TOU PRICING (with 2026 dates)
# ================================================
print("\n4. Generating tou_pricing.csv...")

def get_tier(hour):
    if hour >= 22 or hour < 6:
        return (4.50, 'Off-Peak', 'Night hours - lowest demand')
    elif hour >= 18 and hour < 22:
        return (8.50, 'Peak', 'Evening peak - highest demand')
    else:
        return (6.00, 'Normal', 'Regular hours - moderate demand')

with open('data/tou_pricing.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['timestamp', 'hour', 'time_period', 'price_per_kwh_inr', 'tier', 'description'])
    
    for i in range(NUM_HOURS):
        dt = START_DATE + timedelta(hours=i)
        hour = dt.hour
        price, tier, desc = get_tier(hour)
        period = f'{hour:02d}:00-{(hour+1)%24:02d}:00'
        writer.writerow([
            dt.strftime('%Y-%m-%d %H:%M:%S'),
            hour, period, price, tier, desc
        ])

print("   ✓ tou_pricing.csv created (1000 rows)")

# ================================================
# SUMMARY
# ================================================
print("\n" + "="*50)
print("✅ ALL DATASETS GENERATED SUCCESSFULLY!")
print("="*50)
print(f"\nDate range: January 1, 2026 - February 11, 2026")
print("\nFiles created in data/ folder:")
print("  • energy_consumption.csv  (1000 rows)")
print("  • weather_chennai.csv     (1000 rows)")
print("  • merged_dataset.csv      (1000 rows)")
print("  • tou_pricing.csv         (1000 rows)")
print("\nTotal: 4000 data points")
print("\nWeather: Chennai January 2026 (22-28°C typical)")
