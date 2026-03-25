const { app, BrowserWindow, Notification, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

let mainWindow;
let tray;

const isDev = process.env.NODE_ENV === 'development';
const CLIENT_URL = isDev ? 'http://localhost:3000' : (process.env.SERVER_URL || 'http://localhost:5001');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 400,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(CLIENT_URL);

  if (isDev) mainWindow.webContents.openDevTools();
}

function createTray() {
  tray = new Tray(nativeImage.createEmpty());
  const contextMenu = Menu.buildFromTemplate([
    { label: 'My AI 열기', click: () => mainWindow.show() },
    { label: '새로고침', click: () => mainWindow.reload() },
    { type: 'separator' },
    { label: '종료', click: () => app.quit() },
  ]);
  tray.setToolTip('My AI - 생활 대시보드');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => mainWindow.show());
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  const { startNotifier } = require('./notifier');
  startNotifier();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
