const FILTERS = [
  {
    id: 'none',
    name: '无滤镜',
    desc: '原始壁纸效果',
    preview: { filter: 'none' },
  },
  {
    id: 'dim',
    name: '暗化',
    desc: '降低亮度，突出时钟',
    preview: { filter: 'brightness(0.6)' },
  },
  {
    id: 'blur',
    name: '模糊',
    desc: '柔焦背景，突出前景',
    preview: { filter: 'blur(6px)' },
  },
  {
    id: 'grayscale',
    name: '黑白',
    desc: '去色，经典质感',
    preview: { filter: 'grayscale(1)' },
  },
  {
    id: 'sepia',
    name: '复古',
    desc: '暖色调，怀旧氛围',
    preview: { filter: 'sepia(0.7)' },
  },
  {
    id: 'saturate',
    name: '鲜艳',
    desc: '增强色彩饱和度',
    preview: { filter: 'saturate(1.8)' },
  },
  {
    id: 'contrast',
    name: '高对比',
    desc: '强化明暗对比',
    preview: { filter: 'contrast(1.5) brightness(0.9)' },
  },
  {
    id: 'cool',
    name: '冷色调',
    desc: '偏蓝冷色，宁静氛围',
    preview: { filter: 'hue-rotate(20deg) saturate(0.9) brightness(0.95)' },
  },
  {
    id: 'warm',
    name: '暖色调',
    desc: '偏橙暖色，温馨氛围',
    preview: { filter: 'hue-rotate(-15deg) saturate(1.1) brightness(1.05)' },
  },
  {
    id: 'invert',
    name: '反色',
    desc: '色彩反转，独特视觉',
    preview: { filter: 'invert(0.85) hue-rotate(180deg)' },
  },
  {
    id: 'vignette',
    name: '暗角',
    desc: '四角渐暗，聚焦中心',
    preview: { filter: 'brightness(0.85) contrast(1.1)' },
  },
];

export default function FilterSettings({ config, setConfig }) {
  const currentFilter = config.wallpaperFilter || 'none';

  const handleFilterSelect = (filterId) => {
    setConfig('wallpaperFilter', filterId);
  };

  const handleIntensityChange = (e) => {
    setConfig('filterIntensity', parseInt(e.target.value));
  };

  return (
    <>
      <h2 className="settings-panel-title">壁纸滤镜</h2>

      <div className="settings-card">
        <div className="filter-grid">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              className={`filter-card ${currentFilter === filter.id ? 'active' : ''}`}
              onClick={() => handleFilterSelect(filter.id)}
            >
              <div
                className="filter-card-preview"
                style={{ filter: filter.preview.filter }}
              />
              <div className="filter-card-info">
                <div className="filter-card-name">{filter.name}</div>
                <div className="filter-card-desc">{filter.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {currentFilter !== 'none' && (
        <div className="settings-card" style={{ marginTop: 12 }}>
          <div className="settings-row">
            <div className="settings-row-label">滤镜强度</div>
            <div className="settings-row-right">
              <div className="macos-slider-container">
                <input
                  type="range"
                  className="macos-slider"
                  min="5"
                  max="100"
                  value={config.filterIntensity ?? 30}
                  onChange={handleIntensityChange}
                />
                <span className="macos-slider-value">{config.filterIntensity ?? 30}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="settings-card" style={{ marginTop: 12 }}>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">Ken Burns 效果</div>
            <div className="settings-row-sublabel">壁纸缓慢平移缩放，让静态图片有呼吸感</div>
          </div>
          <div className="settings-row-right">
            <label className="macos-toggle">
              <input
                type="checkbox"
                checked={config.kenBurns !== false}
                onChange={(e) => setConfig('kenBurns', e.target.checked)}
              />
              <span className="macos-toggle-track" />
              <span className="macos-toggle-thumb" />
            </label>
          </div>
        </div>

        {config.kenBurns !== false && (
          <div className="settings-row">
            <div className="settings-row-label">动画速度</div>
            <div className="settings-row-right">
              <div className="macos-slider-container">
                <input
                  type="range"
                  className="macos-slider"
                  min="10"
                  max="100"
                  value={config.kenBurnsSpeed ?? 40}
                  onChange={(e) => setConfig('kenBurnsSpeed', parseInt(e.target.value))}
                />
                <span className="macos-slider-value">{config.kenBurnsSpeed ?? 40}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
