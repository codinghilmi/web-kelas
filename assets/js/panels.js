// Dimuat sebagai skrip biasa agar situs bisa dibuka tanpa server.
(function () {
// panels.js
// Mengubah data JSON menjadi isi panel. Setiap fungsi mengembalikan
// { sub, html, after? }: sub = keterangan di bawah judul, html = isi,
// after = dijalankan setelah html dipasang (untuk memasang event).

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const KULIAH = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
const FORMAT_TANGGAL = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" });
const ROMAWI = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const initials = (n) => n.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
const menit = (hm) => { const [h, m] = hm.split(".").map(Number); return h * 60 + m; };
const tanggal = (iso) => FORMAT_TANGGAL.format(new Date(iso + "T00:00:00"));
const kosong = (judul, isi) => `<div class="empty"><b>${judul}</b><p>${isi}</p></div>`;

function gagal(pesan) {
  return { sub: "Terjadi masalah", html: `<div class="error" role="alert"><b>Data belum bisa ditampilkan</b><p>${esc(pesan)}</p><p>Coba muat ulang halaman. Bila tetap gagal, minta pengurus kelas memeriksa berkas di folder <code>data/</code>.</p></div>` };
}

function makePanels(data, now = new Date()) {
  const hariIni = HARI[now.getDay()];
  const hariAktif = KULIAH.includes(hariIni) ? hariIni : "Senin";
  const hariMulai = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let cloudPengumuman = null;
  let cloudPengLoading = false;
  let pengMode = "list";
  let pengEditItem = null;
  const pengDeletedIds = new Set();
  try {
    const savedDel = JSON.parse(localStorage.getItem("peng-del") || "[]");
    savedDel.forEach((id) => pengDeletedIds.add(String(id)));
  } catch {}

  return {
    jadwal(day = hariAktif, rerender) {
      if (data.jadwal.error) return gagal(data.jadwal.error);
      const jadwal = data.jadwal.data;
      const tabs = KULIAH.map((d) => `<button class="tab" role="tab" type="button" id="tab-${d}" data-day="${d}" aria-selected="${d === day}" aria-controls="jadwal-hari" tabindex="${d === day ? 0 : -1}"><span><b>${d.slice(0, 3)}</b><small>${(jadwal[d] || []).length} sesi</small></span></button>`).join("");
      const nowM = now.getHours() * 60 + now.getMinutes();
      let nextFound = false;
      const sesi = jadwal[day] || [];
      const rows = sesi.map((s, i) => {
        let state = "";
        if (day === hariIni) {
          if (nowM >= menit(s.mulai) && nowM < menit(s.selesai)) state = "now";
          else if (!nextFound && nowM < menit(s.mulai)) { state = "next"; nextFound = true; }
        }
        const status = state === "now" ? `<span class="tag now">Sedang berlangsung</span> ` : state === "next" ? `<span class="tag next">Berikutnya</span> ` : "";
        return `<li class="${state}" style="--i:${i}"><span class="snum" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span><span class="tblock">${esc(s.mulai)} - ${esc(s.selesai)}</span><div><h3>${esc(s.matkul)}</h3><p><span translate="no">${esc(s.dosen.join(" / "))}</span> \u00b7 ${esc(s.ruang)}</p><p>PJ: <span translate="no">${esc(s.pj)}</span></p>${status}<span class="tag ${s.jenis === "praktikum" ? "red" : ""}">${esc(s.jenis)}</span></div></li>`;
      }).join("");
      return {
        sub: day === hariIni ? `${day} \u00b7 hari ini` : day,
        html: `<div class="tabs" role="tablist" aria-label="Pilih hari">${tabs}</div><div role="tabpanel" id="jadwal-hari" aria-labelledby="tab-${day}">${sesi.length ? `<ul class="list sched">${rows}</ul>` : kosong("Tidak ada kuliah", `Belum ada sesi untuk hari ${esc(day)}.`)}</div>`,
        after(body) {
          const tabEls = [...body.querySelectorAll(".tab")];
          tabEls.forEach((t, i) => {
            t.addEventListener("click", () => rerender(t.dataset.day));
            t.addEventListener("keydown", (e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              e.preventDefault();
              const n = tabEls[(i + (e.key === "ArrowRight" ? 1 : -1) + tabEls.length) % tabEls.length];
              rerender(n.dataset.day);
            });
          });
        }
      };
    },

    anggota() {
      if (data.anggota.error) return gagal(data.anggota.error);
      const sorted = [...data.anggota.data.mahasiswa].sort((a, b) => a.localeCompare(b, "id"));
      return {
        sub: `${sorted.length} mahasiswa`,
        html: `<label class="sr-only" for="cari">Cari nama</label><input class="search" id="cari" name="cari" type="search" placeholder="Cari nama mahasiswa\u2026" autocomplete="off" spellcheck="false"><p class="count" id="count" aria-live="polite"></p><ul class="people" id="people" translate="no"></ul>`,
        after(body) {
          const count = body.querySelector("#count"), list = body.querySelector("#people");
          const draw = (q = "") => {
            const hit = sorted.filter((n) => n.toLowerCase().includes(q.trim().toLowerCase()));
            count.textContent = q ? `${hit.length} dari ${sorted.length} nama` : `${sorted.length} nama, urut abjad`;
            list.innerHTML = hit.length
              ? hit.map((n, i) => `<li style="--i:${i}"><span class="initial" aria-hidden="true">${initials(n)}</span><span>${esc(n)}</span></li>`).join("")
              : `<li style="grid-column:1/-1;justify-content:center">Tidak ada nama yang cocok dengan "${esc(q)}"</li>`;
          };
          draw();
          body.querySelector("#cari").addEventListener("input", (e) => draw(e.target.value));
        }
      };
    },

    pengurus() {
      if (data.anggota.error) return gagal(data.anggota.error);
      const { dosenWali, pengurus } = data.anggota.data;
      // Gabungkan jabatan yang sama (mis. dua sekretaris) dalam satu kartu, urutan dipertahankan
      const grup = [];
      pengurus.forEach((p) => {
        const g = grup.find((x) => x.jabatan === p.jabatan);
        g ? g.nama.push(p.nama) : grup.push({ jabatan: p.jabatan, nama: [p.nama] });
      });
      const cards = grup.map((p, i) => `<div class="officer" style="--i:${i + 1}"><div class="num" aria-hidden="true">${ROMAWI[i] || i + 1}</div><p class="role">${esc(p.jabatan)}</p><p translate="no">${p.nama.map(esc).join("<br>")}</p></div>`).join("");
      return {
        sub: "Struktur organisasi kelas",
        html: `<div class="officer wali" style="--i:0"><div class="num" aria-hidden="true">0</div><p class="role" style="color:var(--foam)">${esc(dosenWali.jabatan)}</p><p translate="no">${esc(dosenWali.nama)}</p></div><div class="officers">${cards}</div>`
      };
    },

    pengumuman(arg, rerender) {
      if (data.pengumuman.error) return gagal(data.pengumuman.error);
      const cloud = window.SDT && window.SDT.awan;
      const canCloud = !!(cloud && cloud.aktif);

      // Muat data dari Firestore jika belum
      if (canCloud && cloudPengumuman === null && !cloudPengLoading) {
        cloudPengLoading = true;
        cloud.muatPengumuman().then((items) => {
          cloudPengumuman = items;
          cloudPengLoading = false;
          if (rerender) rerender();
        }).catch(() => {
          cloudPengLoading = false;
        });
      }

      // Gabungkan data lokal dan data Firestore
      const baseItems = (data.pengumuman.data || []).filter((p) => p.jenis === "pengumuman" && !pengDeletedIds.has(String(p.id)));
      const cloudItems = (cloudPengumuman || []).filter((p) => p.jenis === "pengumuman" && !pengDeletedIds.has(String(p.id)));

      const mergedMap = new Map();
      baseItems.forEach((p) => mergedMap.set(String(p.id), p));
      cloudItems.forEach((p) => mergedMap.set(String(p.id), p));

      const list = [...mergedMap.values()].sort((a, b) => (b.tanggal || "").localeCompare(a.tanggal || ""));
      const user = canCloud ? cloud.pengguna() : null;

      const sub = pengMode === "form"
        ? (pengEditItem ? "Ubah pengumuman" : "Buat pengumuman baru")
        : (pengMode === "login" ? "Masuk pengurus" : "Terbaru di atas");

      // Mode Form: Tambah / Ubah Pengumuman
      if (pengMode === "form") {
        const todayStr = new Date().toISOString().split("T")[0];
        const curJudul = pengEditItem ? esc(pengEditItem.judul) : "";
        const curTgl = pengEditItem ? esc(pengEditItem.tanggal) : todayStr;
        const curIsi = pengEditItem ? esc(pengEditItem.isi) : "";

        return {
          sub,
          html: `
            <form class="form-box" id="form-pengumuman" novalidate>
              <h3>${pengEditItem ? "Ubah Pengumuman" : "Tambah Pengumuman Baru"}</h3>
              <p class="form-desc">Pengumuman akan tersimpan di database awan dan langsung terlihat oleh seluruh pengunjung.</p>
              <div class="form-group">
                <label for="peng-judul">Judul Pengumuman</label>
                <input type="text" id="peng-judul" required maxlength="120" value="${curJudul}" placeholder="Contoh: Kuliah Pengganti Matematika 1">
              </div>
              <div class="form-group">
                <label for="peng-tanggal">Tanggal</label>
                <input type="date" id="peng-tanggal" required value="${curTgl}">
              </div>
              <div class="form-group">
                <label for="peng-isi">Isi Pengumuman</label>
                <textarea id="peng-isi" rows="6" maxlength="5000" required placeholder="Tulis rincian pengumuman di sini...">${curIsi}</textarea>
              </div>
              <p class="form-err" id="peng-err" role="alert"></p>
              <div class="form-actions">
                <button type="submit" class="btn-primary" id="peng-submit"><span>Simpan</span></button>
                <button type="button" class="btn-outline" id="peng-batal"><span>Batal</span></button>
              </div>
            </form>
          `,
          after(b) {
            const form = b.querySelector("#form-pengumuman");
            const errEl = b.querySelector("#peng-err");
            const btnBatal = b.querySelector("#peng-batal");
            const btnSub = b.querySelector("#peng-submit");

            btnBatal.addEventListener("click", () => {
              pengMode = "list";
              pengEditItem = null;
              if (rerender) rerender();
            });

            form.addEventListener("submit", async (e) => {
              e.preventDefault();
              const judul = b.querySelector("#peng-judul").value.trim();
              const tanggal = b.querySelector("#peng-tanggal").value.trim();
              const isi = b.querySelector("#peng-isi").value.trim();

              if (!judul || !tanggal || !isi) {
                errEl.textContent = "Semua kolom wajib diisi.";
                return;
              }

              btnSub.disabled = true;
              errEl.textContent = "Menyimpan ke awan\u2026";

              try {
                const targetId = pengEditItem ? pengEditItem.id : null;
                const saved = await cloud.simpanPengumuman(targetId, { judul, tanggal, isi });

                cloudPengumuman = cloudPengumuman || [];
                const idx = cloudPengumuman.findIndex((x) => String(x.id) === String(saved.id));
                if (idx >= 0) cloudPengumuman[idx] = saved;
                else cloudPengumuman.unshift(saved);

                pengMode = "list";
                pengEditItem = null;
                if (rerender) rerender();
              } catch (x) {
                errEl.textContent = x.message || "Gagal menyimpan pengumuman.";
                btnSub.disabled = false;
              }
            });

            setTimeout(() => b.querySelector("#peng-judul")?.focus(), 60);
          }
        };
      }

      // Mode Login: Masuk Pengurus
      if (pengMode === "login") {
        return {
          sub,
          html: `
            <form class="form-box" id="form-login-peng" novalidate>
              <h3>Masuk Pengurus</h3>
              <p class="form-desc">Masuk dengan akun penyunting yang terdaftar untuk mengelola pengumuman.</p>
              <div class="form-group">
                <label for="lp-email">Email</label>
                <input type="email" id="lp-email" required autocomplete="username" spellcheck="false" placeholder="email@contoh.com">
              </div>
              <div class="form-group">
                <label for="lp-sandi">Kata Sandi</label>
                <input type="password" id="lp-sandi" required autocomplete="current-password" placeholder="Kata sandi akun">
              </div>
              <p class="form-err" id="lp-err" role="alert"></p>
              <div class="form-actions">
                <button type="submit" class="btn-primary" id="lp-submit"><span>Masuk</span></button>
                <button type="button" class="btn-outline" id="lp-batal"><span>Batal</span></button>
              </div>
            </form>
          `,
          after(b) {
            const form = b.querySelector("#form-login-peng");
            const errEl = b.querySelector("#lp-err");
            const btnBatal = b.querySelector("#lp-batal");
            const btnSub = b.querySelector("#lp-submit");

            btnBatal.addEventListener("click", () => {
              pengMode = "list";
              if (rerender) rerender();
            });

            form.addEventListener("submit", async (e) => {
              e.preventDefault();
              const email = b.querySelector("#lp-email").value.trim();
              const sandi = b.querySelector("#lp-sandi").value;

              if (!email || !sandi) {
                errEl.textContent = "Isi email dan kata sandi.";
                return;
              }

              btnSub.disabled = true;
              errEl.textContent = "Memeriksa akun\u2026";

              try {
                await cloud.masuk(email, sandi);
                pengMode = "list";
                if (rerender) rerender();
              } catch (x) {
                errEl.textContent = x.message || "Gagal masuk. Periksa email dan sandi.";
                btnSub.disabled = false;
              }
            });

            setTimeout(() => b.querySelector("#lp-email")?.focus(), 60);
          }
        };
      }

      // Mode List: Daftar Pengumuman
      let barHtml = "";
      if (canCloud) {
        if (user) {
          barHtml = `
            <div class="mgmt-bar">
              <div class="mgmt-user">
                <span>Penyunting: <b>${esc(user)}</b></span>
                <button type="button" class="btn-link" id="btn-keluar-peng">Keluar</button>
              </div>
              <button type="button" class="btn-primary" id="btn-tambah-peng"><span>+ Tambah Pengumuman</span></button>
            </div>
          `;
        } else {
          barHtml = `
            <div class="mgmt-bar">
              <span class="mgmt-note">Papan Informasi</span>
              <button type="button" class="btn-outline" id="btn-masuk-peng"><span>Masuk Pengurus</span></button>
            </div>
          `;
        }
      }

      let contentHtml = "";
      if (!list.length) {
        contentHtml = kosong("Belum ada pengumuman", "Tekan tombol '+ Tambah Pengumuman' di atas untuk membuat pengumuman pertama.");
      } else {
        const rows = list.map((p, i) => {
          const isi = p.isi.length > 220
            ? `<p>${esc(p.isi.slice(0, 200))}\u2026</p><details class="more"><summary>Baca selengkapnya</summary><p>${esc(p.isi)}</p></details>`
            : `<p>${esc(p.isi)}</p>`;
          const actions = user ? `
            <div class="card-actions">
              <button type="button" class="btn-mini btn-edit-item" data-id="${esc(p.id)}">Ubah</button>
              <button type="button" class="btn-mini danger btn-del-item" data-id="${esc(p.id)}">Hapus</button>
            </div>
          ` : "";
          return `<li style="--i:${i}"><span class="time">${tanggal(p.tanggal)}</span><div><h3>${esc(p.judul)}</h3>${isi}${actions}</div></li>`;
        }).join("");
        contentHtml = `<ul class="list">${rows}</ul>`;
      }

      return {
        sub,
        html: barHtml + contentHtml,
        after(b) {
          b.querySelector("#btn-tambah-peng")?.addEventListener("click", () => {
            pengMode = "form";
            pengEditItem = null;
            if (rerender) rerender();
          });
          b.querySelector("#btn-masuk-peng")?.addEventListener("click", () => {
            pengMode = "login";
            if (rerender) rerender();
          });
          b.querySelector("#btn-keluar-peng")?.addEventListener("click", () => {
            cloud.keluar();
            if (rerender) rerender();
          });

          b.querySelectorAll(".btn-edit-item").forEach((btn) => {
            btn.addEventListener("click", () => {
              const id = btn.dataset.id;
              const found = list.find((x) => String(x.id) === String(id));
              if (found) {
                pengEditItem = found;
                pengMode = "form";
                if (rerender) rerender();
              }
            });
          });

          b.querySelectorAll(".btn-del-item").forEach((btn) => {
            btn.addEventListener("click", async () => {
              const id = btn.dataset.id;
              const found = list.find((x) => String(x.id) === String(id));
              if (!found) return;
              if (!confirm(`Hapus pengumuman "${found.judul}"?`)) return;

              btn.disabled = true;
              try {
                if (cloudPengumuman && cloudPengumuman.some((x) => String(x.id) === String(id))) {
                  await cloud.hapusPengumuman(id);
                  cloudPengumuman = cloudPengumuman.filter((x) => String(x.id) !== String(id));
                }
                pengDeletedIds.add(String(id));
                try { localStorage.setItem("peng-del", JSON.stringify([...pengDeletedIds])); } catch {}
                if (rerender) rerender();
              } catch (x) {
                alert(x.message || "Gagal menghapus pengumuman.");
                btn.disabled = false;
              }
            });
          });
        }
      };
    },

    tugas() {
      if (data.pengumuman.error) return gagal(data.pengumuman.error);
      const list = data.pengumuman.data.filter((p) => p.jenis === "tugas");
      if (!list.length) return { sub: "Tugas dan tenggat", html: kosong("Belum ada tugas", 'Tambahkan item berjenis <code>"tugas"</code> beserta mata kuliah dan tenggat di <code>data/pengumuman.json</code>.') };
      const sisaHari = (t) => Math.round((new Date(t + "T00:00:00") - hariMulai) / 86400000);
      // Yang masih berjalan di atas (tenggat terdekat dulu), yang sudah lewat di bawah
      const sorted = [...list].sort((a, b) => {
        const sa = sisaHari(a.tenggat), sb = sisaHari(b.tenggat);
        if ((sa < 0) !== (sb < 0)) return sa < 0 ? 1 : -1;
        return sa < 0 ? sb - sa : sa - sb;
      });
      const rows = sorted.map((p, i) => {
        const h = sisaHari(p.tenggat);
        const label = h < 0 ? `<span class="tag done">Selesai</span>` : h === 0 ? `<span class="tag now">Hari ini</span>` : `<span class="tag due">H-${h}</span>`;
        return `<li class="${h < 0 ? "past" : ""}" style="--i:${i}"><span class="time">${tanggal(p.tenggat)}</span><div><h3>${esc(p.judul)}</h3><p>${esc(p.matkul || "")}</p><p>${esc(p.isi)}</p>${label}</div></li>`;
      }).join("");
      return { sub: "Urut tenggat terdekat", html: `<ul class="list">${rows}</ul>` };
    }
  };
}

window.SDT = window.SDT || {};
Object.assign(window.SDT, { HARI, KULIAH, esc, gagal, makePanels });
})();
