import { API_CONFIG } from '../config.js';
import { getCache, setCache } from '../services/cache.js';

/**
 * Mengambil prakiraan cuaca resmi BMKG tingkat kelurahan/desa berdasarkan kode adm4.
 * Endpoint: https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4={CODE}
 */
export async function getBMKGForecast(adm4Code) {
  if (!adm4Code) {
    throw new Error('Kode BMKG adm4 diperlukan');
  }

  const cacheKey = `bmkg:forecast:${adm4Code}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.REQUEST_TIMEOUT || 10000);

  try {
    const response = await fetch(
      `${API_CONFIG.BMKG.BASE_URL}?adm4=${encodeURIComponent(adm4Code)}`,
      {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`BMKG API error HTTP ${response.status}`);
    }

    const raw = await response.json();

    if (!raw || !raw.data || !raw.data.length || !raw.data[0].cuaca) {
      throw new Error('Format data cuaca BMKG tidak valid');
    }

    // BMKG cuaca is an array of arrays (e.g. 3 days: [ [t1, t2], [t3..t10], [t11..t18] ])
    const rawCuacaDays = raw.data[0].cuaca;
    const flatPeriods = [];

    rawCuacaDays.forEach((dayArr) => {
      if (Array.isArray(dayArr)) {
        dayArr.forEach(period => flatPeriods.push(period));
      } else if (dayArr && typeof dayArr === 'object') {
        flatPeriods.push(dayArr);
      }
    });

    // Find period closest to current time or latest past
    const nowMs = Date.now();
    let currentPeriod = flatPeriods[0];
    let minDiff = Infinity;

    flatPeriods.forEach(p => {
      // p.datetime is UTC ISO string e.g. "2026-10-24T11:00:00Z"
      const pMs = new Date(p.datetime).getTime();
      const diff = Math.abs(pMs - nowMs);
      if (diff < minDiff) {
        minDiff = diff;
        currentPeriod = p;
      }
    });

    const parsed = {
      source: 'BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)',
      sourceType: 'official',
      attribution: 'Sumber: BMKG Indonesia (Terbuka)',
      fetchedAt: new Date().toISOString(),
      location: raw.lokasi || {},
      current: {
        temp: currentPeriod?.t ?? null,
        humidity: currentPeriod?.hu ?? null,
        weatherCode: currentPeriod?.weather ?? 0,
        weatherDesc: currentPeriod?.weather_desc || 'Berawan',
        weatherDescEn: currentPeriod?.weather_desc_en || 'Cloudy',
        cloudCover: currentPeriod?.tcc ?? 0,
        precipitation: currentPeriod?.tp ?? 0,
        windSpeed: currentPeriod?.ws ?? 0,
        windDir: currentPeriod?.wd || 'N',
        windDirTo: currentPeriod?.wd_to || 'S',
        iconUrl: currentPeriod?.image || 'https://api-apps.bmkg.go.id/storage/icon/cuaca/berawan-pm.svg',
        localDatetime: currentPeriod?.local_datetime || '',
        analysisDate: currentPeriod?.analysis_date || '',
      },
      periods: flatPeriods.map(p => ({
        utcDatetime: p.datetime,
        localDatetime: p.local_datetime,
        temp: p.t,
        humidity: p.hu,
        cloudCover: p.tcc,
        precipitation: p.tp,
        weatherCode: p.weather,
        weatherDesc: p.weather_desc,
        weatherDescEn: p.weather_desc_en,
        windSpeed: p.ws,
        windDir: p.wd,
        iconUrl: p.image,
      })),
    };

    setCache(cacheKey, parsed, API_CONFIG.BMKG.CACHE_TTL);
    return parsed;
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('BMKG forecast fetch failed:', err);
    throw err;
  }
}
