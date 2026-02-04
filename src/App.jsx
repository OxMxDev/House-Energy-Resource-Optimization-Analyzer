import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProblemDefinition from './sections/ProblemDefinition';
import DataCollection from './sections/DataCollection';
import DataPreprocessing from './sections/DataPreprocessing';
import ExploratoryAnalysis from './sections/ExploratoryAnalysis';
import DataModelling from './sections/DataModelling';
import OptimizationEngine from './sections/OptimizationEngine';
import ImpactDeployment from './sections/ImpactDeployment';
import ApplianceOptimizer from './sections/ApplianceOptimizer';
import SolarSimulation from './sections/SolarSimulation';
import './App.css';

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="app-container">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <Header onMenuClick={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />
      
      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <ProblemDefinition />
        <DataCollection />
        <DataPreprocessing />
        <ExploratoryAnalysis />
        <DataModelling />
        <OptimizationEngine />
        <ImpactDeployment />
        <ApplianceOptimizer />
        <SolarSimulation />
      </main>
    </div>
  );
}

