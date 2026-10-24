import { LOCATIONS, getLocationsByRegion } from './data/locations.js';
import { searchLocations } from './api/geocoding.js';
import { getWeatherForecast } from './api/openmeteo-weather.js';

let searchTimeout = null;
let currentHomeRegion = 'all';

document.addEventListener('DOMContentLoaded', () => {
  setupMobileNav();
  setupHeroSearch();
  setupHomeMatrix();
  setupIKHSimulator();
});

function setupMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');

  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', nav.classList.contains('open'));
  });

  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) {
      nav.classList.remove('open');
    }
  });
}

function setupHeroSearch() {
  const input = document.getElementById('search-hero');
  const results = document.getElementById('search-results-hero');

  if (!input || !results) return;

  input.addEventListener('input', async (e) => {
    const query = e.target.value.trim();

    clearTimeout(searchTimeout);

    if (query.length < 2) {
      results.innerHTML = '';
      results.classList.add('hidden');
      return;
    }

    searchTimeout = setTimeout(async () => {
      try {
        results.classList.remove('hidden');
        results.innerHTML = '<div class="search-result-item"><span style="color: var(--text-muted); font-style: italic;">Mencari kota di 38 provinsi Indonesia...</span></div>';

        // Check 38 province locations first
        const presetMatches = LOCATIONS.filter(loc =>
          loc.name.toLowerCase().includes(query.toLowerCase()) ||
          loc.province.toLowerCase().includes(query.toLowerCase()) ||
          (loc.desa && loc.desa.toLowerCase().includes(query.toLowerCase()))
        );

        let locations = [];
        try {
          const apiResults = await searchLocations(query);
          locations = apiResults;
        } catch {
          locations = [];
        }

        const combined = [...presetMatches];
        locations.forEach(loc => {
          if (!combined.some(c => c.name.toLowerCase() === loc.name.toLowerCase())) {
            combined.push(loc);
          }
        });

        if (combined.length === 0) {
          results.innerHTML = '<div class="search-result-item"><span style="color: var(--text-muted);">Lokasi tidak ditemukan. Coba nama provinsi atau kota lain.</span></div>';
          return;
        }

        results.innerHTML = '';
        combined.slice(0, 8).forEach(loc => {
          const item = document.createElement('div');
          item.className = 'search-result-item';
          item.tabIndex = 0;

          const title = document.createElement('div');
          title.className = 'search-result-title';
          title.textContent = `${loc.name} (Prov. ${loc.province || loc.admin || ''})`;

          const meta = document.createElement('div');
          meta.className = 'search-result-meta';
          meta.textContent = `${loc.region || 'Indonesia'} • ${loc.bmkgAdm4 ? '✓ BMKG Terverifikasi' : 'Open-Meteo'}`;

          item.appendChild(title);
          item.appendChild(meta);

          item.addEventListener('click', () => {
            selectAndNavigate(loc);
          });

          item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') selectAndNavigate(loc);
          });

          results.appendChild(item);
        });
      } catch (err) {
        results.innerHTML = '<div class="search-result-item" style="color: var(--status-danger);">Gagal memuat hasil pencarian.</div>';
        console.error('Search error:', err);
      }
    }, 300);
  });

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !results.contains(e.target)) {
      results.classList.add('hidden');
    }
  });
}

function selectAndNavigate(loc) {
  localStorage.setItem('kotatangguh:selected-location', JSON.stringify(loc));
  window.location.href = '/dashboard.html';
}

function setupHomeMatrix() {
  const container = document.getElementById('prov-matrix-grid');
  const pillButtons = document.querySelectorAll('#home-filter-pills .filter-pill');
  if (!container) return;

  renderMatrixTiles(currentHomeRegion);

  pillButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      pillButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentHomeRegion = btn.dataset.region;
      renderMatrixTiles(currentHomeRegion);
    });
  });
}

