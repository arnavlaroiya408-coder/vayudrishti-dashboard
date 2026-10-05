// ==========================================
// 1. TELEMETRY DATA (JAIPUR URBAN CORE SECTOR)
// ==========================================
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

// ==========================================
// 2. CRYSTAL-CLEAR TACTICAL MAP INITIALIZATION
// ==========================================
let map;
function initMap() {
  const jaipurCentroid = [26.8550, 75.8100];
  map = L.map('map', {
    zoomControl: false,
    attributionControl: false
  }).setView(jaipurCentroid, 12); // Balanced clean sector view

  // Free OpenStreetMap Tiles (Zero API Key Required)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(map);

  telemetryData.lines.forEach(line => {
    const customIcon = L.divIcon({
      className: 'relative flex items-center justify-center',
      html: `
        <div class="relative w-7 h-7 flex items-center justify-center cursor-pointer">
          <div class="marker-ring w-7 h-7" style="background-color: ${line.color}55;"></div>
          <div class="w-3.5 h-3.5 rounded-full border-2 border-[#101419] z-10 shadow-lg" style="background-color: ${line.color}; box-shadow: 0 0 14px ${line.color};"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
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

// ==========================================
// 3. PIPELINE MATRIX RENDERING
// ==========================================
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

// ==========================================
// 4. PREDICTIVE CHARTS (CHART.JS)
// ==========================================
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

// ==========================================
// 5. MICRO HISTOGRAM TICKS
// ==========================================
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

// ==========================================
// 6. LEFT RAIL NAVIGATION CONTROLLER
// ==========================================
function switchNav(view) {
  playTacticalBeep(720, 'sine', 0.06);

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
    if (viewCommand) viewCommand.classList.remove('hidden');
    if (viewAnalytics) viewAnalytics.classList.add('hidden');
    if (viewDiagnostics) viewDiagnostics.classList.add('hidden');
    if (btnCommand) btnCommand.className = activeClass;
    if (badge) badge.innerText = "COMMAND_CONSOLE";
    if (map) setTimeout(() => map.invalidateSize(), 150);
  } else if (view === 'analytics') {
    if (viewCommand) viewCommand.classList.add('hidden');
    if (viewAnalytics) viewAnalytics.classList.remove('hidden');
    if (viewDiagnostics) viewDiagnostics.classList.add('hidden');
    if (btnAnalytics) btnAnalytics.className = activeClass;
    if (badge) badge.innerText = "VECTOR_ANALYTICS";
    setTimeout(() => initDeepAnalyticsChart(), 100);
  } else if (view === 'diagnostics') {
    if (viewCommand) viewCommand.classList.add('hidden');
    if (viewAnalytics) viewAnalytics.classList.add('hidden');
    if (viewDiagnostics) viewDiagnostics.classList.remove('hidden');
    if (btnDiagnostics) btnDiagnostics.className = activeClass;
    if (badge) badge.innerText = "TELEMETRY_STREAM";
  }
}

// ==========================================
// 7. WEB AUDIO API SYNTHESIZER
// ==========================================
let audioCtx = null;
function playTacticalBeep(freq = 600, type = 'sine', duration = 0.08) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

// ==========================================
// 8. SIMULATE EMERGENCY ANOMALY INJECTION
// ==========================================
let isAnomalyActive = false;
function triggerEmergencyAnomaly() {
  playTacticalBeep(320, 'sawtooth', 0.25);
  isAnomalyActive = true;

  const targetSpot = telemetryData.lines[0];
  targetSpot.aqi = 412;
  targetSpot.status = "CRITICAL HAZARD";
  targetSpot.stages[0].metric = "384.2 µg";
  targetSpot.stages[3].metric = "LOCKDOWN";

  renderPipelines();

  const termFeed = document.getElementById('live-terminal-feed');
  if (termFeed) {
    const alertEntry = document.createElement('p');
    alertEntry.className = 'text-[#FF4757] text-[11px] font-bold tracking-wide animate-pulse';
    alertEntry.innerText = `>> [CRITICAL ALERT] Rapid PM2.5 Inversion Spike Detected at Sitapura Node! Automated scrubbing triggered!`;
    termFeed.prepend(alertEntry);
  }

  // 6 seconds baad recovery
  setTimeout(() => {
    targetSpot.aqi = 218;
    targetSpot.status = "Hazardous";
    targetSpot.stages[0].metric = "142.5 µg";
    targetSpot.stages[3].metric = "CRITICAL";
    renderPipelines();
    playTacticalBeep(880, 'triangle', 0.15);
    isAnomalyActive = false;
  }, 6000);
}

// ==========================================
// 9. HIGH-TECH PRELOADER BOOT SEQUENCE
// ==========================================
function runPreloaderBoot() {
  const overlay = document.getElementById('preloader-overlay');
  const statusText = document.getElementById('boot-status-text');
  const progressFill = document.getElementById('boot-progress-fill');
  const pctVal = document.getElementById('boot-pct-val');

  if (!overlay) return;

  const steps = [
    { pct: 28, text: "> Linking Jaipur Sector-07 Sensor Mesh... [OK]" },
    { pct: 64, text: "> Syncing Sitapura, MI Road, Mansarovar Nodes... [OK]" },
    { pct: 92, text: "> Calibrating 48h AI Dispersion Tensors... [OK]" },
    { pct: 100, text: "> Telemetry Stream Synchronized. System Online." }
  ];

  let currentStep = 0;
  const interval = setInterval(() => {
    if (currentStep < steps.length) {
      const step = steps[currentStep];
      if (progressFill) progressFill.style.width = `${step.pct}%`;
      if (pctVal) pctVal.innerText = `${step.pct}%`;
      if (statusText) statusText.innerText = step.text;
      currentStep++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        overlay.classList.add('preloader-hidden');
      }, 350);
    }
  }, 260);
}

// ==========================================
// 10. REALTIME CONTINUOUS INGESTION LOOP
// ==========================================
function startLiveCommand() {
  const pingEl = document.getElementById('sys-ping');
  const clockEl = document.getElementById('log-clock');
  const termFeed = document.getElementById('live-terminal-feed');

  setInterval(() => {
    if (!isAnomalyActive) {
      telemetryData.lines.forEach(l => {
        const flux = 1 + (Math.random() * 0.04 - 0.02);
        l.aqi = Math.round(l.aqi * flux);
      });
      renderPipelines();
    }

    const newPing = Math.floor(12 + Math.random() * 5);
    if (pingEl) pingEl.innerText = `${newPing}ms`;

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    if (clockEl) clockEl.innerText = timeStr;

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

// ==========================================
// 11. MOUSE SPOTLIGHT TRACKER
// ==========================================
document.addEventListener('mousemove', (e) => {
  document.querySelectorAll('.cmd-card').forEach((card) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  });
});

// ==========================================
// 12. DOM LOAD TRIGGER
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  initMap();
  renderPipelines();
  initTimeCurveChart();
  renderHistogramTicks();
  startLiveCommand();
  runPreloaderBoot();
});