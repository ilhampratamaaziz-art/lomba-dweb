import { API_CONFIG } from '../config.js';
import { getCache, setCache } from '../services/cache.js';

/**
 * Standard Kualitas Udara (Indeks Standar Pencemar Udara - ISPU & US AQI)
 * 0 - 50: Baik (Good) - Hijau (#10B981)
 * 51 - 100: Sedang (Moderate) - Biru/Kuning (#38BDF8 / #F59E0B)
 * 101 - 150: Tidak Sehat Kelompok Sensitif (Unhealthy for Sensitive Groups) - Oranye (#FB923C)
 * 151 - 200: Tidak Sehat (Unhealthy) - Merah (#EF4444)
 * 201 - 300: Sangat Tidak Sehat (Very Unhealthy) - Ungu (#A855F7)
 * 300+: Berbahaya (Hazardous) - Merah Marun (#881337)
 */
export function getAQICategory(aqi) {
  const val = Math.round(aqi || 0);
  if (val <= 50) {
    return {
      aqi: val,
      category: 'Baik',
      categoryEn: 'Good',
      color: '#10B981',
      bg: 'rgba(16, 185, 129, 0.15)',
      border: 'rgba(16, 185, 129, 0.4)',
      summary: 'Kualitas udara sangat memuaskan, risiko pencemaran minimal atau nihil.',
      advice: 'Kondisi udara ideal untuk aktivitas luar ruangan bagi semua kalangan.',
      badgeClass: 'status-normal',
    };
  } else if (val <= 100) {
    return {
      aqi: val,
      category: 'Sedang',
      categoryEn: 'Moderate',
      color: '#38BDF8',
      bg: 'rgba(56, 189, 248, 0.15)',
      border: 'rgba(56, 189, 248, 0.4)',
      summary: 'Kualitas udara dapat diterima untuk umum, sedikit polutan bagi individu sangat sensitif.',
      advice: 'Kelompok rentan (asma, anak-anak) sebaiknya kurangi aktivitas fisik berat di luar ruang.',
      badgeClass: 'status-notice',
    };
  } else if (val <= 150) {
    return {
      aqi: val,
      category: 'Sensitif Rentan',
      categoryEn: 'Unhealthy for Sensitive Groups',
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.15)',
      border: 'rgba(245, 158, 11, 0.4)',
      summary: 'Berdampak pada kelompok sensitif, masyarakat umum biasanya belum terpengaruh berat.',
      advice: 'Kenakan masker jika bepergian, kurangi durasi olahraga luar ruangan.',
      badgeClass: 'status-warning',
    };
  } else if (val <= 200) {
    return {
      aqi: val,
      category: 'Tidak Sehat',
      categoryEn: 'Unhealthy',
      color: '#EF4444',
      bg: 'rgba(239, 68, 68, 0.15)',
      border: 'rgba(239, 68, 68, 0.4)',
      summary: 'Setiap orang dapat mulai merasakan dampak kesehatan; kelompok rentan mengalami efek lebih parah.',
      advice: 'Gunakan masker filter PM2.5/N95. Tutup jendela rumah dan nyalakan air purifier.',
      badgeClass: 'status-danger',
    };
  } else if (val <= 300) {
    return {
      aqi: val,
      category: 'Sangat Tidak Sehat',
      categoryEn: 'Very Unhealthy',
      color: '#A855F7',
      bg: 'rgba(168, 85, 247, 0.15)',
      border: 'rgba(168, 85, 247, 0.4)',
      summary: 'Peringatan kesehatan darurat. Seluruh populasi kemungkinan besar terdampak.',
      advice: 'Hindari semua aktivitas di luar ruangan. Pastikan filtrasi udara dalam ruangan aktif.',
      badgeClass: 'status-extreme',
    };
  } else {
    return {
      aqi: val,
      category: 'Berbahaya',
      categoryEn: 'Hazardous',
      color: '#E11D48',
      bg: 'rgba(225, 29, 72, 0.2)',
      border: 'rgba(225, 29, 72, 0.5)',
      summary: 'Status siaga darurat lingkungan. Efek kesehatan serius pada seluruh masyarakat.',
      advice: 'Dilarang beraktivitas luar ruangan. Ikuti arahan darurat satgas lingkungan hidup.',
      badgeClass: 'status-extreme',
    };
  }
}

export async function getAirQuality(lat, lon) {
  const cacheKey = `openmeteo:airquality:${lat},${lon}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.REQUEST_TIMEOUT || 10000);

  try {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      current: 'us_aqi,pm2_5,pm10',
      hourly: 'us_aqi,pm2_5,pm10',
      timezone: 'auto',
      forecast_days: '3',
    });

    const response = await fetch(`${API_CONFIG.OPEN_METEO.AIR_QUALITY_URL}?${params}`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Air Quality API error: ${response.status}`);
    }

    const data = await response.json();
    const currentAqi = data.current?.us_aqi || 0;
    const meta = getAQICategory(currentAqi);

    const result = {
      source: 'Open-Meteo CAMS Atmospheric Model',
      fetchedAt: new Date().toISOString(),
      current: {
        aqi: currentAqi,
        pm2_5: data.current?.pm2_5 || 0,
        pm10: data.current?.pm10 || 0,
        ...meta,
      },
      hourly: data.hourly,
      timezone: data.timezone,
    };

    setCache(cacheKey, result, 60 * 60 * 1000); // 1 hour cache
    return result;
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('Air Quality error:', err);
    throw err;
  }
}

