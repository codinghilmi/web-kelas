# Daftar Tugas: Website Kelas Sains Data Terapan A

Aturan kerja: satu tugas, satu irisan. Setelah tiap tugas, jalankan verifikasi lalu commit (misalnya `feat: halaman jadwal`).
Uji manual: klik ganda `index.html` (sejak perubahan ke `data/*.js`, server tidak lagi diperlukan).

---

## Fase 1: Fondasi

## Task 1: Kerangka proyek dan token desain  [SELESAI]
**Deskripsi:** Struktur folder, tiga berkas CSS, dan `index.html` kerangka dengan header navigasi dan footer.

**Kriteria penerimaan:**
- [x] Folder sesuai struktur di `plan.md`, repositori git terinisialisasi
- [x] `tokens.css` memuat warna, font (Newsreader, Geist, Geist Mono), spasi sebagai variabel CSS
- [x] Header berisi nama kelas dan 4 tautan dengan `aria-current="page"` pada halaman aktif
- [x] Tidak ada gradien, emoji, atau bayangan tebal

**Verifikasi:**
- [x] Pemeriksaan otomatis daftar larangan (gradien, emoji, font terlarang) lolos
- [ ] Manual (pemilik proyek): buka lewat server lokal, console bersih, tampilan 375px dan 1280px rapi

**Dependensi:** Tidak ada · **Skala:** Medium

## Task 2: Lapisan data dan loader JSON  [SELESAI]
**Deskripsi:** Membuat lima berkas JSON dari data kelas yang sudah diberikan (10 sesi jadwal, 24 mahasiswa, dosen wali) dan helper `loadJSON()` dengan penanganan galat.

**Kriteria penerimaan:**
- [x] `kelas.json`, `jadwal.json`, `anggota.json`, `pengumuman.json` valid
- [x] `jadwal.json` memuat mata kuliah, dosen, ruang, jam, dan penanggung jawab per sesi
- [x] `anggota.json` hanya memuat nama (tanpa NRP dan jenis kelamin)
- [x] Pengurus memakai data asli (fitur piket kemudian dihapus: tidak ada piket di kampus)
- [x] `data.js` mengekspor `loadJSON(path)` yang mengembalikan pesan galat ramah

**Verifikasi:**
- [x] `python3 -m json.tool` lolos untuk kelima berkas
- [ ] Manual (pemilik proyek): satu berkas termuat dari console peramban

**Dependensi:** Task 1 · **Skala:** Kecil

### Checkpoint: Fondasi
- [ ] Server lokal berjalan, console bersih
- [ ] Tidak ada warna atau font ditulis langsung di luar `tokens.css`
- [ ] Tinjau bersama pemilik proyek

---

## Fase 2: Halaman dan Panel  [SELESAI]

Desain berubah menjadi satu halaman dengan panel (lihat `design/menu-p3r.html`), jadi Task 3-6 dikerjakan sebagai pemindahan prototipe ke `index.html` dengan data dari JSON.

## Task 3: Beranda di `index.html`  [SELESAI]
- [x] Latar laut, tulisan vertikal, menu bertumpuk, kotak perintah, jam
- [x] CSS dipecah ke `tokens.css`, `base.css`, `components.css`; JS ke modul `app.js`, `panels.js`, `scene.js`
- [x] Tautan langsung ke panel lewat `#nama-panel`; Esc menghapus tautan dari alamat
- [x] Bila data gagal dimuat, panel menampilkan pesan galat, menu tetap berfungsi

## Task 4: Panel Jadwal  [SELESAI]
- [x] Dibaca dari `jadwal.json`; hari ini terpilih otomatis (akhir pekan menampilkan Senin)
- [x] Tab hari dengan panah kiri/kanan; status "Sedang berlangsung" dan "Berikutnya"

## Task 5: Panel Anggota dan Pengurus  [SELESAI]
- [x] 24 mahasiswa urut abjad dengan pencarian
- [x] Pengurus dari `anggota.json`; jabatan yang sama digabung dalam satu kartu

## Task 6: Panel Pengumuman dan Tugas  [SELESAI]
- [x] Pengumuman terbaru di atas; isi panjang bisa dibuka-tutup
- [x] Tugas urut tenggat terdekat: label H-n, "Hari ini", "Selesai" (lewat tenggat, di bawah)

**Verifikasi (Chromium, server lokal):** semua panel terbuka dengan data benar; jadwal Selasa 12.00 menandai sesi berlangsung dan berikutnya; tugas sisipan terurut benar; tautan `#tugas` langsung membuka panel; galat 404 pada `jadwal.json` tampil sebagai pesan; ponsel 390px tanpa scroll horizontal; tanpa galat JavaScript.

### Checkpoint: Semua panel berfungsi
- [x] Uji otomatis lolos
- [ ] Tinjau bersama pemilik proyek

---

## Fase 3: Penyempurnaan

## Task 7: Ringkasan di Beranda  [DIBATALKAN]
Info hari ini sudah tersedia di panel Jadwal; Beranda dibiarkan bersih.

## Task 8: Aksesibilitas dan responsif  [SELESAI]
Rincian temuan dan perbaikan di `tasks/audit.md`.
- [x] axe-core: 0 pelanggaran di Beranda dan semua panel
- [x] Kontras menu dan label diperbaiki; pengecualian disengaja dicatat
- [x] Tombol "Diamkan latar" (WCAG 2.2.2) dan `prefers-reduced-motion`
- [x] Tidak ada yang terpotong di 6 ukuran layar dan zoom 200%

