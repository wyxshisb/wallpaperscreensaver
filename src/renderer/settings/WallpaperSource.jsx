export default function WallpaperSource({ config, setConfig, setMany }) {
  const handleSelectFolder = async () => {
    const result = await window.electronAPI.dialog.openFolder();
    if (result) {
      setConfig('wallpaperPath', result);
    }
  };

  const handleAddImages = async () => {
    const result = await window.electronAPI.dialog.openImages();
    if (result && result.length > 0) {
      const current = config.extraImages || [];
      const merged = [...new Set([...current, ...result])];
      setConfig('extraImages', merged);
    }
  };

  const handleAddVideos = async () => {
    const result = await window.electronAPI.dialog.openVideos();
    if (result && result.length > 0) {
      const current = config.extraVideos || [];
      const merged = [...new Set([...current, ...result])];
      setConfig('extraVideos', merged);
    }
  };

  const removeExtraImage = (index) => {
    const updated = [...(config.extraImages || [])];
    updated.splice(index, 1);
    setConfig('extraImages', updated);
  };

  const removeExtraVideo = (index) => {
    const updated = [...(config.extraVideos || [])];
    updated.splice(index, 1);
    setConfig('extraVideos', updated);
  };

  const extraImages = config.extraImages || [];
  const extraVideos = config.extraVideos || [];

  return (
    <>
      <h2 className="settings-panel-title">壁纸源</h2>
      <div className="settings-card">
        <div className="settings-row">
          <div>
            <div className="settings-row-label">壁纸文件夹</div>
            <div className="settings-row-sublabel">选择包含壁纸的文件夹</div>
          </div>
          <div className="settings-row-right">
            <div className={`path-display ${config.wallpaperPath ? 'has-path' : ''}`}>
              {config.wallpaperPath || '未选择文件夹'}
            </div>
            <button className="macos-btn macos-btn-primary" onClick={handleSelectFolder}>
              选择文件夹
            </button>
          </div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">添加图片</div>
            <div className="settings-row-sublabel">单独选择图片文件</div>
          </div>
          <div className="settings-row-right">
            <button className="macos-btn macos-btn-primary" onClick={handleAddImages}>
              添加图片
            </button>
          </div>
        </div>

        {extraImages.length > 0 && (
          <div className="file-tags">
            {extraImages.map((img, i) => (
              <span key={i} className="file-tag">
                <span className="file-tag-name" title={img}>
                  {img.split(/[/\\]/).pop()}
                </span>
                <button className="file-tag-remove" onClick={() => removeExtraImage(i)}>×</button>
              </span>
            ))}
          </div>
        )}

        <div className="settings-row">
          <div>
            <div className="settings-row-label">添加视频</div>
            <div className="settings-row-sublabel">单独选择视频文件</div>
          </div>
          <div className="settings-row-right">
            <button className="macos-btn macos-btn-primary" onClick={handleAddVideos}>
              添加视频
            </button>
          </div>
        </div>

        {extraVideos.length > 0 && (
          <div className="file-tags">
            {extraVideos.map((vid, i) => (
              <span key={i} className="file-tag">
                <span className="file-tag-name" title={vid}>
                  {vid.split(/[/\\]/).pop()}
                </span>
                <button className="file-tag-remove" onClick={() => removeExtraVideo(i)}>×</button>
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
