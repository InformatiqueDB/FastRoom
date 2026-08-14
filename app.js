// --- Configuration des salles ---
const ROOMS = [
  // 3ème étage
  { key: "amberieu",   name: "Ambérieu",              floor: "3",   capacity: 8,  roomId: 2182, code: "AMB"  },
  { key: "bordeaux",   name: "Bordeaux St Jean",      floor: "3",   capacity: 6,  roomId: 2177, code: "BDX"  },
  { key: "calais",     name: "Calais Fréthun",        floor: "3",   capacity: 6,  roomId: 2178, code: "CFR"  },
  { key: "gevrey",     name: "Gevrey",                floor: "3",   capacity: 6,  roomId: 2181, code: "GEV"  },
  { key: "hendaye",    name: "Hendaye",               floor: "3",   capacity: 6,  roomId: 2179, code: "HDY"  },
  { key: "marseille",  name: "Marseille", floor: "3",   capacity: 14, roomId: 2187, code: "MSC"  },
  { key: "miramas",    name: "Miramas",               floor: "3",   capacity: 6,  roomId: 2184, code: "MRA"  },
  { key: "valenton",   name: "Valenton",              floor: "3",   capacity: 4,  roomId: 2176, code: "VLT"  },

  // RDC
  { key: "mannheim",   name: "Mannheim",              floor: "RDC", capacity: 8,  roomId: 2180, code: "MH"   },
  { key: "sarrebruck", name: "Sarrebruck",            floor: "RDC", capacity: 8,  roomId: 2183, code: "SB"   },
  { key: "francfort",  name: "Francfort",             floor: "RDC", capacity: 16, roomId: 2185, code: "FF"   },
  { key: "berlinfr",   name: "Berlin Friedrichstr.",  floor: "RDC", capacity: 20, roomId: 2188, code: "BFS"  },
  { key: "berlinzoo",  name: "Berlin Zoo",            floor: "RDC", capacity: 20, roomId: 2189, code: "BZOO" },
  { key: "berlinhbf",  name: "Berlin Hbf.",           floor: "RDC", capacity: 40, roomId: 2190, code: "BL"   },
];

const DURATIONS = [
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "1 h",    value: 60 },
  { label: "1 h30",  value: 90 },
  { label: "2 h",    value: 120 }
];

const BOOKING_BASE = "https://krbs.intranet.deutschebahn.com/roomtool/booking";

// --- Génération de la matrice (façon Excel) ---
function initGrid() {
  const grid3 = document.getElementById("grid-3");
  const gridRDC = document.getElementById("grid-RDC");

  ROOMS.forEach(room => {
    const col = document.createElement("div");
    col.className = "room-column";
    col.dataset.capacity = room.capacity;

    const header = document.createElement("div");
    header.className = "room-header";

    const code = document.createElement("span");
    code.className = "room-code";
    code.textContent = room.code || "—";
    header.appendChild(code);

    const name = document.createElement("div");
    name.className = "room-name";
    name.textContent = room.name;
    header.appendChild(name);

    const meta = document.createElement("div");
    meta.className = "room-meta";
    meta.textContent = `${room.capacity} personnes`;
    header.appendChild(meta);

    col.appendChild(header);

    const actions = document.createElement("div");
    actions.className = "room-actions";

    DURATIONS.forEach(duration => {
      const btn = document.createElement("button");
      btn.className = "duration-btn";
      btn.textContent = duration.label;

      if (!room.roomId) {
        btn.disabled = true;
        btn.title = "Identifiant de la salle manquant";
      } else {
        btn.onclick = () => bookNow(room, duration, btn);
      }

      actions.appendChild(btn);
    });

    col.appendChild(actions);

    if (room.floor === "3") {
      grid3.appendChild(col);
    } else {
      gridRDC.appendChild(col);
    }
  });
}

