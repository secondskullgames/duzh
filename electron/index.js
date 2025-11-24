const { app, BrowserWindow } = require('electron');

const createWindow = async () => {
  const window = new BrowserWindow({
    width: 1280,
    height: 720,
    resizable: false,
    fullscreen: true
  });

  window.setMenuBarVisibility(false);

  await window.loadFile('./build/index.html');
};

app.whenReady().then(createWindow);