## Task 10: Pemutar musik  [SELESAI]
- [x] Pemutar sejajar garis batas lempeng putih (sudut dan posisi dihitung dari ukuran layar); mode ringkas di ponsel, tablet, dan layar pendek
- [x] Tombol `<` putar/jeda `>`; judul berjalan bila terlalu panjang; indikator equalizer; kontrol layar kunci (Media Session)
- [x] Daftar lagu dari `data/musik.js`; daftar kosong atau berkas hilang menampilkan pesan, tombol dinonaktifkan
- [x] Dua lagu contoh orisinal (bebas hak cipta)
**Verifikasi:** putar, jeda, berikut, sebelum berfungsi; tidak menabrak menu atau tombol lain di 6 ukuran layar; axe 0 pelanggaran.

## Perubahan: situs bisa dibuka tanpa server  [SELESAI]
- [x] `data/*.json` menjadi `data/*.js`; modul ES menjadi skrip biasa (`defer`)
- [x] Berkas data rusak atau hilang menampilkan pesan di panel terkait
- [x] Prototipe di `design/` diberi tanda "PROTOTIPE LAMA" dan tautan ke `index.html`
**Verifikasi:** dibuka via `file://` dan lewat server, keduanya: 5 menu, musik putar dan ganti lagu, jadwal dengan status, pengurus, pencarian; tanpa galat.

## Perubahan: tata letak sesuai referensi pemilik  [SELESAI]
- [x] Tulisan, garis batas lempeng putih, dan pemutar musik memakai satu sudut yang sama (dihitung di `scene.js`); celah tetap 76px untuk pemutar; tanda < > searah tulisan
- [x] Diukur di 7 ukuran layar desktop/tablet: pemutar tidak menimpa tulisan dan tidak keluar ke laut; panjang judul menyesuaikan lebar celah
- [x] Jam merah rusak diganti jam putih bergaris luar + tanggal (format Indonesia) di kiri bawah
- [x] Ukuran menu disesuaikan agar item terpilih tidak terpotong (diuji dengan font asli Archivo di 10 ukuran layar)

## Fitur: Rangkuman  [SELESAI, terpasang di `index.html`]
Berkas: `data/rangkuman.js`, `assets/js/rangkuman.js`, `assets/css/rangkuman.css`. Model kartu: `design/kartu-tarot.html`.
- [x] Menu keenam "Rangkuman"; tautan langsung `#rangkuman/<matkul>/<minggu>`
- [x] Kartu tarot SVG (kertas krem, bingkai emas, jendela lengkung, pita nama, punggung bermotif); dibagikan tertutup lalu membalik; nama kartu yang disorot tampil di bawah kipas
- [x] Joker (0) dua arah untuk Statistika Dasar dan Pemrograman 1; terbelah ke Teori (kiri) dan Praktikum (kanan)
- [x] Lingkaran 16 minggu, mulai Senin 24 Agustus 2026; UTS (8) dan UAS (16) wajik tanpa rangkuman
- [x] Halaman rangkuman bergaya Notion; tombol "Layar penuh" (tombol F), disembunyikan bila peramban tidak mendukung
- [x] Menu enam item disesuaikan agar tidak menabrak kotak perintah (1280x720)

**Verifikasi (Chromium):** alur lengkap di desktop dan ponsel, dibuka langsung, lewat server, dan dari sub-alamat: tanpa galat konsol, tanpa berkas gagal dimuat. Audit tata letak 0 masalah di 8 ukuran layar. axe-core 0 pelanggaran (menu, kartu, pilih Teori/Praktikum, lingkaran, halaman rangkuman). Layar penuh: nyala, pindah minggu, mati, tutup.
- [ ] Isi rangkuman asli (yang ada masih contoh)

## Fitur: Sunting rangkuman di situs  [KODE SELESAI, MENUNGGU PEMILIK MEMBUAT FIREBASE]
Berkas: `assets/js/awan.js`, `data/sunting.js`, bagian "Sunting di tempat" di `assets/js/rangkuman.js`. Panduan: `SUNTING.md`.
- [x] Tombol Sunting, masuk email + kata sandi, penyunting dengan bilah format dan pratinjau langsung, Simpan (Ctrl+S)
- [x] Penyimpanan Firestore lewat REST; isi awan menggantikan isi berkas per minggu; bila awan tidak terjangkau, isi berkas tetap tampil
- [x] Bentrok dua penyunting terdeteksi (syarat versi); draf otomatis di peramban; konfirmasi sebelum membuang perubahan
- [x] Tanpa konfigurasi: tombol tidak muncul, tidak ada permintaan jaringan

**Verifikasi (Chromium, Firebase tiruan):** 36 pemeriksaan alur di 3 ukuran layar lolos; axe 0 pelanggaran di tiap keadaan; audit lama tetap 0.
- [ ] Pemilik membuat proyek Firebase dan mengisi `data/sunting.js` (lihat `SUNTING.md`)
- [ ] Uji dengan Firebase asli (belum bisa dilakukan tanpa proyeknya)

## Task 9: Terbit dan panduan konten  [SIAP, MENUNGGU PEMILIK]
- [x] Panduan langkah demi langkah di `TERBIT.md` (GitHub Pages, alternatif Netlify, memperbarui isi, kolaborator)
- [x] Diuji dari sub-alamat `/website-kelas/` seperti di GitHub Pages: data, panel, tautan langsung, musik berjalan; tanpa berkas gagal dimuat
- [ ] Pemilik membuat akun, mengunggah, dan menyalakan Pages (perlu akun pemilik)
- [ ] Periksa situs terbit sesuai daftar di `TERBIT.md`
- [ ] Persetujuan kelas bahwa situs publik

### Checkpoint: Selesai
- [ ] Semua kriteria terpenuhi
- [ ] Keputusan privasi data mahasiswa dikonfirmasi
- [ ] Siap diserahkan ke kelas
