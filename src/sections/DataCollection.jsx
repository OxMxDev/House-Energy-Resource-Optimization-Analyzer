import { 
  Database, 
  Zap, 
  Cloud, 
  IndianRupee,
  Calendar,
  Clock,
  FileSpreadsheet,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import './DataCollection.css';

const datasets = [
  {
    id: 'energy',
    icon: Zap,
    title: 'Energy Consumption',
    source: 'UCI Machine Learning Repository',
    sourceName: 'Household Power Consumption',
    color: '#6366f1',
    stats: [
      { label: 'Records', value: '2,075,259' },
      { label: 'Duration', value: '4 Years' },
      { label: 'Granularity', value: '1 Minute' },
    ],
    features: [
      'Global Active Power (kW)',
      'Global Reactive Power',
      'Voltage (V)',
      'Sub-metering (3 zones)',
    ],
    description: 'Household electricity consumption data from a residence in France, capturing minute-level readings of power usage across different zones.'
  },
  {
    id: 'weather',
    icon: Cloud,
    title: 'Weather Data',
    source: 'Meteostat API',
    sourceName: 'Chennai Hourly Weather 2016',
    color: '#10b981',
    stats: [
      { label: 'Records', value: '8,760' },
      { label: 'Duration', value: '1 Year' },
      { label: 'Granularity', value: 'Hourly' },
    ],
    features: [
      'Temperature (°C)',
      'Humidity (%)',
      'Wind Speed (km/h)',
      'Precipitation (mm)',
    ],
    description: 'Hourly weather observations from Chennai, India, including temperature, humidity, and atmospheric conditions.'
  },
  {
    id: 'pricing',
    icon: IndianRupee,
    title: 'Electricity Pricing',
    source: 'TANGEDCO Tariff Schedule',
    sourceName: 'Indian ToU Tariff 2016',
    color: '#f59e0b',
    stats: [
      { label: 'Tiers', value: '3' },
      { label: 'Peak Rate', value: '₹8.50/kWh' },
      { label: 'Off-Peak', value: '₹4.50/kWh' },
    ],
    features: [
      'Off-Peak: 10 PM - 6 AM',
      'Normal: 6 AM - 6 PM',
      'Peak: 6 PM - 10 PM',
      'Seasonal Adjustments',
    ],
    description: 'Time-of-Use electricity tariff structure from Tamil Nadu, India, with differential pricing based on demand periods.'
  }
];

export default function DataCollection() {
  return (
    <section id="data-collection" className="section">
      <div className="section-header">
        <div className="section-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
          <Database size={24} />
        </div>
        <div>
          <h2 className="section-title">Data Collection</h2>
          <p className="section-subtitle">Three complementary datasets for comprehensive energy analysis</p>
        </div>
      </div>

      <div className="data-overview">
        <div className="overview-item">
          <Calendar size={20} />
          <div>
            <span className="overview-value">2016</span>
            <span className="overview-label">Reference Year</span>
          </div>
        </div>
        <div className="overview-item">
          <FileSpreadsheet size={20} />
          <div>
            <span className="overview-value">2M+</span>
            <span className="overview-label">Total Records</span>
          </div>
        </div>
        <div className="overview-item">
          <Clock size={20} />
          <div>
            <span className="overview-value">Hourly</span>
            <span className="overview-label">Final Granularity</span>
          </div>
        </div>
      </div>

      <div className="datasets-grid">
        {datasets.map((dataset, index) => {
          const Icon = dataset.icon;
          return (
            <motion.div 
              key={dataset.id}
              className="dataset-card"
              style={{ '--dataset-color': dataset.color }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
            >
              <div className="dataset-header">
                <div className="dataset-icon">
                  <Icon size={24} />
                </div>
                <div className="dataset-source">
                  <span className="source-label">{dataset.source}</span>
                  <a href="#" className="source-link">
                    {dataset.sourceName} <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              <h3 className="dataset-title">{dataset.title}</h3>
              <p className="dataset-description">{dataset.description}</p>

              <div className="dataset-stats">
                {dataset.stats.map((stat, i) => (
                  <div key={i} className="stat-item">
                    <span className="stat-value">{stat.value}</span>
                    <span className="stat-label">{stat.label}</span>
                  </div>
                ))}
              </div>

              <div className="dataset-features">
                <h4>Key Features</h4>
                <ul>
                  {dataset.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="data-note">
        <div className="note-icon">💡</div>
        <p>
          <strong>Data Integration:</strong> All three datasets are aligned to a common hourly timestamp 
          and merged on date-time for unified analysis. Missing values are interpolated using 
          forward-fill and linear interpolation methods.
        </p>
      </div>
    </section>
  );
}
