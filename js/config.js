export const API_CONFIG = {
  BMKG: {
    BASE_URL: 'https://api.bmkg.go.id/publik/prakiraan-cuaca',
    RATE_LIMIT: 60,
    CACHE_TTL: 30 * 60 * 1000, // 30 min
  },
  OPEN_METEO: {
    FORECAST_URL: 'https://api.open-meteo.com/v1/forecast',
    AIR_QUALITY_URL: 'https://air-quality-api.open-meteo.com/v1/air-quality',
    ARCHIVE_URL: 'https://archive-api.open-meteo.com/v1/archive',
    GEOCODING_URL: 'https://geocoding-api.open-meteo.com/v1/search',
    CACHE_TTL: 30 * 60 * 1000, // 30 min
    GEOCODING_CACHE_TTL: 24 * 60 * 60 * 1000, // 24 hours
  },
  REQUEST_TIMEOUT: 10000,
};

export const IKH_CONFIG = {
  VERSION: '1.0-experimental',
  WEIGHTS: {
    precipitation_probability: 0.4,
    precipitation_amount: 0.3,
    weather_code: 0.2,
    data_freshness: 0.1,
  },
  THRESHOLDS: {
    NORMAL: 0,
    PERLU_DIPERHATIKAN: 30,
    WASPADA: 60,
    PERHATIAN_TINGGI: 80,
  },
};
