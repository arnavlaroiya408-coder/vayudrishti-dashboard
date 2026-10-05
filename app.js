// 1. Telemetry Data
const telemetryData = {
  project: "VayuDrishti",
  region: "Jaipur Urban Sector",
  timestamp: new Date().toISOString(),
  lines: [
    {
      lineId: "Line 1",
      name: "Sitapura Industrial Area",
      aqi: 218,
      status: "Hazardous",
      color: "#FF4757",
      stages: [
        { label: "Aerosol Feed", state: "active", metric: "142.5 µg" },
        { label: "PM10 Filter", state: "warning", metric: "260.1 µg" },
        { label: "Dispersion ML", state: "active", metric: "31.4°C" },
        { label: "Threshold Trigger", state: "hazard", metric: "CRITICAL" }
      ],
      coords: [26.7712, 75.8573]
    },
    {
      lineId: "Line 2",
      name: "MI Road Commercial Corridor",
      aqi: 145,
      status: "Moderate",
      color: "#FF9F1C",
      stages: [
        { label: "Urban Traffic", state: "active", metric: "68.1 µg" },
        { label: "NO2 Adsorption", state: "active", metric: "31.0 ppm" },
        { label: "Wind Drift", state: "active", metric: "9.4 km/h" },
        { label: "Public Alert", state: "nominal", metric: "CAUTION" }
      ],
      coords: [26.9154, 75.8130]
    },
    {
      lineId: "Line 3",
      name: "Mansarovar Sector 7",
      aqi: 42,
      status: "Optimal",
      color: "#3BDB67",
      stages: [
        { label: "Eco Flora Array", state: "active", metric: "14.2 µg" },
        { label: "PM10 Scrubber", state: "active", metric: "38.0 µg" },
        { label: "Thermal Influx", state: "active", metric: "30.2°C" },
        { label: "Zone Green", state: "optimal", metric: "CLEAR" }
      ],
      coords: [26.8521, 75.7644]
    }
  ],
  forecast_48h: [
    { interval: "+00h", aqi: 110 },
    { interval: "+06h", aqi: 135 },
    { interval: "+12h", aqi: 195 },
    { interval: "+18h", aqi: 218 },
    { interval: "+24h", aqi: 170 },
    { interval: "+30h", aqi: 140 },
    { interval: "+36h", aqi: 95 },
    { interval: "+42h", aqi: 65 },
    { interval: "+48h", aqi: 42 }
  ]
};

