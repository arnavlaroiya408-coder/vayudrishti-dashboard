// ==========================================
// 1. TELEMETRY DATA & TIMEFRAME DATASETS
// ==========================================
const telemetryData = {
  project: "VayuDrishti",
  region: "Jaipur Urban Core Sector",
  timestamp: new Date().toISOString(),
  currentTimeframe: 'realtime',
  lines: [
    {
      lineId: "Line 1",
      name: "Sitapura Industrial Area",
      aqi: 218,
      status: "Elevated Hazard",
      color: "#FB7185", // Soft Rose Coral
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
      color: "#FBBF24", // Warm Amber
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
      color: "#10E79D", // Spring Mint
      stages: [
        { label: "Eco Flora Array", state: "active", metric: "14.2 µg" },
        { label: "PM10 Scrubber", state: "active", metric: "38.0 µg" },
        { label: "Thermal Influx", state: "active", metric: "30.2°C" },
        { label: "Zone Green", state: "optimal", metric: "CLEAR" }
      ],
      coords: [26.8521, 75.7644]
    }
  ],
  datasets: {
    realtime: {
      title: "Realtime Dispersion Trajectory",
      desc: "Live 20-minute rolling vector ingestion stream",
      labels: ["-20m", "-15m", "-10m", "-05m", "Now", "+05m", "+10m", "+15m", "+20m"],
      timelineLabels: ["-20m", "-10m", "Now", "+10m", "+20m"],
      data: [120, 126, 138, 142, 145, 140, 134, 128, 122],
      ticksCount: 36
    },
    "24h": {
      title: "24h Dispersion Trajectory",
      desc: "Diurnal atmospheric particulate drift & sunlight inversion",
      labels: ["00:00", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00", "24:00"],
      timelineLabels: ["00:00", "06:00", "12:00", "18:00", "24:00"],
      data: [85, 92, 148, 192, 218, 185, 160, 132, 98],
      ticksCount: 24
    },
    "48h": {
      title: "48h Dispersion Trajectory",
      desc: "Neural dispersion tensor & predictive trajectory curve",
      labels: ["+00h", "+06h", "+12h", "+18h", "+24h", "+30h", "+36h", "+42h", "+48h"],
      timelineLabels: ["+00h", "+12h", "+24h", "+36h", "+48h"],
      data: [110, 135, 195, 218, 170, 140, 95, 65, 42],
      ticksCount: 48
    }
  }
};

// ==========================================
// 2. TIMEFRAME SWITCHER HANDLER
// ==========================================
function setTimeframe(tf) {
  playTacticalBeep(680, 'sine', 0.05);
  telemetryData.currentTimeframe = tf;

  const btnRealtime = document.getElementById('btn-tf-realtime');
  const btn24h = document.getElementById('btn-tf-24h');
  const btn48h = document.getElementById('btn-tf-48h');

  const activeClass = "px-3 py-1.5 rounded-xl bg-white/10 text-white font-semibold shadow-sm transition-all";
  const inactiveClass = "px-3 py-1.5 rounded-xl text-slate-400 hover:text-white transition-all";

  if (btnRealtime) btnRealtime.className = (tf === 'realtime') ? activeClass : inactiveClass;
  if (btn24h) btn24h.className = (tf === '24h') ? activeClass : inactiveClass;
  if (btn48h) btn48h.className = (tf === '48h') ? activeClass : inactiveClass;

  const selectedData = telemetryData.datasets[tf];
  if (selectedData) {
    const titleEl = document.getElementById('trajectory-chart-title');
    const descEl = document.getElementById('trajectory-chart-desc');
    const timelineEl = document.getElementById('histo-timeline-labels');

    if (titleEl) titleEl.innerText = selectedData.title;
    if (descEl) descEl.innerText = selectedData.desc;
    if (timelineEl) {
      timelineEl.innerHTML = selectedData.timelineLabels.map(l => `<span>${l}</span>`).join('');
    }

    if (timeChart) {
      timeChart.data.labels = selectedData.labels;
      timeChart.data.datasets[0].data = selectedData.data;
      timeChart.update('active');
    }

    renderHistogramTicks(selectedData.ticksCount);
  }
}

// ==========================================
// 3. TACTICAL SECTOR MAP INITIALIZATION
// ==========================================
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
          <div class="marker-ring w-8 h-8" style="background-color: ${line.color}35;"></div>
          <div class="w-3 h-3 rounded-full border-2 border-[#080B10] z-10 shadow-lg" style="background-color: ${line.color}; box-shadow: 0 0 16px ${line.color};"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const marker = L.marker(line.coords, { icon: customIcon }).addTo(map);
    marker.bindPopup(`
      <div style="background:#111827; color:#fff; padding:8px 12px; border-radius:12px; font-family:'Plus Jakarta Sans', sans-serif; font-size:11px; border:1px solid rgba(255,255,255,0.08); box-shadow:0 12px 25px rgba(0,0,0,0.5);">
        <strong style="color:${line.color}; font-size:12px;">${line.name}</strong><br/>
        <div style="margin-top:4px; display:flex; gap:8px;">
          <span>AQI: <b>${line.aqi}</b></span>
          <span style="color:${line.color}; font-weight:600;">[${line.status}]</span>
        </div>
      </div>
    `);
  });

  setTimeout(() => { if (map) map.invalidateSize(); }, 200);
  setTimeout(() => { if (map) map.invalidateSize(); }, 600);
}

