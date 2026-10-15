// rk.js: menu Rangkuman
// Alur: pilih kartu tarot mata kuliah (Joker = teori + praktikum, terbelah ke kiri/kanan)
//       -> zoom ke lingkaran 16 minggu (UTS dan UAS bertanda wajik) -> halaman rangkuman bergaya Notion.
// Tautan langsung: #rangkuman, #rangkuman/<id-matkul>, #rangkuman/<id-matkul>/<minggu>
(function () {
const D = (window.DATA && window.DATA.rangkuman) || { semester: { mulai: "2026-08-24", minggu: 16, uts: 8, uas: 16 }, matkul: [] };
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// Mengubah alamat tanpa memuat ulang; diabaikan bila peramban melarang (mis. pratinjau iframe)
const setUrl = (url) => { try { history.replaceState(null, "", url); } catch {} };
const SEM = D.semester;
const TOTAL = SEM.minggu || 16;                                   // minggu dalam semester, termasuk ujian
const EXAM = { [SEM.uts]: "UTS", [SEM.uas]: "UAS" };              // minggu ujian: tanpa rangkuman
const LECT = Array.from({ length: TOTAL }, (_, i) => i + 1).filter((n) => !EXAM[n]);
const N_LECT = LECT.length;
const prevLect = (n) => [...LECT].reverse().find((x) => x < n) || null;
const nextLect = (n) => LECT.find((x) => x > n) || null;
const fmtShort = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" });
const fmtYear = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" });
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const JENIS = { teori: "Teori", praktikum: "Praktikum" };

// ---------- Tanggal minggu (berurutan; UTS dan UAS ikut dihitung sebagai minggu) ----------
const start = new Date(SEM.mulai + "T00:00:00");
const weekStart = (n) => { const d = new Date(start); d.setDate(d.getDate() + 7 * (n - 1)); return d; };
const weekEnd = (n) => { const d = weekStart(n); d.setDate(d.getDate() + 4); return d; };
const weekRange = (n) => `${fmtShort.format(weekStart(n))} - ${fmtShort.format(weekEnd(n))}`;
// Versi ringkas: "5-9 Okt" atau "31 Agu - 4 Sep"
const weekRangeShort = (n) => { const a = weekStart(n), b = weekEnd(n); return a.getMonth() === b.getMonth() ? `${a.getDate()}-${fmtShort.format(b)}` : weekRange(n); };
function currentWeek(now = new Date()) {
  for (let n = 1; n <= TOTAL; n++) {
    const a = weekStart(n), b = new Date(a); b.setDate(b.getDate() + 7);
    if (now >= a && now < b) return n;
  }
  return null;
}
const NOW = currentWeek();

// ---------- Format tulisan mirip Notion -> HTML ----------
function inline(t) {
  return t.split("`").map((part, i) => {
    if (i % 2) return `<code>${esc(part)}</code>`;
    return esc(part).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>");
  }).join("");
}
const ICON_CALLOUT = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="10" cy="10" r="7.5"/><path d="M10 9v5M10 6.2v.1" stroke-linecap="round"/></svg>';
function render(src) {
  const lines = String(src || "").replace(/\r/g, "").split("\n");
  let out = "", i = 0;
  const take = (re) => { const got = []; while (i < lines.length && re.test(lines[i])) got.push(lines[i++]); return got; };
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    if (/^---\s*$/.test(l)) { out += "<hr>"; i++; continue; }
    if (/^### /.test(l)) { out += `<h3>${inline(l.slice(4))}</h3>`; i++; continue; }
    if (/^## /.test(l)) { out += `<h2>${inline(l.slice(3))}</h2>`; i++; continue; }
    if (/^! /.test(l)) { out += `<div class="np-callout">${ICON_CALLOUT}<div>${take(/^! /).map((x) => inline(x.slice(2))).join("<br>")}</div></div>`; continue; }
    if (/^> /.test(l)) { out += `<blockquote>${take(/^> /).map((x) => inline(x.slice(2))).join("<br>")}</blockquote>`; continue; }
    if (/^- \[( |x)\] /i.test(l)) {
      out += `<ul class="np-todo">${take(/^- \[( |x)\] /i).map((x) => { const done = /^- \[x\]/i.test(x); return `<li class="${done ? "done" : ""}"><span class="box" role="img" aria-label="${done ? "selesai" : "belum"}"></span><span>${inline(x.slice(6))}</span></li>`; }).join("")}</ul>`;
      continue;
    }
    if (/^- /.test(l)) { out += `<ul>${take(/^- (?!\[( |x)\] )/i).map((x) => `<li>${inline(x.slice(2))}</li>`).join("")}</ul>`; continue; }
    if (/^\d+\. /.test(l)) { out += `<ol>${take(/^\d+\. /).map((x) => `<li>${inline(x.replace(/^\d+\. /, ""))}</li>`).join("")}</ol>`; continue; }
    if (/^\+ /.test(l)) {
      const title = l.slice(2); i++;
      const body = take(/^(  |\t)|^\s*$/).map((x) => x.replace(/^(  |\t)/, ""));
      out += `<details class="np-toggle"><summary>${inline(title)}</summary><div>${render(body.join("\n"))}</div></details>`;
      continue;
    }
    const para = take(/^(?!\s*$|---|#{2,3} |! |> |- |\d+\. |\+ ).+/);
    if (!para.length) { para.push(l); i++; }                 // pengaman: baris tak dikenal jadi paragraf
    out += `<p>${para.map(inline).join(" ")}</p>`;
  }
  return out;
}

// ---------- Elemen ----------
const root = document.createElement("section");
root.className = "ks";
root.setAttribute("aria-label", "Rangkuman materi");
root.innerHTML = `
  <div class="ks-head">
    <div><h2 class="ks-title" id="ks-title">Rangkuman</h2><ol class="ks-crumb" id="ks-crumb"></ol></div>
    <button class="ks-back" id="ks-back" type="button"><span>Kembali</span><kbd>Esc</kbd></button>
  </div>
  <div class="ks-stage" id="ks-stage"></div>`;
document.body.appendChild(root);

const pageWrap = document.createElement("div");
pageWrap.className = "np-wrap";
pageWrap.innerHTML = `<div class="np" role="dialog" aria-modal="true" aria-labelledby="np-title" tabindex="-1">
  <div class="np-top">
    <ol class="np-path" id="np-path"></ol>
    <button class="np-btn" id="np-prev" type="button" aria-label="Minggu sebelumnya">&lt;</button>
    <button class="np-btn" id="np-next" type="button" aria-label="Minggu berikutnya">&gt;</button>
    <button class="np-btn np-full" id="np-full" type="button" aria-pressed="false" title="Layar penuh (F)"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path class="i-in" d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4"/><path class="i-out" d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4"/></svg><span id="np-full-label">Layar penuh</span> <kbd>F</kbd></button>
    <button class="np-btn np-edit" id="np-edit" type="button" hidden><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M13.5 3.5l3 3L7 16H4v-3z"/></svg><span>Sunting</span></button>
    <button class="np-btn" id="np-close" type="button">Tutup <kbd>Esc</kbd></button>
  </div>
  <div class="np-bar" id="np-bar" hidden></div>
  <div class="np-cover" aria-hidden="true"></div>
  <div class="np-body" id="np-body"></div>
</div>`;
document.body.appendChild(pageWrap);
const page = $(".np", pageWrap);

const stage = $("#ks-stage", root);
let course = null, week = null, lastFocus = null;

function setLeft() {
  const g = window.SDT && window.SDT.slabGeometry ? window.SDT.slabGeometry() : null;
  const left = innerWidth <= 760 || !g ? 0 : Math.max(g.edgeAt(innerHeight * 0.35), 0) + 24;
  root.style.setProperty("--ks-left", left + "px");
}
addEventListener("resize", setLeft);

// Cincin kecil 16 titik; minggu ujian digambar sebagai wajik kecil
function miniRing(c) {
  const dots = Array.from({ length: TOTAL }, (_, i) => {
    const n = i + 1, a = (n / TOTAL) * 2 * Math.PI - Math.PI / 2;
    const x = (20 + 15 * Math.cos(a)).toFixed(1), y = (20 + 15 * Math.sin(a)).toFixed(1);
    if (EXAM[n]) return `<rect x="${x - 2.2}" y="${y - 2.2}" width="4.4" height="4.4" transform="rotate(45 ${x} ${y})" fill="#0a0b1a"/>`;
    const fill = c.minggu[n] ? "#0a0b1a" : n === NOW ? "#ff2033" : "#ffffff";
    return `<circle cx="${x}" cy="${y}" r="2.3" fill="${fill}" stroke="#0a0b1a" stroke-width="1.1"/>`;
  }).join("");
  return `<svg class="ks-ring-mini" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="15" fill="none" stroke="#0d3fe6" stroke-width="1.5"/>${dots}</svg>`;
}

function crumb() {
  $("#ks-crumb", root).innerHTML = crumbParts().map((p) => `<li>${esc(p)}</li>`).join("");
  const t = $("#ks-title", root);
  t.textContent = course ? course.nama : group ? group.main.nama : "Rangkuman";
  // Judul dikecilkan bila kata terpanjang tidak muat (kata tidak dipotong)
  t.style.fontSize = "";
  let size = parseFloat(getComputedStyle(t).fontSize);
  while (t.scrollWidth > t.clientWidth + 1 && size > 12) { size -= 1; t.style.fontSize = size + "px"; }
}
if (document.fonts) document.fonts.ready.then(() => document.body.classList.contains("ks-open") && crumb());
addEventListener("resize", () => document.body.classList.contains("ks-open") && crumb());

// ---------- Langkah 1: kartu mata kuliah (pasangan teori-praktikum jadi satu kartu) ----------
// Kartu = satu grup. Grup berisi 1 entri (langsung ke lingkaran) atau 2 entri (pilih Teori/Praktikum dulu).
function groups() {
  const out = [];
  D.matkul.forEach((c) => {
    const key = c.grup || c.id;
    let g = out.find((x) => x.key === key);
    if (!g) out.push((g = { key, items: [] }));
    g.items.push(c);
  });
  out.forEach((g) => {
    g.items.sort((a, b) => (a.jenis === "teori" ? -1 : 1) - (b.jenis === "teori" ? -1 : 1));
    g.main = g.items[0];
  });
  return out;
}
const GROUPS = groups();
const groupOf = (c) => GROUPS.find((g) => g.items.includes(c));
const filled = (c) => Object.keys(c.minggu).length;

// ---------- Kartu tarot (digambar sebagai SVG, viewBox 300x520) ----------
const T = { INK: "#0a0b1a", CREAM: "#f4ead2", GOLD: "#c9973a", GOLD2: "#e7c378", RED: "#d90016" };
const ROMAN = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
// Simbol mata kuliah (garis emas, kotak 100x100)
const SYM = {
  kurva: '<path d="M8 80c18 0 22-58 42-58s24 58 42 58"/><path d="M8 86h84M50 22v64" stroke-dasharray="3 5"/>',
  kurung: '<path d="M36 12c-12 0-8 26-18 38 10 12 6 38 18 38M64 12c12 0 8 26 18 38-10 12-6 38-18 38"/><path d="M44 64l12-28"/>',
  integral: '<path d="M64 10c-10-4-15 6-16 22l-4 40c-1 14-7 22-17 18"/><path d="M60 54h22M71 43v22"/>',
  alir: '<path d="M50 8l26 26-26 26-26-26z"/><path d="M50 60v14M28 82h44v10"/><path d="M38 34h24"/>',
  jaringan: '<circle cx="20" cy="22" r="8"/><circle cx="80" cy="22" r="8"/><circle cx="50" cy="50" r="10"/><circle cx="24" cy="82" r="8"/><circle cx="76" cy="82" r="8"/><path d="M26 28l16 14M74 28L58 42M29 76l14-17M71 76L57 59"/>',
  buku: '<path d="M50 32c-12-8-28-8-38-4v54c10-4 26-4 38 4 12-8 28-8 38-4V28c-10-4-26-4-38 4zM50 32v54"/><path d="M50 8v12M32 12l5 9M68 12l-5 9"/>',
  lima: '<circle cx="50" cy="14" r="7"/><circle cx="84" cy="38" r="7"/><circle cx="71" cy="80" r="7"/><circle cx="29" cy="80" r="7"/><circle cx="16" cy="38" r="7"/><path d="M50 22l28 14M80 46l-7 26M63 80H37M27 72l-7-26M22 34l22-16" stroke-dasharray="3 4"/>',
  tunas: '<path d="M50 92V44"/><path d="M50 62C27 64 18 46 21 28c20-2 30 14 29 34zM50 50c1-19 13-30 30-28 2 17-11 28-30 28z"/><path d="M28 92h44"/>'
};
let svgId = 0;
const SERIF = "Cinzel, 'Times New Roman', serif", DECO = "'Cinzel Decorative', Cinzel, 'Times New Roman', serif", MONO = "'Geist Mono', ui-monospace, monospace";

// Kertas krem, bingkai ganda emas-hitam, ornamen wajik di sudut
function tFrame() {
  const corner = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M0 0l9 0M0 0l0 9" stroke="${T.GOLD}" stroke-width="2"/><rect x="-3.5" y="-3.5" width="7" height="7" transform="rotate(45)" fill="${T.GOLD}" stroke="${T.INK}" stroke-width="1"/></g>`;
  return `<rect x="2" y="2" width="296" height="516" rx="14" fill="${T.CREAM}" stroke="${T.INK}" stroke-width="4"/>
    <rect x="12" y="12" width="276" height="496" rx="7" fill="none" stroke="${T.GOLD}" stroke-width="2.5"/>
    <rect x="18" y="18" width="264" height="484" rx="4" fill="none" stroke="${T.INK}" stroke-width="1"/>
    ${corner(18, 18, 0)}${corner(282, 18, 90)}${corner(282, 502, 180)}${corner(18, 502, 270)}`;
}

// Jendela lengkung: langit, sinar, bintang, bulan, ombak
function tArch(o = {}) {
  const id = ++svgId, top = o.top ?? 82, bottom = o.bottom ?? 404, cx = 150, cy = o.sunY ?? 206;
  const path = `M38 ${bottom}V${top + 112}a112 112 0 0 1 224 0V${bottom}z`;
  const rays = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2, pt = (d) => `${(cx + Math.cos(a + d) * 300).toFixed(1)} ${(cy + Math.sin(a + d) * 300).toFixed(1)}`;
    return `<path d="M${cx} ${cy}L${pt(-.05)}L${pt(.05)}z" fill="#fff" opacity="${i % 2 ? .05 : .11}"/>`;
  }).join("");
  const stars = [[64, 150], [232, 140], [82, 250], [226, 262], [114, 118], [196, 108], [58, 320], [244, 318]]
    .map(([x, y], i) => `<path d="M${x} ${y - 6}l1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4-4.4-1.6 4.4-1.6z" fill="${T.GOLD2}" opacity="${.6 + (i % 3) * .15}"/>`).join("");
  const waves = [0, 1, 2].map((k) => {
    const y = bottom - 54 + k * 16;
    let d = `M38 ${y}`;
    for (let x = 38; x < 262; x += 28) d += ` q7 -${8 - k * 2} 14 0 t14 0`;
    return `<path d="${d}V${bottom}H38z" fill="${["#1aa6ff", "#0d3fe6", "#0a2bb0"][k]}" stroke="${T.INK}" stroke-width="1.2"/>`;
  }).join("");
  return `<defs><clipPath id="tc${id}"><path d="${path}"/></clipPath>
      <linearGradient id="tg${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${o.sky1 || "#0a1550"}"/><stop offset=".65" stop-color="${o.sky2 || "#1450ec"}"/><stop offset="1" stop-color="${o.sky3 || "#3ccbff"}"/></linearGradient></defs>
    <g clip-path="url(#tc${id})"><rect x="30" y="${top - 10}" width="240" height="${bottom - top + 20}" fill="url(#tg${id})"/>${rays}${stars}
      <circle cx="${cx}" cy="${cy}" r="58" fill="none" stroke="${T.GOLD2}" stroke-width="1.2" opacity=".7"/>
      <circle cx="${cx}" cy="${cy}" r="66" fill="none" stroke="${T.GOLD2}" stroke-width=".8" stroke-dasharray="2 5" opacity=".6"/>
      ${o.plain ? "" : `<path d="M236 112a14 14 0 1 0 6 22 11 11 0 1 1-6-22z" fill="${T.CREAM}" stroke="${T.INK}" stroke-width="1.2"/>${waves}`}
      ${o.inner || ""}</g>
    <path d="${path}" fill="none" stroke="${T.INK}" stroke-width="3"/>
    <path d="M44 ${bottom}V${top + 112}a106 106 0 0 1 212 0V${bottom}" fill="none" stroke="${T.GOLD}" stroke-width="1.4"/>`;
}

function tSymbol(k, x, y, s, color = T.GOLD2) {
  const d = SYM[k] || SYM.kurva;
  return `<g transform="translate(${x - 50 * s} ${y - 50 * s}) scale(${s})" fill="none" stroke-linecap="round" stroke-linejoin="round"><g stroke="${T.INK}" stroke-width="${9 / s}" opacity=".55">${d}</g><g stroke="${color}" stroke-width="${4.2 / s}">${d}</g></g>`;
}

// Teks yang lebarnya dikunci (textLength), supaya tidak keluar pita apa pun hurufnya
const tText = (txt, x, y, size, maxW, attrs) => `<text x="${x}" y="${y.toFixed(1)}" text-anchor="middle" font-size="${size.toFixed(1)}" textLength="${Math.min(maxW, txt.length * size * .74).toFixed(0)}" lengthAdjust="spacingAndGlyphs" ${attrs}>${esc(txt)}</text>`;

// Nama mata kuliah: satu baris, atau dua baris seimbang bila panjang
function nameLines(name) {
  const up = name.toUpperCase(), w = up.split(" ");
  if (up.length <= 16 || w.length < 2) return [up];
  let best = null;
  for (let k = 1; k < w.length; k++) {
    const a = w.slice(0, k).join(" "), b = w.slice(k).join(" "), score = Math.max(a.length, b.length);
    if (!best || score < best.score) best = { score, lines: [a, b] };
  }
  return best.lines;
}

function tRibbon(y, lines) {
  const h = lines.length > 1 ? 52 : 40;
  const size = Math.min(lines.length > 1 ? 15 : 17, 196 / (Math.max(...lines.map((l) => l.length)) * .74));
  const ty = y + h / 2 - ((lines.length - 1) * size * 1.05) / 2 + size * .36;
  return `<path d="M22 ${y + 8}h22v${h}H22l10 ${-h / 2}z" fill="#3a2c10" stroke="${T.INK}" stroke-width="1.5"/>
    <path d="M278 ${y + 8}h-22v${h}h22l-10 ${-h / 2}z" fill="#3a2c10" stroke="${T.INK}" stroke-width="1.5"/>
    <rect x="36" y="${y}" width="228" height="${h}" fill="${T.INK}" stroke="${T.INK}" stroke-width="2"/>
    <rect x="40" y="${y + 4}" width="220" height="${h - 8}" fill="none" stroke="${T.GOLD}" stroke-width="1"/>
    ${lines.map((l, i) => tText(l, 150, ty + i * size * 1.05, size, 200, `font-family="${SERIF}" font-weight="900" fill="${T.CREAM}"`)).join("")}`;
}

// 16 titik minggu; UTS dan UAS berbentuk wajik, minggu ini merah
function tWeeks(y, has) {
  return Array.from({ length: TOTAL }, (_, i) => {
    const n = i + 1, x = 150 + (i - (TOTAL - 1) / 2) * 12.8;
    if (EXAM[n]) return `<rect x="${x - 3}" y="${y - 3}" width="6" height="6" transform="rotate(45 ${x} ${y})" fill="${T.INK}"/>`;
    return `<circle cx="${x}" cy="${y}" r="3.4" fill="${n === NOW ? T.RED : has(n) ? T.INK : T.CREAM}" stroke="${T.INK}" stroke-width="1.1"/>`;
  }).join("");
}

function svgFront(c, num) {
  const lines = nameLines(c.nama), two = lines.length > 1;
  return `<svg viewBox="0 0 300 520" focusable="false">${tFrame()}
    <path d="M112 26h76l-8 13 8 13h-76l8-13z" fill="${T.CREAM}" stroke="${T.INK}" stroke-width="2"/>
    <text x="150" y="47" text-anchor="middle" font-family="${DECO}" font-weight="900" font-size="20" fill="${T.INK}">${ROMAN[num] || num}</text>
    <path d="M70 39h34M196 39h34" stroke="${T.GOLD}" stroke-width="1.5"/><circle cx="66" cy="39" r="2.5" fill="${T.GOLD}"/><circle cx="234" cy="39" r="2.5" fill="${T.GOLD}"/>
    ${tArch({ inner: tSymbol(c.simbol, 150, 206, 1.25) })}
    ${c.julukan ? tText(c.julukan.toUpperCase(), 150, 398, 11, 200, `font-family="${SERIF}" font-weight="700" fill="${T.CREAM}" stroke="${T.INK}" stroke-width="3" paint-order="stroke"`) : ""}
    ${tRibbon(416, lines)}
    ${tText(`${JENIS[c.jenis].toUpperCase()} · ${filled(c)}/${N_LECT} MINGGU`, 150, two ? 484 : 474, 9, 180, `font-family="${MONO}" fill="${T.INK}"`)}
    ${tWeeks(two ? 494 : 488, (n) => !!c.minggu[n])}</svg>`;
}

// Joker: dua arah. Atas langit biru (Teori), bawah merah tua terbalik (Praktikum), pita merah di tengah
function svgJoker(g) {
  const [t, p] = g.items, name = g.main.nama.toUpperCase();
  const half = (c, sky, color) => `<g>${tArch({ top: 82, bottom: 236, sunY: 176, sky1: sky[0], sky2: sky[1], sky3: sky[2], plain: true, inner: tSymbol(c.simbol, 150, 176, .78, color) })}
    <text x="150" y="104" text-anchor="middle" font-family="${SERIF}" font-weight="900" font-size="16" letter-spacing="3" fill="${T.CREAM}" stroke="${T.INK}" stroke-width="3.5" paint-order="stroke">${JENIS[c.jenis].toUpperCase()}</text>
    <text x="150" y="121" text-anchor="middle" font-family="${MONO}" font-size="9" letter-spacing="1" fill="${T.CREAM}" stroke="${T.INK}" stroke-width="2.5" paint-order="stroke">${filled(c)}/${N_LECT} MINGGU</text></g>`;
  const zero = `<path d="M128 22h44l-6 9 6 9h-44l6-9z" fill="${T.RED}" stroke="${T.INK}" stroke-width="2"/><text x="150" y="37" text-anchor="middle" font-family="${DECO}" font-weight="900" font-size="15" fill="${T.CREAM}">0</text>`;
  return `<svg viewBox="0 0 300 520" focusable="false">${tFrame()}<rect x="18" y="18" width="264" height="484" rx="4" fill="#efe1bf"/>
    ${half(t, ["#0a1550", "#1450ec", "#3ccbff"], T.GOLD2)}
    <g transform="rotate(180 150 260)">${half(p, ["#1a0308", "#7a0010", "#d90016"], "#ffd7a0")}</g>
    <g transform="rotate(-8 150 260)"><rect x="6" y="233" width="288" height="54" fill="${T.RED}" stroke="${T.INK}" stroke-width="2.5"/><rect x="6" y="238" width="288" height="44" fill="none" stroke="${T.GOLD2}" stroke-width="1"/>
      <text x="150" y="256" text-anchor="middle" font-family="${MONO}" font-size="9" letter-spacing="3" fill="${T.CREAM}">0 · JOKER</text>
      ${tText(name, 150, 276, Math.min(16, 250 / (name.length * .74)), 250, `font-family="${SERIF}" font-weight="900" fill="${T.CREAM}" stroke="${T.INK}" stroke-width="3" paint-order="stroke"`)}</g>
    ${zero}<g transform="rotate(180 150 260)">${zero}</g></svg>`;
}

// Punggung kartu: biru laut, bingkai emas, lingkaran 16 sinar (16 minggu), bulan sabit
function svgBack() {
  const id = ++svgId, cx = 150, cy = 260;
  const rays = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2 - Math.PI / 2, big = i % 4 === 0, r2 = big ? 112 : 92, q = (r) => `${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`;
    const [dx, dy] = q(r2 + 7).split(" ");
    return `<path d="M${q(52)}L${q(r2)}" stroke="${T.GOLD2}" stroke-width="${big ? 2.4 : 1.2}"/><circle cx="${dx}" cy="${dy}" r="${big ? 4 : 2.4}" fill="${i === 0 || i === 8 ? T.INK : T.GOLD2}" stroke="${T.GOLD2}" stroke-width="1"/>`;
  }).join("");
  const moons = [[74, 0], [446, 180]].map(([y, r]) => `<g transform="rotate(${r} 150 ${y})"><circle cx="150" cy="${y}" r="16" fill="none" stroke="${T.GOLD2}" stroke-width="1.4"/><path d="M153 ${y - 11}a12 12 0 1 0 0 22 9 9 0 1 1 0-22z" fill="${T.GOLD2}"/></g>`).join("");
  const stars = [[70, 120], [230, 120], [70, 400], [230, 400]].map(([x, y]) => `<path d="M${x} ${y - 9}l2.4 6.6 6.6 2.4-6.6 2.4-2.4 6.6-2.4-6.6-6.6-2.4 6.6-2.4z" fill="${T.GOLD2}"/>`).join("");
  return `<svg viewBox="0 0 300 520" focusable="false"><defs>
      <radialGradient id="tb${id}" cx=".5" cy=".5" r=".7"><stop offset="0" stop-color="#1450ec"/><stop offset=".7" stop-color="#0a2bb0"/><stop offset="1" stop-color="#071c80"/></radialGradient>
      <pattern id="tp${id}" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M10 0l10 10-10 10L0 10z" fill="none" stroke="#fff" stroke-width=".6" opacity=".14"/></pattern></defs>
    <rect x="2" y="2" width="296" height="516" rx="14" fill="url(#tb${id})" stroke="${T.INK}" stroke-width="4"/><rect x="2" y="2" width="296" height="516" rx="14" fill="url(#tp${id})"/>
    <rect x="14" y="14" width="272" height="492" rx="7" fill="none" stroke="${T.GOLD2}" stroke-width="2.5"/><rect x="21" y="21" width="258" height="478" rx="4" fill="none" stroke="${T.GOLD2}" stroke-width="1" stroke-dasharray="2 4"/>
    ${moons}${stars}<circle cx="${cx}" cy="${cy}" r="128" fill="none" stroke="${T.GOLD2}" stroke-width="1" stroke-dasharray="1 5"/><circle cx="${cx}" cy="${cy}" r="100" fill="none" stroke="${T.GOLD2}" stroke-width="1.4"/>${rays}
    <circle cx="${cx}" cy="${cy}" r="46" fill="${T.CREAM}" stroke="${T.INK}" stroke-width="3"/><circle cx="${cx}" cy="${cy}" r="40" fill="none" stroke="${T.GOLD}" stroke-width="1.2"/>
    <text x="${cx}" y="${cy + 15}" text-anchor="middle" font-family="${DECO}" font-weight="900" font-size="44" fill="${T.RED}" stroke="${T.INK}" stroke-width="1.2">A</text>
    <text x="${cx}" y="486" text-anchor="middle" font-family="${SERIF}" font-weight="700" font-size="10" letter-spacing="4" fill="${T.GOLD2}">SAINS DATA TERAPAN</text></svg>`;
}

// Urutan kartu: Joker di kedua ujung kipas, kartu bernomor di tengah
function handOrder() {
  const jokers = GROUPS.filter((g) => g.items.length > 1), rest = GROUPS.filter((g) => g.items.length === 1);
  const out = [...rest];
  jokers.forEach((j, i) => (i % 2 ? out.push(j) : out.unshift(j)));
  return out;
}

function cardHTML(g, i, num) {
  const joker = g.items.length > 1, m = g.main;
  const count = g.items.map((c) => `${joker ? JENIS[c.jenis] + " " : ""}${filled(c)}/${N_LECT}`).join(" · ");
  const tip = `<b>${joker ? "0 · Joker" : ROMAN[num]}</b> ${esc(m.nama)} · ${joker ? "" : JENIS[m.jenis] + " "}${count} minggu terisi`;
  const label = joker
    ? `Kartu Joker: ${m.nama}, ${g.items.map((c) => `${JENIS[c.jenis]} ${filled(c)}`).join(" dan ")} dari ${N_LECT} minggu terisi`
    : `Kartu ${ROMAN[num]}: ${m.nama}, ${JENIS[m.jenis]}, ${filled(m)} dari ${N_LECT} minggu terisi`;
  const front = joker
    ? `<span class="tc-jh top">${svgJoker(g)}</span><span class="tc-jh bottom">${svgJoker(g)}</span>`
    : svgFront(m, num);
  return `<button class="tc${joker ? " joker" : ""}" type="button" data-g="${esc(g.key)}" data-tip="${esc(tip)}" style="--i:${i}" tabindex="-1"><span class="sr-only">${esc(label)}</span><span class="tc-inner" aria-hidden="true">
    <span class="tc-face tc-front">${front}</span><span class="tc-face tc-back">${svgBack()}</span></span></button>`;
}

const TIP_DEFAULT = `<b>Joker</b> = teori + praktikum · pilih satu kartu`;
let handFocus = 0;
function viewCourses(anim) {
  const order = handOrder();
  let num = 0;
  const cards = order.map((g, i) => cardHTML(g, i, g.items.length > 1 ? 0 : ++num)).join("");
  swap(`<div class="tc-hand ${anim === "out" ? "no-deal" : ""}" role="group" aria-label="Kartu mata kuliah">${cards}</div>
    <p class="tc-tip" aria-hidden="true">${TIP_DEFAULT}</p>`, anim);
  const hand = stage.querySelector(".ks-view:last-child .tc-hand");
  const cs = [...hand.querySelectorAll(".tc")];
  layoutHand(hand);
  // Tata ulang setiap kali ukuran kipas berubah (termasuk saat pertama kali tampil)
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => { if (!hand.isConnected) return ro.disconnect(); layoutHand(hand); });
    ro.observe(hand);
  }
  cs.forEach((c, i) => {
    c.addEventListener("mouseenter", () => lift(hand, i));
    c.addEventListener("focus", () => { lift(hand, i); if (hand.classList.contains("swipe")) c.scrollIntoView({ inline: "center", block: "nearest", behavior: reduce ? "auto" : "smooth" }); });
    c.addEventListener("click", () => pick(c, GROUPS.find((g) => g.key === c.dataset.g)));
  });
  hand.addEventListener("mouseleave", () => lift(hand, -1));
  const start = Math.min(handFocus, cs.length - 1);
  cs.forEach((c, i) => (c.tabIndex = i === start ? 0 : -1));
  return cs;
}

