import { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from 'react';
import { useConfig } from '../hooks/useConfig';
import '../screensaver/ScreensaverApp.css';

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

function toFileURL(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  return `file:///${normalized.replace(/^\/+/, '')}`;
}

export default function PreviewBox() {
  const { config, setConfig } = useConfig();
  const [files, setFiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [time, setTime] = useState(new Date());
  const [frontSrc, setFrontSrc] = useState('');
  const [backSrc, setBackSrc] = useState('');
  const [showFront, setShowFront] = useState(true);
  const [screenSize, setScreenSize] = useState({ width: 1920, height: 1080, ratio: 16 / 9 });
  const [previewScale, setPreviewScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const switchTimerRef = useRef(null);
  const videoRef = useRef(null);
  const scanRequestRef = useRef(0);
  const dragStartRef = useRef({ x: 0, y: 0, cx: 0, cy: 0, align: 'center' });
  const previewRef = useRef(null);
  const containerRef = useRef(null);
  const virtualScreenRef = useRef(null);

  const wallpaperSourceKey = useMemo(() => {
    if (!config) return '';
    return JSON.stringify({
      path: config.wallpaperPath,
      imgs: (config.extraImages || []).slice().sort(),
      vids: (config.extraVideos || []).slice().sort(),
    });
  }, [config]);

  // Scan wallpaper files
  useEffect(() => {
    let cancelled = false;
    const requestId = ++scanRequestRef.current;

    async function scan() {
      const result = await window.electronAPI.wallpaper.scan();
      if (cancelled || requestId !== scanRequestRef.current) return;
      if (result.length > 0) {
        setFiles(result);
        setCurrentIndex(0);
        const first = result[0];
        if (first?.type === 'image') {
          setFrontSrc(toFileURL(first.path));
          setBackSrc('');
        }
      } else {
        setFiles([]);
      }
    }
    scan();
    return () => { cancelled = true; };
  }, [wallpaperSourceKey]);

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Get screen size
  useEffect(() => {
    window.electronAPI?.getScreenSize?.().then((info) => {
      if (info?.width) setScreenSize(info);
    }).catch(() => {});
  }, []);

  const hasFiles = files.length > 0;

  // Calculate preview scale factor
  useLayoutEffect(() => {
    function updateScale() {
      if (!previewRef.current || !screenSize.width) return;
      const previewWidth = previewRef.current.clientWidth;
      const scale = previewWidth / screenSize.width;
      setPreviewScale(scale);
    }
    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (previewRef.current) observer.observe(previewRef.current);
    return () => observer.disconnect();
  }, [screenSize, hasFiles]);

  // Image auto-switch (shorter interval for preview)
  useEffect(() => {
    if (switchTimerRef.current) {
      clearInterval(switchTimerRef.current);
      switchTimerRef.current = null;
    }
    if (files.length === 0) return;

    const currentFile = files[currentIndex];
    if (!currentFile || currentFile.type !== 'image') return;

    const interval = Math.min((config?.switchInterval || 30) * 1000, 8000);
    switchTimerRef.current = setInterval(() => {
      const nextIndex = (currentIndex + 1) % files.length;
      const nextFile = files[nextIndex];
      setCurrentIndex(nextIndex);
      if (nextFile?.type === 'image') {
        const src = toFileURL(nextFile.path);
        if (showFront) { setBackSrc(src); } else { setFrontSrc(src); }
        setShowFront(prev => !prev);
      }
    }, interval);

    return () => { if (switchTimerRef.current) clearInterval(switchTimerRef.current); };
  }, [files, currentIndex, config?.switchInterval, showFront]);

  // Video volume
  useEffect(() => {
    if (videoRef.current && config) {
      videoRef.current.volume = (config.volume || 0) / 100;
    }
  }, [currentIndex, config]);

  const currentFile = files[currentIndex] || null;

  // ---- Drag handlers for clock position ----
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
      if (!previewRef.current) return;
      const previewRect = previewRef.current.getBoundingClientRect();
      // Scale: mouse delta in preview coords → normalized position
      const dx = (e.clientX - dragStartRef.current.x) / previewRect.width;
      const dy = (e.clientY - dragStartRef.current.y) / previewRect.height;
      const newX = Math.max(0, Math.min(1, dragStartRef.current.cx + dx));
      const newY = Math.max(0, Math.min(1, dragStartRef.current.cy + dy));
      // Update visual position immediately
      if (containerRef.current) {
        containerRef.current.style.left = `${newX * 100}%`;
        containerRef.current.style.top = `${newY * 100}%`;
        const a = dragStartRef.current.align;
        containerRef.current.style.transform = a === 'left' ? 'translate(0, -50%)'
          : a === 'right' ? 'translate(-100%, -50%)'
          : 'translate(-50%, -50%)';
      }
    };

    const handleUp = (e) => {
      setIsDragging(false);
      if (!previewRef.current) return;
      const previewRect = previewRef.current.getBoundingClientRect();
      const dx = (e.clientX - dragStartRef.current.x) / previewRect.width;
      const dy = (e.clientY - dragStartRef.current.y) / previewRect.height;
      const newX = Math.max(0, Math.min(1, dragStartRef.current.cx + dx));
      const newY = Math.max(0, Math.min(1, dragStartRef.current.cy + dy));
      setConfig('clockPosition', { x: newX, y: newY });
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging, setConfig]);

  if (files.length === 0) {
    return (
      <div className="preview-box preview-empty">
        <div className="preview-empty-text">选择壁纸文件夹后可预览效果</div>
      </div>
    );
  }

  // ---- Build screensaver content at actual screen size, then scale ----
  const clockStyleType = config?.clockStyle || 'glass';
  const align = config?.clockAlign || 'center';
  const pos = config?.clockPosition || { x: 0.5, y: 0.5 };
  const glassBlur = config?.glassBlur ?? 24;
  const glassOpacity = config?.glassOpacity ?? 8;
  const glassRadius = config?.glassRadius ?? 24;
  const glassAlpha = glassOpacity / 100;

  const alignTransform = align === 'left' ? 'translate(0, -50%)'
    : align === 'right' ? 'translate(-100%, -50%)'
    : 'translate(-50%, -50%)';

  // Use actual screen dimensions and CSS variables — no manual scaling
  const containerStyle = {
    left: `${pos.x * 100}%`,
    top: `${pos.y * 100}%`,
    transform: alignTransform,
    borderRadius: `${glassRadius}px`,
    '--glass-blur': `${glassBlur}px`,
    '--glass-bg': `rgba(255, 255, 255, ${glassAlpha})`,
    '--glass-bg-1': `rgba(255, 255, 255, ${glassAlpha * 1.5})`,
    '--glass-bg-2': `rgba(255, 255, 255, ${glassAlpha * 0.5})`,
    '--glass-bg-3': `rgba(255, 255, 255, ${glassAlpha * 1.25})`,
    '--glass-bg-4': `rgba(255, 255, 255, ${glassAlpha * 0.25})`,
    '--glass-radius': `${glassRadius}px`,
  };

  const clockStyleClass = `clock-style-${clockStyleType}`;
  const alignClass = `clock-align-${align}`;
  const fontClass = config?.clockFont && config?.clockFont !== 'system'
    ? `font-${config.clockFont}`
    : '';

  const clockStyle = {
    fontSize: `${config?.clockFontSize || 120}px`,
    color: config?.clockColor || '#FFFFFF',
  };

  // Filter CSS variables (same logic as ScreensaverApp)
  const filterClass = config?.wallpaperFilter && config?.wallpaperFilter !== 'none'
    ? `filter-${config.wallpaperFilter}`
    : '';

  const filterStyle = {};
  const intensity = (config?.filterIntensity || 30) / 100;
  if (config?.wallpaperFilter === 'dim') {
    filterStyle['--filter-value'] = `${1 - intensity}`;
  } else if (config?.wallpaperFilter === 'blur') {
    filterStyle['--filter-value'] = `${(config?.filterIntensity || 30) / 3}px`;
  } else if (config?.wallpaperFilter === 'grayscale') {
    filterStyle['--filter-value'] = `${intensity}`;
  } else if (config?.wallpaperFilter === 'sepia') {
    filterStyle['--filter-value'] = `${intensity}`;
  } else if (config?.wallpaperFilter === 'saturate') {
    filterStyle['--filter-value'] = `${1 + intensity * 2}`;
  } else if (config?.wallpaperFilter === 'contrast') {
    filterStyle['--filter-value'] = `${1 + intensity}`;
    filterStyle['--filter-brightness'] = `${1 - intensity * 0.15}`;
  } else if (config?.wallpaperFilter === 'cool') {
    filterStyle['--filter-value'] = `${intensity * 30}deg`;
    filterStyle['--filter-sat'] = `${1 - intensity * 0.15}`;
    filterStyle['--filter-bright'] = `${1 - intensity * 0.1}`;
  } else if (config?.wallpaperFilter === 'warm') {
    filterStyle['--filter-value'] = `${-intensity * 25}deg`;
    filterStyle['--filter-sat'] = `${1 + intensity * 0.15}`;
    filterStyle['--filter-bright'] = `${1 + intensity * 0.08}`;
  } else if (config?.wallpaperFilter === 'invert') {
    filterStyle['--filter-value'] = `${intensity * 0.9}`;
  } else if (config?.wallpaperFilter === 'vignette') {
    const alpha = 0.2 + intensity * 0.6;
    filterStyle['--vignette-color'] = `rgba(0, 0, 0, ${alpha})`;
  }

  const fitClass = config?.imageFit === 'contain' ? 'fit-contain'
    : config?.imageFit === 'stretch' ? 'fit-stretch'
    : '';

  const transitionClass = config?.transitionEffect && config.transitionEffect !== 'fade'
    ? `transition-${config.transitionEffect}`
    : '';

  return (
    <div className="preview-box" style={{ aspectRatio: `${screenSize.ratio}` }} ref={previewRef}>
      {/* Virtual screen at actual resolution, scaled down via CSS transform */}
      <div
        ref={virtualScreenRef}
        className="preview-virtual-screen"
        style={{
          width: `${screenSize.width}px`,
          height: `${screenSize.height}px`,
          transform: `scale(${previewScale})`,
        }}
      >
        {/* Wallpaper layer */}
        <div className={`wallpaper-layer ${transitionClass} ${filterClass}`} style={filterStyle}>
          {currentFile?.type === 'image' ? (
            <>
              <img className={`wallpaper-img ${showFront ? 'visible' : 'hidden'} ${fitClass}`} src={frontSrc} alt="" draggable={false} />
              <img className={`wallpaper-img ${!showFront ? 'visible' : 'hidden'} ${fitClass}`} src={backSrc} alt="" draggable={false} />
            </>
          ) : currentFile?.type === 'video' ? (
            <video
              ref={videoRef}
              className="wallpaper-video"
              src={toFileURL(currentFile.path)}
              autoPlay
              muted
              loop={config?.videoBehavior === 'loop'}
              onEnded={() => {
                if (config?.videoBehavior !== 'loop') {
                  const nextIndex = (currentIndex + 1) % files.length;
                  const nextFile = files[nextIndex];
                  setCurrentIndex(nextIndex);
                  if (nextFile?.type === 'video') {
                    setFrontSrc('');
                    setBackSrc('');
                  }
                }
              }}
            />
          ) : null}
        </div>

        {/* Clock layer — same as ScreensaverApp, no manual scaling */}
        <div className="clock-layer">
          <div
            ref={containerRef}
            className={`clock-container ${isDragging ? 'dragging' : ''} ${clockStyleClass} ${alignClass}`}
            style={containerStyle}
            onMouseDown={handleDragStart}
          >
            {config?.showTime !== false && (
              <div className={`clock-time ${fontClass}`} style={clockStyle}>
                {formatTime(time, config?.clockFormat !== '12h', config?.showSeconds !== false)}
              </div>
            )}
            {config?.showDate && (
              <div className={`clock-date ${fontClass}`} style={{ color: config?.clockColor || '#FFFFFF' }}>
                {formatDate(time)}
              </div>
            )}
            {config?.showLunar && (
              <div className="clock-lunar" style={{ color: config?.clockColor || '#FFFFFF' }}>
                农历五月初五
              </div>
            )}
            {config?.showWeather && (
              <div className="clock-weather" style={{ color: config?.clockColor || '#FFFFFF' }}>
                <span>🌤️</span>
                <span>28°C</span>
              </div>
            )}
            {((config?.showLunar || config?.showWeather) && (config?.showQuote || config?.showBattery)) && (
              <div className="info-separator" />
            )}
            {config?.showQuote && (
              <div className="clock-quote" style={{ color: config?.clockColor || '#FFFFFF' }}>
                "千里之行，始于足下"
              </div>
            )}
            {config?.showBattery && (
              <div className="clock-battery" style={{ color: config?.clockColor || '#FFFFFF' }}>
                <span>🔋</span>
                <span>85%</span>
              </div>
            )}
            {config?.showCountdown && (config?.countdowns || []).length > 0 && (
              <div className="clock-countdowns">
                {(config.countdowns || []).slice(0, 3).map((cd, i) => (
                  <div
                    key={i}
                    className="clock-countdown-item"
                    style={{ color: cd.color || config?.clockColor || '#FFFFFF' }}
                  >
                    <span className="clock-countdown-name">{cd.name}</span>
                    <span className="clock-countdown-days">还有 30 天</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