// --- Logique "À l'instant T" (Calcul de l'heure actuelle) ---
function bookNow(room, duration, btn) {
  const roomId = room.roomId;
  const durationMinutes = duration.value;
  const now = new Date();

  let h = now.getHours();
  let m = Math.ceil(now.getMinutes() / 15) * 15;

  let bookingDate = new Date(now);
  if (m === 60) {
    m = 0;
    h += 1;
  }
  if (h > 23) {
    h = 0;
    bookingDate.setDate(bookingDate.getDate() + 1);
  }

  const dateStr = `${bookingDate.getDate()}.${bookingDate.getMonth() + 1}.${bookingDate.getFullYear()}`;
  const fromStr = `${h}:${String(m).padStart(2, "0")}`;

  let totalMins = (h * 60) + m + durationMinutes;
  let tillH = Math.floor(totalMins / 60) % 24;
  let tillM = totalMins % 60;
  const tillStr = `${tillH}:${String(tillM).padStart(2, "0")}`;

  const url = `${BOOKING_BASE}/bookRoom.do?participants=2&bookingsRoomId(0)=${roomId}&bookingsDate(0)=${dateStr}&bookingsTimeFrom(0)=${fromStr}&bookingsTimeTill(0)=${tillStr}&bookingsSumPrice(0)=#`;

  if (btn) {
    const originalLabel = btn.textContent;
    btn.classList.add("is-booking");
    btn.textContent = "OK ✓";
    setTimeout(() => {
      btn.classList.remove("is-booking");
      btn.textContent = originalLabel;
    }, 900);
  }
  showToast(`${room.name} réservée de ${fromStr} à ${tillStr}`);
  window.open(url, '_blank');
}

// --- Toast de confirmation ---
let toastTimeout = null;
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

// --- Horloge et Date en direct ---
function updateClock() {
  const now = new Date();
  
  // Gestion de l'heure
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');

  const clockHElement = document.getElementById('clockH');
  const clockMElement = document.getElementById('clockM');
  const clockSElement = document.getElementById('clockS');

  if(clockHElement) clockHElement.textContent = h;
  if(clockMElement) clockMElement.textContent = m;
  if(clockSElement) clockSElement.textContent = s;

  // Gestion de la date
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  
  const dateElement = document.getElementById('dateValue');
  if(dateElement) dateElement.textContent = `${day}/${month}/${year}`;
}

// --- Gestion des onglets (Étages) ---
function setupTabs() {
  const tab3 = document.getElementById("tab-3");
  const tabRDC = document.getElementById("tab-RDC");
  const grid3 = document.getElementById("grid-3");
  const gridRDC = document.getElementById("grid-RDC");

  tab3.addEventListener("click", () => {
    tab3.classList.add("floor-tab--active");
    tab3.setAttribute("aria-selected", "true");
    tabRDC.classList.remove("floor-tab--active");
    tabRDC.setAttribute("aria-selected", "false");
    grid3.classList.add("active");
    gridRDC.classList.remove("active");
    updateEmptyStates();
    if (window.updateArrows) window.updateArrows();
  });

  tabRDC.addEventListener("click", () => {
    tabRDC.classList.add("floor-tab--active");
    tabRDC.setAttribute("aria-selected", "true");
    tab3.classList.remove("floor-tab--active");
    tab3.setAttribute("aria-selected", "false");
    gridRDC.classList.add("active");
    grid3.classList.remove("active");
    updateEmptyStates();
    if (window.updateArrows) window.updateArrows();
  });
}

// --- Message "aucun résultat" + compteur, par étage ---
function updateEmptyStates() {
  ["3", "RDC"].forEach(floor => {
    const grid = document.getElementById(`grid-${floor}`);
    const empty = document.getElementById(`empty-${floor}`);
    if (!grid || !empty) return;

    const columns = grid.querySelectorAll(".room-column");
    const visibleCount = Array.from(columns).filter(c => c.style.display !== "none").length;
    empty.classList.toggle("is-visible", visibleCount === 0);
  });

  const activeGrid = document.querySelector(".grid-container.active");
  const resultCount = document.getElementById("resultCount");
  if (activeGrid && resultCount) {
    const columns = activeGrid.querySelectorAll(".room-column");
    const visibleCount = Array.from(columns).filter(c => c.style.display !== "none").length;
    resultCount.textContent = `${visibleCount} salle${visibleCount > 1 ? "s" : ""}`;
  }
}