// Posisi kartu dalam kipas (atau geser-samping di ponsel dan layar sempit)
function layoutHand(hand) {
  if (!hand) return;
  const cs = [...hand.querySelectorAll(".tc")], n = cs.length;
  hand.classList.remove("swipe");
  const W = hand.clientWidth, cw = cs[0].offsetWidth;
  if (!W || !cw) return;
  // Kartu miring memakan lebar lebih (~1.34x); sisakan ruang agar kartu tepi tidak terpotong
  const step = Math.min(cw * 0.9, (W - cw * 1.34) / (n - 1));
  const swipe = innerWidth <= 760 || step < cw * 0.55;
  hand.classList.toggle("swipe", swipe);
  if (swipe) { cs.forEach((c) => ["--x", "--y", "--r"].forEach((v) => c.style.setProperty(v, v === "--r" ? "0deg" : "0px"))); return; }
  // Saat kartu disorot, tetangga bergeser memberi ruang, tapi tidak melewati tepi panggung
  const slack = (W - (n - 1) * step - cw * 1.34) / 2;
  hand.style.setProperty("--spread", Math.max(0, Math.min((cw - step) / 2, slack)) + "px");
  cs.forEach((c, i) => {
    const k = i - (n - 1) / 2;
    c.style.setProperty("--x", (k * step).toFixed(1) + "px");
    c.style.setProperty("--y", (k * k * 2.6).toFixed(1) + "px");
    c.style.setProperty("--r", (k * 2.8).toFixed(2) + "deg");
    c.style.zIndex = i + 1;
  });
}
addEventListener("resize", () => layoutHand(stage.querySelector(".ks-view:last-child .tc-hand")));

