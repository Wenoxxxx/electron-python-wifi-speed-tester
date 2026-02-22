const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);