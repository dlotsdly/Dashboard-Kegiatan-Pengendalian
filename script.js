:root {
  --bg: #f2f6f6;
  --surface: #ffffff;
  --ink: #14262e;
  --muted: #62767e;
  --brand: #0f766e;
  --brand-2: #e0a030;
  --on-brand: #ffffff;
  --brand-soft: #e0f1ee;
  --line: #e1e8e9;
  --hover: #edf3f3;
  --pill-fgd: #b45309;
  --pill-kajian: #1d4ed8;
  --pill-selesai: #047857;
  --shadow: 0 1px 2px rgba(20, 38, 46, .05), 0 8px 24px rgba(20, 38, 46, .05);
  --ease: cubic-bezier(.22, .8, .26, 1);
  --top-h: 64px;
  --side-w: 252px;
}

[data-theme="dark"] {
  --bg: #0c181d;
  --surface: #13252b;
  --ink: #e6f0f1;
  --muted: #8ea5ac;
  --brand: #2dd4bf;
  --brand-2: #fbbf24;
  --on-brand: #06201d;
  --brand-soft: rgba(45, 212, 191, .12);
  --line: #223a41;
  --hover: #1a323a;
  --pill-fgd: #fbbf24;
  --pill-kajian: #93c5fd;
  --pill-selesai: #6ee7b7;
  --shadow: 0 8px 24px rgba(0, 0, 0, .25);
  color-scheme: dark;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
button, input, select { font: inherit; color: inherit; }
button { cursor: pointer; }
select option { background: var(--surface); color: var(--ink); }
::placeholder { color: var(--muted); opacity: .8; }
:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }

body {
  font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  background: var(--bg);
  color: var(--ink);
  transition: background .35s var(--ease), color .35s var(--ease);
}

/* ===== TOPBAR (selalu terlihat, tombol menu tidak hilang) ===== */
.topbar {
  position: fixed; inset: 0 0 auto 0; height: var(--top-h);
  background: var(--surface); border-bottom: 1px solid var(--line);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 20px; z-index: 1100;
  transition: background .35s var(--ease), border-color .35s var(--ease);
}
.topbar-left { display: flex; align-items: center; gap: 14px; }

.nav-toggle {
  width: 40px; height: 40px; border-radius: 10px;
  background: var(--hover); border: 1px solid var(--line);
  display: grid; place-content: center; gap: 4px;
  transition: background .2s, transform .2s var(--ease);
}
.nav-toggle:hover { background: var(--brand-soft); }
.nav-toggle:active { transform: scale(.92); }
.nav-toggle span { display: block; width: 18px; height: 2px; border-radius: 2px; background: var(--ink); }

.brand { display: flex; align-items: center; gap: 10px; }
.app-logo { font-size: 1.25rem; width: 38px; height: 38px; display: grid; place-items: center; background: var(--brand-soft); border-radius: 10px; }
.brand-text { display: flex; flex-direction: column; line-height: 1.2; }
.brand-text strong { font-size: .95rem; }
.brand-text small { font-size: .74rem; color: var(--muted); }

/* ===== AKUN ===== */
.account { position: relative; }
.account-btn {
  display: flex; align-items: center; gap: 10px; padding: 5px 10px 5px 5px;
  background: transparent; border: 1px solid var(--line); border-radius: 999px;
  transition: background .2s;
}
.account-btn:hover, .account.open .account-btn { background: var(--hover); }
.avatar {
  width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center;
  background: var(--brand); color: var(--on-brand); font-weight: 700; font-size: .85rem; flex-shrink: 0;
}
.avatar.lg { width: 40px; height: 40px; }
.account-info { display: flex; flex-direction: column; text-align: left; line-height: 1.2; }
.account-info strong { font-size: .8rem; }
.account-info small { font-size: .7rem; color: var(--muted); }
.chev { font-size: .7rem; color: var(--muted); transition: transform .3s var(--ease); }
.account.open .chev { transform: rotate(180deg); }