// Kartu yang disorot terangkat; tetangga bergeser memberi ruang; namanya tampil besar di bawah kipas
function lift(hand, idx) {
  const cs = [...hand.querySelectorAll(".tc")];
  cs.forEach((c, i) => {
    c.classList.toggle("lift", i === idx);
    c.style.setProperty("--dx", idx < 0 || i === idx ? "0px" : `calc(var(--spread, 0px) * ${i < idx ? -1 : 1})`);
  });
  const tip = hand.parentElement.querySelector(".tc-tip");
  if (tip) tip.innerHTML = idx < 0 ? TIP_DEFAULT : cs[idx].dataset.tip;
}

// Memilih kartu: kartu terbang ke tengah dan membalik (Joker: terbelah dua)
function pick(card, g) {
  const hand = card.parentElement;
  if (hand.classList.contains("picking")) return;
  handFocus = [...hand.children].indexOf(card);
  const joker = g.items.length > 1;
  const go = () => (joker ? openGroup(g.key, null) : openCourse(g.main.id, null));
  if (reduce) return go();
  const sr = stage.getBoundingClientRect(), r = card.getBoundingClientRect();
  card.style.setProperty("--tx", (sr.left + sr.width / 2 - (r.left + r.width / 2)) + "px");
  card.style.setProperty("--ty", (sr.top + sr.height * 0.48 - (r.top + r.height / 2)) + "px");
  hand.classList.add("picking");
  card.classList.add(joker ? "split" : "picked");
  setTimeout(go, joker ? 620 : 520);
}

