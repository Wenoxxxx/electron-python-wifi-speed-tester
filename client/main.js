const { app, BrowserWindow } = require('electron');
const path = require('path');

// Enable live reload for development
require('electron-reload')(__dirname, {
  ignored: /node_modules|\.git/,
  electron: path.join(__dirname, 'node_modules', 'electron', 'dist', 'electron.exe')
});

function createWindow() {
  const win = new BrowserWindow({
    width: 400,
    height: 510,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    webPreferences: {
      nodeIntegration: true,
    },
    backgroundColor: '#1a1a2e',
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);
