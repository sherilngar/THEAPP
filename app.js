/* RBAB Guide — standalone mobile app
   Reuses the same room data (data.js) and pricing logic as the main site,
   with navigation and rendering built fresh for a mobile-first, bottom-nav
   app layout instead of the desktop site's sidebar/modal layout. */

const TYPE_COLOR = {
  KGA: "var(--c-kga)", KGAOV: "var(--c-kgaov)", KGE: "var(--c-kge)", KGEOV: "var(--c-kgeov)",
  TWA: "var(--c-twa)", TWAOV: "var(--c-twaov)", SKA: "var(--c-ska)", SKB: "var(--c-skb)",
  SKC: "var(--c-skc)", SKD: "var(--c-skd)", SKP: "var(--c-skp)", SXA: "var(--c-sxa)", PI: "var(--c-pi)",
};

const TYPE_DESC = {
  KGA: "Deluxe King Garden", KGAOV: "Deluxe King View", KGE: "Premium King Garden", KGEOV: "Premium King View",
  PI: "Posting Interface", SKA: "Kids Escape Suite", SKB: "Family Room Garden", SKC: "Family Room View",
  SKD: "Junior Suite", SKP: "Senior Suite", SXA: "King Suite", TWA: "Deluxe Twin Garden", TWAOV: "Deluxe Twin View",
};

const GLOSSARY = {
  BAL: { label: "Balcony", conf: "high" }, NBA: { label: "No Balcony", conf: "high" }, S: { label: "Small Balcony", conf: "high" },
  KGB: { label: "King Bed", conf: "high" }, TWB: { label: "Twin Bed", conf: "high" }, BBE: { label: "Bunk Bed", conf: "high" },
  SOF: { label: "Sofa Cum Bed", conf: "high" }, "1EXBED": { label: "1 Extra Bed Space in Room", conf: "high" },
  "2EXBED": { label: "2 Extra Bed Space in Room", conf: "high" }, GAR: { label: "Garden View", conf: "high" },
  GRD: { label: "Ground Floor", conf: "high" }, POO: { label: "Pool View", conf: "high" }, BEA: { label: "Beach View", conf: "high" },
  ROA: { label: "Road View", conf: "high" }, CAV: { label: "Car Park View", conf: "high" }, MAN: { label: "Main Entrance View", conf: "high" },
  COS: { label: "Corniche Sea View", conf: "high" }, TER: { label: "Terrace", conf: "high" }, NSM: { label: "Non-Smoking", conf: "high" },
  HCA: { label: "Disabled Room (Handicap Accessible)", conf: "high" }, INT: { label: "Interconnecting Room", conf: "high" },
  KTC: { label: "Kitchenette", conf: "high" }, COR: { label: "Corner Room", conf: "high" }, SA: { label: "Small Room, No Extra Bed Space", conf: "high" },
  ZMR: { label: "Zumroud (building reference)", conf: "high" }, AMJ: { label: "Amwaj (building reference)", conf: "high" },
  MRM: { label: "Marmar (building reference)", conf: "high" },
  "1ST": { label: "First Floor", conf: "high" }, "2ND": { label: "Second Floor", conf: "high" }, "3RD": { label: "Third Floor", conf: "high" },
  "4TH": { label: "Fourth Floor", conf: "high" }, "5TH": { label: "Fifth Floor", conf: "high" }, "6TH": { label: "Sixth Floor", conf: "high" },
  "7TH": { label: "Seventh Floor", conf: "high" }, "8TH": { label: "Eighth Floor", conf: "high" },
};

