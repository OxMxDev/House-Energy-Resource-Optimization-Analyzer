import { useState, useEffect } from 'react';
import { Menu, Cloud, Thermometer, Droplets, Sun, CloudRain, Wind } from 'lucide-react';
import './Header.css';

// OpenWeatherMap API - Free tier (1000 calls/day)
// API key loaded from .env file (VITE_WEATHER_API_KEY)
const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY || '';
const CHENNAI_COORDS = { lat: 13.0827, lon: 80.2707 };

export default function Header({ onMenuClick, sidebarCollapsed }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Try OpenWeatherMap API first
        if (WEATHER_API_KEY && WEATHER_API_KEY !== 'demo') {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${CHENNAI_COORDS.lat}&lon=${CHENNAI_COORDS.lon}&appid=${WEATHER_API_KEY}&units=metric`
          );
          
          if (response.ok) {
            const data = await response.json();
            setWeather({
              temp: Math.round(data.main.temp * 10) / 10,
              humidity: data.main.humidity,
              condition: data.weather[0]?.main || 'Clear',
              icon: data.weather[0]?.icon,
              isLive: true
            });
            setLoading(false);
            return;
          }
          // 401 = API key not activated yet, fall through to simulation
        }
        
        // Fallback: Use realistic Chennai weather for demo
        // Chennai in early February: 22-28°C, 60-70% humidity
        const hour = new Date().getHours();
        const baseTemp = hour >= 10 && hour <= 16 ? 27 : hour >= 6 ? 25 : 23;
        const tempVariation = Math.random() * 2 - 1;
        
        setWeather({
          temp: Math.round((baseTemp + tempVariation) * 10) / 10,
          humidity: Math.round(60 + Math.random() * 15),
          condition: hour >= 6 && hour <= 18 ? 'Sunny' : 'Clear',
          isLive: false
        });
      } catch (error) {
        console.log('Weather fetch failed, using fallback');
        // Fallback values
        setWeather({
          temp: 24.5,
          humidity: 65,
          condition: 'Clear',
          isLive: false
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    
    // Refresh weather every 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (condition) => {
    const cond = condition?.toLowerCase() || '';
    if (cond.includes('rain') || cond.includes('drizzle')) return <CloudRain size={16} />;
    if (cond.includes('cloud')) return <Cloud size={16} />;
    if (cond.includes('sun') || cond.includes('clear')) return <Sun size={16} />;
    return <Cloud size={16} />;
  };

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
        {!loading && weather && (
          <div className={`weather-banner ${weather.isLive ? 'live' : ''}`}>
            <div className="weather-location">
              📍 Chennai
              {weather.isLive && <span className="live-badge">LIVE</span>}
            </div>
            <div className="weather-divider">|</div>
            <div className="weather-item">
              <Thermometer size={16} />
              <span>{weather.temp}°C</span>
            </div>
            <div className="weather-item">
              <Droplets size={16} />
              <span>{weather.humidity}%</span>
            </div>
            <div className="weather-item">
              {getWeatherIcon(weather.condition)}
              <span>{weather.condition}</span>
            </div>
          </div>
        )}
        
        <div className="user-avatar">
          <span>DS</span>
        </div>
      </div>
    </header>
  );
}
