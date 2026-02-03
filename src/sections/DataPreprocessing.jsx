import { 
  Settings, 
  GitMerge, 
  Eraser, 
  Sparkles,
  Filter,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import './DataPreprocessing.css';

const pipelineSteps = [
  {
    id: 1,
    title: 'Timestamp Alignment',
    icon: GitMerge,
    description: 'Align all datasets to common hourly timestamps',
    details: [
      'Energy data: Resample from 1-min to 1-hour (mean)',
      'Weather data: Already hourly, no change needed',
      'Pricing data: Map ToU tiers to hourly slots'
    ],
    status: 'complete',
    color: '#6366f1'
  },
  {
    id: 2,
    title: 'Missing Value Treatment',
    icon: Eraser,
    description: 'Handle gaps and null values in the data',
    details: [
      'Forward-fill for short gaps (< 3 hours)',
      'Linear interpolation for longer gaps',
      'Drop records with > 24hr continuous gaps'
    ],
    stats: { before: '3.2%', after: '0%' },
    status: 'complete',
    color: '#10b981'
  },
  {
    id: 3,
    title: 'Feature Engineering',
    icon: Sparkles,
    description: 'Create new features for improved model performance',
    details: [
      'Hour of day (0-23) - cyclical encoding',
      'Day of week (0-6) - one-hot encoding',
      'Is_Peak_Hour binary flag',
      'Temperature lag features (1h, 3h, 6h)',
      'Rolling mean energy (24h window)'
    ],
    status: 'complete',
    color: '#f59e0b'
  },
  {
    id: 4,
    title: 'Outlier Detection',
    icon: Filter,
    description: 'Identify and handle anomalous consumption values',
    details: [
      'IQR method for energy consumption',
      'Z-score threshold: |z| > 3',
      'Replaced with rolling median'
    ],
    stats: { detected: '1.8%', handled: '1.8%' },
    status: 'complete',
    color: '#ef4444'
  }
];

const engineeredFeatures = [
  { name: 'hour_sin', type: 'Cyclical', description: 'sin(2π × hour/24)' },
  { name: 'hour_cos', type: 'Cyclical', description: 'cos(2π × hour/24)' },
  { name: 'is_weekend', type: 'Binary', description: 'Saturday or Sunday' },
  { name: 'is_peak_hour', type: 'Binary', description: '6 PM - 10 PM flag' },
  { name: 'temp_lag_1h', type: 'Lag', description: 'Temperature 1 hour ago' },
  { name: 'energy_rolling_24h', type: 'Rolling', description: '24-hour mean consumption' },
  { name: 'price_tier', type: 'Categorical', description: 'Off-peak / Normal / Peak' },
  { name: 'temp_sensitivity', type: 'Derived', description: 'ΔEnergy / ΔTemperature' }
];

export default function DataPreprocessing() {
  return (
    <section id="data-preprocessing" className="section">
      <div className="section-header">
        <div className="section-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
          <Settings size={24} />
        </div>
        <div>
          <h2 className="section-title">Data Cleaning & Preprocessing</h2>
          <p className="section-subtitle">Transforming raw data into analysis-ready format</p>
        </div>
      </div>

      {/* Pipeline Steps */}
      <div className="pipeline-container">
        <h3 className="subsection-title">Processing Pipeline</h3>
        
        <div className="pipeline-steps">
          {pipelineSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div 
                key={step.id}
                className="pipeline-step"
                style={{ '--step-color': step.color }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 }}
              >
                <div className="step-header">
                  <div className="step-number">{step.id}</div>
                  <div className="step-icon">
                    <Icon size={20} />
                  </div>
                  <div className="step-info">
                    <h4>{step.title}</h4>
                    <p>{step.description}</p>
                  </div>
                  <div className="step-status">
                    <CheckCircle2 size={18} />
                    <span>Complete</span>
                  </div>
                </div>
                
                <div className="step-details">
                  <ul>
                    {step.details.map((detail, i) => (
                      <li key={i}>{detail}</li>
                    ))}
                  </ul>
                  
                  {step.stats && (
                    <div className="step-stats">
                      {Object.entries(step.stats).map(([key, value]) => (
                        <div key={key} className="mini-stat">
                          <span className="mini-stat-label">{key}</span>
                          <span className="mini-stat-value">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {index < pipelineSteps.length - 1 && (
                  <div className="step-connector">
                    <ArrowRight size={16} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Feature Engineering Table */}
      <div className="features-container">
        <h3 className="subsection-title">Engineered Features</h3>
        <p className="subsection-description">
          New features created to capture temporal patterns and improve model accuracy
        </p>
        
        <div className="features-table">
          <div className="table-header">
            <span>Feature Name</span>
            <span>Type</span>
            <span>Description</span>
          </div>
          {engineeredFeatures.map((feature, index) => (
            <motion.div 
              key={feature.name}
              className="table-row"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <span className="feature-name"><code>{feature.name}</code></span>
              <span className="feature-type">{feature.type}</span>
              <span className="feature-desc">{feature.description}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Final Dataset Stats */}
      <div className="final-stats">
        <div className="stat-card">
          <span className="stat-label">Final Records</span>
          <span className="stat-value">8,640</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Features</span>
          <span className="stat-value">15</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Train/Test Split</span>
          <span className="stat-value">80/20</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Data Quality</span>
          <span className="stat-value success">100%</span>
        </div>
      </div>
    </section>
  );
}