const UPSELL_TIERS = [{"key": "t1", "label": "Occupancy 85\u2013100%", "extraPax": 570, "grid": {"KGA": {"KGAOV": 90, "KGE": 180, "KGEOV": 270, "SKA": 1170, "SKB": 1260, "SKC": 1350, "D2A/D2C": 1485, "D2B/D2D": 1575, "SKD": 1710, "SKP": 2250, "SXA": 3150}, "KGAOV": {"KGE": 90, "KGEOV": 180, "SKA": 1080, "SKB": 1170, "SKC": 1260, "D2A/D2C": 1395, "D2B/D2D": 1485, "SKD": 1620, "SKP": 2160, "SXA": 3060}, "KGE": {"KGEOV": 90, "SKA": 990, "SKB": 1080, "SKC": 1170, "D2A/D2C": 1305, "D2B/D2D": 1395, "SKD": 1530, "SKP": 2070, "SXA": 2970}, "KGEOV": {"SKA": 900, "SKB": 990, "SKC": 1080, "D2A/D2C": 1215, "D2B/D2D": 1305, "SKD": 1440, "SKP": 1980, "SXA": 2880}, "SKA": {"SKB": 90, "SKC": 180, "SKD": 540, "SKP": 1080, "SXA": 1980}, "SKB": {"SKC": 90, "SKD": 450, "SKP": 990, "SXA": 1890}, "SKC": {"SKD": 360, "SKP": 900, "SXA": 1800}, "D2A/D2C": {"D2B/D2D": 90, "SKD": 225, "SKP": 765, "SXA": 1665}, "D2B/D2D": {"SKD": 135, "SKP": 675, "SXA": 1575}, "SKD": {"SKP": 540, "SXA": 1440}, "SKP": {"SXA": 900}}}, {"key": "t2", "label": "Occupancy 70\u201385%", "extraPax": 570, "grid": {"KGA": {"KGAOV": 70, "KGE": 140, "KGEOV": 210, "SKA": 910, "SKB": 980, "SKC": 1050, "D2A/D2C": 1155, "D2B/D2D": 1225, "SKD": 1330, "SKP": 1750, "SXA": 2450}, "KGAOV": {"KGE": 70, "KGEOV": 140, "SKA": 840, "SKB": 910, "SKC": 980, "D2A/D2C": 1085, "D2B/D2D": 1155, "SKD": 1260, "SKP": 1680, "SXA": 2380}, "KGE": {"KGEOV": 70, "SKA": 770, "SKB": 840, "SKC": 910, "D2A/D2C": 1015, "D2B/D2D": 1085, "SKD": 1190, "SKP": 1610, "SXA": 2310}, "KGEOV": {"SKA": 700, "SKB": 770, "SKC": 840, "D2A/D2C": 945, "D2B/D2D": 1015, "SKD": 1120, "SKP": 1540, "SXA": 2240}, "SKA": {"SKB": 70, "SKC": 140, "SKD": 420, "SKP": 840, "SXA": 1540}, "SKB": {"SKC": 70, "SKD": 350, "SKP": 770, "SXA": 1470}, "SKC": {"SKD": 280, "SKP": 700, "SXA": 1400}, "D2A/D2C": {"D2B/D2D": 70, "SKD": 175, "SKP": 595, "SXA": 1295}, "D2B/D2D": {"SKD": 105, "SKP": 525, "SXA": 1225}, "SKD": {"SKP": 420, "SXA": 1120}, "SKP": {"SXA": 700}}}, {"key": "t3", "label": "Occupancy 50\u201370%", "extraPax": 485, "grid": {"KGA": {"KGAOV": 60, "KGE": 120, "KGEOV": 180, "SKA": 780, "SKB": 840, "SKC": 900, "D2A/D2C": 990, "D2B/D2D": 1050, "SKD": 1140, "SKP": 1500, "SXA": 2100}, "KGAOV": {"KGE": 60, "KGEOV": 120, "SKA": 720, "SKB": 780, "SKC": 840, "D2A/D2C": 930, "D2B/D2D": 990, "SKD": 1080, "SKP": 1440, "SXA": 2040}, "KGE": {"KGEOV": 60, "SKA": 660, "SKB": 720, "SKC": 780, "D2A/D2C": 870, "D2B/D2D": 930, "SKD": 1020, "SKP": 1380, "SXA": 1980}, "KGEOV": {"SKA": 600, "SKB": 660, "SKC": 720, "D2A/D2C": 810, "D2B/D2D": 870, "SKD": 960, "SKP": 1320, "SXA": 1920}, "SKA": {"SKB": 60, "SKC": 120, "SKD": 360, "SKP": 720, "SXA": 1320}, "SKB": {"SKC": 60, "SKD": 300, "SKP": 660, "SXA": 1260}, "SKC": {"SKD": 240, "SKP": 600, "SXA": 1200}, "D2A/D2C": {"D2B/D2D": 60, "SKD": 150, "SKP": 510, "SXA": 1110}, "D2B/D2D": {"SKD": 90, "SKP": 450, "SXA": 1050}, "SKD": {"SKP": 360, "SXA": 960}, "SKP": {"SXA": 600}}}, {"key": "t4", "label": "Occupancy <50% or 4+ Nights", "extraPax": 425, "grid": {"KGA": {"KGAOV": 50, "KGE": 100, "KGEOV": 150, "SKA": 650, "SKB": 700, "SKC": 750, "D2A/D2C": 825, "D2B/D2D": 875, "SKD": 950, "SKP": 1250, "SXA": 1750}, "KGAOV": {"KGE": 50, "KGEOV": 100, "SKA": 600, "SKB": 650, "SKC": 700, "D2A/D2C": 775, "D2B/D2D": 825, "SKD": 900, "SKP": 1200, "SXA": 1700}, "KGE": {"KGEOV": 50, "SKA": 550, "SKB": 600, "SKC": 650, "D2A/D2C": 725, "D2B/D2D": 775, "SKD": 850, "SKP": 1150, "SXA": 1650}, "KGEOV": {"SKA": 500, "SKB": 550, "SKC": 600, "D2A/D2C": 675, "D2B/D2D": 725, "SKD": 800, "SKP": 1100, "SXA": 1600}, "SKA": {"SKB": 50, "SKC": 100, "SKD": 300, "SKP": 600, "SXA": 1100}, "SKB": {"SKC": 50, "SKD": 250, "SKP": 550, "SXA": 1050}, "SKC": {"SKD": 200, "SKP": 500, "SXA": 1000}, "D2A/D2C": {"D2B/D2D": 50, "SKD": 125, "SKP": 425, "SXA": 925}, "D2B/D2D": {"SKD": 75, "SKP": 375, "SXA": 875}, "SKD": {"SKP": 300, "SXA": 800}, "SKP": {"SXA": 500}}}];