.account-menu {
  position: absolute; top: calc(100% + 10px); right: 0; width: 230px;
  background: var(--surface); border: 1px solid var(--line); border-radius: 14px;
  box-shadow: var(--shadow); padding: 8px;
  opacity: 0; visibility: hidden; transform: translateY(-8px) scale(.97); transform-origin: top right;
  transition: opacity .2s var(--ease), transform .25s var(--ease), visibility .25s;
}
.account.open .account-menu { opacity: 1; visibility: visible; transform: none; }
.account-menu-head { display: flex; align-items: center; gap: 10px; padding: 8px 8px 12px; margin-bottom: 6px; border-bottom: 1px solid var(--line); }
.account-menu-head div { display: flex; flex-direction: column; line-height: 1.25; }
.account-menu-head small { font-size: .74rem; color: var(--muted); }
.account-menu button {
  display: block; width: 100%; text-align: left; padding: 9px 10px; border: 0; border-radius: 8px;
  background: transparent; font-size: .85rem; transition: background .15s;
}
.account-menu button:hover { background: var(--hover); }
.account-menu .danger { color: #dc2626; }
[data-theme="dark"] .account-menu .danger { color: #f87171; }

/* ===== SIDEBAR ===== */
.app-layout { min-height: 100vh; }

.sidebar {
  position: fixed; top: var(--top-h); left: 0; bottom: 0; width: var(--side-w);
  background: var(--surface); border-right: 1px solid var(--line);
  display: flex; flex-direction: column; z-index: 1000;
  transition: transform .4s var(--ease), background .35s, border-color .35s;
}
.sidebar-menu-label { padding: 22px 22px 8px; font-size: .74rem; font-weight: 600; color: var(--muted); }
.sidebar-menu { display: flex; flex-direction: column; gap: 4px; padding: 0 12px; }

.sidebar-item {
  display: flex; align-items: center; gap: 12px; width: 100%; padding: 11px 14px;
  background: transparent; border: 0; border-radius: 10px; text-align: left;
  font-size: .88rem; font-weight: 500; color: var(--ink);
  transition: background .25s var(--ease), color .25s var(--ease), transform .2s var(--ease);
}
.sidebar-item:hover { background: var(--hover); transform: translateX(3px); }
.sidebar-item.active { background: var(--brand); color: var(--on-brand); transform: none; }
.badge { margin-left: auto; font-size: .74rem; padding: 2px 9px; border-radius: 999px; background: var(--hover); color: var(--muted); transition: background .25s, color .25s; }
.sidebar-item.active .badge { background: rgba(255, 255, 255, .22); color: inherit; }

.sidebar-footer { margin-top: auto; padding: 16px; border-top: 1px solid var(--line); }
.theme-toggle-btn {
  width: 100%; padding: 10px; background: var(--hover); border: 1px solid var(--line); border-radius: 10px;
  font-size: .85rem; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: background .2s;
}
.theme-toggle-btn:hover { background: var(--brand-soft); }

/* ===== KONTEN ===== */
.main-content { margin-left: var(--side-w); padding-top: var(--top-h); min-width: 0; transition: margin-left .4s var(--ease); }
.app-layout.sidebar-collapsed .sidebar { transform: translateX(-100%); }
.app-layout.sidebar-collapsed .main-content { margin-left: 0; }

.page-head { padding: 26px 28px 0; }
.page-head h1 { font-size: 1.35rem; font-weight: 800; letter-spacing: -.01em; }
.page-head p { font-size: .86rem; color: var(--muted); margin-top: 4px; }

.content-body { padding: 20px 28px 32px; }

.window-view { display: none; flex-direction: column; gap: 20px; }
.window-view.active { display: flex; animation: viewIn .45s var(--ease) both; }
.window-view.active > .stats-grid > .stat-card { animation: viewIn .5s var(--ease) both; }
.window-view.active > .stats-grid > .stat-card:nth-child(2) { animation-delay: .05s; }
.window-view.active > .stats-grid > .stat-card:nth-child(3) { animation-delay: .1s; }
.window-view.active > .stats-grid > .stat-card:nth-child(4) { animation-delay: .15s; }

@keyframes viewIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }

/* ===== KARTU & BOX ===== */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px; }
.stat-card, .section-box {
  background: var(--surface); border: 1px solid var(--line); border-radius: 14px; box-shadow: var(--shadow);
  transition: background .35s, border-color .35s;
}
.stat-card { padding: 18px 20px; display: grid; grid-template-columns: auto minmax(0, 1fr); column-gap: 16px; align-items: center; }
.stat-icon {
  grid-row: span 3; width: 48px; height: 48px; border-radius: 13px; display: grid; place-items: center;
  color: var(--tone); background: color-mix(in srgb, var(--tone) 14%, transparent);
}
.stat-icon svg { width: 24px; height: 24px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.i-brand { --tone: var(--brand); }
.i-fgd { --tone: var(--pill-fgd); }
.i-kajian { --tone: var(--pill-kajian); }
.i-selesai { --tone: var(--pill-selesai); }
.stat-label { font-size: .78rem; font-weight: 600; color: var(--muted); }
.stat-value { font-size: 1.9rem; font-weight: 800; margin: 6px 0 2px; color: var(--brand); font-variant-numeric: tabular-nums; }
.stat-desc { font-size: .78rem; color: var(--muted); }

.section-box { padding: 20px; }
.section-box h3 { font-size: .95rem; font-weight: 700; margin-bottom: 14px; }

.split-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr); gap: 20px; }
.mini-cards-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; }
.mini-stat-card { background: var(--hover); border-radius: 10px; padding: 12px 14px; }
.mini-name { font-size: .78rem; font-weight: 700; color: var(--brand); }
.mini-count { font-size: 1.5rem; font-weight: 800; margin: 2px 0; font-variant-numeric: tabular-nums; }
.mini-sub, .empty-note { font-size: .74rem; color: var(--muted); }