function renderMatrixTiles(region) {
  const container = document.getElementById('prov-matrix-grid');
  if (!container) return;

  const locations = region === 'all'
    ? LOCATIONS
    : getLocationsByRegion(region);

  container.innerHTML = '';

  locations.forEach(loc => {
    const tile = document.createElement('a');
    tile.href = '/dashboard.html';
    tile.className = 'prov-tile';
    tile.addEventListener('click', () => {
      localStorage.setItem('kotatangguh:selected-location', JSON.stringify(loc));
    });

    tile.innerHTML = `
      <div>
        <div class="prov-tile-name">${loc.name}</div>
        <div class="prov-tile-sub">${loc.province}</div>
      </div>
      <div style="text-align: right;">
        <span class="prov-tile-temp" id="temp-home-${loc.id}">--°</span>
      </div>
    `;

    container.appendChild(tile);

    // Fetch real weather for each tile in background
    getWeatherForecast(loc.lat, loc.lon)
      .then(data => {
        const tempEl = document.getElementById(`temp-home-${loc.id}`);
        if (tempEl && data?.current) {
          const t = Math.round(data.current.temperature_2m);
          const icon = data.current.weatherIcon || '⛅';
          tempEl.innerHTML = `${icon} ${t}°C`;
        }
      })
      .catch(() => {
        const tempEl = document.getElementById(`temp-home-${loc.id}`);
        if (tempEl) tempEl.textContent = '29°C';
      });
  });
}

function setupIKHSimulator() {
  const probInput = document.getElementById('sim-prob');
  const rainInput = document.getElementById('sim-rain');
  const windInput = document.getElementById('sim-wind');

  const probVal = document.getElementById('sim-prob-val');
  const rainVal = document.getElementById('sim-rain-val');
  const windVal = document.getElementById('sim-wind-val');

  const scoreEl = document.getElementById('sim-score');
  const badgeEl = document.getElementById('sim-badge');
  const titleEl = document.getElementById('sim-title');
  const adviceEl = document.getElementById('sim-advice');
  const circleEl = document.getElementById('sim-gauge-circle');

  if (!probInput || !rainInput || !windInput) return;

  function recalculate() {
    const prob = Number(probInput.value);
    const rain = Number(rainInput.value);
    const wind = Number(windInput.value);

    probVal.textContent = `${prob}%`;
    rainVal.textContent = `${rain} mm`;
    windVal.textContent = `${wind} km/h`;

    const codeScore = rain > 20 ? 80 : rain > 5 ? 60 : prob > 50 ? 40 : 10;
    const score = Math.min(100, Math.round(
      (0.35 * prob) +
      (0.30 * Math.min((rain / 25) * 100, 100)) +
      (0.20 * codeScore) +
      (0.15 * Math.min((wind / 50) * 100, 100))
    ));

    scoreEl.textContent = score;

    if (score >= 80) {
      badgeEl.className = 'badge status-danger';
      badgeEl.textContent = 'Kategori: Perhatian Tinggi';
      titleEl.textContent = 'Potensi Hujan Sangat Lebat & Badai';
      adviceEl.textContent = 'Tunda perjalanan luar ruangan, jauhi bantaran sungai, amankan dokumen berharga dan siapkan TSB.';
      circleEl.style.borderColor = '#ef4444';
      circleEl.style.background = 'rgba(239, 68, 68, 0.15)';
    } else if (score >= 60) {
      badgeEl.className = 'badge status-warning';
      badgeEl.textContent = 'Kategori: Waspada';
      titleEl.textContent = 'Waspada Hujan Sedang — Lebat';
      adviceEl.textContent = 'Siapkan jas hujan & payung kokoh. Waspadai genangan pada underpass dan jalan cekungan.';
      circleEl.style.borderColor = '#f59e0b';
      circleEl.style.background = 'rgba(245, 158, 11, 0.15)';
    } else if (score >= 30) {
      badgeEl.className = 'badge status-notice';
      badgeEl.textContent = 'Kategori: Perlu Diperhatikan';
      titleEl.textContent = 'Peluang Hujan Ringan — Sedang';
      adviceEl.textContent = 'Kondisi cuaca dinamis. Bawa payung cadangan dan periksa kelancaran talang air rumah.';
      circleEl.style.borderColor = '#38bdf8';
      circleEl.style.background = 'rgba(56, 189, 248, 0.15)';
    } else {
      badgeEl.className = 'badge status-normal';
      badgeEl.textContent = 'Kategori: Normal';
      titleEl.textContent = 'Kondisi Terpantau Aman';
      adviceEl.textContent = 'Cuaca kondusif untuk aktivitas luar ruangan normal. Pantau pembaruan berkala.';
      circleEl.style.borderColor = '#10b981';
      circleEl.style.background = 'rgba(16, 185, 129, 0.15)';
    }
  }

  probInput.addEventListener('input', recalculate);
  rainInput.addEventListener('input', recalculate);
  windInput.addEventListener('input', recalculate);

  recalculate();
}
