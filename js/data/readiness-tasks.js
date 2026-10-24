export const READINESS_TASKS = [
  // Kategori: Sebelum Cuaca Ekstrem (Pra-Bencana & Pencegahan)
  {
    id: 'check-bmkg-app',
    category: 'before',
    title: 'Pantau Prakiraan Cuaca BMKG Terkini',
    description: 'Buka kanal informasi resmi BMKG untuk mendeteksi potensi pertumbuhan awan Cumulonimbus 3-6 jam sebelum beraktivitas.',
    priority: 'Tinggi',
    sourceUrl: 'https://www.bmkg.go.id',
  },
  {
    id: 'clear-drainage-house',
    category: 'before',
    title: 'Inspeksi & Bersihkan Selokan Rumah',
    description: 'Pastikan saluran pembuangan air dan talang atap rumah bebas dari endapan lumpur, dedaunan, dan sampah plastik.',
    priority: 'Kritis',
  },
  {
    id: 'secure-outdoor-assets',
    category: 'before',
    title: 'Amankan Benda Luar Ruangan & Kanopi',
    description: 'Kencangkan atau pindahkan pot gantung, jemuran, terpal, atau kanopi ringan yang rawan terbang diterjang angin kencang.',
    priority: 'Sedang',
  },
  {
    id: 'prepare-rainwear',
    category: 'before',
    title: 'Bawa Perlengkapan Pelindung Hujan',
    description: 'Selalu bawa jas hujan model setelan (bukan ponco untuk pesepeda motor) atau payung kokoh di tas/kendaraan.',
    priority: 'Tinggi',
  },

  // Kategori: Saat Cuaca Ekstrem Terjadi (Tanggap Darurat)
  {
    id: 'indoor-shelter',
    category: 'during',
    title: 'Berlindung di Dalam Bangunan Kokoh',
    description: 'Segera masuk ke ruangan tertutup saat terdengar petir. Jauhi jendela kaca lebar dan dinding luar.',
    priority: 'Kritis',
  },
  {
    id: 'avoid-trees-billboards',
    category: 'during',
    title: 'Hindari Berteduh di Bawah Pohon & Reklame',
    description: 'Jangan pernah berteduh di bawah pohon rindang tinggi atau papan reklame jalan karena risiko tersambar petir dan tumbang.',
    priority: 'Kritis',
  },
  {
    id: 'turn-off-breaker',
    category: 'during',
    title: 'Putus Aliran Listrik Jika Air Mulai Masuk',
    description: 'Matikan Miniature Circuit Breaker (MCB) utama rumah jika genangan air mulai mendekati stop kontak lantai.',
    priority: 'Kritis',
    sourceUrl: 'https://bnpb.go.id',
  },
  {
    id: 'elevate-valuables',
    category: 'during',
    title: 'Pindahkan Dokumen & Elektronik ke Tempat Tinggi',
    description: 'Tempatkan ijazah, akta, sertifikat, dan perangkat elektronik di lantai dua atau rak tertinggi di rumah.',
    priority: 'Tinggi',
  },

  // Kategori: Mobilitas & Perjalanan Perkotaan
  {
    id: 'avoid-flooded-underpass',
    category: 'travel',
    title: 'Jangan Terobos Genangan Air (> 30 cm)',
    description: 'Hindari menerobos underpass atau cekungan jalan yang tergenang. Air setinggi 30 cm mampu menghanyutkan mobil kecil dan merusak mesin kendaraan.',
    priority: 'Kritis',
  },
  {
    id: 'check-alternative-routes',
    category: 'travel',
    title: 'Cek Jalur Alternatif & Peta Kemacetan',
    description: 'Gunakan navigasi digital untuk menghindari titik genangan rutin kota dan pohon tumbang yang memblokir akses.',
    priority: 'Tinggi',
  },
  {
    id: 'reduce-driving-speed',
    category: 'travel',
    title: 'Kurangi Kecepatan & Nyalakan Lampu Utama',
    description: 'Jaga jarak pengereman minimal 2x lipat karena aspal basah memicu aquaplaning (kehilangan traksi ban).',
    priority: 'Tinggi',
  },
  {
    id: 'share-live-location',
    category: 'travel',
    title: 'Bagikan Posisi Terkini ke Kerabat',
    description: 'Informasikan rute perjalanan dan estimasi kepulangan kepada keluarga sebelum melewati kawasan terdampak hujan lebat.',
    priority: 'Sedang',
  },

  // Kategori: Perlindungan Kualitas Udara (Polusi & Kabut Asap)
  {
    id: 'air-n95-mask',
    category: 'airquality',
    title: 'Kenakan Masker Standar PM2.5 / N95',
    description: 'Saat indeks ISPU/AQI di atas 100, gunakan masker respirator partikulat untuk menyaring partikel mikroskopis berbahaya.',
    priority: 'Tinggi',
  },
  {
    id: 'air-seal-windows',
    category: 'airquality',
    title: 'Tutup Ventilasi Ruangan Saat Polusi Memuncak',
    description: 'Hindari ventilasi udara alami pada jam puncak polusi (dini hari dan jam sibuk pagi). Gunakan air purifier atau filter AC.',
    priority: 'Sedang',
  },
  {
    id: 'air-hydrate-health',
    category: 'airquality',
    title: 'Tingkatkan Asupan Air & Antioksidan',
    description: 'Minum air putih minimal 2 liter per hari untuk membantu mukosa saluran pernapasan mengeluarkan partikel polutan.',
    priority: 'Sedang',
  },
];

