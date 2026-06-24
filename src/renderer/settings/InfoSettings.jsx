import { useState } from 'react';

export default function InfoSettings({ config, setConfig }) {
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newColor, setNewColor] = useState('#FF6B6B');
  const [newQuote, setNewQuote] = useState('');

  const countdowns = config.countdowns || [];
  const customQuotes = config.customQuotes || [];

  const handleAddCountdown = () => {
    if (!newName.trim() || !newDate) return;
    const item = { name: newName.trim(), date: newDate, color: newColor };
    setConfig('countdowns', [...countdowns, item]);
    setNewName('');
    setNewDate('');
  };

  const handleDeleteCountdown = (index) => {
    const updated = countdowns.filter((_, i) => i !== index);
    setConfig('countdowns', updated);
  };

  const handleAddQuote = () => {
    const text = newQuote.trim();
    if (!text) return;
    if (customQuotes.length >= 20) return;
    setConfig('customQuotes', [...customQuotes, text]);
    setNewQuote('');
  };

  const handleDeleteQuote = (index) => {
    const updated = customQuotes.filter((_, i) => i !== index);
    setConfig('customQuotes', updated);
  };

  return (
    <>
      <h2 className="settings-panel-title">信息展示</h2>

      <div className="settings-card">
        <div className="settings-row">
          <div>
            <div className="settings-row-label">天气信息</div>
            <div className="settings-row-sublabel">自动定位并显示当前天气</div>
          </div>
          <div className="settings-row-right">
            <label className="macos-toggle">
              <input
                type="checkbox"
                checked={config.showWeather || false}
                onChange={(e) => setConfig('showWeather', e.target.checked)}
              />
              <span className="macos-toggle-track" />
              <span className="macos-toggle-thumb" />
            </label>
          </div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">农历/节日</div>
            <div className="settings-row-sublabel">显示农历日期和传统节日</div>
          </div>
          <div className="settings-row-right">
            <label className="macos-toggle">
              <input
                type="checkbox"
                checked={config.showLunar || false}
                onChange={(e) => setConfig('showLunar', e.target.checked)}
              />
              <span className="macos-toggle-track" />
              <span className="macos-toggle-thumb" />
            </label>
          </div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">座右铭</div>
            <div className="settings-row-sublabel">显示你的座右铭，默认 "One Step Ahead"</div>
          </div>
          <div className="settings-row-right">
            <label className="macos-toggle">
              <input
                type="checkbox"
                checked={config.showQuote || false}
                onChange={(e) => setConfig('showQuote', e.target.checked)}
              />
              <span className="macos-toggle-track" />
              <span className="macos-toggle-thumb" />
            </label>
          </div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">电池状态</div>
            <div className="settings-row-sublabel">显示电池电量和充电状态</div>
          </div>
          <div className="settings-row-right">
            <label className="macos-toggle">
              <input
                type="checkbox"
                checked={config.showBattery || false}
                onChange={(e) => setConfig('showBattery', e.target.checked)}
              />
              <span className="macos-toggle-track" />
              <span className="macos-toggle-thumb" />
            </label>
          </div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">倒计时</div>
            <div className="settings-row-sublabel">显示自定义事件倒计时（最多3个）</div>
          </div>
          <div className="settings-row-right">
            <label className="macos-toggle">
              <input
                type="checkbox"
                checked={config.showCountdown || false}
                onChange={(e) => setConfig('showCountdown', e.target.checked)}
              />
              <span className="macos-toggle-track" />
              <span className="macos-toggle-thumb" />
            </label>
          </div>
        </div>
      </div>

      {config.showCountdown && (
        <div className="settings-card" style={{ marginTop: 12 }}>
          <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
            <div className="settings-row-label">添加倒计时事件</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input
                type="text"
                className="macos-input"
                placeholder="事件名称（如：生日）"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{ flex: '1 1 120px', minWidth: 120 }}
              />
              <input
                type="date"
                className="macos-input"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                style={{ flex: '0 0 auto' }}
              />
              <div className="macos-color-picker" style={{ flex: '0 0 auto' }}>
                <div className="macos-color-picker-swatch" style={{ background: newColor }} />
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                />
              </div>
              <button
                className="macos-btn"
                onClick={handleAddCountdown}
                disabled={!newName.trim() || !newDate}
              >
                添加
              </button>
            </div>
          </div>

          {countdowns.length > 0 && (
            <div className="countdown-list">
              {countdowns.map((cd, i) => (
                <div key={i} className="countdown-list-item">
                  <span className="countdown-list-dot" style={{ background: cd.color }} />
                  <span className="countdown-list-name">{cd.name}</span>
                  <span className="countdown-list-date">{cd.date}</span>
                  <button
                    className="countdown-list-delete"
                    onClick={() => handleDeleteCountdown(i)}
                    title="删除"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {config.showQuote && (
        <div className="settings-card" style={{ marginTop: 12 }}>
          <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
            <div className="settings-row-label">自定义座右铭</div>
            <div className="settings-row-sublabel">添加后随机轮换显示，留空则显示 "One Step Ahead"（最多20条）</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                className="macos-input"
                placeholder="输入你的座右铭..."
                value={newQuote}
                onChange={(e) => setNewQuote(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddQuote(); }}
                style={{ flex: 1 }}
                maxLength={200}
              />
              <button
                className="macos-btn"
                onClick={handleAddQuote}
                disabled={!newQuote.trim() || customQuotes.length >= 20}
              >
                添加
              </button>
            </div>
          </div>

          {customQuotes.length > 0 && (
            <div className="quote-list">
              {customQuotes.map((q, i) => (
                <div key={i} className="quote-list-item">
                  <span className="quote-list-text">{q}</span>
                  <button
                    className="quote-list-delete"
                    onClick={() => handleDeleteQuote(i)}
                    title="删除"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
