const GOOGLE_SHEETS_API_URL = "https://script.google.com/macros/s/AKfycbyaZPJZI8OIQ3MVKW34qZEPlvr857rkfFf4QXeGSomb8Jvy6g1FwynvOM7nKG-14Js/exec";

let ipprData = [];
let notulensiData = [];
let pengaduanData = [];
let activeTab = "ippr";
let charts = {};

document.addEventListener("DOMContentLoaded", () => {
  let saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  applyTheme(saved || "light");
  syncFromGoogleSheets();
  setInterval(syncFromGoogleSheets, 30000);
});

document.addEventListener("click", () => closeAccountMenu());
document.addEventListener("keydown", e => {
  if (e.key === "Escape") { closeAccountMenu(); closeDetailModal(); }
});

async function syncFromGoogleSheets() {
  if (GOOGLE_SHEETS_API_URL.includes("TEMPEL_URL")) {
    loadMockData();
    return;
  }
  try {
    const res = await fetch(GOOGLE_SHEETS_API_URL);
    const json = await res.json();

    const rawIppr = json.ippr || [];
    const rawNotul = json.notulensi || [];
    const rawAduan = json.pengaduan || [];

    const parseRow = (row, mapping, index) => {
      const keys = Object.keys(row);
      const findVal = (possibleNames) => {
        for (let name of possibleNames) {
          const foundKey = keys.find(k => k.trim().toLowerCase() === name.toLowerCase());
          if (foundKey && row[foundKey] !== undefined && row[foundKey] !== "") {
            return row[foundKey];
          }
        }
        return "";
      };

      let result = { no: findVal(["no", "NO"]) || index + 1 };
      for (let targetKey in mapping) {
        result[targetKey] = findVal(mapping[targetKey]);
      }
      return result;
    };

    // 1. Mapping Progres IPPR (+ Auto-fill)
    let lastTgl = "-";
    let lastKet = "-";
    ipprData = rawIppr.map((row, index) => {
      let parsed = parseRow(row, {
        tglMasuk: ["tgl berkas masuk", "tanggal"],
        jenisBerkas: ["jenis berkas", "jenis"],
        keterangan: ["keterangan"],
        kecamatan: ["kecamatan"],
        kodeKasus: ["kode kasus"],
        statusBerkas: ["status berkas", "status"],
        catatan: ["catatan"],
        namaPemohon: ["nama pemohon / pt / cv / yayasan / dll", "nama pemohon / pt"],
        namaKegiatan: ["nama kegiatan"],
        kodeKbli: ["kode kbli oss rba", "kode kbli"],
        alamatLahan: ["alamat lahan"],
        luasLahan: ["luas lahan m2", "luas lahan"],
        titikKoordinat: ["titik koordinat"],
        noTelp: ["no telp pemohon", "no telp"],
        nop: ["nop"],
        pic: ["nama pic / ppk", "pic"],
        linkDrive: ["link drive"]
      }, index);

      if (parsed.tglMasuk) lastTgl = parsed.tglMasuk;
      else parsed.tglMasuk = lastTgl;

      if (parsed.keterangan) lastKet = parsed.keterangan;
      else parsed.keterangan = lastKet;

      return parsed;
    });

    // 2. Mapping Notulensi Rapat/Verlap
    let lastTglNotul = "-";
    notulensiData = rawNotul.map((row, index) => {
      let parsed = parseRow(row, {
        tanggal: ["tanggal rapat / verlap", "tanggal"],
        jenis: ["jenis"],
        judul: ["judul kegiatan rapat/verlap", "agenda"],
        tempat: ["tempat rapat/tampat verlap", "tempat"],
        peserta: ["peserta rapat/personil verlap", "peserta"],
        notulen: ["notulen"],
        operator: ["operator/dokumentasi/jaga absensi", "operator"],
        kesimpulan: ["kesimpulan/hasil akhir", "kesimpulan"],
        linkDrive: ["link drive"]
      }, index);

      if (parsed.tanggal) lastTglNotul = parsed.tanggal;
      else parsed.tanggal = lastTglNotul;

      return parsed;
    });

    // 3. Mapping Rekap Pengaduan
    pengaduanData = rawAduan.map((row, index) => {
      return parseRow(row, {
        berkasMasuk: ["berkas aduan masuk", "tgl masuk"],
        namaPengadu: ["nama pengadu", "pelapor"],
        kecamatan: ["kecamatan aduan", "kecamatan"],
        alamat: ["alamat lengkap aduan", "alamat"],
        perihal: ["perihal", "substansi"],
        penanganan: ["penanganan", "status"],
        linkDrive: ["link drive"]
      }, index);
    });

    refreshUI();
  } catch (err) {
    console.error("Gagal sinkronisasi, menggunakan data lokal:", err);
    loadMockData();
  }
}

