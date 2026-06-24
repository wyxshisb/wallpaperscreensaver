const { powerMonitor } = require('electron');
const { isOtherAppFullscreen } = require('./fullscreenDetector');

class IdleDetector {
  constructor() {
    this.intervalId = null;
    this.idleThreshold = 300; // 默认 5 分钟（秒）
    this.isScreensaverActive = false;
    this.skipIfFullscreen = true; // 其他应用全屏时不触发
    this.onIdle = null; // 闲置触发回调
    this.onActivity = null; // 用户恢复活动回调
  }

  /**
   * 设置闲置阈值
   * @param {number} minutes - 分钟
   * @param {number} seconds - 秒
   */
  setThreshold(minutes, seconds) {
    this.idleThreshold = (minutes || 0) * 60 + (seconds || 0);
  }

  /**
   * 设置是否跳过全屏应用
   * @param {boolean} skip
   */
  setSkipIfFullscreen(skip) {
    this.skipIfFullscreen = skip;
  }

  /**
   * 重置屏保活跃标志（屏保窗口关闭时调用）
   */
  resetScreensaverActive() {
    this.isScreensaverActive = false;
  }

  /**
   * 启动闲置检测
   */
  start() {
    this.stop();
    this.intervalId = setInterval(() => {
      const idleTime = powerMonitor.getSystemIdleTime();

      if (!this.isScreensaverActive && idleTime >= this.idleThreshold) {
        // Check if another app is fullscreen (skip if so)
        if (this.skipIfFullscreen && isOtherAppFullscreen()) {
          return; // Don't trigger screensaver
        }
        this.isScreensaverActive = true;
        if (this.onIdle) this.onIdle();
      } else if (this.isScreensaverActive && idleTime === 0) {
        this.isScreensaverActive = false;
        if (this.onActivity) this.onActivity();
      }
    }, 1000);
  }

  /**
   * 停止闲置检测
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

module.exports = IdleDetector;
