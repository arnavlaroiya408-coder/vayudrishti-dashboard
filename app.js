// 1. Mock JSON Data strictly as per guidelines
const telemetryData = {
  project: "VayuDrishti",
  region: "Jaipur Urban Sector",
  timestamp: new Date().toISOString(),
  system_status: {
    telemetry_stream: "ACTIVE",
    active_nodes: 3,
    ping_ms: 14,
    buffer_health: "99.8%"
  },
  hotspots: [
    {
      id: "JPR-STP-01",
      location_name: "Sitapura Industrial Area",
      zone_type: "Industrial Zone",
      coordinates: { lat: 26.7712, lng: 75.8573 },
      metrics: { aqi: 218, status: "Severe Hazard", pm2_5: 142.5, pm10: 260.1, no2: 48.2, temp_celsius: 31.4, humidity_pct: 42, wind_speed_kmh: 12.8 }
    },
    {
      id: "JPR-MIR-02",
      location_name: "MI Road (Central Jaipur)",
      zone_type: "Commercial Corridor",
      coordinates: { lat: 26.9154, lng: 75.8130 },
      metrics: { aqi: 145, status: "Moderate Risk", pm2_5: 68.1, pm10: 130.4, no2: 31.0, temp_celsius: 32.1, humidity_pct: 38, wind_speed_kmh: 9.4 }
    },
    {
      id: "JPR-MSR-03",
      location_name: "Mansarovar Sector 7",
      zone_type: "Residential Eco Hub",
      coordinates: { lat: 26.8521, lng: 75.7644 },
      metrics: { aqi: 42, status: "Optimal Green", pm2_5: 14.2, pm10: 38.0, no2: 12.5, temp_celsius: 30.2, humidity_pct: 45, wind_speed_kmh: 15.2 }
    }
  ]
};

// 2. Leaflet Map Initialization centered at Jaipur
let map;
function initMap() {
  const jaipurCenter = [26.9124, 75.7873];
  map = L.map('map', {
    zoomControl: false,
    attributionControl: false
  }).setView(jaipurCenter, 12);

  // Soft Boho styled map tiles (CartoDB Positron)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 18,
  }).addTo(map);

  // Render Custom Pulsing Hotspot Markers
  telemetryData.hotspots.forEach(spot => {
    let colorClass = 'bg-emeraldLive';
    let ringColor = 'rgba(16, 185, 129, 0.4)';
    
    if (spot.metrics.aqi > 200) {
      colorClass = 'bg-roseHazard';
      ringColor = 'rgba(239, 68, 68, 0.4)';
    } else if (spot.metrics.aqi > 100) {
      colorClass = 'bg-amberWarn';
      ringColor = 'rgba(245, 158, 11, 0.4)';
    }

    const customIcon = L.divIcon({
      className: 'relative flex items-center justify-center',
      html: `
        <div class="relative w-8 h-8 flex items-center justify-center">
          <div class="marker-ring w-8 h-8" style="background-color: ${ringColor};"></div>
          <div class="w-3.5 h-3.5 ${colorClass} rounded-full border-2 border-white shadow-md z-10"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const marker = L.marker([spot.coordinates.lat, spot.coordinates.lng], { icon: customIcon }).addTo(map);
    marker.bindPopup(`
      <div class="font-sans text-xs">
        <p class="font-bold text-deepMoss">${spot.location_name}</p>
        <p class="text-slate-600">AQI: <strong>${spot.metrics.aqi}</strong> (${spot.metrics.status})</p>
      </div>
    `);
  });
}

// 3. Render Hotspot Cards in Right Panel
function renderHotspots() {
  const container = document.getElementById('hotspots-list');
  container.innerHTML = telemetryData.hotspots.map(spot => {
    const isHazard = spot.metrics.aqi > 200;
    const isModerate = spot.metrics.aqi > 100 && spot.metrics.aqi <= 200;
    const badgeColor = isHazard ? 'bg-roseHazard/10 text-roseHazard border-roseHazard/20' : 
                       isModerate ? 'bg-amberWarn/10 text-amberWarn border-amberWarn/20' : 
                       'bg-emeraldLive/10 text-emeraldLive border-emeraldLive/20';

    return `
      <div class="glass-panel p-4 rounded-xl space-y-3 transition-all hover:translate-y-[-2px] border">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-bold text-sm text-slate-800">${spot.location_name}</h3>
            <p class="text-[11px] text-slate-500 font-mono">${spot.id} • ${spot.zone_type}</p>
          </div>
          <span class="px-2 py-0.5 rounded text-[11px] font-bold font-mono border ${badgeColor}">
            AQI ${spot.metrics.aqi}
          </span>
        </div>
        <div class="grid grid-cols-4 gap-2 text-center font-mono text-[10px]">
          <div class="bg-mutedSand/40 p-1.5 rounded"><p class="text-slate-500">PM2.5</p><p class="font-bold">${spot.metrics.pm2_5}</p></div>
          <div class="bg-mutedSand/40 p-1.5 rounded"><p class="text-slate-500">PM10</p><p class="font-bold">${spot.metrics.pm10}</p></div>
          <div class="bg-mutedSand/40 p-1.5 rounded"><p class="text-slate-500">TEMP</p><p class="font-bold">${spot.metrics.temp_celsius}°C</p></div>
          <div class="bg-mutedSand/40 p-1.5 rounded"><p class="text-slate-500">WIND</p><p class="font-bold">${spot.metrics.wind_speed_kmh}km/h</p></div>
        </div>
      </div>
    `;
  }).join('');
}

// 4. Tab Switching logic (Zero layout shift)
function switchTab(tab) {
  const telemetryView = document.getElementById('view-telemetry');
  const forecastView = document.getElementById('view-forecast');
  const btnTelemetry = document.getElementById('tab-telemetry-btn');
  const btnForecast = document.getElementById('tab-forecast-btn');

  if (tab === 'telemetry') {
    telemetryView.classList.remove('hidden');
    forecastView.classList.add('hidden');
    btnTelemetry.className = "px-4 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all bg-white text-deepMoss shadow-sm";
    btnForecast.className = "px-4 py-1.5 rounded-lg text-xs md:text-sm font-medium text-slate-600 hover:text-deepMoss transition-all";
    if (map) setTimeout(() => map.invalidateSize(), 100);
  } else {
    telemetryView.classList.add('hidden');
    forecastView.classList.remove('hidden');
    btnForecast.className = "px-4 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all bg-white text-deepMoss shadow-sm";
    btnTelemetry.className = "px-4 py-1.5 rounded-lg text-xs md:text-sm font-medium text-slate-600 hover:text-deepMoss transition-all";
  }
}

// Window load init
window.addEventListener('DOMContentLoaded', () => {
  initMap();
  renderHotspots();
});