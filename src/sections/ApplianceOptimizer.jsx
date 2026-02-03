import { useState, useMemo, useEffect } from 'react';
import { 
  Calculator,
  Plus,
  Trash2,
  Zap,
  Clock,
  TrendingDown,
  Play,
  RotateCcw,
  AlertTriangle,
  Loader2,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Plot from 'react-plotly.js';
import './ApplianceOptimizer.css';

// Parse CSV text to array of objects
const parseCSV = (csvText) => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = values[i]?.trim();
    });
    return obj;
  });
};

// Calculate average hourly consumption from energy data
const calculateBaseLoad = (energyData) => {
  const hourlyTotals = Array(24).fill(0);
  const hourlyCounts = Array(24).fill(0);
  
  energyData.forEach(row => {
    const timestamp = row.timestamp;
    if (timestamp) {
      const hour = parseInt(timestamp.split(' ')[1]?.split(':')[0]) || 0;
      const consumption = parseFloat(row.global_active_power_kw) || 0;
      hourlyTotals[hour] += consumption;
      hourlyCounts[hour] += 1;
    }
  });
  
  return hourlyTotals.map((total, i) => 
    hourlyCounts[i] > 0 ? parseFloat((total / hourlyCounts[i]).toFixed(2)) : 0.5
  );
};

// Get ToU pricing from pricing data
const buildPricingTable = (pricingData) => {
  const pricing = Array(24).fill({ price: 6.00, tier: 'normal' });
  
  pricingData.forEach(row => {
    const hour = parseInt(row.hour);
    const price = parseFloat(row.price_per_kwh_inr) || 6.00;
    const tier = row.tier?.toLowerCase() || 'normal';
    if (hour >= 0 && hour < 24) {
      pricing[hour] = { price, tier };
    }
  });
  
  return pricing;
};

