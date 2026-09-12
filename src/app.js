"use strict";

// ===========================================================================
// Lab Ledger - renderer
//
// Everything lives in one local state object, saved to a JSON file by the
// Electron side (or to localStorage in the browser demo). Money rules:
//
//   material cost of a work type = sum(qty x packCost / pieces) over its bom
//   cost    of a row = units x material cost
//   revenue of a row = units x list price, and ZERO for a redo
//   margin  of a row = revenue - cost      (a redo is therefore minus the material)
//
// ===========================================================================

let state = { works: [], config: null };
let editId = null;                 // work being edited (null = new)
let editClientId = null;
let bomTypeId = null;              // work type whose materials are being edited
const selected = new Set();        // ids of works ticked in the list
let visibleIds = [];               // ids currently passing the filters
const charts = {};                 // Chart.js instances by canvas id
let appInfo = { version: "", apiVersion: "", dataPath: "" };

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const Auth = window.LLAuth;
const AUTHOR_URL = "https://www.vladpereverzyev.com";
const LICENSE_NAME = "Business Source License 1.1";
const LICENSE_URL = "https://github.com/vladpereverzyev/lab-ledger/blob/main/LICENSE";
const COST_CATEGORIES = ["property", "energy", "insurance", "accounting", "staff", "other"];

// ===========================================================================
// i18n
// ===========================================================================
const LOCALES = window.LOCALES;
const LANGS = window.LANGS;

function currentLang() {
  try { const l = localStorage.getItem("lang"); return LANGS.includes(l) ? l : "en"; }
  catch (_) { return "en"; }
}
function t(k) { const l = currentLang(); return (LOCALES[l] && LOCALES[l][k]) || LOCALES.en[k] || k; }
function months() { return (LOCALES[currentLang()] || LOCALES.en).months; }
function monthsShort() { return (LOCALES[currentLang()] || LOCALES.en).months_short; }

function applyI18n() {
  $$("[data-i18n]").forEach((el) => { el.textContent = t(el.getAttribute("data-i18n")); });
  $$("[data-i18n-ph]").forEach((el) => { el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph"))); });
  $$("[data-i18n-title]").forEach((el) => { el.setAttribute("title", t(el.getAttribute("data-i18n-title"))); });
  const lb = $("#btnLang"); if (lb) lb.textContent = currentLang().toUpperCase();
}

// Every control whose label changes with the language gets a fixed width: the
// widest translation across ALL languages. Nothing moves when you switch, and
// nothing is clipped in German or French either - the two that overflow first.
function lockControlWidths() {
  const probe = document.createElement("span");
  probe.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap;left:-9999px;top:0";
  document.body.appendChild(probe);

  const widest = (el, texts) => {
    const cs = getComputedStyle(el);
    probe.style.fontFamily = cs.fontFamily;
    probe.style.fontSize = cs.fontSize;
    probe.style.fontWeight = cs.fontWeight;
    probe.style.letterSpacing = cs.letterSpacing;
    let w = 0;
    texts.forEach((txt) => { probe.textContent = txt; w = Math.max(w, probe.offsetWidth); });
    const box = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) +
      parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);
    return Math.ceil(w + box + 2);
  };

  const inEveryLang = (key) => LANGS.map((l) => (LOCALES[l] && LOCALES[l][key]) || LOCALES.en[key] || key);

  // Every button whose label is translated, not just the ones in the top bar:
  // catalog sections, segmented controls, the small add buttons, the actions in
  // the dialogs. Each gets the width of its widest translation, once.
  // ...except the ones that are meant to fill their container: pinning those to
  // a label width is how a sign-in button ends up floating in the middle of a
  // card.
  $$(".toolbar .lbl[data-i18n]").forEach((el) => {
    el.style.width = widest(el, inEveryLang(el.getAttribute("data-i18n"))) + "px";
  });

  $$("button[data-i18n]:not(.wide)").forEach((el) => {
    if (el.closest("#gate")) return;
    const key = el.getAttribute("data-i18n");
    el.style.width = widest(el, inEveryLang(key)) + "px";
  });

  // A select is as wide as its longest option, plus room for the arrow.
  const SELECTS = {
    "#fYear": ["all_years"],
    "#fMonth": ["all_months"],
    "#fWho": ["everyone"],
    "#fShip": ["ship_all", "ship_shipped", "ship_pending"],
    "#fRedo": ["f_redo_all", "f_redo_only", "f_redo_none"]
  };
  Object.keys(SELECTS).forEach((sel) => {
    const el = $(sel);
    if (!el) return;
    let texts = [];
    SELECTS[sel].forEach((k) => { texts = texts.concat(inEveryLang(k)); });
    if (sel === "#fMonth") LANGS.forEach((l) => { texts = texts.concat(LOCALES[l].months); });
    if (sel === "#fWho") texts = texts.concat(operatorNames());
    const target = el.closest(".dd") || el;
    target.style.width = (widest(el, texts) + 26) + "px";
  });

  // Table headers too: a column is as wide as the wider of its content and its
  // header, so pinning the header to the widest translation takes the language
  // out of the equation for every grid that is not already fixed.
  $$("table.grid:not(.fixed) th[data-i18n]").forEach((th) => {
    const key = th.getAttribute("data-i18n");
    th.style.minWidth = widest(th, inEveryLang(key)) + "px";
  });

  probe.remove();
}

function setLang(l) {
  try { localStorage.setItem("lang", l); } catch (_) {}
  if (state.config) { state.config.lang = l; save(); }
  applyI18n();
  buildFilters();
  renderAll();
}

function cycleLang() {
  setLang(LANGS[(LANGS.indexOf(currentLang()) + 1) % LANGS.length]);
}

// ===========================================================================
// Startup
// ===========================================================================
window.addEventListener("DOMContentLoaded", init);

// Data-file schema version. Bumped only when the on-disk shape changes in a way
// an older app could not read. If a file says it was written by a newer schema,
// this app will not save over it: it would drop what it does not understand.
const SCHEMA_VERSION = 1;
let schemaAhead = false;

async function init() {
  applyTheme(currentTheme());

  const saved = await window.api.loadData();
  state = (saved && !saved.__error && saved.config) ? saved : { works: [], config: clone(window.DEFAULT_CONFIG) };
  schemaAhead = Number((saved && saved.schemaVersion) || 0) > SCHEMA_VERSION;
  ensureConfigShape();
  Auth.ensureUsersShape(state);
  if (!schemaAhead) state.schemaVersion = SCHEMA_VERSION;

  bindUI();
  bindGate();
  applyI18n();
  renderCopyright();
  buildFilters();
  renderAll();

  loadAppInfo();
  openGate();
  if (schemaAhead) setTimeout(() => toast(t("t_schema_ahead")), 400);
}

// Fills in anything an older data file (or the browser demo) does not carry,
// and converts a v1 catalog - hand-typed material costs, no ids - to the
// current shape without losing a single number.
function ensureConfigShape() {
  const d = window.DEFAULT_CONFIG;
  const c = state.config = state.config || {};

  c.operators = c.operators || clone(d.operators);
  c.clients = c.clients || clone(d.clients);
  c.materials = c.materials || clone(d.materials);
  c.works = c.works || clone(d.works);
  c.overheads = c.overheads || clone(d.overheads);
  c.couriers = c.couriers || clone(d.couriers);
  c.tax = Object.assign(clone(d.tax), c.tax || {});
  c.calendar = Object.assign(clone(d.calendar), c.calendar || {});
  if (typeof c.autoUpdateCheck !== "boolean") c.autoUpdateCheck = d.autoUpdateCheck;
  c.excel = Object.assign({ enabled: false, path: "" }, c.excel || {});
  // The workbook is written on quit, when the window is gone, so the language
  // it should use has to live in the data file rather than in localStorage.
  c.lang = c.lang || currentLang();

  c.materials.forEach((m) => { if (!m.id) m.id = uid(); });
  c.clients.forEach((cl) => { if (!cl.id) cl.id = uid(); });

  // v1 operators were bare strings. They are records now, so an operator can
  // carry the work types they are set up to make.
  c.operators = c.operators.map((o) =>
    (typeof o === "string" ? { id: uid(), name: o, works: [] } : o));
  c.operators.forEach((o) => {
    if (!o.id) o.id = uid();
    if (!Array.isArray(o.works)) o.works = [];
  });

  // v1 work types: { name, materialCost, listPrice, note }. Re-link them to a
  // material when the default catalog knows the recipe, otherwise keep the old
  // number as a manual cost (workMatCost falls back to it).
  const byName = {};
  d.works.forEach((w) => { byName[w.name] = w; });
  c.works.forEach((w) => {
    if (!w.id) w.id = uid();
    if (!Array.isArray(w.bom)) {
      const def = byName[w.name];
      const legacy = Number(w.materialCost) || 0;
      if (def && Math.abs(bomCost(def.bom, d.materials) - legacy) < 0.01) {
        w.bom = clone(def.bom);
        delete w.materialCost;
      } else {
        w.bom = [];
        w.materialCost = legacy;
      }
    }
  });

  state.works = state.works || [];
  state.works.forEach((w) => {
    if (!w.id) w.id = uid();
    if (typeof w.patient !== "string") w.patient = "";
    if (typeof w.shipped !== "boolean") w.shipped = false;
    // Everything recorded before the split was already finished work.
    if (w.status !== "in" && w.status !== "out") w.status = "out";
  });
}

function operatorNames() { return state.config.operators.map((o) => o.name); }
function operatorByName(n) { return state.config.operators.find((o) => o.name === n); }

// Operators who are set up for this work type come first; one with nothing
// assigned can do anything, which is the right default for a one-man lab.
function operatorsFor(workName) {
  const wt = state.config.works.find((w) => w.name === workName);
  const all = state.config.operators;
  if (!wt) return all.map((o) => o.name);
  const able = all.filter((o) => !o.works.length || o.works.includes(wt.id));
  const rest = all.filter((o) => o.works.length && !o.works.includes(wt.id));
  return able.concat(rest).map((o) => o.name);
}


// On a narrow screen a twelve-column table is unreadable, so each row becomes a
// stacked card - and a cell without its header means nothing. Every cell is
// tagged with the text of its column, refreshed whenever a table is redrawn or
// the language changes; the stylesheet prints it in front of the value.
function tagCells(root) {
  const tables = root ? [root] : $$("table.grid");
  tables.forEach((table) => {
    const heads = Array.from(table.querySelectorAll("thead th")).map((th) => th.textContent.trim());
    table.querySelectorAll("tbody tr").forEach((tr) => {
      Array.from(tr.children).forEach((td, i) => {
        if (heads[i]) td.setAttribute("data-label", heads[i]);
        else td.removeAttribute("data-label");
      });
    });
  });
}

// ===========================================================================
// One dropdown for every choice
//
// A native <select> opens a list the operating system draws: square on Windows,
// grey on Linux, nothing like the rounded panel the user menu uses. So the
// select stays as the value holder - every existing handler still listens to
// it - and what you see and click is ours.
// ===========================================================================
function enhanceSelects(root) {
  (root || document).querySelectorAll("select:not([data-dd])").forEach((sel) => {
    sel.dataset.dd = "1";

    const wrap = document.createElement("div");
    wrap.className = "dd " + sel.className;
    sel.parentNode.insertBefore(wrap, sel);
    wrap.appendChild(sel);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dd-btn";

    const panel = document.createElement("div");
    panel.className = "dd-panel";
    panel.hidden = true;

    wrap.appendChild(btn);
    wrap.appendChild(panel);

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (sel.disabled) return;
      const wasOpen = !panel.hidden;
      closeDropdowns();
      if (wasOpen) return;
      panel.innerHTML = "";
      Array.from(sel.options).forEach((o, i) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "dd-item" + (i === sel.selectedIndex ? " on" : "");
        item.textContent = o.text || "\u2014";
        item.addEventListener("click", (ev) => {
          ev.stopPropagation();
          sel.selectedIndex = i;
          panel.hidden = true;
          syncDropdowns();
          sel.dispatchEvent(new Event("input", { bubbles: true }));
          sel.dispatchEvent(new Event("change", { bubbles: true }));
        });
        panel.appendChild(item);
      });
      panel.hidden = false;
      const chosen = panel.querySelector(".dd-item.on");
      if (chosen) chosen.scrollIntoView({ block: "nearest" });
    });

    syncOne(sel);
  });
}

