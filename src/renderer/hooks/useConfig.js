import { useState, useEffect } from 'react';

export function useConfig() {
  const [config, setLocalConfig] = useState(null);

  useEffect(() => {
    // 获取初始配置
    window.electronAPI.config.get().then(setLocalConfig);
    // 监听配置变化
    window.electronAPI.config.onChange((data) => setLocalConfig(data));
  }, []);

  const setConfig = async (key, value) => {
    const newConfig = await window.electronAPI.config.set(key, value);
    setLocalConfig(newConfig);
  };

  const setMany = async (obj) => {
    const newConfig = await window.electronAPI.config.setMany(obj);
    setLocalConfig(newConfig);
  };

  return { config, setConfig, setMany };
}
