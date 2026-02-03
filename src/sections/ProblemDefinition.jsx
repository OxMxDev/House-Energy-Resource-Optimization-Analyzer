import { 
  Zap, 
  TrendingDown, 
  Leaf, 
  DollarSign, 
  ThermometerSun,
  Clock,
  Target,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import './ProblemDefinition.css';

const challenges = [
  {
    icon: TrendingDown,
    title: 'Rising Energy Costs',
    description: 'Electricity prices increasing 8-12% annually, straining household budgets'
  },
  {
    icon: ThermometerSun,
    title: 'Climate Variability',
    description: 'Unpredictable weather patterns causing irregular consumption spikes'
  },
  {
    icon: Clock,
    title: 'Peak Hour Pricing',
    description: 'Time-of-Use tariffs charge 2x more during evening peak hours'
  },
  {
    icon: AlertTriangle,
    title: 'Blind Consumption',
    description: 'Most households unaware of optimal times to run heavy appliances'
  }
];

const objectives = [
  {
    icon: Target,
    title: 'Demand Forecasting',
    description: 'Predict hourly energy consumption using ML models',
    color: '#6366f1'
  },
  {
    icon: DollarSign,
    title: 'Cost Optimization',
    description: 'Reduce electricity bills by 15-25% through smart scheduling',
    color: '#10b981'
  },
  {
    icon: Leaf,
    title: 'Carbon Reduction',
    description: 'Lower household carbon footprint by shifting to off-peak hours',
    color: '#22c55e'
  }
];

export default function ProblemDefinition() {
  return (
    <section id="problem-definition" className="section problem-section">
      {/* Hero */}
      <div className="hero">
        <div className="hero-background">
          <div className="grid-pattern"></div>
          <div className="glow-orb orb-1"></div>
          <div className="glow-orb orb-2"></div>
        </div>
        
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="hero-badge">
            <Zap size={14} />
            <span>AI-Powered Energy Management</span>
          </div>
          
          <h1 className="hero-title">
            Home Energy Resource
            <span className="text-gradient"> Optimization Analyzer</span>
          </h1>
          
          <p className="hero-description">
            An intelligent system that forecasts household electricity demand, 
            analyzes weather and pricing patterns, and recommends optimal appliance 
            schedules for maximum cost savings and sustainability.
          </p>
          
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-value">25%</span>
              <span className="stat-label">Avg. Cost Savings</span>
            </div>
            <div className="stat">
              <span className="stat-value">15%</span>
              <span className="stat-label">Carbon Reduction</span>
            </div>
            <div className="stat">
              <span className="stat-value">72hr</span>
              <span className="stat-label">Forecast Horizon</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Challenges */}
      <div className="subsection">
        <h2 className="subsection-title">The Challenge</h2>
        <p className="subsection-description">
          Indian households face multiple challenges in managing electricity consumption efficiently
        </p>
        
        <div className="challenges-grid">
          {challenges.map((challenge, index) => {
            const Icon = challenge.icon;
            return (
              <motion.div 
                key={index}
                className="challenge-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="challenge-icon">
                  <Icon size={24} />
                </div>
                <h3>{challenge.title}</h3>
                <p>{challenge.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Objectives */}
      <div className="subsection">
        <h2 className="subsection-title">Project Objectives</h2>
        <p className="subsection-description">
          Our solution addresses these challenges through a data-driven approach
        </p>
        
        <div className="objectives-grid">
          {objectives.map((objective, index) => {
            const Icon = objective.icon;
            return (
              <motion.div 
                key={index}
                className="objective-card"
                style={{ '--accent-color': objective.color }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.15 }}
              >
                <div className="objective-icon">
                  <Icon size={28} />
                </div>
                <h3>{objective.title}</h3>
                <p>{objective.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
