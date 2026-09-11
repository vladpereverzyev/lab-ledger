"use strict";

const { app, BrowserWindow, ipcMain, dialog, shell, Menu, net } = require("electron");
const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");
const { buildWorkbook } = require("./excel");

// Local data file: it ALWAYS stays on the user's computer. Path: the app's
// user-data folder.
const DATA_FILE = path.join(app.getPath("userData"), "data.json");

// The only network call the app ever makes: the public GitHub REST API, read
// only, unauthenticated, to learn the latest published release. Nothing about
// the user or their data is sent - see README, "GitHub API".
const GITHUB_OWNER = "vladpereverzyev";
const GITHUB_REPO = "lab-ledger";
const GITHUB_API_VERSION = "2022-11-28";
const RELEASES_PAGE = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;

let mainWindow = null;

// ---------------------------------------------------------------------------
// The companion workbook. Written when the app opens and when it closes, to
// wherever the user pointed it - typically a folder their cloud drive already
// syncs, so the lab's numbers are shareable without anyone installing the app.
// Nothing is uploaded by Lab Ledger itself: it only writes a local file.
// ---------------------------------------------------------------------------
function syncExcel(reason) {
  try {
    if (!fs.existsSync(DATA_FILE)) return { ok: false, error: "no data yet" };
    const state = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    const cfg = (state.config && state.config.excel) || {};
    if (!cfg.enabled || !cfg.path) return { ok: false, skipped: true };
    XLSX.writeFile(buildWorkbook(state, app.getVersion()), cfg.path);
    return { ok: true, path: cfg.path, reason };
  } catch (err) {
    console.error("excel sync failed:", err.message);
    return { ok: false, error: err.message };
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 840,
    minWidth: 940,
    minHeight: 620,
    backgroundColor: "#f5f6f8",
    title: "Lab Ledger",
    icon: path.join(__dirname, "..", "src", "assets", "icon-256.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  Menu.setApplicationMenu(null);
  mainWindow.loadFile(path.join(__dirname, "..", "src", "index.html"));

  // Links always open in the real browser, never inside the app window.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Smoke test: forward the renderer console and quit automatically.
  if (process.env.SMOKE_TEST) {
    mainWindow.webContents.on("console-message", (_e, level, message) => {
      console.log(`[renderer:${level}] ${message}`);
    });
    mainWindow.webContents.on("render-process-gone", (_e, d) =>
      console.log("[render-process-gone]", JSON.stringify(d)));
    mainWindow.webContents.on("did-finish-load", () => {
      setTimeout(() => app.quit(), 2500);
    });
  }

  mainWindow.on("closed", () => { mainWindow = null; });
}

app.whenReady().then(() => {
  createWindow();
  syncExcel("open");
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("before-quit", () => { syncExcel("close"); });

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// ---------------------------------------------------------------------------
// App info
// ---------------------------------------------------------------------------

ipcMain.handle("app:info", async () => ({
  version: app.getVersion(),
  apiVersion: GITHUB_API_VERSION,
  dataPath: DATA_FILE
}));

ipcMain.handle("app:openExternal", async (_event, url) => {
  if (typeof url === "string" && /^https:\/\//.test(url)) await shell.openExternal(url);
});

// ---------------------------------------------------------------------------
// Local persistence
// ---------------------------------------------------------------------------

ipcMain.handle("data:load", async () => {
  try {
    if (!fs.existsSync(DATA_FILE)) return null;
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch (err) {
    return { __error: "Could not read data: " + err.message };
  }
});

ipcMain.handle("data:save", async (_event, data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
    return { ok: true, path: DATA_FILE };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

ipcMain.handle("data:path", async () => DATA_FILE);

// ---------------------------------------------------------------------------
// Companion workbook: pick where it lives, or write it now.
// ---------------------------------------------------------------------------

ipcMain.handle("excel:choose", async () => {
  const res = await dialog.showSaveDialog(mainWindow, {
    title: "Where should the Lab Ledger workbook live?",
    defaultPath: path.join(app.getPath("documents"), "Lab Ledger.xlsx"),
    filters: [{ name: "Excel", extensions: ["xlsx"] }]
  });
  if (res.canceled || !res.filePath) return { canceled: true };
  return { ok: true, path: res.filePath };
});

ipcMain.handle("excel:sync", async () => syncExcel("manual"));

ipcMain.handle("excel:reveal", async (_event, file) => {
  if (file && fs.existsSync(file)) shell.showItemInFolder(file);
});

// ---------------------------------------------------------------------------
// Update check - GitHub REST API
//   GET /repos/{owner}/{repo}/releases/latest
//   https://docs.github.com/rest/releases/releases#get-the-latest-release
// Unauthenticated, so it is subject to the public rate limit (60 requests per
// hour per IP). The renderer asks at most once a day, and only if the user
// left the check switched on.
// ---------------------------------------------------------------------------

function getJson(url) {
  return new Promise((resolve, reject) => {
    const request = net.request({ method: "GET", url });
    request.setHeader("Accept", "application/vnd.github+json");
    request.setHeader("X-GitHub-Api-Version", GITHUB_API_VERSION);
    request.setHeader("User-Agent", `LabLedger/${app.getVersion()} (+https://github.com/${GITHUB_OWNER}/${GITHUB_REPO})`);

    const timer = setTimeout(() => { request.abort(); reject(new Error("timeout")); }, 8000);

    request.on("response", (response) => {
      let body = "";
      response.on("data", (chunk) => { body += chunk; });
      response.on("end", () => {
        clearTimeout(timer);
        if (response.statusCode < 200 || response.statusCode >= 300) {
          return reject(new Error("HTTP " + response.statusCode));
        }
        try { resolve(JSON.parse(body)); }
        catch (err) { reject(err); }
      });
    });
    request.on("error", (err) => { clearTimeout(timer); reject(err); });
    request.end();
  });
}

// Compares "1.2.10" with "1.2.9" the way a human would.
function isNewer(latest, current) {
  const a = String(latest).replace(/^v/, "").split(/[.-]/).map((x) => parseInt(x, 10) || 0);
  const b = String(current).replace(/^v/, "").split(/[.-]/).map((x) => parseInt(x, 10) || 0);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const d = (a[i] || 0) - (b[i] || 0);
    if (d) return d > 0;
  }
  return false;
}

// Of the five files hanging off a release, exactly one is the right one for
// the computer asking. Windows gets the installer rather than the portable
// build: someone who already has Lab Ledger installed wants it replaced, not a
// second copy in Downloads.
function pickAsset(assets) {
  const list = Array.isArray(assets) ? assets : [];
  const find = (re) => list.find((a) => re.test(a.name || ""));
  const asset =
    process.platform === "win32" ? find(/Setup.*\.exe$/i) || find(/\.exe$/i)
    : process.platform === "darwin" ? find(/\.dmg$/i) || find(/-mac\.zip$/i)
    : find(/\.AppImage$/i) || find(/\.deb$/i);
  if (!asset) return null;
  return { name: asset.name, url: asset.browser_download_url, size: asset.size || 0 };
}

ipcMain.handle("update:check", async () => {
  const current = app.getVersion();
  try {
    const rel = await getJson(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`);
    const latest = String(rel.tag_name || rel.name || "").replace(/^v/, "");
    return {
      ok: true,
      current,
      latest: latest || current,
      hasUpdate: !!latest && isNewer(latest, current),
      url: rel.html_url || RELEASES_PAGE,
      publishedAt: rel.published_at || "",
      asset: pickAsset(rel.assets)
    };
  } catch (err) {
    return { ok: false, current, error: err.message, url: RELEASES_PAGE };
  }
});

// The download only ever starts because someone pressed the button: the app
// still never fetches an installer on its own. It lands in the Downloads
// folder under its published name, so it is an ordinary file the user can see,
// keep or delete - not something hidden inside the program.
ipcMain.handle("update:download", async (_event, asset) => {
  if (!asset || !asset.url || !/^https:\/\/github\.com\//.test(asset.url)) {
    return { ok: false, error: "bad asset" };
  }
  const target = path.join(app.getPath("downloads"), path.basename(asset.name || "lab-ledger-update"));

  return new Promise((resolve) => {
    const request = net.request({ method: "GET", url: asset.url });
    request.setHeader("User-Agent", `LabLedger/${app.getVersion()} (+https://github.com/${GITHUB_OWNER}/${GITHUB_REPO})`);

    request.on("response", (response) => {
      if (response.statusCode < 200 || response.statusCode >= 300) {
        return resolve({ ok: false, error: "HTTP " + response.statusCode });
      }
      const total = Number(response.headers["content-length"]) || asset.size || 0;
      const file = fs.createWriteStream(target);
      let done = 0;
      let lastSent = -1;

      // Piped, so a slow disk slows the socket instead of filling memory with
      // eighty megabytes of installer.
      response.pipe(file);

      response.on("data", (chunk) => {
        done += chunk.length;
        // One message per whole percent: enough for a progress bar, not enough
        // to flood the renderer on a fast connection.
        const pct = total ? Math.floor((done / total) * 100) : 0;
        if (pct !== lastSent && mainWindow && !mainWindow.isDestroyed()) {
          lastSent = pct;
          mainWindow.webContents.send("update:progress", { pct, done, total });
        }
      });
      file.on("finish", () => resolve({ ok: true, path: target }));
      file.on("error", (err) => resolve({ ok: false, error: err.message }));
      response.on("error", (err) => {
        file.destroy();
        resolve({ ok: false, error: err.message });
      });
    });
    request.on("error", (err) => resolve({ ok: false, error: err.message }));
    request.end();
  });
});

// Windows and macOS can open the downloaded file and take it from there; the
// app steps out of the way on Windows so the installer can replace its own
// files. A Linux AppImage needs the execute bit set by hand, so there we just
// show the file where it landed.
ipcMain.handle("update:install", async (_event, file) => {
  if (!file || !fs.existsSync(file)) return { ok: false, error: "file missing" };
  if (process.platform === "linux") {
    shell.showItemInFolder(file);
    return { ok: true, revealed: true };
  }
  const err = await shell.openPath(file);
  if (err) return { ok: false, error: err };
  if (process.platform === "win32") setTimeout(() => app.quit(), 1200);
  return { ok: true };
});

// ---------------------------------------------------------------------------
// Export / Import JSON
// ---------------------------------------------------------------------------

ipcMain.handle("json:export", async (_event, data) => {
  const res = await dialog.showSaveDialog(mainWindow, {
    title: "Export backup (JSON)",
    defaultPath: `lab-ledger-backup-${today()}.json`,
    filters: [{ name: "JSON", extensions: ["json"] }]
  });
  if (res.canceled || !res.filePath) return { canceled: true };
  fs.writeFileSync(res.filePath, JSON.stringify(data, null, 2), "utf8");
  return { ok: true, path: res.filePath };
});

ipcMain.handle("json:import", async () => {
  const res = await dialog.showOpenDialog(mainWindow, {
    title: "Import backup (JSON)",
    properties: ["openFile"],
    filters: [{ name: "JSON", extensions: ["json"] }]
  });
  if (res.canceled || res.filePaths.length === 0) return { canceled: true };
  try {
    return { ok: true, data: JSON.parse(fs.readFileSync(res.filePaths[0], "utf8")) };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

// ---------------------------------------------------------------------------
// Export Excel (.xlsx)
// ---------------------------------------------------------------------------

ipcMain.handle("xlsx:export", async (_event, payload) => {
  const res = await dialog.showSaveDialog(mainWindow, {
    title: "Export to Excel",
    defaultPath: `lab-ledger-works-${today()}.xlsx`,
    filters: [{ name: "Excel", extensions: ["xlsx"] }]
  });
  if (res.canceled || !res.filePath) return { canceled: true };
  try {
    const wb = XLSX.utils.book_new();
    const sheets = [
      ["Works", payload.works],
      ["Summary", payload.summary],
      ["Catalog", payload.catalog],
      ["Running costs", payload.costs]
    ];
    sheets.forEach(([name, rows]) => {
      if (rows && rows.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), name);
    });
    XLSX.writeFile(wb, res.filePath);
    return { ok: true, path: res.filePath };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

// ---------------------------------------------------------------------------
// Import Excel (.xlsx) - reads every sheet and returns the raw rows.
// Column mapping happens in the renderer.
// ---------------------------------------------------------------------------

ipcMain.handle("xlsx:import", async () => {
  const res = await dialog.showOpenDialog(mainWindow, {
    title: "Import from Excel",
    properties: ["openFile"],
    filters: [{ name: "Excel", extensions: ["xlsx", "xls"] }]
  });
  if (res.canceled || res.filePaths.length === 0) return { canceled: true };
  try {
    const wb = XLSX.readFile(res.filePaths[0]);
    const out = {};
    wb.SheetNames.forEach((name) => {
      out[name] = XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: "" });
    });
    return { ok: true, sheets: out };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
