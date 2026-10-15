# Audit Task 8: Aksesibilitas, Responsif, Pedoman Antarmuka

Alat: axe-core 4 (otomatis, Beranda + kelima panel), Web Interface Guidelines (Vercel, diambil terbaru), hitung kontras WCAG manual, Chromium di 7 ukuran layar.

## Diperbaiki

### index.html
- tidak ada landmark `<main>` dan `<h1>` (axe) → menu dibungkus `<main>`, ditambah `<h1>` tersembunyi
- `meta theme-color` tidak ada → `#0d3fe6`
- nama kelas bisa rusak oleh terjemahan otomatis → `translate="no"`
- gerak dekoratif terus-menerus tanpa tombol henti (WCAG 2.2.2) → tombol "Diamkan latar" + tombol M, pilihan diingat

### assets/css/components.css
- menu tidak terpilih: kontras 1.0-1.6:1 (butuh 3:1 teks besar) → warna lebih terang + bayangan biru tua, 3.7-7.4:1 di area menu
- label kecil putih di merah `#ff2033`: 3.8:1 (butuh 4.5:1) → merah tua `--red-strong` `#d90016`, 5.3:1
- tugas lewat tenggat memakai `opacity: .6`, teks jadi 2.6:1 → warna redup tanpa opacity
- ponsel 360px: kata "PENGUMUMAN" terpotong di kanan → ukuran menu ponsel diperkecil
- ponsel mendatar: menu menabrak kotak perintah → kotak perintah disembunyikan pada tinggi ≤ 480px; ukuran menu ikut tinggi layar
- notch/area aman ponsel diabaikan → `env(safe-area-inset-*)` untuk kotak perintah, panel, menu
- panel geser tanpa `overscroll-behavior: contain` → ditambahkan
- tanpa `touch-action: manipulation` → ditambahkan pada tombol dan tautan

### assets/js/app.js
- item menu berupa `<button>` padahal membuka alamat `#panel` → kini `<a href="#jadwal">` dst. (bisa dibuka di tab baru, disalin)
- teks muat "Memuat data" → "Memuat data…"
- jebakan fokus panel tidak menyertakan tautan → ditambahkan

### assets/js/panels.js
- format tanggal manual → `Intl.DateTimeFormat("id-ID")`
- tab hari: semua tab bisa di-Tab, tanpa `tabpanel` → pola ARIA tab lengkap (tabindex bergulir, `aria-controls`, `tabpanel`)
- pencarian: tanpa `name`, `spellcheck`, placeholder tanpa "…" → dilengkapi
- pesan galat hanya menyebut masalah → ditambah langkah lanjut
- nama orang bisa rusak oleh terjemahan otomatis → `translate="no"` pada nama

## Diterima dengan sengaja
- `components.css` `.item:focus-visible { outline: none }`: fokus keyboard selalu sama dengan item terpilih (merah besar + pelat putih), jadi itulah penanda fokusnya, lebih kuat dari garis fokus biasa
- Teks menu di area paling terang (dekat permukaan air) kontras dasarnya ~2.1:1; bayangan biru tua di sekeliling huruf membuatnya tetap terbaca, tetapi alat ukur kontras tidak menghitung bayangan
- Jam merah di kejauhan sengaja pudar; hiasan, disembunyikan dari pembaca layar

## Hasil akhir
- axe-core: 0 pelanggaran di Beranda dan kelima panel
- Tata letak: tidak ada yang terpotong di tablet tegak 768×1024, tablet mendatar 1024×768, ponsel 390×844, ponsel kecil 360×640, ponsel mendatar 844×390, zoom 200%
- Uji fungsi: semua panel, tautan langsung, galat data, pencarian, urutan tugas tetap lolos; tanpa galat JavaScript