// ---------- Langkah 1b: layar kiri Teori, kanan Praktikum ----------
let group = null;
function viewChoose(anim, origin) {
  const half = (c) => `
    <button class="rk-half ${c.jenis}" type="button" data-id="${esc(c.id)}">
      <span class="rk-half-label">${JENIS[c.jenis]}</span>
      <span class="rk-half-body">
        ${miniRing(c).replace('class="ks-ring-mini"', 'class="ks-ring-mini rk-ring-big"')}
        <b>${esc(c.nama)}</b>
        <small translate="no">${esc(c.dosen)}</small>
        <span class="ks-count">${filled(c)} dari ${N_LECT} minggu terisi</span>
      </span>
      <span class="rk-go">Pilih <kbd>${c.jenis === "teori" ? "&lt;" : "&gt;"}</kbd></span>
    </button>`;
  swap(`<div class="rk-choose">${group.items.map(half).join("")}</div><p class="tc-tip" aria-hidden="true"><span>Joker</span> ${esc(group.main.nama)} · pilih sisi</p>`, anim, origin);
  const halves = [...stage.querySelectorAll(".ks-view:last-child .rk-half")];
  // Label besar (TEORI / PRAKTIKUM) dikecilkan bila tidak muat, tanpa memotong kata
  halves.forEach((h) => {
    const l = h.querySelector(".rk-half-label");
    let size = parseFloat(getComputedStyle(l).fontSize);
    while (l.scrollWidth > l.clientWidth + 1 && size > 14) { size -= 1; l.style.fontSize = size + "px"; }
  });
  halves.forEach((h) => h.addEventListener("click", () => openCourse(h.dataset.id, h)));
  return halves;
}

