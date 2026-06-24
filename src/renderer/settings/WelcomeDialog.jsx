export default function WelcomeDialog({ config, setConfig, setMany }) {
  const handleSelectFolder = async () => {
    const result = await window.electronAPI.dialog.openFolder();
    if (result) {
      setMany({ wallpaperPath: result, firstRun: false });
    }
  };

  const handleAddImages = async () => {
    const result = await window.electronAPI.dialog.openImages();
    if (result && result.length > 0) {
      const current = config.extraImages || [];
      const merged = [...new Set([...current, ...result])];
      setMany({ extraImages: merged, firstRun: false });
    }
  };

  const handleAddVideos = async () => {
    const result = await window.electronAPI.dialog.openVideos();
    if (result && result.length > 0) {
      const current = config.extraVideos || [];
      const merged = [...new Set([...current, ...result])];
      setMany({ extraVideos: merged, firstRun: false });
    }
  };

  return (
    <div className="welcome-overlay">
      <div className="welcome-dialog">
        <h2>欢迎使用壁纸屏保</h2>
        <p>选择壁纸文件夹，或单独添加图片和视频，即可开始使用。</p>
        <div className="welcome-actions">
          <button className="macos-btn macos-btn-primary" onClick={handleSelectFolder}>
            选择壁纸文件夹
          </button>
          <button className="macos-btn macos-btn-primary" onClick={handleAddImages}>
            添加图片
          </button>
          <button className="macos-btn macos-btn-primary" onClick={handleAddVideos}>
            添加视频
          </button>
        </div>
      </div>
    </div>
  );
}
