import React, { useState, useEffect } from 'react';
import { CloudSun, Map, Calendar, AlertTriangle, Settings, RefreshCw, Wifi } from 'lucide-react';
import HomeScreen from './components/HomeScreen';
import RadarScreen from './components/RadarScreen';
import ForecastScreen from './components/ForecastScreen';
import RainAlertScreen from './components/RainAlertScreen';
import SettingsScreen from './components/SettingsScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dynamic mock clock for mobile status bar
  const [timeStr, setTimeStr] = useState('10:00');

  // Shared settings state
  const [settings, setSettings] = useState({
    tempUnit: 'C',
    windUnit: 'km/h',
    notifications: true
  });

  // Fetch Open-Meteo weather data
  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=21.0285&longitude=105.8542&current_weather=true&hourly=temperature_2m,precipitation_probability,weathercode,windspeed_10m&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum&timezone=Asia%2FHo_Chi_Minh&forecast_days=8");
      if (!res.ok) throw new Error("Không thể kết nối tới máy chủ thời tiết");
      const data = await res.json();
      setWeatherData(data);
    } catch (err) {
      console.error(err);
      setError("Không thể tải thông tin thời tiết. Vui lòng kiểm tra kết nối mạng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();

    // Clock ticker
    const updateTime = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${hh}:${mm}`);
    };
    updateTime();
    const clockInterval = setInterval(updateTime, 60000);

    return () => clearInterval(clockInterval);
  }, []);

  const renderActiveScreen = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '80%', justifyContent: 'center', alignItems: 'center' }}>
          <div className="loading-spinner" style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(56, 189, 248, 0.1)',
            borderTop: '3px solid var(--accent-color)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px'
          }} />
          <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Đang lấy thông tin thời tiết Hà Nội...</div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '80%', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '20px' }}>
          <AlertTriangle size={48} style={{ color: '#EF4444', marginBottom: '16px' }} />
          <div style={{ color: 'var(--text-primary)', fontSize: '15px', fontWeight: '600', marginBottom: '8px' }}>Lỗi Tải Dữ Liệu</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>{error}</div>
          <button 
            onClick={fetchWeatherData}
            style={{
              backgroundColor: 'var(--accent-color)',
              color: 'var(--bg-color)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '10px 20px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <RefreshCw size={14} /> Thử Lại
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'home':
        return <HomeScreen weatherData={weatherData} settings={settings} onNavigate={setActiveTab} />;
      case 'radar':
        return <RadarScreen />;
      case 'forecast':
        return <ForecastScreen weatherData={weatherData} settings={settings} />;
      case 'alerts':
        return <RainAlertScreen weatherData={weatherData} />;
      case 'settings':
        return <SettingsScreen settings={settings} setSettings={setSettings} />;
      default:
        return <HomeScreen weatherData={weatherData} settings={settings} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="app-frame">
      {/* iOS Status Bar */}
      <div className="status-bar">
        <span>{timeStr}</span>
        <div className="right-icons">
          {/* Signal Strength */}
          <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
            <rect x="0" y="8" width="2.5" height="3" rx="0.5" />
            <rect x="4" y="6" width="2.5" height="5" rx="0.5" />
            <rect x="8" y="4" width="2.5" height="7" rx="0.5" />
            <rect x="12" y="1.5" width="2.5" height="9.5" rx="0.5" />
          </svg>
          {/* Wi-Fi Icon */}
          <Wifi size={12} />
          {/* Battery Icon */}
          <div style={{ 
            width: '20px', 
            height: '10px', 
            border: '1px solid var(--text-primary)', 
            borderRadius: '3px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            padding: '1px'
          }}>
            <div style={{ width: '85%', height: '100%', backgroundColor: 'var(--text-primary)', borderRadius: '1px' }} />
            <div style={{ 
              width: '1px', 
              height: '4px', 
              backgroundColor: 'var(--text-primary)', 
              position: 'absolute',
              right: '-3px',
              top: '2px',
              borderTopRightRadius: '1px',
              borderBottomRightRadius: '1px'
            }} />
          </div>
        </div>
      </div>

      {/* Screen Viewport Container */}
      <div className="screen-container">
        {renderActiveScreen()}
      </div>

      {/* Navigation Bar */}
      <nav className="bottom-nav">
        <button 
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
          style={{ background: 'none', border: 'none' }}
        >
          <CloudSun size={20} />
          <span>Thời Tiết</span>
        </button>

        <button 
          className={`nav-item ${activeTab === 'radar' ? 'active' : ''}`}
          onClick={() => setActiveTab('radar')}
          style={{ background: 'none', border: 'none' }}
        >
          <Map size={20} />
          <span>Radar</span>
        </button>

        <button 
          className={`nav-item ${activeTab === 'forecast' ? 'active' : ''}`}
          onClick={() => setActiveTab('forecast')}
          style={{ background: 'none', border: 'none' }}
        >
          <Calendar size={20} />
          <span>Dự Báo</span>
        </button>

        <button 
          className={`nav-item ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
          style={{ background: 'none', border: 'none' }}
        >
          <AlertTriangle size={20} />
          <span>Mưa</span>
        </button>

        <button 
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
          style={{ background: 'none', border: 'none' }}
        >
          <Settings size={20} />
          <span>Thiết Lập</span>
        </button>
      </nav>
    </div>
  );
}