const LATE_CHECKOUT_DATA = [
  { category: "Deluxe", time: "16:00", charges: 400, room: 300, fb: 100 },
  { category: "Deluxe", time: "18:00", charges: 600, room: 450, fb: 150 },
  { category: "Premium / Family Suite / Interconnecting", time: "16:00", charges: 600, room: 450, fb: 150 },
  { category: "Premium / Family Suite / Interconnecting", time: "18:00", charges: 800, room: 600, fb: 200 },
  { category: "All Suites", time: "16:00", charges: 750, room: 562.5, fb: 187.5 },
  { category: "All Suites", time: "18:00", charges: 950, room: 712.5, fb: 237.5 },
];

const LC_TYPE_TIER = {
  KGA: "Deluxe", KGAOV: "Deluxe", TWA: "Deluxe", TWAOV: "Deluxe",
  KGE: "Premium / Family Suite / Interconnecting", KGEOV: "Premium / Family Suite / Interconnecting",
  SKB: "Premium / Family Suite / Interconnecting", SKC: "Premium / Family Suite / Interconnecting",
  SKD: "All Suites", SKP: "All Suites", SXA: "All Suites", SKA: "All Suites",
};

const isTouch = true;
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function typeColor(type) { return TYPE_COLOR[type] || "var(--c-pi)"; }
function titleCase(str) {
  if (!str) return "";
  const cleaned = str.replace(/\s+/g, " ").trim();
  return cleaned.toLowerCase().split(" ").map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w)).join(" ");
}
function imgPath(building, roomNum) { return `images/${building}/${roomNum}.jpg`; }
function thumbPath(building, roomNum) { return `thumbs/${building}/${roomNum}.jpg`; }
function buildingData(key) { return RBAB_DATA.buildings[key]; }
function findRoomAnyBuilding(roomNum) {
  for (const bkey of RBAB_DATA.buildingOrder) {
    const b = buildingData(bkey);
    if (b.rooms[String(roomNum)]) return { building: bkey, room: b.rooms[String(roomNum)] };
  }
  return null;
}

/* ================= Auth ================= */
const AUTH_USER = "RBABFRONT";
const AUTH_PASS = "RoomGuide@@2026$$";
function isAuthed() { return localStorage.getItem("rbab-auth") === "ok"; }
function setupAuthGate() {
  $("#authForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const u = $("#authUser").value.trim();
    const p = $("#authPass").value;
    if (u === AUTH_USER && p === AUTH_PASS) {
      localStorage.setItem("rbab-auth", "ok");
      $("#authGate").classList.add("hidden");
      $("#mainApp").style.display = "";
      initApp();
    } else {
      $("#authError").classList.add("show");
    }
  });
}

/* ================= Theme ================= */
function initTheme() {
  const theme = localStorage.getItem("rbab-theme") || "light";
  document.documentElement.dataset.theme = theme;
  $("#themeStateLabel").textContent = theme === "dark" ? "On" : "Off";
}
function toggleTheme() {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("rbab-theme", next);
  $("#themeStateLabel").textContent = next === "dark" ? "On" : "Off";
}

/* ================= Bottom nav / screens ================= */
let currentScreen = "Rooms";
function switchScreen(name) {
  currentScreen = name;
  ["Rooms", "Upsell", "Checkout", "More"].forEach((s) => {
    $(`#screen${s}`).style.display = s === name ? "" : "none";
  });
  $$(".nav-btn").forEach((btn) => btn.classList.toggle("active", btn.dataset.screen === name));
}

/* ================= Rooms: building / floor state ================= */
let currentBuilding = null;
let currentFloor = null;
let currentView = "grid"; // "grid" | "list"
let filters = { types: new Set(), codes: new Set(), connectOnly: false };
let activeRoom = null;

function roomsForFloor(bkey, fkey) {
  return Object.values(buildingData(bkey).rooms).filter((r) => r.floor === fkey);
}

function buildBuildingTabs() {
  const wrap = $("#buildingTabs");
  wrap.innerHTML = "";
  RBAB_DATA.buildingOrder.forEach((bkey) => {
    const b = buildingData(bkey);
    const btn = document.createElement("button");
    btn.textContent = b.label;
    btn.dataset.building = bkey;
    btn.addEventListener("click", () => selectBuilding(bkey));
    wrap.appendChild(btn);
  });
}

