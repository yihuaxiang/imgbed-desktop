// 设置窗口的预加载脚本
// 提供安全的 IPC 通信接口

const { contextBridge, ipcRenderer } = require('electron');

// 暴露受保护的方法给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 获取设置
  getSettings: () => ipcRenderer.invoke('get-settings'),
  
  // 保存设置
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  
  // 测试快捷键
  testShortcut: (shortcut) => ipcRenderer.invoke('test-shortcut', shortcut)
});