// ==========================================
// 4. PIPELINE MATRIX RENDERING
// ==========================================
function renderPipelines() {
  const container = document.getElementById('pipeline-container');
  if (!container) return;
  container.innerHTML = telemetryData.lines.map(line => {
    return `
      <div class="bg-white/[0.02] p-4 rounded-2xl border border-white/5 space-y-3 hover:border-emerald-500/30 transition-all">
        <div class="flex justify-between items-center text-xs">
          <div class="flex items-center gap-2.5">
            <span class="px-2.5 py-1 rounded-xl bg-white/5 text-slate-300 font-mono text-[11px] font-bold border border-white/5">${line.lineId}</span>
            <span class="text-white font-bold tracking-tight text-sm">${line.name}</span>
          </div>
          <div class="flex items-center gap-2 font-bold px-3 py-1 rounded-full text-xs" style="color: ${line.color}; background-color: ${line.color}15; border: 1px solid ${line.color}30;">
            <span class="w-2 h-2 rounded-full animate-pulse" style="background-color: ${line.color};"></span>
            AQI ${line.aqi} • ${line.status}
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
          ${line.stages.map(st => `
            <div class="metric-tile bg-white/[0.02] p-3 rounded-2xl border border-white/5 hover:border-white/15 transition-all">
              <div class="flex justify-between items-center text-[10px] text-slate-400 mb-1 font-medium">
                <span>${st.label}</span>
                <span class="w-1.5 h-1.5 rounded-full status-pip" style="background-color: ${line.color}; color:${line.color};"></span>
              </div>
              <div class="text-sm font-extrabold text-white font-mono tracking-tight">${st.metric}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
// 5. CHARTS INITIALIZATION (CHART.JS)
// ==========================================
let timeChart;
function initTimeCurveChart() {
  const ctx = document.getElementById('timeCurveChart');
  if (!ctx) return;

  const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 140);
  gradient.addColorStop(0, 'rgba(16, 231, 157, 0.35)');
  gradient.addColorStop(0.7, 'rgba(6, 182, 212, 0.08)');
  gradient.addColorStop(1, 'rgba(16, 231, 157, 0.0)');

  const activeDataset = telemetryData.datasets[telemetryData.currentTimeframe];

  timeChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: activeDataset.labels,
      datasets: [{
        label: 'Dispersion Vector',
        data: activeDataset.data,
        borderColor: '#10E79D',
        backgroundColor: gradient,
        borderWidth: 2.8,
        fill: true,
        tension: 0.45,
        pointBackgroundColor: '#080B10',
        pointBorderColor: '#10E79D',
        pointBorderWidth: 2,
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
          grid: { color: 'rgba(255, 255, 255, 0.04)' },
          ticks: { color: '#64748B', font: { family: 'Plus Jakarta Sans', size: 10 } }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#64748B', font: { family: 'Plus Jakarta Sans', size: 10 } }
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
  gradient.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
  gradient.addColorStop(1, 'rgba(6, 182, 212, 0.0)');

  deepChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: telemetryData.datasets["48h"].labels,
      datasets: [{
        label: 'Full Vector Dispersion AQI',
        data: telemetryData.datasets["48h"].data,
        borderColor: '#06B6D4',
        backgroundColor: gradient,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10E79D',
        pointBorderColor: '#fff',
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.04)' },
          ticks: { color: '#94A3B8', font: { family: 'Plus Jakarta Sans' } }
        },
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.04)' },
          ticks: { color: '#94A3B8', font: { family: 'Plus Jakarta Sans' } }
        }
      }
    }
  });
}

// ==========================================
// 6. MICRO ACTIVITY BARS
// ==========================================
function renderHistogramTicks(count = 36) {
  const bar = document.getElementById('histo-tick-bar');
  if (!bar) return;

  let html = '';
  for (let i = 0; i < count; i++) {
    const isSpike = (i % 7 === 0);
    const color = isSpike ? '#FB7185' : '#10E79D';
    const height = Math.floor(6 + Math.random() * 16);
    html += `<div class="histo-bar" style="height: ${height}px; background-color: ${color};"></div>`;
  }
  bar.innerHTML = html;
}

