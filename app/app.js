// Leonida Trophy Guide — front-end logic (vanilla JS, no dependencies).
// State: earned trophies persist in localStorage only. Nothing is sent
// anywhere; the app is fully offline. Query params for deep links:
//   ?grade=Silver | ?category=Story | ?q=bank | ?view=roadmap
//   ?spoilers=1 (show hidden-trophy details) | ?demo=1 (pre-check story trophies)

(function () {
  "use strict";

  var STORE_KEY = "leonida-trophy-guide-v2-earned";
  var DEMO_EARNED = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 16, 21, 22, 26, 42, 53];

  var ROADMAP = [
    {
      title: "Step 1 — Story + key side activities",
      hours: "60–80 hours",
      body: "Play through all five chapters with Jason and Lucia. No Gold Medals are needed in story missions. After the mission Down to Earth, find Lucia at Jason's house in the morning and accept her meditation invitation on the balcony — the only potentially missable trophy moment. Scan vehicles and study animals with binoculars from the start: you will need 200 base-model vehicles and 100 animal species later."
    },
    {
      title: "Step 2 — 100% completion",
      hours: "Around 100 hours",
      body: "Open Progress > Stats > 100% Completion after the story. Finish the robberies (39 Gang Operations, 22 Bank Jobs, 7 Payday Loan Jobs, 8 bank vaults), 100 optional tasks, collectibles (15 card sets, 100 WAiNK locations, 33 underwater discoveries, 100 Cocaine Flamingos), 42 Shooting Range Gold Medals, 42 Drone Time Trials, 300 stunts, 70 of 80 Challenges and all 15 of Bret's Target Decks."
    },
    {
      title: "Step 3 — Strangers & Freaks + cleanup",
      hours: "10–20 hours",
      body: "Finish the final missions for Andy, Kenton, Billy, Randy and Tyrone, complete eight qualifying Strangers & Freaks strands, finish the remaining meditation spots for Positive Mental Attitude, then earn any outstanding combat, driving, robbery or miscellaneous trophies. Check your trophy list — Vice Got a Price! pops last."
    }
  ];

  function loadEarned() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function saveEarned(map) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(map)); } catch (e) { /* storage unavailable; tracker just won't persist */ }
  }

  var params = new URLSearchParams(window.location.search);
  var earned = loadEarned();
  if (params.get("demo") === "1") {
    DEMO_EARNED.forEach(function (id) { earned[id] = true; });
  }

  var listEl = document.getElementById("trophyList");
  var countEl = document.getElementById("count");
  var progressFill = document.getElementById("progressFill");
  var progressText = document.getElementById("progressText");
  var statsEl = document.getElementById("stats");
  var searchEl = document.getElementById("search");
  var gradeEl = document.getElementById("gradeFilter");
  var categoryEl = document.getElementById("categoryFilter");
  var statusEl = document.getElementById("statusFilter");
  var hideEarnedEl = document.getElementById("hideEarned");
  var hideSpoilersEl = document.getElementById("hideSpoilers");
  var resetBtn = document.getElementById("resetBtn");

  // Deep-link params pre-set the filters.
  if (params.get("grade")) gradeEl.value = params.get("grade");
  if (params.get("category")) categoryEl.value = params.get("category");
  if (params.get("q")) searchEl.value = params.get("q");
  if (params.get("spoilers") === "1") hideSpoilersEl.checked = false;

  // Per-trophy spoiler reveal state (only matters while spoilers are hidden).
  var revealed = {};

  function gradeCount(grade) {
    return TROPHIES.filter(function (t) { return t.grade === grade; }).length;
  }

  function renderStats() {
    var total = TROPHIES.length;
    var done = TROPHIES.filter(function (t) { return earned[t.id]; }).length;
    var pct = total ? Math.round((done / total) * 100) : 0;
    statsEl.innerHTML =
      '<span class="stat"><b>' + total + '</b> trophies</span>' +
      '<span class="stat platinum"><b>' + gradeCount("Platinum") + '</b> Platinum</span>' +
      '<span class="stat gold"><b>' + gradeCount("Gold") + '</b> Gold</span>' +
      '<span class="stat silver"><b>' + gradeCount("Silver") + '</b> Silver</span>' +
      '<span class="stat bronze"><b>' + gradeCount("Bronze") + '</b> Bronze</span>' +
      '<span class="stat"><b>' + done + '</b> earned</span>';
    progressFill.style.width = pct + "%";
    progressText.textContent = done + " / " + total + " earned · " + pct + "%";
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function matches(t) {
    var q = searchEl.value.trim().toLowerCase();
    if (q) {
      var hay = (t.name + " " + t.desc + " " + t.tip + " " + t.category).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    if (gradeEl.value && t.grade !== gradeEl.value) return false;
    if (categoryEl.value && t.category !== categoryEl.value) return false;
    if (statusEl.value && t.status !== statusEl.value) return false;
    if (hideEarnedEl.checked && earned[t.id]) return false;
    return true;
  }

  function renderList() {
    var hideSpoilers = hideSpoilersEl.checked;
    var visible = TROPHIES.filter(matches);
    countEl.textContent = "Showing " + visible.length + " of " + TROPHIES.length + " trophies";
    if (visible.length === 0) {
      listEl.innerHTML = '<li class="empty">No trophies match your filters. Clear the search or filters to see the full list.</li>';
      return;
    }
    listEl.innerHTML = visible.map(function (t) {
      var isEarned = !!earned[t.id];
      var masked = hideSpoilers && t.hidden && !revealed[t.id];
      var cls = "trophy" + (isEarned ? " earned" : "") + (masked ? " spoiler-hidden" : "");
      var badges = '<span class="badge ' + t.grade + '">' + t.grade + '</span>' +
        '<span class="badge cat">' + escapeHtml(t.category) + '</span>' +
        '<span class="badge diff">' + escapeHtml(t.difficulty) + '</span>' +
        (t.status === "unconfirmed" ? '<span class="badge unconfirmed">Unconfirmed</span>' : "") +
        (t.id === 28 ? '<span class="badge missable">Potentially missable</span>' : "");
      var revealBtn = masked
        ? '<button type="button" class="spoiler-reveal" data-reveal="' + t.id + '">Reveal spoiler</button>'
        : "";
      return '<li class="' + cls + '" data-id="' + t.id + '">' +
        '<input type="checkbox" data-check="' + t.id + '"' + (isEarned ? " checked" : "") + ' aria-label="Mark ' + escapeHtml(t.name) + ' as earned">' +
        '<div class="t-body">' +
        '<div class="t-top"><span class="t-name">' + escapeHtml(t.name) + '</span>' + badges + '</div>' +
        '<p class="t-desc">' + escapeHtml(t.desc) + '</p>' +
        '<p class="t-tip"><b>How to:</b> ' + escapeHtml(t.tip) + '</p>' +
        revealBtn +
        '</div></li>';
    }).join("");
  }

  function renderRoadmap() {
    document.getElementById("roadmapGrid").innerHTML = ROADMAP.map(function (s) {
      return '<div class="step"><p class="hours">' + escapeHtml(s.hours) + '</p><h3>' + escapeHtml(s.title) + '</h3><p>' + escapeHtml(s.body) + '</p></div>';
    }).join("");
  }

  function renderAll() {
    renderStats();
    renderList();
  }

  listEl.addEventListener("change", function (ev) {
    var id = ev.target.getAttribute("data-check");
    if (!id) return;
    if (ev.target.checked) earned[id] = true; else delete earned[id];
    saveEarned(earned);
    renderAll();
  });

  listEl.addEventListener("click", function (ev) {
    var id = ev.target.getAttribute("data-reveal");
    if (!id) return;
    revealed[id] = true;
    renderList();
  });

  [searchEl, gradeEl, categoryEl, statusEl, hideEarnedEl, hideSpoilersEl].forEach(function (el) {
    el.addEventListener("input", renderList);
    el.addEventListener("change", renderList);
  });

  resetBtn.addEventListener("click", function () {
    if (!window.confirm("Reset all tracked progress? This clears every checked trophy.")) return;
    earned = {};
    saveEarned(earned);
    renderAll();
  });

  // Tabs.
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  function showView(name) {
    tabs.forEach(function (tab) {
      tab.classList.toggle("active", tab.getAttribute("data-view") === name);
    });
    ["checklist", "roadmap", "completion"].forEach(function (v) {
      document.getElementById("view-" + v).classList.toggle("hidden", v !== name);
    });
  }
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () { showView(tab.getAttribute("data-view")); });
  });
  if (params.get("view") === "roadmap" || params.get("view") === "completion") {
    showView(params.get("view"));
  }

  renderRoadmap();
  renderAll();
})();
