# Panduan Menerbitkan Situs (GitHub Pages)

Hasil akhirnya situs di alamat `https://NAMA-AKUN.github.io/website-kelas/` yang bisa dibuka siapa saja dari ponsel atau komputer, tanpa server lokal. Semua langkah dilakukan di peramban; tidak perlu memasang aplikasi.

Sebelum mulai: GitHub Pages gratis hanya untuk repositori publik. Siapa pun yang tahu alamatnya bisa melihat nama mahasiswa, nama dosen, jadwal, dan ruang. Pastikan kelas setuju.

Nama menu di GitHub bisa sedikit berbeda dari panduan ini karena tampilannya sesekali diperbarui.

## 1. Buat akun dan repositori
1. Daftar di https://github.com (gratis). Nama akun akan menjadi bagian alamat situs.
2. Klik tombol **New** (atau ikon **+** di kanan atas, lalu **New repository**).
3. Isi **Repository name**: `website-kelas`. Pilih **Public**. Jangan centang pilihan menambah README.
4. Klik **Create repository**.

## 2. Unggah berkas
1. Di halaman repositori yang masih kosong, klik tautan **uploading an existing file**.
2. Ekstrak `website-kelas.zip` di komputer, buka folder `website-kelas`, lalu seret **isi** folder itu (berkas `index.html`, folder `assets`, `data`, dan seterusnya), bukan folder `website-kelas` itu sendiri.
3. Tunggu semua berkas selesai terunggah, lalu klik **Commit changes**.
4. Pastikan `index.html` terlihat langsung di halaman utama repositori, tidak di dalam subfolder.

## 3. Nyalakan GitHub Pages
1. Di repositori, buka **Settings**, lalu menu **Pages** di sisi kiri.
2. Pada **Build and deployment**, bagian **Source**, pilih **Deploy from a branch**.
3. Pada **Branch**, pilih `main` dan folder `/ (root)`, lalu **Save**.
4. Tunggu 1-2 menit dan muat ulang halaman Pages. Alamat situs muncul di bagian atas.

## 4. Periksa
- Buka alamatnya. Menu dan tulisan vertikal muncul, jam merah di bawah berkedip.
- Buka `ALAMAT#jadwal`: panel Jadwal langsung terbuka.
- Tekan putar di pemutar musik; tombol `<` dan `>` mengganti lagu.
- Buka dari ponsel juga.

## Memperbarui isi
- **Mengedit data** (jadwal, anggota, pengumuman, tugas, daftar musik): buka berkasnya di repositori, misalnya `data/pengumuman.js`, klik ikon pensil, ubah, lalu **Commit changes**. Situs berubah dalam 1-2 menit.
- **Menambah lagu**: masuk ke folder `assets/music`, pilih **Add file**, **Upload files**, lalu tambahkan barisnya di `data/musik.js`.
- Bila setelah diubah tampilan belum berganti, muat ulang paksa dengan Ctrl+Shift+R.

## Mengatur siapa yang boleh mengedit
- Pengunjung situs tidak bisa mengedit apa pun.
- Di repositori, hanya pemilik akun yang bisa mengubah berkas. Untuk menambah pengurus: **Settings**, **Collaborators**, **Add people**, masukkan nama akun GitHub mereka.

## Alternatif tanpa GitHub: Netlify
Buka https://app.netlify.com/drop, seret folder `website-kelas`, dan situs langsung terbit. Daftar akun agar situsnya tidak hilang. Kekurangannya: setiap perubahan isi berarti mengunggah ulang seluruh folder.
