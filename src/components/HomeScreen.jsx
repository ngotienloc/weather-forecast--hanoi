import React from 'react';
import { Sun, Cloud, CloudRain, CloudDrizzle, CloudLightning, CloudSnow, CloudFog, Droplets, Wind, AlertTriangle, Compass, Flame, Thermometer, Eye } from 'lucide-react';

export const getWeatherInfo = (code) => {
  // WMO Weather Codes (https://open-meteo.com/en/docs)
  if (code === 0) return { name: 'Clear Sky', icon: Sun, color: '#FBBF24' };
  if ([1, 2, 3].includes(code)) return { name: 'Partly Cloudy', icon: Cloud, color: '#8899BB' };
  if ([45, 48].includes(code)) return { name: 'Foggy', icon: CloudFog, color: '#6B7280' };
  if ([51, 53, 55, 56, 57].includes(code)) return { name: 'Drizzle', icon: CloudDrizzle, color: '#38BDF8' };
  if ([61, 63, 65, 66, 67].includes(code)) return { name: 'Rainy', icon: CloudRain, color: '#3B82F6' };
  if ([71, 73, 75, 77].includes(code)) return { name: 'Snowy', icon: CloudSnow, color: '#10B981' };
  if ([80, 81, 82].includes(code)) return { name: 'Rain Showers', icon: CloudRain, color: '#2563EB' };
  if ([85, 86].includes(code)) return { name: 'Snow Showers', icon: CloudSnow, color: '#34D399' };
  if ([95, 96, 99].includes(code)) return { name: 'Thunderstorm', icon: CloudLightning, color: '#EF4444' };
  return { name: 'Cloudy', icon: Cloud, color: '#8899BB' };
};