function loadMockData() {
  ipprData = [{ no: 1, tglMasuk: "31 Okt 2025", jenisBerkas: "Arahan", kecamatan: "Rancabali", kodeKasus: "RCB-001", statusBerkas: "FGD", namaPemohon: "PT Contoh", linkDrive: "#" }];
  notulensiData = [{ no: 1, tanggal: "13 Jan 2026", jenis: "Rapat", judul: "Rapat Koordinasi", tempat: "DPUTR", linkDrive: "#" }];
  pengaduanData = [{ no: 1, berkasMasuk: "12 Jan 2026", namaPengadu: "Warga", kecamatan: "Cimenyan", perihal: "Aduan Ruang", linkDrive: "#" }];
  refreshUI();
}

function refreshUI() {
  updateTabCounters();
  populateDropdowns();
  renderIpprView();
  renderNotulView();
  renderAduanView();
}

function switchTab(tabKey) {
  if (tabKey === activeTab && document.getElementById(`view-${tabKey}`).classList.contains("active")) {
    if (window.innerWidth <= 768) document.querySelector(".app-layout").classList.remove("sidebar-mobile-open");
    return;
  }
  activeTab = tabKey;
  if (window.innerWidth <= 768) {
    document.querySelector(".app-layout").classList.remove("sidebar-mobile-open");
  }

  document.querySelectorAll(".sidebar-item").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tabKey);
  });
  document.querySelectorAll(".window-view").forEach(view => {
    view.classList.toggle("active", view.id === `view-${tabKey}`);
  });

  const titles = {
    ippr: ["Progres IPPR", "Monitoring Perizinan Pemanfaatan Ruang dan Dokumen Tata Ruang."],
    notulensi: ["Notulensi Rapat/Verlap", "Catatan agenda rapat koordinasi dan verifikasi lapangan."],
    pengaduan: ["Rekap Pengaduan", "Pemantauan penanganan pengaduan dan laporan masyarakat."]
  };
  document.getElementById("header-main-title").textContent = titles[tabKey][0];
  document.getElementById("header-subtitle").textContent = titles[tabKey][1];

  // Grafik di tab yang baru tampil perlu dihitung ulang ukurannya
  requestAnimationFrame(() => Object.values(charts).forEach(c => c.resize()));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function toggleSidebar() {
  const layout = document.querySelector(".app-layout");
  if (window.innerWidth <= 768) {
    layout.classList.toggle("sidebar-mobile-open");
  } else {
    layout.classList.toggle("sidebar-collapsed");
  }
}

function applyTheme(theme) {
  document.body.setAttribute("data-theme", theme);
  document.getElementById("theme-text").textContent = theme === "dark" ? "Mode Terang" : "Mode Gelap";
  try { localStorage.setItem("theme", theme); } catch (e) {}
  if (ipprData.length || notulensiData.length || pengaduanData.length) refreshUI();
}

function toggleDarkMode() {
  applyTheme(document.body.getAttribute("data-theme") === "dark" ? "light" : "dark");
}

function toggleAccountMenu(e) {
  e.stopPropagation();
  const acc = document.getElementById("account");
  const open = acc.classList.toggle("open");
  acc.querySelector(".account-btn").setAttribute("aria-expanded", open);
}

function closeAccountMenu() {
  const acc = document.getElementById("account");
  if (!acc) return;
  acc.classList.remove("open");
  acc.querySelector(".account-btn").setAttribute("aria-expanded", "false");
}

function updateTabCounters() {
  document.getElementById("count-tab-ippr").textContent = ipprData.length;
  document.getElementById("count-tab-notulensi").textContent = notulensiData.length;
  document.getElementById("count-tab-pengaduan").textContent = pengaduanData.length;
}

