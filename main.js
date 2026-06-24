const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, dialog, session } = require('electron');
const path = require('path');
const fs = require('fs');

// 启用 HEVC/H.265 解码支持（使用系统级 Media Foundation 解码器）
app.commandLine.appendSwitch('enable-features', 'PlatformHEVCDecoderSupport');
// 启用高 DPI 支持，确保壁纸全屏显示
app.commandLine.appendSwitch('high-dpi-support', '1');
// 禁用 GPU 沙箱（某些系统上导致渲染进程崩溃）
app.commandLine.appendSwitch('disable-gpu-sandbox');
// 禁用 GPU 进程沙箱，避免 GPU 驱动兼容性问题导致白屏
app.commandLine.appendSwitch('no-sandbox');

// 崩溃日志写入文件
const crashLogPath = path.join(app.getPath('userData'), 'crash.log');
function writeCrashLog(msg) {
  try {
    const ts = new Date().toISOString();
    fs.appendFileSync(crashLogPath, `[${ts}] ${msg}\n`);
  } catch {}
}

// 监听 GPU 进程崩溃
app.on('gpu-process-crashed', (event) => {
  const msg = 'GPU process crashed: ' + JSON.stringify(event);
  console.error(msg);
  writeCrashLog(msg);
});

// 防止未捕获异常导致崩溃
process.on('uncaughtException', (err) => {
  const msg = 'Uncaught Exception: ' + err.stack;
  console.error(msg);
  writeCrashLog(msg);
});
process.on('unhandledRejection', (err) => {
  const msg = 'Unhandled Rejection: ' + (err?.stack || err);
  console.error(msg);
  writeCrashLog(msg);
});

const { initConfig, getConfig, setConfig, setConfigs, onConfigChange } = require('./src/main/config');
const IdleDetector = require('./src/main/idleDetector');
const { syncAutoLaunch } = require('./src/main/autoLaunch');

// 防止应用多开
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    windowManager.showSettings();
  });
}

// ========== 窗口管理器 ==========
class WindowManager {
  constructor() {
    this.settingsWindow = null;
    this.screensaverWindow = null;
    this.tutorialWindow = null;
  }