export default function HomeScreen({ weatherData, settings, onNavigate }) {
  if (!weatherData) return null;

  const current = weatherData.current_weather;
  const currentHourTimeStr = current.time; // Format: "2026-06-09T10:00" or similar
  
  // Find index of current hour
  const hourlyTimeArray = weatherData.hourly.time;
  let currentHourIndex = hourlyTimeArray.findIndex(t => t.startsWith(currentHourTimeStr.substring(0, 13)));
  if (currentHourIndex === -1) {
    // Fallback to closest hour
    currentHourIndex = 0;
  }

  // Get current hourly metrics
  const hourly = weatherData.hourly;
  const tempC = current.temperature;
  const tempF = (tempC * 9/5) + 32;
  const currentTemp = settings.tempUnit === 'C' ? tempC : tempF;

  // Convert daily min/max for today
  const todayMaxC = weatherData.daily.temperature_2m_max[0];
  const todayMinC = weatherData.daily.temperature_2m_min[0];
  const todayMax = settings.tempUnit === 'C' ? todayMaxC : (todayMaxC * 9/5) + 32;
  const todayMin = settings.tempUnit === 'C' ? todayMinC : (todayMinC * 9/5) + 32;

  // Apparent temperature ("Feels like")
  const apparentTempC = hourly.apparent_temperature ? hourly.apparent_temperature[currentHourIndex] : tempC;
  const apparentTempF = (apparentTempC * 9/5) + 32;
  const apparentTemp = settings.tempUnit === 'C' ? apparentTempC : apparentTempF;

  // Visibility (convert meters to km)
  const visibilityM = hourly.visibility ? hourly.visibility[currentHourIndex] : 10000;
  const visibilityKm = (visibilityM / 1000).toFixed(1);

  // Rain Alert Card logic:
  // Next 2 hours of precipitation probability data
  const prob0 = hourly.precipitation_probability[currentHourIndex] || 0;
  const prob1 = hourly.precipitation_probability[currentHourIndex + 1] || 0;
  const prob2 = hourly.precipitation_probability[currentHourIndex + 2] || 0;

  const maxProb2h = Math.max(prob0, prob1);
  const showRainAlert = maxProb2h > 60;

  // 4 slots for 2 hours (0-30m, 30-60m, 60-90m, 90-120m)
  const slots = [
    { label: '0-30m', prob: prob0 },
    { label: '30-60m', prob: Math.round((prob0 + prob1) / 2) },
    { label: '60-90m', prob: prob1 },
    { label: '90-120m', prob: Math.round((prob1 + prob2) / 2) }
  ];

  // Helper for slot styling
  const getSlotColor = (prob) => {
    if (prob < 20) return '#1E2937'; // low
    if (prob <= 60) return '#0EA5E9'; // medium (accent blue)
    return '#EF4444'; // high (red)
  };

  const weatherInfo = getWeatherInfo(current.weathercode);
  const WeatherIcon = weatherInfo.icon;

  // Next 24 hours hourly forecast items
  const hourlyItems = [];
  for (let i = currentHourIndex; i < currentHourIndex + 24; i++) {
    if (!hourlyTimeArray[i]) break;
    const timeStr = hourlyTimeArray[i];
    const hour = parseInt(timeStr.split('T')[1].split(':')[0]);
    const displayHour = hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
    const tempValue = settings.tempUnit === 'C' ? hourly.temperature_2m[i] : (hourly.temperature_2m[i] * 9/5) + 32;
    const rainProb = hourly.precipitation_probability[i];
    const itemInfo = getWeatherInfo(hourly.weathercode[i]);
    const ItemIcon = itemInfo.icon;

    hourlyItems.push({
      time: displayHour,
      temp: tempValue,
      prob: rainProb,
      icon: ItemIcon,
      color: itemInfo.color,
      isCurrent: i === currentHourIndex
    });
  }

  // UV index estimation based on weather code and time of day
  // Clear sky during day = high UV. Overcast/night = low.
  const isDay = current.is_day === 1;
  let uvIndex = 0;
  if (isDay) {
    if (current.weathercode === 0) uvIndex = 8; // Very high
    else if ([1, 2].includes(current.weathercode)) uvIndex = 5; // Moderate
    else uvIndex = 2; // Low
  }
  const getUvCategory = (uv) => {
    if (uv <= 2) return 'Low';
    if (uv <= 5) return 'Moderate';
    if (uv <= 7) return 'High';
    return 'Very High';
  };

  // Wind speed units conversion
  const rawWindSpeed = current.windspeed; // in km/h
  let displayWindSpeed = rawWindSpeed;
  let windUnitStr = 'km/h';
  if (settings.windUnit === 'm/s') {
    displayWindSpeed = (rawWindSpeed / 3.6).toFixed(1);
    windUnitStr = 'm/s';
  } else if (settings.windUnit === 'mph') {
    displayWindSpeed = (rawWindSpeed * 0.621371).toFixed(1);
    windUnitStr = 'mph';
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Hero Header Area */}
      <div style={{ textAlign: 'center', marginTop: '16px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '4px' }}>Hà Nội</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <weatherInfo.icon size={16} style={{ color: weatherInfo.color }} />
          {weatherInfo.name}
        </p>
        
        {/* Extreme weight contrast hero temperature display */}
        <div style={{ 
          fontSize: '76px', 
          fontWeight: '100', 
          lineHeight: '76px', 
          color: 'var(--text-primary)',
          margin: '16px 0 8px 0',
          position: 'relative',
          display: 'inline-block'
        }}>
          {Math.round(currentTemp)}<span style={{ fontSize: '32px', fontWeight: '300', position: 'absolute', top: '4px' }}>°</span>
        </div>
        
        <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)' }}>
          Cảm giác như {Math.round(apparentTemp)}° &nbsp;•&nbsp; H: {Math.round(todayMax)}° &nbsp;•&nbsp; L: {Math.round(todayMin)}°
        </div>
      </div>

      {/* 2-Hour Rain Alert Widget */}
      {showRainAlert ? (
        <div className="card" style={{ border: '1px solid rgba(239, 68, 68, 0.3)', background: 'linear-gradient(to right, #111827, #221518)' }}>
          <div className="card-title" style={{ color: '#EF4444' }}>
            <AlertTriangle size={16} />
            CẢNH BÁO MƯA (NEXT 2H)
          </div>
          <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '16px', color: 'var(--text-primary)' }}>
            Rain possible in the next 2 hours ({maxProb2h}% chance)
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            {slots.map((s, idx) => (
              <div key={idx} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ 
                  height: '8px', 
                  backgroundColor: getSlotColor(s.prob), 
                  borderRadius: 'var(--radius-full)',
                  marginBottom: '6px',
                  boxShadow: s.prob > 60 ? '0 0 8px rgba(239, 68, 68, 0.4)' : 'none'
                }} />
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>{s.label}</div>
                <div style={{ fontSize: '10px', color: s.prob > 60 ? '#EF4444' : 'var(--text-primary)', fontWeight: '700', marginTop: '2px' }}>{s.prob}%</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card" style={{ background: 'linear-gradient(to right, #111827, #0B1E29)' }} onClick={() => onNavigate('alerts')}>
          <div className="card-title" style={{ color: 'var(--accent-color)' }}>
            <AlertTriangle size={16} />
            TRẠNG THÁI THỜI TIẾT
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>
            No immediate rain alert. Next 2 hours look dry ({maxProb2h}% probability).
          </p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            {slots.map((s, idx) => (
              <div key={idx} style={{ flex: 1, height: '4px', backgroundColor: '#1E2937', borderRadius: 'var(--radius-full)' }} />
            ))}
          </div>
        </div>
      )}

      {/* Hourly Forecast (Horizontal Scroll) */}
      <div className="card">
        <div className="card-title">DỰ BÁO 24 GIỜ</div>
        <div style={{ 
          display: 'flex', 
          overflowX: 'auto', 
          gap: '16px', 
          paddingBottom: '8px',
          scrollSnapType: 'x mandatory'
        }}>
          {hourlyItems.map((item, idx) => (
            <div 
              key={idx} 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                minWidth: '55px',
                padding: '8px 4px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: item.isCurrent ? 'var(--surface-accent)' : 'transparent',
                border: item.isCurrent ? '1px solid rgba(56, 189, 248, 0.2)' : '1px solid transparent',
                scrollSnapAlign: 'start'
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500', marginBottom: '6px' }}>
                {item.isCurrent ? 'Now' : item.time}
              </span>
              <item.icon size={20} style={{ color: item.color, marginBottom: '6px' }} />
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                {Math.round(item.temp)}°
              </span>
              {item.prob > 0 ? (
                <span style={{ fontSize: '9px', fontWeight: '700', color: 'var(--accent-color)' }}>
                  {item.prob}%
                </span>
              ) : (
                <span style={{ fontSize: '9px', color: 'transparent' }}>0%</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Grid of Detailed Cards (3 rows, 2 columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '12px' }}>
        {/* Apparent Temperature Card */}
        <div className="card" style={{ marginTop: 0 }}>
          <div className="card-title">
            <Thermometer size={14} />
            CẢM GIÁC NHƯ
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
            {Math.round(apparentTemp)}°
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px' }}>
            Nhiệt độ cảm nhận thực tế
          </div>
        </div>

        {/* Humidity Card */}
        <div className="card" style={{ marginTop: 0 }}>
          <div className="card-title">
            <Droplets size={14} />
            ĐỘ ẨM
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
            {hourly.precipitation_probability[currentHourIndex]}%
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px' }}>
            Điểm sương thích hợp
          </div>
        </div>

        {/* Wind Speed Card */}
        <div className="card" style={{ marginTop: 0 }}>
          <div className="card-title">
            <Wind size={14} />
            GIÓ
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'baseline', gap: '2px' }}>
            {displayWindSpeed}
            <span style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-muted)' }}>{windUnitStr}</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Compass size={12} style={{ transform: `rotate(${current.winddirection}deg)`, color: 'var(--accent-color)' }} />
            Hướng {current.winddirection}°
          </div>
        </div>

        {/* UV Index Card */}
        <div className="card" style={{ marginTop: 0 }}>
          <div className="card-title">
            <Flame size={14} />
            CHỈ SỐ UV
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
            {uvIndex}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px' }}>
            Cấp độ: {getUvCategory(uvIndex)}
          </div>
        </div>

        {/* Rain Volume Card */}
        <div className="card" style={{ marginTop: 0 }}>
          <div className="card-title">
            <CloudRain size={14} />
            LƯỢNG MƯA
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'baseline', gap: '2px' }}>
            {weatherData.daily.precipitation_sum[0].toFixed(1)}
            <span style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-muted)' }}>mm</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px' }}>
            Dự tính trong ngày
          </div>
        </div>

        {/* Visibility Card */}
        <div className="card" style={{ marginTop: 0 }}>
          <div className="card-title">
            <Eye size={14} />
            TẦM NHÌN
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
            {visibilityKm} km
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px' }}>
            Độ trong suốt của không khí
          </div>
        </div>
      </div>
    </div>
  );
}
