const { app } = require('electron');
const fs = require('fs');
const path = require('path');

// 获取设置文件路径
function getSettingsPath() {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'settings.json');
}

// 默认设置
const defaultSettings = {
  uploadShortcutEnabled: false,
  uploadShortcut: 'CommandOrControl+Shift+U'
};

// 读取设置
function loadSettings() {
  try {
    const settingsPath = getSettingsPath();
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      const settings = JSON.parse(data);
      // 合并默认设置，确保所有字段都存在
      return { ...defaultSettings, ...settings };
    }
  } catch (error) {
    console.error('读取设置失败:', error);
  }
  return { ...defaultSettings };
}

// 保存设置
function saveSettings(settings) {
  try {
    const settingsPath = getSettingsPath();
    // 确保目录存在
    const dir = path.dirname(settingsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    // 合并现有设置
    const currentSettings = loadSettings();
    const newSettings = { ...currentSettings, ...settings };
    fs.writeFileSync(settingsPath, JSON.stringify(newSettings, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('保存设置失败:', error);
    return false;
  }
}

// 获取单个设置项
function getSetting(key) {
  const settings = loadSettings();
  return settings[key] !== undefined ? settings[key] : defaultSettings[key];
}

// 设置单个设置项
function setSetting(key, value) {
  return saveSettings({ [key]: value });
}

module.exports = {
  loadSettings,
  saveSettings,
  getSetting,
  setSetting,
  defaultSettings
};
