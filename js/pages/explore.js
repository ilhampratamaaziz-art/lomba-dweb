import { LOCATIONS, getLocationsByRegion } from '../data/locations.js';
import { getWeatherForecast } from '../api/openmeteo-weather.js';

let map = null;
let currentBaseLayer = null;
let satelliteLayer = null;
let darkLayerGroup = null;
let markers = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  setupMobileNav();
  initMap();
  setupLayerSwitcher();
  setupFilterPills();
  renderCityGrid();
});

function setupMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
  }
}

function initMap() {
  if (!window.L) {
    console.error('Leaflet library not loaded');
    return;
  }

  // Centered on the Indonesian Archipelago
  map = L.map('map', {
    center: [-2.2, 118.0],
    zoom: 5,
    minZoom: 4,
    maxZoom: 16,
    scrollWheelZoom: true,
  });

  // 1. High-Resolution Esri World Imagery (Earth Satellite - Completely Free & Open)
  satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Citra Satelit &copy; Esri &mdash; NASA, USGS, ESA, Earth Observatory',
    maxZoom: 19,
  });

  // 2. High-Legibility Esri Dark Gray Canvas (Requires NO API key, ZERO watermark)
  const darkBase = L.tileLayer('https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Peta Vektor &copy; Esri, DeLorme, NAVTEQ',
    maxZoom: 16,
  });

  const darkLabels = L.tileLayer('https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 16,
  });

  darkLayerGroup = L.layerGroup([darkBase, darkLabels]);

  // Default to High-Res Earth Satellite
  satelliteLayer.addTo(map);
  currentBaseLayer = satelliteLayer;

  loadAllMarkers();
}

function setupLayerSwitcher() {
  const satBtn = document.getElementById('layer-satellite');
  const darkBtn = document.getElementById('layer-dark');

  if (!satBtn || !darkBtn) return;

  satBtn.addEventListener('click', () => {
    if (currentBaseLayer === satelliteLayer) return;
    map.removeLayer(darkLayerGroup);
    satelliteLayer.addTo(map);
    currentBaseLayer = satelliteLayer;
    satBtn.classList.add('active');
    darkBtn.classList.remove('active');
  });

  darkBtn.addEventListener('click', () => {
    if (currentBaseLayer === darkLayerGroup) return;
    map.removeLayer(satelliteLayer);
    darkLayerGroup.addTo(map);
    currentBaseLayer = darkLayerGroup;
    darkBtn.classList.add('active');
    satBtn.classList.remove('active');
  });
}

function loadAllMarkers() {
  // Clear previous markers
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  const filteredLocations = currentFilter === 'all' 
    ? LOCATIONS 
    : getLocationsByRegion(currentFilter);

  filteredLocations.forEach(loc => {
    // Custom Professional DivIcon (No Emojis)
    const customIcon = L.divIcon({
      className: 'custom-leaflet-icon-wrapper',
      html: `
        <div class="custom-city-pin" id="pin-${loc.id}">
          <span style="width: 7px; height: 7px; border-radius: 50%; background: #38bdf8; display: inline-block; box-shadow: 0 0 6px #38bdf8; flex-shrink: 0;"></span>
          <span style="letter-spacing: -0.01em;">${loc.name}</span>
          <span class="mono" id="pin-temp-${loc.id}" style="color: #34d399; margin-left: 3px; font-weight: 700;">--°</span>
        </div>
      `,
      iconSize: [120, 28],
      iconAnchor: [60, 14],
    });

    const marker = L.marker([loc.lat, loc.lon], { icon: customIcon }).addTo(map);

    // Popup Content (Clean typography, zero emoji slop)
    const popupContent = `
      <div style="min-width: 230px; font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px;">
          <h4 style="margin: 0; font-size: 1.05rem; font-weight: 800; color: #ffffff;">${loc.name}</h4>
          <span style="font-size: 0.7rem; color: #38bdf8; font-weight: 700; text-transform: uppercase;">${loc.region}</span>
        </div>
        <div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 8px;">
          Provinsi ${loc.province} ${loc.desa ? '• Kel. ' + loc.desa : ''}
        </div>
        <p style="font-size: 0.8rem; color: #cbd5e1; line-height: 1.45; margin-bottom: 10px;">
          ${loc.description}
        </p>
        <div style="background: rgba(14, 165, 233, 0.12); border: 1px solid rgba(14, 165, 233, 0.3); border-radius: 6px; padding: 6px 10px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.75rem; color: #cbd5e1;">Prakiraan Langsung:</span>
          <span id="popup-temp-${loc.id}" style="font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #38bdf8; font-size: 0.95rem;">Memuat...</span>
        </div>
        <div style="display: flex; gap: 6px;">
          <button id="btn-goto-${loc.id}" style="flex: 1; padding: 7px 12px; background: linear-gradient(135deg, #0ea5e9, #0284c7); color: white; border: none; border-radius: 6px; font-size: 0.8rem; font-weight: 700; cursor: pointer;">
            Buka Dashboard Provinsi →
          </button>
        </div>
      </div>
    `;

    marker.bindPopup(popupContent);

    marker.on('popupopen', () => {
      const gotoBtn = document.getElementById(`btn-goto-${loc.id}`);
      if (gotoBtn) {
        gotoBtn.onclick = () => {
          localStorage.setItem('kotatangguh:selected-location', JSON.stringify(loc));
          window.location.href = '/dashboard.html';
        };
      }

      // Fetch popup temperature
      getWeatherForecast(loc.lat, loc.lon).then(d => {
        const pTemp = document.getElementById(`popup-temp-${loc.id}`);
        if (pTemp && d?.current) {
          const t = Math.round(d.current.temperature_2m);
          pTemp.textContent = `${t}°C (${d.current.weatherDesc || 'Berawan'})`;
        }
      }).catch(() => {});
    });

    markers.push(marker);

    // Fetch temp for pin label
    getWeatherForecast(loc.lat, loc.lon).then(d => {
      const pinTemp = document.getElementById(`pin-temp-${loc.id}`);
      if (pinTemp && d?.current) {
        pinTemp.textContent = `${Math.round(d.current.temperature_2m)}°C`;
      }
    }).catch(() => {});
  });
}

