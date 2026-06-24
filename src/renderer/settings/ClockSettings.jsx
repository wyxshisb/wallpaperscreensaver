// 预设主题 — 按系统资源占用分三组
// tier: 'low' = 零 GPU 开销（无毛玻璃）| 'mid' = 低 GPU 开销（实底）| 'high' = 高 GPU 开销（毛玻璃/液态/霓虹）
const PRESETS = {
  // ═══════════════════════════════════════════════
  //  轻量 · 零 GPU 开销（无毛玻璃，纯文字/描边）
  // ═══════════════════════════════════════════════
  swiss: {
    name: '瑞士',
    desc: '国际主义网格，左上极简',
    icon: '░',
    tier: 'low',
    values: {
      clockStyle: 'minimal', clockAlign: 'left', clockFont: 'system',
      clockFontSize: 88, clockColor: '#FFFFFF',
      clockPosition: { x: 0.06, y: 0.12 },
      glassBlur: 0, glassOpacity: 0, glassRadius: 0,
    },
  },
  brutalist: {
    name: '粗野',
    desc: '混凝土实底，等宽硬边',
    icon: '▓',
    tier: 'low',
    values: {
      clockStyle: 'solid', clockAlign: 'center', clockFont: 'mono',
      clockFontSize: 136, clockColor: '#E0E0E0',
      clockPosition: { x: 0.5, y: 0.5 },
      glassBlur: 0, glassOpacity: 0, glassRadius: 0,
    },
  },
  stencil: {
    name: '模板',
    desc: '工业镂空，穿透壁纸',
    icon: '▯',
    tier: 'low',
    values: {
      clockStyle: 'hollow', clockAlign: 'center', clockFont: 'mono',
      clockFontSize: 148, clockColor: '#FFFFFF',
      clockPosition: { x: 0.5, y: 0.5 },
      glassBlur: 0, glassOpacity: 0, glassRadius: 0,
    },
  },
  bauhaus: {
    name: '包豪斯',
    desc: '几何描边，原色构成',
    icon: '◯',
    tier: 'low',
    values: {
      clockStyle: 'outline', clockAlign: 'center', clockFont: 'serif',
      clockFontSize: 116, clockColor: '#FFD93D',
      clockPosition: { x: 0.5, y: 0.5 },
      glassBlur: 0, glassOpacity: 0, glassRadius: 0,
    },
  },

  // ═══════════════════════════════════════════════
  //  均衡 · 低 GPU 开销（实底背景，无模糊）
  // ═══════════════════════════════════════════════
  noir: {
    name: '黑色电影',
    desc: '左下片尾字幕，高对比',
    icon: '◧',
    tier: 'mid',
    values: {
      clockStyle: 'solid', clockAlign: 'left', clockFont: 'elegant',
      clockFontSize: 84, clockColor: '#F0EDE5',
      clockPosition: { x: 0.06, y: 0.9 },
      glassBlur: 0, glassOpacity: 0, glassRadius: 6,
    },
  },
  letterpress: {
    name: '活字',
    desc: '复古衬线，印刷质感',
    icon: 'A',
    tier: 'mid',
    values: {
      clockStyle: 'solid', clockAlign: 'left', clockFont: 'serif',
      clockFontSize: 78, clockColor: '#E8D5B0',
      clockPosition: { x: 0.08, y: 0.85 },
      glassBlur: 0, glassOpacity: 0, glassRadius: 4,
    },
  },
  obelisk: {
    name: '方尖碑',
    desc: '居中实底等宽，庄重如碑',
    icon: '▮',
    tier: 'mid',
    values: {
      clockStyle: 'solid', clockAlign: 'center', clockFont: 'mono',
      clockFontSize: 156, clockColor: '#FFFFFF',
      clockPosition: { x: 0.5, y: 0.5 },
      glassBlur: 0, glassOpacity: 0, glassRadius: 2,
    },
  },
  parchment: {
    name: '羊皮纸',
    desc: '古典手稿，温暖优雅',
    icon: '✦',
    tier: 'mid',
    values: {
      clockStyle: 'solid', clockAlign: 'left', clockFont: 'elegant',
      clockFontSize: 74, clockColor: '#F5E6C8',
      clockPosition: { x: 0.08, y: 0.12 },
      glassBlur: 0, glassOpacity: 0, glassRadius: 8,
    },
  },

  // ═══════════════════════════════════════════════
  //  华丽 · 高 GPU 开销（毛玻璃/液态/霓虹）
  // ═══════════════════════════════════════════════
  frosted: {
    name: '磨砂',
    desc: '经典毛玻璃，温润居中',
    icon: '◇',
    tier: 'high',
    values: {
      clockStyle: 'glass', clockAlign: 'center', clockFont: 'system',
      clockFontSize: 116, clockColor: '#FAFAF8',
      clockPosition: { x: 0.5, y: 0.5 },
      glassBlur: 28, glassOpacity: 7, glassRadius: 28,
    },
  },
  aurora: {
    name: '极光',
    desc: '顶部液态玻璃，北极光感',
    icon: '△',
    tier: 'high',
    values: {
      clockStyle: 'liquid', clockAlign: 'center', clockFont: 'elegant',
      clockFontSize: 98, clockColor: '#C8FFF0',
      clockPosition: { x: 0.5, y: 0.12 },
      glassBlur: 40, glassOpacity: 14, glassRadius: 36,
    },
  },
  glacier: {
    name: '冰川',
    desc: '高模糊液态，冰透质感',
    icon: '◆',
    tier: 'high',
    values: {
      clockStyle: 'liquid', clockAlign: 'center', clockFont: 'system',
      clockFontSize: 108, clockColor: '#E0F0FF',
      clockPosition: { x: 0.5, y: 0.5 },
      glassBlur: 44, glassOpacity: 8, glassRadius: 40,
    },
  },
  synthwave: {
    name: '合成波',
    desc: '霓虹发光，赛博朋克',
    icon: '◈',
    tier: 'high',
    values: {
      clockStyle: 'neon', clockAlign: 'center', clockFont: 'mono',
      clockFontSize: 104, clockColor: '#FF2D95',
      clockPosition: { x: 0.5, y: 0.5 },
      glassBlur: 14, glassOpacity: 7, glassRadius: 24,
    },
  },
};

