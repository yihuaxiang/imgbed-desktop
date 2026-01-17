const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { loadSettings, saveSettings } = require('./settings');
const { registerShortcut } = require('./shortcut-manager');

let settingsWindow = null;

// 创建设置窗口
function createSettingsWindow() {
  // 如果窗口已存在，直接显示
  if (settingsWindow) {
    settingsWindow.show();
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 600,
    height: 400,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload-settings.js')
    },
    title: '设置 - Imgbed',
    show: false
  });

  // 加载设置页面 HTML
  settingsWindow.loadFile(path.join(__dirname, 'settings.html'));

  // 窗口关闭时清除引用
  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });

  // 窗口准备好后显示
  settingsWindow.once('ready-to-show', () => {
    settingsWindow.show();
  });
}

// 注册 IPC 处理器
function registerIpcHandlers() {
  // 获取设置
  ipcMain.handle('get-settings', async () => {
    return loadSettings();
  });

  // 保存设置
  ipcMain.handle('save-settings', async (event, settings) => {
    const success = saveSettings(settings);
    if (success) {
      // 如果快捷键设置改变了，重新注册
      if (settings.uploadShortcut !== undefined || settings.uploadShortcutEnabled !== undefined) {
        const allSettings = loadSettings();
        if (allSettings.uploadShortcutEnabled) {
          const result = registerShortcut(allSettings.uploadShortcut);
          if (!result.success) {
            return { success: false, error: result.error };
          }
        } else {
          registerShortcut(null); // 注销快捷键
        }
      }
    }
    return { success };
  });

  // 测试快捷键（检查是否可用）
  ipcMain.handle('test-shortcut', async (event, shortcut) => {
    const { globalShortcut } = require('electron');
    // 临时注册测试
    try {
      const ret = globalShortcut.register(shortcut, () => {});
      if (ret) {
        globalShortcut.unregister(shortcut);
        return { success: true };
      } else {
        return { success: false, error: '快捷键已被占用' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}

// 初始化（在应用启动时调用）
function init() {
  registerIpcHandlers();
}

module.exports = {
  createSettingsWindow,
  init
};
