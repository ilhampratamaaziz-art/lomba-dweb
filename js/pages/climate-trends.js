import { LOCATIONS, getLocationById } from '../data/locations.js';
import { getHistoricalWeather } from '../api/openmeteo-weather.js';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

let currentCity = LOCATIONS[0]; // Jakarta Pusat default
let tempChart = null;
let rainChart = null;
let currentDataset = null;

document.addEventListener('DOMContentLoaded', () => {
  setupMobileNav();
  setupCitySelector();
  setupDatePresets();
  setupCustomDateRange();
  setupExportCSV();
  loadDataForPreset(30); // Default to 30 days
});

function setupMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
  }
}

function setupCitySelector() {
  const select = document.getElementById('select-city');
  if (!select) return;

  // Check if user came from another page with a selected location
  const saved = localStorage.getItem('kotatangguh:selected-location');
  if (saved) {
    try {
      const loc = JSON.parse(saved);
      if (loc && loc.id) {
        select.value = loc.id;
        currentCity = getLocationById(loc.id) || LOCATIONS[0];
      }
    } catch (e) {
      console.warn('Failed to parse saved location in trends:', e);
    }
  }

  select.addEventListener('change', (e) => {
    currentCity = getLocationById(e.target.value) || LOCATIONS[0];
    const activePreset = document.querySelector('.date-presets-row .filter-pill.active');
    const days = activePreset ? Number(activePreset.dataset.days) : 30;
    loadDataForPreset(days);
  });
}

function setupDatePresets() {
  const pills = document.querySelectorAll('.date-presets-row .filter-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const days = Number(pill.dataset.days);
      loadDataForPreset(days);
    });
  });
}

function setupCustomDateRange() {
  const startInput = document.getElementById('date-start');
  const endInput = document.getElementById('date-end');
  const btn = document.getElementById('btn-custom-date');

  // Archive data is available up to 2-5 days ago
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 3);
  const maxDateStr = yesterday.toISOString().split('T')[0];

  if (startInput && endInput) {
    startInput.max = maxDateStr;
    endInput.max = maxDateStr;
  }

  if (btn) {
    btn.addEventListener('click', () => {
      const start = startInput.value;
      const end = endInput.value;
      if (!start || !end) {
        alert('Silakan pilih tanggal mulai dan tanggal selesai.');
        return;
      }
      if (new Date(start) > new Date(end)) {
        alert('Tanggal mulai tidak boleh lebih besar dari tanggal selesai.');
        return;
      }

      // Remove active from preset pills
      document.querySelectorAll('.date-presets-row .filter-pill').forEach(p => p.classList.remove('active'));
      fetchAndRender(start, end);
    });
  }
}

function loadDataForPreset(days) {
  const end = new Date();
  end.setDate(end.getDate() - 3); // archive API safe delay

  const start = new Date(end);
  start.setDate(start.getDate() - days);

  const startStr = start.toISOString().split('T')[0];
  const endStr = end.toISOString().split('T')[0];

  const startInput = document.getElementById('date-start');
  const endInput = document.getElementById('date-end');
  if (startInput) startInput.value = startStr;
  if (endInput) endInput.value = endStr;

  fetchAndRender(startStr, endStr);
}

async function fetchAndRender(startDate, endDate) {
  setLoadingState(true);

  try {
    const data = await getHistoricalWeather(currentCity.lat, currentCity.lon, startDate, endDate);
    currentDataset = data;
    renderStatistics(data);
    renderTempChart(data);
    renderRainChart(data);
    setLoadingState(false);
  } catch (err) {
    console.error('Failed to load historical weather:', err);
    alert('Gagal memuat arsip cuaca untuk rentang tanggal tersebut. Mencoba rentang standar...');
    setLoadingState(false);
  }
}

function setLoadingState(isLoading) {
  const statMean = document.getElementById('stat-mean-temp');
  if (statMean && isLoading) statMean.textContent = '...';
}

function renderStatistics(data) {
  const daily = data.daily;
  if (!daily || !daily.time) return;

  const temps = daily.temperature_2m_mean.filter(t => t !== null && !isNaN(t));
  const rains = daily.precipitation_sum.filter(r => r !== null && !isNaN(r));

  // Calculations
  const meanTemp = temps.length > 0 ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1) : '--';
  const maxTemp = daily.temperature_2m_max ? Math.max(...daily.temperature_2m_max.filter(t => t !== null)).toFixed(1) : '--';
  const totalRain = rains.length > 0 ? rains.reduce((a, b) => a + b, 0).toFixed(1) : '0';
  const maxRain = rains.length > 0 ? Math.max(...rains).toFixed(1) : '0';
  const rainDays = rains.filter(r => r >= 1.0).length;

  document.getElementById('stat-mean-temp').textContent = meanTemp;
  document.getElementById('stat-max-temp').textContent = maxTemp;
  document.getElementById('stat-total-rain').textContent = totalRain;
  document.getElementById('stat-max-rain').textContent = maxRain;
  document.getElementById('stat-rain-days').textContent = rainDays;
}

