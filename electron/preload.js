"use strict";

const { contextBridge, ipcRenderer } = require("electron");

// Safe API exposed to the renderer. No direct Node access from the frontend.
contextBridge.exposeInMainWorld("api", {
  loadData: () => ipcRenderer.invoke("data:load"),
  saveData: (data) => ipcRenderer.invoke("data:save", data),
  saveDataSync: (data) => ipcRenderer.sendSync("data:saveSync", data),
  saveRecovery: (payload) => ipcRenderer.invoke("recovery:save", payload),
  readRecovery: () => ipcRenderer.invoke("recovery:read"),
  exportJson: (data, title) => ipcRenderer.invoke("json:export", data, title),
  exportEncrypted: (text, title) => ipcRenderer.invoke("json:exportEncrypted", text, title),
  importText: (title) => ipcRenderer.invoke("json:importText", title),
  exportXlsx: (payload, title) => ipcRenderer.invoke("xlsx:export", payload, title),
  importXlsx: (title) => ipcRenderer.invoke("xlsx:import", title),
  appInfo: () => ipcRenderer.invoke("app:info"),
  checkUpdate: () => ipcRenderer.invoke("update:check"),
  downloadUpdate: (asset) => ipcRenderer.invoke("update:download", asset),
  installUpdate: (file) => ipcRenderer.invoke("update:install", file),
  onUpdateProgress: (cb) => ipcRenderer.on("update:progress", (_e, p) => cb(p)),
  openExternal: (url) => ipcRenderer.invoke("app:openExternal", url),
  chooseExcel: (title) => ipcRenderer.invoke("excel:choose", title),
  syncExcel: () => ipcRenderer.invoke("excel:sync")
});
