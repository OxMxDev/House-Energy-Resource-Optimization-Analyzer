import { useState, useEffect } from 'react';
import {
  Home,
  Database,
  Settings,
  BarChart3,
  Brain,
  Zap,
  TrendingUp,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Leaf
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { id: 'problem', icon: Home, label: 'Problem Definition', section: 'problem-definition' },
  { id: 'data', icon: Database, label: 'Data Collection', section: 'data-collection' },
  { id: 'preprocessing', icon: Settings, label: 'Preprocessing', section: 'data-preprocessing' },
  { id: 'eda', icon: BarChart3, label: 'Exploratory Analysis', section: 'eda' },
  { id: 'modelling', icon: Brain, label: 'Data Modelling', section: 'data-modelling' },
  { id: 'optimization', icon: Zap, label: 'Optimization Engine', section: 'optimization' },
  { id: 'impact', icon: TrendingUp, label: 'Impact & Deployment', section: 'impact' },
  { id: 'optimizer-tool', icon: Calculator, label: 'Smart Optimizer', section: 'optimizer-tool' },
];

export default function Sidebar({ isCollapsed, onToggle }) {
  const [activeSection, setActiveSection] = useState('problem');

  // Scroll detection to update active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150; // Offset for header

      for (let i = navItems.length - 1; i >= 0; i--) {
        const section = document.getElementById(navItems[i].section);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(navItems[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (item) => {
    setActiveSection(item.id);
    const element = document.getElementById(item.section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">
            <Leaf size={24} />
          </div>
          {!isCollapsed && (
            <div className="logo-text">
              <span className="logo-title">Energy</span>
              <span className="logo-subtitle">Optimizer</span>
            </div>
          )}
        </div>
        <button className="toggle-btn" onClick={onToggle}>
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => handleNavClick(item)}
                  title={isCollapsed ? item.label : ''}
                >
                  <span className="nav-number">{String(index + 1).padStart(2, '0')}</span>
                  <Icon className="nav-icon" size={20} />
                  {!isCollapsed && <span className="nav-label">{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        {!isCollapsed && (
          <div className="project-info">
            <span className="project-label">Data Science Project</span>
            <span className="project-year">2026</span>
          </div>
        )}
      </div>
    </aside>
  );
}
