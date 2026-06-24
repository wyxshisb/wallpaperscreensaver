import { useState, useEffect, useRef, useCallback } from 'react';
import { useConfig } from '../hooks/useConfig';
import './ScreensaverApp.css';

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(date, format24h, showSeconds) {
  let h = date.getHours();
  let ampm = '';
  if (!format24h) {
    ampm = h >= 12 ? ' PM' : ' AM';
    h = h % 12 || 12;
  }
  const hStr = String(h).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return showSeconds ? `${hStr}:${m}:${s}${ampm}` : `${hStr}:${m}${ampm}`;
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const w = weekdays[date.getDay()];
  return `${y}年${m}月${d}日 星期${w}`;
}

// 计算倒计时（返回天、时、分）
function calcCountdown(targetDate) {
  const now = new Date();
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diff = target - now;
  const days = Math.round(diff / 86400000);
  return days;
}

function getLunarInfo(date) {
  try {
    const { Solar } = require('lunar-javascript');
    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();
    const lunarDayStr = lunar.getDayInChinese();
    const lunarMonthStr = lunar.getMonthInChinese();
    let result = `农历${lunarMonthStr}月${lunarDayStr}`;

    // 节气
    const jieQi = lunar.getCurrentJieQi();
    if (jieQi) {
      result += ` ${jieQi.getName()}`;
    }

    // 传统节日
    const festivals = lunar.getFestivals();
    if (festivals && festivals.length > 0) {
      result += ` ${festivals[0]}`;
    }

    return result;
  } catch {
    return '';
  }
}

function toFileURL(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  return `file:///${normalized.replace(/^\/+/, '')}`;
}

// 生成随机 Ken Burns 动画参数
function genKenBurns(speed) {
  const duration = (speed || 40) * 0.8 + 20; // 28s ~ 100s
  const directions = [
    { sx: 1.0, sy: 1.0, ex: 1.12, ey: 1.12, tx: '0%', ty: '0%', ttx: '-3%', tty: '-3%' },
    { sx: 1.12, sy: 1.12, ex: 1.0, ey: 1.0, tx: '-3%', ty: '-3%', ttx: '0%', tty: '0%' },
    { sx: 1.05, sy: 1.05, ex: 1.15, ey: 1.15, tx: '-2%', ty: '2%', ttx: '-4%', tty: '0%' },
    { sx: 1.1, sy: 1.1, ex: 1.0, ey: 1.0, tx: '2%', ty: '-2%', ttx: '0%', tty: '0%' },
    { sx: 1.08, sy: 1.08, ex: 1.16, ey: 1.16, tx: '2%', ty: '2%', ttx: '0%', tty: '-4%' },
    { sx: 1.15, sy: 1.15, ex: 1.05, ey: 1.05, tx: '-3%', ty: '-3%', ttx: '2%', tty: '2%' },
  ];
  const d = directions[Math.floor(Math.random() * directions.length)];
  return { ...d, duration };
}

// 分析图片亮度，返回 { isDark, brightness }
function analyzeImageBrightness(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const w = 25, h = 25;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;
        let total = 0;
        for (let i = 0; i < data.length; i += 4) {
          // 感知亮度公式
          total += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        }
        const brightness = total / (data.length / 4);
        resolve({ isDark: brightness < 128, brightness });
      } catch {
        resolve({ isDark: true, brightness: 0 });
      }
    };
    img.onerror = () => resolve({ isDark: true, brightness: 0 });
    img.src = src;
  });
}

const WEATHER_ICONS = {
  'Clear': '☀️', 'Sunny': '☀️', 'Partly cloudy': '⛅', 'Cloudy': '☁️',
  'Overcast': '🌥️', 'Mist': '🌫️', 'Fog': '🌫️', 'Light rain': '🌦️',
  'Rain': '🌧️', 'Heavy rain': '⛈️', 'Snow': '🌨️', 'Thunderstorm': '⛈️',
};

