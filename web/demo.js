"use strict";

// ===========================================================================
// Browser demo shim for Lab Ledger.
//
// The desktop app talks to an Electron backend through `window.api` (load/save
// to a local file, Excel/JSON export dialogs). In the browser there is no
// backend, so this file provides a local-only `window.api`:
//   - data is seeded from sample-data.js and then persisted to the visitor's
//     own localStorage (nothing leaves the browser); the storage key carries a
//     seed version, so a new sample replaces an old one on the next visit;
//   - export / import / backup are disabled in the demo (desktop-only) and
//     simply show a toast pointing to the desktop app;
//   - the update check talks to the same public GitHub REST API the desktop
//     app uses, so the demo shows the real latest release.
//
// This file is loaded right BEFORE app.js, so `window.api` exists by the time
// the app initializes. It is used only for the hosted demo and is never part
// of the packaged desktop build.
// ===========================================================================

(function () {
  // The demo signs itself in as the sample administrator, so the account corner
  // is there to look at. Signing out lands on the real sign-in screen, where
  // both sample accounts work.
  window.LL_DEMO = { autoUser: "admin", hint: "admin / demo  -  operator / demo" };

  // The sample is seeded once and then lives in the visitor's localStorage, so a
  // new sample would never reach anyone who had already opened the demo. The
  // version is part of the key: bump it whenever sample-data.js changes, and
  // returning visitors get the new lab instead of the one they saw last time.
  const SEED_VERSION = 6;
  const STORAGE_KEY = "labledger-demo-data-v" + SEED_VERSION;

  try {
    Object.keys(localStorage)
      .filter((k) => k.indexOf("labledger-demo-data") === 0 && k !== STORAGE_KEY)
      .forEach((k) => localStorage.removeItem(k));
  } catch (_) {}

  const DESKTOP_ONLY = "Available in the desktop app";
  const REPO = "vladpereverzyev/lab-ledger";
  const GITHUB_API_VERSION = "2022-11-28";
  const RELEASE_URL = `https://github.com/${REPO}/releases/latest`;

  // The demo opens the way the app does: light. The toolbar toggle still
  // switches and remembers.

  // The sample lab lives in sample-data.js (shared with the README
  // screenshots) and is loaded just before this file.
  const SAMPLE = {
    works: (window.SAMPLE_DATA && window.SAMPLE_DATA.works) || [],
    config: (window.SAMPLE_DATA && window.SAMPLE_DATA.config) || {},
    users: (window.SAMPLE_DATA && window.SAMPLE_DATA.users) || { business: {}, list: [] },
    history: (window.SAMPLE_DATA && window.SAMPLE_DATA.history) || []
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return clone(SAMPLE);
  }

  function persist(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  function unavailable() {
    try { if (typeof window.toast === "function") window.toast(DESKTOP_ONLY); } catch (_) {}
    return { canceled: true };
  }

  // The demo always runs the newest code, so "installed version" is simply the
  // latest published release - read from the same endpoint the desktop app uses.
  let latestTag = "";
  async function latestRelease() {
    if (latestTag) return latestTag;
    try {
      const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
        headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": GITHUB_API_VERSION }
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const rel = await res.json();
      latestTag = String(rel.tag_name || "").replace(/^v/, "");
    } catch (_) {}
    return latestTag;
  }

  window.api = {
    loadData: async () => load(),
    saveData: async (data) => persist(data),
    dataPath: async () => "localStorage (browser demo)",
    exportJson: async () => unavailable(),
    importJson: async () => unavailable(),
    exportXlsx: async () => unavailable(),
    importXlsx: async () => unavailable(),
    appInfo: async () => ({
      version: (await latestRelease()) || "demo",
      apiVersion: GITHUB_API_VERSION,
      dataPath: "localStorage (browser demo)"
    }),
    checkUpdate: async () => {
      const latest = await latestRelease();
      if (!latest) return { ok: false, error: "GitHub unreachable", url: RELEASE_URL };
      return { ok: true, current: latest, latest, hasUpdate: false, url: RELEASE_URL };
    },
    openExternal: async (url) => { window.open(url, "_blank", "noopener"); }
  };

  // -------------------------------------------------------------------------
  // Demo banner (theme-aware) + reset button.
  // -------------------------------------------------------------------------
  window.addEventListener("DOMContentLoaded", function () {
    const style = document.createElement("style");
    style.textContent =
      ".demo-bar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;" +
      "padding:8px 18px;background:#dc2626;" +
      "border-bottom:1px solid #b91c1c;" +
      "font-size:13px;color:#fff;}" +
      ".demo-bar .badge{display:inline-block;background:#fff;color:#dc2626;font-weight:700;" +
      "padding:7px 14px;border-radius:6px;font-size:13px;}" +
      ".demo-bar .sp{flex:1;}" +
      ".demo-bar a.dl{background:#fff;color:#dc2626;font-weight:700;text-decoration:none;" +
      "padding:7px 14px;border-radius:6px;font-size:13px;}" +
      ".demo-bar a.dl:hover{background:#f3f4f6;}" +
      ".demo-bar button{border:1px solid rgba(255,255,255,.75);background:transparent;color:#fff;" +
      "padding:6px 14px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;}" +
      ".demo-bar button:hover{background:rgba(255,255,255,.15);}";
    document.head.appendChild(style);

    const bar = document.createElement("div");
    bar.className = "demo-bar";
    const info = document.createElement("span");
    info.innerHTML = '<span class="badge">Live Demo</span>';
    const sp = document.createElement("span");
    sp.className = "sp";
    const dl = document.createElement("a");
    dl.className = "dl";
    dl.href = RELEASE_URL;
    dl.target = "_blank";
    dl.rel = "noopener";
    dl.textContent = "Download App";
    const reset = document.createElement("button");
    reset.type = "button";
    reset.textContent = "Reset Demo";
    reset.addEventListener("click", function () {
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
      location.reload();
    });

    bar.appendChild(info);
    bar.appendChild(sp);
    bar.appendChild(dl);
    bar.appendChild(reset);
    document.body.insertBefore(bar, document.body.firstChild);
  });
})();