// ---------- Langkah 2: lingkaran 16 minggu (16 di atas, UTS 8 di bawah) ----------
function viewRing(anim, origin) {
  const c = course;
  const pos = (n, r) => { const a = (n / TOTAL) * 2 * Math.PI - Math.PI / 2; return `--x:calc(var(--d) * ${(r * Math.cos(a)).toFixed(4)});--y:calc(var(--d) * ${(r * Math.sin(a)).toFixed(4)})`; };
  const first = NOW && !EXAM[NOW] ? NOW : nextLect(NOW || 0) || LECT[0];
  const nodes = Array.from({ length: TOTAL }, (_, i) => {
    const n = i + 1;
    if (EXAM[n]) {
      return `<span class="ks-exam-node${n === NOW ? " now" : ""}" style="${pos(n, .5)};--i:${i}" role="img" aria-label="Minggu ${n}, ${EXAM[n]}, ${weekRange(n)}${n === NOW ? ", minggu ini" : ""}" data-n="${n}"><span>${EXAM[n]}</span></span>`;
    }
    const cls = [c.minggu[n] ? "has" : "", n === NOW ? "now" : ""].join(" ").trim();
    const label = `Minggu ${n}, ${weekRange(n)}${c.minggu[n] ? ", ada rangkuman" : ", belum ada rangkuman"}${n === NOW ? ", minggu ini" : ""}`;
    return `<button class="ks-week ${cls}" type="button" data-n="${n}" style="${pos(n, .5)};--i:${i}" aria-label="${label}" tabindex="${n === first ? 0 : -1}">${n}</button>`;
  }).join("");
  swap(`
    <div class="ks-orbit-wrap">
      <span class="ks-atom" style="--rot:30deg;--dur:38s" aria-hidden="true"></span>
      <span class="ks-atom" style="--rot:-30deg;--dur:52s" aria-hidden="true"></span>
      <span class="ks-atom" style="--rot:90deg;--dur:64s" aria-hidden="true"></span>
      <div class="ks-orbit" aria-hidden="true"></div>
      <div class="ks-nucleus ${c.nama.length > 22 ? "long" : ""}"><div class="ks-nuc-in"><span class="rk-type ${c.jenis}">${JENIS[c.jenis]}</span><b>${esc(c.nama)}</b><small translate="no">${esc(c.dosen)}</small><span class="ks-hint" id="ks-hint" aria-live="polite">Pilih minggu</span></div></div>
      <div role="group" aria-label="Minggu kuliah">${nodes}</div>
    </div>
    <p class="ks-hint-out" id="ks-hint-out" aria-hidden="true">Pilih minggu</p>
    <div class="ks-legend" aria-hidden="true"><span><i class="l-has"></i>Ada rangkuman</span><span><i></i>Belum ada</span><span><i class="l-now"></i>Minggu ini</span><span><i class="l-exam"></i>UTS / UAS</span></div>`, anim, origin);
  fitNucleus();
  const btns = [...stage.querySelectorAll(".ks-view:last-child .ks-week")];
  const hint = $("#ks-hint", stage.querySelector(".ks-view:last-child")), hintOut = $("#ks-hint-out", stage.querySelector(".ks-view:last-child"));
  const say = (html) => { hint.innerHTML = hintOut.innerHTML = html; };
  stage.querySelectorAll(".ks-view:last-child .ks-exam-node").forEach((x) => {
    const n = +x.dataset.n;
    x.addEventListener("mouseenter", () => say(`Minggu ${n} · ${EXAM[n]}<small>${weekRangeShort(n)} · tanpa rangkuman</small>`));
  });
  btns.forEach((b, i) => {
    const n = +b.dataset.n;
    const info = () => say(`Minggu ${n} · ${weekRangeShort(n)}${c.minggu[n] ? "" : "<small>belum ada rangkuman</small>"}`);
    b.addEventListener("mouseenter", info);
    b.addEventListener("focus", info);
    b.addEventListener("click", () => openWeek(n, b));
    b.addEventListener("keydown", (e) => {
      const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!d) return;
      e.preventDefault();
      const next = btns[(i + d + btns.length) % btns.length];
      btns.forEach((x) => (x.tabIndex = -1)); next.tabIndex = 0; next.focus();
    });
  });
  return btns;
}

// Kecilkan nama di inti lingkaran sampai kata terpanjang muat (tidak dipotong di tengah kata)
function fitNucleus() {
  const b = stage.querySelector(".ks-view:last-child .ks-nucleus b") || stage.querySelector(".ks-nucleus b");
  if (!b) return;
  b.style.fontSize = "";
  const n = b.closest(".ks-nucleus");
  // Semua baris teks harus berada di dalam lingkaran, bukan hanya di dalam kotak
  const fits = () => {
    if (b.scrollWidth > b.clientWidth + 1) return false;
    const c = n.getBoundingClientRect(), cx = c.left + c.width / 2, cy = c.top + c.height / 2, R = c.width / 2 - 4;
    return [...n.querySelectorAll(".ks-nuc-in > *")].filter((el) => el.offsetParent).every((el) => {
      const rg = document.createRange(); rg.selectNodeContents(el);
      return [...rg.getClientRects()].every((r) => [[r.left, r.top], [r.right, r.top], [r.left, r.bottom], [r.right, r.bottom]].every(([x, y]) => Math.hypot(x - cx, y - cy) <= R));
    });
  };
  let size = parseFloat(getComputedStyle(b).fontSize);
  while (!fits() && size > 8) { size -= 0.5; b.style.fontSize = size + "px"; }
}
addEventListener("resize", () => course && fitNucleus());

function swap(html, anim, origin) {
  const old = stage.querySelector(".ks-view");
  const view = document.createElement("div");
  view.className = "ks-view";
  view.innerHTML = html;
  if (origin) {
    const r = stage.getBoundingClientRect();
    view.style.transformOrigin = `${origin.x - r.left}px ${origin.y - r.top}px`;
  }
  if (old && anim && !reduce) {
    old.style.transformOrigin = view.style.transformOrigin;
    old.classList.add(anim === "in" ? "zoom-out" : "zoom-back-out");
    setTimeout(() => old.remove(), 400);
    view.classList.add(anim === "in" ? "zoom-in" : "zoom-back-in");
  } else if (old) old.remove();
  stage.appendChild(view);
}

