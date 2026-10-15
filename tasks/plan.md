# Rencana Implementasi: Website Kelas Sains Data Terapan A

## Ringkasan
Website statis satu halaman untuk kelas Sains Data Terapan A: menu bergaya gim yang membuka panel Jadwal, Anggota, Pengurus, Pengumuman, dan Tugas. Semua konten disimpan di berkas JSON agar bisa diperbarui tanpa menyentuh HTML. Tampilan mengikuti minimalist-ui: palet monokrom hangat, tipografi editorial, kartu datar, tanpa gradien dan bayangan tebal. **Tanpa foto** (keputusan pemilik proyek).

## Data Kelas yang Sudah Diketahui
- Nama kelas: Sains Data Terapan A
- Dosen wali: Alfi Fadliana, S.Si., M.Stat.
- Hari kuliah: Senin sampai Jumat (jadwal dan ruang sudah diberikan, 10 sesi)
- Mahasiswa: 24 orang (NRP, nama, jenis kelamin sudah diberikan)
- Pengurus: Komandan Tingkat (Hibat), Wakil Komandan Tingkat (Saskia), Sekretaris (Alina, Shasya), Bendahara (Shafira, Fauzan). Nama panggilan dicocokkan ke satu nama lengkap di daftar mahasiswa.
- Tiap sesi jadwal punya satu nama dalam tanda kurung (mis. GHAZI, HILMI). Diasumsikan penanggung jawab mata kuliah dari antara anggota kelas. **Perlu dikonfirmasi.**

## Keputusan Arsitektur
- **HTML, CSS, dan JavaScript murni, tanpa framework dan tanpa build.** Empat halaman dan data kecil.
- **Data di `data/*.js`** (awalnya JSON). Isinya berformat JSON dengan satu baris pembuka, sehingga situs bisa dibuka dengan klik ganda tanpa server. Mengganti jadwal, anggota, atau pengumuman cukup mengedit satu berkas.
- **Satu halaman dengan panel** (menggantikan rencana awal 4 halaman, mengikuti desain menu). Setiap panel punya tautan langsung `#jadwal`, `#anggota`, `#pengurus`, `#pengumuman`, `#tugas`.
- **Skrip biasa dengan `defer`** (`panels.js`, `scene.js`, `music.js`, `app.js`), bukan modul ES, agar berjalan juga dari `file://`.
- **Hosting statis gratis** (GitHub Pages atau Netlify).
- **Irisan vertikal.** Tiap halaman dibangun utuh sebelum lanjut.
- **Privasi data:** JSON di situs statis bersifat publik. Yang dimuat hanya nama dan jabatan. NRP dan jenis kelamin tidak ditampilkan dan tidak perlu disimpan di `anggota.json`, kecuali situs dibatasi aksesnya.

## Arah Desain (diperbarui)
Usulan (menunggu persetujuan): arah **menu interaktif terinspirasi Persona 3 Reload** (prototipe: `design/menu-p3r.html`):
- Beranda berupa menu bertumpuk: kata besar miring, item terpilih merah di atas pelat segitiga putih bertepi merah muda
- Laut realistis: gradasi kedalaman, permukaan air dilihat dari bawah dengan pola kaustik (filter SVG, statis), berkas cahaya, partikel melayang, gelembung; lempeng putih kiri dengan tulisan vertikal tetap
- Lempeng putih kiri dengan tulisan vertikal nama kelas; kotak "hari ini" di kiri atas; kotak perintah dan petunjuk tombol di kanan bawah
- Setiap menu membuka panel geser dari kanan dengan pita atas bergradien putih-biru, garis merah muda, dan judul bayangan besar; jadwal menampilkan nomor sesi, blok jam, serta status "sedang berlangsung" dan "berikutnya"
- Gradien diizinkan (permintaan pemilik proyek), menggantikan larangan gradien dari minimalist-ui
- Kontrol: panah atas/bawah atau W/S, Enter, Esc, klik/ketuk; panel menjaga fokus dan mengembalikannya saat ditutup
- Tanpa objek utama (diputuskan pemilik proyek)
- Jam dan tanggal (angka bergaris luar putih) di kiri bawah dekat tepi lempeng, sesuai referensi pemilik proyek
- Tulisan vertikal, garis batas lempeng putih, dan pemutar musik sejajar satu sudut; pemutar berada di celah tetap antara tulisan dan garis batas, tanda < > searah tulisan
- Tulisan vertikal "SAINS DATA / TERAPAN A" memenuhi tinggi layar (ukuran dihitung otomatis)
- Tidak memakai karakter, logo, atau teks milik gim
- Huruf: Archivo 900 miring (judul/menu), Geist (isi), Geist Mono (meta)

