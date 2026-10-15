// Dimuat sebagai skrip biasa agar situs bisa dibuka tanpa server.
(function () {
// music.js
// Pemutar musik di tepi lempeng putih. Daftar lagu dibaca dari data/musik.js.
// Musik tidak diputar otomatis (diblokir peramban); pengguna menekan tombol putar.


const el = document.getElementById("music");
const titleBox = el.querySelector(".music-title");
const titleEl = document.getElementById("music-title");
const btnPrev = document.getElementById("music-prev");
const btnPlay = document.getElementById("music-play");
const btnNext = document.getElementById("music-next");
const audio = new Audio();
audio.preload = "none";
audio.volume = 0.55;

let list = [];
let index = 0;

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// ---------- Posisi: sejajar tulisan vertikal, di celah sebelum garis batas ----------
function place() {
  // Geometri tepi sama dengan yang dipakai tulisan vertikal (scene.js)
  const g = window.SDT.slabGeometry();
  const W = g.W, H = g.H, bottomRatio = 0.62;
  const y = H * 0.7;                              // titik jangkar (ujung bawah pemutar)
  const x = g.edgeAt(y);
  const compact = () => {
    el.classList.add("compact");
    ["--tmax", "--ma", "--mx", "--my", "--mo"].forEach((v) => el.style.removeProperty(v));
  };
  if (innerWidth <= 760) {                        // ponsel: mode ringkas
    compact();
  } else {
    const wm = window.SDT.wordmark;
    if (!wm) return compact(), measureTitle(), el.classList.add("ready");
    el.classList.remove("compact");
    // Sejajar tulisan vertikal: menempel di sisi kanan kolom abu-abu, dibaca dari bawah ke atas
    const GAP = 12;                                       // jarak ke kolom abu-abu
    const angle = -(90 - (wm.phi * 180) / Math.PI);
    el.style.setProperty("--mx", `${wm.rightAt(y)}px`);
    el.style.setProperty("--my", `${y}px`);
    el.style.setProperty("--ma", `${angle}deg`);
    el.style.setProperty("--mo", `${GAP}px`);
    el.style.setProperty("--tmax", "208px");
    // Celah antara kolom abu-abu dan garis batas sama lebar dari atas ke bawah
    const thick = el.offsetHeight || 46;
    const fixed = el.scrollWidth - titleBox.getBoundingClientRect().width;
    const avail = (y - 24) / Math.cos(wm.phi) - fixed;     // jangan melewati atas layar
    if (wm.gap < GAP + thick + 4 || avail < 72) compact();  // tidak muat: mode ringkas
    else el.style.setProperty("--tmax", `${Math.min(208, avail)}px`);
  }
  measureTitle();
  el.classList.add("ready");
}

function measureTitle() {
  const over = titleEl.scrollWidth - titleBox.clientWidth;
  titleBox.classList.toggle("fits", over <= 2);
  titleEl.style.setProperty("--shift", `${-Math.max(0, over)}px`);
}

// ---------- Pemutaran ----------
function showTitle(text, small = "") {
  titleEl.innerHTML = esc(text) + (small ? `<small>${esc(small)}</small>` : "");
  measureTitle();
}

function load(i) {
  index = (i + list.length) % list.length;
  const t = list[index];
  audio.src = t.berkas;
  showTitle(t.judul, t.artis);
  try { localStorage.setItem("musik-indeks", String(index)); } catch {}
  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({ title: t.judul, artist: t.artis || "", album: "Sains Data Terapan A" });
  }
}

async function play() {
  try { await audio.play(); }
  catch (e) {
    // AbortError = pemutaran disela pergantian lagu; bukan galat
    if (e && e.name !== "AbortError") showTitle("Lagu tidak bisa diputar", "cek berkas");
  }
}

function setPlaying(on) {
  el.classList.toggle("playing", on);
  btnPlay.setAttribute("aria-label", on ? "Jeda musik" : "Putar musik");
}

function step(d) {
  const wasPlaying = !audio.paused;
  load(index + d);
  if (wasPlaying) play();
}

btnPlay.addEventListener("click", () => (audio.paused ? play() : audio.pause()));
btnPrev.addEventListener("click", () => step(-1));
btnNext.addEventListener("click", () => step(1));
audio.addEventListener("play", () => setPlaying(true));
audio.addEventListener("pause", () => setPlaying(false));
audio.addEventListener("ended", () => { load(index + 1); play(); });
audio.addEventListener("error", () => { if (audio.src) { setPlaying(false); showTitle("Berkas lagu tidak ditemukan", list[index]?.berkas || ""); } });

if ("mediaSession" in navigator) {
  navigator.mediaSession.setActionHandler("previoustrack", () => step(-1));
  navigator.mediaSession.setActionHandler("nexttrack", () => step(1));
}

let t;
addEventListener("resize", () => { clearTimeout(t); t = setTimeout(place, 120); });

// ---------- Mulai ----------
function initMusic() {
  place();
  if (document.fonts) document.fonts.ready.then(place);
  const data = window.DATA && window.DATA.musik;
  const error = !Array.isArray(data);
  list = error ? [] : data.filter((x) => x && x.judul && x.berkas);
  if (error || !list.length) {
    [btnPrev, btnPlay, btnNext].forEach((b) => (b.disabled = true));
    showTitle(error ? "Daftar musik gagal dimuat" : "Belum ada musik");
    return;
  }
  if (list.length < 2) [btnPrev, btnNext].forEach((b) => (b.disabled = true));
  let saved = 0;
  try { saved = Number(localStorage.getItem("musik-indeks")) || 0; } catch {}
  load(saved < list.length ? saved : 0);
}

window.SDT = window.SDT || {};
Object.assign(window.SDT, { initMusic });
})();
