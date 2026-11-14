const GOOGLE_SHEETS_API_URL = "https://script.google.com/macros/s/AKfycbyaZPJZI8OIQ3MVKW34qZEPlvr857rkfFf4QXeGSomb8Jvy6g1FwynvOM7nKG-14Js/exec";

let ipprData = [];
let notulensiData = [];
let pengaduanData = [];
let activeTab = "ippr";
let charts = {};

document.addEventListener("DOMContentLoaded", () => {
  syncFromGoogleSheets();
  setInterval(syncFromGoogleSheets, 30000);
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

    // Helper untuk mencari key kolom secara fleksibel (tidak peduli huruf besar/kecil)
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

    // 1. Mapping Progres IPPR (+ Auto-fill untuk sel yang di-merge)
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
  ipprData = [{ no: 1, tglMasuk: "31 Okt 2025", jenisBerkas: "Arahan", kecamatan: "Rancabali", kodeKasus: "RCB-001", namaPemohon: "PT Contoh", linkDrive: "#" }];
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
  activeTab = tabKey;
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
}

function toggleSidebar() {
  document.querySelector(".app-layout").classList.toggle("sidebar-collapsed");
}

function toggleDarkMode() {
  const body = document.body;
  const isDark = body.getAttribute("data-theme") === "dark";
  body.setAttribute("data-theme", isDark ? "light" : "dark");
  document.getElementById("theme-text").textContent = isDark ? "Mode Gelap" : "Mode Terang";
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

  document.getElementById("ippr-total").textContent = filtered.length;
  document.getElementById("ippr-fgd").textContent = filtered.filter(d => d.statusBerkas === "FGD").length;
  document.getElementById("ippr-kajian").textContent = filtered.filter(d => d.statusBerkas?.includes("Kajian")).length;
  document.getElementById("ippr-selesai").textContent = filtered.filter(d => d.statusBerkas === "Selesai").length;
  document.getElementById("ippr-table-info").textContent = `Menampilkan ${filtered.length} data`;

  // === TAMBAHAN KODE INI AGAR KARTU RINGKASAN MUNCUL ===
  const uniqueJenis = [...new Set(filtered.map(d => d.jenisBerkas).filter(Boolean))];
  const jenisCardsHtml = uniqueJenis.length === 0 ? 
    `<p style="font-size:0.85rem; color:var(--text-muted);">Tidak ada data jenis berkas.</p>` :
    uniqueJenis.map(j => {
      const count = filtered.filter(d => d.jenisBerkas === j).length;
      return `
        <div class="mini-stat-card">
          <span style="font-size:0.75rem; font-weight:700; color:var(--primary-blue);">${j}</span>
          <div class="mini-count">${count}</div>
          <span style="font-size:0.72rem; color:var(--text-muted);">Jumlah Berkas</span>
        </div>
      `;
    }).join("");
  document.getElementById("ippr-jenis-cards").innerHTML = jenisCardsHtml;
  // ===================================================

  document.getElementById("ippr-tbody").innerHTML = filtered.length === 0 ? 
    `<tr><td colspan="19" style="text-align:center; padding:20px;">Tidak ada data</td></tr>` :
    filtered.map(r => `
      <tr>
        <td>${r.no}</td>
        <td>${r.tglMasuk || "-"}</td>
        <td><span class="code-badge">${r.jenisBerkas || "-"}</span></td>
        <td>${r.keterangan || "-"}</td>
        <td><strong>${r.kecamatan || "-"}</strong></td>
        <td><span class="code-badge">${r.kodeKasus || "-"}</span></td>
        <td>${r.statusBerkas || "-"}</td>
        <td>${r.catatan || "-"}</td>
        <td>${r.namaPemohon || "-"}</td>
        <td>${r.namaKegiatan || "-"}</td>
        <td>${r.kodeKbli || "-"}</td>
        <td>${r.alamatLahan || "-"}</td>
        <td>${r.luasLahan || "-"}</td>
        <td>${r.titikKoordinat || "-"}</td>
        <td>${r.noTelp || "-"}</td>
        <td>${r.nop || "-"}</td>
        <td>${r.pic || "-"}</td>
        <td>${r.linkDrive ? `<a href="${r.linkDrive}" target="_blank" class="link-pill">Buka Drive</a>` : "-"}</td>
        <td><button class="btn-detail" onclick="showDetail('ippr', ${r.no})">Detail</button></td>
      </tr>
    `).join("");

  const kecLabels = [...new Set(filtered.map(d => d.kecamatan))];
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

  document.getElementById("notul-total").textContent = filtered.length;
  document.getElementById("notul-rapat").textContent = filtered.filter(d => d.jenis === "Rapat").length;
  document.getElementById("notul-verlap").textContent = filtered.filter(d => d.jenis === "Verlap").length;
  document.getElementById("notul-selesai").textContent = filtered.length;
  document.getElementById("notul-table-info").textContent = `Menampilkan ${filtered.length} kegiatan`;

  document.getElementById("notul-highlights").innerHTML = filtered.slice(0, 3).map(r => `
    <div class="timeline-item">
      <div class="timeline-meta">${r.tanggal} • ${r.tempat}</div>
      <div class="timeline-title">${r.judul}</div>
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

  document.getElementById("aduan-total").textContent = filtered.length;
  document.getElementById("aduan-proses").textContent = filtered.length;
  document.getElementById("aduan-selesai").textContent = 0;
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

  const kecs = [...new Set(filtered.map(d => d.kecamatan))];
  renderChart("aduanChart", "bar", kecs, kecs.map(k => filtered.filter(d => d.kecamatan === k).length), "#059669");
}

function resetAduanFilters() {
  document.getElementById("aduan-filter-kecamatan").value = "ALL";
  document.getElementById("aduan-search").value = "";
  renderAduanView();
}

// ================= UTILITIES & CHARTS =================
function renderChart(canvasId, type, labels, data, colors) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  if (charts[canvasId]) charts[canvasId].destroy();
  charts[canvasId] = new Chart(ctx, {
    type: type,
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: type === "doughnut", position: "bottom" } }
    }
  });
}

function showDetail(type, no) {
  let item = null;
  if (type === 'ippr') item = ipprData.find(d => d.no === no);
  if (type === 'notulensi') item = notulensiData.find(d => d.no === no);
  if (type === 'pengaduan') item = pengaduanData.find(d => d.no === no);
  if (!item) return;

  document.getElementById("modal-title").textContent = `Detail Informasi (${type.toUpperCase()})`;
  document.getElementById("modal-body").innerHTML = Object.entries(item).map(([k, v]) => `
    <div class="detail-row">
      <span class="detail-label">${k}</span>
      <span>${v || "-"}</span>
    </div>
  `).join("");
  document.getElementById("detailModal").classList.add("open");
}

function closeDetailModal() {
  document.getElementById("detailModal").classList.remove("open");
}

function closeModalOnBackdrop(e) {
  if (e.target.id === "detailModal") closeDetailModal();
}