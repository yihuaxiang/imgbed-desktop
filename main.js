const { app, BrowserWindow, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

// 全局变量保存窗口和托盘引用
let mainWindow = null;
let tray = null;

// 获取资源路径（兼容开发环境和打包环境）
function getResourcePath(relativePath) {
  // 在打包后的应用中，资源文件在 app.asar 或 resources 目录
  if (app.isPackaged) {
    // 首先尝试 resources 目录（extraResources 放置的位置）
    // 这是最可靠的方式，因为 nativeImage 可以直接读取
    const resourcesPath = path.join(process.resourcesPath, relativePath);
    if (fs.existsSync(resourcesPath)) {
      return resourcesPath;
    }
    // 如果不存在，尝试使用 app.getAppPath() 获取应用路径
    const appPath = path.join(app.getAppPath(), relativePath);
    if (fs.existsSync(appPath)) {
      return appPath;
    }
    // 最后尝试 app.asar 中的路径
    return path.join(process.resourcesPath, 'app.asar', relativePath);
  } else {
    // 开发环境，使用 __dirname
    return path.join(__dirname, relativePath);
  }
}

// 创建系统托盘
function createTray() {
  try {
    // 根据平台选择图标
    let iconPath;
    if (process.platform === 'win32') {
      iconPath = getResourcePath(path.join('build', 'icon.ico'));
      // 如果 .ico 文件不存在，尝试使用 .png
      if (!fs.existsSync(iconPath)) {
        console.log('ICO 文件不存在，尝试使用 PNG:', iconPath);
        iconPath = getResourcePath(path.join('build', 'icon.png'));
      }
    } else {
      iconPath = getResourcePath(path.join('build', 'icon.png'));
    }

    // 检查文件是否存在
    if (!fs.existsSync(iconPath)) {
      console.error('托盘图标文件不存在:', iconPath);
      // 尝试使用备用路径
      const fallbackPath = path.join(__dirname, 'build', process.platform === 'win32' ? 'icon.ico' : 'icon.png');
      if (fs.existsSync(fallbackPath)) {
        iconPath = fallbackPath;
        console.log('使用备用图标路径:', iconPath);
      } else {
        console.error('备用图标文件也不存在:', fallbackPath);
        console.error('应用路径:', app.getAppPath());
        console.error('资源路径:', process.resourcesPath);
        console.error('是否打包:', app.isPackaged);
        return;
      }
    }

    console.log('使用图标路径:', iconPath);

    // 使用 nativeImage 加载图标（Windows 上更可靠）
    const icon = nativeImage.createFromPath(iconPath);
    if (icon.isEmpty()) {
      console.error('无法加载托盘图标（图标为空）:', iconPath);
      return;
    }

    // 创建托盘图标
    tray = new Tray(icon);
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

    console.log('系统托盘图标创建成功');
  } catch (error) {
    console.error('创建系统托盘失败:', error);
  }
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