function selectBuilding(bkey) {
  currentBuilding = bkey;
  $$("#buildingTabs button").forEach((b) => b.classList.toggle("active", b.dataset.building === bkey));
  buildFloorChips();
  selectFloor(buildingData(bkey).floorOrder[0]);
}

function buildFloorChips() {
  const b = buildingData(currentBuilding);
  const wrap = $("#floorChipRow");
  wrap.innerHTML = "";
  b.floorOrder.forEach((fkey) => {
    const f = b.floors[fkey];
    const btn = document.createElement("button");
    btn.textContent = f.label;
    btn.dataset.floor = fkey;
    btn.addEventListener("click", () => selectFloor(fkey));
    wrap.appendChild(btn);
  });
}

function selectFloor(fkey) {
  currentFloor = fkey;
  filters = { types: new Set(), codes: new Set(), connectOnly: false };
  $$("#floorChipRow button").forEach((btn) => btn.classList.toggle("active", btn.dataset.floor === fkey));
  renderFloor();
  closeDetail();
}

function renderFloor() {
  const b = buildingData(currentBuilding);
  const f = b.floors[currentFloor];
  const rooms = roomsForFloor(currentBuilding, currentFloor);
  const withConnect = rooms.filter((r) => r.connecting != null).length;
  $("#floorStat").textContent = `${rooms.length} rooms · ${withConnect} connecting`;

  renderRoomList(rooms);
  renderGrid(f, rooms);
  buildLegend(rooms);
  updateFilterCountBadge();
  applyViewMode();
}

function renderRoomList(rooms) {
  const wrap = $("#roomList");
  wrap.innerHTML = "";
  const sorted = [...rooms].sort((a, c) => a.room - c.room);
  sorted.forEach((r) => {
    const item = document.createElement("div");
    item.className = "room-list-item";
    item.dataset.room = r.room;
    const thumbStyle = r.hasPhoto
      ? `background-image: linear-gradient(to bottom, rgba(20,15,10,0.08), rgba(20,15,10,0.4)), url(${thumbPath(currentBuilding, r.room)});`
      : `background: ${typeColor(r.type)};`;
    item.innerHTML = `
      <div class="rli-thumb" style="${thumbStyle}">
        ${!r.hasPhoto ? r.type : ""}
        ${r.connecting != null ? '<span class="rli-dot"></span>' : ""}
      </div>
      <div class="rli-info">
        <div class="rli-num">${r.room}</div>
        <div class="rli-meta">${r.type} — ${titleCase(r.description) || ""}</div>
      </div>
      <div class="rli-arrow">›</div>`;
    item.addEventListener("click", () => openDetail(currentBuilding, r.room));
    wrap.appendChild(item);
  });
}

function renderGrid(f, rooms) {
  const grid = $("#grid");
  grid.innerHTML = "";
  const tileSize = 46;
  grid.style.gridTemplateColumns = `repeat(${f.cols}, ${tileSize}px)`;
  grid.style.gridTemplateRows = `repeat(${f.rows}, ${tileSize}px)`;

  rooms.forEach((r) => {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.dataset.room = r.room;
    tile.style.gridColumn = r.col + 1;
    tile.style.gridRow = r.row + 1;
    if (r.hasPhoto) {
      tile.classList.add("has-thumb");
      tile.style.backgroundImage = `linear-gradient(to bottom, rgba(20,15,10,0.18), rgba(20,15,10,0.62)), url(${thumbPath(currentBuilding, r.room)})`;
    } else {
      tile.style.background = typeColor(r.type);
    }
    tile.innerHTML = `<div class="rnum">${r.room}</div><div class="rtype">${r.type}</div>`;
    tile.addEventListener("click", () => openDetail(currentBuilding, r.room));
    grid.appendChild(tile);
  });

  f.facilities.forEach((fac) => {
    const tile = document.createElement("div");
    tile.className = "tile facility";
    if (fac.label === "Atrium") tile.classList.add("atrium");
    tile.style.gridColumn = fac.col + 1;
    tile.style.gridRow = fac.row + 1;
    tile.textContent = fac.label;
    grid.appendChild(tile);
  });
}

function buildLegend(rooms) {
  const types = Array.from(new Set(rooms.map((r) => r.type))).sort();
  const legend = $("#legend");
  legend.innerHTML = "";
  types.forEach((t) => {
    const sample = rooms.find((r) => r.type === t);
    const label = titleCase(sample ? sample.description : t);
    const item = document.createElement("div");
    item.className = "item";
    item.innerHTML = `<span class="swatch" style="background:${typeColor(t)}"></span>${t} — ${label}`;
    legend.appendChild(item);
  });
}

function applyViewMode() {
  const isGrid = currentView === "grid";
  $("#roomList").style.display = isGrid ? "none" : "";
  $("#gridWrap").style.display = isGrid ? "" : "none";
  $("#viewToggleLabel").textContent = isGrid ? "List" : "Grid";
}
function toggleView() { currentView = currentView === "grid" ? "list" : "grid"; applyViewMode(); }

