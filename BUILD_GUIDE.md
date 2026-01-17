# 构建和分发指南

## 重要说明：安装程序 vs 解压文件夹

### 两种构建产物

Electron 应用构建后会生成两种产物：

1. **`win-unpacked/` 文件夹**（解压后的应用）
   - 这是解压后的应用文件夹
   - 包含所有依赖文件（.dll、资源文件等）
   - **不能单独复制 exe 文件**，需要整个文件夹
   - 主要用于开发测试

2. **安装程序（.exe）**（推荐用于分发）
   - 这是一个独立的安装程序文件
   - 文件名类似：`Imgbed Setup 1.0.0.exe`
   - 用户双击运行即可安装
   - 安装后会在系统目录创建应用
   - **这是应该分发给用户的文件**

### 当前问题

如果你只看到 `win-unpacked` 文件夹而没有安装程序，说明构建没有完成安装程序的生成。

## 解决方案

### 方案 1：使用安装程序（推荐）

1. **确保图标符合要求**：
   - Windows 图标（.ico）必须至少 256x256 像素
   - 当前图标是 128x128，需要更新

2. **准备符合要求的图标**：
   ```bash
   # 如果你有更大的 PNG 图标（至少 256x256）
   # 可以使用在线工具转换为 ICO：
   # https://cloudconvert.com/png-to-ico
   # 或使用 ImageMagick：
   # convert icon.png -define icon:auto-resize=256,128,96,64,48,32,16 build/icon.ico
   ```

3. **重新构建**：
   ```bash
   npm run build:win:x64
   ```

4. **查找安装程序**：
   - 构建完成后，在 `dist/` 目录中查找 `Imgbed Setup x.x.x.exe`
   - 这个文件就是安装程序，可以直接分发给用户

### 方案 2：使用便携版（Portable）⭐ 推荐

便携版是一个独立的 `.exe` 文件，用户可以直接运行，无需安装。

**优点**：
- ✅ 单个 exe 文件，方便分发
- ✅ 无需安装，双击即用
- ✅ 不会在系统注册表中留下痕迹
- ✅ 可以放在 U 盘或任意位置运行

**使用方法**：

1. **只生成便携版**（推荐）：
   ```bash
   npm run build:win:portable
   ```

2. **同时生成安装程序和便携版**：
   ```bash
   npm run build:win:x64
   ```

3. **构建结果**：
   - 便携版文件：`dist/Imgbed 1.0.0.exe`
   - 这是一个独立的可执行文件，可以直接分发给用户

**注意**：
- 便携版首次运行可能会解压文件到临时目录
- 文件大小会比安装程序稍大（因为包含所有依赖）
- 如果遇到图标尺寸错误，需要先修复图标问题

### 方案 3：临时使用 win-unpacked（不推荐）

如果暂时无法生成安装程序，可以：

1. 将整个 `win-unpacked` 文件夹打包成 ZIP
2. 用户解压后，运行其中的 `Imgbed.exe`
3. **注意**：必须保持文件夹结构完整，不能只复制 exe 文件

## 图标问题修复

### 快速修复（临时）

如果暂时没有符合要求的图标，可以：

1. **临时移除图标配置**（不推荐，但可以快速构建）：
   - 从 `package.json` 中移除所有图标引用
   - 构建会使用默认图标

2. **使用在线工具生成**：
   - 访问 https://cloudconvert.com/png-to-ico
   - 上传你的 PNG 图标（建议至少 256x256）
   - 下载生成的 ICO 文件
   - 替换 `build/icon.ico`

3. **使用 electron-icon-builder**：
   ```bash
   npm install --save-dev electron-icon-builder
   ```
   
   在 `package.json` 中添加脚本：
   ```json
   "scripts": {
     "generate-icons": "electron-icon-builder --input=./icon-source.png --output=build --flatten"
   }
   ```
   
   运行：
   ```bash
   npm run generate-icons
   ```

## 验证构建结果

### 如果构建安装程序：
```
dist/
├── win-unpacked/          # 解压后的应用（用于测试）
│   ├── Imgbed.exe
│   ├── ffmpeg.dll
│   └── ... (其他文件)
└── Imgbed Setup 1.0.0.exe  # 安装程序（分发给用户）
```

### 如果构建便携版：
```
dist/
├── win-unpacked/          # 解压后的应用（用于测试）
└── Imgbed 1.0.0.exe       # 便携版（单个 exe 文件，推荐分发）
```

### 如果同时构建两者：
```
dist/
├── win-unpacked/          # 解压后的应用（用于测试）
├── Imgbed Setup 1.0.0.exe  # 安装程序
└── Imgbed 1.0.0.exe       # 便携版
```

## 分发建议

- **便携版（推荐）**：分发 `Imgbed x.x.x.exe` - 单个文件，无需安装，最方便
- **安装程序**：分发 `Imgbed Setup x.x.x.exe` - 适合需要安装到系统的用户
- **开发者/测试**：可以分发 `win-unpacked` 文件夹的 ZIP 压缩包

## 常见问题

**Q: 为什么不能只复制 exe 文件？**
A: Electron 应用不是传统的单文件应用，它依赖多个 DLL 和资源文件。所有文件必须在同一目录下。

**Q: 安装程序和 win-unpacked 有什么区别？**
A: 
- `win-unpacked` 是解压后的应用，可以直接运行但需要保持文件夹完整
- 安装程序会安装到系统目录，创建开始菜单快捷方式，可以卸载

**Q: 如何让应用变成单个 exe 文件？**
A: 可以使用便携版（portable）配置，但文件仍然会解压到临时目录。真正的单文件需要其他打包工具。
