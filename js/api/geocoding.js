import { API_CONFIG } from '../config.js';
import { getCache, setCache } from '../services/cache.js';

let abortController = null;

export async function searchLocations(query) {
  if (!query || query.length < 2) return [];
  
  if (abortController) {
    abortController.abort();
  }
  
  abortController = new AbortController();
  
  const cacheKey = `geocoding:${query.toLowerCase()}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;
  
  try {
    const params = new URLSearchParams({
      name: query,
      count: '8',
      language: 'id',
      format: 'json',
    });
    
    const response = await fetch(
      `${API_CONFIG.OPEN_METEO.GEOCODING_URL}?${params}`,
      {
        signal: abortController.signal,
        timeout: API_CONFIG.REQUEST_TIMEOUT,
      }
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }
    
    const data = await response.json();
    const results = data.results || [];
    
    const formatted = results.map(r => ({
      id: `custom-${r.latitude}-${r.longitude}`,
      name: r.name,
      admin: r.admin1 || r.admin2 || '',
      country: r.country || 'Indonesia',
      lat: r.latitude,
      lon: r.longitude,
      timezone: r.timezone,
    }));
    
    setCache(cacheKey, formatted, API_CONFIG.OPEN_METEO.GEOCODING_CACHE_TTL);
    return formatted;
  } catch (err) {
    if (err.name === 'AbortError') {
      return [];
    }
    console.error('Geocoding error:', err);
    throw err;
  }
}