export default function ApplianceOptimizer() {
  const [appliances, setAppliances] = useState([]);
  const [newAppliance, setNewAppliance] = useState({
    name: '',
    power: '',
    duration: 1,
    preferredHour: 19
  });
  const [isOptimized, setIsOptimized] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [usingAPI, setUsingAPI] = useState(false);
  const [results, setResults] = useState([]);
  
  // Data loading state
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState(null);
  const [baseLoad, setBaseLoad] = useState(Array(24).fill(0.5));
  const [touPricing, setTouPricing] = useState(
    Array(24).fill(null).map((_, i) => ({
      price: i >= 22 || i < 6 ? 4.50 : i >= 18 && i < 22 ? 8.50 : 6.00,
      tier: i >= 22 || i < 6 ? 'off-peak' : i >= 18 && i < 22 ? 'peak' : 'normal'
    }))
  );
  const [dataStats, setDataStats] = useState({ energyRows: 0, pricingRows: 0 });

  // Load CSV data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch energy consumption data
        const energyResponse = await fetch('/data/energy_consumption.csv');
        if (!energyResponse.ok) throw new Error('Failed to load energy_consumption.csv');
        const energyText = await energyResponse.text();
        const energyData = parseCSV(energyText);
        
        // Fetch ToU pricing data
        const pricingResponse = await fetch('/data/tou_pricing.csv');
        if (!pricingResponse.ok) throw new Error('Failed to load tou_pricing.csv');
        const pricingText = await pricingResponse.text();
        const pricingData = parseCSV(pricingText);
        
        // Process data
        const calculatedBaseLoad = calculateBaseLoad(energyData);
        const calculatedPricing = buildPricingTable(pricingData);
        
        setBaseLoad(calculatedBaseLoad);
        setTouPricing(calculatedPricing);
        setDataStats({
          energyRows: energyData.length,
          pricingRows: pricingData.length
        });
        setDataError(null);
        
        console.log('✅ Data loaded successfully:', {
          energyRows: energyData.length,
          pricingRows: pricingData.length,
          baseLoad: calculatedBaseLoad
        });
        
      } catch (error) {
        console.error('Error loading CSV data:', error);
        setDataError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Helper functions using loaded data
  const getTouPrice = (hour) => touPricing[hour % 24]?.price || 6.00;
  const getTouTier = (hour) => touPricing[hour % 24]?.tier || 'normal';

  // Find optimal time slot
  const findOptimalSlot = (power, duration, preferredHour, existingLoad) => {
    let bestHour = preferredHour;
    let bestCost = Infinity;
    
    // Prioritize off-peak hours
    const searchOrder = [
      ...Array.from({ length: 6 }, (_, i) => 22 + i).map(h => h % 24),
      ...Array.from({ length: 2 }, (_, i) => 4 + i),
      ...Array.from({ length: 6 }, (_, i) => 6 + i),
      ...Array.from({ length: 6 }, (_, i) => 12 + i),
    ];
    
    for (const startHour of searchOrder) {
      let cost = 0;
      let feasible = true;
      
      for (let h = 0; h < duration; h++) {
        const hour = (startHour + h) % 24;
        const totalLoad = existingLoad[hour] + power;
        
        if (totalLoad > 8.0) {
          feasible = false;
          break;
        }
        
        cost += power * getTouPrice(hour);
      }
      
      if (feasible && cost < bestCost) {
        bestCost = cost;
        bestHour = startHour;
      }
    }
    
    return { hour: bestHour, cost: bestCost };
  };

  // Optimization algorithm
  const optimizeSchedule = (appliances) => {
    const results = [];
    const optimizedLoad = [...baseLoad];
    
    const sortedAppliances = [...appliances].sort((a, b) => b.power - a.power);
    
    for (const app of sortedAppliances) {
      const power = app.power;
      const duration = app.duration;
      const preferredHour = app.preferredHour;
      
      let originalCost = 0;
      for (let h = 0; h < duration; h++) {
        originalCost += power * getTouPrice((preferredHour + h) % 24);
      }
      
      const optimal = findOptimalSlot(power, duration, preferredHour, optimizedLoad);
      
      for (let h = 0; h < duration; h++) {
        optimizedLoad[(optimal.hour + h) % 24] += power;
      }
      
      const savings = originalCost - optimal.cost;
      
      results.push({
        ...app,
        originalHour: preferredHour,
        optimizedHour: optimal.hour,
        originalCost: originalCost.toFixed(2),
        optimizedCost: optimal.cost.toFixed(2),
        savings: savings.toFixed(2),
        savingsPercent: originalCost > 0 ? ((savings / originalCost) * 100).toFixed(1) : '0.0',
        hasChange: optimal.hour !== preferredHour
      });
    }
    
    return results;
  };

  // Generate consumption data
  const generateConsumptionData = (appliances, useOptimized = false) => {
    const consumption = [...baseLoad];
    
    for (const app of appliances) {
      const startHour = useOptimized && app.optimizedHour !== undefined 
        ? app.optimizedHour 
        : app.preferredHour;
      
      for (let h = 0; h < app.duration; h++) {
        consumption[(startHour + h) % 24] += app.power;
      }
    }
    
    return consumption;
  };

  // Calculate daily cost
  const calculateDailyCost = (consumption) => {
    return consumption.reduce((sum, kwh, hour) => sum + kwh * getTouPrice(hour), 0);
  };

  // Presets
  const presets = [
    { name: 'Air Conditioner', power: 1.5, duration: 4, preferredHour: 19 },
    { name: 'Washing Machine', power: 0.5, duration: 2, preferredHour: 20 },
    { name: 'Water Heater', power: 2.0, duration: 1, preferredHour: 18 },
    { name: 'Dishwasher', power: 0.8, duration: 2, preferredHour: 21 },
    { name: 'EV Charger', power: 3.5, duration: 4, preferredHour: 19 },
  ];

  const addAppliance = () => {
    if (newAppliance.name && newAppliance.power) {
      setAppliances([...appliances, {
        ...newAppliance,
        id: Date.now(),
        power: parseFloat(newAppliance.power),
      }]);
      setNewAppliance({ name: '', power: '', duration: 1, preferredHour: 19 });
      setIsOptimized(false);
      setResults([]);
    }
  };

  const addPreset = (preset) => {
    setAppliances([...appliances, { ...preset, id: Date.now() }]);
    setIsOptimized(false);
    setResults([]);
  };

  const removeAppliance = (id) => {
    setAppliances(appliances.filter(a => a.id !== id));
    setIsOptimized(false);
    setResults([]);
  };

  const runOptimization = async () => {
    setIsOptimizing(true);
    
    // Try API first (real Linear Programming)
    try {
      const response = await fetch('http://localhost:5000/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appliances: appliances.map(app => ({
            id: app.id,
            name: app.name,
            power: app.power,
            duration: app.duration,
            preferredHour: app.preferredHour
          })),
          baseLoad: baseLoad,
          maxPower: 8.0
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setResults(data.results);
          setIsOptimized(true);
          setUsingAPI(true);
          setIsOptimizing(false);
          console.log('✅ LP Optimization via API:', data.method);
          return;
        }
      }
      throw new Error('API request failed');
    } catch (error) {
      console.log('API not available, using local optimization');
      // Fallback to local algorithm
      const optimized = optimizeSchedule(appliances);
      setResults(optimized);
      setIsOptimized(true);
      setUsingAPI(false);
    }
    
    setIsOptimizing(false);
  };

  const resetOptimization = () => {
    setResults([]);
    setIsOptimized(false);
    setUsingAPI(false);
  };

  // Chart data
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  
  const beforeData = useMemo(() => {
    if (appliances.length === 0) return baseLoad;
    return generateConsumptionData(appliances, false);
  }, [appliances, baseLoad]);
  
  const afterData = useMemo(() => {
    if (!isOptimized || results.length === 0) return beforeData;
    return generateConsumptionData(results, true);
  }, [results, isOptimized, beforeData]);

  const beforeCost = calculateDailyCost(beforeData);
  const afterCost = calculateDailyCost(afterData);
  const totalSavings = beforeCost - afterCost;
  const savingsPercent = beforeCost > 0 ? ((totalSavings / beforeCost) * 100).toFixed(1) : 0;

  const chartLayout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#94a3b8', family: 'Inter' },
    margin: { l: 50, r: 30, t: 40, b: 60 },
    xaxis: { gridcolor: 'rgba(148, 163, 184, 0.1)', title: 'Hour of Day', tickangle: -45 },
    yaxis: { gridcolor: 'rgba(148, 163, 184, 0.1)', title: 'Power (kW)' },
    legend: { orientation: 'h', y: -0.25 },
    barmode: 'group',
    bargap: 0.15,
    bargroupgap: 0.1
  };

  // Loading state
  if (isLoading) {
    return (
      <section id="optimizer-tool" className="section">
        <div className="loading-state">
          <Loader2 className="spin" size={48} />
          <p>Loading datasets from CSV files...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="optimizer-tool" className="section">
      <div className="section-header">
        <div className="section-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
          <Calculator size={24} />
        </div>
        <div>
          <h2 className="section-title">Smart Appliance Optimizer</h2>
          <p className="section-subtitle">
            Add your appliances and get personalized scheduling recommendations
            {usingAPI && <span className="lp-badge"><Cpu size={12} /> Live LP</span>}
          </p>
        </div>
      </div>

      {/* Data Source Note */}
      <div className={`data-source-note ${dataError ? 'error' : 'success'}`}>
        {dataError ? (
          <>
            <AlertTriangle size={16} />
            <span>Error loading data: {dataError}. Using fallback values.</span>
          </>
        ) : (
          <>
            <Zap size={16} />
            <span>
              Loaded <strong>{dataStats.energyRows}</strong> rows from <code>energy_consumption.csv</code> and{' '}
              <strong>{dataStats.pricingRows}</strong> rows from <code>tou_pricing.csv</code>
            </span>
          </>
        )}
      </div>

      <div className="optimizer-layout">
        {/* Left: Input Section */}
        <div className="input-section">
          <div className="presets-card">
            <h3>Quick Add Appliances</h3>
            <p className="presets-note">All presets default to peak hours (6-10 PM)</p>
            <div className="presets-grid">
              {presets.map((preset, i) => (
                <button key={i} className="preset-btn" onClick={() => addPreset(preset)}>
                  <Zap size={14} />
                  {preset.name}
                  <span className="preset-power">{preset.power}kW</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-card">
            <h3>Add Custom Appliance</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Appliance Name</label>
                <input
                  type="text"
                  placeholder="e.g., Iron"
                  value={newAppliance.name}
                  onChange={(e) => setNewAppliance({...newAppliance, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Power (kW)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 1.5"
                  value={newAppliance.power}
                  onChange={(e) => setNewAppliance({...newAppliance, power: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Duration (hours)</label>
                <select
                  value={newAppliance.duration}
                  onChange={(e) => setNewAppliance({...newAppliance, duration: parseInt(e.target.value)})}
                >
                  {[1,2,3,4,5,6].map(h => <option key={h} value={h}>{h} hr</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Current Usage Time</label>
                <select
                  value={newAppliance.preferredHour}
                  onChange={(e) => setNewAppliance({...newAppliance, preferredHour: parseInt(e.target.value)})}
                  className={`time-select ${getTouTier(newAppliance.preferredHour)}`}
                >
                  {Array.from({length: 24}, (_, i) => (
                    <option key={i} value={i}>
                      {i}:00 - ₹{getTouPrice(i).toFixed(1)} ({getTouTier(i)})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button className="add-btn" onClick={addAppliance} disabled={!newAppliance.name || !newAppliance.power}>
              <Plus size={18} /> Add Appliance
            </button>
          </div>

          <div className="appliances-list">
            <h3>Your Appliances ({appliances.length})</h3>
            <AnimatePresence>
              {appliances.map((app) => {
                const result = results.find(r => r.id === app.id);
                return (
                  <motion.div
                    key={app.id}
                    className={`appliance-item ${result?.hasChange ? 'has-change' : ''}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <div className="appliance-info">
                      <span className="appliance-name">{app.name}</span>
                      <span className="appliance-details">
                        {app.power} kW × {app.duration}h @
                        <span className={`time-tag ${getTouTier(app.preferredHour)}`}>
                          {app.preferredHour}:00
                        </span>
                      </span>
                    </div>
                    {isOptimized && result?.hasChange && (
                      <span className="optimized-badge">
                        → {result.optimizedHour}:00 <span className="save-amt">-₹{result.savings}</span>
                      </span>
                    )}
                    {isOptimized && result && !result.hasChange && (
                      <span className="already-optimal">Already optimal</span>
                    )}
                    <button className="remove-btn" onClick={() => removeAppliance(app.id)}>
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {appliances.length === 0 && (
              <p className="empty-state">Add appliances to get started</p>
            )}
          </div>

          {appliances.length > 0 && (
            <div className="action-buttons">
              <button 
                className="optimize-btn" 
                onClick={runOptimization} 
                disabled={isOptimized || isOptimizing}
              >
                {isOptimizing ? (
                  <><Loader2 className="spin" size={18} /> Optimizing...</>
                ) : isOptimized ? (
                  <><Cpu size={18} /> Optimized!</>
                ) : (
                  <><Play size={18} /> Run Optimization</>
                )}
              </button>
              {isOptimized && (
                <button className="reset-btn" onClick={resetOptimization}>
                  <RotateCcw size={18} /> Reset
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Results Section */}
        <div className="results-section">
          <div className="chart-card">
            <div className="chart-header">
              <h3>24-Hour Energy Consumption Profile</h3>
              <div className="chart-legend">
                <span className="legend-before">■ Before (Current)</span>
                <span className="legend-after">■ After (Optimized)</span>
              </div>
            </div>
            <Plot
              data={[
                {
                  x: hours,
                  y: beforeData,
                  type: 'bar',
                  name: 'Before',
                  marker: { color: 'rgba(239, 68, 68, 0.8)', line: { color: '#ef4444', width: 1 } },
                },
                {
                  x: hours,
                  y: isOptimized ? afterData : Array(24).fill(null),
                  type: 'bar',
                  name: 'After',
                  marker: { color: 'rgba(16, 185, 129, 0.8)', line: { color: '#10b981', width: 1 } },
                }
              ]}
              layout={chartLayout}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: '100%', height: '350px' }}
            />
            
            <div className="price-zones">
              <span className="zone off-peak">🟢 Off-Peak (22-06) ₹{touPricing[0]?.price.toFixed(2)}</span>
              <span className="zone normal">🟡 Normal (06-18) ₹{touPricing[10]?.price.toFixed(2)}</span>
              <span className="zone peak">🔴 Peak (18-22) ₹{touPricing[19]?.price.toFixed(2)}</span>
            </div>
          </div>

          {isOptimized && results.length > 0 && (
            <motion.div 
              className="savings-summary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="savings-header">
                <TrendingDown size={24} />
                <h3>Optimization Results</h3>
              </div>
              
              <div className="savings-grid">
                <div className="savings-card original">
                  <span className="label">Original Daily Cost</span>
                  <span className="value">₹{beforeCost.toFixed(2)}</span>
                  <span className="sublabel">with current schedule</span>
                </div>
                <div className="savings-card optimized">
                  <span className="label">Optimized Daily Cost</span>
                  <span className="value">₹{afterCost.toFixed(2)}</span>
                  <span className="sublabel">with recommended schedule</span>
                </div>
                <div className="savings-card savings">
                  <span className="label">Daily Savings</span>
                  <span className="value">₹{totalSavings.toFixed(2)}</span>
                  <span className="sublabel">
                    {savingsPercent}% reduction • ₹{(totalSavings * 30).toFixed(0)}/month
                  </span>
                </div>
              </div>

              <div className="recommendations">
                <h4>Recommended Schedule Changes</h4>
                <div className="rec-table">
                  {results.filter(r => r.hasChange).map((r, i) => (
                    <div key={i} className="rec-row">
                      <span className="rec-name">{r.name}</span>
                      <span className="rec-change">
                        <span className="old-time">{r.originalHour}:00 ({getTouTier(r.originalHour)})</span>
                        <span className="arrow">→</span>
                        <span className="new-time">{r.optimizedHour}:00 ({getTouTier(r.optimizedHour)})</span>
                      </span>
                      <span className="rec-savings">-₹{r.savings}</span>
                    </div>
                  ))}
                  {results.filter(r => r.hasChange).length === 0 && (
                    <div className="rec-row no-change">
                      <span>All appliances are already running at optimal times!</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {!isOptimized && appliances.length > 0 && (
            <div className="placeholder-message">
              <Clock size={48} />
              <p>Click "Run Optimization" to see recommendations</p>
              <span className="hint">The optimizer will shift appliances from peak hours to off-peak hours</span>
            </div>
          )}

          {appliances.length === 0 && (
            <div className="placeholder-message">
              <Zap size={48} />
              <p>Add appliances to see consumption analysis</p>
              <span className="hint">Try adding appliances that you typically use during peak hours (6-10 PM)</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
