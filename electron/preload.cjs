const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getInfo: () => ipcRenderer.invoke('platform:getInfo'),
  saveFile: (opts) => ipcRenderer.invoke('dialog:saveFile', opts),
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  isElectron: true,
});
