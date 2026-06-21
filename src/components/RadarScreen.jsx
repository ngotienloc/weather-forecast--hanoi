import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Play, Pause, MapPin, Loader2, RefreshCw } from 'lucide-react';

// Sub-component to fit the map to Northern Vietnam bounds
function MapBoundsController({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (map && bounds) {
      map.fitBounds(bounds);
    }
  }, [map, bounds]);
  return null;
}

// Custom pulsing blue dot icon for Hanoi
const hanoiIcon = L.divIcon({
  className: 'custom-hanoi-icon-container',
  html: `
    <div class="pulsing-dot-container">
      <div class="pulsing-dot-ring"></div>
      <div class="pulsing-dot-core"></div>
    </div>
  `,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

// Northern Vietnam bounds
const MAP_BOUNDS = [[20.0, 102.0], [24.5, 108.5]];
const HANOI_POS = [21.0274, 105.8988];

export default function RadarScreen() {
  const [radarData, setRadarData] = useState(null);
  const [frames, setFrames] = useState([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapMode, setMapMode] = useState('dark'); // 'dark' or 'satellite'
  
  const playIntervalRef = useRef(null);

  // Fetch RainViewer config
  const fetchRainViewerData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("https://api.rainviewer.com/public/weather-maps.json");
      if (!res.ok) throw new Error("Không thể kết nối máy chủ radar");
      const data = await res.json();
      
      if (data && data.radar && data.radar.past) {
        setRadarData(data);
        // Get the last 6 radar frames for animation
        const pastFrames = data.radar.past;
        const last6Frames = pastFrames.slice(Math.max(pastFrames.length - 6, 0));
        setFrames(last6Frames);
        setCurrentFrameIndex(last6Frames.length - 1); // Set to latest by default
      }
    } catch (err) {
      console.error(err);
      setError("Không thể tải bản đồ radar. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRainViewerData();
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, []);

  // Animation player effect
  useEffect(() => {
    if (isPlaying && frames.length > 0) {
      playIntervalRef.current = setInterval(() => {
        setCurrentFrameIndex((prevIndex) => (prevIndex + 1) % frames.length);
      }, 900); // 900ms per frame
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    }

    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, frames.length]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const formatFrameTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    // Format to GMT+7 time
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.3s ease-out', paddingBottom: '16px' }}>
      <div style={{ marginTop: '12px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>Bản đồ Radar</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Bản đồ mưa miền Bắc Việt Nam</p>
        </div>
        <button 
          onClick={fetchRainViewerData}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent-color)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
          title="Tải lại bản đồ"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Map Mode Selector */}
      <div className="segmented-control" style={{ marginBottom: '8px', marginTop: '2px' }}>
        <button 
          className={`segmented-control-btn ${mapMode === 'dark' ? 'active' : ''}`}
          onClick={() => setMapMode('dark')}
        >
          Radar (Tối)
        </button>
        <button 
          className={`segmented-control-btn ${mapMode === 'satellite' ? 'active' : ''}`}
          onClick={() => setMapMode('satellite')}
        >
          Radar (Vệ tinh)
        </button>
      </div>

      {loading ? (
        <div style={{ flex: 1, minHeight: '230px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--surface-color)', borderRadius: 'var(--radius-lg)' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent-color)', animation: 'spin 1.5s linear infinite' }} />
          <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>Đang chuẩn bị bản đồ radar...</p>
        </div>
      ) : error ? (
        <div style={{ flex: 1, minHeight: '230px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--surface-color)', borderRadius: 'var(--radius-lg)', padding: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#EF4444', marginBottom: '16px' }}>{error}</p>
          <button 
            onClick={fetchRainViewerData}
            style={{ 
              backgroundColor: 'var(--accent-color)', 
              color: 'var(--bg-color)', 
              border: 'none', 
              padding: '8px 16px', 
              borderRadius: 'var(--radius-md)', 
              fontWeight: '600',
              cursor: 'pointer' 
            }}
          >
            Thử lại
          </button>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', minHeight: '230px' }}>
          {/* Leaflet Map */}
          <MapContainer 
            style={{ width: '100%', height: '230px', borderRadius: 'var(--radius-lg)', zIndex: 10 }}
            zoom={7} 
            scrollWheelZoom={true}
            zoomControl={false}
            minZoom={5}
            maxZoom={12}
          >
            <MapBoundsController bounds={MAP_BOUNDS} />
            
            {/* Map Base Layers */}
            {mapMode === 'dark' && (
              <TileLayer
                attribution='&copy; OpenStreetMap contributors &copy; CARTO'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                maxZoom={12}
              />
            )}
            {mapMode === 'satellite' && (
              <TileLayer
                attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxZoom={12}
              />
            )}

            {/* RainViewer Radar Overlay layers */}
            {radarData && frames.map((frame, index) => (
              <TileLayer
                key={frame.time}
                url={`${radarData.host}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`}
                opacity={index === currentFrameIndex ? 0.70 : 0}
                zIndex={100 + index}
                maxNativeZoom={7}
                maxZoom={12}
              />
            ))}

            {/* Aeon Mall Long Bien marker */}
            <Marker position={HANOI_POS} icon={hanoiIcon}>
              <Popup>
                <div style={{ color: '#000', fontSize: '12px', fontWeight: '600' }}>Aeon Mall Long Biên</div>
              </Popup>
            </Marker>
          </MapContainer>

          {/* Animation Controls overlay bar */}
          <div style={{ 
            marginTop: '8px',
            backgroundColor: 'var(--surface-color)',
            padding: '10px 12px',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            zIndex: 20,
            border: '1px solid rgba(255, 255, 255, 0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              {/* Play Button */}
              <button 
                onClick={handlePlayPause}
                style={{ 
                  backgroundColor: 'var(--accent-color)',
                  color: 'var(--bg-color)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(56, 189, 248, 0.3)',
                  flexShrink: 0
                }}
              >
                {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" style={{ marginLeft: '2px' }} />}
              </button>

              {/* Time display & frame label */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Khung hình: {formatFrameTime(frames[currentFrameIndex]?.time)}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {isPlaying ? 'Đang chạy radar animation...' : 'Tạm dừng.'}
                </div>
              </div>

              {/* Legend scale */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontWeight: '600' }}>CƯỜNG ĐỘ</span>
                <div style={{ 
                  height: '5px', 
                  width: '60px', 
                  background: 'linear-gradient(to right, #4ade80, #facc15, #f97316, #ef4444)',
                  borderRadius: '3px'
                }} />
                <div style={{ display: 'flex', width: '60px', justifyContent: 'space-between', fontSize: '8px', color: 'var(--text-muted)', fontWeight: '600' }}>
                  <span>Nhẹ</span>
                  <span>Mạnh</span>
                </div>
              </div>
            </div>

            {/* Timeline scrubber bar */}
            <div style={{ display: 'flex', gap: '6px', padding: '4px 0' }}>
              {frames.map((frame, idx) => (
                <div 
                  key={frame.time}
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentFrameIndex(idx);
                  }}
                  style={{
                    flex: 1,
                    height: '6px',
                    backgroundColor: idx === currentFrameIndex 
                      ? 'var(--accent-color)' 
                      : idx < currentFrameIndex ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 'var(--radius-full)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: idx === currentFrameIndex ? '0 0 6px var(--accent-color)' : 'none'
                  }}
                  title={formatFrameTime(frame.time)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
