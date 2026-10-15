// Rangkuman materi per mata kuliah per minggu.
// semester.mulai : Senin minggu pertama kuliah
// semester.minggu: jumlah minggu satu semester (termasuk UTS dan UAS)
// semester.uts / semester.uas: minggu ke berapa ujian berlangsung (tidak punya rangkuman)
// simbol         : gambar di kartu tarot: kurva, kurung, integral, alir, jaringan, buku, lima, tunas
// julukan        : tulisan kecil di bawah gambar kartu (boleh dikosongkan)
// jenis              : "teori" atau "praktikum"
// grup               : sama untuk pasangan teori-praktikum; satu kartu, lalu pilih kiri (Teori) / kanan (Praktikum)
//
// Cara menulis isi (mirip Notion), di dalam tanda ` ... `:
//   ## Judul bagian        ### Subjudul
//   - poin                 1. poin bernomor
//   - [ ] tugas            - [x] tugas selesai
//   > kutipan              ! kotak catatan (callout)
//   + Judul bagian yang bisa dibuka-tutup
//     (baris isinya diawali dua spasi)
//   ---  garis pemisah     **tebal**  *miring*  `kode`
window.DATA = window.DATA || {};
window.DATA.rangkuman = {
  semester: { mulai: "2026-08-24", minggu: 16, uts: 8, uas: 16 },
  matkul: [
    {
      id: "statistika-dasar", julukan: "Sang Penafsir", grup: "statistika", simbol: "kurva", nama: "Statistika Dasar", jenis: "teori", dosen: "Ronny Susetyoko",
      minggu: {
        "1": {
          judul: "Pengantar statistika dan jenis data", penulis: "Contoh", status: "contoh",
          isi: `
! Contoh isi. Ganti dengan rangkuman kelas.

## Dua cabang statistika
- **Statistika deskriptif** merangkum dan menyajikan data: tabel, grafik, ukuran pemusatan.
- **Statistika inferensial** menarik kesimpulan tentang populasi dari sampel.

## Populasi dan sampel
Populasi adalah seluruh objek yang ingin diteliti. Sampel adalah bagian populasi yang benar-benar diamati.

> Sampel yang baik mewakili populasinya; cara pengambilannya sama pentingnya dengan ukurannya.

## Skala pengukuran
1. **Nominal**: kategori tanpa urutan (golongan darah).
2. **Ordinal**: kategori berurutan (tingkat kepuasan).
3. **Interval**: selisih bermakna, tanpa nol mutlak (suhu Celsius).
4. **Rasio**: punya nol mutlak (berat, tinggi).

+ Kenapa skala penting?
  Skala menentukan ukuran dan uji statistik yang boleh dipakai. Rata-rata, misalnya, tidak bermakna untuk data nominal.

---
- [x] Baca bab 1 buku pegangan
- [ ] Kerjakan latihan skala pengukuran
`
        },
        "2": {
          judul: "Ukuran pemusatan", penulis: "Contoh", status: "contoh",
          isi: `
! Contoh isi. Ganti dengan rangkuman kelas.

## Rata-rata, median, modus
- **Rata-rata** peka terhadap pencilan.
- **Median** lebih tahan untuk data yang miring.
- **Modus** satu-satunya ukuran pemusatan untuk data nominal.
`
        },
        "3": {
          judul: "Ukuran penyebaran", penulis: "Contoh", status: "contoh",
          isi: `
! Contoh isi. Ganti dengan rangkuman kelas.

## Seberapa menyebar datanya?
- **Jangkauan** = nilai terbesar - nilai terkecil. Mudah, tapi hanya memakai dua nilai.
- **Varians** dan **simpangan baku** mengukur jarak rata-rata data dari rata-ratanya.
`
        }
      }
    },
    {
      id: "praktikum-statistika-dasar", julukan: "Sang Penafsir", grup: "statistika", simbol: "kurva", nama: "Praktikum Statistika Dasar", jenis: "praktikum", dosen: "Ronny Susetyoko",
      minggu: {
        "1": {
          judul: "Mengenal lembar kerja dan data", penulis: "Contoh", status: "contoh",
          isi: `
! Contoh isi. Ganti dengan rangkuman kelas.

## Yang dikerjakan
1. Membuka berkas data contoh.
2. Merapikan nama kolom dan tipe data.
3. Menghitung rata-rata dan median tiap kolom angka.

+ Kesalahan yang sering terjadi
  - Angka tersimpan sebagai teks, sehingga tidak bisa dihitung.
  - Baris kosong di tengah data ikut terhitung.
`
        }
      }
    },
    {
      id: "pemrograman-1", julukan: "Sang Perakit", grup: "pemrograman", simbol: "kurung", nama: "Pemrograman 1", jenis: "teori", dosen: "Dian Septiani Santoso",
      minggu: {
        "1": {
          judul: "Variabel, tipe data, dan masukan-keluaran", penulis: "Contoh", status: "contoh",
          isi: `
! Contoh isi. Ganti dengan rangkuman kelas.

## Variabel dan tipe data
Variabel menyimpan nilai. Tipe data menentukan operasi yang bisa dilakukan, misalnya \`int\`, \`float\`, dan \`str\`.

## Masukan pengguna
Masukan dari pengguna dibaca sebagai teks. Ubah dulu tipenya sebelum dihitung, misalnya dengan \`int(...)\`.
`
        }
      }
    },
    { id: "praktikum-pemrograman-1", julukan: "Sang Perakit", grup: "pemrograman", simbol: "kurung", nama: "Praktikum Pemrograman 1", jenis: "praktikum", dosen: "Dian Septiani Santoso", minggu: {} },
    { id: "workshop-sistem-operasi", julukan: "Sang Penghubung", simbol: "jaringan", nama: "Workshop Sistem Operasi dan Jaringan", jenis: "praktikum", dosen: "Yesta Medya Mahardhika", minggu: {} },
    { id: "matematika-1", julukan: "Sang Penghitung", simbol: "integral", nama: "Matematika 1", jenis: "teori", dosen: "Ira Prasetyaningrum", minggu: {} },
    { id: "logika-algoritma", julukan: "Sang Perancang", simbol: "alir", nama: "Logika dan Algoritma", jenis: "teori", dosen: "Nana Ramadjianti", minggu: {} },
    { id: "agama", julukan: "Sang Penuntun", simbol: "buku", nama: "Agama", jenis: "teori", dosen: "Imamul Arifin", minggu: {} },
    { id: "pancasila", julukan: "Sang Pemersatu", simbol: "lima", nama: "Pancasila", jenis: "teori", dosen: "Moh. Zikky / Haryadi Amran Darwito", minggu: {} },
    { id: "pengembangan-karakter", julukan: "Sang Penumbuh", simbol: "tunas", nama: "Pengembangan Karakter", jenis: "teori", dosen: "Isbat Uzzin Nadhori / Nalussa'ada", minggu: {} }
  ]
};