/* ================= Filters (bottom sheet) ================= */
function roomMatchesFilters(r) {
  if (filters.types.size && !filters.types.has(r.type)) return false;
  if (filters.codes.size) { for (const c of filters.codes) { if (!r.codes.includes(c)) return false; } }
  if (filters.connectOnly && r.connecting == null) return false;
  return true;
}
function filtersActive() { return filters.types.size || filters.codes.size || filters.connectOnly; }

function allRoomsFlat() {
  const out = [];
  RBAB_DATA.buildingOrder.forEach((bkey) => {
    const b = buildingData(bkey);
    Object.values(b.rooms).forEach((r) => out.push({ building: bkey, buildingLabel: b.label, room: r }));
  });
  return out;
}

function openFilterSheet() {
  const allRooms = allRoomsFlat().map((x) => x.room);
  const types = Array.from(new Set(allRooms.map((r) => r.type))).sort();
  const codes = Array.from(new Set(allRooms.flatMap((r) => r.codes))).sort();

  let html = `<div class="filter-group-label">Room Category</div><div class="filter-chip-wrap">`;
  types.forEach((t) => { html += `<button class="filter-chip type-fc${filters.types.has(t) ? " active" : ""}" data-t="${t}">${t}</button>`; });
  html += `</div><div class="filter-group-label">Interconnecting</div><div class="filter-chip-wrap">
    <button class="filter-chip conn-fc${filters.connectOnly ? " active" : ""}">Interconnecting rooms only</button>
  </div><div class="filter-group-label">Features</div><div class="filter-chip-wrap">`;
  codes.forEach((c) => { html += `<button class="filter-chip code-fc${filters.codes.has(c) ? " active" : ""}" data-c="${c}" title="${GLOSSARY[c] ? GLOSSARY[c].label : ""}">${c}</button>`; });
  html += `</div>`;

  $("#filterSheetBody").innerHTML = html;
  $$(".type-fc", $("#filterSheetBody")).forEach((chip) => {
    chip.addEventListener("click", () => { const t = chip.dataset.t; filters.types.has(t) ? filters.types.delete(t) : filters.types.add(t); chip.classList.toggle("active"); });
  });
  $$(".code-fc", $("#filterSheetBody")).forEach((chip) => {
    chip.addEventListener("click", () => { const c = chip.dataset.c; filters.codes.has(c) ? filters.codes.delete(c) : filters.codes.add(c); chip.classList.toggle("active"); });
  });
  $(".conn-fc", $("#filterSheetBody")).addEventListener("click", (e) => { filters.connectOnly = !filters.connectOnly; e.target.classList.toggle("active"); });

  $("#filterSheet").classList.add("show");
}
function closeFilterSheet() { $("#filterSheet").classList.remove("show"); }
function applyFiltersFromSheet() {
  closeFilterSheet();
  const active = filtersActive();
  $$(".tile[data-room]").forEach((t) => { const r = buildingData(currentBuilding).rooms[t.dataset.room]; t.classList.toggle("filtered-out", active && !roomMatchesFilters(r)); });
  $$(".room-list-item[data-room]").forEach((t) => { const r = buildingData(currentBuilding).rooms[t.dataset.room]; t.classList.toggle("filtered-out", active && !roomMatchesFilters(r)); });
  updateFilterCountBadge();
}
function clearFiltersFromSheet() {
  filters = { types: new Set(), codes: new Set(), connectOnly: false };
  openFilterSheet();
}
function updateFilterCountBadge() {
  const n = filters.types.size + filters.codes.size + (filters.connectOnly ? 1 : 0);
  const badge = $("#filterCountBadge");
  badge.style.display = n > 0 ? "" : "none";
  badge.textContent = n;
}

/* ================= Search ================= */
function setupSearch() {
  const btn = $("#searchToggleBtn");
  const bar = $("#searchBar");
  const input = $("#searchInput");
  const results = $("#searchResults");

  btn.addEventListener("click", () => {
    const show = bar.style.display === "none";
    bar.style.display = show ? "" : "none";
    if (show) input.focus();
  });

  input.addEventListener("input", () => {
    const val = input.value.trim();
    if (!val) { results.classList.remove("show"); return; }
    const matches = allRoomsFlat().filter((m) => String(m.room.room).startsWith(val)).slice(0, 8);
    if (!matches.length) { results.innerHTML = `<div class="sr-item">No matches</div>`; }
    else {
      results.innerHTML = matches.map((m) => `<div class="sr-item" data-b="${m.building}" data-r="${m.room.room}"><span>${m.room.room}</span><span class="sr-meta">${m.buildingLabel} · ${m.room.type}</span></div>`).join("");
      $$(".sr-item[data-b]", results).forEach((el) => {
        el.addEventListener("click", () => {
          openDetail(el.dataset.b, Number(el.dataset.r));
          input.value = ""; results.classList.remove("show"); bar.style.display = "none";
        });
      });
    }
    results.classList.add("show");
  });
}

