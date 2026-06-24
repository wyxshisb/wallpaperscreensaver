import { useState, useEffect, Component } from 'react';
import { WindowProvider, useWindow } from './renderer/contexts/WindowContext';
import SettingsApp from './renderer/settings/SettingsApp';
import ScreensaverApp from './renderer/screensaver/ScreensaverApp';
import './renderer/styles/macOS.css';

// 错误边界 — 捕获渲染错误，防止白屏
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React ErrorBoundary caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 32, color: '#ff6b6b', background: '#1a1a2e',
          minHeight: '100vh', fontFamily: 'monospace', fontSize: 14,
          whiteSpace: 'pre-wrap', overflow: 'auto',
        }}>
          <h2 style={{ color: '#ff6b6b' }}>渲染错误</h2>
          <p><strong>{this.state.error?.toString()}</strong></p>
          <p>{this.state.errorInfo?.componentStack}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { type } = useWindow();

  if (type === 'screensaver') {
    return <ScreensaverApp />;
  }

  return <SettingsApp />;
}

function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setVisible(false), 400);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className={`splash-screen ${fadeOut ? 'splash-fade-out' : ''}`}>
      <div className="splash-icon">🕐</div>
      <div className="splash-title">壁纸屏保</div>
      <div className="splash-loading">
        <div className="splash-loading-bar" />
      </div>
    </div>
  );
}

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 等待配置加载完成
    let mounted = true;
    window.electronAPI?.config?.get()?.then(() => {
      if (mounted) setReady(true);
    })?.catch(() => {
      // 如果获取配置失败，仍然显示界面
      if (mounted) setReady(true);
    });
    // 超时兜底：3秒后强制显示
    const timer = setTimeout(() => {
      if (mounted) setReady(true);
    }, 3000);
    return () => { mounted = false; clearTimeout(timer); };
  }, []);

  return (
    <ErrorBoundary>
      <WindowProvider>
        {!ready && <SplashScreen />}
        {ready && <AppContent />}
      </WindowProvider>
    </ErrorBoundary>
  );
}

export default App;
