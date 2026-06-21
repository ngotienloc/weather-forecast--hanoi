import React from 'react';
import { AlertCircle, CloudRain, ShieldCheck } from 'lucide-react';

export default function RainAlertScreen({ weatherData }) {
  if (!weatherData) return null;

  const current = weatherData.current_weather;
  const currentHourTimeStr = current.time;
  const hourly = weatherData.hourly;

  // Find index of current hour
  const hourlyTimeArray = hourly.time;
  let currentHourIndex = hourlyTimeArray.findIndex(t => t.startsWith(currentHourTimeStr.substring(0, 13)));
  if (currentHourIndex === -1) currentHourIndex = 0;

  // Compile next 2 hours of rain probabilities (4 intervals of 30 minutes)
  const prob0 = hourly.precipitation_probability[currentHourIndex] || 0;
  const prob1 = hourly.precipitation_probability[currentHourIndex + 1] || 0;
  const prob2 = hourly.precipitation_probability[currentHourIndex + 2] || 0;

  const maxProbability = Math.max(prob0, prob1, prob2);

  const next2Hours = [
    { time: '0 - 30 phút', prob: prob0 },
    { time: '30 - 60 phút', prob: Math.round((prob0 + prob1) / 2) },
    { time: '60 - 90 phút', prob: prob1 },
    { time: '90 - 120 phút', prob: Math.round((prob1 + prob2) / 2) }
  ];

  // Generate localized status
  let alertTitle = 'Thời tiết khô ráo';
  let alertDesc = 'Không tìm thấy khả năng mưa trong 2 giờ tới. Thích hợp cho các hoạt động ngoài trời.';
  let alertColor = 'var(--color-green)';
  let AlertIcon = ShieldCheck;

  if (maxProbability > 60) {
    alertTitle = 'Cảnh báo khả năng có mưa';
    alertDesc = `Cảnh báo: Khả năng mưa lên tới ${maxProbability}% trong 2 giờ tới. Hãy mang theo ô hoặc áo mưa khi di chuyển ngoài đường.`;
    alertColor = '#EF4444';
    AlertIcon = AlertCircle;
  } else if (maxProbability > 20) {
    alertTitle = 'Có thể có mưa nhẹ rải rác';
    alertDesc = `Dự báo có mưa nhẹ rải rác ở vài thời điểm trong 2 giờ tới với tỷ lệ cao nhất khoảng ${maxProbability}%. Hãy chuẩn bị trước khi ra ngoài.`;
    alertColor = '#FBBF24';
    AlertIcon = AlertCircle;
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ marginTop: '16px', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)' }}>Báo cáo lượng mưa</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Cập nhật lượng mưa thời gian thực tại Aeon Mall Long Biên</p>
      </div>

      {/* Main Alert Card */}
      <div className="card" style={{ border: `1px solid ${alertColor}33`, background: `linear-gradient(to bottom, #111827, ${alertColor}08)` }}>
        <div className="card-title" style={{ color: alertColor }}>
          <AlertIcon size={16} />
          {alertTitle}
        </div>
        <p style={{ fontSize: '14px', lineHeight: '20px', color: 'var(--text-primary)', marginBottom: '8px' }}>
          {alertDesc}
        </p>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
          <CloudRain size={12} style={{ color: 'var(--accent-color)' }} />
          Lượng mưa tích lũy hôm nay: {weatherData.daily.precipitation_sum[0].toFixed(1)} mm
        </div>
      </div>

      {/* 2 Hour Probability List */}
      <div className="card">
        <div className="card-title">DỰ BÁO LƯỢNG MƯA 2 GIỜ TỚI</div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Biểu đồ tỷ lệ phần trăm cơ hội xuất hiện mưa ngắn hạn (trong 2 giờ tới)
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
          {next2Hours.map((item, idx) => {
            const isNow = idx === 0;
            // Bar color based on probability
            let barColor = 'rgba(255, 255, 255, 0.1)';
            let textColor = 'var(--text-muted)';
            
            if (item.prob > 60) {
              barColor = '#EF4444';
              textColor = '#EF4444';
            } else if (item.prob > 20) {
              barColor = 'var(--accent-color)';
              textColor = 'var(--accent-color)';
            }

            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', fontSize: '13px' }}>
                {/* Time */}
                <div style={{ width: '90px', fontWeight: isNow ? '700' : '400', color: isNow ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {item.time}
                </div>

                {/* Percentage display */}
                <div style={{ width: '36px', textAlign: 'right', fontWeight: '600', color: textColor, paddingRight: '8px' }}>
                  {item.prob}%
                </div>

                {/* Horizontal mini bar chart */}
                <div style={{ flex: 1, height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-full)', position: 'relative' }}>
                  <div 
                    style={{ 
                      width: `${item.prob}%`, 
                      height: '100%', 
                      backgroundColor: barColor, 
                      borderRadius: 'var(--radius-full)',
                      boxShadow: item.prob > 60 ? '0 0 6px rgba(239, 68, 68, 0.3)' : 'none',
                      transition: 'width 0.5s ease-out'
                    }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
