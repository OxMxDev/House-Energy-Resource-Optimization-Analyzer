import { 
  Zap, 
  Target,
  Clock,
  ThermometerSun,
  Settings2,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import Plot from 'react-plotly.js';
import './OptimizationEngine.css';

const appliances = [
  { name: 'Air Conditioner', power: 1.5, original: [18, 19, 20, 21, 22], optimized: [14, 15, 16, 23, 0], savings: 32 },
  { name: 'Washing Machine', power: 0.5, original: [19, 20], optimized: [23, 0], savings: 47 },
  { name: 'Water Heater', power: 2.0, original: [7, 8, 18, 19], optimized: [5, 6, 23, 0], savings: 38 },
  { name: 'Dishwasher', power: 0.8, original: [20, 21], optimized: [1, 2], savings: 47 },
  { name: 'EV Charger', power: 3.5, original: [19, 20, 21, 22], optimized: [23, 0, 1, 2], savings: 47 },
];

const constraints = [
  { icon: Clock, title: 'Time Windows', description: 'Appliances must run within user-defined windows' },
  { icon: ThermometerSun, title: 'Comfort Bounds', description: 'Temperature must stay within 22-26°C' },
  { icon: Zap, title: 'Power Limits', description: 'Maximum simultaneous load: 8 kW' },
];

export default function OptimizationEngine() {
  // Generate schedule visualization data
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  const chartLayout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#94a3b8', family: 'Inter' },
    margin: { l: 120, r: 30, t: 40, b: 50 },
    xaxis: {
      gridcolor: 'rgba(148, 163, 184, 0.1)',
      title: 'Hour of Day',
      dtick: 4,
    },
    yaxis: {
      gridcolor: 'rgba(148, 163, 184, 0.1)',
    },
  };

  // Create schedule data for heatmap
  const originalSchedule = appliances.map(app => 
    hours.map(h => app.original.includes(h) ? 1 : 0)
  );
  
  const optimizedSchedule = appliances.map(app => 
    hours.map(h => app.optimized.includes(h) ? 1 : 0)
  );

  return (
    <section id="optimization" className="section">
      <div className="section-header">
        <div className="section-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
          <Zap size={24} />
        </div>
        <div>
          <h2 className="section-title">Optimization Engine</h2>
          <p className="section-subtitle">Linear programming for smart appliance scheduling</p>
        </div>
      </div>

      {/* Optimization Overview */}
      <div className="optimization-overview">
        <div className="overview-card objective">
          <div className="card-icon">
            <Target size={24} />
          </div>
          <div className="card-content">
            <h3>Objective Function</h3>
            <code>minimize Σ (Power × Price × Duration)</code>
            <p>Minimize total electricity cost while meeting all energy requirements</p>
          </div>
        </div>
        
        <div className="overview-card method">
          <div className="card-icon">
            <Settings2 size={24} />
          </div>
          <div className="card-content">
            <h3>Method</h3>
            <code>Linear Programming (PuLP/SciPy)</code>
            <p>Mixed-integer linear programming with binary decision variables</p>
          </div>
        </div>
      </div>

      {/* Constraints */}
      <div className="constraints-section">
        <h3 className="subsection-title">Constraints</h3>
        <div className="constraints-grid">
          {constraints.map((constraint, index) => {
            const Icon = constraint.icon;
            return (
              <motion.div 
                key={index}
                className="constraint-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="constraint-icon">
                  <Icon size={20} />
                </div>
                <div>
                  <h4>{constraint.title}</h4>
                  <p>{constraint.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Schedule Comparison */}
      <div className="schedule-comparison">
        <h3 className="subsection-title">Appliance Schedule Optimization</h3>
        
        <div className="schedules-grid">
          {/* Original Schedule */}
          <div className="schedule-card original">
            <div className="schedule-header">
              <AlertCircle size={18} />
              <span>Original Schedule</span>
              <span className="schedule-tag">Unoptimized</span>
            </div>
            <div className="schedule-visual">
              <Plot
                data={[{
                  z: originalSchedule,
                  x: hours,
                  y: appliances.map(a => a.name),
                  type: 'heatmap',
                  colorscale: [[0, '#1e293b'], [1, '#ef4444']],
                  showscale: false,
                }]}
                layout={{
                  ...chartLayout,
                  height: 250,
                  margin: { ...chartLayout.margin, t: 20, b: 40 },
                }}
                config={{ displayModeBar: false, responsive: true }}
                style={{ width: '100%', height: '250px' }}
              />
            </div>
          </div>

          {/* Arrow */}
          <div className="schedule-arrow">
            <ArrowRight size={32} />
            <span>Optimize</span>
          </div>

          {/* Optimized Schedule */}
          <div className="schedule-card optimized">
            <div className="schedule-header">
              <CheckCircle2 size={18} />
              <span>Optimized Schedule</span>
              <span className="schedule-tag success">35% Savings</span>
            </div>
            <div className="schedule-visual">
              <Plot
                data={[{
                  z: optimizedSchedule,
                  x: hours,
                  y: appliances.map(a => a.name),
                  type: 'heatmap',
                  colorscale: [[0, '#1e293b'], [1, '#10b981']],
                  showscale: false,
                }]}
                layout={{
                  ...chartLayout,
                  height: 250,
                  margin: { ...chartLayout.margin, t: 20, b: 40 },
                }}
                config={{ displayModeBar: false, responsive: true }}
                style={{ width: '100%', height: '250px' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Appliance Savings Table */}
      <div className="savings-table">
        <h3 className="subsection-title">Per-Appliance Savings</h3>
        <div className="table-container">
          <div className="table-header">
            <span>Appliance</span>
            <span>Power (kW)</span>
            <span>Original Hours</span>
            <span>Optimized Hours</span>
            <span>Savings</span>
          </div>
          {appliances.map((appliance, index) => (
            <motion.div 
              key={appliance.name}
              className="table-row"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <span className="appliance-name">{appliance.name}</span>
              <span>{appliance.power} kW</span>
              <span className="hours-badge original">{appliance.original.map(h => `${h}:00`).join(', ')}</span>
              <span className="hours-badge optimized">{appliance.optimized.map(h => `${h}:00`).join(', ')}</span>
              <span className="savings-badge">↓ {appliance.savings}%</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
