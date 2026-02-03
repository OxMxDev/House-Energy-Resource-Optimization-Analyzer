import { 
  TrendingUp, 
  DollarSign,
  Leaf,
  Building2,
  Home,
  Cpu,
  ArrowUpRight,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import Plot from 'react-plotly.js';
import './ImpactDeployment.css';

const scalabilityCards = [
  {
    icon: Home,
    title: 'Smart Homes',
    description: 'Integration with IoT devices and smart meters for automated scheduling',
    status: 'Ready'
  },
  {
    icon: Building2,
    title: 'Apartments',
    description: 'Building-level aggregation for demand response programs',
    status: 'Planned'
  },
  {
    icon: Cpu,
    title: 'Microgrids',
    description: 'Community-scale optimization with renewable integration',
    status: 'Research'
  }
];

export default function ImpactDeployment() {
  // Cost comparison data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const beforeCost = [4200, 4500, 4800, 5200, 5800, 6100];
  const afterCost = [3150, 3375, 3600, 3900, 4350, 4575];
  
  // Carbon data
  const carbonBefore = 180; // kg CO2/month
  const carbonAfter = 153; // kg CO2/month
  const carbonSaved = carbonBefore - carbonAfter;

  const chartLayout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#94a3b8', family: 'Inter' },
    margin: { l: 60, r: 30, t: 40, b: 50 },
    xaxis: {
      gridcolor: 'rgba(148, 163, 184, 0.1)',
    },
    yaxis: {
      gridcolor: 'rgba(148, 163, 184, 0.1)',
    },
    legend: { orientation: 'h', y: -0.15 },
  };

  return (
    <section id="impact" className="section">
      <div className="section-header">
        <div className="section-icon" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
          <TrendingUp size={24} />
        </div>
        <div>
          <h2 className="section-title">Impact & Deployment</h2>
          <p className="section-subtitle">Measurable results and future scalability</p>
        </div>
      </div>

      {/* Key Impact Metrics */}
      <div className="impact-metrics">
        <motion.div 
          className="impact-card savings"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="impact-icon">
            <DollarSign size={28} />
          </div>
          <div className="impact-content">
            <span className="impact-label">Monthly Savings</span>
            <span className="impact-value">₹1,525</span>
            <span className="impact-change up">
              <ArrowUpRight size={14} /> 25% reduction
            </span>
          </div>
        </motion.div>

        <motion.div 
          className="impact-card carbon"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="impact-icon">
            <Leaf size={28} />
          </div>
          <div className="impact-content">
            <span className="impact-label">Carbon Reduction</span>
            <span className="impact-value">27 kg</span>
            <span className="impact-change up">
              <ArrowUpRight size={14} /> 15% reduction
            </span>
          </div>
        </motion.div>

        <motion.div 
          className="impact-card annual"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="impact-icon">
            <TrendingUp size={28} />
          </div>
          <div className="impact-content">
            <span className="impact-label">Annual Savings</span>
            <span className="impact-value">₹18,300</span>
            <span className="impact-change neutral">
              Per household
            </span>
          </div>
        </motion.div>
      </div>

      {/* Cost Comparison Chart */}
      <div className="charts-row">
        <motion.div 
          className="chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="chart-header">
            <h3>Monthly Cost Comparison</h3>
            <div className="chart-legend">
              <span className="legend-before">● Before Optimization</span>
              <span className="legend-after">● After Optimization</span>
            </div>
          </div>
          <div className="chart-container">
            <Plot
              data={[
                {
                  x: months,
                  y: beforeCost,
                  type: 'bar',
                  name: 'Before',
                  marker: { color: '#ef4444' },
                },
                {
                  x: months,
                  y: afterCost,
                  type: 'bar',
                  name: 'After',
                  marker: { color: '#10b981' },
                }
              ]}
              layout={{
                ...chartLayout,
                barmode: 'group',
                xaxis: { ...chartLayout.xaxis, title: 'Month' },
                yaxis: { ...chartLayout.yaxis, title: 'Cost (₹)' },
              }}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: '100%', height: '350px' }}
            />
          </div>
        </motion.div>

        <motion.div 
          className="chart-card carbon-chart"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="chart-header">
            <h3>Carbon Footprint Reduction</h3>
          </div>
          <div className="chart-container">
            <Plot
              data={[{
                values: [carbonAfter, carbonSaved],
                labels: ['Current Emissions', 'Emissions Saved'],
                type: 'pie',
                hole: 0.6,
                marker: {
                  colors: ['#334155', '#22c55e'],
                },
                textinfo: 'label+percent',
                textposition: 'outside',
                textfont: { color: '#94a3b8' },
              }]}
              layout={{
                ...chartLayout,
                showlegend: false,
                annotations: [{
                  text: `${carbonSaved}<br>kg CO₂`,
                  showarrow: false,
                  font: { size: 20, color: '#22c55e', family: 'Outfit' },
                }],
              }}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: '100%', height: '350px' }}
            />
          </div>
          <div className="carbon-stats">
            <div className="carbon-stat">
              <span className="stat-value red">{carbonBefore}</span>
              <span className="stat-label">kg CO₂ (Before)</span>
            </div>
            <div className="carbon-stat">
              <span className="stat-value green">{carbonAfter}</span>
              <span className="stat-label">kg CO₂ (After)</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scalability Section */}
      <div className="scalability-section">
        <h3 className="subsection-title">Scalability Roadmap</h3>
        <p className="subsection-description">
          Expanding from individual households to community-scale energy optimization
        </p>
        
        <div className="scalability-grid">
          {scalabilityCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div 
                key={index}
                className="scalability-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="scalability-icon">
                  <Icon size={24} />
                </div>
                <h4>{card.title}</h4>
                <p>{card.description}</p>
                <span className={`status-badge ${card.status.toLowerCase()}`}>
                  {card.status === 'Ready' && <CheckCircle2 size={12} />}
                  {card.status}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Conclusion */}
      <div className="conclusion-box">
        <h3>🎯 Project Conclusion</h3>
        <p>
          The Home Energy Resource Optimization Analyzer demonstrates a practical, 
          data-driven approach to reducing household electricity costs and carbon emissions. 
          By combining demand forecasting with smart scheduling optimization, households can 
          achieve <strong>25% cost savings</strong> and <strong>15% carbon reduction</strong> 
          without sacrificing comfort.
        </p>
        <div className="conclusion-tags">
          <span>Machine Learning</span>
          <span>Energy Efficiency</span>
          <span>Sustainability</span>
          <span>IoT Ready</span>
        </div>
      </div>
    </section>
  );
}