/* ================= Room detail (full-screen sheet) ================= */
function openDetail(bkey, roomNum) {
  const b = buildingData(bkey);
  const room = b.rooms[String(roomNum)];
  if (!room) return;
  activeRoom = roomNum;

  if (bkey !== currentBuilding) {
    currentBuilding = bkey;
    $$("#buildingTabs button").forEach((btn) => btn.classList.toggle("active", btn.dataset.building === bkey));
    buildFloorChips();
  }
  if (room.floor !== currentFloor) {
    currentFloor = room.floor;
    filters = { types: new Set(), codes: new Set(), connectOnly: false };
    $$("#floorChipRow button").forEach((btn) => btn.classList.toggle("active", btn.dataset.floor === room.floor));
    renderFloor();
  }

  const label = titleCase(room.description) || room.type;
  $("#dRoomNum").textContent = room.room;
  const pill = $("#dTypePill");
  pill.textContent = room.type;
  pill.style.background = typeColor(room.type);
  $("#dDesc").textContent = label;

  const photoFrame = $("#dPhoto");
  if (room.hasPhoto) {
    photoFrame.innerHTML = `<img src="${imgPath(bkey, room.room)}" alt="View from room ${room.room}">`;
    $("#dPhoto img").addEventListener("click", () => openLightbox(imgPath(bkey, room.room)));
  } else {
    photoFrame.innerHTML = `<div class="no-img">No photo available yet<br>for room ${room.room}</div>`;
  }

  const tagsWrap = $("#dTags");
  tagsWrap.innerHTML = "";
  if (room.codes && room.codes.length) {
    room.codes.forEach((c) => {
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = c;
      tag.title = GLOSSARY[c] ? GLOSSARY[c].label : "Meaning not yet confirmed";
      tagsWrap.appendChild(tag);
    });
  } else {
    tagsWrap.innerHTML = `<div class="no-codes">No feature codes listed for this room.</div>`;
  }

  const connectWrap = $("#dConnect");
  if (room.connecting != null) {
    const other = b.rooms[String(room.connecting)];
    const otherLabel = other ? titleCase(other.description) : "";
    connectWrap.innerHTML = `<div class="connect-title">🔗 Interconnecting with Room ${room.connecting}</div>
      <div class="connect-room-card">
        <div class="cphoto">${other && other.hasPhoto ? `<img src="${imgPath(bkey, other.room)}" alt="">` : ""}</div>
        <div class="cmeta"><div><strong>Room ${room.connecting}</strong><br><span class="ctype">${other ? `${other.type} — ${otherLabel}` : ""}</span></div><span class="go">View →</span></div>
      </div>`;
    connectWrap.querySelector(".connect-room-card").addEventListener("click", () => openDetail(bkey, room.connecting));
  } else {
    connectWrap.innerHTML = `<div class="no-connect">This room is not interconnecting.</div>`;
  }

  $("#detailSheet").classList.add("show");
}
function closeDetail() { $("#detailSheet").classList.remove("show"); activeRoom = null; }

function openLightbox(src) { $("#lbImg").src = src; $("#lightbox").classList.add("show"); }
function closeLightbox() { $("#lightbox").classList.remove("show"); }

/* ================= Upsell ================= */
let upsellOcc = "";
let upsellNights4Plus = false;
let upsellFrom = "";
let upsellTo = "";

function upsellRowOptions(tierKey) { return Object.keys(UPSELL_TIERS.find((t) => t.key === tierKey).grid); }
function upsellTierFromOccupancy(occ, nights4Plus) {
  if (nights4Plus) return "t4";
  if (occ === "" || occ == null || isNaN(occ)) return null;
  const n = Number(occ);
  if (n < 50) return "t4";
  if (n < 70) return "t3";
  if (n < 85) return "t2";
  return "t1";
}

