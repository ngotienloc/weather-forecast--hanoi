import React from 'react';
import { Settings, Info, Bell, Thermometer, Wind, ShieldAlert } from 'lucide-react';

export default function SettingsScreen({ settings, setSettings }) {
  const toggleTempUnit = () => {
    setSettings(prev => ({
      ...prev,
      tempUnit: prev.tempUnit === 'C' ? 'F' : 'C'
    }));
  };

  const setWindUnit = (unit) => {
    setSettings(prev => ({
      ...prev,
      windUnit: unit
    }));
  };

  const toggleNotifications = () => {
    setSettings(prev => ({
      ...prev,
      notifications: !prev.notifications
    }));
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ marginTop: '16px', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)' }}>Thiết lập</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Cấu hình trải nghiệm SkyView Hanoi</p>
      </div>

      {/* Unit Settings */}
      <div className="card">
        <div className="card-title">
          <Settings size={14} />
          ĐƠN VỊ ĐO LƯỜNG
        </div>

        {/* Temperature Unit */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Thermometer size={16} style={{ color: 'var(--accent-color)' }} />
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Nhiệt độ</span>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              className={`segmented-control-btn ${settings.tempUnit === 'C' ? 'active' : ''}`}
              style={{ 
                padding: '4px 10px', 
                fontSize: '12px', 
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: settings.tempUnit === 'C' ? 'var(--surface-accent)' : 'transparent',
                color: settings.tempUnit === 'C' ? 'var(--text-primary)' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
              onClick={() => setSettings(prev => ({ ...prev, tempUnit: 'C' }))}
            >
              °C
            </button>
            <button 
              className={`segmented-control-btn ${settings.tempUnit === 'F' ? 'active' : ''}`}
              style={{ 
                padding: '4px 10px', 
                fontSize: '12px', 
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: settings.tempUnit === 'F' ? 'var(--surface-accent)' : 'transparent',
                color: settings.tempUnit === 'F' ? 'var(--text-primary)' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
              onClick={() => setSettings(prev => ({ ...prev, tempUnit: 'F' }))}
            >
              °F
            </button>
          </div>
        </div>

        {/* Wind Speed Unit */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wind size={16} style={{ color: 'var(--accent-color)' }} />
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Tốc độ gió</span>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {['km/h', 'm/s', 'mph'].map((unit) => (
              <button 
                key={unit}
                className={`segmented-control-btn ${settings.windUnit ===   unit ? 'active' : ''}`}
                style={{ 
                  padding: '4px 8px', 
                  fontSize: '11px', 
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: settings.windUnit === unit ? 'var(--surface-accent)' : 'transparent',
                  color: settings.windUnit === unit ? 'var(--text-primary)' : 'var(--text-muted)',
                  cursor: 'pointer'
                }}
                onClick={() => setWindUnit(unit)}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications settings */}
      <div className="card">
        <div className="card-title">
          <Bell size={14} />
          THÔNG BÁO THỜI TIẾT
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>Cảnh báo mưa ngắn hạn</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Thông báo khi có mưa sắp tới trong 2 giờ
            </div>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={settings.notifications} 
              onChange={toggleNotifications}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      {/* App Info / About */}
      <div className="card">
        <div className="card-title">
          <Info size={14} />
          THÔNG TIN ỨNG DỤNG
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', padding: '4px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Tên ứng dụng</span>
            <span style={{ fontWeight: '500' }}>SkyView Hanoi</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Phiên bản</span>
            <span style={{ fontWeight: '500' }}>1.0.0 (Production)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Nhà phát triển</span>
            <span style={{ fontWeight: '500' }}>SkyView Team</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Nguồn dữ liệu</span>
            <span style={{ fontWeight: '500', color: 'var(--accent-color)' }}>Open-Meteo & RainViewer</span>
          </div>
        </div>
      </div>
    </div>
  );
}
