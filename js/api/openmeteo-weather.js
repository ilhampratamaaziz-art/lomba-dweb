import { API_CONFIG } from '../config.js';
import { getCache, setCache } from '../services/cache.js';

export function getWeatherSvg(code, size = 28) {
  const c = Number(code);
  if (c >= 95) {
    // Thunderstorm
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 16.9A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/><polygon points="13 11 9 17 15 17 11 23"/></svg>`;
  } else if (c >= 80 || (c >= 61 && c <= 65)) {
    // Rain
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M8 19v2"/><path d="M8 13v2"/><path d="M12 21v2"/><path d="M12 15v2"/><path d="M16 19v2"/><path d="M16 13v2"/></svg>`;
  } else if (c >= 51 && c <= 55) {
    // Drizzle
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M8 19v1"/><path d="M12 17v1"/><path d="M16 19v1"/></svg>`;
  } else if (c === 45 || c === 48) {
    // Fog
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 10h14"/><path d="M3 14h18"/><path d="M4 18h16"/><path d="M7 6h10"/></svg>`;
  } else if (c === 3) {
    // Overcast
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`;
  } else if (c === 1 || c === 2) {
    // Partly Cloudy
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.5 17a4.5 4.5 0 0 0 .5-8.97A7 7 0 0 0 3 13.5a4.5 4.5 0 0 0 4.5 4.5h8z" stroke="#94a3b8"/></svg>`;
  } else {
    // Clear / Sun
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
  }
}

export function getWMODescription(code) {
  const c = Number(code);
  switch (c) {
    case 0:
      return { desc: 'Cerah', severity: 'low', code: 0 };
    case 1:
      return { desc: 'Cerah Berawan', severity: 'low', code: 1 };
    case 2:
      return { desc: 'Berawan Sebagian', severity: 'low', code: 2 };
    case 3:
      return { desc: 'Mendung Berawan', severity: 'moderate', code: 3 };
    case 45:
    case 48:
      return { desc: 'Berkabut Tebal', severity: 'moderate', code: 45 };
    case 51:
    case 53:
    case 55:
      return { desc: 'Gerimis Rintik', severity: 'moderate', code: 51 };
    case 61:
      return { desc: 'Hujan Ringan', severity: 'moderate', code: 61 };
    case 63:
      return { desc: 'Hujan Sedang', severity: 'high', code: 63 };
    case 65:
      return { desc: 'Hujan Sangat Lebat', severity: 'severe', code: 65 };
    case 80:
      return { desc: 'Hujan Guyur Ringan', severity: 'moderate', code: 80 };
    case 81:
      return { desc: 'Hujan Guyur Sedang', severity: 'high', code: 81 };
    case 82:
      return { desc: 'Hujan Guyur Deras', severity: 'severe', code: 82 };
    case 95:
      return { desc: 'Hujan Badai Petir', severity: 'severe', code: 95 };
    case 96:
    case 99:
      return { desc: 'Hujan Petir & Angin Kencang', severity: 'extreme', code: 99 };
    default:
      return { desc: 'Kondisi Berawan', severity: 'low', code: 2 };
  }
}

export async function getWeatherForecast(lat, lon) {
  const cacheKey = `openmeteo:forecast:${lat},${lon}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.REQUEST_TIMEOUT || 10000);

  try {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_gusts_10m,surface_pressure',
      hourly: 'precipitation_probability,precipitation,rain,temperature_2m,apparent_temperature,wind_speed_10m,weather_code,uv_index,relative_humidity_2m',
      daily: 'precipitation_sum,precipitation_probability_max,temperature_2m_max,temperature_2m_min,weather_code,uv_index_max,wind_speed_10m_max',
      timezone: 'auto',
      forecast_days: '7',
    });

    const response = await fetch(`${API_CONFIG.OPEN_METEO.FORECAST_URL}?${params}`, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }

    const data = await response.json();
    
    const wmo = getWMODescription(data.current?.weather_code);

    const result = {
      source: 'Open-Meteo Global Model (DWD/ECMWF)',
      fetchedAt: new Date().toISOString(),
      current: {
        ...data.current,
        weatherDesc: wmo.desc,
        weatherCode: data.current?.weather_code,
        weatherSvg: getWeatherSvg(data.current?.weather_code, 48),
        weatherSeverity: wmo.severity,
      },
      hourly: data.hourly,
      daily: data.daily,
      timezone: data.timezone,
      units: {
        temperature: data.current_units?.temperature_2m || '°C',
        precipitation: data.hourly_units?.precipitation || 'mm',
        wind_speed: data.current_units?.wind_speed_10m || 'km/h',
        pressure: data.current_units?.surface_pressure || 'hPa',
      },
    };

    setCache(cacheKey, result, API_CONFIG.OPEN_METEO.CACHE_TTL);
    return result;
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('Open-Meteo forecast error:', err);
    throw err;
  }
}

export async function getHistoricalWeather(lat, lon, startDate, endDate) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      start_date: startDate,
      end_date: endDate,
      daily: 'temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum,wind_speed_10m_max',
      timezone: 'auto',
    });

    const response = await fetch(`${API_CONFIG.OPEN_METEO.ARCHIVE_URL}?${params}`, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Open-Meteo Archive error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      source: 'Open-Meteo Reanalysis Archive (ERA5)',
      fetchedAt: new Date().toISOString(),
      daily: data.daily,
      timezone: data.timezone,
      units: {
        temperature: data.daily_units?.temperature_2m_mean || '°C',
        precipitation: data.daily_units?.precipitation_sum || 'mm',
        wind: data.daily_units?.wind_speed_10m_max || 'km/h',
      },
    };
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('Open-Meteo archive error:', err);
    throw err;
  }
}