function populateDropdowns() {
  const ipprKec = document.getElementById("ippr-filter-kecamatan");
  const kecs = [...new Set(ipprData.map(d => d.kecamatan).filter(Boolean))];
  ipprKec.innerHTML = `<option value="ALL">Semua Kecamatan</option>` + kecs.map(k => `<option value="${k}">${k}</option>`).join("");

  const aduanKec = document.getElementById("aduan-filter-kecamatan");
  const adKecs = [...new Set(pengaduanData.map(d => d.kecamatan).filter(Boolean))];
  aduanKec.innerHTML = `<option value="ALL">Semua Kecamatan</option>` + adKecs.map(k => `<option value="${k}">${k}</option>`).join("");
}

// ================= RENDER TAB 1 =================
function renderIpprView() {
  const fJenis = document.getElementById("ippr-filter-jenis").value;
  const fStatus = document.getElementById("ippr-filter-status").value;
  const fKec = document.getElementById("ippr-filter-kecamatan").value;
  const q = document.getElementById("ippr-search").value.toLowerCase();

  const filtered = ipprData.filter(d => {
    return (fJenis === "ALL" || d.jenisBerkas === fJenis) &&
           (fStatus === "ALL" || d.statusBerkas === fStatus) &&
           (fKec === "ALL" || d.kecamatan === fKec) &&
           (!q || Object.values(d).some(v => String(v).toLowerCase().includes(q)));
  });

  setNum("ippr-total", filtered.length);
  setNum("ippr-fgd", filtered.filter(d => d.statusBerkas === "FGD").length);
  setNum("ippr-kajian", filtered.filter(d => d.statusBerkas?.includes("Kajian")).length);
  setNum("ippr-selesai", filtered.filter(d => d.statusBerkas === "Selesai").length);
  document.getElementById("ippr-table-info").textContent = `Menampilkan ${filtered.length} data`;

  // Render Mini Cards Jenis Berkas
  const uniqueJenis = [...new Set(filtered.map(d => d.jenisBerkas).filter(Boolean))];
  document.getElementById("ippr-jenis-cards").innerHTML = uniqueJenis.length === 0 ?
    `<p class="empty-note">Tidak ada data jenis berkas.</p>` :
    uniqueJenis.map(j => `
      <div class="mini-stat-card">
        <span class="mini-name">${esc(j)}</span>
        <div class="mini-count">${filtered.filter(d => d.jenisBerkas === j).length}</div>
        <span class="mini-sub">Jumlah berkas</span>
      </div>
    `).join("");

  document.getElementById("ippr-tbody").innerHTML = filtered.length === 0 ?
    `<tr><td colspan="11" style="text-align:center; padding:20px;">Tidak ada data</td></tr>` :
    filtered.map(r => `
      <tr>
        <td>${esc(r.no)}</td>
        <td>${esc(r.tglMasuk) || "-"}</td>
        <td><span class="code-badge">${esc(r.jenisBerkas) || "-"}</span></td>
        <td>${esc(r.keterangan) || "-"}</td>
        <td><span class="code-badge">${esc(r.kodeKasus) || "-"}</span></td>
        <td><span class="pill ${statusClass(r.statusBerkas)}">${esc(r.statusBerkas) || "-"}</span></td>
        <td>${esc(r.namaKegiatan) || "-"}</td>
        <td>${esc(r.kodeKbli) || "-"}</td>
        <td>${esc(r.luasLahan) || "-"}</td>
        <td>${esc(r.pic) || "-"}</td>
        <td><button class="btn-detail" onclick="showDetail('ippr', '${esc(r.no)}')">Lihat detail</button></td>
      </tr>
    `).join("");

  const kecLabels = [...new Set(filtered.map(d => d.kecamatan).filter(Boolean))];
  renderChart("ipprChart", "bar", kecLabels, kecLabels.map(k => filtered.filter(d => d.kecamatan === k).length), "#3b49df");
}

function resetIpprFilters() {
  document.getElementById("ippr-filter-jenis").value = "ALL";
  document.getElementById("ippr-filter-status").value = "ALL";
  document.getElementById("ippr-filter-kecamatan").value = "ALL";
  document.getElementById("ippr-search").value = "";
  renderIpprView();
}

