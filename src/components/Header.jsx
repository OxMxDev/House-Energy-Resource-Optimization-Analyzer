import { Menu } from 'lucide-react';
import './Header.css';

export default function Header({ onMenuClick, sidebarCollapsed }) {
  return (
    <header className={`header ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="header-left">
        <button className="menu-btn mobile-only" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
        <div className="header-title">
          <h1>Home Energy Resource Optimization</h1>
          <span className="header-badge">Analyzer Dashboard</span>
        </div>
      </div>
      
      <div className="header-right">
        <div className="user-avatar">
          <span>DS</span>
        </div>
      </div>
    </header>
  );
}