// 分组定义
const TIERS = [
  { key: 'low', label: '轻量', hint: '零 GPU 开销' },
  { key: 'mid', label: '均衡', hint: '低 GPU 开销' },
  { key: 'high', label: '华丽', hint: '高 GPU 开销' },
];

export { PRESETS };

export default function ClockSettings({ config, setConfig, setMany }) {
  const handleShowTimeToggle = (e) => {
    setConfig('showTime', e.target.checked);
  };

  const handlePresetSelect = (presetKey) => {
    const preset = PRESETS[presetKey];
    if (!preset) return;
    setMany({ clockPreset: presetKey, ...preset.values });
  };

  const handleFontSizeChange = (e) => {
    setConfig('clockFontSize', parseInt(e.target.value));
  };

  const handleColorChange = (e) => {
    setConfig('clockColor', e.target.value);
  };

  const handleShowDateToggle = (e) => {
    setConfig('showDate', e.target.checked);
  };

  const handleClockFormatChange = (value) => {
    setConfig('clockFormat', value);
  };

  const handleShowSecondsToggle = (e) => {
    setConfig('showSeconds', e.target.checked);
  };

  const handleClockFontChange = (value) => {
    setConfig('clockFont', value);
  };

  const handleClockAlignChange = (value) => {
    setConfig('clockAlign', value);
  };

  const handleGlassBlurChange = (e) => {
    setConfig('glassBlur', parseInt(e.target.value));
  };

  const handleGlassOpacityChange = (e) => {
    setConfig('glassOpacity', parseInt(e.target.value));
  };

  const handleGlassRadiusChange = (e) => {
    setConfig('glassRadius', parseInt(e.target.value));
  };

  const currentPreset = config.clockPreset || 'frosted';
  const currentPresetData = PRESETS[currentPreset];
  const currentTier = currentPresetData?.tier || 'high';
  const hasGlass = ['glass', 'liquid', 'neon'].includes(config.clockStyle);

  return (
    <>
      <h2 className="settings-panel-title">时钟样式</h2>

      <div className="settings-card">
        <div className="settings-row">
          <div className="settings-row-label">显示时间</div>
          <div className="settings-row-right">
            <label className="macos-toggle">
              <input
                type="checkbox"
                checked={config.showTime !== false}
                onChange={handleShowTimeToggle}
              />
              <span className="macos-toggle-track" />
              <span className="macos-toggle-thumb" />
            </label>
          </div>
        </div>

        <div className="settings-row">
          <div className="settings-row-label">显示日期</div>
          <div className="settings-row-right">
            <label className="macos-toggle">
              <input
                type="checkbox"
                checked={config.showDate}
                onChange={handleShowDateToggle}
              />
              <span className="macos-toggle-track" />
              <span className="macos-toggle-thumb" />
            </label>
          </div>
        </div>
      </div>

      <h2 className="settings-panel-title" style={{ marginTop: 20 }}>预设主题</h2>

      {TIERS.map((tier) => (
        <div key={tier.key} className="preset-tier">
          <div className="preset-tier-header">
            <span className="preset-tier-label">{tier.label}</span>
            <span className="preset-tier-hint">{tier.hint}</span>
          </div>
          <div className="preset-grid">
            {Object.entries(PRESETS)
              .filter(([_, p]) => p.tier === tier.key)
              .map(([key, preset]) => (
                <button
                  key={key}
                  className={`preset-card ${currentPreset === key ? 'active' : ''}`}
                  onClick={() => handlePresetSelect(key)}
                >
                  <div className="preset-card-preview">
                    <div className={`preset-mini-screen preset-mini-${key}`}>
                      <div className="preset-mini-clock" />
                    </div>
                  </div>
                  <div className="preset-card-info">
                    <div className="preset-card-name">{preset.name}</div>
                    <div className="preset-card-desc">{preset.desc}</div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      ))}

      <h2 className="settings-panel-title" style={{ marginTop: 20 }}>主题微调</h2>

      {/* 位置提示 */}
      <div className="settings-card">
        <div className="settings-row" style={{ justifyContent: 'center' }}>
          <div className="settings-row-sublabel" style={{ textAlign: 'center' }}>
            在预览区或屏保界面拖拽时钟即可调整位置
          </div>
        </div>

        {/* 排版 */}
        <div className="settings-row">
          <div className="settings-row-label">文本对齐</div>
          <div className="settings-row-right">
            <div className="macos-segmented">
              {[
                { key: 'left', label: '左' },
                { key: 'center', label: '中' },
                { key: 'right', label: '右' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  className={`macos-segmented-btn ${config.clockAlign === key ? 'active' : ''}`}
                  onClick={() => handleClockAlignChange(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="settings-row">
          <div className="settings-row-label">字体</div>
          <div className="settings-row-right">
            <div className="macos-segmented macos-segmented-4">
              <button
                className={`macos-segmented-btn ${(!config.clockFont || config.clockFont === 'system') ? 'active' : ''}`}
                onClick={() => handleClockFontChange('system')}
              >
                系统
              </button>
              <button
                className={`macos-segmented-btn ${config.clockFont === 'serif' ? 'active' : ''}`}
                onClick={() => handleClockFontChange('serif')}
              >
                衬线
              </button>
              <button
                className={`macos-segmented-btn ${config.clockFont === 'mono' ? 'active' : ''}`}
                onClick={() => handleClockFontChange('mono')}
              >
                等宽
              </button>
              <button
                className={`macos-segmented-btn ${config.clockFont === 'elegant' ? 'active' : ''}`}
                onClick={() => handleClockFontChange('elegant')}
              >
                优雅
              </button>
            </div>
          </div>
        </div>

        <div className="settings-row">
          <div className="settings-row-label">字号</div>
          <div className="settings-row-right">
            <div className="macos-slider-container">
              <input
                type="range"
                className="macos-slider"
                min="40"
                max="200"
                value={config.clockFontSize}
                onChange={handleFontSizeChange}
              />
              <span className="macos-slider-value">{config.clockFontSize}</span>
            </div>
          </div>
        </div>

        {/* 色彩 */}
        <div className="settings-row">
          <div>
            <div className="settings-row-label">智能配色</div>
            <div className="settings-row-sublabel">根据壁纸亮度自动调整文字颜色</div>
          </div>
          <div className="settings-row-right">
            <label className="macos-toggle">
              <input
                type="checkbox"
                checked={config.autoColor || false}
                onChange={(e) => setConfig('autoColor', e.target.checked)}
              />
              <span className="macos-toggle-track" />
              <span className="macos-toggle-thumb" />
            </label>
          </div>
        </div>

        {!config.autoColor && (
        <div className="settings-row">
          <div className="settings-row-label">文字颜色</div>
          <div className="settings-row-right">
            <div className="macos-color-picker">
              <div
                className="macos-color-picker-swatch"
                style={{ background: config.clockColor }}
              />
              <input
                type="color"
                value={config.clockColor}
                onChange={handleColorChange}
              />
            </div>
          </div>
        </div>
        )}

        {/* 格式 */}
        <div className="settings-row">
          <div className="settings-row-label">时间格式</div>
          <div className="settings-row-right">
            <div className="macos-segmented">
              <button
                className={`macos-segmented-btn ${config.clockFormat !== '12h' ? 'active' : ''}`}
                onClick={() => handleClockFormatChange('24h')}
              >
                24小时
              </button>
              <button
                className={`macos-segmented-btn ${config.clockFormat === '12h' ? 'active' : ''}`}
                onClick={() => handleClockFormatChange('12h')}
              >
                12小时
              </button>
            </div>
          </div>
        </div>

        <div className="settings-row">
          <div className="settings-row-label">显示秒数</div>
          <div className="settings-row-right">
            <label className="macos-toggle">
              <input
                type="checkbox"
                checked={config.showSeconds !== false}
                onChange={handleShowSecondsToggle}
              />
              <span className="macos-toggle-track" />
              <span className="macos-toggle-thumb" />
            </label>
          </div>
        </div>
      </div>

      {/* 背景效果 — 仅华丽组显示 */}
      {hasGlass && (
      <div className="settings-card" style={{ marginTop: 10 }}>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">模糊强度</div>
            <div className="settings-row-sublabel">设为0关闭毛玻璃</div>
          </div>
          <div className="settings-row-right">
            <div className="macos-slider-container">
              <input
                type="range"
                className="macos-slider"
                min="0"
                max="50"
                value={config.glassBlur ?? 24}
                onChange={handleGlassBlurChange}
              />
              <span className="macos-slider-value">{config.glassBlur ?? 24}</span>
            </div>
          </div>
        </div>

        <div className="settings-row">
          <div className="settings-row-label">背景透明度</div>
          <div className="settings-row-right">
            <div className="macos-slider-container">
              <input
                type="range"
                className="macos-slider"
                min="0"
                max="30"
                value={config.glassOpacity ?? 8}
                onChange={handleGlassOpacityChange}
              />
              <span className="macos-slider-value">{config.glassOpacity ?? 8}%</span>
            </div>
          </div>
        </div>

        <div className="settings-row">
          <div className="settings-row-label">圆角大小</div>
          <div className="settings-row-right">
            <div className="macos-slider-container">
              <input
                type="range"
                className="macos-slider"
                min="0"
                max="48"
                value={config.glassRadius ?? 24}
                onChange={handleGlassRadiusChange}
              />
              <span className="macos-slider-value">{config.glassRadius ?? 24}px</span>
            </div>
          </div>
        </div>
      </div>
      )}

      {!hasGlass && (
      <div className="settings-card" style={{ marginTop: 10 }}>
        <div className="settings-row" style={{ justifyContent: 'center' }}>
          <div className="settings-row-sublabel" style={{ textAlign: 'center' }}>
            当前主题为{currentTier === 'low' ? '轻量' : '均衡'}组，无背景效果可调
          </div>
        </div>
      </div>
      )}
    </>
  );
}