// ---------- Langkah 3: halaman Notion ----------
const ICON = {
  book: '<path d="M3 3.5h4.5a2 2 0 0 1 2 2V16a1.6 1.6 0 0 0-1.6-1.6H3zM16.5 3.5H12a2 2 0 0 0-2 2V16a1.6 1.6 0 0 1 1.6-1.6h4.9z"/>',
  tag: '<path d="M3 3h6.5l7 7-6.5 6.5-7-7z"/><circle cx="6.5" cy="6.5" r="1"/>',
  cal: '<rect x="3" y="4" width="14" height="13" rx="1.5"/><path d="M3 8h14M7 2.5v3M13 2.5v3"/>',
  user: '<circle cx="10" cy="7" r="3.2"/><path d="M3.5 17c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5"/>',
  pen: '<path d="M13.5 3.5l3 3L7 16H4v-3z"/>',
  dot: '<circle cx="10" cy="10" r="6"/><path d="M10 6.5v4l2.5 1.5"/>'
};
const ico = (k) => `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>`;

function openWeek(n, from, force) {
  if (!n || EXAM[n] || n < 1 || n > TOTAL) return;
  if (edit && !force) return leaveEdit(() => openWeek(n, from, true));
  page.classList.remove("editing");
  if (!force) bar();
  editBtn.hidden = !canEdit;
  week = n;
  if (from) lastFocus = from;
  const k = course.minggu[n];
  const status = k ? (k.status === "contoh" ? ["contoh", "Contoh"] : ["selesai", "Selesai"]) : ["kosong", "Belum ada"];
  $("#np-path").innerHTML = crumbParts().map((p) => `<li>${esc(p)}</li>`).join("");
  const pv = prevLect(n), nx = nextLect(n);
  $("#np-prev").disabled = !pv;
  $("#np-next").disabled = !nx;
  $("#np-body").innerHTML = `
    <div class="np-icon" aria-hidden="true"><span>${n}</span></div>
    <h1 class="np-title" id="np-title">${esc(k ? k.judul : "Minggu " + n)}</h1>
    <dl class="np-props">
      <dt>${ico("book")}Mata kuliah</dt><dd>${esc(course.nama)}</dd>
      <dt>${ico("tag")}Jenis</dt><dd><span class="np-tag ${course.jenis}">${JENIS[course.jenis]}</span></dd>
      <dt>${ico("cal")}Minggu</dt><dd>Minggu ${n} \u00b7 ${fmtShort.format(weekStart(n))} - ${fmtYear.format(weekEnd(n))}</dd>
      <dt>${ico("user")}Dosen</dt><dd translate="no">${esc(course.dosen)}</dd>
      <dt>${ico("pen")}Penulis</dt><dd translate="no">${esc(k ? k.penulis || "-" : "-")}</dd>
      <dt>${ico("dot")}Status</dt><dd><span class="np-tag ${status[0]}">${status[1]}</span></dd>
    </dl>
    <hr class="np-hr">
    <div class="np-content">${k ? render(k.isi) : `<p class="np-empty">Belum ada rangkuman untuk minggu ini. ${canEdit ? "Tekan <b>Sunting</b> untuk menulisnya." : "Tambahkan di <code>data/rangkuman.js</code>."}</p>`}</div>
    ${metaLine(k)}
    <div class="np-pager">
      <button type="button" data-go="${pv || ""}" ${pv ? "" : "disabled"}><small>Sebelumnya${pv && EXAM[n - 1] ? " · sebelum " + EXAM[n - 1] : ""}</small>&lt; ${pv ? "Minggu " + pv : "Awal semester"}</button>
      <button type="button" data-go="${nx || ""}" ${nx ? "" : "disabled"}><small>Berikutnya${nx && EXAM[n + 1] ? " · setelah " + EXAM[n + 1] : ""}</small>${nx ? "Minggu " + nx : "Akhir semester"} &gt;</button>
    </div>`;
  $("#np-body").querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => openWeek(+b.dataset.go)));
  page.scrollTop = 0;
  pageWrap.classList.add("show");
  root.inert = true;                       // halaman bacaan bersifat modal
  crumb();
  setHash();
  setTimeout(() => page.focus({ preventScroll: true }), 60);
}
$("#np-prev").addEventListener("click", () => week && openWeek(prevLect(week)));
$("#np-next").addEventListener("click", () => week && openWeek(nextLect(week)));
$("#np-close").addEventListener("click", () => closeWeek());

// Layar penuh (Fullscreen API). Disembunyikan bila peramban tidak mendukung (mis. iPhone, pratinjau tertanam)
const fsBtn = $("#np-full");
const fsOn = () => document.fullscreenElement === pageWrap;
if (!(document.fullscreenEnabled && pageWrap.requestFullscreen)) fsBtn.hidden = true;
async function toggleFullscreen() {
  if (fsBtn.hidden) return;
  try { if (fsOn()) await document.exitFullscreen(); else await pageWrap.requestFullscreen(); }
  catch { fsBtn.hidden = true; }
}
fsBtn.addEventListener("click", toggleFullscreen);
document.addEventListener("fullscreenchange", () => {
  const on = fsOn();
  pageWrap.classList.toggle("fs", on);
  fsBtn.setAttribute("aria-pressed", String(on));
  $("#np-full-label").textContent = on ? "Keluar layar penuh" : "Layar penuh";
});
pageWrap.addEventListener("click", (e) => { if (e.target === pageWrap) closeWeek(); });

function closeWeek(force) {
  if (edit && !force) return leaveEdit(() => closeWeek(true));
  page.classList.remove("editing");
  bar();
  if (fsOn()) document.exitFullscreen().catch(() => {});
  const n = week;
  week = null;
  pageWrap.classList.remove("show");
  root.inert = false;
  crumb();
  setHash();
  const target = stage.querySelector(`.ks-week[data-n="${n}"]`) || lastFocus;
  if (target && document.contains(target)) target.focus({ preventScroll: true });
}

// ---------- Sunting di tempat (disimpan di Firebase; lihat assets/js/awan.js dan SUNTING.md) ----------
const cloud = window.SDT && window.SDT.awan;
const canEdit = !!(cloud && cloud.aktif);
const editBtn = $("#np-edit");
const barEl = $("#np-bar");
let edit = null;                 // { n, versi, dirty } selama menyunting
let cloudState = canEdit ? "memuat" : "mati", cloudReady = null;
const docId = (c, n) => `${c.id}__${n}`;
const fmtStamp = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

function metaLine(k) {
  const parts = [];
  if (k && k.versi) parts.push("Terakhir diubah " + fmtStamp.format(new Date(k.versi)));
  if (cloudState === "gagal") parts.push("Versi terbaru tidak bisa dimuat; yang tampil salinan bawaan situs.");
  return parts.length ? `<p class="np-meta">${esc(parts.join(" · "))}</p>` : "";
}

// Bilah pesan di bawah bilah atas. buttons: [[label, fungsi, utama?], ...]
function bar(text, buttons) {
  barEl.hidden = !text;
  barEl.innerHTML = "";
  if (!text) return;
  barEl.setAttribute("role", buttons ? "alertdialog" : "status");
  if (buttons) barEl.setAttribute("aria-label", text); else barEl.removeAttribute("aria-label");
  const p = document.createElement("p");
  p.textContent = text;
  barEl.appendChild(p);
  (buttons || [["Tutup pesan", () => bar()]]).forEach(([label, fn, main]) => {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = label; b.className = main ? "ed-primary" : "ed-ghost";
    b.addEventListener("click", fn);
    barEl.appendChild(b);
  });
  if (buttons) barEl.querySelector("button").focus();
}

function applyCloud(docs) {
  D.matkul.forEach((c) => LECT.forEach((n) => {
    const d = docs[docId(c, n)];
    if (d) c.minggu[n] = { judul: d.judul, penulis: d.penulis, isi: d.isi, versi: d.versi };
  }));
}
function loadCloud() {
  cloudState = "memuat";
  cloudReady = cloud.muat().then((docs) => { applyCloud(docs); cloudState = "siap"; }, () => { cloudState = "gagal"; }).then(refresh);
  return cloudReady;
}
// Gambar ulang tampilan yang sedang terbuka setelah data berubah
function refresh() {
  if (!document.body.classList.contains("ks-open") || edit) return;
  const had = stage.contains(document.activeElement);
  if (stage.querySelector(".picking")) return;                // kartu sedang terbang; tampilan berikutnya sudah memakai data baru
  if (course) viewRing(null);
  else if (group && group.items.length > 1) viewChoose(null);
  else viewCourses("out");
  if (had) (stage.querySelector(".ks-week[tabindex='0'], .rk-half, .tc[tabindex='0']") || $("#ks-back", root)).focus({ preventScroll: true });
  if (week && !$("#np-body .ed-login")) { const y = page.scrollTop; openWeek(week, null, true); page.scrollTop = y; }
}

