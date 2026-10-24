# Data Sources

## BMKG — Badan Meteorologi, Klimatologi, dan Geofisika

**URL**: https://data.bmkg.go.id/prakiraan-cuaca/  
**Endpoint**: `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4={CODE}`

**Data Type**: Prakiraan cuaca 3 hari per 3 jam untuk tingkat kelurahan/desa  
**Update Frequency**: 2x per hari (dokumentasi BMKG)  
**Rate Limit**: 60 requests/minute/IP  
**Attribution**: "Sumber: BMKG" wajib ditampilkan  
**Last Verified**: 24 Oktober 2026

**Notes**:
- Kode adm4 harus diverifikasi dari referensi resmi
- Struktur JSON bertingkat, parsing harus defensif
- `analysis_date` dan `local_datetime` harus ditampilkan

## Open-Meteo

**Base URL**: https://open-meteo.com  
**License**: CC BY 4.0 untuk penggunaan non-komersial  
**Terms**: https://open-meteo.com/en/terms

### Forecast API

**Endpoint**: `https://api.open-meteo.com/v1/forecast`

**Parameters Used**:
- `latitude`, `longitude`
- `current`: temperature_2m, relative_humidity_2m, precipitation, rain, weather_code, wind_speed_10m
- `hourly`: precipitation_probability, precipitation, rain, temperature_2m, wind_speed_10m, weather_code
- `daily`: precipitation_sum, precipitation_probability_max, temperature_2m_max, temperature_2m_min, weather_code
- `timezone=auto`
- `forecast_days=7`

**Cache TTL**: 30 menit  
**Last Verified**: 24 Oktober 2026

### Geocoding API

**Endpoint**: `https://geocoding-api.open-meteo.com/v1/search`

**Parameters Used**:
- `name`: query string
- `count=8`
- `language=id`
- `format=json`

**Cache TTL**: 24 jam  
**Last Verified**: 24 Oktober 2026

**Notes**:
- Tidak menyediakan kode adm4 BMKG langsung
- Perlu pemetaan manual location_id → adm4_code

### Historical Weather API

**Endpoint**: `https://archive-api.open-meteo.com/v1/archive`

**Parameters Used**:
- `latitude`, `longitude`
- `start_date`, `end_date` (YYYY-MM-DD)
- `daily`: temperature_2m_mean, precipitation_sum
- `timezone=auto`

**Cache TTL**: 12 jam  
**Data Type**: Arsip/reanalisis, bukan observasi sensor lokal  
**Last Verified**: 24 Oktober 2026

### Air Quality API (P1)

**Endpoint**: `https://air-quality-api.open-meteo.com/v1/air-quality`

**Parameters Used**:
- `latitude`, `longitude`
- `current`: us_aqi, pm2_5, pm10
- `hourly`: us_aqi, pm2_5, pm10
- `timezone=auto`
- `forecast_days=3`

**Cache TTL**: 60 menit  
**Data Type**: Model CAMS, bukan pengukuran stasiun lokal  
**Last Verified**: 24 Oktober 2026

## OpenStreetMap

**Tile Server**: https://tile.openstreetmap.org  
**Attribution**: "© OpenStreetMap contributors"  
**License**: ODbL  
**Policy**: https://operations.osmfoundation.org/policies/tiles/

**Notes**:
- Tile usage policy harus diikuti
- Atribusi wajib ditampilkan
- Tidak boleh mass download atau prefetch

## Leaflet

**Library**: https://leafletjs.com  
**Version**: 1.9.4  
**License**: BSD 2-Clause

## Chart.js

**Library**: https://www.chartjs.org  
**Version**: 4.4.0  
**License**: MIT

---

**Document Version**: 1.0  
**Last Updated**: 24 Oktober 2026