// ================= RENDER TAB 2 =================
function renderNotulView() {
  const fJenis = document.getElementById("notul-filter-jenis").value;
  const q = document.getElementById("notul-search").value.toLowerCase();

  const filtered = notulensiData.filter(d => {
    return (fJenis === "ALL" || d.jenis === fJenis) &&
           (!q || Object.values(d).some(v => String(v).toLowerCase().includes(q)));
  });

  setNum("notul-total", filtered.length);
  setNum("notul-rapat", filtered.filter(d => d.jenis === "Rapat").length);
  setNum("notul-verlap", filtered.filter(d => d.jenis === "Verlap").length);
  setNum("notul-selesai", filtered.length);
  document.getElementById("notul-table-info").textContent = `Menampilkan ${filtered.length} kegiatan`;

  document.getElementById("notul-highlights").innerHTML = filtered.slice(0, 3).map(r => `
    <div style="padding: 10px; background:var(--hover-color); border-radius:8px; margin-bottom:8px;">
      <div style="font-size:0.75rem; color:var(--text-muted);">${r.tanggal} • ${r.tempat}</div>
      <div style="font-size:0.85rem; font-weight:600; margin-top:2px;">${r.judul}</div>
    </div>
  `).join("") || `<p style="font-size:0.85rem; color:var(--text-muted);">Tidak ada agenda.</p>`;

  document.getElementById("notul-tbody").innerHTML = filtered.length === 0 ?
    `<tr><td colspan="11" style="text-align:center; padding:20px;">Tidak ada data</td></tr>` :
    filtered.map(r => `
      <tr>
        <td>${r.no}</td>
        <td>${r.tanggal || "-"}</td>
        <td><span class="code-badge">${r.jenis || "-"}</span></td>
        <td><strong>${r.judul || "-"}</strong></td>
        <td>${r.tempat || "-"}</td>
        <td>${r.peserta || "-"}</td>
        <td>${r.notulen || "-"}</td>
        <td>${r.operator || "-"}</td>
        <td>${r.kesimpulan || "-"}</td>
        <td>${r.linkDrive ? `<a href="${r.linkDrive}" target="_blank" class="link-pill">Buka Drive</a>` : "-"}</td>
        <td><button class="btn-detail" onclick="showDetail('notulensi', ${r.no})">Detail</button></td>
      </tr>
    `).join("");

  renderChart("notulChart", "doughnut", ["Rapat", "Verlap"], [
    filtered.filter(d => d.jenis === "Rapat").length,
    filtered.filter(d => d.jenis === "Verlap").length
  ], ["#3b49df", "#10b981"]);
}

function resetNotulFilters() {
  document.getElementById("notul-filter-jenis").value = "ALL";
  document.getElementById("notul-search").value = "";
  renderNotulView();
}

// ================= RENDER TAB 3 =================
function renderAduanView() {
  const fKec = document.getElementById("aduan-filter-kecamatan").value;
  const q = document.getElementById("aduan-search").value.toLowerCase();

  const filtered = pengaduanData.filter(d => {
    return (fKec === "ALL" || d.kecamatan === fKec) &&
           (!q || Object.values(d).some(v => String(v).toLowerCase().includes(q)));
  });

  setNum("aduan-total", filtered.length);
  setNum("aduan-proses", filtered.length);
  setNum("aduan-selesai", 0);
  document.getElementById("aduan-table-info").textContent = `Menampilkan ${filtered.length} pengaduan`;

  document.getElementById("aduan-tbody").innerHTML = filtered.length === 0 ?
    `<tr><td colspan="9" style="text-align:center; padding:20px;">Tidak ada data</td></tr>` :
    filtered.map(r => `
      <tr>
        <td>${r.no}</td>
        <td>${r.berkasMasuk || "-"}</td>
        <td><strong>${r.namaPengadu || "-"}</strong></td>
        <td>${r.kecamatan || "-"}</td>
        <td>${r.alamat || "-"}</td>
        <td>${r.perihal || "-"}</td>
        <td>${r.penanganan || "-"}</td>
        <td>${r.linkDrive ? `<a href="${r.linkDrive}" target="_blank" class="link-pill">Buka Drive</a>` : "-"}</td>
        <td><button class="btn-detail" onclick="showDetail('pengaduan', ${r.no})">Detail</button></td>
      </tr>
    `).join("");

  const kecs = [...new Set(filtered.map(d => d.kecamatan).filter(Boolean))];
  renderChart("aduanChart", "bar", kecs, kecs.map(k => filtered.filter(d => d.kecamatan === k).length), "#059669");
}

