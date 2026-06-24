const defaultConfig = {
  // 壁纸源
  wallpaperPath: '',        // 本地壁纸文件夹路径
  extraImages: [],          // 单独添加的图片文件路径
  extraVideos: [],          // 单独添加的视频文件路径

  // 闲置触发
  idleMinutes: 5,           // 闲置触发时间（分钟）
  idleSeconds: 0,           // 闲置触发时间（秒）
  skipIfFullscreen: true,   // 其他应用全屏时不触发屏保

  // 视频设置
  videoBehavior: 'loop',    // 视频播放完毕行为：loop/switch
  volume: 0,                // 视频音量 (0-100)

  // 壁纸展示
  switchInterval: 30,       // 图片切换间隔（秒）
  transitionEffect: 'fade', // 过渡动画：fade/zoom/slide/blur
  imageFit: 'cover',        // 缩放模式：cover/contain/stretch
  wallpaperFilter: 'none',  // 滤镜：none/dim/blur/grayscale/sepia/saturate/contrast/cool/warm/invert/vignette
  filterIntensity: 30,      // 滤镜强度 (0-100)
  kenBurns: true,           // Ken Burns 效果：缓慢平移缩放
  kenBurnsSpeed: 40,        // Ken Burns 动画速度 (10-100，数值越大越慢)

  // 时钟样式
  showTime: true,            // 显示时间数字
  showDate: true,            // 显示日期
  clockPreset: 'frosted',    // 预设主题：swiss/brutalist/stencil/bauhaus/noir/letterpress/obelisk/parchment/frosted/aurora/glacier/synthwave
  clockStyle: 'glass',       // 时钟样式：glass/solid/hollow/liquid/minimal/outline/neon
  clockAlign: 'center',      // 文本对齐：left/center/right
  clockFontSize: 120,       // 时钟字号
  clockColor: '#FFFFFF',    // 时钟颜色
  clockFormat: '24h',       // 12h/24h
  showSeconds: true,        // 显示秒数
  clockFont: 'system',      // 字体：system/serif/mono/elegant
  clockPosition: { x: 0.5, y: 0.5 }, // 时钟位置（0~1）
  glassBlur: 24,            // 毛玻璃模糊强度 (0-50)
  glassOpacity: 8,          // 毛玻璃背景透明度 (0-30)
  glassRadius: 24,          // 毛玻璃圆角 (0-48)
  autoColor: false,         // 智能配色：根据壁纸亮度自动调整时钟颜色

  // 信息展示
  showWeather: false,       // 显示天气
  showLunar: false,         // 显示农历/节日
  showQuote: false,         // 显示座右铭
  customQuotes: [],         // 自定义名言列表（优先于在线名言）
  showBattery: false,       // 显示电池状态
  showCountdown: false,     // 显示倒计时
  countdowns: [],           // 倒计时事件列表 [{ name, date, color }]

  // 通用
  autoStart: false,         // 开机自启
  firstRun: true,           // 首次启动标记
  lastVersion: '',          // 上次运行的版本号（用于检测更新）
};

let store = null;

async function initConfig() {
  const { default: Store } = await import('electron-store');
  store = new Store({
    name: 'wallpaper-screensaver-config',
    defaults: defaultConfig,
  });
  return store;
}

function getConfig() {
  return store ? store.store : { ...defaultConfig };
}

function setConfig(key, value) {
  if (!store) return { ...defaultConfig };
  store.set(key, value);
  return store.store;
}

function setConfigs(obj) {
  if (!store) return { ...defaultConfig };
  store.set(obj);
  return store.store;
}

function onConfigChange(callback) {
  if (!store) return;
  store.onDidAnyChange((newValue, oldValue) => {
    callback(newValue, oldValue);
  });
}

module.exports = { store, initConfig, getConfig, setConfig, setConfigs, onConfigChange };
