// 页面注入的上传脚本
// 这个文件包含要在 imgbed.cn 页面中执行的 JavaScript 代码

const uploadInjectorCode = `
(function() {
  // 将 Base64 图片数据转换为 File 对象
  function base64ToFile(dataUrl, filename = 'clipboard-image.png') {
    try {
      // 处理 data URL 格式：data:image/png;base64,xxxxx
      let base64Data = dataUrl;
      let mimeType = 'image/png';
      
      if (dataUrl.includes(',')) {
        const arr = dataUrl.split(',');
        const header = arr[0];
        base64Data = arr[1];
        
        // 提取 MIME 类型
        const mimeMatch = header.match(/:(.*?);/);
        if (mimeMatch) {
          mimeType = mimeMatch[1];
        }
      }
      
      // 解码 Base64
      const bstr = atob(base64Data);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      
      // 根据 MIME 类型设置文件扩展名
      if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
        filename = filename.replace(/\\.png$/, '.jpg');
      } else if (mimeType === 'image/gif') {
        filename = filename.replace(/\\.png$/, '.gif');
      } else if (mimeType === 'image/webp') {
        filename = filename.replace(/\\.png$/, '.webp');
      }
      
      return new File([u8arr], filename, { type: mimeType });
    } catch (error) {
      console.error('转换 Base64 到 File 失败:', error);
      throw error;
    }
  }

  // 方法 1: 尝试触发粘贴事件
  function triggerPasteEvent(file) {
    try {
      // 确保页面有焦点
      if (document.activeElement) {
        document.activeElement.focus();
      } else {
        window.focus();
      }

      // 注意：在浏览器环境中，ClipboardEvent 的 clipboardData 是只读的
      // 我们不能直接创建 ClipboardEvent 并设置 clipboardData
      // 但我们可以尝试创建一个模拟的粘贴事件，看看页面是否响应
      
      // 方法 1a: 尝试创建 ClipboardEvent（某些环境可能支持）
      try {
        // 创建 DataTransfer 对象
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);

        // 尝试创建 ClipboardEvent
        const pasteEvent = new ClipboardEvent('paste', {
          bubbles: true,
          cancelable: true
        });

        // 尝试通过 Object.defineProperty 设置 clipboardData（可能不工作）
        try {
          Object.defineProperty(pasteEvent, 'clipboardData', {
            value: dataTransfer,
            writable: false
          });
        } catch (e) {
          // 如果无法设置，继续尝试其他方法
        }
        
        // 在 document 上触发
        const dispatched = document.dispatchEvent(pasteEvent);
        
        // 也在 activeElement 上触发
        const activeElement = document.activeElement;
        if (activeElement && activeElement !== document.body) {
          activeElement.dispatchEvent(pasteEvent);
        }
        
        console.log('已触发粘贴事件');
        // 即使 clipboardData 可能无法设置，某些页面可能仍然会响应事件
        return true;
      } catch (e) {
        console.log('创建 ClipboardEvent 失败:', e);
      }

      // 方法 1b: 如果页面支持，尝试直接调用可能的粘贴处理函数
      // 这需要页面暴露了相关 API，通常不可行

      return false;
    } catch (error) {
      console.error('触发粘贴事件失败:', error);
      return false;
    }
  }

  // 方法 2: 通过文件输入框上传
  function triggerFileInput(file) {
    try {
      // 查找文件输入框（优先查找可见的）
      let fileInput = null;
      
      // 尝试查找所有文件输入框
      const allFileInputs = document.querySelectorAll('input[type="file"]');
      
      if (allFileInputs.length === 0) {
        console.log('未找到文件输入框');
        return false;
      }
      
      // 优先选择可见的文件输入框
      for (const input of allFileInputs) {
        const style = window.getComputedStyle(input);
        if (style.display !== 'none' && style.visibility !== 'hidden') {
          fileInput = input;
          break;
        }
      }
      
      // 如果没找到可见的，使用第一个
      if (!fileInput) {
        fileInput = allFileInputs[0];
      }
      
      if (!fileInput) {
        console.log('未找到可用的文件输入框');
        return false;
      }

      // 创建 DataTransfer 对象
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      // 设置文件输入框的 files 属性
      Object.defineProperty(fileInput, 'files', {
        value: dataTransfer.files,
        writable: false,
        configurable: true
      });

      // 触发 change 事件
      const changeEvent = new Event('change', { bubbles: true, cancelable: true });
      fileInput.dispatchEvent(changeEvent);

      // 也尝试触发 input 事件
      const inputEvent = new Event('input', { bubbles: true, cancelable: true });
      fileInput.dispatchEvent(inputEvent);

      console.log('已通过文件输入框触发上传');
      return true;
    } catch (error) {
      console.error('文件输入框上传失败:', error);
      return false;
    }
  }

  // 方法 3: 通过拖放区域上传
  function triggerDropEvent(file) {
    try {
      // 查找可能的拖放区域（通常有 draggable 属性或监听 drop 事件）
      // 尝试查找常见的拖放区域选择器
      const dropSelectors = [
        '[class*="drop"]',
        '[class*="upload"]',
        '[class*="drag"]',
        'body',
        'main',
        '#app',
        '[id*="upload"]',
        '[id*="drop"]'
      ];

      let dropZone = null;
      for (const selector of dropSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          // 检查元素是否可能支持拖放（有相关事件监听器或属性）
          dropZone = element;
          break;
        }
      }

      if (!dropZone) {
        dropZone = document.body;
      }

      // 创建 DataTransfer 对象
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      // 先触发 dragover 事件（必须阻止默认行为才能触发 drop）
      const dragOverEvent = new DragEvent('dragover', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dataTransfer
      });
      dropZone.dispatchEvent(dragOverEvent);
      
      // 触发 drop 事件
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dataTransfer
      });
      dropZone.dispatchEvent(dropEvent);

      console.log('已通过拖放事件触发上传');
      return true;
    } catch (error) {
      console.error('拖放上传失败:', error);
      return false;
    }
  }

  // 主上传函数：按优先级尝试各种方法
  function uploadFromClipboard(dataUrl) {
    try {
      console.log('开始尝试上传剪切板图片...');
      
      // 将 Base64 转换为 File 对象
      const file = base64ToFile(dataUrl);
      console.log('已创建文件对象:', file.name, file.type, file.size);

      // 方法 1: 尝试文件输入框（最可靠的方法）
      if (triggerFileInput(file)) {
        return { success: true, method: 'fileInput' };
      }

      // 方法 2: 尝试粘贴事件（如果页面支持）
      if (triggerPasteEvent(file)) {
        return { success: true, method: 'paste' };
      }

      // 方法 3: 尝试拖放（最后备选）
      if (triggerDropEvent(file)) {
        return { success: true, method: 'drop' };
      }

      // 所有方法都失败
      console.error('所有上传方法都失败了');
      return { success: false, error: '无法找到上传接口。请确保页面已加载完成。' };
    } catch (error) {
      console.error('上传过程中出错:', error);
      return { success: false, error: error.message };
    }
  }

  // 导出到全局作用域，供主进程调用
  window.uploadFromClipboard = uploadFromClipboard;
  
  console.log('上传注入脚本已加载');
})();
`;

module.exports = { uploadInjectorCode };
