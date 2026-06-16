const { app, BrowserWindow } = require('electron');
const path = require('path');

require('electron-reload')(__dirname, {
  ignored: /node_modules|\.git/,
  electron: path.join(__dirname, 'node_modules', 'electron', 'dist', 'electron.exe')
});

function createWindow() {
  const win = new BrowserWindow({
    width: 400,
    height: 600,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,   // ← add this
      webSecurity: false,        // ← add this
    },
    backgroundColor: '#E8EDF2',
    // icon: __dirname +
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);