function syncOne(sel) {
  const wrap = sel.closest(".dd");
  if (!wrap) return;
  const btn = wrap.querySelector(".dd-btn");
  const o = sel.options[sel.selectedIndex];
  btn.textContent = o ? o.text : "";
  btn.disabled = sel.disabled;
  btn.title = o ? o.text : "";
}

function syncDropdowns() { $$("select[data-dd]").forEach(syncOne); }

function closeDropdowns() { $$(".dd-panel").forEach((p) => { p.hidden = true; }); }

// Called after anything that rebuilds a select or changes its value.
function refreshDropdowns() {
  enhanceSelects();
  syncDropdowns();
}

function renderAll() {
  renderWorks();
  renderCatalog();
  renderSummary();
  tagCells();
  refreshDropdowns();
}

async function loadAppInfo() {
  if (!window.api.appInfo) return;
  appInfo = (await window.api.appInfo()) || appInfo;
  const v = $("#btnUpdate");
  if (v) v.textContent = "v" + (appInfo.version || "-");
  $("#setVersion").textContent = appInfo.version || "-";
  $("#setApiVersion").textContent = appInfo.apiVersion || "-";
  // The licence names itself here and links to the full text, so a lab can read
  // what it is allowed to do without leaving the app to go looking for it.
  $("#setLicense").innerHTML = `<a href="#" id="licenseLink">${LICENSE_NAME}</a>`;
  $("#licenseLink").addEventListener("click", (e) => {
    e.preventDefault();
    openExternal(LICENSE_URL);
  });
  $("#setDataPath").textContent = appInfo.dataPath || "-";

  if (state.config.autoUpdateCheck && dueForUpdateCheck()) checkUpdates(false);
}

// The app has no browser of its own; links go to the real one.
function openExternal(url) {
  if (window.api && window.api.openExternal) window.api.openExternal(url);
  else window.open(url, "_blank", "noopener");
}

// The notice starts at 2026 and stretches to the current year on its own, so
// nobody has to remember to edit it in January.
function renderCopyright() {
  const year = new Date().getFullYear();
  const span = year > 2026 ? `2026-${year}` : "2026";
  const name = '<a href="#" id="authorLink">Vladyslav Pereverzyev</a>';
  const line = `Copyright © ${span} ${name} · ${LICENSE_NAME}`;
  $("#copyright").innerHTML = line;
  $("#copyrightModal").innerHTML = line;

  $$("#authorLink, #copyrightModal a").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      openExternal(AUTHOR_URL);
    });
  });
}


// ===========================================================================
// The gate: nobody gets to the bench without saying who they are
// ===========================================================================
let demoSignedOut = false;

function openGate() {
  // The demo signs itself in rather than asking a visitor to register an
  // account on a throwaway sample - but only until they sign out on purpose,
  // because the sign-in screen is part of what there is to look at.
  const demo = window.LL_DEMO;
  if (demo && !demoSignedOut) {
    const u = state.users.list.find((x) => x.username === (demo.autoUser || "admin"))
      || state.users.list[0];
    if (u) {
      Auth.signIn(u);
      $("#gate").hidden = true;
      applyPermissions();
      renderAll();
      return;
    }
  }
  if (demo && demo.hint) {
    $("#gateHint").textContent = demo.hint;
    $("#gateHint").hidden = false;
  }
  const first = !Auth.hasAdmin(state);
  $("#gateSetup").hidden = !first;
  $("#gateLogin").hidden = first;
  $("#gateRecovery").hidden = true;
  $("#gateReset").hidden = true;
  $(".gate-card").classList.toggle("setup", first);
  $("#gateBiz").textContent = state.users.business.name || "";
  $("#gateFoot").textContent = $("#copyright").textContent;
  $("#gate").hidden = false;
  setTimeout(() => { (first ? $("#gBiz") : $("#lUser")).focus(); }, 50);
}

function closeGate() {
  $("#gate").hidden = true;
  applyPermissions();
  renderAll();
}

function gateError(sel, key) {
  const el = $(sel);
  el.textContent = t(key);
  el.hidden = false;
}

function bindGate() {
  $("#gCreate").addEventListener("click", createFirstAdmin);
  $("#gLogin").addEventListener("click", doLogin);
  $("#lPass").addEventListener("keydown", (e) => { if (e.key === "Enter") doLogin(); });
  $("#gForgot").addEventListener("click", (e) => { e.preventDefault(); showResetPanel(true); });
  $("#rBack").addEventListener("click", (e) => { e.preventDefault(); showResetPanel(false); });
  $("#gReset").addEventListener("click", resetWithCode);
  $("#rPass2").addEventListener("keydown", (e) => { if (e.key === "Enter") resetWithCode(); });
  $("#gRecDone").addEventListener("click", () => { $("#gateRecovery").hidden = true; closeGate(); });
  $("#btnUser").addEventListener("click", (e) => {
    e.stopPropagation();
    const m = $("#userMenu");
    m.hidden = !m.hidden;
  });
  document.addEventListener("click", (e) => {
    if (!$("#userMenu").hidden && !e.target.closest(".usermenu-wrap")) $("#userMenu").hidden = true;
    if (!e.target.closest(".dd")) closeDropdowns();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { $("#userMenu").hidden = true; closeDropdowns(); }
  });
  // Switching account and signing out land in the same place - the sign-in
  // screen - which is the honest way to say it.
  [$("#miSwitch"), $("#miLogout")].forEach((b) => b.addEventListener("click", () => {
    $("#userMenu").hidden = true;
    demoSignedOut = true;
    Auth.logAction(state, "act_logout");
    Auth.signOut();
    save();
    openGate();
  }));
  $("#btnNewUser").addEventListener("click", openUserModal);
  $("#uCancel").addEventListener("click", () => { $("#userModal").hidden = true; });
  $("#uSave").addEventListener("click", saveNewUser);
}

async function createFirstAdmin() {
  $("#gSetupError").hidden = true;
  const f = {
    firstName: $("#gFirst").value.trim(),
    lastName: $("#gLast").value.trim(),
    username: $("#gUser").value.trim()
  };
  const pw = $("#gPass").value, pw2 = $("#gPass2").value;
  if (!$("#gBiz").value.trim() || !f.firstName || !f.username || !pw) return gateError("#gSetupError", "auth_required");
  if (pw.length < 6) return gateError("#gSetupError", "auth_pwshort");
  if (pw !== pw2) return gateError("#gSetupError", "auth_pwmismatch");

  state.users.business = {
    name: $("#gBiz").value.trim(), vat: $("#gVat").value.trim(),
    phone: $("#gPhone").value.trim(), address: $("#gAddr").value.trim(),
    email: $("#gEmail").value.trim()
  };
  const admin = await Auth.makeUser("admin", f, pw);
  state.users.list.push(admin);
  Auth.signIn(admin);
  Auth.logAction(state, "act_login");
  save();
  await issueRecovery();
}

// Makes a code, keeps its hash in the data file and its clear text next to it,
// and puts it on screen once. The panel is the last thing between setting the
// lab up and using it, so it is read rather than clicked past.
async function issueRecovery() {
  const code = Auth.makeRecoveryCode();
  state.users.recovery = await Auth.makeRecovery(code);
  save();
  if (window.api.saveRecovery) {
    await window.api.saveRecovery({ code, business: state.users.business.name || "" });
  }
  $("#gRecCode").textContent = code;
  $("#gateSetup").hidden = true;
  $("#gateLogin").hidden = true;
  $("#gateReset").hidden = true;
  $("#gateRecovery").hidden = false;
  $(".gate-card").classList.remove("setup");
  $("#gate").hidden = false;
}

// The administrator can read the code back without hunting for a file - to
// print it again, or to read it out to whoever is on the phone.
async function showRecoveryInSettings(user) {
  const row = $("#kvRecovery");
  if (!row) return;
  const admin = user && user.role === "admin";
  row.hidden = !admin;
  if (!admin || !window.api.readRecovery) return;
  const r = await window.api.readRecovery();
  $("#setRecovery").textContent = (r && r.ok && r.code) ? r.code : "-";
}

function showResetPanel(show) {
  $("#gResetError").hidden = true;
  $("#rCode").value = ""; $("#rPass").value = ""; $("#rPass2").value = "";
  $("#gateLogin").hidden = show;
  $("#gateReset").hidden = !show;
  if (show) setTimeout(() => $("#rCode").focus(), 50);
}

// The code replaces the administrator password, and nothing else: an operator
// who forgets theirs still goes to the administrator, which is the point of
// having one.
async function resetWithCode() {
  $("#gResetError").hidden = true;
  const pw = $("#rPass").value, pw2 = $("#rPass2").value;
  if (!$("#rCode").value.trim() || !pw) return gateError("#gResetError", "auth_required");
  if (pw.length < 6) return gateError("#gResetError", "auth_pwshort");
  if (pw !== pw2) return gateError("#gResetError", "auth_pwmismatch");
  if (!(await Auth.checkRecovery(state.users.recovery, $("#rCode").value))) {
    return gateError("#gResetError", "rec_bad");
  }
  const admin = state.users.list.find((u) => u.role === "admin");
  if (!admin) return gateError("#gResetError", "rec_bad");
  await Auth.setPassword(admin, pw);
  Auth.signIn(admin);
  Auth.logAction(state, "act_recovery");
  save();
  showResetPanel(false);
  closeGate();
}

async function doLogin() {
  $("#gLoginError").hidden = true;
  const name = $("#lUser").value.trim().toLowerCase();
  const pw = $("#lPass").value;
  const user = state.users.list.find((u) => u.username === name);
  if (!user || !(await Auth.checkPassword(user, pw))) return gateError("#gLoginError", "auth_wrong");
  $("#lPass").value = "";
  Auth.signIn(user);
  Auth.logAction(state, "act_login");
  save();
  // A lab that was set up before recovery codes existed gets one the first
  // time its administrator signs in, rather than finding out it has none on
  // the day it needs one.
  if (user.role === "admin" && !state.users.recovery) return issueRecovery();
  closeGate();
}

// Permissions are applied as classes on <body>; the stylesheet does the hiding,
// so a new control is covered by the rule rather than by another if in here.
function applyPermissions() {
  const u = Auth.currentUser();
  const b = document.body;
  showRecoveryInSettings(u);
  b.classList.toggle("no-money", !Auth.can("viewMoney"));
  b.classList.toggle("no-editworks", !Auth.can("editWorks"));
  b.classList.toggle("no-delworks", !Auth.can("delWorks"));
  b.classList.toggle("no-editcatalog", !Auth.can("editCatalog"));
  b.classList.toggle("no-export", !Auth.can("export"));
  b.classList.toggle("not-admin", !Auth.isAdmin());

  const chip = $("#btnUser");
  chip.hidden = !u;
  if (u) {
    const name = Auth.displayName(u);
    const role = t(u.role === "admin" ? "role_admin" : "role_operator");
    chip.textContent = name.split(/\s+/).slice(0, 2).map((w) => w[0] || "").join("").toUpperCase();
    chip.title = name + " - " + role;
    // Just the name. Who else would be signed in, and the role is already
    // visible in what the app does or does not let you touch.
    $("#userMenuHead").textContent = name;
  }
  // An operator who cannot see the money has no use for the summary tab.
  const tab = $('[data-view="summary"]');
  tab.hidden = !Auth.can("viewMoney");
  if (tab.hidden && tab.classList.contains("active")) $('[data-view="works"]').click();
}

