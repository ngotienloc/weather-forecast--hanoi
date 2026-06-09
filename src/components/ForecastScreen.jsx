import React from 'react';
import { Calendar, CloudRain } from 'lucide-react';
import { getWeatherInfo } from './HomeScreen';

export default function ForecastScreen({ weatherData, settings }) {
  if (!weatherData) return null;

  const daily = weatherData.daily;
  const currentTemp = weatherData.current_weather.temperature;

  // Find absolute max and min temperatures for the entire week to scale the range bars
  const allMaxC = daily.temperature_2m_max;
  const allMinC = daily.temperature_2m_min;
  const absoluteMinC = Math.min(...allMinC);
  const absoluteMaxC = Math.max(...allMaxC);

  // Convert scale limits
  const scaleMin = settings.tempUnit === 'C' ? absoluteMinC : (absoluteMinC * 9/5) + 32;
  const scaleMax = settings.tempUnit === 'C' ? absoluteMaxC : (absoluteMaxC * 9/5) + 32;
  const scaleRange = scaleMax - scaleMin;

  const getDayName = (dateStr, isToday) => {
    if (isToday) return 'Hôm nay';
    const date = new Date(dateStr);
    const day = date.getDay();
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return days[day];
  };

  const formatDate = (dateStr) => {
    const parts = dateStr.split('-');
    return `${parts[2]}/${parts[1]}`;
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ marginTop: '16px', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)' }}>Dự báo thời tiết</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Thời tiết Hà Nội trong 8 ngày tới</p>
      </div>

      <div className="card" style={{ padding: '8px 16px' }}>
        <div className="card-title" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '8px', marginBottom: '8px' }}>
          <Calendar size={14} />
          DỰ BÁO 8 NGÀY
        </div>

        <div>
          {daily.time.map((timeStr, idx) => {
            const isToday = idx === 0;
            const maxC = daily.temperature_2m_max[idx];
            const minC = daily.temperature_2m_min[idx];
            const max = settings.tempUnit === 'C' ? maxC : (maxC * 9/5) + 32;
            const min = settings.tempUnit === 'C' ? minC : (minC * 9/5) + 32;
            const prec = daily.precipitation_sum[idx];
            const info = getWeatherInfo(daily.weathercode[idx]);
            const DayIcon = info.icon;

            // Calculate range bar positions
            const leftPct = ((min - scaleMin) / scaleRange) * 100;
            const widthPct = ((max - min) / scaleRange) * 100;

            // For today, calculate where current temperature sits inside the today range
            let currentTempPct = -1;
            if (isToday) {
              const currentT = settings.tempUnit === 'C' ? currentTemp : (currentTemp * 9/5) + 32;
              currentTempPct = ((currentT - min) / (max - min)) * 100;
            }

            return (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '12px 0',
                  borderBottom: idx === daily.time.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                  fontSize: '14px'
                }}
              >
                {/* Day Name & Date */}
                <div style={{ width: '90px' }}>
                  <div style={{ fontWeight: isToday ? '700' : '500', color: isToday ? 'var(--text-primary)' : 'var(--text-primary)' }}>
                    {getDayName(timeStr, isToday)}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {formatDate(timeStr)}
                  </div>
                </div>

                {/* Weather Icon & Rain volume */}
                <div style={{ width: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <DayIcon size={20} style={{ color: info.color }} />
                  {prec > 0 && (
                    <span style={{ fontSize: '9px', color: 'var(--accent-color)', fontWeight: '700', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '1px' }}>
                      <CloudRain size={8} /> {prec.toFixed(1)}m
                    </span>
                  )}
                </div>

                {/* Min Temp */}
                <div style={{ width: '32px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: '500', paddingRight: '8px' }}>
                  {Math.round(min)}°
                </div>

                {/* Horizontal Range Bar Chart */}
                <div style={{ flex: 1, height: '4px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 'var(--radius-full)', position: 'relative', margin: '0 8px' }}>
                  <div 
                    style={{ 
                      position: 'absolute',
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                      height: '100%',
                      background: 'linear-gradient(to right, #3B82F6, #FBBF24)',
                      borderRadius: 'var(--radius-full)'
                    }} 
                  />
                  {/* Current temp indicator dot for today */}
                  {isToday && currentTempPct >= 0 && currentTempPct <= 100 && (
                    <div 
                      style={{ 
                        position: 'absolute',
                        left: `calc(${leftPct}% + (${widthPct}% * ${currentTempPct / 100}))`,
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#FFFFFF',
                        border: '2px solid var(--accent-color)',
                        borderRadius: '50%',
                        top: '-2px',
                        transform: 'translateX(-4px)',
                        boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)'
                      }}
                    />
                  )}
                </div>

                {/* Max Temp */}
                <div style={{ width: '32px', textAlign: 'left', color: 'var(--text-primary)', fontWeight: '600', paddingLeft: '8px' }}>
                  {Math.round(max)}°
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
