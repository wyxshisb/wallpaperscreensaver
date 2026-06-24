const { app } = require('electron');
const { execSync } = require('child_process');

const REG_KEY = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run';
const REG_VALUE = 'WallpaperScreensaver';

function getAppPath() {
  if (!app.isPackaged) {
    // 开发模式：electron.exe 路径 + 项目路径参数
    const exePath = process.execPath;
    const projectPath = app.getAppPath();
    return `"${exePath}" "${projectPath}"`;
  }
  // 生产模式：打包后的 exe 路径
  return `"${app.getPath('exe')}"`;
}

function enable() {
  try {
    const appPath = getAppPath();
    execSync(`reg add "${REG_KEY}" /v "${REG_VALUE}" /t REG_SZ /d "${appPath}" /f`, {
      windowsHide: true,
    });
    return true;
  } catch (e) {
    console.error('启用开机自启失败:', e.message);
    return false;
  }
}

function disable() {
  try {
    execSync(`reg delete "${REG_KEY}" /v "${REG_VALUE}" /f`, {
      windowsHide: true,
    });
    return true;
  } catch (e) {
    // 键值不存在时 reg delete 也会报错，属于正常情况
    console.error('禁用开机自启失败:', e.message);
    return false;
  }
}

function isEnabled() {
  try {
    const output = execSync(
      `reg query "${REG_KEY}" /v "${REG_VALUE}"`,
      { encoding: 'utf8', windowsHide: true }
    );
    return output.includes(REG_VALUE);
  } catch (e) {
    // 键值不存在时 reg query 会报错，返回 false
    return false;
  }
}

function syncAutoLaunch(config) {
  if (config.autoStart) {
    enable();
  } else {
    disable();
  }
}

module.exports = { enable, disable, isEnabled, syncAutoLaunch };