// 2. Leaflet Tactical Map (Free OpenStreetMap Tiles, Zero API Key)
let map;
function initMap() {
  const jaipurCentroid = [26.8550, 75.8100];
  map = L.map('map', {
    zoomControl: false,
    attributionControl: false
  }).setView(jaipurCentroid, 11);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(map);

  telemetryData.lines.forEach(line => {
    const customIcon = L.divIcon({
      className: 'relative flex items-center justify-center',
      html: `
        <div class="relative w-8 h-8 flex items-center justify-center cursor-pointer">
          <div class="marker-ring w-8 h-8" style="background-color: ${line.color}66;"></div>
          <div class="w-3.5 h-3.5 rounded-full border-2 border-[#101419] z-10 shadow-lg" style="background-color: ${line.color}; box-shadow: 0 0 12px ${line.color};"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const marker = L.marker(line.coords, { icon: customIcon }).addTo(map);
    marker.bindPopup(`
      <div style="background:#181E26; color:#fff; padding:6px 10px; border-radius:6px; font-family:monospace; font-size:11px; border:1px solid #242D3A;">
        <strong style="color:${line.color};">${line.name}</strong><br/>
        AQI: <b>${line.aqi}</b> (${line.status})
      </div>
    `);
  });
}

// 3. Render Multi-Line Pipeline Matrix
function renderPipelines() {
  const container = document.getElementById('pipeline-container');
  if (!container) return;
  container.innerHTML = telemetryData.lines.map(line => {
    return `
      <div class="bg-[#12171E] p-3.5 rounded-xl border border-[#242D3A] space-y-3">
        <div class="flex justify-between items-center text-xs font-mono">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded bg-[#181E26] text-white font-bold border border-[#242D3A]">${line.lineId}</span>
            <span class="text-slate-300 font-bold tracking-wide">${line.name}</span>
          </div>
          <div class="flex items-center gap-2 font-bold" style="color: ${line.color}">
            <span class="w-2 h-2 rounded-full flow-pulse" style="background-color: ${line.color}"></span>
            AQI ${line.aqi} • ${line.status}
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          ${line.stages.map(st => `
            <div class="bg-[#181E26] p-2.5 rounded-lg border border-[#242D3A] relative hover:border-[#384659] transition-all">
              <div class="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
                <span>${st.label}</span>
                <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${line.color}"></span>
              </div>
              <div class="text-sm font-bold text-white font-mono">${st.metric}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

// 4. Time Curve Chart
let timeChart;
function initTimeCurveChart() {
  const ctx = document.getElementById('timeCurveChart');
  if (!ctx) return;

  const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 140);
  gradient.addColorStop(0, 'rgba(59, 219, 103, 0.45)');
  gradient.addColorStop(1, 'rgba(59, 219, 103, 0.02)');

  timeChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: telemetryData.forecast_48h.map(f => f.interval),
      datasets: [{
        label: 'Dispersion Vector',
        data: telemetryData.forecast_48h.map(f => f.aqi),
        borderColor: '#3BDB67',
        backgroundColor: gradient,
        borderWidth: 2.5,
        fill: true,
        tension: 0.45,
        pointBackgroundColor: '#00D2D3',
        pointBorderColor: '#fff',
        pointBorderWidth: 1.5,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#64748B', font: { family: 'JetBrains Mono', size: 9 } }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#64748B', font: { family: 'JetBrains Mono', size: 9 } }
        }
      }
    }
  });
}

// 5. Deep Analytics Chart for View 2
let deepChart;
function initDeepAnalyticsChart() {
  const ctx = document.getElementById('deepAnalyticsChart');
  if (!ctx || deepChart) return;

  const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 360);
  gradient.addColorStop(0, 'rgba(0, 210, 211, 0.4)');
  gradient.addColorStop(1, 'rgba(0, 210, 211, 0.0)');

  deepChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: telemetryData.forecast_48h.map(f => f.interval),
      datasets: [{
        label: 'Full Vector Dispersion AQI',
        data: telemetryData.forecast_48h.map(f => f.aqi),
        borderColor: '#00D2D3',
        backgroundColor: gradient,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3BDB67',
        pointBorderColor: '#fff',
        pointRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94A3B8', font: { family: 'JetBrains Mono' } }
        },
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94A3B8', font: { family: 'JetBrains Mono' } }
        }
      }
    }
  });
}

// 6. Micro Histogram Ticks
function renderHistogramTicks() {
  const bar = document.getElementById('histo-tick-bar');
  if (!bar) return;

  let html = '';
  for (let i = 0; i < 48; i++) {
    const isRed = (i >= 16 && i <= 24);
    const color = isRed ? '#FF4757' : '#3BDB67';
    const height = Math.floor(6 + Math.random() * 16);
    html += `<div class="histo-bar" style="height: ${height}px; background-color: ${color};"></div>`;
  }
  bar.innerHTML = html;
}

// 7. Left Rail Navigation Switcher
function switchNav(view) {
  const viewCommand = document.getElementById('view-command-console');
  const viewAnalytics = document.getElementById('view-analytics');
  const viewDiagnostics = document.getElementById('view-diagnostics');
  const badge = document.getElementById('active-view-badge');

  const btnCommand = document.getElementById('nav-btn-command');
  const btnAnalytics = document.getElementById('nav-btn-analytics');
  const btnDiagnostics = document.getElementById('nav-btn-diagnostics');

  [btnCommand, btnAnalytics, btnDiagnostics].forEach(btn => {
    if (btn) btn.className = "w-10 h-10 rounded-lg text-slate-400 hover:text-white hover:bg-[#181E26] flex items-center justify-center border border-transparent transition-all";
  });

  const activeClass = "w-10 h-10 rounded-lg bg-[#181E26] text-[#3BDB67] flex items-center justify-center border border-[#3BDB67]/40 shadow-lg shadow-emerald-500/10 transition-all";

  if (view === 'command') {
    viewCommand.classList.remove('hidden');
    viewAnalytics.classList.add('hidden');
    viewDiagnostics.classList.add('hidden');
    btnCommand.className = activeClass;
    if (badge) badge.innerText = "COMMAND_CONSOLE";
    if (map) setTimeout(() => map.invalidateSize(), 150);
  } else if (view === 'analytics') {
    viewCommand.classList.add('hidden');
    viewAnalytics.classList.remove('hidden');
    viewDiagnostics.classList.add('hidden');
    btnAnalytics.className = activeClass;
    if (badge) badge.innerText = "VECTOR_ANALYTICS";
    setTimeout(() => initDeepAnalyticsChart(), 100);
  } else if (view === 'diagnostics') {
    viewCommand.classList.add('hidden');
    viewAnalytics.classList.add('hidden');
    viewDiagnostics.classList.remove('hidden');
    btnDiagnostics.className = activeClass;
    if (badge) badge.innerText = "TELEMETRY_STREAM";
  }
}

// 8. Realtime Ingestion Loop
function startLiveCommand() {
  const pingEl = document.getElementById('sys-ping');
  const clockEl = document.getElementById('log-clock');
  const termFeed = document.getElementById('live-terminal-feed');

  setInterval(() => {
    telemetryData.lines.forEach(l => {
      const flux = 1 + (Math.random() * 0.04 - 0.02);
      l.aqi = Math.round(l.aqi * flux);
    });

    const newPing = Math.floor(12 + Math.random() * 5);
    if (pingEl) pingEl.innerText = `${newPing}ms`;

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    if (clockEl) clockEl.innerText = timeStr;

    renderPipelines();
    renderHistogramTicks();

    if (termFeed) {
      const randomLine = telemetryData.lines[Math.floor(Math.random() * telemetryData.lines.length)];
      const entry = document.createElement('p');
      entry.className = 'text-[#3BDB67] text-[11px] leading-relaxed';
      entry.innerText = `> [${timeStr}] Packet Sync: ${randomLine.lineId} (${randomLine.name}) -> Ingested AQI ${randomLine.aqi} [Latency: ${newPing}ms]`;
      termFeed.prepend(entry);
      if (termFeed.children.length > 25) termFeed.removeChild(termFeed.lastChild);
    }
  }, 3500);
}

window.addEventListener('DOMContentLoaded', () => {
  initMap();
  renderPipelines();
  initTimeCurveChart();
  renderHistogramTicks();
  startLiveCommand();
});