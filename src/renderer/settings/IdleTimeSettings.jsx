export default function IdleTimeSettings({ config, setConfig, setMany }) {
  const handleMinutesChange = (e) => {
    const val = Math.max(1, parseInt(e.target.value) || 1);
    setConfig('idleMinutes', val);
  };

  const handleSecondsChange = (e) => {
    const val = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
    setConfig('idleSeconds', val);
  };

  const handleFullscreenCheckToggle = (e) => {
    setConfig('skipIfFullscreen', e.target.checked);
  };

  return (
    <>
      <h2 className="settings-panel-title">闲置时间</h2>
      <div className="settings-card">
        <div className="settings-row">
          <div className="settings-row-label">闲置触发时间</div>
          <div className="settings-row-right">
            <div className="macos-input-group">
              <input
                type="number"
                className="macos-input"
                value={config.idleMinutes}
                onChange={handleMinutesChange}
                min="1"
              />
              <span className="input-suffix">分</span>
              <input
                type="number"
                className="macos-input"
                value={config.idleSeconds}
                onChange={handleSecondsChange}
                min="0"
                max="59"
              />
              <span className="input-suffix">秒</span>
            </div>
          </div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">全屏应用检测</div>
            <div className="settings-row-sublabel">其他应用全屏时不触发屏保</div>
          </div>
          <div className="settings-row-right">
            <label className="macos-toggle">
              <input
                type="checkbox"
                checked={config.skipIfFullscreen !== false}
                onChange={handleFullscreenCheckToggle}
              />
              <span className="macos-toggle-track" />
              <span className="macos-toggle-thumb" />
            </label>
          </div>
        </div>
      </div>
    </>
  );
}
