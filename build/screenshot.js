// Build-time helper: render the real app UI with sample data and save PNG
// screenshots for the README. Not part of the app runtime.
// Run with: npx electron build/screenshot.js
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

// The sample lab is shared with the browser demo: one lab, one set of
// numbers, whether you look at the README or at the live demo.
const SAMPLE = require("../web/sample-data.js");

ipcMain.handle("data:load", async () => ({
  works: SAMPLE.works, config: SAMPLE.config,
  users: SAMPLE.users, history: SAMPLE.history
}));
ipcMain.handle("data:save", async () => ({ ok: true }));
ipcMain.handle("data:path", async () => "Demo - all data stays on your computer");
ipcMain.handle("app:info", async () => ({
  version: require("../package.json").version,
  apiVersion: "2022-11-28",
  dataPath: "Demo - all data stays on your computer"
}));
// No network during a screenshot run.
ipcMain.handle("update:check", async () => ({ ok: false, error: "offline" }));
ipcMain.handle("app:openExternal", async () => {});

const outDir = path.join(__dirname, "..", "docs");
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// A 24-inch monitor, which is what a lab actually has on the bench.
const WIDTH = 1920, HEIGHT = 1080;

async function shoot() {
  fs.mkdirSync(outDir, { recursive: true });
  const win = new BrowserWindow({
    width: WIDTH, height: HEIGHT, show: false,
    webPreferences: { preload: path.join(__dirname, "..", "electron", "preload.js") }
  });
  await win.loadFile(path.join(__dirname, "..", "src", "index.html"));

  for (const theme of ["dark", "light"]) {
    await shootTheme(win, theme);
  }

  win.destroy();
  console.log("screenshots saved to docs/");
  app.quit();
}

async function shootTheme(win, theme) {
  await win.webContents.executeJavaScript(
    `localStorage.setItem('theme','${theme}'); localStorage.setItem('lang','en');`);
  await win.reload();
  // init() awaits the data file before it draws anything, so give it room.
  await wait(1600);
  // The screenshots are of the app in use, so sign in as the sample
  // administrator rather than photographing the sign-in screen.
  await win.webContents.executeJavaScript(
    "if (window.Chart) Chart.defaults.animation = false;" +
    "Auth.signIn(state.users.list[0]);" +
    "document.querySelector('#gate').hidden = true; applyPermissions(); renderAll();");
  await wait(600);
  const suffix = theme === "dark" ? "" : "-light";

  // [file, tab to click, how tall the shot may grow]
  const shots = [
    [`screenshot-works${suffix}.png`, null, HEIGHT],
    [`screenshot-summary${suffix}.png`, '[data-view="summary"]', 2600],
    [`screenshot-catalog${suffix}.png`, '[data-view="catalog"]', 1500]
  ];

  // Grow the window to the height of the view so a screenshot shows the whole
  // page instead of whatever happened to fit above the fold.
  async function fit(maxHeight) {
    const h = await win.webContents.executeJavaScript(
      "document.querySelector('.view.active').scrollHeight + 120");
    win.setContentSize(WIDTH, Math.max(HEIGHT, Math.min(maxHeight, Math.round(h))));
    await wait(500);
  }

  for (const [file, click, maxHeight] of shots) {
    if (click) {
      await win.webContents.executeJavaScript(`document.querySelector('${click}').click();`);
      await wait(900);
    }
    // The catalog opens on Clients; the work-type recipes are the point of it.
    if (file.indexOf("catalog") >= 0) {
      await win.webContents.executeJavaScript(`document.querySelector('[data-sec="worktypes"]').click();`);
      await wait(400);
    }
    await fit(maxHeight);
    // The window is offscreen, so the compositor is lazy: capturePage can hand
    // back the frame before the last change. Wait for two real frames first.
    await win.webContents.executeJavaScript(
      "new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => r(1))))");
    await wait(250);
    const img = await win.webContents.capturePage();
    fs.writeFileSync(path.join(outDir, file), img.toPNG());
  }
  win.setContentSize(WIDTH, HEIGHT);
}

app.whenReady().then(shoot).catch((e) => { console.error(e); app.exit(1); });
