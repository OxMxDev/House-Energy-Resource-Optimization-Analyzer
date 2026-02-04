import { useState, useMemo } from 'react';
import { Sun, Battery, TrendingDown, Leaf, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import Plot from 'react-plotly.js';
import './SolarSimulation.css';

// Generate solar generation curve (peaks at noon)
const generateSolarCurve = (capacity) => {
  return Array.from({ length: 24 }, (_, hour) => {
    if (hour < 6 || hour > 18) return 0; // No sun before 6 AM or after 6 PM
    // Bell curve peaking at 12 noon
    const peakHour = 12;
    const spread = 4;
    const generation = capacity * Math.exp(-Math.pow(hour - peakHour, 2) / (2 * spread * spread));
    return Math.max(0, generation);
  });
};

// Average household consumption pattern
const baseConsumption = [
  0.4, 0.3, 0.3, 0.3, 0.4, 0.6, // 0-5 AM
  1.2, 1.8, 1.5, 1.0, 0.8, 0.9, // 6-11 AM
  1.0, 0.9, 0.8, 0.9, 1.2, 1.8, // 12-5 PM
  2.5, 2.8, 2.2, 1.5, 1.0, 0.6  // 6-11 PM
];

export default function SolarSimulation() {
  const [solarCapacity, setSolarCapacity] = useState(3); // kW
  const [batteryCapacity, setBatteryCapacity] = useState(5); // kWh
  
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  
  const solarGeneration = useMemo(() => 
    generateSolarCurve(solarCapacity), 
    [solarCapacity]
  );
  
  // Calculate net consumption and savings
  const analysis = useMemo(() => {
    let totalConsumption = 0;
    let totalGeneration = 0;
    let gridImport = 0;
    let gridExport = 0;
    let selfConsumed = 0;
    let batteryStored = 0;
    let batteryLevel = 0;
    
    const netConsumption = baseConsumption.map((cons, hour) => {
      const gen = solarGeneration[hour];
      totalConsumption += cons;
      totalGeneration += gen;
      
      const net = cons - gen;
      
      if (net < 0) {
        // Excess generation
        const excess = -net;
        // Store in battery first
        const canStore = Math.min(excess, batteryCapacity - batteryLevel);
        batteryLevel += canStore;
        batteryStored += canStore;
        // Export rest to grid
        gridExport += excess - canStore;
        selfConsumed += gen - excess + canStore;
        return 0; // No grid import needed
      } else {
        // Need more power
        // Use battery first
        const fromBattery = Math.min(net, batteryLevel);
        batteryLevel -= fromBattery;
        selfConsumed += gen + fromBattery;
        gridImport += net - fromBattery;
        return net - fromBattery;
      }
    });
    
    // Cost calculations (using ToU pricing)
    const withoutSolar = baseConsumption.reduce((sum, cons, hour) => {
      const price = hour >= 22 || hour < 6 ? 4.50 : hour >= 18 && hour < 22 ? 8.50 : 6.00;
      return sum + cons * price;
    }, 0);
    
    const withSolar = netConsumption.reduce((sum, cons, hour) => {
      const price = hour >= 22 || hour < 6 ? 4.50 : hour >= 18 && hour < 22 ? 8.50 : 6.00;
      return sum + cons * price;
    }, 0) - (gridExport * 3.0); // Feed-in tariff ₹3/kWh
    
    const dailySavings = withoutSolar - withSolar;
    const selfSufficiency = ((totalConsumption - gridImport) / totalConsumption) * 100;
    const co2Saved = totalGeneration * 0.82; // kg CO2 per kWh avoided
    
    return {
      netConsumption,
      totalConsumption: totalConsumption.toFixed(1),
      totalGeneration: totalGeneration.toFixed(1),
      gridImport: gridImport.toFixed(1),
      gridExport: gridExport.toFixed(1),
      dailySavings: dailySavings.toFixed(2),
      monthlySavings: (dailySavings * 30).toFixed(0),
      selfSufficiency: selfSufficiency.toFixed(0),
      co2Saved: co2Saved.toFixed(1),
      withoutSolar: withoutSolar.toFixed(2),
      withSolar: withSolar.toFixed(2)
    };
  }, [solarGeneration, batteryCapacity]);
  
  const chartLayout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#94a3b8', family: 'Inter' },
    margin: { l: 50, r: 30, t: 20, b: 60 },
    xaxis: { 
      gridcolor: 'rgba(148, 163, 184, 0.1)', 
      title: 'Hour of Day',
      tickangle: -45 
    },
    yaxis: { 
      gridcolor: 'rgba(148, 163, 184, 0.1)', 
      title: 'Power (kW)' 
    },
    legend: { orientation: 'h', y: -0.2 },
    showlegend: true
  };

  return (
    <section id="solar-simulation" className="section">
      <div className="section-header">
        <div className="section-icon" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
          <Sun size={24} />
        </div>
        <div>
          <h2 className="section-title">Solar Panel Simulation</h2>
          <p className="section-subtitle">
            Simulate rooftop solar installation and calculate savings
          </p>
        </div>
      </div>

      {/* Configuration */}
      <div className="solar-config">
        <div className="config-card">
          <Sun size={20} />
          <div className="config-content">
            <label>Solar Panel Capacity</label>
            <div className="slider-group">
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={solarCapacity}
                onChange={(e) => setSolarCapacity(parseFloat(e.target.value))}
              />
              <span className="slider-value">{solarCapacity} kW</span>
            </div>
          </div>
        </div>
        
        <div className="config-card">
          <Battery size={20} />
          <div className="config-content">
            <label>Battery Storage</label>
            <div className="slider-group">
              <input
                type="range"
                min="0"
                max="15"
                step="1"
                value={batteryCapacity}
                onChange={(e) => setBatteryCapacity(parseFloat(e.target.value))}
              />
              <span className="slider-value">{batteryCapacity} kWh</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <motion.div 
        className="solar-chart"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Plot
          data={[
            {
              x: hours,
              y: baseConsumption,
              type: 'scatter',
              mode: 'lines',
              name: 'Consumption',
              line: { color: '#ef4444', width: 2 },
              fill: 'tozeroy',
              fillcolor: 'rgba(239, 68, 68, 0.1)'
            },
            {
              x: hours,
              y: solarGeneration,
              type: 'scatter',
              mode: 'lines',
              name: 'Solar Generation',
              line: { color: '#fbbf24', width: 3 },
              fill: 'tozeroy',
              fillcolor: 'rgba(251, 191, 36, 0.2)'
            },
            {
              x: hours,
              y: analysis.netConsumption,
              type: 'scatter',
              mode: 'lines',
              name: 'Grid Import',
              line: { color: '#6366f1', width: 2, dash: 'dot' }
            }
          ]}
          layout={chartLayout}
          config={{ displayModeBar: false, responsive: true }}
          style={{ width: '100%', height: '350px' }}
        />
      </motion.div>

      {/* Results */}
      <div className="solar-results">
        <motion.div 
          className="result-card generation"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Sun size={24} />
          <div>
            <span className="result-value">{analysis.totalGeneration} kWh</span>
            <span className="result-label">Daily Generation</span>
          </div>
        </motion.div>
        
        <motion.div 
          className="result-card savings"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <TrendingDown size={24} />
          <div>
            <span className="result-value">₹{analysis.dailySavings}</span>
            <span className="result-label">Daily Savings</span>
          </div>
        </motion.div>
        
        <motion.div 
          className="result-card monthly"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Zap size={24} />
          <div>
            <span className="result-value">₹{analysis.monthlySavings}</span>
            <span className="result-label">Monthly Savings</span>
          </div>
        </motion.div>
        
        <motion.div 
          className="result-card green"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Leaf size={24} />
          <div>
            <span className="result-value">{analysis.co2Saved} kg</span>
            <span className="result-label">CO₂ Avoided/Day</span>
          </div>
        </motion.div>
      </div>

      {/* Summary */}
      <div className="solar-summary">
        <div className="summary-row">
          <span>Self-Sufficiency</span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${analysis.selfSufficiency}%` }}
            />
          </div>
          <span className="progress-value">{analysis.selfSufficiency}%</span>
        </div>
        <div className="summary-comparison">
          <div className="comparison-item without">
            <span className="comp-label">Without Solar</span>
            <span className="comp-value">₹{analysis.withoutSolar}/day</span>
          </div>
          <div className="comparison-arrow">→</div>
          <div className="comparison-item with">
            <span className="comp-label">With Solar</span>
            <span className="comp-value">₹{analysis.withSolar}/day</span>
          </div>
        </div>
      </div>
    </section>
  );
}