// Tas Siaga Bencana (TSB) BNPB Standar 72 Jam Mandiri
export const SURVIVAL_BAG_ITEMS = [
  { id: 'tsb-docs', name: 'Surat Penting dalam Wadah Kedap Air (KTP, KK, Ijazah, Polis)', weight: 15 },
  { id: 'tsb-water', name: 'Air Mineral Siap Minum (Minimal 2-3 Liter per Anggota)', weight: 15 },
  { id: 'tsb-food', name: 'Makanan Cepat Saji Tahan Lama (Biskuit Energi, Rendang Kering, Roti Gandum)', weight: 15 },
  { id: 'tsb-p3k', name: 'Kotak P3K & Obat Rutin Pribadi (Plester, Antiseptik, Parasetamol, Obat Alergi)', weight: 15 },
  { id: 'tsb-light', name: 'Senter LED Tahan Air + Baterai Cadangan / Senter Engkol', weight: 10 },
  { id: 'tsb-power', name: 'Powerbank Berdaya Penuh & Kabel Pengisi Daya Ponsel', weight: 10 },
  { id: 'tsb-whistle', name: 'Peluit Darurat (Sinyal Suara Tim SAR Tanpa Menguras Tenaga)', weight: 5 },
  { id: 'tsb-clothes', name: 'Pakaian Ganti Hangat, Selimut Darurat Aluminium, & Jas Hujan Ponco', weight: 5 },
  { id: 'tsb-mask', name: 'Masker Respirator (N95/KF94) & Hand Sanitizer', weight: 5 },
  { id: 'tsb-cash', name: 'Uang Tunai Pecahan Kecil (ATM & Mesin EDC Sering Mati Saat Bencana)', weight: 5 },
];

export const EMERGENCY_CONTACTS = [
  {
    name: 'Panggilan Darurat Nasional',
    number: '112',
    desc: 'Layanan tunggal bebas pulsa respon cepat kebakaran, ambulans, dan bencana alam daerah.',
    type: 'hotline',
  },
  {
    name: 'BNPB (Badan Nasional Penanggulangan Bencana)',
    number: '117',
    desc: 'Pusat Pengendalian Operasi (Pusdalops) Penanggulangan Bencana Republik Indonesia.',
    type: 'bnpb',
  },
  {
    name: 'BASARNAS (Pencarian & Pertolongan)',
    number: '115',
    desc: 'Evakuasi darurat kecelakaan laut, reruntuhan, banjir bandang, dan evakuasi jiwa.',
    type: 'sar',
  },
  {
    name: 'Ambulans Darurat Medis',
    number: '119',
    desc: 'Sistem Penanggulangan Gawat Darurat Terpadu (SPGDT) Kementerian Kesehatan.',
    type: 'medis',
  },
  {
    name: 'Pemadam Kebakaran & Penyelamatan',
    number: '113',
    desc: 'Penanganan kebakaran, pohon tumbang, pelepasan cincin, evakuasi binatang liar.',
    type: 'damkar',
  },
  {
    name: 'Call Center BMKG',
    number: '196',
    desc: 'Layanan informasi meteorologi, klimatologi, dan peringatan gempa/tsunami resmi.',
    type: 'bmkg',
  },
];

export function getTasksByCategory(category) {
  return READINESS_TASKS.filter(task => task.category === category);
}