function resetAduanFilters() {
  document.getElementById("aduan-filter-kecamatan").value = "ALL";
  document.getElementById("aduan-search").value = "";
  renderAduanView();
}

// ================= UTILITIES & CHARTS =================
function cssVar(name) {
  return getComputedStyle(document.body).getPropertyValue(name).trim();
}

function setNum(id, to) {
  const el = document.getElementById(id);
  if (!el) return;
  const from = parseInt(el.textContent, 10) || 0;
  cancelAnimationFrame(el._raf);
  if (from === to || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.textContent = to;
    return;
  }
  const t0 = performance.now();
  const step = t => {
    const p = Math.min((t - t0) / 450, 1);
    el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
    if (p < 1) el._raf = requestAnimationFrame(step);
  };
  el._raf = requestAnimationFrame(step);
}

function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function statusClass(s) {
  s = String(s || "").toLowerCase();
  if (s.includes("fgd")) return "pill-fgd";
  if (s.includes("kajian")) return "pill-kajian";
  if (s.includes("selesai")) return "pill-selesai";
  return "";
}

function renderChart(canvasId, type, labels, data) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  if (charts[canvasId]) charts[canvasId].destroy();
  const isDonut = type === "doughnut";
  const muted = cssVar("--muted");
  const grid = cssVar("--line");
  charts[canvasId] = new Chart(ctx, {
    type,
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: isDonut ? [cssVar("--brand"), cssVar("--brand-2")] : cssVar("--brand"),
        borderColor: isDonut ? cssVar("--surface") : undefined,
        borderWidth: isDonut ? 3 : 0,
        borderRadius: isDonut ? 0 : 6,
        maxBarThickness: 44
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: isDonut ? "68%" : undefined,
      animation: { duration: 700, easing: "easeOutQuart" },
      plugins: { legend: { display: isDonut, position: "bottom", labels: { color: muted, usePointStyle: true } } },
      scales: isDonut ? {} : {
        x: { ticks: { color: muted }, grid: { display: false }, border: { display: false } },
        y: { beginAtZero: true, ticks: { color: muted, precision: 0 }, grid: { color: grid }, border: { display: false } }
      }
    }
  });
}

const DETAIL_LABELS = {
  no: "No", tglMasuk: "Tanggal masuk", jenisBerkas: "Jenis berkas", keterangan: "Keterangan", kecamatan: "Kecamatan",
  kodeKasus: "Kode kasus", statusBerkas: "Status", catatan: "Catatan", namaPemohon: "Nama pemohon",
  namaKegiatan: "Kegiatan", kodeKbli: "KBLI", alamatLahan: "Alamat lahan", luasLahan: "Luas lahan (m²)",
  titikKoordinat: "Koordinat", noTelp: "No. telepon", nop: "NOP", pic: "PIC", linkDrive: "Drive",
  tanggal: "Tanggal", jenis: "Jenis", judul: "Judul kegiatan", tempat: "Tempat", peserta: "Peserta",
  notulen: "Notulen", operator: "Operator", kesimpulan: "Kesimpulan", berkasMasuk: "Tanggal masuk",
  namaPengadu: "Nama pengadu", alamat: "Alamat", perihal: "Perihal", penanganan: "Penanganan"
};

function showDetail(type, no) {
  const source = { ippr: ipprData, notulensi: notulensiData, pengaduan: pengaduanData }[type] || [];
  const item = source.find(d => String(d.no) === String(no));
  if (!item) return;

  const titles = { ippr: "berkas IPPR", notulensi: "rapat / verlap", pengaduan: "pengaduan" };
  document.getElementById("modal-title").textContent = `Detail ${titles[type]}`;
  document.getElementById("modal-body").innerHTML = Object.entries(item).map(([k, v]) => {
    const isLink = k === "linkDrive" && /^https?:\/\//i.test(v);
    const value = isLink ? `<a href="${esc(v)}" target="_blank" rel="noopener" class="link-pill">Buka Drive</a>` : (esc(v) || "-");
    return `
      <div class="detail-row">
        <span class="detail-label">${DETAIL_LABELS[k] || esc(k)}</span>
        <span>${value}</span>
      </div>`;
  }).join("");
  document.getElementById("detailModal").classList.add("open");
}

function closeDetailModal() {
  document.getElementById("detailModal").classList.remove("open");
}

function closeModalOnBackdrop(e) {
  if (e.target.id === "detailModal") closeDetailModal();
}