// ---------------------------------------------------------------- users ----
function renderUsers() {
  const body = $("#usersBody");
  if (!body) return;
  body.innerHTML = "";
  state.users.list.forEach((u) => {
    const perms = u.role === "admin"
      ? t("op_all")
      : Auth.PERMISSIONS.filter((k) => u.can && u.can[k]).map((k) => t("perm_" + k.toLowerCase())).join(", ");
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(Auth.displayName(u))}</td>
      <td class="muted">${escapeHtml(u.username)}</td>
      <td>${escapeHtml(t(u.role === "admin" ? "role_admin" : "role_operator"))}</td>
      <td class="muted">${escapeHtml(perms || "-")}</td>
      <td class="center">${u.role === "admin" ? "" : '<button class="btn icon danger" title="Delete">&#10005;</button>'}</td>`;
    const del = tr.querySelector("button");
    if (del) del.addEventListener("click", () => {
      if (!confirm(t("confirm_delrow"))) return;
      state.users.list = state.users.list.filter((x) => x.id !== u.id);
      Auth.logAction(state, "act_user", u.username);
      save(); renderUsers();
    });
    body.appendChild(tr);
  });
}

function openUserModal() {
  $("#uFirst").value = ""; $("#uLast").value = "";
  $("#uUser").value = ""; $("#uPass").value = "";
  $("#uError").hidden = true;
  $("#uPerms").innerHTML = Auth.PERMISSIONS.map((k) =>
    `<label class="switch"><input type="checkbox" data-perm="${k}"${k === "editWorks" ? " checked" : ""} />` +
    `<span>${escapeHtml(t("perm_" + k.toLowerCase()))}</span></label>`).join("");
  $("#userModal").hidden = false;
  $("#uFirst").focus();
}

async function saveNewUser() {
  $("#uError").hidden = true;
  const f = {
    firstName: $("#uFirst").value.trim(),
    lastName: $("#uLast").value.trim(),
    username: $("#uUser").value.trim(),
    can: {}
  };
  $("#uPerms").querySelectorAll("input").forEach((b) => { f.can[b.dataset.perm] = b.checked; });
  const pw = $("#uPass").value;
  if (!f.firstName || !f.username || !pw) { $("#uError").textContent = t("auth_required"); $("#uError").hidden = false; return; }
  if (pw.length < 6) { $("#uError").textContent = t("auth_pwshort"); $("#uError").hidden = false; return; }
  if (state.users.list.some((u) => u.username === f.username.toLowerCase())) {
    $("#uError").textContent = t("auth_taken"); $("#uError").hidden = false; return;
  }
  state.users.list.push(await Auth.makeUser("operator", f, pw));
  Auth.logAction(state, "act_user", f.username);
  save();
  $("#userModal").hidden = true;
  renderUsers();
  toast(t("t_usersaved"));
}

// --------------------------------------------------------------- history ---
function renderHistory() {
  const body = $("#historyBody");
  if (!body) return;
  const rows = state.history || [];
  $("#historyEmpty").hidden = rows.length !== 0;
  body.innerHTML = rows.slice(0, 400).map((h) =>
    `<tr><td class="muted">${escapeHtml(h.at.slice(0, 16).replace("T", " "))}</td>` +
    `<td>${escapeHtml(h.who)}</td>` +
    `<td>${escapeHtml(t(h.action))}</td>` +
    `<td class="muted">${escapeHtml(h.detail || "")}</td></tr>`).join("");
}

// ===========================================================================
// Theme
// ===========================================================================
function currentTheme() {
  try { const v = localStorage.getItem("theme"); return (v === "light" || v === "dark") ? v : "light"; }
  catch (_) { return "light"; }
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const btn = $("#btnTheme");
  if (btn) btn.textContent = theme === "dark" ? "◑" : "◐";
}

function cycleTheme() {
  const next = currentTheme() === "light" ? "dark" : "light";
  try { localStorage.setItem("theme", next); } catch (_) {}
  applyTheme(next);
  renderSummary();               // charts pick their colours from the theme
}

// ===========================================================================
// Persistence
// ===========================================================================
let saveTimer = null;
function save() {
  // Never write over a file a newer version of the app saved: it would drop the
  // fields this version does not know about.
  if (schemaAhead) { toast(t("t_schema_ahead")); return; }
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    const res = await window.api.saveData(state);
    if (res && !res.ok) toast(t("t_saveerror") + res.error);
  }, 250);
}

// ===========================================================================
// UI binding
// ===========================================================================
function bindUI() {
  $("#tabs").addEventListener("click", (e) => {
    const b = e.target.closest(".tab");
    if (!b) return;
    $$(".tab").forEach((x) => x.classList.remove("active"));
    $$(".view").forEach((v) => v.classList.remove("active"));
    b.classList.add("active");
    $("#view-" + b.dataset.view).classList.add("active");
    if (b.dataset.view === "summary") renderSummary();
  });

  $("#catPills").addEventListener("click", (e) => {
    const b = e.target.closest(".pill");
    if (!b) return;
    $$(".pill").forEach((x) => x.classList.remove("active"));
    $$(".cat-sec").forEach((s) => s.classList.remove("active"));
    b.classList.add("active");
    $("#sec-" + b.dataset.sec).classList.add("active");
  });

  ["#search", "#fYear", "#fMonth", "#fWho", "#fShip", "#fRedo"].forEach((s) =>
    $(s).addEventListener("input", renderWorks));
  bindSegmented("#workSec", () => { selected.clear(); renderWorks(); });
  // The totals live in their own box so they stay put while the rows scroll
  // vertically; sideways they have to follow, or they would stop lining up.
  $("#view-works .table-wrap").addEventListener("scroll", () => {
    $("#totalsWrap").scrollLeft = $("#view-works .table-wrap").scrollLeft;
  });

  $("#selAll").addEventListener("change", () => {
    if ($("#selAll").checked) visibleIds.forEach((id) => selected.add(id));
    else selected.clear();
    renderWorks();
  });
  $("#btnClearSel").addEventListener("click", clearSelection);
  $("#btnShipSelected").addEventListener("click", openShipModal);
  $("#btnMarkDone").addEventListener("click", markSelectedDone);
  $("#sCancel").addEventListener("click", () => { $("#shipModal").hidden = true; });
  $("#sSave").addEventListener("click", saveShipTogether);
  $("#shipModal").addEventListener("click", (e) => { if (e.target.id === "shipModal") $("#shipModal").hidden = true; });

  $("#btnNewWork").addEventListener("click", () => openWorkModal(null));
  $("#mCancel").addEventListener("click", closeWorkModal);
  $("#mSave").addEventListener("click", saveWork);
  $("#workModal").addEventListener("click", (e) => { if (e.target.id === "workModal") closeWorkModal(); });
  $("#mRedo").addEventListener("change", syncRedoHint);
  $("#mShipped").addEventListener("change", syncShippingFields);

  $("#btnExportXlsx").addEventListener("click", exportExcel);
  $("#btnImportXlsx").addEventListener("click", importExcel);
  $("#btnExportJson").addEventListener("click", async () => {
    const r = await window.api.exportJson(state);
    if (r && r.ok) toast(t("t_backupsaved"));
  });
  $("#btnImportJson").addEventListener("click", importBackup);

  $("#btnTheme").addEventListener("click", cycleTheme);
  $("#btnLang").addEventListener("click", cycleLang);
  $("#btnUpdate").addEventListener("click", () => checkUpdates(true));
  $("#updClose").addEventListener("click", () => { $("#updateModal").hidden = true; });
  // Ticks from the main process while a release comes down, one per percent.
  if (window.api && window.api.onUpdateProgress) {
    window.api.onUpdateProgress((p) => {
      if ($("#updateModal").hidden) return;
      $("#updateState").textContent = t("update_downloading") + " " + p.pct + "%";
    });
  }
  $("#updateModal").addEventListener("click", (e) => { if (e.target.id === "updateModal") $("#updateModal").hidden = true; });

  $("#rYear").addEventListener("change", renderSummary);

  $("#btnNewClient").addEventListener("click", () => openClientModal(null));
  $("#cCancel").addEventListener("click", closeClientModal);
  $("#cSave").addEventListener("click", saveClient);
  $("#clientModal").addEventListener("click", (e) => { if (e.target.id === "clientModal") closeClientModal(); });

  $("#btnNewType").addEventListener("click", () => {
    state.config.works.push({ id: uid(), name: t("def_newwork"), listPrice: 0, bom: [] });
    save(); renderTypes();
  });
  $("#btnNewMaterial").addEventListener("click", () => {
    state.config.materials.push({ id: uid(), name: t("def_newmaterial"), packCost: 0, pieces: 1, unit: "piece", note: "" });
    save(); renderMaterials();
  });
  $("#btnNewOperator").addEventListener("click", () => {
    const v = prompt(t("prompt_newvalue"), t("def_newoperator"));
    if (v == null || !v.trim()) return;
    state.config.operators.push({ id: uid(), name: v.trim(), works: [] });
    save(); buildFilters(); renderOperators();
  });
  $("#btnNewCourier").addEventListener("click", () => addChip("couriers", "DHL"));
  $("#btnNewCost").addEventListener("click", () => {
    state.config.overheads.push({ id: uid(), category: "property", name: t("def_newcost"), amount: 0, period: "month" });
    save(); renderCosts(); renderSummary();
  });

  $("#opClose").addEventListener("click", () => {
    $("#opModal").hidden = true; opEditId = null; renderOperators(); renderSummary();
  });
  $("#opModal").addEventListener("click", (e) => {
    if (e.target.id === "opModal") $("#opClose").click();
  });

  $("#bomAdd").addEventListener("click", addBomLine);
  $("#bomClose").addEventListener("click", closeBomModal);
  $("#bomModal").addEventListener("click", (e) => { if (e.target.id === "bomModal") closeBomModal(); });

  bindSegmented("#taxRegime", (v) => { state.config.tax.regime = v; save(); renderTaxPanel(); renderSummary(); });
  [["#taxCoefficient", "coefficient"], ["#taxFlatRate", "flatRate"],
   ["#taxIncomeRate", "incomeRate"], ["#taxSocialRate", "socialRate"]].forEach(([sel, key]) => {
    $(sel).addEventListener("change", () => {
      state.config.tax[key] = Number($(sel).value) || 0;
      save(); renderSummary();
    });
  });
  [["#calDays", "daysPerWeek"], ["#calWeeks", "weeksPerYear"], ["#calHours", "hoursPerDay"]].forEach(([sel, key]) => {
    $(sel).addEventListener("change", () => {
      state.config.calendar[key] = Number($(sel).value) || 0;
      save(); renderCalendarPanel(); renderSummary();
    });
  });
  $("#setAutoUpdate").addEventListener("change", () => {
    state.config.autoUpdateCheck = $("#setAutoUpdate").checked;
    save();
  });
  $("#setExcelOn").addEventListener("change", () => {
    state.config.excel.enabled = $("#setExcelOn").checked;
    save();
  });
  $("#btnExcelChoose").addEventListener("click", async () => {
    if (!window.api.chooseExcel) return;
    const r = await window.api.chooseExcel();
    if (!r || r.canceled) return;
    state.config.excel.path = r.path;
    state.config.excel.enabled = true;
    save();
    renderCatalog();
    writeWorkbookNow();
  });
  $("#btnExcelNow").addEventListener("click", writeWorkbookNow);
}

// A segmented control: buttons with data-v, one of them .active.
function bindSegmented(sel, onChange) {
  const box = $(sel);
  box.addEventListener("click", (e) => {
    const b = e.target.closest(".seg-btn");
    if (!b) return;
    Array.from(box.children).forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    onChange(b.dataset.v);
  });
}
function setSegValue(sel, v) {
  Array.from($(sel).children).forEach((b) => b.classList.toggle("active", b.dataset.v === v));
}

// ===========================================================================
// Filters
// ===========================================================================
function buildFilters() {
  const years = availableYears();
  const yearOpts = years.map((y) => `<option value="${y}">${y}</option>`).join("");
  const keepY = $("#fYear").value, keepR = $("#rYear").value;

  $("#fYear").innerHTML = `<option value="">${t("all_years")}</option>` + yearOpts;
  $("#rYear").innerHTML = yearOpts;
  $("#fYear").value = keepY && years.includes(keepY) ? keepY : "";
  $("#rYear").value = keepR && years.includes(keepR) ? keepR : years[0];

  $("#fMonth").innerHTML = `<option value="">${t("all_months")}</option>` +
    months().map((m, i) => `<option value="${i}">${m}</option>`).join("");
  $("#fWho").innerHTML = `<option value="">${t("everyone")}</option>` +
    operatorNames().map((o) => `<option>${escapeHtml(o)}</option>`).join("");
  const keepShip = $("#fShip").value, keepRedo = $("#fRedo").value;
  $("#fShip").innerHTML =
    `<option value="">${t("ship_all")}</option>` +
    `<option value="yes">${t("ship_shipped")}</option>` +
    `<option value="no">${t("ship_pending")}</option>`;
  $("#fRedo").innerHTML =
    `<option value="">${t("f_redo_all")}</option>` +
    `<option value="only">${t("f_redo_only")}</option>` +
    `<option value="none">${t("f_redo_none")}</option>`;
  $("#fShip").value = keepShip;
  $("#fRedo").value = keepRedo;

  lockControlWidths();
  refreshDropdowns();
}

function availableYears() {
  const set = new Set(state.works.map((w) => (w.date || "").slice(0, 4)).filter(Boolean));
  set.add(String(new Date().getFullYear()));
  return Array.from(set).sort().reverse();
}

// ===========================================================================
// Works view
// ===========================================================================
function workSection() {
  const a = $("#workSec").querySelector(".seg-btn.active");
  return a ? a.dataset.v : "out";
}

function renderWorks() {
  const section = workSection();
  const incoming = section === "in";
  // Incoming work has not been shipped and has no courier, so the column and
  // its filter would be dead weight.
  $("#worksTable").classList.toggle("hide-ship", incoming);
  $("#fShip").hidden = incoming;
  $("#inHint").hidden = !incoming;
  $("#worksEmpty").setAttribute("data-i18n", incoming ? "in_empty" : "works_empty");
  $("#worksEmpty").textContent = t(incoming ? "in_empty" : "works_empty");

  const q = $("#search").value.trim().toLowerCase();
  const fYear = $("#fYear").value;
  const fMonth = $("#fMonth").value;
  const fWho = $("#fWho").value;
  const fShip = $("#fShip").value;
  const fRedo = $("#fRedo").value;

  const rows = state.works.filter((w) => {
    if ((w.status || "out") !== section) return false;
    if (fYear && (w.date || "").slice(0, 4) !== fYear) return false;
    if (fMonth !== "" && monthOf(w.date) !== Number(fMonth)) return false;
    if (fWho && w.doneBy !== fWho) return false;
    if (fRedo === "only" && !w.redo) return false;
    if (fRedo === "none" && w.redo) return false;
    if (fShip === "yes" && !w.shipped) return false;
    if (fShip === "no" && w.shipped) return false;
    if (q) {
      const blob = `${w.client} ${w.patient} ${w.work} ${w.doneBy} ${w.tracking || ""} ${w.courier || ""}`.toLowerCase();
      if (!blob.includes(q)) return false;
    }
    return true;
  }).sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  // A tick on a row that a filter then hides would be invisible but still
  // applied, so the selection is kept to what is on screen.
  visibleIds = rows.map((w) => w.id);
  Array.from(selected).forEach((id) => { if (!visibleIds.includes(id)) selected.delete(id); });

  const body = $("#worksBody");
  body.innerHTML = "";
  rows.forEach((w) => body.appendChild(workRow(w)));
  $("#worksEmpty").hidden = rows.length !== 0;
  renderSelection();
  tagCells($("#worksTable"));

  const cost = sum(rows, rowCost);
  const revenue = sum(rows, rowRevenue);
  const margin = revenue - cost;
  $("#worksTotals").innerHTML =
    `<tr><td colspan="8"><b>${rows.length}</b> ${escapeHtml(t("foot_works"))}</td>` +
    `<td class="num" data-label="${escapeAttr(t("th_matcost"))}"><b>${money(cost)}</b></td>` +
    `<td class="num" data-label="${escapeAttr(t("th_listprice"))}"><b>${money(revenue)}</b></td>` +
    `<td class="num" data-label="${escapeAttr(t("th_margin"))}">` +
    `<b class="${margin < 0 ? "neg" : "pos"}">${money(margin)}</b></td><td></td></tr>`;
}

function workRow(w) {
  const tr = document.createElement("tr");
  const cost = rowCost(w);
  const margin = rowMargin(w);
  // A redo earns nothing, so what the price column shows is what the redo is
  // worth to the lab: minus the material it burned.
  const priceCell = w.redo
    ? `<span class="neg">${money(-cost)}</span>`
    : money(rowRevenue(w));

  tr.innerHTML = `
    <td class="check"><input type="checkbox" ${selected.has(w.id) ? "checked" : ""} /></td>
    <td>${formatDate(w.date)}</td>
    <td>${escapeHtml(w.client || "")}</td>
    <td class="muted">${escapeHtml(w.patient || "")}</td>
    <td>${escapeHtml(w.work || "")}${w.redo ? ` <span class="badge redo">${t("badge_redo")}</span>` : ""}</td>
    <td class="num">${w.units ?? ""}</td>
    <td>${escapeHtml(w.doneBy || "")}</td>
    <td>${shipCell(w)}</td>
    <td class="num">${money(cost)}</td>
    <td class="num">${priceCell}</td>
    <td class="num"><span class="${margin < 0 ? "neg" : ""}">${money(margin)}</span></td>
    <td class="center nowrap">
      <button class="btn icon" title="Edit">&#9998;</button>
      <button class="btn icon danger" title="Delete">&#10005;</button>
    </td>`;

  const [edit, del] = tr.querySelectorAll("button");
  edit.addEventListener("click", () => openWorkModal(w.id));
  del.addEventListener("click", () => deleteWork(w.id));

  const tick = tr.querySelector('input[type="checkbox"]');
  tick.addEventListener("change", () => {
    if (tick.checked) selected.add(w.id); else selected.delete(w.id);
    tr.classList.toggle("picked", tick.checked);
    renderSelection();
  });
  tr.classList.toggle("picked", selected.has(w.id));
  return tr;
}

// ---------------------------------------------------------------------------
// Selection and shipping several works under one tracking number
// ---------------------------------------------------------------------------
function renderSelection() {
  const n = selected.size;
  const incoming = workSection() === "in";
  $("#bulkBar").hidden = n === 0;
  $("#btnMarkDone").hidden = !incoming;
  $("#btnShipSelected").hidden = incoming;
  $("#bulkCount").innerHTML = `<b>${n}</b> ${escapeHtml(t("sel_selected"))}`;
  const all = $("#selAll");
  all.checked = n > 0 && n === visibleIds.length;
  all.indeterminate = n > 0 && n < visibleIds.length;
}

function clearSelection() {
  selected.clear();
  renderWorks();
}

// Ticking incoming work as done is the whole point of the two sections: it
// crosses the bench and lands where the courier is attached.
function markSelectedDone() {
  if (!selected.size) return;
  let n = 0;
  state.works.forEach((w) => {
    if (!selected.has(w.id)) return;
    w.status = "out";
    n++;
  });
  Auth.logAction(state, "act_done", String(n));
  save();
  selected.clear();
  renderWorks();
  renderSummary();
  toast(`${n} ${t("t_done_n")}`);
}

function openShipModal() {
  if (!selected.size) return;
  const works = state.works.filter((w) => selected.has(w.id));
  $("#shipList").innerHTML = works.map((w) =>
    `<div class="shiprow"><span>${formatDate(w.date)}</span>` +
    `<span>${escapeHtml(w.client || "")}</span>` +
    `<span class="muted">${escapeHtml(w.patient || "")}</span>` +
    `<span>${escapeHtml(w.work || "")}</span></div>`).join("");

  // Start from whatever the first already-shipped work in the batch carries,
  // so adding one more job to an existing parcel is two clicks.
  const seed = works.find((w) => w.shipped) || {};
  $("#sDate").value = seed.shipDate || todayISO();
  $("#sCourier").value = seed.courier || "";
  $("#sTracking").value = seed.tracking || "";
  $("#courierList").innerHTML = state.config.couriers
    .map((c) => `<option value="${escapeAttr(c)}"></option>`).join("");

  $("#shipModal").hidden = false;
  $("#sTracking").focus();
}

function saveShipTogether() {
  const date = $("#sDate").value || todayISO();
  const courier = $("#sCourier").value.trim();
  const tracking = $("#sTracking").value.trim();

  let n = 0;
  state.works.forEach((w) => {
    if (!selected.has(w.id)) return;
    w.shipped = true;
    w.shipDate = date;
    w.courier = courier;
    w.tracking = tracking;
    n++;
  });
  if (courier && !state.config.couriers.includes(courier)) {
    state.config.couriers.push(courier);
    renderChips("couriers", "#couriersList");
  }

  Auth.logAction(state, "act_ship", `${n} - ${courier} ${tracking}`.trim());
  save();
  $("#shipModal").hidden = true;
  selected.clear();
  renderWorks();
  toast(`${n} ${t("t_shipped_n")}`);
}

function shipCell(w) {
  if (!w.shipped) return `<span class="chip muted">${t("ship_not_yet")}</span>`;
  const bits = [formatDate(w.shipDate || w.date)];
  if (w.courier) bits.push(escapeHtml(w.courier));
  const tip = w.tracking ? ` title="${escapeAttr(w.tracking)}"` : "";
  return `<span class="chip ok"${tip}>${bits.join(" · ")}</span>`;
}

// ---------------------------------------------------------------------------
// Work modal
// ---------------------------------------------------------------------------
function openWorkModal(id) {
  editId = id;
  const w = id ? state.works.find((x) => x.id === id) : null;
  $("#modalTitle").textContent = w ? t("modal_editwork") : t("modal_newwork");

  $("#mWork").innerHTML = state.config.works.map((x) => `<option>${escapeHtml(x.name)}</option>`).join("");
  $("#mWho").innerHTML = operatorsFor($("#mWork").value).map((o) => `<option>${escapeHtml(o)}</option>`).join("");
  $("#courierList").innerHTML = state.config.couriers.map((c) => `<option value="${escapeAttr(c)}"></option>`).join("");

  $("#mDate").value = w ? w.date : todayISO();
  refreshClientSelect(w ? (w.client || "") : "");
  $("#mPatient").value = w ? (w.patient || "") : "";
  $("#mWork").value = w ? w.work : (state.config.works[0] && state.config.works[0].name) || "";
  $("#mUnits").value = w ? w.units : 1;
  $("#mWho").value = w ? w.doneBy : (operatorsFor($("#mWork").value)[0] || "");

  $("#mRedo").checked = !!(w && w.redo);
  syncRedoHint();

  $("#mShipped").checked = !!(w && w.shipped);
  $("#mShipDate").value = (w && w.shipDate) || "";
  $("#mCourier").value = (w && w.courier) || "";
  $("#mTracking").value = (w && w.tracking) || "";
  $("#mNote").value = (w && w.note) || "";
  syncShippingFields();

  refreshDropdowns();
  $("#workModal").hidden = false;
  $("#mPatient").focus();
}

// The hint explains why a redo is worth minus the material; it only needs to be
// there when the switch is on.
function syncRedoHint() { $("#mRedoHint").hidden = !$("#mRedo").checked; }

function syncShippingFields() {
  const on = $("#mShipped").checked;
  ["#mShipDate", "#mCourier", "#mTracking"].forEach((s) => { $(s).disabled = !on; });
  if (on && !$("#mShipDate").value) $("#mShipDate").value = todayISO();
}

function closeWorkModal() { $("#workModal").hidden = true; editId = null; }

function saveWork() {
  const shipped = $("#mShipped").checked;
  const rec = {
    date: $("#mDate").value || todayISO(),
    client: $("#mClient").value.trim(),
    patient: $("#mPatient").value.trim(),
    work: $("#mWork").value,
    units: Math.max(0, Number($("#mUnits").value) || 0),
    doneBy: $("#mWho").value,
    redo: $("#mRedo").checked,
    status: editId ? (state.works.find((x) => x.id === editId).status || "out") : workSection(),
    shipped,
    shipDate: shipped ? ($("#mShipDate").value || todayISO()) : "",
    courier: shipped ? $("#mCourier").value.trim() : "",
    tracking: shipped ? $("#mTracking").value.trim() : "",
    note: $("#mNote").value.trim()
  };

  // A courier typed by hand joins the list, so it is one click next time.
  if (rec.courier && !state.config.couriers.includes(rec.courier)) {
    state.config.couriers.push(rec.courier);
    renderChips("couriers", "#couriersList");
  }

  if (editId) {
    Object.assign(state.works.find((x) => x.id === editId), rec);
    Auth.logAction(state, "act_work_edit", `${rec.client} - ${rec.work}`);
  } else {
    state.works.push(Object.assign({ id: uid() }, rec));
    Auth.logAction(state, "act_work_add", `${rec.client} - ${rec.work}`);
  }

  save();
  closeWorkModal();
  buildFilters();
  renderWorks();
  renderSummary();
  toast(t("t_worksaved"));
}

function deleteWork(id) {
  if (!confirm(t("confirm_delwork"))) return;
  const w = state.works.find((x) => x.id === id);
  Auth.logAction(state, "act_work_del", w ? `${w.client} - ${w.work}` : "");
  state.works = state.works.filter((x) => x.id !== id);
  save();
  renderWorks();
  renderSummary();
}

// ===========================================================================
// Summary
// ===========================================================================
function renderSummary() {
  const year = $("#rYear").value || String(new Date().getFullYear());
  // Work still on the bench has not earned anything yet, so it stays out of
  // the money until it is marked done.
  const rows = state.works.filter((w) => (w.date || "").slice(0, 4) === year && (w.status || "out") === "out");
  const e = economics(rows);

  $("#statCards").innerHTML = [
    card(t("card_works"), rows.length),
    card(t("card_units"), sum(rows, (w) => Number(w.units) || 0)),
    card(t("card_revenue"), money(e.revenue), "accent"),
    card(t("card_matcost"), money(e.materials)),
    card(t("card_grossmargin"), money(e.gross), e.gross < 0 ? "neg" : "pos"),
    card(t("card_redos"), rows.filter((w) => w.redo).length,
      "", money(-e.redoCost) + " " + t("card_redocost").toLowerCase())
  ].join("");

  $("#profitCards").innerHTML = [
    card(t("card_overheads"), money(e.overheads)),
    card(t("card_taxes"), money(e.taxes.total)),
    card(t("card_net"), money(e.net), e.net < 0 ? "neg" : "pos"),
    card(t("card_perday"), money(e.perDay), e.perDay < 0 ? "neg" : "pos", e.workDays + " " + t("cal_workdays").toLowerCase()),
    card(t("card_perweek"), money(e.perWeek), e.perWeek < 0 ? "neg" : "pos"),
    card(t("card_permonth"), money(e.perMonth), e.perMonth < 0 ? "neg" : "pos"),
    card(t("card_avgwork"), money(e.perWork)),
    card(t("card_breakeven"), money(e.breakEven))
  ].join("");

  renderPL(e);
  // Charts need a canvas with a size; drawing into a hidden tab produces empty
  // ones. The tab click re-renders, so there is nothing to lose by waiting.
  if ($("#view-summary").classList.contains("active")) drawCharts(rows, e);
}

function card(k, v, cls, sub) {
  return `<div class="card"><div class="k">${escapeHtml(String(k))}</div>` +
    `<div class="v ${cls || ""}">${v}</div>` +
    (sub ? `<div class="s">${escapeHtml(sub)}</div>` : "") + `</div>`;
}

function renderPL(e) {
  const d = e.workDays || 1;
  const pct = (n) => (e.revenue ? (100 * n / e.revenue).toFixed(1) + "%" : "-");
  const line = (label, v, cls) =>
    `<tr class="${cls || ""}"><td>${label}</td>` +
    `<td class="num">${money(v)}</td>` +
    `<td class="num">${money(v / 12)}</td>` +
    `<td class="num">${money(v / d)}</td>` +
    `<td class="num muted">${pct(v)}</td></tr>`;

  $("#plBody").innerHTML =
    line(t("pl_revenue"), e.revenue) +
    line(t("pl_materials"), -e.materials) +
    line(t("pl_gross"), e.gross, "rule") +
    line(t("pl_overheads"), -e.overheads) +
    line(t("pl_operating"), e.operating, "rule") +
    line(t("pl_tax"), -e.taxes.total) +
    line(t("pl_net"), e.net, "strong");
  tagCells($("#plTable"));
}

// ---------------------------------------------------------------------------
// Charts - one shared minimal style, redrawn on theme and language changes.
// ---------------------------------------------------------------------------
function chartInk() {
  const cs = getComputedStyle(document.documentElement);
  return {
    ink: cs.getPropertyValue("--ink").trim(),
    soft: cs.getPropertyValue("--ink-soft").trim(),
    line: cs.getPropertyValue("--line").trim(),
    panel: cs.getPropertyValue("--panel").trim()
  };
}

// Muted tones on purpose: a works list is read all day, and saturated colour
// makes it harder, not easier. Every hue here stays legible on both themes.
const SERIES = {
  revenue: "#6f9bf0",
  cost: "#e3b062",
  margin: "#5ec2a2",
  negative: "#e08b8b",
  neutral: "#a7aebb"
};
const PALETTE = ["#6f9bf0", "#5ec2a2", "#e3b062", "#e08b8b", "#a892e0",
  "#6fc3d2", "#dda57a", "#8fa9e8", "#7ecfb5", "#d79ab8", "#a7aebb", "#8b93a3"];

function baseOptions(extra) {
  const c = chartInk();
  const opts = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 260 },
    layout: { padding: { top: 4, right: 4 } },
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        display: false,
        position: "bottom",
        labels: { usePointStyle: true, pointStyle: "circle", boxWidth: 6, boxHeight: 6, color: c.soft, padding: 14 }
      },
      tooltip: {
        backgroundColor: c.ink, titleColor: c.panel, bodyColor: c.panel,
        padding: 10, cornerRadius: 6, displayColors: true, boxWidth: 8, boxHeight: 8,
        usePointStyle: true, borderWidth: 0
      }
    },
    scales: {
      x: {
        grid: { display: false },
        border: { color: c.line },
        ticks: { color: c.soft, font: { size: 11 }, maxRotation: 0, autoSkipPadding: 12 }
      },
      y: {
        grid: { color: c.line, drawTicks: false },
        border: { display: false },
        ticks: { color: c.soft, font: { size: 11 }, padding: 8, maxTicksLimit: 6 }
      }
    }
  };
  return deepMerge(opts, extra || {});
}

function draw(id, config) {
  const el = document.getElementById(id);
  if (!el) return;
  if (charts[id]) charts[id].destroy();
  charts[id] = new Chart(el, config);
}

function drawCharts(rows, e) {
  const ms = monthsShort();
  const byMonth = { revenue: new Array(12).fill(0), cost: new Array(12).fill(0) };
  rows.forEach((w) => {
    const m = monthOf(w.date);
    if (m < 0) return;
    byMonth.revenue[m] += rowRevenue(w);
    byMonth.cost[m] += rowCost(w);
  });
  const marginByMonth = byMonth.revenue.map((r, i) => r - byMonth.cost[i]);

  // 1. Revenue vs material cost - area + line.
  draw("chRevenue", {
    type: "line",
    data: {
      labels: ms,
      datasets: [
        {
          label: t("ds_revenue"), data: byMonth.revenue,
          borderColor: SERIES.revenue, backgroundColor: alpha(SERIES.revenue, 0.12),
          fill: true, tension: 0.35, borderWidth: 2, pointRadius: 0, pointHoverRadius: 4
        },
        {
          label: t("ds_matcost"), data: byMonth.cost,
          borderColor: SERIES.cost, backgroundColor: alpha(SERIES.cost, 0.10),
          fill: true, tension: 0.35, borderWidth: 2, pointRadius: 0, pointHoverRadius: 4
        }
      ]
    },
    options: baseOptions({
      plugins: { legend: { display: true }, tooltip: { callbacks: { label: moneyLabel } } },
      scales: { y: { ticks: { callback: shortMoney } } }
    })
  });

  // 2. Margin by month - bars, red when the month lost money.
  draw("chMargin", {
    type: "bar",
    data: {
      labels: ms,
      datasets: [{
        label: t("ds_margin"), data: marginByMonth,
        backgroundColor: marginByMonth.map((v) => (v < 0 ? SERIES.negative : alpha(SERIES.margin, 0.85))),
        borderRadius: 3, borderSkipped: false, maxBarThickness: 26
      }]
    },
    options: baseOptions({
      plugins: { tooltip: { callbacks: { label: moneyLabel } } },
      scales: { y: { ticks: { callback: shortMoney } } }
    })
  });

  // 3. Cumulative profit against the running-cost line: where the year turns.
  let acc = 0;
  const cumulative = marginByMonth.map((v) => (acc += v));
  const overheadLine = ms.map((_, i) => (e.overheads / 12) * (i + 1));
  draw("chCumulative", {
    type: "line",
    data: {
      labels: ms,
      datasets: [
        {
          label: t("ds_cumulative"), data: cumulative,
          borderColor: SERIES.margin, backgroundColor: alpha(SERIES.margin, 0.12),
          fill: true, tension: 0.3, borderWidth: 2, pointRadius: 0, pointHoverRadius: 4
        },
        {
          label: t("ds_breakeven"), data: overheadLine,
          borderColor: SERIES.neutral, borderDash: [5, 4], borderWidth: 1.5,
          pointRadius: 0, fill: false, tension: 0
        }
      ]
    },
    options: baseOptions({
      plugins: { legend: { display: true }, tooltip: { callbacks: { label: moneyLabel } } },
      scales: { y: { ticks: { callback: shortMoney } } }
    })
  });

  // 4. Top work types by revenue - horizontal bars.
  const byType = aggregate(rows, (w) => w.work || "-", rowRevenue);
  const top = Object.entries(byType).sort((a, b) => b[1] - a[1]).slice(0, 8);
  draw("chTypes", {
    type: "bar",
    data: {
      labels: top.map((x) => x[0]),
      datasets: [{
        label: t("ds_revenue"), data: top.map((x) => x[1]),
        backgroundColor: alpha(SERIES.revenue, 0.85), borderRadius: 3,
        borderSkipped: false, maxBarThickness: 18
      }]
    },
    options: baseOptions({
      indexAxis: "y",
      interaction: { mode: "nearest", intersect: true },
      plugins: { tooltip: { callbacks: { label: moneyLabel } } },
      scales: {
        x: { grid: { color: chartInk().line }, ticks: { callback: shortMoney } },
        y: { grid: { display: false }, ticks: { autoSkip: false, font: { size: 11 } } }
      }
    })
  });

  // 5. Revenue share by client - doughnut.
  const byClient = aggregate(rows, (w) => w.client || "-", rowRevenue);
  const clients = Object.entries(byClient).filter((x) => x[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 10);
  draw("chClients", {
    type: "doughnut",
    data: {
      labels: clients.map((x) => x[0]),
      datasets: [{
        data: clients.map((x) => x[1]), backgroundColor: PALETTE,
        borderWidth: 0, hoverOffset: 4
      }]
    },
    options: baseOptions({
      cutout: "62%",
      interaction: { mode: "nearest", intersect: true },
      plugins: { legend: { display: true }, tooltip: { callbacks: { label: moneyLabel } } },
      scales: { x: { display: false }, y: { display: false } }
    })
  });

  // 6. Works per operator, split billable / redo - stacked bars.
  const ops = operatorNames();
  rows.forEach((w) => { if (w.doneBy && !ops.includes(w.doneBy)) ops.push(w.doneBy); });
  draw("chOperators", {
    type: "bar",
    data: {
      labels: ops,
      datasets: [
        {
          label: t("type_normal"),
          data: ops.map((o) => rows.filter((w) => w.doneBy === o && !w.redo).length),
          backgroundColor: SERIES.revenue, borderWidth: 0, maxBarThickness: 64
        },
        {
          label: t("type_redo"),
          data: ops.map((o) => rows.filter((w) => w.doneBy === o && w.redo).length),
          backgroundColor: SERIES.negative, borderWidth: 0, maxBarThickness: 64
        }
      ]
    },
    options: baseOptions({
      plugins: { legend: { display: true } },
      scales: { x: { stacked: true }, y: { stacked: true, ticks: { precision: 0 } } }
    })
  });

  // 7. What each operator actually makes: the top types, stacked per operator.
  const typeTotals = aggregate(rows, (w) => w.work || "-", () => 1);
  const topTypes = Object.entries(typeTotals).sort((a, b) => b[1] - a[1]).slice(0, 6).map((x) => x[0]);
  draw("chOpTypes", {
    type: "bar",
    data: {
      labels: ops,
      datasets: topTypes.map((type, i) => ({
        label: type,
        data: ops.map((o) => rows.filter((w) => w.doneBy === o && (w.work || "-") === type).length),
        backgroundColor: PALETTE[i % PALETTE.length], borderWidth: 0, maxBarThickness: 64
      }))
    },
    options: baseOptions({
      plugins: { legend: { display: true } },
      scales: { x: { stacked: true }, y: { stacked: true, ticks: { precision: 0 } } }
    })
  });

  // 7. Where the revenue goes - one stacked bar read left to right.
  const parts = [
    [t("pl_materials"), e.materials, SERIES.cost],
    [t("pl_overheads"), e.overheads, SERIES.neutral],
    [t("pl_tax"), e.taxes.total, SERIES.negative],
    [t("pl_net"), Math.max(0, e.net), SERIES.margin]
  ];
  draw("chStructure", {
    type: "bar",
    data: {
      labels: [t("ds_revenue")],
      datasets: parts.map(([label, value, color]) => ({
        label, data: [value], backgroundColor: color,
        borderWidth: 0, maxBarThickness: 46
      }))
    },
    options: baseOptions({
      indexAxis: "y",
      plugins: { legend: { display: true }, tooltip: { callbacks: { label: moneyLabel } } },
      scales: {
        x: { stacked: true, grid: { color: chartInk().line }, ticks: { callback: shortMoney } },
        y: { stacked: true, grid: { display: false } }
      }
    })
  });
}

function moneyLabel(ctx) {
  const v = ctx.parsed.y !== undefined && ctx.parsed.y !== null && ctx.chart.options.indexAxis !== "y"
    ? ctx.parsed.y : (ctx.parsed.x !== undefined && ctx.parsed.x !== null ? ctx.parsed.x : ctx.parsed);
  return ` ${ctx.dataset.label || ctx.label}: ${money(Number(v) || 0)}`;
}

// ===========================================================================
// Catalog
// ===========================================================================
function renderCatalog() {
  renderClients();
  renderTypes();
  renderMaterials();
  renderOperators();
  renderUsers();
  renderHistory();
  renderChips("couriers", "#couriersList");
  renderCosts();
  renderTaxPanel();
  renderCalendarPanel();
  $("#setAutoUpdate").checked = !!state.config.autoUpdateCheck;
  $("#setExcelOn").checked = !!state.config.excel.enabled;
  $("#excelPath").textContent = state.config.excel.path || t("set_excel_none");
  tagCells();
}

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------
function renderClients() {
  const body = $("#clientsBody");
  body.innerHTML = "";
  $("#clientsEmpty").hidden = state.config.clients.length !== 0;
  state.config.clients.forEach((c) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(c.name || "")}</td>
      <td>${escapeHtml(c.email || "")}</td>
      <td>${escapeHtml(c.phone || "")}</td>
      <td>${escapeHtml(c.vat || "")}</td>
      <td>${escapeHtml(c.address || "")}</td>
      <td class="muted">${escapeHtml(c.note || "")}</td>
      <td class="center nowrap">
        <button class="btn icon" title="Edit">&#9998;</button>
        <button class="btn icon danger" title="Delete">&#10005;</button>
      </td>`;
    const [edit, del] = tr.querySelectorAll("button");
    edit.addEventListener("click", () => openClientModal(c.id));
    del.addEventListener("click", () => deleteClient(c.id));
    body.appendChild(tr);
  });
}