export default function ScreensaverApp() {
  const { config, setConfig } = useConfig();
  const [files, setFiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playlist, setPlaylist] = useState([]);
  const [time, setTime] = useState(new Date());

  // Crossfade: two image layers
  const [frontSrc, setFrontSrc] = useState('');
  const [backSrc, setBackSrc] = useState('');
  const [showFront, setShowFront] = useState(true);

  // Ken Burns: per-image random animation params
  const [frontKB, setFrontKB] = useState(null);
  const [backKB, setBackKB] = useState(null);

  // Info state
  const [weather, setWeather] = useState(null);
  const [quote, setQuote] = useState('');
  const [battery, setBattery] = useState(null);

  // 智能配色：分析壁纸亮度
  const [autoClockColor, setAutoClockColor] = useState(null);
  const [autoGlassBg, setAutoGlassBg] = useState(null);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, cx: 0, cy: 0 });

  const lastMousePos = useRef({ x: 0, y: 0 });
  const switchTimerRef = useRef(null);
  const videoRef = useRef(null);
  const currentIndexRef = useRef(0);
  const playlistRef = useRef([]);
  const filesRef = useRef([]);
  const showFrontRef = useRef(true);
  const containerRef = useRef(null);
  const quoteTimerRef = useRef(null);
  const weatherTimerRef = useRef(null);

  // Keep refs in sync
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { playlistRef.current = playlist; }, [playlist]);
  useEffect(() => { filesRef.current = files; }, [files]);
  useEffect(() => { showFrontRef.current = showFront; }, [showFront]);

  // Scan wallpaper files on mount
  useEffect(() => {
    async function scan() {
      const result = await window.electronAPI.wallpaper.scan();
      if (result.length > 0) {
        const shuffled = shuffleArray(result);
        setFiles(result);
        setPlaylist(shuffled);
        setCurrentIndex(0);
        if (shuffled[0]?.type === 'image') {
          setFrontSrc(toFileURL(shuffled[0].path));
          setFrontKB(genKenBurns(config?.kenBurnsSpeed));
        }
        // If first file is video, the render will show <video> automatically
      }
    }
    scan();
  }, []);

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 智能配色：分析当前壁纸亮度
  const activeSrc = showFront ? frontSrc : backSrc;
  useEffect(() => {
    if (!config?.autoColor || !activeSrc) {
      setAutoClockColor(null);
      setAutoGlassBg(null);
      return;
    }
    let cancelled = false;
    analyzeImageBrightness(activeSrc).then(({ isDark }) => {
      if (cancelled) return;
      // 暗壁纸 → 白色文字 + 白色毛玻璃；亮壁纸 → 深色文字 + 黑色毛玻璃
      setAutoClockColor(isDark ? '#FFFFFF' : '#1A1A1A');
      setAutoGlassBg(isDark);
    });
    return () => { cancelled = true; };
  }, [activeSrc, config?.autoColor]);

  // Quote
  useEffect(() => {
    if (config?.showQuote) {
      const pickQuote = () => {
        const custom = config.customQuotes;
        if (custom && custom.length > 0) {
          return custom[Math.floor(Math.random() * custom.length)];
        }
        return 'One Step Ahead';
      };
      setQuote(pickQuote());
      quoteTimerRef.current = setInterval(() => {
        setQuote(pickQuote());
      }, 3600000); // 1 hour
    }
    return () => {
      if (quoteTimerRef.current) clearInterval(quoteTimerRef.current);
    };
  }, [config?.showQuote, config?.customQuotes]);

  // Weather
  useEffect(() => {
    if (!config?.showWeather) return;

    async function fetchWeather() {
      try {
        const res = await fetch('https://wttr.in/?format=j1');
        const data = await res.json();
        const area = data.nearest_area?.[0];
        const current = data.current_condition?.[0];
        if (area && current) {
          const desc = current.weatherDesc?.[0]?.value || '';
          const icon = WEATHER_ICONS[desc] || '🌤️';
          setWeather({
            temp: current.temp_C,
            desc,
            icon,
            city: area.areaName?.[0]?.value || '',
          });
        }
      } catch {
        // Silently fail
      }
    }

    fetchWeather();
    weatherTimerRef.current = setInterval(fetchWeather, 1800000); // 30 min
    return () => {
      if (weatherTimerRef.current) clearInterval(weatherTimerRef.current);
    };
  }, [config?.showWeather]);

  // Battery
  useEffect(() => {
    if (!config?.showBattery) return;

    async function updateBattery() {
      try {
        if (!navigator.getBattery) {
          setBattery(null);
          return;
        }
        const bm = await navigator.getBattery();
        setBattery({
          level: Math.round(bm.level * 100),
          charging: bm.charging,
        });

        const handler = () => {
          setBattery({
            level: Math.round(bm.level * 100),
            charging: bm.charging,
          });
        };
        bm.addEventListener('levelchange', handler);
        bm.addEventListener('chargingchange', handler);
        return () => {
          bm.removeEventListener('levelchange', handler);
          bm.removeEventListener('chargingchange', handler);
        };
      } catch {
        setBattery(null);
      }
    }

    updateBattery();
  }, [config?.showBattery]);

  // User activity detection
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Don't trigger activity if dragging clock
      if (isDragging) return;

      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      if (Math.sqrt(dx * dx + dy * dy) > 5) {
        window.electronAPI.sendUserActivity();
      }
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleKeyDown = () => {
      window.electronAPI.sendUserActivity();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDragging]);

  // Get current file
  const currentFile = playlist[currentIndex] || null;

  // Go to next wallpaper
  const goNext = useCallback(() => {
    const pl = playlistRef.current;
    const ci = currentIndexRef.current;
    const sf = showFrontRef.current;
    const nextIndex = ci + 1;

    let nextFile;
    if (nextIndex >= pl.length) {
      const reshuffled = shuffleArray(filesRef.current);
      setPlaylist(reshuffled);
      setCurrentIndex(0);
      nextFile = reshuffled[0];
    } else {
      setCurrentIndex(nextIndex);
      nextFile = pl[nextIndex];
    }

    if (nextFile?.type === 'image') {
      const src = toFileURL(nextFile.path);
      const kb = genKenBurns(config?.kenBurnsSpeed);
      if (sf) { setBackSrc(src); setBackKB(kb); } else { setFrontSrc(src); setFrontKB(kb); }
      setShowFront((prev) => !prev);
    } else if (nextFile?.type === 'video') {
      // Clear stale image sources when switching to video
      setFrontSrc('');
      setBackSrc('');
    }
  }, [config?.kenBurnsSpeed]);

  // Image auto-switch timer
  useEffect(() => {
    if (switchTimerRef.current) {
      clearInterval(switchTimerRef.current);
      switchTimerRef.current = null;
    }

    if (!currentFile || currentFile.type !== 'image' || !config) return;

    const interval = (config.switchInterval || 30) * 1000;
    switchTimerRef.current = setInterval(() => {
      goNext();
    }, interval);

    return () => {
      if (switchTimerRef.current) {
        clearInterval(switchTimerRef.current);
      }
    };
  }, [currentIndex, currentFile, config, goNext]);

  // Video volume sync
  useEffect(() => {
    if (videoRef.current && config) {
      videoRef.current.volume = (config.volume || 0) / 100;
    }
  }, [currentFile, config]);

  const handleVideoEnded = useCallback(() => {
    if (!config) return;
    if (config.videoBehavior !== 'loop') {
      goNext();
    }
  }, [config, goNext]);

  // Drag handlers for clock container
  const handleDragStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = config?.clockPosition || { x: 0.5, y: 0.5 };
    const currentAlign = config?.clockAlign || 'center';
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      cx: pos.x,
      cy: pos.y,
      align: currentAlign,
    };
    setIsDragging(true);
  }, [config]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e) => {
      const start = dragStartRef.current;
      const dx = (e.clientX - start.x) / window.innerWidth;
      const dy = (e.clientY - start.y) / window.innerHeight;
      const newX = Math.max(0, Math.min(1, start.cx + dx));
      const newY = Math.max(0, Math.min(1, start.cy + dy));
      if (containerRef.current) {
        containerRef.current.style.left = `${newX * 100}%`;
        containerRef.current.style.top = `${newY * 100}%`;
        const a = start.align;
        containerRef.current.style.transform = a === 'left' ? 'translate(0, -50%)'
          : a === 'right' ? 'translate(-100%, -50%)'
          : 'translate(-50%, -50%)';
      }
    };

    const handleUp = (e) => {
      setIsDragging(false);
      const start = dragStartRef.current;
      const dx = (e.clientX - start.x) / window.innerWidth;
      const dy = (e.clientY - start.y) / window.innerHeight;
      const newX = Math.max(0, Math.min(1, start.cx + dx));
      const newY = Math.max(0, Math.min(1, start.cy + dy));
      setConfig('clockPosition', { x: newX, y: newY });
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging, setConfig]);

  if (!config || playlist.length === 0) {
    return <div className="screensaver-app screensaver-empty" />;
  }

  // 智能配色覆盖
  const effectiveColor = config.autoColor && autoClockColor ? autoClockColor : (config.clockColor || '#FFFFFF');
  const effectiveGlassIsDark = config.autoColor ? autoGlassBg : true; // 默认白色毛玻璃
  const glassR = effectiveGlassIsDark ? 255 : 0;
  const glassG = effectiveGlassIsDark ? 255 : 0;
  const glassB = effectiveGlassIsDark ? 255 : 0;

  const clockStyle = {
    fontSize: `${config.clockFontSize || 120}px`,
    color: effectiveColor,
  };

  const pos = config.clockPosition || { x: 0.5, y: 0.5 };
  const align = config.clockAlign || 'center';
  const glassBlur = config.glassBlur ?? 24;
  const glassOpacity = config.glassOpacity ?? 8;
  const glassRadius = config.glassRadius ?? 24;
  const glassAlpha = glassOpacity / 100;

  // Alignment-based transform
  const alignTransform = align === 'left' ? 'translate(0, -50%)'
    : align === 'right' ? 'translate(-100%, -50%)'
    : 'translate(-50%, -50%)';

  const containerStyle = {
    left: `${pos.x * 100}%`,
    top: `${pos.y * 100}%`,
    transform: alignTransform,
    borderRadius: `${glassRadius}px`,
    '--glass-blur': `${glassBlur}px`,
    '--glass-bg': `rgba(${glassR}, ${glassG}, ${glassB}, ${glassAlpha})`,
    '--glass-bg-1': `rgba(${glassR}, ${glassG}, ${glassB}, ${glassAlpha * 1.5})`,
    '--glass-bg-2': `rgba(${glassR}, ${glassG}, ${glassB}, ${glassAlpha * 0.5})`,
    '--glass-bg-3': `rgba(${glassR}, ${glassG}, ${glassB}, ${glassAlpha * 1.25})`,
    '--glass-bg-4': `rgba(${glassR}, ${glassG}, ${glassB}, ${glassAlpha * 0.25})`,
    '--glass-radius': `${glassRadius}px`,
  };

  const transitionClass = config.transitionEffect && config.transitionEffect !== 'fade'
    ? `transition-${config.transitionEffect}`
    : '';

  const filterClass = config.wallpaperFilter && config.wallpaperFilter !== 'none'
    ? `filter-${config.wallpaperFilter}`
    : '';

  const fitClass = config.imageFit === 'contain' ? 'fit-contain'
    : config.imageFit === 'stretch' ? 'fit-stretch'
    : '';

  const clockStyleType = config.clockStyle || 'glass';
  const fontClass = config.clockFont && config.clockFont !== 'system'
    ? `font-${config.clockFont}`
    : '';

  const clockStyleClass = `clock-style-${clockStyleType}`;
  const alignClass = `clock-align-${align}`;

  // Filter CSS variable
  const filterStyle = {};
  const intensity = (config.filterIntensity || 30) / 100;
  if (config.wallpaperFilter === 'dim') {
    filterStyle['--filter-value'] = `${1 - intensity}`;
  } else if (config.wallpaperFilter === 'blur') {
    filterStyle['--filter-value'] = `${(config.filterIntensity || 30) / 3}px`;
  } else if (config.wallpaperFilter === 'grayscale') {
    filterStyle['--filter-value'] = `${intensity}`;
  } else if (config.wallpaperFilter === 'sepia') {
    filterStyle['--filter-value'] = `${intensity}`;
  } else if (config.wallpaperFilter === 'saturate') {
    filterStyle['--filter-value'] = `${1 + intensity * 2}`;
  } else if (config.wallpaperFilter === 'contrast') {
    filterStyle['--filter-value'] = `${1 + intensity}`;
    filterStyle['--filter-brightness'] = `${1 - intensity * 0.15}`;
  } else if (config.wallpaperFilter === 'cool') {
    filterStyle['--filter-value'] = `${intensity * 30}deg`;
    filterStyle['--filter-sat'] = `${1 - intensity * 0.15}`;
    filterStyle['--filter-bright'] = `${1 - intensity * 0.1}`;
  } else if (config.wallpaperFilter === 'warm') {
    filterStyle['--filter-value'] = `${-intensity * 25}deg`;
    filterStyle['--filter-sat'] = `${1 + intensity * 0.15}`;
    filterStyle['--filter-bright'] = `${1 + intensity * 0.08}`;
  } else if (config.wallpaperFilter === 'invert') {
    filterStyle['--filter-value'] = `${intensity * 0.9}`;
  } else if (config.wallpaperFilter === 'vignette') {
    const alpha = 0.2 + intensity * 0.6;
    filterStyle['--vignette-color'] = `rgba(0, 0, 0, ${alpha})`;
  }

  const currentVideoSrc = currentFile?.type === 'video' ? toFileURL(currentFile.path) : '';

  const lunarInfo = config.showLunar ? getLunarInfo(time) : '';
  const hasInfoBelow = config.showLunar || config.showWeather || config.showQuote || config.showBattery || config.showCountdown;

  // 倒计时列表（最多3个，按日期排序）
  const countdowns = (config.showCountdown && config.countdowns?.length)
    ? [...config.countdowns]
        .map(c => ({ ...c, days: calcCountdown(c.date) }))
        .sort((a, b) => a.days - b.days)
        .slice(0, 3)
    : [];

  // Ken Burns 样式
  const kenBurnsEnabled = config.kenBurns !== false;
  const kbStyle = (kb) => {
    if (!kenBurnsEnabled || !kb) return {};
    return {
      animation: `kenBurns ${kb.duration}s ease-in-out alternate infinite`,
      '--kb-sx': kb.sx, '--kb-sy': kb.sy,
      '--kb-ex': kb.ex, '--kb-ey': kb.ey,
      '--kb-tx': kb.tx, '--kb-ty': kb.ty,
      '--kb-ttx': kb.ttx, '--kb-tty': kb.tty,
    };
  };

  return (
    <div className="screensaver-app">
      {/* Wallpaper layer */}
      <div className={`wallpaper-layer ${transitionClass} ${filterClass}`} style={filterStyle}>
        {currentFile?.type === 'image' ? (
          <>
            <img
              className={`wallpaper-img ${showFront ? 'visible' : 'hidden'} ${fitClass} ${kenBurnsEnabled ? 'ken-burns' : ''}`}
              src={frontSrc}
              alt=""
              draggable={false}
              style={kbStyle(frontKB)}
            />
            <img
              className={`wallpaper-img ${!showFront ? 'visible' : 'hidden'} ${fitClass} ${kenBurnsEnabled ? 'ken-burns' : ''}`}
              src={backSrc}
              alt=""
              draggable={false}
              style={kbStyle(backKB)}
            />
          </>
        ) : currentFile?.type === 'video' ? (
          <video
            ref={videoRef}
            className="wallpaper-video"
            src={currentVideoSrc}
            autoPlay
            muted
            loop={config?.videoBehavior === 'loop'}
            onEnded={handleVideoEnded}
          />
        ) : null}
      </div>

      {/* Clock layer */}
      <div className="clock-layer">
        <div
          ref={containerRef}
          className={`clock-container ${isDragging ? 'dragging' : ''} ${clockStyleClass} ${alignClass}`}
          style={containerStyle}
          onMouseDown={handleDragStart}
        >
          {config.showTime !== false && (
          <div className={`clock-time ${fontClass}`} style={clockStyle}>
            {formatTime(time, config.clockFormat !== '12h', config.showSeconds !== false)}
          </div>
          )}
          {config.showDate && (
            <div className={`clock-date ${fontClass}`} style={{ color: effectiveColor }}>
              {formatDate(time)}
            </div>
          )}
          {config.showLunar && lunarInfo && (
            <div className="clock-lunar" style={{ color: effectiveColor }}>
              {lunarInfo}
            </div>
          )}
          {config.showWeather && weather && (
            <div className="clock-weather" style={{ color: effectiveColor }}>
              <span>{weather.icon}</span>
              <span>{weather.temp}°C</span>
              <span>{weather.city}</span>
            </div>
          )}
          {hasInfoBelow && (config.showQuote || config.showBattery) && (
            <div className="info-separator" />
          )}
          {config.showQuote && quote && (
            <div className="clock-quote" style={{ color: effectiveColor }}>
              "{quote}"
            </div>
          )}
          {config.showBattery && battery && (
            <div className="clock-battery" style={{ color: effectiveColor }}>
              <span>{battery.charging ? '⚡' : '🔋'}</span>
              <span>{battery.level}%</span>
            </div>
          )}
          {countdowns.length > 0 && (
            <div className="clock-countdowns">
              {countdowns.map((cd, i) => (
                <div
                  key={i}
                  className={`clock-countdown-item ${cd.days === 0 ? 'today' : ''}`}
                  style={{ color: cd.color || config.clockColor || '#FFFFFF' }}
                >
                  <span className="clock-countdown-name">{cd.name}</span>
                  <span className="clock-countdown-days">
                    {cd.days === 0 ? '就是今天' : cd.days > 0 ? `还有 ${cd.days} 天` : `已过 ${Math.abs(cd.days)} 天`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
