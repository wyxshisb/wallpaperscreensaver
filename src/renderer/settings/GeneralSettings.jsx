import { useState, useEffect } from 'react';

const CHANGELOG = [
  {
    version: '3.0.0',
    items: [
      { type: 'feature', text: 'Ken Burns 效果 — 壁纸缓慢平移缩放，让静态图片有呼吸感' },
      { type: 'feature', text: '倒计时 — 自定义事件倒计时（生日、假期等），到期当天脉冲发光' },
      { type: 'feature', text: '智能配色 — 根据壁纸亮度自动调整时钟文字和毛玻璃背景颜色' },
      { type: 'feature', text: '座右铭 — 自定义座右铭轮换显示，默认 "One Step Ahead"' },
      { type: 'feature', text: '新手教程 — 托盘菜单可打开图文教程页面' },
      { type: 'improve', text: '预设主题全部推倒重做 — 12种全新艺术风格，按GPU开销分三档' },
      { type: 'improve', text: '主题微调重新组织 — 拖拽调整位置、排版/色彩/格式/背景效果分组' },
      { type: 'improve', text: '安装包点击 Finish 不再卡死（托盘应用无需自动启动）' },
      { type: 'fix', text: '移除导致GPU崩溃的音律波动功能' },
      { type: 'fix', text: '清理死代码和孤立样式，减小包体积' },
    ],
  },
  {
    version: '2.5.0',
    items: [
      { type: 'fix', text: '修复毛玻璃参数调整预览和实际无反应的问题' },
      { type: 'fix', text: '修复暗角滤镜导致预览和实际黑屏的问题' },
      { type: 'improve', text: '毛玻璃/液态玻璃样式参数调整实时生效' },
    ],
  },
  {
    version: '2.4.0',
    items: [
      { type: 'fix', text: '修复通用设置白屏问题' },
      { type: 'improve', text: '预览框与实际屏保效果完全一致' },
      { type: 'improve', text: '预览框按屏幕实际比例等比缩放' },
      { type: 'improve', text: '全屏检测开关移至闲置时间设置中' },
      { type: 'improve', text: '改用 electron-builder 内置 NSIS 打包，降低误报率' },
    ],
  },
  {
    version: '2.3.0',
    items: [
      { type: 'feature', text: '显示时间可独立关闭，日期/天气等不受影响' },
      { type: 'feature', text: '全屏应用检测 — 其他应用全屏时不触发屏保' },
      { type: 'improve', text: '版本信息与更新记录移至通用设置' },
    ],
  },
  {
    version: '2.2.0',
    items: [
      { type: 'feature', text: '壁纸滤镜系统 — 11种滤镜效果，只影响壁纸不影响时钟文本' },
      { type: 'feature', text: '新增滤镜：复古/鲜艳/高对比/冷色调/暖色调/反色/暗角' },
      { type: 'fix', text: '修复更新后不显示更新说明的问题' },
      { type: 'fix', text: '安装程序自动检测并关闭运行中的应用' },
    ],
  },
  {
    version: '2.1.0',
    items: [
      { type: 'feature', text: '8种预设主题 — 经典/电影/悬浮/纪念碑/镂空/霓虹/禅意/极光' },
      { type: 'feature', text: '7种文本形态 — 毛玻璃/实底/镂空/液态玻璃/极简/描边/霓虹' },
      { type: 'feature', text: '3种文本对齐 — 左对齐/居中/右对齐' },
      { type: 'feature', text: '时钟和日期可独立隐藏' },
      { type: 'fix', text: '修复视频播放后不切换到图片的问题' },
    ],
  },
  {
    version: '2.0.0',
    items: [
      { type: 'feature', text: '全新 Electron + React 架构重写' },
      { type: 'feature', text: '支持图片和视频混合壁纸' },
      { type: 'feature', text: '自定义闲置触发时间' },
      { type: 'feature', text: '毛玻璃时钟效果' },
    ],
  },
];

export default function GeneralSettings({ config, setConfig }) {
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [appVersion, setAppVersion] = useState('3.0.0');

  useEffect(() => {
    window.electronAPI?.getVersion?.().then((v) => {
      if (v) setAppVersion(v);
    }).catch(() => {});
  }, []);

  const handleAutoStartToggle = (e) => {
    setConfig('autoStart', e.target.checked);
  };

  return (
    <>
      <h2 className="settings-panel-title">通用</h2>

      <div className="settings-card">
        <div className="settings-row">
          <div>
            <div className="settings-row-label">开机自启</div>
            <div className="settings-row-sublabel">系统启动时自动运行应用</div>
          </div>
          <div className="settings-row-right">
            <label className="macos-toggle">
              <input
                type="checkbox"
                checked={config.autoStart}
                onChange={handleAutoStartToggle}
              />
              <span className="macos-toggle-track" />
              <span className="macos-toggle-thumb" />
            </label>
          </div>
        </div>
      </div>

      <h2 className="settings-panel-title" style={{ marginTop: 20 }}>关于</h2>

      <div className="settings-card">
        <div className="about-info">
          <div className="about-row">
            <span className="about-label">应用名称</span>
            <span className="about-value">壁纸屏保</span>
          </div>
          <div className="about-row">
            <span className="about-label">当前版本</span>
            <span className="about-value">v{appVersion}</span>
          </div>
          <div className="about-row">
            <span className="about-label">开发者</span>
            <span className="about-value">咸鱼</span>
          </div>
          <div className="about-row">
            <span className="about-label">联系方式</span>
            <span className="about-value">xunguang255@163.com</span>
          </div>
        </div>

        <div className="changelog-toggle" onClick={() => setChangelogOpen(!changelogOpen)}>
          <span className="changelog-toggle-label">更新记录</span>
          <span className={`changelog-toggle-arrow ${changelogOpen ? 'open' : ''}`}>▸</span>
        </div>

        {changelogOpen && (
          <div className="changelog-list">
            {CHANGELOG.map((release) => (
              <div key={release.version} className="changelog-version">
                <div className="changelog-version-title">v{release.version}</div>
                {release.items.map((item, i) => (
                  <div key={i} className={`changelog-item changelog-item-${item.type}`}>
                    <span className="changelog-badge">
                      {item.type === 'feature' ? '新功能' : item.type === 'fix' ? '修复' : '改进'}
                    </span>
                    <span className="changelog-text">{item.text}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
