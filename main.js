import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { spawn } from 'child_process';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


function createWindow() {
    const win = new BrowserWindow({
        width: 500,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false
        },
        autoHideMenuBar: true,
    });

    if (process.env.NODE_ENV === 'development') {
        win.loadURL('http://localhost:5173');
    } else {
        win.loadFile(path.join(__dirname, 'dist', 'index.html'));
    }
}

app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

let aria2cProcess = null;

ipcMain.handle('start-download', async (event, { url, x, s }) => {
    const downloadsDir = path.join(os.homedir(), 'Downloads');
    const aria2cPath = app.isPackaged
        ? path.join(process.resourcesPath, 'aria', 'aria2c.exe')
        : path.join(__dirname, 'aria', 'aria2c.exe');
    const args = ['-x', x, '-s', s, '--dir', downloadsDir, url];

    aria2cProcess = spawn(aria2cPath, args);

    let progress = 0;
    let output = '';

    aria2cProcess.stdout.on('data', (data) => {
        const outputLine = data.toString();
        output = outputLine.replace(/^\s+/, '');
        const progressMatch = outputLine.match(/\((\d+)%\)/);
        if (progressMatch) progress = parseInt(progressMatch[1]);

        event.sender.send('download-progress', { progress, output });
    });

    aria2cProcess.on('close', (code) => {
        event.sender.send('download-progress', { progress: code === 0 ? 100 : progress, output });
        aria2cProcess = null;
    });

    return 'Download started';
});

ipcMain.handle('terminate-download', async () => {
    if (aria2cProcess) {
        aria2cProcess.kill();
        aria2cProcess = null;
        return 'Download terminated';
    }
    return 'No active download';
});