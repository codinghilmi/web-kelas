# Menyunting Rangkuman Langsung di Situs (Panduan Firebase Terbaru)

Halaman rangkuman materi memiliki tombol **Sunting**. Penyunting (misalnya sekretaris atau PJ mata kuliah) dapat masuk dengan akun email dan kata sandi, menulis catatan materi langsung di halaman tersebut (dengan pratinjau langsung bergaya Notion), lalu menekan **Simpan** (atau Ctrl+S). Semua pengunjung akan langsung melihat materi versi terbaru tanpa perlu mengubah kode sumber atau mengunggah ulang berkas.

Data rangkuman disimpan di **Firebase Cloud Firestore** (layanan Google, paket gratis selamanya *"Spark"*). Fitur ini aktif setelah langkah setup di bawah ini dilakukan sekali oleh pengelola web.

---

## 1. Buat Proyek Firebase Baru
1. Buka [https://console.firebase.google.com](https://console.firebase.google.com) dan masuk menggunakan akun Google Anda.
2. Klik tombol **Add project** (atau **Buat proyek** / tanda `+`).
3. Masukkan nama proyek, misalnya: `sdt-a` atau `website-kelas` -> klik **Continue**.
4. Pada opsi *Google Analytics*, geser ke **Off / Nonaktifkan** (tidak diperlukan) -> klik **Create project**.
5. Tunggu hingga proses selesai beberapa detik, lalu klik **Continue**. Anda akan diarahkan ke halaman *Project Overview*.

---

## 2. Nyalakan Database (Cloud Firestore)
1. Perhatikan menu di bilah sisi kiri (**sidebar**):
   - Klik menu **Build** > **Firestore Database** (atau cari **Cloud Firestore** di menu *All products* / *Semua produk*).
2. Klik tombol **Create database** (Buat database).
3. **Konfigurasi Database:**
   - **Database ID:** Biarkan default `(default)`.
   - **Location:** Pilih lokasi server terdekat, yaitu **`asia-southeast2` (Jakarta)** atau `asia-southeast1` (Singapore).
   - Klik **Next**.
4. **Aturan Keamanan (Secure rules):**
   - Pilih **Start in production mode** (Mulai dalam mode produksi).
   - Klik **Create** (atau **Enable**).
5. **Pasang Aturan Akses (Rules):**
   - Setelah database aktif, klik tab **Rules** (Aturan) di bagian atas (di samping tab *Data*).
   - Hapus semua isi kodenya, lalu tempel aturan keamanan berikut:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /editor/{email} {
      allow read: if request.auth != null;
    }
    match /rangkuman/{id} {
      allow read: if true;
      allow create, update: if request.auth != null
        && exists(/databases/$(database)/documents/editor/$(request.auth.token.email))
        && request.resource.data.keys().hasOnly(['judul', 'penulis', 'isi'])
        && request.resource.data.judul is string && request.resource.data.judul.size() <= 120
        && request.resource.data.penulis is string && request.resource.data.penulis.size() <= 80
        && request.resource.data.isi is string && request.resource.data.isi.size() <= 30000;
      allow delete: if false;
    }
    match /pengumuman/{id} {
      allow read: if true;
      allow create, update, delete: if request.auth != null
        && exists(/databases/$(database)/documents/editor/$(request.auth.token.email));
    }
    match /tugas/{id} {
      allow read: if true;
      allow create, update, delete: if request.auth != null
        && exists(/databases/$(database)/documents/editor/$(request.auth.token.email));
    }
  }
}
```

6. Klik tombol **Publish** (Terbitkan) di sudut kanan atas editor aturan.

> **Penjelasan aturan:** Semua pengunjung publik boleh membaca rangkuman, pengumuman, dan tugas (`allow read: if true`). Hanya akun yang terdaftar di koleksi `editor` yang diizinkan menulis/mengubah/menghapus. Rangkuman tidak dapat dihapus dari web (`allow delete: if false`), sedangkan pengumuman dan tugas dapat dihapus oleh penyunting.

---

## 3. Nyalakan Masuk dengan Email (Authentication)
1. Di sidebar kiri, klik menu **Authentication** (di bawah menu *Build* atau di *All products*).
2. Jika baru pertama kali dibuka, klik tombol **Get started** (Mulai).
3. Anda akan masuk ke tab **Sign-in method**.
4. Pada daftar *Sign-in providers*, pilih baris **Email/Password**.
5. Aktifkan saklar pertama: **Enable** pada *Email/Password*. (Opsi *Email link / passwordless* biarkan mati).
6. Klik **Save** (Simpan).

---

## 4. Daftarkan Akun Penyunting (Sekretaris / Pengurus)
Setiap orang yang diizinkan menyunting rangkuman harus didaftarkan di **2 tempat berurutan**:

### Langkah A: Buat Akun Login di Authentication
1. Pada menu **Authentication**, buka tab **Users** (Pengguna) di bagian atas.
2. Klik tombol **Add user** (Tambah pengguna).
3. Masukkan **Email** dan **Password** (misal: `sekretaris@kelas.com` dan kata sandi rahasia).
4. Klik **Add user**. Berikan kata sandi ini kepada penyunting secara pribadi.

### Langkah B: Daftarkan Hak Tulis di Firestore
1. Kembali ke menu **Firestore Database** di sidebar kiri, lalu klik tab **Data**.
2. Klik **+ Start collection** (Mulai koleksi):
   - **Collection ID:** ketik persis `editor` (huruf kecil semua) -> klik **Next**.
   - **Document ID:** masukkan alamat email penyunting dengan **huruf kecil semua** (misal: `sekretaris@kelas.com`).
   - **Field:**
     - Field: `nama`
     - Type: `string`
     - Value: `Nama Penyunting`
   - Klik **Save** (Simpan).
3. *Untuk menambah penyunting berikutnya di kemudian hari:* Cukup klik tombol **+ Add document** di dalam kolom koleksi `editor`, lalu masukkan email barunya pada **Document ID**.

> **Mencabut hak sunting:** Cukup hapus dokumen email tersebut dari koleksi `editor` (dan nonaktifkan akunnya di tab Authentication).

---

## 5. Sambungkan ke Website ([data/sunting.js](data/sunting.js))
1. Di sidebar kiri paling atas, klik ikon **Roda Gigi (Settings / Setelan Proyek)** di sebelah tulisan *Project Overview* -> pilih **Project settings**.
2. Pada tab **General** (Umum), gulir ke bawah ke bagian **Your apps** (Aplikasi Anda).
3. Klik ikon web: **`</>`**.
4. Masukkan nama aplikasi (misal: `web-kelas`). Opsi *Firebase Hosting* **tidak perlu dicentang**.
5. Klik **Register app**.
6. Firebase akan menampilkan cuplikan konfigurasi. Temukan nilai `projectId` dan `apiKey`:
   - `"projectId": "..."`
   - `"apiKey": "AIzaSy..."`
7. Buka berkas [`data/sunting.js`](data/sunting.js) di proyek web ini, lalu masukkan kedua nilai tersebut:

```javascript
window.DATA = window.DATA || {};
window.DATA.sunting = {
  "projectId": "nama-proyek-anda-12345",
  "apiKey": "AIzaSyDxxxxxxxxx"
};
```
8. Simpan berkas `data/sunting.js`.

> **Catatan Keamanan:** Kedua nilai ini memang dirancang untuk terlihat publik di sisi browser. Keamanan data dijaga oleh aturan (*Rules*) Firestore yang dipasang pada Langkah 2, bukan oleh kerahasiaan `apiKey`.

---

## 6. Uji Coba Langsung di Situs
1. Buka situs Anda ([`index.html`](index.html)).
2. Masuk ke menu **Rangkuman**, pilih salah satu mata kuliah, lalu pilih minggu tertentu.
3. Tombol **Sunting** ✏️ sekarang akan otomatis muncul di sudut kanan atas.
4. Klik tombol **Sunting**, masukkan email dan kata sandi yang telah didaftarkan, lalu coba tulis rangkuman dan tekan **Simpan**.

---

## Informasi Tambahan & Cara Kerja
- **Prioritas Tampilan:** Catatan yang tersimpan di Firebase secara otomatis menggantikan isi contoh di `data/rangkuman.js` untuk minggu tersebut. Jika suatu minggu belum ada catatan di Firebase, web tetap menampilkan isi bawaan dari berkas lokal.
- **Konflik Sunting Bersamaan:** Jika ada dua orang yang menyunting materi di saat bersamaan, sistem akan mendeteksi perbedaan versi saat menyimpan dan memberi peringatan agar tidak saling menimpa.
- **Fitur Draf Otomatis:** Tulisan yang belum sempat disimpan akan diingat otomatis di peramban perangkat tersebut, sehingga tidak hilang jika halaman tidak sengaja tertutup.
- **Dukungan Offline:** Jika koneksi internet terputus atau Firebase bermasalah, situs tetap dapat dibuka normal untuk membaca materi bawaan; hanya fitur simpan awan yang sementara dinonaktifkan.
- **Batas Karakter:** Judul maksimal 120 karakter, nama penulis maksimal 80 karakter, dan isi materi maksimal 30.000 karakter per minggu. Kuota gratis Firebase Spark (50.000 baca/hari) sangat melimpah untuk kebutuhan satu kelas.