const draftKey = () => "rk-draf:" + docId(course, edit ? edit.n : week);
const getDraft = () => { try { return JSON.parse(localStorage.getItem(draftKey())); } catch { return null; } };
const setDraft = (v) => { try { v ? localStorage.setItem(draftKey(), JSON.stringify(v)) : localStorage.removeItem(draftKey()); } catch {} };

async function startEdit() {
  if (!week || edit || !canEdit) return;
  if (cloudState !== "siap") {
    editBtn.disabled = true;
    await (cloudState === "gagal" ? loadCloud() : cloudReady);
    editBtn.disabled = false;
    if (cloudState !== "siap") return bar("Tidak bisa terhubung ke penyimpanan. Periksa koneksi internet lalu coba lagi.");
  }
  if (!cloud.pengguna()) return showLogin();
  showEditor();
}
editBtn.addEventListener("click", startEdit);

function showLogin() {
  bar();
  editBtn.hidden = true;
  const box = $("#np-body .np-content");
  box.innerHTML = `<form class="ed-login" novalidate>
    <h2>Masuk untuk menyunting</h2>
    <p>Hanya akun penyunting yang didaftarkan pengurus kelas yang bisa mengubah rangkuman.</p>
    <label for="ed-email">Email</label><input id="ed-email" type="email" autocomplete="username" spellcheck="false" required>
    <label for="ed-sandi">Kata sandi</label><input id="ed-sandi" type="password" autocomplete="current-password" required>
    <p class="ed-err" id="ed-err" role="alert"></p>
    <div class="ed-actions"><button class="ed-primary" type="submit">Masuk</button><button class="ed-ghost" type="button" id="ed-batal">Batal</button></div>
  </form>`;
  const form = $(".ed-login", box), err = $("#ed-err", box);
  $("#ed-batal", box).addEventListener("click", () => openWeek(week, null, true));
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = $("#ed-email", box).value.trim(), sandi = $("#ed-sandi", box).value;
    if (!email || !sandi) { err.textContent = "Isi email dan kata sandi."; return; }
    const btn = form.querySelector("[type=submit]");
    btn.disabled = true; err.textContent = "";
    try { await cloud.masuk(email, sandi); showEditor(); }
    catch (x) { err.textContent = x.message; btn.disabled = false; }
  });
  setTimeout(() => $("#ed-email", box)?.focus(), 80);
}

addEventListener("resize", () => { const ta = $("#ed-isi"); if (edit && ta) { ta.style.height = "auto"; ta.style.height = ta.scrollHeight + 2 + "px"; } });
const TOOLS = [["h2", "Judul", "## "], ["h3", "Subjudul", "### "], ["ul", "Poin", "- "], ["ol", "Nomor", "1. "], ["todo", "Centang", "- [ ] "], ["quote", "Kutipan", "> "], ["note", "Catatan", "! "], ["toggle", "Buka-tutup", "+ "], ["hr", "Garis", "---"], ["b", "Tebal", "**"], ["i", "Miring", "*"], ["code", "Kode", "`"]];

function showEditor() {
  const n = week, k = course.minggu[n];
  edit = { n, versi: (k && k.versi) || null, dirty: false };
  const draft = getDraft();
  const v = draft || { judul: k ? k.judul : "", penulis: k && k.status !== "contoh" ? k.penulis || "" : "", isi: k ? String(k.isi || "").trim() : "" };
  bar(draft ? "Draf yang belum tersimpan dipulihkan." : "");
  if (draft) edit.dirty = true;
  editBtn.hidden = true;
  page.classList.add("editing");
  const body = $("#np-body");
  body.querySelector(".np-title").innerHTML = `<label class="sr-only" for="ed-judul">Judul rangkuman</label><input class="ed-title" id="ed-judul" type="text" maxlength="120" placeholder="Judul rangkuman" autocomplete="off">`;
  const dds = body.querySelectorAll(".np-props dd");
  dds[4].innerHTML = `<input class="ed-prop" id="ed-penulis" type="text" maxlength="80" placeholder="Nama penulis" aria-label="Penulis" autocomplete="off">`;
  dds[5].innerHTML = `<span class="np-tag contoh">Sedang disunting</span>`;
  body.querySelector(".np-meta")?.remove();
  const box = body.querySelector(".np-content");
  box.classList.add("ed-wrap");
  box.innerHTML = `
    <div class="ed-tools" role="toolbar" aria-label="Format tulisan">${TOOLS.map(([id, label]) => `<button type="button" data-tool="${id}">${label}</button>`).join("")}</div>
    <div class="ed-panes">
      <div class="ed-pane"><label class="ed-cap" for="ed-isi">Tulisan</label><textarea id="ed-isi" maxlength="30000" spellcheck="false" placeholder="Tulis rangkuman di sini. Gunakan tombol di atas untuk judul, poin, catatan, dan lainnya."></textarea></div>
      <div class="ed-pane"><p class="ed-cap">Pratinjau</p><div class="ed-preview" id="ed-preview"></div></div>
    </div>
    <p class="ed-err" id="ed-err" role="alert"></p>
    <div class="ed-actions">
      <button class="ed-primary" type="button" id="ed-simpan">Simpan</button>
      <button class="ed-ghost" type="button" id="ed-batal">Batal</button>
      <span class="ed-who"><span translate="no">${esc(cloud.pengguna())}</span> <button class="ed-link" type="button" id="ed-keluar">Keluar</button></span>
    </div>`;
  const judul = $("#ed-judul", body), penulis = $("#ed-penulis", body), ta = $("#ed-isi", body), prev = $("#ed-preview", body);
  judul.value = v.judul; penulis.value = v.penulis; ta.value = v.isi;
  const grow = () => { ta.style.height = "auto"; ta.style.height = ta.scrollHeight + 2 + "px"; };
  const paint = () => { prev.innerHTML = ta.value.trim() ? render(ta.value) : `<p class="np-empty">Pratinjau muncul di sini.</p>`; grow(); };
  const changed = () => { edit.dirty = true; setDraft({ judul: judul.value, penulis: penulis.value, isi: ta.value }); };
  ta.addEventListener("input", () => { changed(); paint(); });
  judul.addEventListener("input", changed);
  penulis.addEventListener("input", changed);

  box.querySelectorAll("[data-tool]").forEach((b) => b.addEventListener("click", () => {
    const pre = TOOLS.find((t) => t[0] === b.dataset.tool)[2];
    const s = ta.selectionStart, e = ta.selectionEnd, val = ta.value;
    if (["b", "i", "code"].includes(b.dataset.tool)) {
      const sel = val.slice(s, e) || "teks";
      ta.setRangeText(pre + sel + pre, s, e, "end");
      ta.setSelectionRange(s + pre.length, s + pre.length + sel.length);
    } else if (b.dataset.tool === "hr") {
      const end = val.indexOf("\n", e) < 0 ? val.length : val.indexOf("\n", e);
      ta.setRangeText("\n---\n", end, end, "end");
    } else {
      const ls = val.lastIndexOf("\n", s - 1) + 1;
      ta.setRangeText(pre, ls, ls, "preserve");
      ta.setSelectionRange(s + pre.length, e + pre.length);
    }
    ta.focus();
    changed(); paint();
  }));

  // Enter melanjutkan daftar; Enter pada baris daftar yang kosong mengakhirinya
  ta.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || e.shiftKey || e.ctrlKey || e.metaKey || e.isComposing || ta.selectionStart !== ta.selectionEnd) return;
    const s = ta.selectionStart, val = ta.value, ls = val.lastIndexOf("\n", s - 1) + 1, line = val.slice(ls, s);
    const m = line.match(/^(- \[[ xX]\] |- |\d+\. |> |! |  )/);
    if (!m) return;
    e.preventDefault();
    if (line === m[1]) ta.setRangeText("", ls, s, "end");
    else {
      let next = m[1];
      if (/^\d+\. $/.test(next)) next = parseInt(next, 10) + 1 + ". ";
      if (/^- \[/.test(next)) next = "- [ ] ";
      ta.setRangeText("\n" + next, s, s, "end");
    }
    changed(); paint();
  });

  $("#ed-simpan", body).addEventListener("click", () => save());
  $("#ed-batal", body).addEventListener("click", () => leaveEdit(() => openWeek(n, null, true)));
  $("#ed-keluar", body).addEventListener("click", () => leaveEdit(() => { cloud.keluar(); openWeek(n, null, true); }));
  paint();
  setTimeout(() => (judul.value ? ta : judul).focus({ preventScroll: true }), 80);
}