function renderUpsellResults() {
  const tierKey = upsellTierFromOccupancy(upsellOcc, upsellNights4Plus);
  const tier = tierKey ? UPSELL_TIERS.find((t) => t.key === tierKey) : null;
  const wrap = $("#upsellBody");

  if (!tier) {
    wrap.innerHTML = `<div class="up-prompt">Enter an occupancy % (or check "4+ nights stay") to see the matching prices.</div>`;
    return;
  }

  let html = `<div class="up-supplement-note">Matched tier: <b>${tier.label}</b> — extra-pax supplement: <b>AED ${tier.extraPax}</b></div>
    <div class="up-select-row">
      <label>From <select id="upFromSelect"><option value="">Any</option>
        ${upsellRowOptions(tierKey).map((r) => `<option value="${r}" ${r === upsellFrom ? "selected" : ""}>${r}</option>`).join("")}
      </select></label>
      <label>To <select id="upToSelect" ${upsellFrom ? "" : "disabled"}><option value="">Any</option>
        ${upsellFrom ? Object.keys(tier.grid[upsellFrom] || {}).map((c) => `<option value="${c}" ${c === upsellTo ? "selected" : ""}>${c}</option>`).join("") : ""}
      </select></label>
    </div>`;

  if (upsellFrom && upsellTo && tier.grid[upsellFrom] && tier.grid[upsellFrom][upsellTo] != null) {
    html += `<div class="up-result"><div class="up-result-label">${upsellFrom} → ${upsellTo}</div><div class="up-result-price">AED ${tier.grid[upsellFrom][upsellTo]}</div></div>`;
  } else if (upsellFrom && tier.grid[upsellFrom]) {
    html += `<table class="result-table"><thead><tr><th>To</th><th>Price</th></tr></thead><tbody>`;
    Object.entries(tier.grid[upsellFrom]).forEach(([to, price]) => { html += `<tr><td><code>${to}</code></td><td>AED ${price}</td></tr>`; });
    html += `</tbody></table>`;
  } else {
    const rowKeys = upsellRowOptions(tierKey);
    const colKeys = ["KGAOV","KGE","KGEOV","SKA","SKB","SKC","D2A/D2C","D2B/D2D","SKD","SKP","SXA"];
    html += `<div class="up-grid-scroll"><table class="result-table up-full-grid"><thead><tr><th>From \\ To</th>${colKeys.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>`;
    rowKeys.forEach((r) => {
      html += `<tr><td><b>${r}</b></td>`;
      colKeys.forEach((c) => { const v = tier.grid[r][c]; html += `<td>${v != null ? v : "—"}</td>`; });
      html += `</tr>`;
    });
    html += `</tbody></table></div>`;
  }

  wrap.innerHTML = html;
  $("#upFromSelect").addEventListener("change", (e) => { upsellFrom = e.target.value; upsellTo = ""; renderUpsellResults(); });
  const toSel = $("#upToSelect");
  if (toSel) toSel.addEventListener("change", (e) => { upsellTo = e.target.value; renderUpsellResults(); });
}

/* ================= Late Checkout ================= */
let lcType = "";
let lcTime = "";
function lcEffectiveTier(typeCode) { return LC_TYPE_TIER[typeCode] || null; }

function renderLateCheckout() {
  const wrap = $("#lateCheckoutBody");
  const typeCodes = Object.keys(LC_TYPE_TIER);
  const times = Array.from(new Set(LATE_CHECKOUT_DATA.map((r) => r.time)));

  let html = `<div class="up-select-row">
      <label>Room Type <select id="lcTypeSelect"><option value="">Any</option>
        ${typeCodes.map((t) => `<option value="${t}" ${t === lcType ? "selected" : ""}>${t}</option>`).join("")}
      </select></label>
      <label>Check Out <select id="lcTimeSelect"><option value="">Any</option>
        ${times.map((t) => `<option value="${t}" ${t === lcTime ? "selected" : ""}>${t}H</option>`).join("")}
      </select></label>
    </div>`;

  const tier = lcType ? lcEffectiveTier(lcType) : null;
  const matches = LATE_CHECKOUT_DATA.filter((r) => (!tier || r.category === tier) && (!lcTime || r.time === lcTime));

  if (tier) html += `<div class="up-supplement-note">${lcType} falls under <b>${tier}</b> pricing.</div>`;

  if (tier && lcTime && matches.length === 1) {
    const r = matches[0];
    html += `<div class="up-result">
      <div class="up-result-label">${lcType} — ${r.time}H Checkout</div>
      <div class="up-result-price">AED ${r.charges}</div>
      <div class="lc-breakdown"><span>Room <b>AED ${r.room}</b></span><span>F&amp;B <b>AED ${r.fb}</b></span></div>
    </div>`;
  } else {
    html += `<table class="result-table"><thead><tr><th>Category</th><th>Time</th><th>Charges</th><th>Room</th><th>F&amp;B</th></tr></thead><tbody>`;
    matches.forEach((r) => { html += `<tr><td><b>${r.category}</b></td><td>${r.time}H</td><td><b>AED ${r.charges}</b></td><td>AED ${r.room}</td><td>AED ${r.fb}</td></tr>`; });
    html += `</tbody></table>`;
  }

  wrap.innerHTML = html;
  $("#lcTypeSelect").addEventListener("change", (e) => { lcType = e.target.value; renderLateCheckout(); });
  $("#lcTimeSelect").addEventListener("change", (e) => { lcTime = e.target.value; renderLateCheckout(); });
}

