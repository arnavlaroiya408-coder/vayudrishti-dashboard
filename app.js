// 1. Telemetry Data
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
      metrics: { aqi: 218, status: "Hazardous", pm2_5: 142.5, pm10: 260.1, no2: 48.2, temp_celsius: 31.4, humidity_pct: 42, wind_speed_kmh: 12.8 }
    },
    {
      id: "JPR-MIR-02",
      location_name: "MI Road (Central Jaipur)",
      zone_type: "Commercial Corridor",
      coordinates: { lat: 26.9154, lng: 75.8130 },
      metrics: { aqi: 145, status: "Moderate", pm2_5: 68.1, pm10: 130.4, no2: 31.0, temp_celsius: 32.1, humidity_pct: 38, wind_speed_kmh: 9.4 }
    },
    {
      id: "JPR-MSR-03",
      location_name: "Mansarovar Sector 7",
      zone_type: "Residential Eco Hub",
      coordinates: { lat: 26.8521, lng: 75.7644 },
      metrics: { aqi: 42, status: "Optimal Green", pm2_5: 14.2, pm10: 38.0, no2: 12.5, temp_celsius: 30.2, humidity_pct: 45, wind_speed_kmh: 15.2 }
    }
  ],
  forecast_48h: [
    { interval: "+06h", avg_aqi: 120 },
    { interval: "+12h", avg_aqi: 185 },
    { interval: "+18h", avg_aqi: 210 },
    { interval: "+24h", avg_aqi: 160 },
    { interval: "+36h", avg_aqi: 95 },
    { interval: "+48h", avg_aqi: 48 }
  ]
};

// 2. Leaflet Dark Map Initialization
let map;
let markerInstances = [];

function initMap() {
  const jaipurCentroid = [26.8550, 75.8100];
  map = L.map('map', {
    zoomControl: false,
    attributionControl: false
  }).setView(jaipurCentroid, 11);

  // Free OpenStreetMap Tiles (Zero API Key required)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(map);

  renderMarkers();

  // Attach Radar sweep cone
  const mapContainer = document.getElementById('map');
  if (mapContainer && !document.querySelector('.radar-sweep-cone')) {
    const radar = document.createElement('div');
    radar.className = 'radar-sweep-cone';
    mapContainer.appendChild(radar);
  }
}

