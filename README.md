# 🏠 Home Energy Resource Optimization Analyzer

An AI-powered web application that forecasts household electricity demand, analyzes weather and pricing patterns, and recommends optimized appliance schedules for maximum cost savings and sustainability.

![Dashboard Preview](https://img.shields.io/badge/Status-Active-green) ![React](https://img.shields.io/badge/React-18-blue) ![Python](https://img.shields.io/badge/Python-3.8+-yellow)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Datasets](#datasets)
- [Machine Learning Models](#machine-learning-models)
- [Optimization Engine](#optimization-engine)
- [Smart Appliance Optimizer](#smart-appliance-optimizer)

---

## 🎯 Overview

### Problem Statement
Indian households face multiple challenges in managing electricity consumption:
- Rising energy costs (8-12% annual increase)
- Time-of-Use pricing with 2x peak hour rates
- Lack of awareness about optimal appliance usage times

### Solution
This project provides:
- **Demand Forecasting**: Predict hourly energy consumption using ARIMA, Prophet, and LSTM
- **Smart Scheduling**: Optimize appliance usage times using Linear Programming
- **Interactive Optimizer**: Real-time appliance scheduling tool with before/after comparison
- **Cost Savings**: Achieve 25-47% reduction in electricity bills
- **Carbon Reduction**: 15% lower carbon footprint

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📊 Interactive Dashboard | 8-section dashboard with real-time visualizations |
| 📈 EDA Visualizations | Hourly patterns, weather correlation, pricing analysis |
| 🤖 ML Models | ARIMA, Prophet, LSTM comparison with metrics |
| ⚡ Optimization Engine | LP-based appliance scheduling |
| � Smart Optimizer Tool | Interactive appliance input with live optimization |
| �💰 Impact Analysis | Cost savings and carbon reduction metrics |
| 📁 Dynamic Data Loading | Fetches data from CSV files in real-time |

---

## 🛠 Tech Stack

### Frontend
- React 18 + Vite
- Plotly.js for interactive charts
- Framer Motion for animations
- Lucide React for icons
- Dynamic CSV parsing

### Backend / ML
- Python 3.8+
- Pandas, NumPy, Scikit-learn
- Statsmodels (ARIMA)
- Prophet (Facebook)
- TensorFlow/Keras (LSTM)
- PuLP (Linear Programming)

---

## 📁 Project Structure

```
DataScienceProject/
├── src/                          # React Frontend
│   ├── components/               # Reusable UI components
│   │   ├── Sidebar.jsx          # Navigation with scroll detection
│   │   ├── Header.jsx
│   │   ├── Card.jsx
│   │   └── MetricCard.jsx
│   ├── sections/                 # Dashboard sections
│   │   ├── ProblemDefinition.jsx
│   │   ├── DataCollection.jsx
│   │   ├── DataPreprocessing.jsx
│   │   ├── ExploratoryAnalysis.jsx
│   │   ├── DataModelling.jsx
│   │   ├── OptimizationEngine.jsx
│   │   ├── ImpactDeployment.jsx
│   │   └── ApplianceOptimizer.jsx  # NEW: Interactive tool
│   ├── App.jsx
│   └── index.css                 # Design system
├── notebooks/                    # Python ML Code
│   ├── model_training.py         # ARIMA, Prophet, LSTM
│   └── optimization_engine.py    # Linear Programming
├── scripts/
│   └── generate_datasets.py      # Dataset generator (1000 rows)
├── data/                         # Datasets (1000 rows each)
│   ├── energy_consumption.csv    # Hourly power consumption
│   ├── weather_chennai.csv       # Temperature, humidity data
│   ├── tou_pricing.csv           # Time-of-Use tariffs
│   └── merged_dataset.csv        # Combined features for ML
├── public/
│   └── data/                     # CSV files for browser access
├── package.json
└── README.md
```

---

## 🚀 Installation

### Prerequisites
- Node.js 18+
- Python 3.8+ (for ML scripts and API)

### Frontend Setup
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### Backend API Setup
```bash
# Install Python dependencies
pip install flask flask-cors pandas numpy scikit-learn statsmodels pulp

# Run the Flask API (required for live predictions)
python api.py
```

The API runs at `http://localhost:5000` and provides:
- `GET /api/predictions` - ARIMA model predictions
- `POST /api/optimize` - Linear Programming optimization
- `GET /api/health` - Health check

---

## 💻 Usage

### Run the Dashboard
```bash
npm run dev
```
Open http://localhost:5173 in your browser.

### Run ML Scripts
```bash
# Model Training (ARIMA, Prophet, LSTM)
python notebooks/model_training.py

# Optimization Engine
python notebooks/optimization_engine.py

# Generate fresh datasets (1000 rows each)
python scripts/generate_datasets.py
```

---

## 📊 Datasets

All datasets contain **1000 rows** of realistic data generated with patterns mimicking real-world scenarios.

| Dataset | Description | Key Columns |
|---------|-------------|-------------|
| `energy_consumption.csv` | Hourly power usage | power_kw, voltage, sub_meters |
| `weather_chennai.csv` | Chennai weather data | temperature, humidity, wind |
| `tou_pricing.csv` | Time-of-Use tariffs | hour, price, tier |
| `merged_dataset.csv` | Combined ML features | consumption, temp, is_peak |

### ToU Pricing Tiers
| Tier | Hours | Price (₹/kWh) |
|------|-------|---------------|
| Off-Peak | 22:00 - 06:00 | ₹4.50 |
| Normal | 06:00 - 18:00 | ₹6.00 |
| Peak | 18:00 - 22:00 | ₹8.50 |

---

## 🤖 Machine Learning Models

### Model Comparison

| Model | MAE | RMSE | MAPE |
|-------|-----|------|------|
| ARIMA | 4.82 | 5.94 | 11.2% |
| Prophet | 3.45 | 4.21 | 7.8% |
| **LSTM** | **2.18** | **2.89** | **5.1%** |

**Best Model**: LSTM with 5.1% MAPE

---

## ⚡ Optimization Engine

### Objective
```
minimize Σ (Power × Price × Duration)
```

### Constraints
- Appliances must run within user-defined windows
- Maximum simultaneous load: 8 kW
- Temperature comfort bounds: 22-26°C

### Results
- **Daily Savings**: ₹51 (35% reduction)
- **Monthly Savings**: ₹1,525
- **Annual Savings**: ₹18,300

---

## 🔧 Smart Appliance Optimizer

A new interactive tool that allows users to:

### Features
1. **Add Appliances** - Quick presets or custom input
2. **Set Current Usage Time** - Select when you typically use each appliance
3. **Run Optimization** - Algorithm finds optimal times based on ToU pricing
4. **View Comparison** - Before/after bar chart shows consumption shift
5. **See Savings** - Real-time calculation of daily/monthly savings

### How It Works
- Loads data dynamically from `energy_consumption.csv` and `tou_pricing.csv`
- Uses Linear Programming to find optimal scheduling
- Prioritizes off-peak hours (₹4.50/kWh) over peak hours (₹8.50/kWh)
- Shows up to **47% savings** by shifting appliances to off-peak times

---

## 👨‍💻 Author

Om Dwivedi

**Data Science Project**  
Data Science & Machine Learning

## 📄 License

This project is for academic purposes.
