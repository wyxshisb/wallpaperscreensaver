import { useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import WallpaperSource from './WallpaperSource';
import IdleTimeSettings from './IdleTimeSettings';
import VideoSettings from './VideoSettings';
import FilterSettings from './FilterSettings';
import ClockSettings from './ClockSettings';
import InfoSettings from './InfoSettings';
import GeneralSettings from './GeneralSettings';
import WelcomeDialog from './WelcomeDialog';
import PreviewBox from './PreviewBox';
import { useConfig } from '../hooks/useConfig';

const panels = [
  { id: 'wallpaper', label: '壁纸源', icon: '📁' },
  { id: 'idle', label: '闲置时间', icon: '⏱' },
  { id: 'video', label: '视频设置', icon: '🎬' },
  { id: 'filter', label: '滤镜', icon: '🎨' },
  { id: 'clock', label: '时钟样式', icon: '🕐' },
  { id: 'info', label: '信息展示', icon: 'ℹ️' },
  { id: 'general', label: '通用', icon: '⚙️' },
];

export default function SettingsApp() {
  const [activePanel, setActivePanel] = useState('wallpaper');
  const [animKey, setAnimKey] = useState(0);
  const { config, setConfig, setMany } = useConfig();

  const handlePanelChange = useCallback((panelId) => {
    setActivePanel(panelId);
    setAnimKey(prev => prev + 1);
  }, []);

  if (!config) return null;

  const showWelcome = !config.wallpaperPath && !(config.extraImages || []).length && !(config.extraVideos || []).length;

  const renderPanel = () => {
    switch (activePanel) {
      case 'wallpaper':
        return <WallpaperSource config={config} setConfig={setConfig} setMany={setMany} />;
      case 'idle':
        return <IdleTimeSettings config={config} setConfig={setConfig} setMany={setMany} />;
      case 'video':
        return <VideoSettings config={config} setConfig={setConfig} setMany={setMany} />;
      case 'filter':
        return <FilterSettings config={config} setConfig={setConfig} />;
      case 'clock':
        return <ClockSettings config={config} setConfig={setConfig} setMany={setMany} />;
      case 'info':
        return <InfoSettings config={config} setConfig={setConfig} />;
      case 'general':
        return <GeneralSettings config={config} setConfig={setConfig} />;
      default:
        return null;
    }
  };

  return (
    <div className="settings-app">
      {/* 自定义标题栏 - 拖拽区域 */}
      <div className="settings-titlebar">
        <div className="settings-titlebar-drag">
          <span className="settings-titlebar-title">壁纸屏保</span>
        </div>
        <div className="settings-titlebar-controls">
          <button
            className="titlebar-btn titlebar-btn-minimize"
            onClick={() => window.electronAPI?.windowMinimize?.()}
            title="最小化"
          >
            ─
          </button>
          <button
            className="titlebar-btn titlebar-btn-close"
            onClick={() => window.close()}
            title="关闭"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="settings-body">
        <Sidebar
          panels={panels}
          activePanel={activePanel}
          onSelect={handlePanelChange}
        />
        <div className="settings-main">
          <div className="settings-content">
            <div className="panel-animate" key={animKey}>
              {renderPanel()}
            </div>
          </div>
          <div className="settings-preview">
            <div className="settings-preview-label">预览</div>
            <PreviewBox />
          </div>
        </div>
      </div>
      {showWelcome && (
        <WelcomeDialog config={config} setConfig={setConfig} setMany={setMany} />
      )}
    </div>
  );
}
