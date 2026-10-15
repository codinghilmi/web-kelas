// awan.js: penyimpanan rangkuman di Firebase (Firestore + Authentication) lewat REST,
// tanpa pustaka tambahan. Aktif hanya bila data/sunting.js sudah diisi.
// Membaca: siapa saja. Menulis: hanya akun yang terdaftar di koleksi "editor" (diatur di Rules).
(function () {
const C = (window.DATA && window.DATA.sunting) || {};
const aktif = !!(C.projectId && C.apiKey);
const ROOT_DOCS = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(C.projectId || "")}/databases/(default)/documents`;
const DOCS = `${ROOT_DOCS}/rangkuman`;
const PENG_DOCS = `${ROOT_DOCS}/pengumuman`;
const AUTH = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + encodeURIComponent(C.apiKey || "");
const TOKEN = "https://securetoken.googleapis.com/v1/token?key=" + encodeURIComponent(C.apiKey || "");
const KEY = "rk-sesi";

class Galat extends Error { constructor(kode, pesan) { super(pesan); this.kode = kode; } }

let sesi = null;                                    // { email, id, refresh, exp }
try { sesi = JSON.parse(localStorage.getItem(KEY)); } catch {}
const ingat = () => { try { sesi ? localStorage.setItem(KEY, JSON.stringify(sesi)) : localStorage.removeItem(KEY); } catch {} };

async function minta(url, opt) {
  let r;
  try { r = await fetch(url, opt); }
  catch { throw new Galat("jaringan", "Tidak bisa terhubung. Periksa koneksi internet lalu coba lagi."); }
  let j = null;
  try { j = await r.json(); } catch {}
  return { ok: r.ok, status: r.status, j: j || {} };
}

const str = (f, k) => (f && f[k] && typeof f[k].stringValue === "string" ? f[k].stringValue : "");
const baca = (d) => ({ judul: str(d.fields, "judul"), penulis: str(d.fields, "penulis"), isi: str(d.fields, "isi"), versi: d.updateTime });

// Semua rangkuman yang tersimpan: { "<id-matkul>__<minggu>": { judul, penulis, isi, versi } }
async function muat() {
  const out = {};
  let page = "";
  do {
    const r = await minta(`${DOCS}?pageSize=300${page ? "&pageToken=" + encodeURIComponent(page) : ""}`);
    if (!r.ok) throw new Galat("muat", "Rangkuman terbaru tidak bisa dimuat.");
    (r.j.documents || []).forEach((d) => { out[d.name.split("/").pop()] = baca(d); });
    page = r.j.nextPageToken || "";
  } while (page);
  return out;
}

async function ambil(id) {
  const r = await minta(`${DOCS}/${encodeURIComponent(id)}`);
  if (r.status === 404) return null;
  if (!r.ok) throw new Galat("muat", "Versi terbaru tidak bisa dimuat.");
  return baca(r.j);
}

const PESAN_MASUK = {
  INVALID_LOGIN_CREDENTIALS: "Email atau kata sandi salah.",
  EMAIL_NOT_FOUND: "Email atau kata sandi salah.",
  INVALID_PASSWORD: "Email atau kata sandi salah.",
  INVALID_EMAIL: "Format email tidak dikenali.",
  USER_DISABLED: "Akun ini dinonaktifkan.",
  TOO_MANY_ATTEMPTS_TRY_LATER: "Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi."
};

async function masuk(email, sandi) {
  const r = await minta(AUTH, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password: sandi, returnSecureToken: true }) });
  if (!r.ok) {
    const kode = String((r.j.error && r.j.error.message) || "").split(" ")[0];
    throw new Galat("masuk", PESAN_MASUK[kode] || "Tidak bisa masuk. Coba lagi.");
  }
  sesi = { email: r.j.email, id: r.j.idToken, refresh: r.j.refreshToken, exp: Date.now() + (+r.j.expiresIn || 3600) * 1000 };
  ingat();
  return sesi.email;
}

function keluar() { sesi = null; ingat(); }

// Token masuk berlaku sekitar satu jam; diperbarui otomatis sebelum menyimpan
async function token() {
  if (!sesi) throw new Galat("sesi", "Anda belum masuk.");
  if (Date.now() < sesi.exp - 60000) return sesi.id;
  const r = await minta(TOKEN, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "grant_type=refresh_token&refresh_token=" + encodeURIComponent(sesi.refresh) });
  if (!r.ok) { keluar(); throw new Galat("sesi", "Sesi berakhir. Masuk lagi untuk menyimpan."); }
  sesi = { email: sesi.email, id: r.j.id_token, refresh: r.j.refresh_token, exp: Date.now() + (+r.j.expires_in || 3600) * 1000 };
  ingat();
  return sesi.id;
}

// Menyimpan satu rangkuman. versi = versi yang sedang disunting (null bila belum ada).
// Bila orang lain sudah menyimpan lebih dulu, penyimpanan ditolak ("bentrok") agar tidak saling menimpa.
async function simpan(id, data, versi) {
  const t = await token();
  const syarat = versi ? "currentDocument.updateTime=" + encodeURIComponent(versi) : "currentDocument.exists=false";
  const fields = {};
  ["judul", "penulis", "isi"].forEach((k) => (fields[k] = { stringValue: String(data[k] || "") }));
  const r = await minta(`${DOCS}/${encodeURIComponent(id)}?${syarat}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: "Bearer " + t }, body: JSON.stringify({ fields }) });
  if (r.ok) return r.j.updateTime;
  const st = (r.j.error && r.j.error.status) || "";
  if (r.status === 409 || st === "FAILED_PRECONDITION" || st === "ALREADY_EXISTS" || st === "ABORTED" || (r.status === 404 && versi)) throw new Galat("bentrok", "Rangkuman ini baru saja diubah orang lain.");
  if (r.status === 401 || st === "UNAUTHENTICATED") { keluar(); throw new Galat("sesi", "Sesi berakhir. Masuk lagi untuk menyimpan."); }
  if (r.status === 403 || st === "PERMISSION_DENIED") throw new Galat("izin", "Akun ini belum terdaftar sebagai penyunting, atau isinya melebihi batas panjang.");
  throw new Galat("simpan", "Gagal menyimpan. Coba lagi.");
}

