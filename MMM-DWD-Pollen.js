"use strict";

/* ───────────────────────────────────────────────────────────
 * MMM-DWD-Pollen  v2.0
 *
 * Display modes:
 *   "number"  — original numeric values with colour coding
 *   "icon"    — star-based severity icons (original style)
 *   "visual"  — SVG pollen-type icons + colour gradient bars
 *
 * Key improvements over v1:
 *   • Lookup tables instead of long if/else chains
 *   • Proper date comparison (date-only, no getDay() bug)
 *   • Error state handling from node_helper
 *   • No external dependencies (SVGs are inline)
 *   • Unique SVG pollen icons per pollen type
 * ─────────────────────────────────────────────────────────── */

Module.register("MMM-DWD-Pollen", {

  // ── state ──────────────────────────────────────────────
  result: null,
  errorMessage: null,

  POLLEN_TYPES: [
    "Hasel", "Erle", "Esche", "Birke",
    "Graeser", "Roggen", "Beifuss", "Ambrosia",
  ],

  // ── severity scale ────────────────────────────────────
  // Maps DWD string values → { numeric, label, css class, hue }
  SEVERITY: {
    "0":     { n: 0,   label: "Keine",        cls: "none",       hue: 0 },
    "0-1":   { n: 0.5, label: "Keine–Gering", cls: "low",        hue: 0.5 },
    "1":     { n: 1,   label: "Gering",        cls: "low",        hue: 1 },
    "1-2":   { n: 1.5, label: "Gering–Mittel", cls: "low-medium", hue: 1.5 },
    "2":     { n: 2,   label: "Mittel",        cls: "medium",     hue: 2 },
    "2-3":   { n: 2.5, label: "Mittel–Hoch",   cls: "medium-high",hue: 2.5 },
    "3":     { n: 3,   label: "Hoch",          cls: "high",       hue: 3 },
  },

  // ── readable German names ─────────────────────────────
  DISPLAY_NAMES: {
    Hasel:    "Hasel",
    Erle:     "Erle",
    Esche:    "Esche",
    Birke:    "Birke",
    Graeser:  "Gräser",
    Roggen:   "Roggen",
    Beifuss:  "Beifuß",
    Ambrosia: "Ambrosia",
  },

  // ── SVG paths per pollen type (simple, distinctive silhouettes) ──
  POLLEN_SVG: {
    Hasel:    '<path d="M12 2C10 2 8 5 8 8c0 2 1 4 4 4s4-2 4-4c0-3-2-6-4-6z" fill="currentColor" opacity="0.85"/><path d="M11 12v9M9 17l2-2 2 2" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round"/>',
    Erle:     '<ellipse cx="12" cy="8" rx="4" ry="5" fill="currentColor" opacity="0.85"/><path d="M12 13v8M9 18l3-2 3 2" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round"/>',
    Esche:    '<path d="M12 2c-1 0-3 2-3 5s1.5 4 3 4 3-1 3-4-2-5-3-5z" fill="currentColor" opacity="0.85"/><path d="M8 5c-1 1-1 3 0 4M16 5c1 1 1 3 0 4" stroke="currentColor" stroke-width="1" fill="none" stroke-linecap="round"/><path d="M12 11v10" stroke="currentColor" stroke-width="1.2" fill="none"/>',
    Birke:    '<path d="M10 3c0 0-3 3-3 6s2 5 5 5 5-2 5-5-2-6-2-6" fill="currentColor" opacity="0.85"/><path d="M12 14v8" stroke="currentColor" stroke-width="1.2" fill="none"/><circle cx="9" cy="7" r="0.7" fill="var(--pollen-bg, #222)"/><circle cx="13" cy="5" r="0.7" fill="var(--pollen-bg, #222)"/>',
    Graeser:  '<path d="M12 22V10M12 10C12 6 9 3 7 2M12 10C12 6 15 3 17 2M12 14C10 12 7 11 5 11M12 14C14 12 17 11 19 11" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round"/>',
    Roggen:   '<path d="M12 22V8M12 8l-1-3 1-3 1 3z" stroke="currentColor" stroke-width="1.2" fill="currentColor" stroke-linecap="round"/><path d="M10 12l-3-1M14 12l3-1M10 16l-3-1M14 16l3-1" stroke="currentColor" stroke-width="1.1" fill="none" stroke-linecap="round"/>',
    Beifuss:  '<path d="M12 22V6" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M12 6C10 6 7 8 7 10c0 1.5 2 2.5 5 2.5s5-1 5-2.5C17 8 14 6 12 6z" fill="currentColor" opacity="0.85"/><path d="M9 14c-1 1-2 3-1 4M15 14c1 1 2 3 1 4" stroke="currentColor" stroke-width="1" fill="none" stroke-linecap="round"/>',
    Ambrosia: '<circle cx="12" cy="9" r="5" fill="currentColor" opacity="0.8"/><path d="M12 14v8" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M8 7l-2-2M16 7l2-2M7 11l-2 1M17 11l2 1M9 5l-1-3M15 5l1-3" stroke="currentColor" stroke-width="1" fill="none" stroke-linecap="round"/>',
  },

  // ── defaults ──────────────────────────────────────────
  defaults: {
    updateInterval: 60 * 60 * 1000,   // 1 hour
    fadeSpeed: 2000,
    DWD_region: 92,                     // Rhein-Main
    displayMode: "visual",              // "number" | "icon" | "visual"
    pollenList: "Hasel,Erle,Esche,Birke,Graeser,Roggen,Beifuss,Ambrosia",
    showNullValue: false,
  },

  // ── lifecycle ─────────────────────────────────────────
  start() {
    this.loaded = false;
    this.pollenFilter = new Set(
      this.config.pollenList.split(",").map((s) => s.trim()),
    );
    this.getData();
    this.scheduleUpdate();
  },

  getStyles() {
    return ["MMM-DWD-Pollen.css"];
  },

  scheduleUpdate() {
    setInterval(() => this.getData(), this.config.updateInterval);
  },

  getData() {
    this.sendSocketNotification("DWD_POLLEN_REQUEST");
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "DWD_POLLEN_RESULT") {
      this.result = payload;
      this.errorMessage = null;
      this.loaded = true;
      this.updateDom(this.config.fadeSpeed);
    } else if (notification === "DWD_POLLEN_ERROR") {
      this.errorMessage = payload;
      this.updateDom(this.config.fadeSpeed);
    }
  },

  // ── helpers ───────────────────────────────────────────

  /** Parse DWD timestamp "2025-03-22 11:00 Uhr" → Date at midnight */
  _parseTimestamp(str) {
    if (!str) return null;
    const clean = str.replace(" Uhr", "").trim();
    const d = new Date(clean);
    return isNaN(d.getTime()) ? null : d;
  },

  /** Get date string YYYY-MM-DD for reliable comparison */
  _dateKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  },

  /** Resolve which DWD fields map to the three display columns.
   *  DWD data might be from today or yesterday; we shift accordingly. */
  _resolveColumns(lastUpdate) {
    const now = new Date();
    const todayKey = this._dateKey(now);
    const updateKey = lastUpdate ? this._dateKey(lastUpdate) : todayKey;

    if (updateKey === todayKey) {
      return { col1: "today", col2: "tomorrow", col3: "dayafter_to" };
    }
    // Data is from yesterday → shift everything one day forward
    return { col1: "tomorrow", col2: "dayafter_to", col3: null };
  },

  /** Look up severity info, with safe fallback */
  _sev(value) {
    return this.SEVERITY[value] || { n: -1, label: "–", cls: "nodata", hue: -1 };
  },

  // ── DOM generation ────────────────────────────────────

  getDom() {
    const wrapper = document.createElement("div");
    wrapper.className = "dwd-pollen";

    // Loading state
    if (!this.loaded) {
      wrapper.innerHTML = this.translate("LOADING");
      wrapper.className += " dimmed light small";
      return wrapper;
    }

    // Error state
    if (this.errorMessage) {
      wrapper.innerHTML = `<span class="dwd-pollen-error">⚠ ${this.errorMessage}</span>`;
      return wrapper;
    }

    if (!this.result || !this.result.content) {
      wrapper.innerHTML = '<span class="dwd-pollen-error">Keine Daten</span>';
      return wrapper;
    }

    // Find matching region
    const regionId = this.config.DWD_region;
    const regionData = this.result.content.find(
      (r) => r.partregion_id === regionId ||
             (r.region_id === regionId && r.partregion_id === -1),
    );

    if (!regionData) {
      wrapper.innerHTML = '<span class="dwd-pollen-error">Region nicht gefunden</span>';
      return wrapper;
    }

    const lastUpdate = this._parseTimestamp(this.result.last_update);
    const cols = this._resolveColumns(lastUpdate);

    // Filter pollen types that the user wants AND that have data
    const rows = this.POLLEN_TYPES.filter((name) => {
      if (!this.pollenFilter.has(name)) return false;
      const p = regionData.Pollen[name];
      if (!p) return false;
      if (this.config.showNullValue) return true;
      return p.today !== "0" || p.tomorrow !== "0" || p.dayafter_to !== "0";
    });

    if (rows.length === 0) {
      wrapper.innerHTML = '<span class="dwd-pollen-nodata">Keine Pollenbelastung</span>';
      return wrapper;
    }

    const mode = this.config.displayMode;
    if (mode === "visual") {
      return this._buildVisual(wrapper, rows, regionData, cols);
    }
    return this._buildTable(wrapper, rows, regionData, cols, mode);
  },

  // ── TABLE mode (number + icon) ────────────────────────

  _buildTable(wrapper, rows, regionData, cols, mode) {
    const tbl = document.createElement("table");
    tbl.className = "dwd-pollen-table";

    // Header
    const labels = ["", "Heute", "Morgen", "Übermorgen"];
    const thead = document.createElement("tr");
    labels.forEach((text, i) => {
      const th = document.createElement("th");
      th.textContent = text;
      if (i > 0) th.className = "dwd-center";
      thead.appendChild(th);
    });
    tbl.appendChild(thead);

    // Rows
    rows.forEach((name) => {
      const pollen = regionData.Pollen[name];
      const tr = document.createElement("tr");

      // Name cell
      const tdName = document.createElement("td");
      tdName.className = "dwd-pollen-name";
      tdName.textContent = this.DISPLAY_NAMES[name] || name;
      tr.appendChild(tdName);

      // Three value cells
      [cols.col1, cols.col2, cols.col3].forEach((field) => {
        const td = document.createElement("td");
        td.className = "dwd-center";
        const val = field ? (pollen[field] || "-") : "-";
        const sev = this._sev(val);

        if (mode === "icon") {
          td.innerHTML = this._renderStars(sev);
        } else {
          td.textContent = val;
        }
        td.classList.add(`dwd-sev-${sev.cls}`);
        tr.appendChild(td);
      });

      tbl.appendChild(tr);
    });

    wrapper.appendChild(tbl);
    return wrapper;
  },

  _renderStars(sev) {
    if (sev.n < 0) return "";
    const full = Math.floor(sev.n);
    const half = sev.n % 1 >= 0.5 ? 1 : 0;
    let html = "";
    for (let i = 0; i < full; i++) html += '<span class="fa fa-star"></span>';
    if (half) html += '<span class="fa fa-star-half-o"></span>';
    if (full === 0 && half === 0) html += '<span class="fa fa-star-o"></span>';
    return html;
  },

  // ── VISUAL mode ───────────────────────────────────────

  _buildVisual(wrapper, rows, regionData, cols) {
    wrapper.classList.add("dwd-visual");

    // Day column headers
    const dayLabels = ["Heute", "Morgen", "Überm."];
    const header = document.createElement("div");
    header.className = "dwd-vis-header";
    // spacer for icon + name
    header.innerHTML = '<span class="dwd-vis-label-spacer"></span>';
    dayLabels.forEach((label) => {
      const span = document.createElement("span");
      span.className = "dwd-vis-day";
      span.textContent = label;
      header.appendChild(span);
    });
    wrapper.appendChild(header);

    rows.forEach((name) => {
      const pollen = regionData.Pollen[name];
      const row = document.createElement("div");
      row.className = "dwd-vis-row";

      // Icon + name block
      const nameBlock = document.createElement("div");
      nameBlock.className = "dwd-vis-name";

      const svgStr = this.POLLEN_SVG[name] || "";
      const icon = document.createElement("span");
      icon.className = "dwd-vis-icon";
      icon.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg">${svgStr}</svg>`;
      nameBlock.appendChild(icon);

      const label = document.createElement("span");
      label.className = "dwd-vis-label";
      label.textContent = this.DISPLAY_NAMES[name] || name;
      nameBlock.appendChild(label);
      row.appendChild(nameBlock);

      // Three severity cells
      const cells = document.createElement("div");
      cells.className = "dwd-vis-cells";

      [cols.col1, cols.col2, cols.col3].forEach((field) => {
        const val = field ? (pollen[field] || "-") : "-";
        const sev = this._sev(val);

        const cell = document.createElement("div");
        cell.className = `dwd-vis-cell dwd-sev-${sev.cls}`;
        cell.setAttribute("data-level", String(sev.n));
        cell.title = sev.label;

        // Inner bar that fills proportionally
        if (sev.n >= 0) {
          const bar = document.createElement("div");
          bar.className = "dwd-vis-bar";
          bar.style.width = `${Math.round((sev.n / 3) * 100)}%`;
          cell.appendChild(bar);

          const num = document.createElement("span");
          num.className = "dwd-vis-num";
          num.textContent = val;
          cell.appendChild(num);
        } else {
          cell.innerHTML = '<span class="dwd-vis-num dwd-nodata-text">–</span>';
        }

        cells.appendChild(cell);
      });

      row.appendChild(cells);
      wrapper.appendChild(row);
    });

    return wrapper;
  },
});
