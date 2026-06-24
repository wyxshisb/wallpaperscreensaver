import { createContext, useContext, useState, useEffect } from 'react';

const WindowContext = createContext({ type: 'settings' });

export function WindowProvider({ children }) {
  const [type, setType] = useState(() => {
    // 优先从注入的变量读取
    if (window.__WINDOW_TYPE__) return window.__WINDOW_TYPE__;
    // 回退到 URL 参数
    const params = new URLSearchParams(window.location.search);
    return params.get('window') === 'screensaver' ? 'screensaver' : 'settings';
  });

  useEffect(() => {
    // 监听窗口类型注入事件（生产模式下 loadFile query 可能丢失）
    const handler = () => {
      if (window.__WINDOW_TYPE__) {
        setType(window.__WINDOW_TYPE__);
      }
    };
    document.addEventListener('window-type-ready', handler);
    return () => document.removeEventListener('window-type-ready', handler);
  }, []);

  return (
    <WindowContext.Provider value={{ type }}>
      {children}
    </WindowContext.Provider>
  );
}

export function useWindow() {
  return useContext(WindowContext);
}