function openClientModal(id) {
  editClientId = id;
  const c = id ? state.config.clients.find((x) => x.id === id) : null;
  $("#clientModalTitle").textContent = c ? t("modal_editclient") : t("modal_newclient");
  $("#cName").value = c ? c.name || "" : "";
  $("#cVat").value = c ? c.vat || "" : "";
  $("#cEmail").value = c ? c.email || "" : "";
  $("#cPhone").value = c ? c.phone || "" : "";
  $("#cAddress").value = c ? c.address || "" : "";
  $("#cNote").value = c ? c.note || "" : "";
  $("#clientModal").hidden = false;
  $("#cName").focus();
}

function closeClientModal() { $("#clientModal").hidden = true; editClientId = null; }

function saveClient() {
  const rec = {
    name: $("#cName").value.trim(), vat: $("#cVat").value.trim(),
    email: $("#cEmail").value.trim(), phone: $("#cPhone").value.trim(),
    address: $("#cAddress").value.trim(), note: $("#cNote").value.trim()
  };
  if (!rec.name) return toast(t("t_clientname_req"));

  if (editClientId) Object.assign(state.config.clients.find((x) => x.id === editClientId), rec);
  else state.config.clients.push(Object.assign({ id: uid() }, rec));

  save();
  closeClientModal();
  renderClients();
  toast(t("t_clientsaved"));
}

