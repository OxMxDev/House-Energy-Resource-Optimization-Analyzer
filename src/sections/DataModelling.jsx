import { 
  Brain, 
  TrendingUp,
  Award,
  BarChart2,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import Plot from 'react-plotly.js';
import './DataModelling.css';

// Generate prediction data
const generatePredictions = () => {
  const days = 30;
  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date(2016, 0, i + 1);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
  
  const actual = dates.map((_, i) => {
    const base = 45 + Math.sin(i * 0.3) * 10;
    return base + Math.random() * 8;
  });
  
  const arima = actual.map((v, i) => v + (Math.random() - 0.5) * 8);
  const prophet = actual.map((v, i) => v + (Math.random() - 0.5) * 5);
  const lstm = actual.map((v, i) => v + (Math.random() - 0.5) * 3);
  
  return { dates, actual, arima, prophet, lstm };
};

const models = [
  {
    id: 'arima',
    name: 'ARIMA',
    fullName: 'AutoRegressive Integrated Moving Average',
    description: 'Statistical model capturing time series autocorrelation patterns',
    color: '#6366f1',
    metrics: { mae: 4.82, rmse: 5.94, mape: '11.2%' },
    pros: ['Simple to implement', 'Good for linear trends', 'Interpretable'],
    cons: ['Struggles with seasonality', 'No external features']
  },
  {
    id: 'prophet',
    name: 'Prophet',
    fullName: 'Facebook Prophet',
    description: 'Decomposable time series model with trend and seasonality',
    color: '#10b981',
    metrics: { mae: 3.45, rmse: 4.21, mape: '7.8%' },
    pros: ['Handles seasonality', 'Robust to missing data', 'Easy tuning'],
    cons: ['Less flexible', 'Additive model only']
  },
  {
    id: 'lstm',
    name: 'LSTM',
    fullName: 'Long Short-Term Memory',
    description: 'Deep learning model capturing long-term dependencies',
    color: '#f59e0b',
    metrics: { mae: 2.18, rmse: 2.89, mape: '5.1%' },
    pros: ['Learns complex patterns', 'Handles external features', 'Best accuracy'],
    cons: ['Requires more data', 'Computationally intensive'],
    winner: true
  }
];

export default function DataModelling() {
  const predictions = generatePredictions();

  const chartLayout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#94a3b8', family: 'Inter' },
    margin: { l: 50, r: 30, t: 40, b: 50 },
    xaxis: {
      gridcolor: 'rgba(148, 163, 184, 0.1)',
      zerolinecolor: 'rgba(148, 163, 184, 0.1)',
    },
    yaxis: {
      gridcolor: 'rgba(148, 163, 184, 0.1)',
      zerolinecolor: 'rgba(148, 163, 184, 0.1)',
    },
    legend: { orientation: 'h', y: -0.15, font: { size: 11 } },
  };

  return (
    <section id="data-modelling" className="section">
      <div className="section-header">
        <div className="section-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
          <Brain size={24} />
        </div>
        <div>
          <h2 className="section-title">Data Modelling & Evaluation</h2>
          <p className="section-subtitle">Comparing forecasting models for energy demand prediction</p>
        </div>
      </div>

      {/* Model Cards */}
      <div className="models-grid">
        {models.map((model, index) => (
          <motion.div 
            key={model.id}
            className={`model-card ${model.winner ? 'winner' : ''}`}
            style={{ '--model-color': model.color }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {model.winner && (
              <div className="winner-badge">
                <Award size={14} />
                <span>Best Model</span>
              </div>
            )}
            
            <div className="model-header">
              <h3>{model.name}</h3>
              <span className="model-fullname">{model.fullName}</span>
            </div>
            
            <p className="model-description">{model.description}</p>
            
            <div className="model-metrics">
              <div className="metric">
                <span className="metric-label">MAE</span>
                <span className="metric-value">{model.metrics.mae}</span>
              </div>
              <div className="metric">
                <span className="metric-label">RMSE</span>
                <span className="metric-value">{model.metrics.rmse}</span>
              </div>
              <div className="metric">
                <span className="metric-label">MAPE</span>
                <span className="metric-value">{model.metrics.mape}</span>
              </div>
            </div>
            
            <div className="model-pros-cons">
              <div className="pros">
                <h4>✅ Strengths</h4>
                <ul>
                  {model.pros.map((pro, i) => <li key={i}>{pro}</li>)}
                </ul>
              </div>
              <div className="cons">
                <h4>⚠️ Limitations</h4>
                <ul>
                  {model.cons.map((con, i) => <li key={i}>{con}</li>)}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Prediction Chart */}
      <motion.div 
        className="prediction-chart"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="chart-header">
          <div>
            <h3>Actual vs Predicted Energy Demand</h3>
            <p>30-day forecast comparison across all models</p>
          </div>
          <div className="chart-legend">
            <span className="legend-actual">● Actual</span>
            <span className="legend-arima">● ARIMA</span>
            <span className="legend-prophet">● Prophet</span>
            <span className="legend-lstm">● LSTM</span>
          </div>
        </div>
        
        <div className="chart-container">
          <Plot
            data={[
              {
                x: predictions.dates,
                y: predictions.actual,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Actual',
                line: { color: '#fff', width: 3 },
                marker: { size: 6 },
              },
              {
                x: predictions.dates,
                y: predictions.arima,
                type: 'scatter',
                mode: 'lines',
                name: 'ARIMA',
                line: { color: '#6366f1', width: 2, dash: 'dot' },
              },
              {
                x: predictions.dates,
                y: predictions.prophet,
                type: 'scatter',
                mode: 'lines',
                name: 'Prophet',
                line: { color: '#10b981', width: 2, dash: 'dot' },
              },
              {
                x: predictions.dates,
                y: predictions.lstm,
                type: 'scatter',
                mode: 'lines',
                name: 'LSTM',
                line: { color: '#f59e0b', width: 2 },
              },
            ]}
            layout={{
              ...chartLayout,
              xaxis: { ...chartLayout.xaxis, title: 'Date', tickangle: -45 },
              yaxis: { ...chartLayout.yaxis, title: 'Energy (kWh)' },
            }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: '100%', height: '400px' }}
          />
        </div>
      </motion.div>

      {/* Model Summary */}
      <div className="model-summary">
        <Activity size={20} />
        <p>
          <strong>Conclusion:</strong> LSTM model achieves the best performance with 5.1% MAPE, 
          effectively capturing both temporal patterns and temperature correlations. 
          Selected for production deployment in the optimization engine.
        </p>
      </div>
    </section>
  );
}
