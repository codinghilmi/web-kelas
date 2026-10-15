(function () {
// app.js (skrip biasa; dijalankan terakhir)
// Titik masuk situs: memuat data, membangun menu, membuka/menutup panel,
// kendali keyboard, dan tautan langsung ke panel (mis. index.html#jadwal).


const MENU = [
  { key: "jadwal", label: "Jadwal", desc: "Lihat jadwal kuliah", r: -13, x: 2 },
  { key: "anggota", label: "Anggota", desc: "Daftar mahasiswa", r: -11, x: 0 },
  { key: "pengurus", label: "Pengurus", desc: "Struktur organisasi", r: -9, x: 3.5 },
  { key: "pengumuman", label: "Pengumuman", desc: "Kabar terbaru kelas", r: -5, x: -1.5 },
  { key: "tugas", label: "Tugas", desc: "Tugas dan tenggat", r: -8, x: 4 },
  { key: "rangkuman", label: "Rangkuman", desc: "Rangkuman materi per minggu", r: -6, x: 1 }
];

const $ = (s) => document.querySelector(s);
// Mengubah alamat (tautan langsung) tanpa memuat ulang. Di lingkungan tertentu
// (mis. pratinjau dalam iframe tertutup) peramban melarangnya; abaikan saja.
const setUrl = (url) => { try { history.replaceState(null, "", url); } catch {} };
const menuEl = $("#menu");
const panel = $("#panel");
const body = $("#panel-body");

// Hiasan latar tidak menunggu data
const { makePanels, esc, fitWordmark, clock, initMusic } = window.SDT;
fitWordmark();
clock();
initMusic();

// ---------- Menu ----------
MENU.forEach((m, i) => {
  const li = document.createElement("li");
  // Tautan biasa: bisa dibuka di tab baru atau disalin; klik biasa membuka panel di tempat
  li.innerHTML = `<a class="item" href="#${m.key}" aria-haspopup="dialog" data-i="${i}" style="--r:${m.r}deg;--x:${m.x}vw"><span class="txt">${esc(m.label)}</span></a>`;
  menuEl.appendChild(li);
});
const items = [...menuEl.querySelectorAll(".item")];
let current = 0;
let lastOpener = null;
let panels = null; // diisi setelah data termuat
let pendingKey = null; // panel yang diminta sebelum data siap

function select(i, focus = true) {
  current = (i + items.length) % items.length;
  items.forEach((el, j) => {
    el.classList.toggle("on", j === current);
    el.setAttribute("aria-current", j === current ? "true" : "false");
  });
  $("#cmd-title").textContent = MENU[current].desc;
  if (focus) items[current].focus({ preventScroll: true });
}

items.forEach((el, i) => {
  el.addEventListener("mouseenter", () => select(i, false));
  el.addEventListener("focus", () => { if (current !== i) select(i, false); });
  el.addEventListener("click", (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // biarkan buka di tab baru
    e.preventDefault();
    select(i, false);
    openPanel(MENU[i].key, el);
  });
});

// ---------- Panel ----------
function show(key, arg) {
  const m = MENU.find((x) => x.key === key);
  $("#panel-title").textContent = m.label;
  $("#panel-head").dataset.ghost = m.label;
  fitTitle();
  if (!panels) {
    $("#panel-sub").textContent = "Memuat data\u2026";
    body.innerHTML = "";
    pendingKey = key;
    return;
  }
  const view = panels[key](arg, (day) => {
    show(key, day);
    body.querySelector(`[data-day="${day}"]`)?.focus();
  });
  $("#panel-sub").textContent = view.sub || "";
  body.innerHTML = view.html;
  if (view.after) view.after(body);
}

// Judul panel dikecilkan bila tidak muat, agar tombol Tutup tidak terdorong keluar layar
function fitTitle() {
  const t = $("#panel-title");
  t.style.fontSize = "";
  let size = parseFloat(getComputedStyle(t).fontSize);
  while (t.scrollWidth > t.clientWidth + 1 && size > 14) { size -= 1; t.style.fontSize = size + "px"; }
}
addEventListener("resize", () => document.body.classList.contains("open") && fitTitle());
if (document.fonts) document.fonts.ready.then(() => document.body.classList.contains("open") && fitTitle());

function openPanel(key, opener) {
  // Rangkuman punya tampilan sendiri (kartu tarot), bukan panel geser
  if (key === "rangkuman") { window.KS.open(""); return; }
  lastOpener = opener || items[MENU.findIndex((m) => m.key === key)];
  show(key);
  document.body.classList.add("open");
  menuEl.setAttribute("inert", "");
  if (location.hash !== "#" + key) setUrl("#" + key);
  setTimeout(() => (body.querySelector(".tab[aria-selected='true'], .search") || $("#close")).focus(), 60);
}

function closePanel() {
  if (!document.body.classList.contains("open")) return;
  document.body.classList.remove("open");
  menuEl.removeAttribute("inert");
  setUrl(location.pathname + location.search);
  if (lastOpener) lastOpener.focus({ preventScroll: true });
}

$("#close").addEventListener("click", closePanel);
$("#backdrop").addEventListener("click", closePanel);

// ---------- Tautan langsung: index.html#jadwal ----------
function fromHash() {
  const key = location.hash.slice(1);
  if (key === "rangkuman" || key.startsWith("rangkuman/")) {
    select(MENU.findIndex((m) => m.key === "rangkuman"), false);
    window.KS.open(key.split("/").slice(1).join("/"));
    return;
  }
  const i = MENU.findIndex((m) => m.key === key);
  if (i >= 0) { select(i, false); openPanel(key); }
}
addEventListener("hashchange", fromHash);

// ---------- Keyboard ----------
document.addEventListener("keydown", (e) => {
  const open = document.body.classList.contains("open");
  if (e.key === "Escape") { closePanel(); return; }
  if (open) {
    if (e.key === "Tab") { // jaga fokus tetap di dalam panel
      const f = [...panel.querySelectorAll("button:not([tabindex='-1']), input, summary, a[href]")];
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    return;
  }
  if (e.target.closest && e.target.closest("input, textarea")) return;
  if (["ArrowDown", "s", "S"].includes(e.key)) { e.preventDefault(); select(current + 1); }
  if (["ArrowUp", "w", "W"].includes(e.key)) { e.preventDefault(); select(current - 1); }
  if (e.key === "m" || e.key === "M") toggleMotion();
});

// ---------- Diamkan latar (gerak dekoratif bisa dihentikan) ----------
const motionBtn = $("#motion");
function setStill(still, save = true) {
  document.body.classList.toggle("still", still);
  motionBtn.setAttribute("aria-pressed", String(still));
  motionBtn.querySelector("span").textContent = still ? "Gerakkan latar" : "Diamkan latar";
  if (save) { try { localStorage.setItem("latar-diam", still ? "1" : "0"); } catch {} }
}
function toggleMotion() { setStill(!document.body.classList.contains("still")); }
motionBtn.addEventListener("click", toggleMotion);
let savedStill = false;
try { savedStill = localStorage.getItem("latar-diam") === "1"; } catch {}
setStill(savedStill || matchMedia("(prefers-reduced-motion: reduce)").matches, false);

select(0, false);
fromHash();

// ---------- Data (dari data/*.js) ----------
const DATA = window.DATA || {};
const ambil = (k) => DATA[k]
  ? { data: DATA[k], error: null }
  : { data: null, error: `Berkas data/${k}.js tidak terbaca. Mungkin ada salah ketik (koma atau tanda kutip) atau berkasnya terhapus.` };
const kelas = ambil("kelas");
if (kelas.data && kelas.data.nama) document.title = kelas.data.nama;
panels = makePanels({ kelas, jadwal: ambil("jadwal"), anggota: ambil("anggota"), pengumuman: ambil("pengumuman") });
if (pendingKey && document.body.classList.contains("open")) show(pendingKey);
pendingKey = null;
})();
