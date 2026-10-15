<<<<<<< HEAD
# Website Kelas Sains Data Terapan A

Situs satu halaman (HTML, CSS, JavaScript murni, tanpa framework) dengan menu bergaya menu gim: Jadwal, Anggota, Pengurus, Pengumuman, Tugas, Rangkuman. Setiap menu membuka panel yang isinya dibaca dari berkas di folder `data/`.

## Menerbitkan
Lihat `TERBIT.md` untuk langkah menerbitkan ke GitHub Pages (atau Netlify).

## Membuka situs di komputer
Klik ganda `index.html`. Tidak perlu server; semua fitur (menu, panel, musik) berjalan langsung.

Catatan: folder `design/` hanya arsip desain (prototipe lama dan model kartu). Situs sebenarnya hanya `index.html`.

## Kontrol
- Panah atas/bawah (atau W/S) memilih menu, Enter membuka, Esc menutup.
- Di panel Jadwal, panah kiri/kanan berpindah hari.
- Setiap panel punya tautan langsung, misalnya `index.html#jadwal` atau `index.html#tugas`.
- Di Rangkuman: panah kiri/kanan berpindah kartu, Enter memilih; di halaman rangkuman panah kiri/kanan berpindah minggu, F untuk layar penuh; Esc mundur satu tingkat.
- Tombol "Diamkan latar" (atau tombol M) menghentikan gerak hiasan latar; pilihannya diingat peramban.

## Mengubah isi
Semua isi ada di folder `data/`, satu berkas `.js` per bagian. Setiap berkas diawali komentar singkat; ubah hanya isi setelah tanda `=`. Penulisannya sama seperti JSON: teks diapit tanda kutip ganda dan antar-item dipisah koma. Bila ada salah ketik, panel terkait menampilkan pesan galat dan bagian lain tetap berjalan.

- `kelas.js`: nama kelas, dosen wali, hari kuliah.
- `jadwal.js`: sesi per hari. Contoh satu sesi:
  ```json
  { "matkul": "Matematika 1", "dosen": ["Ira Prasetyaningrum"], "ruang": "B 201",
    "mulai": "13.50", "selesai": "15.30", "pj": "Chris", "jenis": "kuliah" }
  ```
  `jenis` berisi `"kuliah"` atau `"praktikum"`. Jam ditulis dengan titik (`13.50`).
- `anggota.js`: dosen wali, pengurus (jabatan yang sama boleh lebih dari satu orang), dan daftar nama mahasiswa.
- `pengumuman.js`: pengumuman dan tugas dalam satu daftar. Contoh tugas:
  ```json
  { "jenis": "tugas", "judul": "Laporan praktikum 3", "tanggal": "2026-10-01",
    "isi": "Kumpulkan di LMS.", "matkul": "Praktikum Statistika Dasar", "tenggat": "2026-10-09" }
  ```
  Untuk pengumuman, isi `"jenis": "pengumuman"` dan biarkan `matkul` serta `tenggat` bernilai `null`. Tugas yang lewat tenggat otomatis bertanda "Selesai".

## Rangkuman
Menu Rangkuman menampilkan kartu tarot per mata kuliah. Mata kuliah yang punya teori dan praktikum menjadi kartu Joker; saat dipilih kartunya terbelah menjadi Teori (kiri) dan Praktikum (kanan). Setelah itu muncul lingkaran 16 minggu (UTS minggu 8 dan UAS minggu 16 berbentuk wajik, tanpa rangkuman), lalu halaman rangkuman bergaya Notion dengan tombol layar penuh.

Semua isinya ada di `data/rangkuman.js`:
- `semester`: tanggal Senin minggu pertama, jumlah minggu, minggu UTS dan UAS.
- Tiap mata kuliah: `nama`, `jenis` (`"teori"`/`"praktikum"`), `dosen`, `simbol` dan `julukan` untuk kartu, serta `grup` yang sama untuk pasangan teori-praktikum.
- `minggu`: rangkuman per nomor minggu. Contoh:
  ```js
  "4": { judul: "Peluang dasar", penulis: "Nama", isi: `
  ## Judul bagian
  - poin
  ! kotak catatan
  + Bagian buka-tutup
    isinya diawali dua spasi
  - [x] tugas selesai
  ` }
  ```
  Format lengkapnya tertulis di bagian atas berkas. Hapus `status: "contoh"` pada rangkuman yang sudah asli.

Tautan langsung: `index.html#rangkuman/statistika-dasar/3` membuka rangkuman Statistika Dasar minggu 3.

### Menyunting langsung di situs
Halaman rangkuman bisa disunting di tempat (tombol **Sunting**, masuk dengan akun penyunting, pratinjau langsung, **Simpan** atau Ctrl+S). Tulisan disimpan di Firebase dan langsung terlihat semua pengunjung. Fitur ini menyala setelah `data/sunting.js` diisi; langkahnya ada di `SUNTING.md`.

## Musik
Pemutar musik ada di tepi lempeng putih (di ponsel dan tablet: pelat putih di kanan atas). Tombol `<` dan `>` berpindah lagu, tombol tengah memutar atau menjeda. Musik tidak berbunyi otomatis; peramban mewajibkan pengunjung menekan putar dulu.

Menambah lagu:
1. Simpan berkas `.mp3` di `assets/music/`.
2. Tambahkan ke `data/musik.js`:
   ```json
   { "judul": "Nama Lagu", "artis": "Nama Artis", "berkas": "assets/music/nama-lagu.mp3" }
   ```

Pakai hanya lagu milik sendiri atau berlisensi bebas (misalnya YouTube Audio Library, Free Music Archive dengan lisensi yang mengizinkan). Mengunggah lagu berhak cipta, termasuk musik gim, ke situs publik melanggar hak cipta. Dua lagu bawaan (`arus-tenang.mp3`, `lampu-dasar-laut.mp3`) dibuat khusus untuk situs ini dan bebas dipakai atau dihapus.

## Struktur
- `index.html`: satu-satunya halaman.
- `assets/css/`: `tokens.css` (warna, huruf, gerak), `base.css` (dasar), `components.css` (laut, menu, panel), `rangkuman.css` (kartu, lingkaran minggu, halaman rangkuman).
- `assets/js/`: `app.js` (menu, panel, keyboard, tautan langsung), `panels.js` (isi panel dari data), `scene.js` (tulisan vertikal miring, jam dan tanggal), `music.js` (pemutar musik), `rangkuman.js` (menu Rangkuman dan penyuntingnya), `awan.js` (penyimpanan Firebase); semuanya skrip biasa agar bisa dibuka tanpa server.
- `assets/music/`: berkas lagu.
- `design/`: prototipe desain dan catatannya.
- `tasks/`: rencana (`plan.md`) dan daftar tugas (`todo.md`).

## Privasi
Berkas data di situs statis bisa dibaca siapa pun yang membuka situsnya. Karena itu hanya nama dan jabatan yang dimuat; NRP, jenis kelamin, dan kontak pribadi tidak disimpan.
=======
Haloooo
>>>>>>> 80ceba772e17a61405800ea3dfd39a9602d8d332