// ==========================================
// 7. NAVIGATION SWITCHER
// ==========================================
function switchNav(view) {
  playTacticalBeep(720, 'sine', 0.06);

  const viewCommand = document.getElementById('view-command-console');
  const viewAnalytics = document.getElementById('view-analytics');
  const viewDiagnostics = document.getElementById('view-diagnostics');

  const btnCommand = document.getElementById('nav-btn-command');
  const btnAnalytics = document.getElementById('nav-btn-analytics');
  const btnDiagnostics = document.getElementById('nav-btn-diagnostics');

  [btnCommand, btnAnalytics, btnDiagnostics].forEach(btn => {
    if (btn) btn.className = "w-11 h-11 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-all";
  });

  const activeClass = "w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-md shadow-emerald-500/10 transition-all";

  if (view === 'command') {
    if (viewCommand) viewCommand.classList.remove('hidden');
    if (viewAnalytics) viewAnalytics.classList.add('hidden');
    if (viewDiagnostics) viewDiagnostics.classList.add('hidden');
    if (btnCommand) btnCommand.className = activeClass;
    if (map) setTimeout(() => map.invalidateSize(), 150);
  } else if (view === 'analytics') {
    if (viewCommand) viewCommand.classList.add('hidden');
    if (viewAnalytics) viewAnalytics.classList.remove('hidden');
    if (viewDiagnostics) viewDiagnostics.classList.add('hidden');
    if (btnAnalytics) btnAnalytics.className = activeClass;
    setTimeout(() => initDeepAnalyticsChart(), 100);
  } else if (view === 'diagnostics') {
    if (viewCommand) viewCommand.classList.add('hidden');
    if (viewAnalytics) viewAnalytics.classList.add('hidden');
    if (viewDiagnostics) viewDiagnostics.classList.remove('hidden');
    if (btnDiagnostics) btnDiagnostics.className = activeClass;
  }
}

// ==========================================
// 8. WEB AUDIO SYNTHESIZER
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
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

// ==========================================
// 9. CRISIS SIMULATION TRIGGER
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
    alertEntry.className = 'text-[#FB7185] text-xs font-semibold animate-pulse';
    alertEntry.innerText = `>> [ALERT] Rapid PM2.5 Inversion Spike Detected at Sitapura Node. Automatic mitigation initialized.`;
    termFeed.prepend(alertEntry);
  }

  setTimeout(() => {
    targetSpot.aqi = 218;
    targetSpot.status = "Elevated Hazard";
    targetSpot.stages[0].metric = "142.5 µg";
    targetSpot.stages[3].metric = "CRITICAL";
    renderPipelines();
    playTacticalBeep(880, 'triangle', 0.15);
    isAnomalyActive = false;
  }, 6000);
}

// ==========================================
// 10. BOOT SEQUENCE
// ==========================================
function runPreloaderBoot() {
  const overlay = document.getElementById('preloader-overlay');
  const statusText = document.getElementById('boot-status-text');
  const progressFill = document.getElementById('boot-progress-fill');
  const pctVal = document.getElementById('boot-pct-val');

  if (!overlay) return;

  const steps = [
    { pct: 30, text: "Linking Jaipur Sector-07 Sensor Mesh..." },
    { pct: 68, text: "Calibrating Sitapura, MI Road, Mansarovar Nodes..." },
    { pct: 90, text: "Synthesizing Atmospheric Dispersion Tensors..." },
    { pct: 100, text: "Telemetry Stream Synchronized." }
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
        if (map) map.invalidateSize();
      }, 350);
    }
  }, 240);
}

// ==========================================
// 11. REALTIME STREAMING LOOP
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

    if (termFeed) {
      const randomLine = telemetryData.lines[Math.floor(Math.random() * telemetryData.lines.length)];
      const entry = document.createElement('p');
      entry.className = 'text-emerald-400 text-xs leading-relaxed font-mono';
      entry.innerText = `> [${timeStr}] Sync Packet: ${randomLine.lineId} (${randomLine.name}) -> Ingested AQI ${randomLine.aqi} [${newPing}ms]`;
      termFeed.prepend(entry);
      if (termFeed.children.length > 25) termFeed.removeChild(termFeed.lastChild);
    }
  }, 3500);
}

// ==========================================
// 12. MOUSE TRACKER & INIT
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

window.addEventListener('resize', () => {
  if (map) map.invalidateSize();
});

window.addEventListener('DOMContentLoaded', () => {
  initMap();
  renderPipelines();
  initTimeCurveChart();
  renderHistogramTicks(36);
  startLiveCommand();
  runPreloaderBoot();
});