Catatan: bila usulan di atas disetujui, bagian minimalist-ui di bawah ini digantikan.

## Panduan Desain Awal (minimalist-ui)
| Aspek | Aturan |
|---|---|
| Font judul | Newsreader (serif), letter-spacing -0.03em, line-height 1.1 |
| Font isi | Geist, cadangan Helvetica Neue. Bukan Inter, Roboto, Open Sans |
| Font meta | Geist Mono |
| Warna teks | `#2F3437` / `#111111`, sekunder `#787774`. Tidak pernah `#000000` |
| Latar | `#FBFBFA`, `#F7F6F3`, `#FFFFFF` |
| Kartu | `1px solid #EAEAEA`, radius 8-12px, padding 24-40px |
| Tombol utama | `#111111`, teks putih, radius 6px, tanpa bayangan |
| Badge | Pil kecil huruf kapital, pastel merah/biru/hijau/kuning |
| Ikon | Phosphor (bold) atau Radix. Bukan Lucide, Feather, Heroicons |
| Gerak | Fade-in saat scroll lewat IntersectionObserver, hanya `transform` dan `opacity` |
| Dilarang | Gradien, emoji, bayangan tebal, nama palsu, kata klise |

## Struktur Proyek
```
website-kelas/
├── index.html              # Satu-satunya halaman: latar laut, menu, panel
├── README.md
├── assets/
│   ├── css/  tokens.css · base.css · components.css
│   ├── js/   app.js · panels.js · scene.js · music.js
│   ├── icons/  favicon dan ikon layar utama
│   └── music/  berkas lagu
├── data/     kelas.js · jadwal.js · anggota.js · pengumuman.js · musik.js
├── design/   prototipe dan catatan desain
└── tasks/    plan.md · todo.md
```

## Graf Dependensi
```
Task 1 Kerangka dan token desain
    │
    ├── Task 2 Lapisan data
    │       ├── Task 4 Jadwal kuliah
    │       ├── Task 5 Anggota kelas
    │       └── Task 6 Pengumuman ──┐
    └── Task 3 Beranda (hero) ──────┴── Task 7 Ringkasan Beranda
                                              │
                                        Task 8 Gerak, responsif, aksesibilitas
                                              │
                                        Task 9 Deploy dan panduan konten
```

## Daftar Tugas
Rincian di `tasks/todo.md`.

### Fase 1: Fondasi
- [x] Task 1: Kerangka proyek dan token desain
- [x] Task 2: Lapisan data dan loader JSON

### Fase 2: Halaman dan Panel
- [x] Task 3: Beranda (latar laut, menu, jam) di `index.html`
- [x] Task 4: Panel Jadwal kuliah
- [x] Task 5: Panel Anggota dan Pengurus
- [x] Task 6: Panel Pengumuman dan Tugas

### Fase 3: Penyempurnaan
- [-] Task 7: Ringkasan di Beranda (dibatalkan: info hari ini sudah ada di panel Jadwal)
- [x] Task 8: Aksesibilitas dan responsif (lihat `tasks/audit.md`)
- [x] Task 10: Pemutar musik di tepi lempeng putih (`data/musik.js`)
- [~] Task 9: Terbit (panduan `TERBIT.md` siap; menunggu akun pemilik)

## Risiko dan Mitigasi
| Risiko | Dampak | Mitigasi |
|---|---|---|
| Situs dibuka langsung via `file://` | Teratasi | Data dan skrip dimuat sebagai skrip biasa; diuji berjalan tanpa server |
| Data pribadi (NRP) terbuka untuk umum | Tinggi | Jangan masukkan NRP ke JSON publik; pertimbangkan situs privat |
| Pengumuman usang | Sedang | Tiap item punya tanggal dan tenggat; yang lewat berbadge "Selesai" |
| Gaya melenceng dari minimalist-ui | Rendah | Semua nilai desain hanya lewat `tokens.css`; cek daftar larangan di tiap checkpoint |
| Tabel jadwal sulit dibaca di ponsel | Sedang | Satu hari per tab di layar kecil |

## Pertanyaan Terbuka
- Tidak ada piket di kampus; fitur piket dihapus dari seluruh situs (keputusan pemilik proyek).
- Arti nama dalam tanda kurung di jadwal (penanggung jawab mata kuliah?).
- Dua dosen pada Pengembangan Karakter dan Pancasila dipisah garis miring: tampilkan keduanya?
- Situs publik atau hanya untuk anggota kelas?