/* ================= Overview ================= */
function openOverview() {
  let html = "";
  RBAB_DATA.buildingOrder.forEach((bkey) => {
    const b = buildingData(bkey);
    const allRooms = Object.values(b.rooms);
    const guestRooms = allRooms.filter((r) => r.type !== "PI");
    const withPhoto = guestRooms.filter((r) => r.hasPhoto).length;
    const pct = Math.round((withPhoto / guestRooms.length) * 100);
    const withConnect = allRooms.filter((r) => r.connecting != null).length;
    const typeCounts = {};
    guestRooms.forEach((r) => { typeCounts[r.type] = (typeCounts[r.type] || 0) + 1; });
    const maxCount = Math.max(...Object.values(typeCounts));

    html += `<div class="ov-building-block"><h3 class="ov-building-heading">${b.label}</h3>
      <div class="overview-stats">
        <div class="ov-stat-card"><div class="ov-num">${allRooms.length}</div><div class="ov-label">Total Rooms</div></div>
        <div class="ov-stat-card"><div class="ov-num">${b.floorOrder.length}</div><div class="ov-label">Floors</div></div>
        <div class="ov-stat-card"><div class="ov-num">${withConnect}</div><div class="ov-label">Interconnecting</div></div>
        <div class="ov-stat-card"><div class="ov-num">${pct}%</div><div class="ov-label">Photo Coverage</div></div>
      </div>
      <div class="ov-type-bars">`;
    Object.entries(typeCounts).sort((a, b2) => b2[1] - a[1]).forEach(([t, count]) => {
      html += `<div class="ov-type-row"><span class="ov-type-label">${t}</span>
        <span class="ov-type-track"><span class="ov-type-fill" style="width:${(count / maxCount) * 100}%; background:${typeColor(t)}"></span></span>
        <span class="ov-type-count">${count}</span></div>`;
    });
    html += `</div><div class="ov-floor-list">`;
    b.floorOrder.forEach((fkey) => {
      const f = b.floors[fkey];
      const floorRooms = allRooms.filter((r) => r.floor === fkey);
      const floorGuestRooms = floorRooms.filter((r) => r.type !== "PI");
      const floorPhoto = floorGuestRooms.filter((r) => r.hasPhoto).length;
      const floorPct = floorGuestRooms.length ? Math.round((floorPhoto / floorGuestRooms.length) * 100) : 100;
      html += `<div class="ov-floor-card" data-b="${bkey}" data-f="${fkey}">
        <span class="ov-floor-name">${f.label}</span>
        <span class="ov-floor-bar"><span class="ov-floor-fill" style="width:${floorPct}%"></span></span>
        <span class="ov-floor-stat">${floorRooms.length} rooms · ${floorPct}%</span></div>`;
    });
    html += `</div></div>`;
  });

  $("#overviewBody").innerHTML = html;
  $$(".ov-floor-card", $("#overviewBody")).forEach((card) => {
    card.addEventListener("click", () => {
      closeOverview();
      selectBuilding(card.dataset.b);
      selectFloor(card.dataset.f);
      switchScreen("Rooms");
    });
  });
  $("#overviewSheet").classList.add("show");
}
function closeOverview() { $("#overviewSheet").classList.remove("show"); }

/* ================= Init ================= */
function initApp() {
  initTheme();
  buildBuildingTabs();
  setupSearch();

  $$(".nav-btn").forEach((btn) => btn.addEventListener("click", () => switchScreen(btn.dataset.screen)));

  $("#filterOpenBtn").addEventListener("click", openFilterSheet);
  $("#filterSheetCloseX").addEventListener("click", closeFilterSheet);
  $("#filterApplyBtn").addEventListener("click", applyFiltersFromSheet);
  $("#filterClearBtn").addEventListener("click", clearFiltersFromSheet);
  $("#filterSheet").addEventListener("click", (e) => { if (e.target.id === "filterSheet") closeFilterSheet(); });
  $("#viewToggleBtn").addEventListener("click", toggleView);
  $("#themeToggleBtn").addEventListener("click", toggleTheme);
  $("#overviewOpenBtn").addEventListener("click", openOverview);
  $("#overviewCloseBtn").addEventListener("click", closeOverview);
  $("#detailCloseBtn").addEventListener("click", closeDetail);
  $("#lightbox").addEventListener("click", closeLightbox);

  $("#upOccInput").addEventListener("input", (e) => { upsellOcc = e.target.value; upsellFrom = ""; upsellTo = ""; renderUpsellResults(); });
  $("#upNightsCheck").addEventListener("change", (e) => { upsellNights4Plus = e.target.checked; $("#upOccInput").disabled = upsellNights4Plus; upsellFrom = ""; upsellTo = ""; renderUpsellResults(); });

  selectBuilding(RBAB_DATA.buildingOrder[0]);
  renderUpsellResults();
  renderLateCheckout();
}

document.addEventListener("DOMContentLoaded", () => {
  if (isAuthed()) {
    $("#authGate").classList.add("hidden");
    $("#mainApp").style.display = "";
    initApp();
  } else {
    setupAuthGate();
  }
});