function deleteClient(id) {
  if (!confirm(t("confirm_delclient"))) return;
  state.config.clients = state.config.clients.filter((x) => x.id !== id);
  save();
  renderClients();
}

function refreshClientSelect(selected) {
  const names = state.config.clients.map((c) => c.name).filter(Boolean);
  if (selected && !names.includes(selected)) names.unshift(selected);
  $("#mClient").innerHTML = ['<option value=""></option>']
    .concat(names.map((n) => `<option>${escapeHtml(n)}</option>`)).join("");
  $("#mClient").value = selected || "";
}

// ---------------------------------------------------------------------------
// Work types
// ---------------------------------------------------------------------------
function renderTypes() {
  const body = $("#typesBody");
  body.innerHTML = "";
  state.config.works.forEach((w) => {
    const cost = workMatCost(w);
    const price = Number(w.listPrice) || 0;
    const margin = price - cost;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input class="cell-input text" value="${escapeAttr(w.name)}" /></td>
      <td><button class="btn link bom">${bomLabel(w)}</button></td>
      <td class="num">${money(cost)}</td>
      <td class="num"><input class="cell-input" type="number" step="1" min="0" value="${price}" /></td>
      <td class="num ${margin < 0 ? "neg" : ""}">${money(margin)}</td>
      <td class="num muted">${price ? Math.round(100 * margin / price) + "%" : "-"}</td>
      <td class="center"><button class="btn icon danger" title="Delete">&#10005;</button></td>`;

    const name = tr.querySelector("input.text");
    const listInput = tr.querySelector('input[type="number"]');
    name.addEventListener("change", () => {
      const old = w.name;
      w.name = name.value.trim() || old;
      // Keep the works already recorded pointing at this type.
      state.works.forEach((r) => { if (r.work === old) r.work = w.name; });
      save(); renderTypes(); renderWorks();
    });
    listInput.addEventListener("change", () => {
      w.listPrice = Number(listInput.value) || 0;
      save(); renderTypes(); renderWorks(); renderSummary();
    });
    tr.querySelector("button.bom").addEventListener("click", () => openBomModal(w.id));
    tr.querySelector("button.danger").addEventListener("click", () => {
      if (!confirm(t("confirm_delrow"))) return;
      state.config.works = state.config.works.filter((x) => x.id !== w.id);
      save(); renderTypes(); renderWorks(); renderSummary();
    });
    body.appendChild(tr);
  });
}

