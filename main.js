const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');

// 全局变量保存窗口和托盘引用
let mainWindow = null;
let tray = null;

// 创建系统托盘
function createTray() {
  // 根据平台选择图标
  let iconPath;
  if (process.platform === 'win32') {
    iconPath = path.join(__dirname, 'build', 'icon.ico');
  } else {
    iconPath = path.join(__dirname, 'build', 'icon.png');
  }

  // 创建托盘图标
  tray = new Tray(iconPath);
  tray.setToolTip('Imgbed');

  // 创建托盘菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示窗口',
      click: () => {
        if (mainWindow) {
          if (mainWindow.isVisible()) {
            mainWindow.hide();
          } else {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      }
    },
    {
      type: 'separator'
    },
    {
      label: '退出',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);

  // 处理托盘图标点击事件
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
}

function createWindow() {
  // 如果窗口已存在，直接显示
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
    return;
  }

  // 设置窗口图标路径（开发环境）
  const iconPath = path.join(__dirname, 'build', 'icon.png');

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: iconPath, // 窗口图标
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    },
    title: 'Imgbed'
  });

  // 加载 imgbed.cn 网站
  mainWindow.loadURL('https://imgbed.cn/');

  // 可选：打开开发者工具
  // mainWindow.webContents.openDevTools();

  // 设置窗口标题
  mainWindow.on('page-title-updated', (event) => {
    event.preventDefault();
  });

  // 处理窗口关闭事件
  mainWindow.on('close', (event) => {
    // 在Windows和Linux上，隐藏窗口而不是关闭
    if (process.platform !== 'darwin') {
      if (!app.isQuitting) {
        event.preventDefault();
        mainWindow.hide();
      }
    }
    // macOS上允许关闭（dock图标会保留）
  });

  // 窗口被销毁时清除引用
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 当 Electron 完成初始化时创建窗口和托盘
app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    // 在 macOS 上，当点击 dock 图标且没有其他窗口打开时
    // 重新创建一个窗口
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
});

// 移除自动退出逻辑，改为通过托盘菜单退出
// 当所有窗口关闭时，应用继续在后台运行（通过托盘）
app.on('window-all-closed', () => {
  // 不再自动退出，应用通过托盘继续运行
  // 用户可以通过托盘菜单退出应用
});
