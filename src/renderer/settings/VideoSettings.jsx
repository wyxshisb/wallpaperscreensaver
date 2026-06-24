export default function VideoSettings({ config, setConfig, setMany }) {
  const handleBehaviorChange = (value) => {
    setConfig('videoBehavior', value);
  };

  const handleVolumeChange = (e) => {
    setConfig('volume', parseInt(e.target.value));
  };

  const handleIntervalChange = (e) => {
    setConfig('switchInterval', parseInt(e.target.value));
  };

  const handleTransitionChange = (value) => {
    setConfig('transitionEffect', value);
  };

  const handleImageFitChange = (value) => {
    setConfig('imageFit', value);
  };

  return (
    <>
      <h2 className="settings-panel-title">视频设置</h2>

      <div className="settings-card">
        <div className="settings-row">
          <div>
            <div className="settings-row-label">视频播放完毕行为</div>
            <div className="settings-row-sublabel">视频壁纸播放结束后的动作</div>
          </div>
          <div className="settings-row-right">
            <div className="macos-segmented">
              <button
                className={`macos-segmented-btn ${config.videoBehavior === 'loop' ? 'active' : ''}`}
                onClick={() => handleBehaviorChange('loop')}
              >
                循环播放
              </button>
              <button
                className={`macos-segmented-btn ${config.videoBehavior === 'switch' ? 'active' : ''}`}
                onClick={() => handleBehaviorChange('switch')}
              >
                切换壁纸
              </button>
            </div>
          </div>
        </div>

        <div className="settings-row">
          <div className="settings-row-label">视频音量</div>
          <div className="settings-row-right">
            <div className="macos-slider-container">
              <input
                type="range"
                className="macos-slider"
                min="0"
                max="100"
                value={config.volume}
                onChange={handleVolumeChange}
              />
              <span className="macos-slider-value">{config.volume}%</span>
            </div>
          </div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">图片切换间隔</div>
            <div className="settings-row-sublabel">图片壁纸自动切换的时间间隔</div>
          </div>
          <div className="settings-row-right">
            <div className="macos-slider-container">
              <input
                type="range"
                className="macos-slider"
                min="5"
                max="300"
                value={config.switchInterval}
                onChange={handleIntervalChange}
              />
              <span className="macos-slider-value">{config.switchInterval}秒</span>
            </div>
          </div>
        </div>
      </div>

      <h2 className="settings-panel-title" style={{ marginTop: 24 }}>壁纸效果</h2>

      <div className="settings-card">
        <div className="settings-row">
          <div>
            <div className="settings-row-label">过渡动画</div>
            <div className="settings-row-sublabel">图片切换时的动画效果</div>
          </div>
          <div className="settings-row-right">
            <div className="macos-segmented macos-segmented-4">
              <button
                className={`macos-segmented-btn ${(!config.transitionEffect || config.transitionEffect === 'fade') ? 'active' : ''}`}
                onClick={() => handleTransitionChange('fade')}
              >
                淡入淡出
              </button>
              <button
                className={`macos-segmented-btn ${config.transitionEffect === 'zoom' ? 'active' : ''}`}
                onClick={() => handleTransitionChange('zoom')}
              >
                缩放
              </button>
              <button
                className={`macos-segmented-btn ${config.transitionEffect === 'slide' ? 'active' : ''}`}
                onClick={() => handleTransitionChange('slide')}
              >
                滑动
              </button>
              <button
                className={`macos-segmented-btn ${config.transitionEffect === 'blur' ? 'active' : ''}`}
                onClick={() => handleTransitionChange('blur')}
              >
                模糊
              </button>
            </div>
          </div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">缩放模式</div>
            <div className="settings-row-sublabel">图片在屏幕中的显示方式</div>
          </div>
          <div className="settings-row-right">
            <div className="macos-segmented macos-segmented-3">
              <button
                className={`macos-segmented-btn ${(!config.imageFit || config.imageFit === 'cover') ? 'active' : ''}`}
                onClick={() => handleImageFitChange('cover')}
              >
                填充
              </button>
              <button
                className={`macos-segmented-btn ${config.imageFit === 'contain' ? 'active' : ''}`}
                onClick={() => handleImageFitChange('contain')}
              >
                适应
              </button>
              <button
                className={`macos-segmented-btn ${config.imageFit === 'stretch' ? 'active' : ''}`}
                onClick={() => handleImageFitChange('stretch')}
              >
                拉伸
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
