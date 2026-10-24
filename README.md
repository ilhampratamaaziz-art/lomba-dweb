# KotaTangguh — Observatorium Ketahanan Iklim & Cuaca 38 Provinsi Indonesia

**National Urban Climate Resilience & Earth Weather Intelligence Platform**  
*Dikembangkan untuk Lomba Nasional Web Desain 2026 • Keselarasan SDG 11 (Kota Berkelanjutan) & SDG 13 (Aksi Iklim)*

---

## 🌟 Ringkasan Eksekutif

**KotaTangguh** adalah platform web observasi cuaca dan ketahanan iklim perkotaan yang menjangkau seluruh **38 Provinsi di Republik Indonesia** (dari Sabang di Aceh hingga Merauke di Papua Selatan). 

Dirancang dengan prinsip *human-centered engineering* dan estetika observatorium kebumian modern (**Latar Belakang Citra Bumi Orbital** & tipografi **Plus Jakarta Sans**), platform ini menyajikan data meteorologi 100% riil dari **BMKG Indonesia**, pemodelan atmosfer **Open-Meteo**, kualitas udara **Copernicus CAMS**, serta citra satelit bumi beresolusi tinggi **Esri World Imagery**.

---

## 🛰️ Fitur Unggulan Proyek

### 1. Cakupan Lengkap 38 Provinsi Indonesia
- **Pulau Sumatera (10 Provinsi):** Banda Aceh, Medan, Padang, Pekanbaru, Tanjung Pinang, Jambi, Palembang, Pangkal Pinang, Bengkulu, Bandar Lampung.
- **Pulau Jawa (6 Provinsi):** Jakarta Pusat, Bandung, Serang, Semarang, Yogyakarta, Surabaya.
- **Bali & Nusa Tenggara (3 Provinsi):** Denpasar, Mataram, Kupang.
- **Pulau Kalimantan (5 Provinsi):** Pontianak, Palangka Raya, Banjarmasin, Samarinda, Tanjung Selor.
- **Pulau Sulawesi (6 Provinsi):** Manado, Gorontalo, Palu, Mamuju, Makassar, Kendari.
- **Kepulauan Maluku (2 Provinsi):** Ambon, Sofifi / Ternate.
- **Tanah Papua (6 Provinsi):** Jayapura, Manokwari, Sorong, Nabire, Wamena, Merauke.

### 2. Latar Belakang Citra Bumi & Estetika Antariksa
- Visual atmosfer planet bumi orbital dengan lengkungan ozon bercahaya, siluet gugusan kepulauan nusantara di perairan tropis, dan gugusan lampu kota malam hari (*night city lights*).
- Desain *glassmorphism* tembus pandang yang elegan dan tajam, bebas dari *AI Slop*.

### 3. Peta Interaktif dengan Lapisan Satelit Bumi Resolusi Tinggi
- Integrasi **Leaflet.js** dengan tombol pengalih lapisan:
  - 🛰️ **Citra Satelit Bumi (Esri World Imagery / NASA):** Menampilkan bentang alam asli kepulauan nusantara, pegunungan vulkanik, dan garis pantai tropis.
  - 🏙️ **Peta Vektor Gelap (CartoDB Dark Matter):** Tampilan kontras tinggi untuk keterbacaan data malam hari.
- Pin 38 ibukota provinsi menampilkan temperatur riil dan ikon cuaca live.
- Filter wilayah satu-klik (*Sumatera, Jawa, Bali-Nusra, Kalimantan, Sulawesi, Maluku, Papua*) dengan transisi kamera halus *flyTo*.

### 4. Dashboard Cuaca Multivariat (Integrasi BMKG & Open-Meteo)
- **Prakiraan BMKG Resmi per Kelurahan:** Menampilkan linimasa per 3 jam dengan ikon cuaca resmi BMKG.
- **Deteksi GPS Lokasi Saya:** Fitur `navigator.geolocation` untuk menemukan koordinat terkini pengguna.
- **Pemantau Kualitas Udara Real-Time (CAMS / ISPU):** Konsentrasi PM2.5, PM10, dan US AQI dengan bilah spektrum warna interaktif.
- **Grafik 24 Jam (Dual-Axis Chart.js):** Kurva temperatur linier halus dipadukan bar curah hujan interaktif.
- **Proyeksi Horizon 7 Hari:** Kartu prakiraan cuaca mingguan.

### 5. Indikator Kewaspadaan Hujan (IKH) Kuantitatif
Formula komposit terbuka untuk mengukur tingkat kewaspadaan cuaca 6 jam ke depan:
$$\text{IKH} = (0.35 \times P_{\text{prob}}) + (0.30 \times P_{\text{amount}}) + (0.20 \times W_{\text{code}}) + (0.15 \times A_{\text{wind}})$$
- **Normal (0 - 29):** Kondisi kondusif untuk aktivitas luar ruang.
- **Perlu Diperhatikan (30 - 59):** Peluang hujan ringan hingga sedang.
- **Waspada (60 - 79):** Potensi genangan air pada cekungan jalan dan underpass.
- **Perhatian Tinggi (80 - 100):** Potensi badai petir dan angin kencang; rekomendasi tunda perjalanan.

### 6. Pusat Kesiapsiagaan Mandiri 72 Jam (Standar BNPB)
- **Tas Siaga Bencana (TSB) Simulator:** Checklist 10 barang esensial standar BNPB untuk bertahan hidup 3 hari pertama pascabencana.
- **Checklist 4 Fase Mitigasi:** Pra-bencana, saat cuaca ekstrem, mobilitas perjalanan, dan kualitas udara.
- **Kalkulator Skor Ketahanan Rumah Tangga Dinamis:** Tersimpan di `localStorage` peramban tanpa akun/login.
- **Fitur Ramah Cetak (Print / PDF):** Lembar panduan siap cetak (A4) untuk ditempel di rumah.
- **Direktori Kontak Darurat Nasional:** Panggilan langsung ke 112, 117 (BNPB), 115 (BASARNAS), 119 (Medis), 113 (Damkar), 196 (BMKG).

### 7. Eksplorasi Tren & Arsip Iklim Historis (ERA5 Reanalysis)
- Analisis data historis harian dari Open-Meteo Historical Archive API.
- Ringkasan statistik otomatis (Suhu Rata-rata, Suhu Maksimum, Total Presipitasi, Hari Hujan Ekstrem).
- Fitur **Ekspor Dataset CSV** untuk keperluan analisis dan verifikasi juri.

---

## 🛠️ Tumpukan Teknologi (Tech Stack)

- **Frontend Core:** Vanilla JavaScript (ES Modules modern) — Performa kilat tanpa framework berat.
- **Bundler & Tooling:** Vite 5.x — Multi-Page Build & Rollup optimization.
- **Tipografi:** Google Fonts *Plus Jakarta Sans* & *JetBrains Mono*.
- **Peta Interaktif:** Leaflet.js v1.9.4 dengan *Esri World Imagery* & *CartoDB Dark Matter*.
- **Visualisasi Grafik:** Chart.js v4.4.0 (Dual-Axis Line & Bar, Spline tension, Canvas Gradients).
- **Desain & Gaya:** Arsitektur CSS murni (Tokens, Glassmorphism, Responsive CSS Grid & Flexbox, Print Styles).

---

## 📦 Panduan Menjalankan Proyek

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka browser pada alamat `http://localhost:5173`.

### 3. Build Produksi
```bash
npm run build
npm run preview
```

---

*KotaTangguh — Mewujudkan 38 Provinsi Nusantara yang Cerdas, Tanggap, dan Tangguh Iklim.*
