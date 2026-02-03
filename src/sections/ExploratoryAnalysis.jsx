import { useEffect, useRef } from 'react';
import { 
  BarChart3, 
  TrendingUp,
  Thermometer,
  Clock,
  IndianRupee
} from 'lucide-react';
import { motion } from 'framer-motion';
import Plot from 'react-plotly.js';
import './ExploratoryAnalysis.css';

// Generate mock data for charts
const generateHourlyData = () => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const consumption = hours.map(h => {
    // Realistic consumption pattern: low at night, peaks in morning and evening
    const baseLoad = 0.8;
    const morningPeak = Math.exp(-Math.pow(h - 8, 2) / 8) * 1.5;
    const eveningPeak = Math.exp(-Math.pow(h - 19, 2) / 6) * 2.5;
    const noise = (Math.random() - 0.5) * 0.3;
    return baseLoad + morningPeak + eveningPeak + noise;
  });
  return { hours, consumption };
};

const generateDailyData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const data = days.map((day, dayIdx) => {
    return hours.map(h => {
      const baseLoad = 0.8;
      const morningPeak = Math.exp(-Math.pow(h - 8, 2) / 8) * 1.2;
      const eveningPeak = Math.exp(-Math.pow(h - 19, 2) / 6) * 2;
      const weekendBonus = dayIdx >= 5 ? 0.3 : 0;
      return baseLoad + morningPeak + eveningPeak + weekendBonus + Math.random() * 0.2;
    });
  });
  return { days, hours, data };
};

const generateWeatherCorrelation = () => {
  const points = 200;
  const temps = Array.from({ length: points }, () => 20 + Math.random() * 20);
  const consumption = temps.map(t => {
    // Higher consumption at extreme temperatures
    const optimal = 26;
    const deviation = Math.abs(t - optimal);
    return 1.5 + deviation * 0.08 + Math.random() * 0.5;
  });
  return { temps, consumption };
};

const generatePricingAnalysis = () => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const consumption = hours.map(h => {
    const baseLoad = 0.8;
    const morningPeak = Math.exp(-Math.pow(h - 8, 2) / 8) * 1.5;
    const eveningPeak = Math.exp(-Math.pow(h - 19, 2) / 6) * 2.5;
    return baseLoad + morningPeak + eveningPeak;
  });
  const prices = hours.map(h => {
    if (h >= 22 || h < 6) return 4.5; // Off-peak
    if (h >= 18 && h < 22) return 8.5; // Peak
    return 6.0; // Normal
  });
  return { hours, consumption, prices };
};