function bomLabel(w) {
  if (!w.bom || !w.bom.length) {
    return Number(w.materialCost) ? money(Number(w.materialCost)) : t("bom_none");
  }
  return w.bom.map((l) => {
    const m = materialById(l.material);
    return `${l.qty} × ${escapeHtml(m ? m.name : "?")}`;
  }).join(", ");
}

// ---------------------------------------------------------------------------
// Bill of materials modal
// ---------------------------------------------------------------------------
function openBomModal(typeId) {
  bomTypeId = typeId;
  const w = state.config.works.find((x) => x.id === typeId);
  $("#bomTitle").textContent = t("bom_title") + " " + w.name;
  renderBom();
  $("#bomModal").hidden = false;
}

function closeBomModal() {
  $("#bomModal").hidden = true;
  bomTypeId = null;
  renderTypes();
  renderWorks();
  renderSummary();
}

function renderBom() {
  const w = state.config.works.find((x) => x.id === bomTypeId);
  const body = $("#bomBody");
  body.innerHTML = "";
  $("#bomEmpty").hidden = w.bom.length !== 0;

  w.bom.forEach((line, i) => {
    const m = materialById(line.material);
    const unit = unitCostOf(m);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><select class="cell-select">${state.config.materials
        .map((x) => `<option value="${escapeAttr(x.id)}"${x.id === line.material ? " selected" : ""}>${escapeHtml(x.name)}</option>`)
        .join("")}</select></td>
      <td class="num"><input class="cell-input" type="number" min="0" step="0.5" value="${line.qty}" /></td>
      <td class="num muted">${money(unit)}</td>
      <td class="num">${money(unit * (Number(line.qty) || 0))}</td>
      <td class="center"><button class="btn icon danger" title="Delete">&#10005;</button></td>`;

    tr.querySelector("select").addEventListener("change", (ev) => {
      line.material = ev.target.value; save(); renderBom();
    });
    tr.querySelector("input").addEventListener("change", (ev) => {
      line.qty = Number(ev.target.value) || 0; save(); renderBom();
    });
    tr.querySelector("button").addEventListener("click", () => {
      w.bom.splice(i, 1); save(); renderBom();
    });
    body.appendChild(tr);
  });

  $("#bomTotal").textContent = money(workMatCost(w));
  refreshDropdowns();
}

