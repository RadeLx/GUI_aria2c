const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    startDownload: (args) => ipcRenderer.invoke('start-download', args),
    onProgress: (callback) => ipcRenderer.on('download-progress', (event, data) => callback(data)),
    terminateDownload: () => ipcRenderer.invoke('terminate-download')
});