export default function ExploratoryAnalysis() {
  const hourlyData = generateHourlyData();
  const dailyData = generateDailyData();
  const weatherData = generateWeatherCorrelation();
  const pricingData = generatePricingAnalysis();

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
  };

  const chartConfig = {
    displayModeBar: false,
    responsive: true,
  };

  return (
    <section id="eda" className="section">
      <div className="section-header">
        <div className="section-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
          <BarChart3 size={24} />
        </div>
        <div>
          <h2 className="section-title">Exploratory Data Analysis</h2>
          <p className="section-subtitle">Interactive visualizations revealing consumption patterns</p>
        </div>
      </div>

      {/* Key Insights */}
      <div className="insights-bar">
        <div className="insight-item">
          <Clock size={18} />
          <span><strong>Peak Hours:</strong> 6 PM - 10 PM (40% higher consumption)</span>
        </div>
        <div className="insight-item">
          <Thermometer size={18} />
          <span><strong>Temperature Effect:</strong> +8% consumption per °C above 28°C</span>
        </div>
        <div className="insight-item">
          <IndianRupee size={18} />
          <span><strong>Price Sensitivity:</strong> 25% demand shift possible to off-peak</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Hourly Consumption */}
        <motion.div 
          className="chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="chart-header">
            <h3>Hourly Energy Consumption</h3>
            <span className="chart-badge">Average Pattern</span>
          </div>
          <div className="chart-container">
            <Plot
              data={[
                {
                  x: hourlyData.hours,
                  y: hourlyData.consumption,
                  type: 'scatter',
                  mode: 'lines+markers',
                  fill: 'tozeroy',
                  fillcolor: 'rgba(99, 102, 241, 0.1)',
                  line: { color: '#6366f1', width: 3, shape: 'spline' },
                  marker: { color: '#6366f1', size: 6 },
                  name: 'Consumption',
                }
              ]}
              layout={{
                ...chartLayout,
                title: '',
                xaxis: { ...chartLayout.xaxis, title: 'Hour of Day', dtick: 4 },
                yaxis: { ...chartLayout.yaxis, title: 'kWh' },
                showlegend: false,
              }}
              config={chartConfig}
              style={{ width: '100%', height: '300px' }}
            />
          </div>
          <p className="chart-insight">
            📊 Two distinct peaks: morning (7-9 AM) and evening (6-9 PM). Lowest consumption between 2-5 AM.
          </p>
        </motion.div>

        {/* Weekly Heatmap */}
        <motion.div 
          className="chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="chart-header">
            <h3>Weekly Consumption Heatmap</h3>
            <span className="chart-badge">7-Day Pattern</span>
          </div>
          <div className="chart-container">
            <Plot
              data={[
                {
                  z: dailyData.data,
                  x: dailyData.hours,
                  y: dailyData.days,
                  type: 'heatmap',
                  colorscale: [
                    [0, '#1e293b'],
                    [0.5, '#6366f1'],
                    [1, '#f59e0b']
                  ],
                  showscale: true,
                  colorbar: { title: 'kWh', titlefont: { color: '#94a3b8' } },
                }
              ]}
              layout={{
                ...chartLayout,
                title: '',
                xaxis: { ...chartLayout.xaxis, title: 'Hour of Day', dtick: 4 },
                yaxis: { ...chartLayout.yaxis, title: '' },
              }}
              config={chartConfig}
              style={{ width: '100%', height: '300px' }}
            />
          </div>
          <p className="chart-insight">
            🔥 Weekend evenings show highest consumption. Saturday 7-9 PM is the peak demand period.
          </p>
        </motion.div>

        {/* Weather Correlation */}
        <motion.div 
          className="chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="chart-header">
            <h3>Temperature vs Energy</h3>
            <span className="chart-badge">Correlation</span>
          </div>
          <div className="chart-container">
            <Plot
              data={[
                {
                  x: weatherData.temps,
                  y: weatherData.consumption,
                  type: 'scatter',
                  mode: 'markers',
                  marker: { 
                    color: weatherData.temps, 
                    colorscale: 'RdYlBu', 
                    reversescale: true,
                    size: 8,
                    opacity: 0.7,
                  },
                  name: 'Observations',
                }
              ]}
              layout={{
                ...chartLayout,
                title: '',
                xaxis: { ...chartLayout.xaxis, title: 'Temperature (°C)' },
                yaxis: { ...chartLayout.yaxis, title: 'Energy (kWh)' },
                showlegend: false,
              }}
              config={chartConfig}
              style={{ width: '100%', height: '300px' }}
            />
          </div>
          <p className="chart-insight">
            🌡️ U-shaped relationship: consumption increases both for cooling (AC) and heating requirements.
          </p>
        </motion.div>

        {/* Pricing Analysis */}
        <motion.div 
          className="chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="chart-header">
            <h3>Consumption vs Pricing</h3>
            <span className="chart-badge">ToU Analysis</span>
          </div>
          <div className="chart-container">
            <Plot
              data={[
                {
                  x: pricingData.hours,
                  y: pricingData.consumption,
                  type: 'bar',
                  marker: { 
                    color: pricingData.prices.map(p => 
                      p === 8.5 ? '#ef4444' : p === 6.0 ? '#f59e0b' : '#10b981'
                    ),
                  },
                  name: 'Consumption',
                  yaxis: 'y',
                },
                {
                  x: pricingData.hours,
                  y: pricingData.prices,
                  type: 'scatter',
                  mode: 'lines+markers',
                  line: { color: '#ffffff', width: 2, dash: 'dot' },
                  marker: { color: '#ffffff', size: 6 },
                  name: 'Price (₹/kWh)',
                  yaxis: 'y2',
                }
              ]}
              layout={{
                ...chartLayout,
                title: '',
                xaxis: { ...chartLayout.xaxis, title: 'Hour of Day', dtick: 4 },
                yaxis: { ...chartLayout.yaxis, title: 'Consumption (kWh)', side: 'left' },
                yaxis2: {
                  ...chartLayout.yaxis,
                  title: 'Price (₹/kWh)',
                  overlaying: 'y',
                  side: 'right',
                  showgrid: false,
                },
                barmode: 'relative',
                legend: { orientation: 'h', y: -0.2 },
              }}
              config={chartConfig}
              style={{ width: '100%', height: '300px' }}
            />
          </div>
          <p className="chart-insight">
            💰 Peak consumption coincides with peak pricing (🔴). Opportunity to shift 25% load to off-peak (🟢).
          </p>
        </motion.div>
      </div>
    </section>
  );
}