  loadWindowContent(win, query = '') {
    if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
      win.loadURL(`http://localhost:5173${query}`);
    } else {
      const indexPath = path.join(__dirname, 'dist', 'index.html');
      const queryString = query.replace(/^\?/, '');
      if (queryString) {
        win.loadFile(indexPath, { query: { window: queryString.replace('window=', '') } });
      } else {
        win.loadFile(indexPath);
      }
    }
  }

  showSettings() {
    if (this.settingsWindow && !this.settingsWindow.isDestroyed()) {
      this.settingsWindow.show();
      this.settingsWindow.focus();
      return;
    }

    this.settingsWindow = new BrowserWindow({
      width: 800,
      height: 600,
      title: '壁纸屏保设置',
      frame: false,
      titleBarStyle: 'hidden',
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    this.loadWindowContent(this.settingsWindow, '?window=settings');

    // 捕获渲染进程崩溃，自动重新加载
    this.settingsWindow.webContents.on('render-process-gone', (_event, details) => {
      const msg = 'Settings renderer gone: ' + JSON.stringify(details);
      console.error(msg);
      writeCrashLog(msg);
      setTimeout(() => {
        if (this.settingsWindow && !this.settingsWindow.isDestroyed()) {
          this.loadWindowContent(this.settingsWindow, '?window=settings');
        }
      }, 1000);
    });

    // 窗口加载完成后注入窗口类型标识
    this.settingsWindow.webContents.on('did-finish-load', () => {
      this.settingsWindow.webContents.executeJavaScript(
        'window.__WINDOW_TYPE__ = "settings"; document.dispatchEvent(new Event("window-type-ready"));'
      );
    });

    // 关闭时隐藏而非销毁
    this.settingsWindow.on('close', (e) => {
      if (!app.isQuitting) {
        e.preventDefault();
        this.settingsWindow.hide();
      }
    });

    this.settingsWindow.on('closed', () => {
      this.settingsWindow = null;
    });
  }

  showScreensaver() {
    if (this.screensaverWindow && !this.screensaverWindow.isDestroyed()) {
      this.screensaverWindow.show();
      this.screensaverWindow.focus();
      this.screensaverWindow.setFullScreen(true);
      return;
    }

    this.screensaverWindow = new BrowserWindow({
      frame: false,
      skipTaskbar: true,
      show: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    // 先设置全屏再显示，确保任务栏被隐藏
    this.screensaverWindow.setFullScreen(true);
    this.screensaverWindow.show();

    this.loadWindowContent(this.screensaverWindow, '?window=screensaver');

    // 捕获渲染进程崩溃，自动重新加载
    this.screensaverWindow.webContents.on('render-process-gone', (_event, details) => {
      const msg = 'Screensaver renderer gone: ' + JSON.stringify(details);
      console.error(msg);
      writeCrashLog(msg);
      setTimeout(() => {
        if (this.screensaverWindow && !this.screensaverWindow.isDestroyed()) {
          this.loadWindowContent(this.screensaverWindow, '?window=screensaver');
        }
      }, 1000);
    });

    // 窗口加载完成后注入窗口类型标识
    this.screensaverWindow.webContents.on('did-finish-load', () => {
      this.screensaverWindow.webContents.executeJavaScript(
        'window.__WINDOW_TYPE__ = "screensaver"; document.dispatchEvent(new Event("window-type-ready"));'
      );
    });

    this.screensaverWindow.on('closed', () => {
      this.screensaverWindow = null;
      idleDetector.resetScreensaverActive();
    });
  }

  closeScreensaver() {
    if (this.screensaverWindow && !this.screensaverWindow.isDestroyed()) {
      this.screensaverWindow.close();
    }
  }

  showTutorial() {
    if (this.tutorialWindow && !this.tutorialWindow.isDestroyed()) {
      this.tutorialWindow.show();
      this.tutorialWindow.focus();
      return;
    }

    this.tutorialWindow = new BrowserWindow({
      width: 760,
      height: 800,
      title: '新手教程',
      autoHideMenuBar: true,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    const tutorialPath = path.join(__dirname, 'tutorial.html');
    this.tutorialWindow.loadFile(tutorialPath);

    this.tutorialWindow.on('closed', () => {
      this.tutorialWindow = null;
    });
  }

  closeAll() {
    if (this.settingsWindow && !this.settingsWindow.isDestroyed()) {
      this.settingsWindow.removeAllListeners('close');
      this.settingsWindow.close();
    }
    if (this.screensaverWindow && !this.screensaverWindow.isDestroyed()) {
      this.screensaverWindow.close();
    }
    if (this.tutorialWindow && !this.tutorialWindow.isDestroyed()) {
      this.tutorialWindow.close();
    }
  }
}

const windowManager = new WindowManager();

// ========== 闲置检测 ==========
const idleDetector = new IdleDetector();

// ========== 配置 IPC ==========
function registerConfigHandlers() {
  ipcMain.handle('config:get', () => {
    return getConfig();
  });

  ipcMain.handle('app:getVersion', () => {
    return app.getVersion();
  });

  ipcMain.handle('screen:getSize', () => {
    const { screen } = require('electron');
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.size;
    return { width, height, ratio: width / height };
  });

  ipcMain.handle('config:set', (event, key, value) => {
    const newConfig = setConfig(key, value);
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('config:changed', newConfig);
    });
    return newConfig;
  });

  ipcMain.handle('config:setMany', (event, obj) => {
    const newConfig = setConfigs(obj);
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('config:changed', newConfig);
    });
    return newConfig;
  });

  onConfigChange((newConfig) => {
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('config:changed', newConfig);
    });
    syncAutoLaunch(newConfig);
    updateTrayMenu();
    idleDetector.setThreshold(newConfig.idleMinutes, newConfig.idleSeconds);
    idleDetector.setSkipIfFullscreen(newConfig.skipIfFullscreen !== false);
  });
}

// ========== 窗口控制 IPC ==========
function registerWindowHandlers() {
  ipcMain.on('open-settings', () => {
    windowManager.showSettings();
  });

  ipcMain.on('close-screensaver', () => {
    windowManager.closeScreensaver();
  });

  ipcMain.on('start-preview', () => {
    windowManager.showScreensaver();
  });

  ipcMain.on('user-activity', () => {
    windowManager.closeScreensaver();
  });

  ipcMain.on('window:minimize', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.minimize();
  });
}

// ========== 对话框 IPC ==========
function registerDialogHandlers() {
  ipcMain.handle('dialog:openFolder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  });

  ipcMain.handle('dialog:openImages', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: '图片', extensions: ['jpg', 'jpeg', 'png', 'webp', 'bmp'] }],
    });
    if (result.canceled) return [];
    return result.filePaths;
  });

  ipcMain.handle('dialog:openVideos', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: '视频', extensions: ['mp4', 'webm', 'mkv', 'avi', 'hevc', 'h265', 'mov'] }],
    });
    if (result.canceled) return [];
    return result.filePaths;
  });
}