function renderTempChart(data) {
  const canvas = document.getElementById('chart-temp-trend');
  if (!canvas) return;

  if (tempChart) tempChart.destroy();

  const daily = data.daily;
  const labels = daily.time.map(t => {
    const d = new Date(t);
    return `${d.getDate()} ${d.toLocaleString('id-ID', { month: 'short' })}`;
  });

  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(14, 165, 233, 0.4)');
  gradient.addColorStop(1, 'rgba(14, 165, 233, 0.0)');

  tempChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Suhu Rata-rata Harian (°C)',
          data: daily.temperature_2m_mean,
          borderColor: '#38bdf8',
          borderWidth: 2.5,
          backgroundColor: gradient,
          fill: true,
          tension: 0.3,
          pointRadius: labels.length > 60 ? 0 : 3,
          pointHoverRadius: 6,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#0ea5e9',
        },
        {
          label: 'Suhu Maksimum (°C)',
          data: daily.temperature_2m_max,
          borderColor: '#f87171',
          borderWidth: 1.5,
          borderDash: [4, 4],
          fill: false,
          tension: 0.3,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          labels: { color: '#cbd5e1', font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 } },
        },
        tooltip: {
          backgroundColor: 'rgba(12, 19, 34, 0.95)',
          titleColor: '#ffffff',
          bodyColor: '#cbd5e1',
          borderColor: 'rgba(148, 163, 184, 0.2)',
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(148, 163, 184, 0.08)' },
          ticks: { color: '#94a3b8', font: { family: "'JetBrains Mono', monospace", size: 10 } },
        },
        y: {
          grid: { color: 'rgba(148, 163, 184, 0.08)' },
          ticks: { color: '#38bdf8', callback: v => `${v}°C` },
          title: { display: true, text: 'Temperatur (°C)', color: '#38bdf8' },
        },
      },
    },
  });
}

function renderRainChart(data) {
  const canvas = document.getElementById('chart-rain-trend');
  if (!canvas) return;

  if (rainChart) rainChart.destroy();

  const daily = data.daily;
  const labels = daily.time.map(t => {
    const d = new Date(t);
    return `${d.getDate()} ${d.toLocaleString('id-ID', { month: 'short' })}`;
  });

  const rains = daily.precipitation_sum || [];
  // Color code bars: red for heavy (>20mm), amber for moderate (>5mm), cyan for light
  const barColors = rains.map(r => {
    if (r >= 20) return '#ef4444';
    if (r >= 5) return '#f59e0b';
    return '#0ea5e9';
  });

  rainChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Curah Hujan Harian (mm)',
          data: rains,
          backgroundColor: barColors,
          borderRadius: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { color: '#cbd5e1', font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 } },
        },
        tooltip: {
          backgroundColor: 'rgba(12, 19, 34, 0.95)',
          titleColor: '#ffffff',
          bodyColor: '#cbd5e1',
          borderColor: 'rgba(148, 163, 184, 0.2)',
          borderWidth: 1,
          callbacks: {
            afterLabel: (ctx) => {
              const val = ctx.parsed.y;
              if (val >= 20) return 'Klasifikasi: Hujan Sangat Lebat';
              if (val >= 5) return 'Klasifikasi: Hujan Sedang';
              if (val > 0) return 'Klasifikasi: Hujan Ringan';
              return 'Kering (Tanpa Hujan)';
            }
          }
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(148, 163, 184, 0.08)' },
          ticks: { color: '#94a3b8', font: { family: "'JetBrains Mono', monospace", size: 10 } },
        },
        y: {
          grid: { color: 'rgba(148, 163, 184, 0.08)' },
          ticks: { color: '#fbbf24', callback: v => `${v}mm` },
          title: { display: true, text: 'Akumulasi Presipitasi (mm)', color: '#fbbf24' },
        },
      },
    },
  });
}

function setupExportCSV() {
  const btn = document.getElementById('btn-export-csv');
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (!currentDataset || !currentDataset.daily) {
      alert('Tidak ada data yang dapat diekspor. Muat data terlebih dahulu.');
      return;
    }

    const daily = currentDataset.daily;
    let csv = 'Tanggal,Kota,Provinsi,Suhu_Rata2_C,Suhu_Maks_C,Curah_Hujan_mm\n';

    daily.time.forEach((t, i) => {
      const date = t;
      const city = `"${currentCity.name}"`;
      const prov = `"${currentCity.province}"`;
      const tempMean = daily.temperature_2m_mean[i] ?? '';
      const tempMax = daily.temperature_2m_max ? daily.temperature_2m_max[i] ?? '' : '';
      const rain = daily.precipitation_sum[i] ?? 0;

      csv += `${date},${city},${prov},${tempMean},${tempMax},${rain}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kotatangguh-iklim-${currentCity.id}-${daily.time[0]}-sd-${daily.time[daily.time.length - 1]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  });
}
