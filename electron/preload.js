"use strict";

const { contextBridge, ipcRenderer } = require("electron");

// Safe API exposed to the renderer. No direct Node access from the frontend.
contextBridge.exposeInMainWorld("api", {
  loadData: () => ipcRenderer.invoke("data:load"),
  saveData: (data) => ipcRenderer.invoke("data:save", data),
  dataPath: () => ipcRenderer.invoke("data:path"),
  exportJson: (data) => ipcRenderer.invoke("json:export", data),
  importJson: () => ipcRenderer.invoke("json:import"),
  exportXlsx: (payload) => ipcRenderer.invoke("xlsx:export", payload),
  importXlsx: () => ipcRenderer.invoke("xlsx:import"),
  appInfo: () => ipcRenderer.invoke("app:info"),
  checkUpdate: () => ipcRenderer.invoke("update:check"),
  downloadUpdate: (asset) => ipcRenderer.invoke("update:download", asset),
  installUpdate: (file) => ipcRenderer.invoke("update:install", file),
  onUpdateProgress: (cb) => ipcRenderer.on("update:progress", (_e, p) => cb(p)),
  openExternal: (url) => ipcRenderer.invoke("app:openExternal", url),
  chooseExcel: () => ipcRenderer.invoke("excel:choose"),
  syncExcel: () => ipcRenderer.invoke("excel:sync"),
  revealExcel: (file) => ipcRenderer.invoke("excel:reveal", file)
});