/* ===== FILTER & TABEL ===== */
.filter-toolbar { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }
.filter-toolbar select, .filter-toolbar input {
  padding: 9px 12px; border: 1px solid var(--line); background: var(--surface); border-radius: 10px;
  font-size: .85rem; outline: none; transition: border-color .2s, box-shadow .2s;
}
.filter-toolbar select:focus, .filter-toolbar input:focus { border-color: var(--brand); box-shadow: 0 0 0 3px var(--brand-soft); }
.filter-toolbar input { flex: 1; min-width: 180px; }
.btn-reset { padding: 9px 16px; background: var(--hover); border: 1px solid var(--line); border-radius: 10px; font-size: .85rem; font-weight: 500; transition: background .2s; }
.btn-reset:hover { background: var(--brand-soft); }

.table-container { width: 100%; overflow-x: auto; border: 1px solid var(--line); border-radius: 10px; }
table { width: 100%; border-collapse: collapse; text-align: left; font-size: .82rem; }
th { white-space: nowrap; background: var(--hover); color: var(--muted); font-weight: 600; padding: 12px 14px; border-bottom: 1px solid var(--line); }
td { padding: 12px 14px; border-bottom: 1px solid var(--line); min-width: 120px; max-width: 300px; vertical-align: top; line-height: 1.5; white-space: normal; overflow-wrap: anywhere; }
tr:last-child td { border-bottom: 0; }
tbody tr { transition: background .15s; }
tbody tr:hover { background: var(--hover); }
td:first-child { min-width: 0; width: 1%; }
td:last-child { min-width: 0; white-space: nowrap; }
.table-footer { margin-top: 12px; font-size: .8rem; color: var(--muted); }

.code-badge, .pill, .btn-detail { white-space: nowrap; }
.code-badge { background: var(--hover); padding: 3px 8px; border-radius: 6px; font-weight: 600; font-size: .78rem; }
.pill { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: .76rem; font-weight: 600; color: var(--muted); background: var(--hover); }
.pill-fgd { color: var(--pill-fgd); background: color-mix(in srgb, var(--pill-fgd) 14%, transparent); }
.pill-kajian { color: var(--pill-kajian); background: color-mix(in srgb, var(--pill-kajian) 14%, transparent); }
.pill-selesai { color: var(--pill-selesai); background: color-mix(in srgb, var(--pill-selesai) 14%, transparent); }

.link-pill { color: var(--brand); text-decoration: none; font-weight: 600; }
.link-pill:hover { text-decoration: underline; }
.btn-detail { padding: 5px 12px; background: var(--brand); color: var(--on-brand); border: 0; border-radius: 8px; font-size: .76rem; font-weight: 600; transition: transform .15s var(--ease), opacity .2s; }
.btn-detail:hover { opacity: .88; }
.btn-detail:active { transform: scale(.94); }

.chart-container { position: relative; height: 260px; width: 100%; }

/* ===== MODAL ===== */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(8, 20, 24, .55); backdrop-filter: blur(3px);
  display: flex; align-items: center; justify-content: center; z-index: 2000;
  opacity: 0; visibility: hidden; transition: opacity .25s var(--ease), visibility .25s;
}
.modal-backdrop.open { opacity: 1; visibility: visible; }
.modal-box {
  background: var(--surface); width: 92%; max-width: 640px; max-height: 85vh; border-radius: 16px;
  border: 1px solid var(--line); display: flex; flex-direction: column; overflow: hidden; box-shadow: var(--shadow);
  transform: translateY(16px) scale(.96); transition: transform .35s var(--ease);
}
.modal-backdrop.open .modal-box { transform: none; }
.modal-header { padding: 16px 20px; border-bottom: 1px solid var(--line); display: flex; align-items: center; justify-content: space-between; }
.modal-header h3 { font-size: 1rem; font-weight: 700; }
.modal-close { background: none; border: 0; font-size: 1.5rem; line-height: 1; color: var(--muted); border-radius: 8px; width: 32px; height: 32px; transition: background .2s; }
.modal-close:hover { background: var(--hover); }
.modal-body { padding: 20px; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px 20px; }
.detail-row { display: flex; flex-direction: column; gap: 3px; word-break: break-word; font-size: .88rem; }
.detail-label { font-size: .76rem; font-weight: 600; color: var(--muted); }

/* ===== MOBILE ===== */
.sidebar-backdrop { display: none; }

@media (max-width: 900px) {
  .split-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .topbar { padding: 0 12px; }
  .account-info, .chev { display: none; }
  .account-btn { padding: 3px; }
  .sidebar { transform: translateX(-100%); box-shadow: none; }
  .app-layout.sidebar-mobile-open .sidebar { transform: none; box-shadow: var(--shadow); }
  .sidebar-backdrop {
    display: block; position: fixed; inset: var(--top-h) 0 0 0; background: rgba(8, 20, 24, .45);
    z-index: 999; opacity: 0; visibility: hidden; transition: opacity .3s var(--ease), visibility .3s;
  }
  .app-layout.sidebar-mobile-open .sidebar-backdrop { opacity: 1; visibility: visible; }
  .main-content { margin-left: 0 !important; }
  .page-head { padding: 20px 16px 0; }
  .content-body { padding: 16px 16px 28px; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
}
