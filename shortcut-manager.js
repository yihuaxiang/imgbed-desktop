const { globalShortcut, clipboard } = require('electron');
const { uploadInjectorCode } = require('./upload-injector');

let currentShortcut = null;
let mainWindow = null;

// 设置主窗口引用
function setMainWindow(window) {
  mainWindow = window;
}

// 读取剪切板图片并上传
function uploadClipboardImage() {
  if (!mainWindow || !mainWindow.webContents) {
    console.log('主窗口不存在或未加载');
    return { success: false, error: '窗口未就绪' };
  }

  try {
    // 读取剪切板中的图片
    const image = clipboard.readImage();
    
    if (image.isEmpty()) {
      console.log('剪切板中没有图片');
      return { success: false, error: '剪切板中没有图片' };
    }

    // 将图片转换为 PNG Buffer，再转为 Base64
    const buffer = image.toPNG();
    const base64 = buffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;

    console.log('已读取剪切板图片，大小:', buffer.length, 'bytes');

    // 等待页面加载完成
    mainWindow.webContents.executeJavaScript(`
      (function() {
        return new Promise((resolve) => {
          if (document.readyState === 'complete') {
            resolve();
          } else {
            window.addEventListener('load', () => resolve(), { once: true });
          }
        });
      })();
    `).then(() => {
      // 注入上传脚本并执行
      // 先检查函数是否已存在，如果不存在则注入
      const checkAndInjectScript = `
        (function() {
          if (!window.uploadFromClipboard) {
            ${uploadInjectorCode}
          }
          return window.uploadFromClipboard('${dataUrl}');
        })();
      `;

      return mainWindow.webContents.executeJavaScript(checkAndInjectScript);
    }).then((result) => {
      if (result && result.success) {
        console.log('上传成功，使用方法:', result.method);
        // 可以在这里显示通知
        if (mainWindow) {
          mainWindow.webContents.send('upload-success', {
            method: result.method
          });
        }
      } else {
        console.error('上传失败:', result?.error || '未知错误');
        if (mainWindow) {
          mainWindow.webContents.send('upload-error', {
            error: result?.error || '上传失败'
          });
        }
      }
    }).catch((error) => {
      console.error('执行上传脚本时出错:', error);
      if (mainWindow) {
        mainWindow.webContents.send('upload-error', {
          error: error.message
        });
      }
    });

    return { success: true };
  } catch (error) {
    console.error('读取剪切板或上传时出错:', error);
    return { success: false, error: error.message };
  }
}

// 注册全局快捷键
function registerShortcut(shortcut) {
  // 先注销旧的快捷键
  if (currentShortcut) {
    globalShortcut.unregister(currentShortcut);
    currentShortcut = null;
  }

  if (!shortcut) {
    return { success: true };
  }

  try {
    const ret = globalShortcut.register(shortcut, () => {
      console.log('快捷键被触发:', shortcut);
      uploadClipboardImage();
    });

    if (ret) {
      currentShortcut = shortcut;
      console.log('快捷键注册成功:', shortcut);
      return { success: true };
    } else {
      console.error('快捷键注册失败，可能与其他应用冲突:', shortcut);
      return { success: false, error: '快捷键注册失败，可能与其他应用冲突' };
    }
  } catch (error) {
    console.error('注册快捷键时出错:', error);
    return { success: false, error: error.message };
  }
}

// 注销全局快捷键
function unregisterShortcut() {
  if (currentShortcut) {
    globalShortcut.unregister(currentShortcut);
    currentShortcut = null;
    console.log('快捷键已注销');
  }
}

// 注销所有快捷键（应用退出时调用）
function unregisterAll() {
  globalShortcut.unregisterAll();
  currentShortcut = null;
}

module.exports = {
  setMainWindow,
  registerShortcut,
  unregisterShortcut,
  unregisterAll,
  uploadClipboardImage
};