function addBomLine() {
  const w = state.config.works.find((x) => x.id === bomTypeId);
  const first = state.config.materials[0];
  if (!first) return;
  // A work with a hand-typed legacy cost switches to a real recipe here.
  delete w.materialCost;
  w.bom.push({ material: first.id, qty: 1 });
  save();
  renderBom();
}

// ---------------------------------------------------------------------------
// Materials
// ---------------------------------------------------------------------------
function renderMaterials() {
  const body = $("#materialsBody");
  body.innerHTML = "";
  state.config.materials.forEach((m) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input class="cell-input text" value="${escapeAttr(m.name)}" /></td>
      <td class="num"><input class="cell-input" type="number" step="0.01" min="0" value="${m.packCost}" /></td>
      <td class="num"><input class="cell-input" type="number" step="0.01" min="0" value="${m.pieces}" /></td>
      <td><input class="cell-input text narrow" value="${escapeAttr(m.unit || "")}" /></td>
      <td class="num strong">${money(unitCostOf(m))}</td>
      <td><input class="cell-input text" value="${escapeAttr(m.note || "")}" /></td>
      <td class="center"><button class="btn icon danger" title="Delete">&#10005;</button></td>`;

    const ins = tr.querySelectorAll("input");
    ins[0].addEventListener("change", () => { m.name = ins[0].value; save(); renderTypes(); });
    ins[1].addEventListener("change", () => { m.packCost = Number(ins[1].value) || 0; afterMaterialChange(); });
    ins[2].addEventListener("change", () => { m.pieces = Number(ins[2].value) || 0; afterMaterialChange(); });
    ins[3].addEventListener("change", () => { m.unit = ins[3].value; save(); });
    ins[4].addEventListener("change", () => { m.note = ins[4].value; save(); });
    tr.querySelector("button").addEventListener("click", () => {
      if (!confirm(t("confirm_delrow"))) return;
      state.config.materials = state.config.materials.filter((x) => x.id !== m.id);
      state.config.works.forEach((w) => { w.bom = (w.bom || []).filter((l) => l.material !== m.id); });
      afterMaterialChange();
    });
    body.appendChild(tr);
  });
}

function afterMaterialChange() {
  save();
  renderMaterials();
  renderTypes();
  renderWorks();
  renderSummary();
}

// ---------------------------------------------------------------------------
// Operators, and the work types each one is set up to make
// ---------------------------------------------------------------------------
function renderOperators() {
  const body = $("#operatorsBody");
  body.innerHTML = "";
  state.config.operators.forEach((o) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input class="cell-input text" value="${escapeAttr(o.name)}" /></td>
      <td><button class="btn link">${opTypesLabel(o)}</button></td>
      <td class="center"><button class="btn icon danger" title="Delete">&#10005;</button></td>`;

    const name = tr.querySelector("input");
    name.addEventListener("change", () => {
      const old = o.name;
      o.name = name.value.trim() || old;
      state.works.forEach((w) => { if (w.doneBy === old) w.doneBy = o.name; });
      save(); buildFilters(); renderOperators(); renderWorks(); renderSummary();
    });
    tr.querySelector("button.link").addEventListener("click", () => openOpModal(o.id));
    tr.querySelector("button.danger").addEventListener("click", () => {
      if (!confirm(t("confirm_delrow"))) return;
      state.config.operators = state.config.operators.filter((x) => x.id !== o.id);
      save(); buildFilters(); renderOperators();
    });
    body.appendChild(tr);
  });
}

function opTypesLabel(o) {
  if (!o.works.length) return t("op_all");
  const names = o.works
    .map((id) => (state.config.works.find((w) => w.id === id) || {}).name)
    .filter(Boolean);
  return names.length > 3
    ? `${escapeHtml(names.slice(0, 3).join(", "))} +${names.length - 3}`
    : escapeHtml(names.join(", "));
}

let opEditId = null;

function openOpModal(id) {
  opEditId = id;
  const o = state.config.operators.find((x) => x.id === id);
  $("#opTitle").textContent = t("modal_optitle") + " " + o.name;
  $("#opList").innerHTML = state.config.works.map((w) =>
    `<label class="switch"><input type="checkbox" data-id="${escapeAttr(w.id)}"` +
    `${o.works.includes(w.id) ? " checked" : ""} /><span>${escapeHtml(w.name)}</span></label>`).join("");

  $("#opList").querySelectorAll("input").forEach((box) => {
    box.addEventListener("change", () => {
      const id2 = box.dataset.id;
      if (box.checked) { if (!o.works.includes(id2)) o.works.push(id2); }
      else o.works = o.works.filter((x) => x !== id2);
      save();
    });
  });
  $("#opModal").hidden = false;
}

// ---------------------------------------------------------------------------
// Chips (couriers)
// ---------------------------------------------------------------------------
function renderChips(key, sel) {
  const ul = $(sel);
  ul.innerHTML = "";
  (state.config[key] || []).forEach((v, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${escapeHtml(v)}</span><button title="Remove">&#10005;</button>`;
    li.querySelector("span").addEventListener("dblclick", () => {
      const next = prompt(t("prompt_editvalue"), v);
      if (next != null && next.trim()) {
        state.config[key][i] = next.trim();
        save(); buildFilters(); renderChips(key, sel);
      }
    });
    li.querySelector("button").addEventListener("click", () => {
      state.config[key].splice(i, 1);
      save(); buildFilters(); renderChips(key, sel);
    });
    ul.appendChild(li);
  });
}

function addChip(key, def) {
  const v = prompt(t("prompt_newvalue"), def);
  if (v == null || !v.trim()) return;
  state.config[key].push(v.trim());
  save();
  buildFilters();
  renderChips(key, "#couriersList");
}

// ---------------------------------------------------------------------------
// Running costs
// ---------------------------------------------------------------------------
function renderCosts() {
  const body = $("#costsBody");
  body.innerHTML = "";
  const list = state.config.overheads;
  $("#costsEmpty").hidden = list.length !== 0;

  list.forEach((o) => {
    const year = costPerYear(o);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><select class="cell-select">${COST_CATEGORIES
        .map((c) => `<option value="${c}"${c === o.category ? " selected" : ""}>${escapeHtml(t("cost_" + c))}</option>`)
        .join("")}</select></td>
      <td><input class="cell-input text" value="${escapeAttr(o.name || "")}" /></td>
      <td class="num"><input class="cell-input" type="number" step="0.01" min="0" value="${o.amount}" /></td>
      <td><select class="cell-select narrow">
        <option value="month"${o.period === "month" ? " selected" : ""}>${escapeHtml(t("per_month"))}</option>
        <option value="year"${o.period === "year" ? " selected" : ""}>${escapeHtml(t("per_year"))}</option>
      </select></td>
      <td class="num">${money(year)}</td>
      <td class="num muted">${money(year / 12)}</td>
      <td class="center"><button class="btn icon danger" title="Delete">&#10005;</button></td>`;

    const [cat, period] = tr.querySelectorAll("select");
    const [name, amount] = tr.querySelectorAll("input");
    cat.addEventListener("change", () => { o.category = cat.value; afterCostChange(); });
    name.addEventListener("change", () => { o.name = name.value; save(); });
    amount.addEventListener("change", () => { o.amount = Number(amount.value) || 0; afterCostChange(); });
    period.addEventListener("change", () => { o.period = period.value; afterCostChange(); });
    tr.querySelector("button").addEventListener("click", () => {
      if (!confirm(t("confirm_delrow"))) return;
      state.config.overheads = state.config.overheads.filter((x) => x.id !== o.id);
      afterCostChange();
    });
    body.appendChild(tr);
  });

  refreshDropdowns();

  const total = overheadPerYear();
  $("#costsFoot").innerHTML = list.length
    ? `<tr class="strong"><td colspan="4">${escapeHtml(t("costs_total"))}</td>` +
      `<td class="num">${money(total)}</td><td class="num">${money(total / 12)}</td><td></td></tr>`
    : "";
}

function afterCostChange() {
  save();
  renderCosts();
  renderSummary();
}

// ---------------------------------------------------------------------------
// Taxes and calendar
// ---------------------------------------------------------------------------
function renderTaxPanel() {
  const tx = state.config.tax;
  setSegValue("#taxRegime", tx.regime);
  $("#taxCoefficient").value = tx.coefficient;
  $("#taxFlatRate").value = tx.flatRate;
  $("#taxIncomeRate").value = tx.incomeRate;
  $("#taxSocialRate").value = tx.socialRate;
  const flat = tx.regime === "flat";
  $("#rowCoefficient").hidden = !flat;
  $("#rowFlatRate").hidden = !flat;
  $("#rowIncomeRate").hidden = flat;
}

function renderCalendarPanel() {
  const c = state.config.calendar;
  $("#calDays").value = c.daysPerWeek;
  $("#calWeeks").value = c.weeksPerYear;
  $("#calHours").value = c.hoursPerDay;
  $("#calTotal").textContent = workingDays();
}

// ===========================================================================
// Calculations
// ===========================================================================
function materialById(id) { return state.config.materials.find((m) => m.id === id); }
function unitCostOf(m) { return m && Number(m.pieces) ? (Number(m.packCost) || 0) / Number(m.pieces) : 0; }

function bomCost(bom, materials) {
  return (bom || []).reduce((s, l) => {
    const m = materials.find((x) => x.id === l.material);
    const unit = m && Number(m.pieces) ? (Number(m.packCost) || 0) / Number(m.pieces) : 0;
    return s + unit * (Number(l.qty) || 0);
  }, 0);
}

// Material cost of one unit of a work type. A type with a recipe follows its
// materials; one without keeps whatever cost was typed in before (legacy data).
function workMatCost(w) {
  if (!w) return 0;
  if (w.bom && w.bom.length) return bomCost(w.bom, state.config.materials);
  return Number(w.materialCost) || 0;
}

function workType(name) { return state.config.works.find((w) => w.name === name); }
function rowCost(w) { return (Number(w.units) || 0) * workMatCost(workType(w.work)); }
function rowRevenue(w) {
  if (w.redo) return 0;                       // a redo is never invoiced
  const wt = workType(w.work);
  return (Number(w.units) || 0) * (wt ? Number(wt.listPrice) || 0 : 0);
}
function rowMargin(w) { return rowRevenue(w) - rowCost(w); }

function costPerYear(o) {
  const a = Number(o.amount) || 0;
  return o.period === "month" ? a * 12 : a;
}
function overheadPerYear() { return state.config.overheads.reduce((s, o) => s + costPerYear(o), 0); }

function workingDays() {
  const c = state.config.calendar;
  return Math.max(1, Math.round((Number(c.daysPerWeek) || 0) * (Number(c.weeksPerYear) || 0)));
}

// Taxes are deliberately simple: two regimes, plain percentages, no brackets.
function taxesOn(revenue, operating) {
  const tx = state.config.tax;
  let taxable, rate;
  if (tx.regime === "flat") {
    taxable = revenue * (Number(tx.coefficient) || 0) / 100;
    rate = Number(tx.flatRate) || 0;
  } else {
    taxable = Math.max(0, operating);
    rate = Number(tx.incomeRate) || 0;
  }
  const social = taxable * (Number(tx.socialRate) || 0) / 100;
  const income = Math.max(0, taxable - social) * rate / 100;
  return { taxable, social, income, total: social + income };
}

