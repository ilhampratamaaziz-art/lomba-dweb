import { IKH_CONFIG } from '../config.js';

export function calculateReadinessIndex(weatherData) {
  if (!weatherData || !weatherData.hourly) {
    return {
      score: null,
      category: null,
      message: 'Data prakiraan cuaca belum lengkap untuk penghitungan indeks.',
      factors: [],
      experimental: true,
      recommendations: [],
    };
  }

  const now = new Date();
  const sixHoursLater = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  
  const hourly = weatherData.hourly;
  const times = (hourly.time || []).map(t => new Date(t));
  
  let relevantIndices = times
    .map((t, i) => ({ t, i }))
    .filter(({ t }) => t >= now && t <= sixHoursLater)
    .map(({ i }) => i);

  // If time matching produces empty (e.g. timezone mismatch or past edge), take first 6 periods
  if (relevantIndices.length === 0) {
    relevantIndices = Array.from({ length: Math.min(6, (hourly.time || []).length) }, (_, i) => i);
  }

  if (relevantIndices.length === 0) {
    return {
      score: 15,
      category: 'Normal',
      message: 'Kondisi cuaca terpantau kondusif dan stabil.',
      factors: [],
      experimental: true,
      recommendations: ['Lakukan aktivitas harian seperti biasa dengan memantau update berkala.'],
    };
  }

  let totalScore = 0;
  const factors = [];

  // 1. Peluang Hujan Maksimum (Weight 0.35)
  let maxProb = 0;
  if (hourly.precipitation_probability) {
    maxProb = Math.max(...relevantIndices.map(i => hourly.precipitation_probability[i] || 0));
    const probScore = maxProb * 0.35;
    totalScore += probScore;
    factors.push({
      name: 'Probabilitas Hujan Maksimum (6 Jam)',
      value: `${maxProb}%`,
      contribution: probScore.toFixed(1),
      weight: '35%',
      severity: maxProb > 70 ? 'danger' : maxProb > 40 ? 'warning' : 'normal',
    });
  }

  // 2. Akumulasi Curah Hujan (Weight 0.30)
  let totalPrecip = 0;
  if (hourly.precipitation) {
    totalPrecip = relevantIndices.reduce((sum, i) => sum + (hourly.precipitation[i] || 0), 0);
    // 0 to 25mm scaled to 0-100
    const precipScore = Math.min((totalPrecip / 25) * 100, 100) * 0.30;
    totalScore += precipScore;
    factors.push({
      name: 'Estimasi Akumulasi Hujan',
      value: `${totalPrecip.toFixed(1)} mm`,
      contribution: precipScore.toFixed(1),
      weight: '30%',
      severity: totalPrecip > 15 ? 'danger' : totalPrecip > 5 ? 'warning' : 'normal',
    });
  }

  // 3. Keparahan Kode Cuaca WMO (Weight 0.20)
  let codeScoreRaw = 0;
  let maxCode = 0;
  if (hourly.weather_code) {
    const codes = relevantIndices.map(i => hourly.weather_code[i] || 0);
    maxCode = Math.max(...codes);
    if (maxCode >= 95) codeScoreRaw = 100; // thunderstorm
    else if (maxCode >= 80) codeScoreRaw = 80; // rain showers
    else if (maxCode >= 63) codeScoreRaw = 70; // moderate/heavy rain
    else if (maxCode >= 51) codeScoreRaw = 40; // drizzle/light rain
    else if (maxCode >= 3) codeScoreRaw = 20; // overcast
    else codeScoreRaw = 5;

    const codeScore = codeScoreRaw * 0.20;
    totalScore += codeScore;
    factors.push({
      name: 'Tingkat Intensitas Cuaca (WMO)',
      value: `Kode ${maxCode}`,
      contribution: codeScore.toFixed(1),
      weight: '20%',
      severity: codeScoreRaw >= 70 ? 'danger' : codeScoreRaw >= 40 ? 'warning' : 'normal',
    });
  }

  // 4. Stabilitas Angin & Atmosfer (Weight 0.15)
  let maxWind = 0;
  if (hourly.wind_speed_10m) {
    maxWind = Math.max(...relevantIndices.map(i => hourly.wind_speed_10m[i] || 0));
    // scale 0 - 50 km/h
    const windScoreRaw = Math.min((maxWind / 50) * 100, 100);
    const windScore = windScoreRaw * 0.15;
    totalScore += windScore;
    factors.push({
      name: 'Kecepatan Angin Puncak',
      value: `${maxWind.toFixed(1)} km/jam`,
      contribution: windScore.toFixed(1),
      weight: '15%',
      severity: maxWind > 30 ? 'danger' : maxWind > 20 ? 'warning' : 'normal',
    });
  }

  const score = Math.min(100, Math.round(totalScore));

  let category = 'Normal';
  let badgeClass = 'status-normal';
  let color = '#10b981';
  let message = 'Kondisi cuaca perkotaan relatif tenang dan aman untuk kegiatan outdoor umum.';
  let recommendations = [
    'Pantau kondisi berkala sebelum bepergian jarak jauh.',
    'Pastikan saluran pembuangan air di sekitar hunian bebas sumbatan sampah plastik.',
  ];

  if (score >= 80) {
    category = 'Perhatian Tinggi';
    badgeClass = 'status-danger';
    color = '#ef4444';
    message = 'Potensi presipitasi sangat lebat disertai angin kencang dalam rentang 6 jam ke depan.';
    recommendations = [
      'Tunda perjalanan luar ruangan yang tidak mendesak terutama melintasi jalur rawan genangan air.',
      'Hindari berteduh di bawah pohon rindang, baliho besar, atau tiang listrik rentan tumbang.',
      'Amankan dokumen penting dan peralatan elektronik ke tempat lebih tinggi.',
      'Siapkan Tas Siaga Bencana (TSB) dan pastikan baterai ponsel terisi penuh.',
    ];
  } else if (score >= 60) {
    category = 'Waspada';
    badgeClass = 'status-warning';
    color = '#f59e0b';
    message = 'Diprakirakan terjadi hujan sedang hingga lebat. Kewaspadaan mobilitas perkotaan disarankan.';
    recommendations = [
      'Bawa perlengkapan hujan (jas hujan/payung berkualitas) dan kenakan alas kaki anti-selip.',
      'Hindari rute cekungan jalan, terowongan (underpass), atau bantaran kali yang rawan luapan.',
      'Cek kembali informasi lalu lintas dan jalur evakuasi lingkungan setempat.',
    ];
  } else if (score >= 30) {
    category = 'Perlu Diperhatikan';
    badgeClass = 'status-notice';
    color = '#38bdf8';
    message = 'Peluang hujan ringan hingga sedang dengan perubahan kelembapan udara yang dinamis.';
    recommendations = [
      'Siapkan payung atau jas hujan di kendaraan untuk antisipasi hujan sore/malam.',
      'Jaga kebersihan talang air dan periksa kondisi atap rumah.',
    ];
  }

  return {
    score,
    category,
    badgeClass,
    color,
    message,
    factors,
    recommendations,
    version: '1.2-resilience',
    formula: 'IKH = (0.35 × Peluang) + (0.30 × Curah Hujan) + (0.20 × Kode Cuaca) + (0.15 × Faktor Angin)',
    evaluatedAt: new Date().toLocaleTimeString('id-ID'),
  };
}