// Meninggalkan mode sunting; bila ada perubahan belum tersimpan, tanya dulu
function leaveEdit(then) {
  const done = () => { setDraft(null); edit = null; bar(); then(); };
  if (!edit.dirty) return done();
  bar("Perubahan belum disimpan.", [["Lanjut menyunting", () => { bar(); $("#ed-isi")?.focus(); }, true], ["Buang perubahan", done]]);
}

async function save() {
  if (!edit || edit.busy) return;
  const body = $("#np-body"), err = $("#ed-err", body), btn = $("#ed-simpan", body);
  const data = { judul: $("#ed-judul", body).value.trim(), penulis: $("#ed-penulis", body).value.trim(), isi: $("#ed-isi", body).value.replace(/\s+$/, "") };
  err.textContent = "";
  if (!data.judul) { err.textContent = "Judul belum diisi."; $("#ed-judul", body).focus(); return; }
  if (!data.isi.trim()) { err.textContent = "Isi rangkuman masih kosong."; $("#ed-isi", body).focus(); return; }
  const n = edit.n, id = docId(course, n);
  edit.busy = true; btn.disabled = true; btn.textContent = "Menyimpan…";
  try {
    const versi = await cloud.simpan(id, data, edit.versi);
    course.minggu[n] = { ...data, versi };
    setDraft(null);
    edit = null;
    viewRing(null);
    openWeek(n, null, true);
    bar("Tersimpan. Semua pengunjung kini melihat versi ini.");
  } catch (x) {
    edit.busy = false; btn.disabled = false; btn.textContent = "Simpan";
    if (x.kode === "bentrok") {
      bar("Rangkuman ini baru saja diubah orang lain. Tulisan Anda masih ada di kotak sunting.", [
        ["Timpa dengan tulisan saya", async () => {
          bar();
          try { const d = await cloud.ambil(id); edit.versi = d ? d.versi : null; save(); }
          catch (y) { err.textContent = y.message; }
        }, true],
        ["Buang tulisan saya, lihat versi terbaru", async () => {
          try { const d = await cloud.ambil(id); if (d) course.minggu[n] = d; } catch {}
          setDraft(null); edit = null; viewRing(null); openWeek(n, null, true);
        }]
      ]);
    } else if (x.kode === "sesi") {
      edit = null;                                    // draf tetap tersimpan di peramban dan dipulihkan setelah masuk
      showLogin();
      $("#ed-err").textContent = "Sesi berakhir. Masuk lagi; tulisan Anda aman dan akan dipulihkan.";
    } else err.textContent = x.message;
  }
}


// ---------- Navigasi ----------
function setHash() {
  let h = "#rangkuman";
  if (course) h += "/" + course.id + (week ? "/" + week : "");
  else if (group) h += "/g/" + group.key;
  if (location.hash !== h) setUrl(h);
}

function crumbParts() {
  const parts = ["Rangkuman"];
  if (group && group.items.length > 1) parts.push(group.main.nama);
  if (course) parts.push(group && group.items.length > 1 ? JENIS[course.jenis] : course.nama);
  if (week) parts.push("Minggu " + week);
  return parts;
}

function open(path = "") {
  document.body.classList.add("ks-open");
  document.querySelector("main")?.setAttribute("inert", "");
  setLeft();
  const seg = path.split("/").filter(Boolean);
  week = null; course = null; group = null; edit = null;
  page.classList.remove("editing");
  pageWrap.classList.remove("show");
  root.inert = false;
  handFocus = 0;
  if (seg[0] === "g") group = GROUPS.find((g) => g.key === seg[1]) || null;
  else if (seg[0]) { course = D.matkul.find((c) => c.id === seg[0]) || null; group = course ? groupOf(course) : null; }
  crumb();
  if (course) viewRing(null);
  else if (group && group.items.length > 1) viewChoose(null);
  else { group = null; viewCourses(null); }
  const n = +seg[1];
  if (course && n >= 1 && n <= TOTAL && !EXAM[n]) openWeek(n);
  else setTimeout(() => (stage.querySelector(".ks-week[tabindex='0'], .rk-half, .tc[tabindex='0']") || $("#ks-back", root)).focus({ preventScroll: true }), 80);
  setHash();
}

// Titik asal zoom: elemen yang diklik, atau tengah panggung (setelah kartu terbang ke tengah)
function originOf(el) {
  const r = (el || stage).getBoundingClientRect();
  return { x: r.left + r.width / 2, y: el ? r.top + r.height / 2 : r.top + r.height * 0.48 };
}

function openGroup(key, card) {
  group = GROUPS.find((g) => g.key === key);
  if (group.items.length === 1) return openCourse(group.main.id, card);
  crumb();
  const halves = viewChoose("in", originOf(card));
  setHash();
  setTimeout(() => halves[0].focus({ preventScroll: true }), 120);
}

function openCourse(id, from) {
  course = D.matkul.find((c) => c.id === id);
  group = groupOf(course);
  crumb();
  const btns = viewRing("in", originOf(from));
  setHash();
  setTimeout(() => (btns.find((b) => b.tabIndex === 0) || btns[0]).focus({ preventScroll: true }), 120);
}

function back() {
  if (week) return closeWeek();
  if (course) {
    const id = course.id;
    course = null;
    crumb();
    if (group && group.items.length > 1) {
      viewChoose("out");
      setTimeout(() => stage.querySelector(`.ks-view:last-child .rk-half[data-id="${id}"]`)?.focus({ preventScroll: true }), 120);
    } else {
      const key = group && group.key; group = null;
      viewCourses("out");
      setTimeout(() => stage.querySelector(`.ks-view:last-child .tc[data-g="${key}"]`)?.focus({ preventScroll: true }), 120);
    }
    setHash();
    return;
  }
  if (group) {
    const key = group.key;
    group = null;
    crumb();
    viewCourses("out");
    setHash();
    setTimeout(() => stage.querySelector(`.ks-view:last-child .tc[data-g="${key}"]`)?.focus({ preventScroll: true }), 120);
    return;
  }
  close();
}

function close() {
  document.body.classList.remove("ks-open");
  document.querySelector("main")?.removeAttribute("inert");
  stage.innerHTML = "";
  course = group = week = null;
  setUrl(location.pathname + location.search);
  document.querySelector('.item[href="#rangkuman"]')?.focus({ preventScroll: true });
}

$("#ks-back", root).addEventListener("click", back);

document.addEventListener("keydown", (e) => {
  if (!document.body.classList.contains("ks-open")) return;
  if (e.key === "Escape") { e.preventDefault(); e.stopImmediatePropagation(); back(); return; }
  if (edit && (e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) { e.preventDefault(); e.stopImmediatePropagation(); save(); return; }
  if (week && (e.key === "f" || e.key === "F") && !e.ctrlKey && !e.metaKey && !e.altKey && !e.target.closest("input, textarea")) {
    e.preventDefault(); e.stopImmediatePropagation(); toggleFullscreen(); return;
  }
  // Di halaman bacaan: panah kiri/kanan berpindah minggu
  if (week && (e.key === "ArrowLeft" || e.key === "ArrowRight") && !e.target.closest("input, textarea")) {
    e.preventDefault();
    openWeek(e.key === "ArrowRight" ? nextLect(week) : prevLect(week));
    e.stopImmediatePropagation();
    return;
  }
  if (!course && !group && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
    const cs = [...stage.querySelectorAll(".ks-view:last-child .tc")];
    if (cs.length) {
      e.preventDefault();
      const cur = Math.max(0, cs.indexOf(document.activeElement));
      const nx = cs[(cur + (e.key === "ArrowRight" ? 1 : -1) + cs.length) % cs.length];
      cs.forEach((c) => (c.tabIndex = -1)); nx.tabIndex = 0; nx.focus({ preventScroll: true });
    }
    e.stopImmediatePropagation();
    return;
  }
  if (!course && group && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
    const h = stage.querySelectorAll(".ks-view:last-child .rk-half");
    if (h.length === 2) { e.preventDefault(); h[e.key === "ArrowLeft" ? 0 : 1].focus(); }
    e.stopImmediatePropagation();
    return;
  }
  if (["ArrowUp", "ArrowDown", "w", "W", "s", "S", "m", "M"].includes(e.key) && !e.target.closest(".ks-week")) e.stopImmediatePropagation();
}, true);

if (canEdit) loadCloud();

window.KS = { open, isOpen: () => document.body.classList.contains("ks-open"), render };
})();