// --- Filtrage par capacité (Mise à jour avec gestion clavier) ---
function setupCapacityFilter() {
  const slider = document.getElementById('capacity-slider');
  const input = document.getElementById('capacity-input');

  function applyFilter(val) {
    const progress = (val / slider.max) * 100;
    slider.style.setProperty('--slider-progress', `${progress}%`);

    const columns = document.querySelectorAll('.room-column');
    columns.forEach(col => {
      const cap = parseInt(col.dataset.capacity, 10);
      if (val === 0 || cap >= val) {
        col.style.display = ''; 
      } else {
        col.style.display = 'none'; 
      }
    });

    updateEmptyStates();
    if (window.updateArrows) window.updateArrows();
  }

  function resetFilter() {
    slider.value = 0;
    input.value = "Toutes";
    applyFilter(0);
  }

  slider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    input.value = val === 0 ? "Toutes" : val + "+";
    applyFilter(val);
  });

  input.addEventListener('focus', () => {
    const currentVal = parseInt(slider.value, 10);
    input.value = currentVal === 0 ? "" : currentVal;
  });

  input.addEventListener('input', (e) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 0) val = 0;
    const max = parseInt(slider.max, 10);
    if (val > max) val = max;
    slider.value = val;
    applyFilter(val);
  });

  input.addEventListener('blur', () => {
     const val = parseInt(slider.value, 10);
     input.value = val === 0 ? "Toutes" : val + "+";
  });

  document.querySelectorAll('[data-reset-filter]').forEach(btn => {
    btn.addEventListener('click', resetFilter);
  });

  updateEmptyStates();
}

// --- Gestion des flèches de défilement (Extrêmes) ---
function setupScrollArrows() {
  const btnLeft = document.getElementById('scrollLeftBtn');
  const btnRight = document.getElementById('scrollRightBtn');
  if (!btnLeft || !btnRight) return;

  function updateArrows() {
    const activeGrid = document.querySelector('.grid-container.active');
    if (!activeGrid) return;

    const isAtStart = activeGrid.scrollLeft <= 2;
    const isAtEnd = activeGrid.scrollLeft + activeGrid.clientWidth >= activeGrid.scrollWidth - 2;

    btnLeft.style.display = isAtStart ? 'none' : 'flex';
    btnRight.style.display = isAtEnd ? 'none' : 'flex';

    if (activeGrid.scrollWidth <= activeGrid.clientWidth) {
       btnLeft.style.display = 'none';
       btnRight.style.display = 'none';
    }
  }

  btnLeft.addEventListener('click', () => {
    const activeGrid = document.querySelector('.grid-container.active');
    if (activeGrid) activeGrid.scrollTo({ left: 0, behavior: 'smooth' });
  });

  btnRight.addEventListener('click', () => {
    const activeGrid = document.querySelector('.grid-container.active');
    if (activeGrid) activeGrid.scrollTo({ left: activeGrid.scrollWidth, behavior: 'smooth' });
  });

  document.querySelectorAll('.grid-container').forEach(grid => {
    grid.addEventListener('scroll', updateArrows);
  });

  window.updateArrows = updateArrows;
  window.addEventListener('resize', updateArrows);
  setTimeout(updateArrows, 150);
}

// --- Initialisation ---
document.addEventListener("DOMContentLoaded", () => {
  initGrid();
  setupTabs();
  setupCapacityFilter();
  updateClock();
  setInterval(updateClock, 1000);
  setupScrollArrows(); 
});