// ========== 壁纸文件扫描 IPC ==========
function registerWallpaperHandlers() {
  const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.bmp']);
  const VIDEO_EXTS = new Set(['.mp4', '.webm', '.mkv', '.avi', '.hevc', '.h265', '.mov']);

  ipcMain.handle('wallpaper:scan', async () => {
    const config = getConfig();
    const wallpaperPath = config.wallpaperPath;
    const extraImages = config.extraImages || [];
    const extraVideos = config.extraVideos || [];
    const allFiles = [];
    const seenPaths = new Set();

    function addFile(filePath, type) {
      const normalized = path.resolve(filePath);
      if (seenPaths.has(normalized)) return;
      seenPaths.add(normalized);
      allFiles.push({ name: path.basename(filePath), path: filePath, type });
    }

    // 扫描文件夹
    if (wallpaperPath) {
      try {
        const entries = await fs.promises.readdir(wallpaperPath, { withFileTypes: true });
        for (const entry of entries) {
          if (!entry.isFile()) continue;
          const ext = path.extname(entry.name).toLowerCase();
          let type = null;
          if (IMAGE_EXTS.has(ext)) type = 'image';
          else if (VIDEO_EXTS.has(ext)) type = 'video';
          if (!type) continue;
          addFile(path.join(wallpaperPath, entry.name), type);
        }
      } catch (err) {
        console.error('Failed to scan wallpaper directory:', err);
      }
    }

    // 添加单独选择的图片
    for (const imgPath of extraImages) {
      addFile(imgPath, 'image');
    }

    // 添加单独选择的视频
    for (const vidPath of extraVideos) {
      addFile(vidPath, 'video');
    }

    return allFiles;
  });
}

// ========== 系统托盘 ==========
let tray = null;

function createTray() {
  try {
    const iconPath = path.join(__dirname, 'assets', 'tray-icon.png');
    const trayIcon = nativeImage.createFromPath(iconPath);
    if (trayIcon.isEmpty()) {
      // 图标文件不存在时用空白图标
      const emptyIcon = nativeImage.createEmpty();
      tray = new Tray(emptyIcon);
    } else {
      tray = new Tray(trayIcon.resize({ width: 16, height: 16 }));
    }
    tray.setToolTip('壁纸屏保');

    updateTrayMenu();

    tray.on('double-click', () => {
      windowManager.showSettings();
    });
  } catch (err) {
    console.error('创建托盘失败:', err);
  }
}

function updateTrayMenu() {
  const config = getConfig();
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '设置',
      click: () => windowManager.showSettings(),
    },
    {
      label: '立即预览',
      click: () => windowManager.showScreensaver(),
    },
    {
      label: '新手教程',
      click: () => windowManager.showTutorial(),
    },
    {
      type: 'separator',
    },
    {
      label: '开机自启',
      type: 'checkbox',
      checked: config.autoStart,
      click: (menuItem) => {
        setConfig('autoStart', menuItem.checked);
        updateTrayMenu();
      },
    },
    {
      type: 'separator',
    },
    {
      label: '退出',
      click: () => {
        app.isQuitting = true;
        windowManager.closeAll();
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
}

// ========== 应用生命周期 ==========
app.whenReady().then(async () => {
  await initConfig();

  // 自动授权媒体权限（系统音频采集需要）
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(true);
  });

  registerConfigHandlers();
  registerWindowHandlers();
  registerDialogHandlers();
  registerWallpaperHandlers();
  createTray();
  syncAutoLaunch(getConfig());

  // 启动闲置检测
  const config = getConfig();
  idleDetector.setThreshold(config.idleMinutes, config.idleSeconds);
  idleDetector.setSkipIfFullscreen(config.skipIfFullscreen !== false);
  idleDetector.onIdle = () => windowManager.showScreensaver();
  idleDetector.onActivity = () => windowManager.closeScreensaver();
  idleDetector.start();

  // 版本记录
  const currentVersion = app.getVersion();
  setConfig('lastVersion', currentVersion);

  // 首次启动时自动打开设置窗口（firstRun 由前端 WelcomeDialog 关闭后设为 false）
  if (config.firstRun) {
    windowManager.showSettings();
  }
});

// 所有窗口关闭时不退出应用（托盘常驻）
app.on('window-all-closed', (e) => {
  // 不退出，保持托盘运行
});

app.on('before-quit', () => {
  app.isQuitting = true;
});
