import { useState, useEffect, useRef } from 'react';

const UPDATE_NOTES = {
  '2.2.0': {
    title: 'v2.2.0 更新说明',
    items: [
      { type: 'feature', text: '壁纸滤镜系统 — 11种滤镜效果，只影响壁纸不影响时钟文本' },
      { type: 'feature', text: '新增滤镜：复古/鲜艳/高对比/冷色调/暖色调/反色/暗角' },
      { type: 'feature', text: '滤镜强度可调节，实时预览效果' },
      { type: 'fix', text: '修复更新后不显示更新说明的问题' },
      { type: 'fix', text: '安装程序自动检测并关闭运行中的应用' },
    ],
  },
  '2.1.0': {
    title: 'v2.1.0 更新说明',
    items: [
      { type: 'feature', text: '8种预设主题 — 经典/电影/悬浮/纪念碑/镂空/霓虹/禅意/极光' },
      { type: 'feature', text: '7种文本形态 — 毛玻璃/实底/镂空/液态玻璃/极简/描边/霓虹' },
      { type: 'feature', text: '3种文本对齐 — 左对齐/居中/右对齐' },
      { type: 'feature', text: '时钟和日期可独立隐藏' },
      { type: 'fix', text: '修复视频播放后不切换到图片的问题' },
    ],
  },
};

export default function UpdateNotesDialog({ version, onClose }) {
  const [countdown, setCountdown] = useState(10);
  const timerRef = useRef(null);
  const notes = UPDATE_NOTES[version] || { title: `v${version} 更新说明`, items: [] };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [onClose]);

  const handleClose = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    onClose();
  };

  return (
    <div className="update-overlay">
      <div className="update-dialog">
        <div className="update-header">
          <div className="update-icon">✨</div>
          <h2 className="update-title">{notes.title}</h2>
        </div>

        <div className="update-body">
          {notes.items.map((item, i) => (
            <div key={i} className={`update-item update-item-${item.type}`}>
              <span className="update-item-badge">
                {item.type === 'feature' ? '新功能' : item.type === 'fix' ? '修复' : '改进'}
              </span>
              <span className="update-item-text">{item.text}</span>
            </div>
          ))}
        </div>

        <div className="update-footer">
          <button className="update-close-btn" onClick={handleClose}>
            我知道了
            <span className="update-countdown">{countdown}s</span>
          </button>
        </div>
      </div>
    </div>
  );
}