function renderMarkers() {
  markerInstances.forEach(m => map.removeLayer(m));
  markerInstances = [];

  telemetryData.hotspots.forEach(spot => {
    let pinColor = '#10B981';
    let ringBg = 'rgba(16, 185, 129, 0.45)';
    
    if (spot.metrics.aqi > 200) {
      pinColor = '#EF4444';
      ringBg = 'rgba(239, 68, 68, 0.45)';
    } else if (spot.metrics.aqi > 100) {
      pinColor = '#F59E0B';
      ringBg = 'rgba(245, 158, 11, 0.45)';
    }

    const customIcon = L.divIcon({
      className: 'relative flex items-center justify-center',
      html: `
        <div class="relative w-8 h-8 flex items-center justify-center">
          <div class="marker-ring w-8 h-8" style="background-color: ${ringBg};"></div>
          <div class="w-3.5 h-3.5 rounded-full border-2 border-slate-900 shadow-lg z-10" style="background-color: ${pinColor}; box-shadow: 0 0 14px ${pinColor};"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const marker = L.marker([spot.coordinates.lat, spot.coordinates.lng], { icon: customIcon }).addTo(map);
    marker.bindPopup(`
      <div style="background: #0f172a; color: #fff; padding: 6px; border-radius: 6px; font-family: sans-serif; font-size: 11px;">
        <strong style="color: ${pinColor};">${spot.location_name}</strong><br/>
        AQI: <b>${spot.metrics.aqi}</b> (${spot.metrics.status})
      </div>
    `);
    markerInstances.push(marker);
  });
}

// 3. Render Cards with Nixtio Micro-metrics & Status Pills
function renderHotspots() {
  const container = document.getElementById('hotspots-list');
  container.innerHTML = telemetryData.hotspots.map(spot => {
    const isHazard = spot.metrics.aqi > 200;
    const isModerate = spot.metrics.aqi > 100 && spot.metrics.aqi <= 200;
    
    const badgeBg = isHazard ? 'bg-red-500/10 text-red-400 border-red-500/30' : 
                    isModerate ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

    return `
      <div class="glass-panel p-4 space-y-3.5 border border-white/5 hover:border-emerald-500/30 transition-all">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-bold text-sm text-white tracking-wide">${spot.location_name}</h3>
            <p class="text-[11px] text-slate-400 font-mono">${spot.id} • ${spot.zone_type}</p>
          </div>
          <div class="px-2.5 py-1 rounded-full text-xs font-bold font-mono border ${badgeBg}">
            AQI ${spot.metrics.aqi}
          </div>
        </div>
        
        <div class="grid grid-cols-4 gap-2 text-center font-mono text-[10px]">
          <div class="bg-slate-900/60 border border-white/5 p-2 rounded-xl">
            <p class="text-slate-400">PM2.5</p>
            <p class="font-bold text-slate-200 mt-0.5">${spot.metrics.pm2_5}</p>
          </div>
          <div class="bg-slate-900/60 border border-white/5 p-2 rounded-xl">
            <p class="text-slate-400">PM10</p>
            <p class="font-bold text-slate-200 mt-0.5">${spot.metrics.pm10}</p>
          </div>
          <div class="bg-slate-900/60 border border-white/5 p-2 rounded-xl">
            <p class="text-slate-400">TEMP</p>
            <p class="font-bold text-slate-200 mt-0.5">${spot.metrics.temp_celsius}°C</p>
          </div>
          <div class="bg-slate-900/60 border border-white/5 p-2 rounded-xl">
            <p class="text-slate-400">WIND</p>
            <p class="font-bold text-slate-200 mt-0.5">${spot.metrics.wind_speed_kmh}k/h</p>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// 4. Futuristic Neon Forecast Chart (Chart.js)
let forecastChartInstance = null;
function initForecastChart() {
  const ctx = document.getElementById('forecastChart');
  if (!ctx) return;

  const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
  gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

  forecastChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: telemetryData.forecast_48h.map(f => f.interval),
      datasets: [{
        label: 'Predictive AQI Trend',
        data: telemetryData.forecast_48h.map(f => f.avg_aqi),
        borderColor: '#10B981',
        backgroundColor: gradient,
        borderWidth: 3,
        fill: true,
        tension: 0.45,
        pointBackgroundColor: '#06B6D4',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#64748B', font: { family: 'JetBrains Mono' } }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#64748B', font: { family: 'JetBrains Mono' } }
        }
      }
    }
  });
}

// 5. Tab Navigation
function switchTab(tab) {
  const telemetryView = document.getElementById('view-telemetry');
  const forecastView = document.getElementById('view-forecast');
  const btnTelemetry = document.getElementById('tab-telemetry-btn');
  const btnForecast = document.getElementById('tab-forecast-btn');

  if (tab === 'telemetry') {
    telemetryView.classList.remove('hidden');
    forecastView.classList.add('hidden');
    btnTelemetry.className = "px-5 py-2 rounded-full bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/25 transition-all";
    btnForecast.className = "px-5 py-2 rounded-full text-slate-400 hover:text-white transition-all";
    if (map) setTimeout(() => map.invalidateSize(), 150);
  } else {
    telemetryView.classList.add('hidden');
    forecastView.classList.remove('hidden');
    btnForecast.className = "px-5 py-2 rounded-full bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/25 transition-all";
    btnTelemetry.className = "px-5 py-2 rounded-full text-slate-400 hover:text-white transition-all";
    if (!forecastChartInstance) initForecastChart();
  }
}

// 6. Live Streaming Simulation
function startLiveTelemetry() {
  const logsContainer = document.getElementById('terminal-logs');
  const pingEl = document.getElementById('sys-ping');

  setInterval(() => {
    telemetryData.hotspots.forEach(spot => {
      const flux = 1 + (Math.random() * 0.04 - 0.02);
      spot.metrics.aqi = Math.round(spot.metrics.aqi * flux);
      spot.metrics.pm2_5 = parseFloat((spot.metrics.pm2_5 * flux).toFixed(1));
    });

    const newPing = Math.floor(12 + Math.random() * 6);
    if (pingEl) pingEl.innerText = `${newPing}ms`;

    renderHotspots();

    if (logsContainer) {
      const randomSpot = telemetryData.hotspots[Math.floor(Math.random() * telemetryData.hotspots.length)];
      const logLine = document.createElement('p');
      logLine.className = 'log-enter text-emerald-400 font-mono text-[11px] leading-relaxed';
      logLine.innerText = `> [SYNC] Node ${randomSpot.id} packet ingested at ${newPing}ms (AQI ${randomSpot.metrics.aqi})`;
      logsContainer.prepend(logLine);
      if (logsContainer.children.length > 3) logsContainer.removeChild(logsContainer.lastChild);
    }
  }, 3500);
}

window.addEventListener('DOMContentLoaded', () => {
  initMap();
  renderHotspots();
  startLiveTelemetry();
});