function setupFilterPills() {
  const pills = document.querySelectorAll('.filter-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      currentFilter = pill.dataset.region;
      loadAllMarkers();
      renderCityGrid();

      // Pan map smoothly to region center
      const regionCoords = {
        'all': { center: [-2.2, 118.0], zoom: 5 },
        'Sumatera': { center: [-0.5, 102.0], zoom: 6 },
        'Jawa': { center: [-7.2, 110.0], zoom: 7 },
        'Bali & Nusa Tenggara': { center: [-8.8, 118.5], zoom: 7 },
        'Kalimantan': { center: [-0.5, 114.5], zoom: 6 },
        'Sulawesi': { center: [-2.0, 121.0], zoom: 6 },
        'Maluku': { center: [-2.5, 128.5], zoom: 6 },
        'Papua': { center: [-4.0, 137.0], zoom: 6 },
      };

      const target = regionCoords[currentFilter] || regionCoords.all;
      map.flyTo(target.center, target.zoom, { duration: 1.2 });
    });
  });
}

function renderCityGrid() {
  const container = document.getElementById('explore-city-grid');
  const countBadge = document.getElementById('matrix-count-badge');
  if (!container) return;

  const filtered = currentFilter === 'all' 
    ? LOCATIONS 
    : getLocationsByRegion(currentFilter);

  if (countBadge) {
    countBadge.textContent = `Menampilkan ${filtered.length} Provinsi (${currentFilter === 'all' ? 'Seluruh Nusantara' : currentFilter})`;
  }

  container.innerHTML = '';

  filtered.forEach(loc => {
    const card = document.createElement('div');
    card.className = 'card card-glass';
    card.style.cursor = 'pointer';

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
        <h4 style="margin: 0; font-size: 1.05rem; color: var(--text-pure);">${loc.name}</h4>
        <span class="badge badge-source">${loc.region}</span>
      </div>
      <div style="font-size: 0.8rem; color: var(--primary-light); font-weight: 600; margin-bottom: 6px;">
        Provinsi ${loc.province}
      </div>
      <p style="font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.45; margin-bottom: 10px;">
        ${loc.description}
      </p>
      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 8px;">
        <span style="font-size: 0.75rem; color: var(--text-muted);">Koordinat: ${loc.lat.toFixed(2)}°, ${loc.lon.toFixed(2)}°</span>
        <button class="btn btn-primary btn-sm" id="btn-card-dash-${loc.id}">Buka Dashboard</button>
      </div>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.id === `btn-card-dash-${loc.id}`) {
        localStorage.setItem('kotatangguh:selected-location', JSON.stringify(loc));
        window.location.href = '/dashboard.html';
        return;
      }

      map.flyTo([loc.lat, loc.lon], 11, { duration: 1.2 });
      window.scrollTo({ top: document.querySelector('.map-container-wrapper').offsetTop - 90, behavior: 'smooth' });

      const targetMarker = markers.find(m => {
        const latLng = m.getLatLng();
        return Math.abs(latLng.lat - loc.lat) < 0.001 && Math.abs(latLng.lng - loc.lon) < 0.001;
      });
      if (targetMarker) {
        setTimeout(() => targetMarker.openPopup(), 700);
      }
    });

    container.appendChild(card);
  });
}