// ---------- CRUD Pengumuman ----------
async function muatPengumuman() {
  const r = await minta(`${PENG_DOCS}?pageSize=100`);
  if (!r.ok) {
    if (r.status === 404) return [];
    throw new Galat("muat", "Pengumuman dari awan tidak bisa dimuat.");
  }
  return (r.j.documents || []).map((d) => {
    const f = d.fields || {};
    const id = d.name.split("/").pop();
    return {
      id,
      jenis: str(f, "jenis") || "pengumuman",
      judul: str(f, "judul"),
      tanggal: str(f, "tanggal"),
      isi: str(f, "isi"),
      matkul: str(f, "matkul") || null,
      tenggat: str(f, "tenggat") || null,
      dibuatOleh: str(f, "dibuatOleh"),
      versi: d.updateTime
    };
  });
}

async function simpanPengumuman(id, data) {
  const t = await token();
  const docId = id || ("p_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6));
  const fields = {
    jenis: { stringValue: "pengumuman" },
    judul: { stringValue: String(data.judul || "") },
    tanggal: { stringValue: String(data.tanggal || "") },
    isi: { stringValue: String(data.isi || "") },
    matkul: { stringValue: "" },
    tenggat: { stringValue: "" },
    dibuatOleh: { stringValue: sesi ? sesi.email : "" }
  };
  const r = await minta(`${PENG_DOCS}/${encodeURIComponent(docId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + t },
    body: JSON.stringify({ fields })
  });
  if (r.ok) {
    return {
      id: docId,
      jenis: "pengumuman",
      judul: String(data.judul || ""),
      tanggal: String(data.tanggal || ""),
      isi: String(data.isi || ""),
      matkul: null,
      tenggat: null,
      dibuatOleh: sesi ? sesi.email : "",
      versi: r.j.updateTime
    };
  }
  const st = (r.j.error && r.j.error.status) || "";
  if (r.status === 401 || st === "UNAUTHENTICATED") { keluar(); throw new Galat("sesi", "Sesi berakhir. Masuk lagi untuk menyimpan."); }
  if (r.status === 403 || st === "PERMISSION_DENIED") throw new Galat("izin", "Izin ditolak. Pastikan email terdaftar di koleksi 'editor' dan aturan Rules koleksi 'pengumuman' sudah dipasang di Firebase.");
  throw new Galat("simpan", "Gagal menyimpan pengumuman. Coba lagi.");
}

async function hapusPengumuman(id) {
  const t = await token();
  const r = await minta(`${PENG_DOCS}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + t }
  });
  if (r.ok) return true;
  const st = (r.j.error && r.j.error.status) || "";
  if (r.status === 401 || st === "UNAUTHENTICATED") { keluar(); throw new Galat("sesi", "Sesi berakhir. Masuk lagi."); }
  if (r.status === 403 || st === "PERMISSION_DENIED") throw new Galat("izin", "Izin ditolak. Pastikan email terdaftar di koleksi 'editor'.");
  throw new Galat("hapus", "Gagal menghapus pengumuman. Coba lagi.");
}

window.SDT = window.SDT || {};
window.SDT.awan = {
  aktif,
  muat,
  ambil,
  masuk,
  keluar,
  simpan,
  pengguna: () => (sesi ? sesi.email : null),
  muatPengumuman,
  simpanPengumuman,
  hapusPengumuman
};
})();