function economics(rows) {
  const revenue = sum(rows, rowRevenue);
  const materials = sum(rows, rowCost);
  const redoCost = sum(rows.filter((w) => w.redo), rowCost);
  const gross = revenue - materials;
  const overheads = overheadPerYear();
  const operating = gross - overheads;
  const taxes = taxesOn(revenue, operating);
  const net = operating - taxes.total;
  const days = workingDays();
  const billable = rows.filter((w) => !w.redo).length;
  // Revenue needed to cover the running costs, given how much of every euro
  // is eaten by materials.
  const matRatio = revenue > 0 ? materials / revenue : 0;
  const breakEven = matRatio < 1 ? overheads / (1 - matRatio) : 0;

  return {
    revenue, materials, redoCost, gross, overheads, operating, taxes, net,
    workDays: days,
    perDay: net / days,
    perWeek: net / Math.max(1, Number(state.config.calendar.weeksPerYear) || 1),
    perMonth: net / 12,
    perWork: billable ? gross / billable : 0,
    breakEven
  };
}

// The workbook is written by the Electron side, which reads the data file, so
// the state has to be on disk before we ask for it.
async function writeWorkbookNow() {
  if (!window.api.syncExcel) return;
  if (!state.config.excel.path) return;
  await window.api.saveData(state);
  const r = await window.api.syncExcel();
  if (r && r.ok) toast(t("t_excel_saved"));
  else if (r && r.error) toast(t("t_excel_error") + r.error);
}

// ===========================================================================
// Updates - public GitHub REST API, read only, no account.
// ===========================================================================
function dueForUpdateCheck() {
  try {
    const last = Number(localStorage.getItem("updateCheckedAt") || 0);
    return Date.now() - last > 24 * 3600 * 1000;
  } catch (_) { return true; }
}

async function checkUpdates(manual) {
  if (!window.api.checkUpdate) return;
  if (manual) {
    $("#updateState").className = "update-state";
    $("#updateState").textContent = t("update_checking");
    $("#updCurrent").textContent = appInfo.version || "-";
    $("#updLatest").textContent = "-";
    $("#updDownload").hidden = true;
    $("#updNotes").hidden = true;
    $("#updateModal").hidden = false;
  }

  const r = await window.api.checkUpdate();
  try { localStorage.setItem("updateCheckedAt", String(Date.now())); } catch (_) {}

  if (!r || !r.ok) {
    if (manual) {
      $("#updateState").className = "update-state warn";
      $("#updateState").textContent = t("update_error") + (r && r.error ? " (" + r.error + ")" : "");
    }
    return;
  }

  const btn = $("#btnUpdate");
  btn.classList.toggle("has-update", !!r.hasUpdate);

  if (!manual && !r.hasUpdate) return;
  if (!manual) $("#updateModal").hidden = false;

  $("#updCurrent").textContent = r.current || "-";
  $("#updLatest").textContent = r.latest || "-";
  $("#updateState").className = "update-state " + (r.hasUpdate ? "new" : "ok");
  $("#updateState").textContent = r.hasUpdate ? t("update_available") : t("update_none");
  $("#updDownload").hidden = !r.hasUpdate;
  $("#updNotes").hidden = !r.url;
  $("#updDownload").disabled = false;
  $("#updDownload").textContent = t("update_download");
  $("#updNotes").onclick = () => window.api.openExternal(r.url);

  // With a file to fetch, the button fetches it. Without one - an odd release,
  // or a browser looking at the demo - it falls back to the release page.
  $("#updDownload").onclick = r.asset && window.api.downloadUpdate
    ? () => downloadUpdate(r.asset)
    : () => window.api.openExternal(r.url);
}

// The bar fills in the dialog the user is already looking at. No second
// window, and the app stays usable while the file comes down.
async function downloadUpdate(asset) {
  const btn = $("#updDownload");
  btn.disabled = true;
  $("#updateState").className = "update-state";
  $("#updateState").textContent = t("update_downloading") + " 0%";

  const res = await window.api.downloadUpdate(asset);

  if (!res || !res.ok) {
    $("#updateState").className = "update-state warn";
    $("#updateState").textContent = t("update_dlerror") + (res && res.error ? " (" + res.error + ")" : "");
    btn.disabled = false;
    return;
  }

  $("#updateState").className = "update-state new";
  $("#updateState").textContent = t("update_downloaded");
  btn.disabled = false;
  btn.textContent = t("update_install");
  btn.onclick = () => window.api.installUpdate(res.path);
}

// ===========================================================================
// Export / import
// ===========================================================================
async function importBackup() {
  const r = await window.api.importJson();
  if (!r || r.canceled) return;
  if (!r.ok) return toast(t("t_error") + r.error);
  if (!r.data || !r.data.config) return toast(t("t_invalidbackup"));
  state = r.data;
  ensureConfigShape();
  save();
  buildFilters();
  renderAll();
  toast(t("t_backupimported"));
}

async function exportExcel() {
  const works = state.works.slice()
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""))
    .map((w) => ({
      Date: w.date,
      Month: monthYear(w.date),
      Client: w.client || "",
      Patient: w.patient || "",
      Work: w.work,
      Units: w.units,
      "Done by": w.doneBy,
      Redo: w.redo ? "Yes" : "",
      Shipped: w.shipped ? "Yes" : "",
      "Ship date": w.shipDate || "",
      Courier: w.courier || "",
      Tracking: w.tracking || "",
      "Material cost": round2(rowCost(w)),
      "List price": round2(rowRevenue(w)),
      Margin: round2(rowMargin(w)),
      Note: w.note || ""
    }));

  const byType = {};
  state.works.forEach((w) => {
    const k = w.work || "-";
    byType[k] = byType[k] || { Work: k, Count: 0, Units: 0, Cost: 0, Revenue: 0, Margin: 0 };
    byType[k].Count += 1;
    byType[k].Units += Number(w.units) || 0;
    byType[k].Cost = round2(byType[k].Cost + rowCost(w));
    byType[k].Revenue = round2(byType[k].Revenue + rowRevenue(w));
    byType[k].Margin = round2(byType[k].Margin + rowMargin(w));
  });

  const catalog = state.config.works.map((w) => ({
    Work: w.name,
    Materials: bomLabelPlain(w),
    "Material cost": round2(workMatCost(w)),
    "List price": Number(w.listPrice) || 0,
    Margin: round2((Number(w.listPrice) || 0) - workMatCost(w))
  }));

  const costs = state.config.overheads.map((o) => ({
    Category: t("cost_" + o.category),
    Name: o.name,
    Amount: Number(o.amount) || 0,
    Period: o.period,
    "Per year": round2(costPerYear(o))
  }));

  const r = await window.api.exportXlsx({ works, summary: Object.values(byType), catalog, costs });
  if (r && r.ok) toast(t("t_excelexported"));
  else if (r && !r.canceled) toast(t("t_error") + r.error);
}

function bomLabelPlain(w) {
  if (!w.bom || !w.bom.length) return "";
  return w.bom.map((l) => {
    const m = materialById(l.material);
    return `${l.qty} x ${m ? m.name : "?"}`;
  }).join(" + ");
}

async function importExcel() {
  const r = await window.api.importXlsx();
  if (!r || r.canceled) return;
  if (!r.ok) return toast(t("t_error") + r.error);

  let rows = null;
  for (const name of Object.keys(r.sheets)) {
    const sheet = r.sheets[name];
    if (sheet.length && sheet.some((row) => hasKey(row, ["work"]))) { rows = sheet; break; }
  }
  if (!rows) return toast(t("t_nosheet"));

  let added = 0;
  rows.forEach((row) => {
    const work = pick(row, ["work"]);
    if (!work) return;
    const shipDate = normalizeDate(pick(row, ["ship date", "shipped on"]), "");
    const rec = {
      id: uid(),
      date: normalizeDate(pick(row, ["date"])),
      client: String(pick(row, ["client"]) || "").trim(),
      patient: String(pick(row, ["patient", "patient id", "case"]) || "").trim(),
      work: String(work).trim(),
      units: Number(pick(row, ["units"])) || 1,
      doneBy: String(pick(row, ["done by", "operator"]) || "").trim(),
      redo: !!String(pick(row, ["redo"]) || "").trim(),
      courier: String(pick(row, ["courier"]) || "").trim(),
      tracking: String(pick(row, ["tracking", "tracking number"]) || "").trim(),
      note: String(pick(row, ["note", "notes"]) || "").trim()
    };
    rec.shipped = !!(String(pick(row, ["shipped"]) || "").trim() || shipDate);
    rec.shipDate = rec.shipped ? (shipDate || rec.date) : "";

    if (rec.work && !state.config.works.some((x) => x.name === rec.work))
      state.config.works.push({ id: uid(), name: rec.work, listPrice: 0, bom: [] });
    if (rec.doneBy && !operatorNames().includes(rec.doneBy))
      state.config.operators.push({ id: uid(), name: rec.doneBy, works: [] });

    state.works.push(rec);
    added++;
  });

  save();
  buildFilters();
  renderAll();
  toast(`${t("t_imported")} ${added} ${t("t_imported_works")}`);
}

// ===========================================================================
// Utilities
// ===========================================================================
function sum(arr, fn) { return arr.reduce((s, x) => s + fn(x), 0); }

function aggregate(arr, keyFn, valueFn) {
  const o = {};
  arr.forEach((x) => { const k = keyFn(x); o[k] = (o[k] || 0) + valueFn(x); });
  return o;
}

function deepMerge(base, extra) {
  const out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
  Object.keys(extra || {}).forEach((k) => {
    const v = extra[k];
    out[k] = (v && typeof v === "object" && !Array.isArray(v) && base[k] && typeof base[k] === "object")
      ? deepMerge(base[k], v) : v;
  });
  return out;
}

function alpha(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

function monthOf(iso) { return (!iso || iso.length < 7) ? -1 : Number(iso.slice(5, 7)) - 1; }
function monthYear(iso) { const m = monthOf(iso); return m < 0 ? "" : `${months()[m]} ${iso.slice(0, 4)}`; }
function formatDate(iso) {
  if (!iso || iso.length < 10) return iso || "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
function todayISO() {
  const d = new Date(), p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function normalizeDate(v, fallback) {
  const def = fallback === undefined ? todayISO() : fallback;
  if (!v) return def;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/);
  if (m) {
    const y = m[3].length === 2 ? "20" + m[3] : m[3];
    return `${y}-${String(m[2]).padStart(2, "0")}-${String(m[1]).padStart(2, "0")}`;
  }
  const n = Number(s);                             // Excel serial number
  if (!isNaN(n) && n > 20000) return new Date(Math.round((n - 25569) * 86400 * 1000)).toISOString().slice(0, 10);
  return def;
}

// The separators follow the language - 1.234,56 in Italian, 1,234.56 in English
// - but the euro sign always goes after the number, because a column of money
// that puts it in front in one language and behind in another is a column you
// have to read twice.
function money(n) {
  const v = Math.round((Number(n) + Number.EPSILON) * 100) / 100;
  return new Intl.NumberFormat(currentLang(), {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  }).format(v || 0) + " €";
}

// Axis labels: euros, but short enough to breathe (1.2k, 340).
function shortMoney(v) {
  const n = Number(v) || 0;
  const abs = Math.abs(n);
  if (abs >= 1000000) return (n / 1000000).toFixed(1) + "M €";
  if (abs >= 1000) return (n / 1000).toFixed(abs >= 10000 ? 0 : 1) + "k €";
  return Math.round(n) + " €";
}

function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }
function clone(o) { return JSON.parse(JSON.stringify(o)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

function pick(row, keys) {
  const lower = {};
  Object.keys(row).forEach((k) => { lower[k.toLowerCase().trim()] = row[k]; });
  for (const k of keys) if (lower[k] !== undefined && lower[k] !== "") return lower[k];
  return "";
}
function hasKey(row, keys) {
  const set = Object.keys(row).map((k) => k.toLowerCase().trim());
  return keys.some((k) => set.includes(k));
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function escapeAttr(s) { return escapeHtml(s); }

let toastTimer = null;
function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
}
window.toast = toast;
