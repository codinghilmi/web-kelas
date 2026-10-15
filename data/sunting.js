// Penyuntingan rangkuman langsung di situs (disimpan di Firebase).
// Isi dua nilai di bawah dari Firebase Console > Project settings > Your apps > Web app.
// Selama keduanya kosong, tombol "Sunting" tidak muncul dan situs berjalan seperti biasa.
// Kedua nilai ini memang boleh terlihat publik; yang membatasi siapa boleh menyunting
// adalah aturan (Rules) di Firestore. Langkah lengkap: lihat SUNTING.md.
window.DATA = window.DATA || {};
window.DATA.sunting = {
  "projectId": "web-kelas-sdt-a",
  "apiKey": "AIzaSyCitoH6_K-awwWtyQ4NINYZa0pp_a0u4JA"
};
