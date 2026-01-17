# 图床小镇

基于 Electron 的 imgbed.cn 桌面应用。

## 安装依赖

```bash
npm install
```

## 运行应用

```bash
npm start
```

## 打包应用

### macOS
```bash
npm run build:mac
```

### Windows
```bash
# 便携版（推荐）- 单个 exe 文件，无需安装
npm run build:win:portable

# 64位版本（默认，适用于大多数系统）
npm run build:win
# 或明确指定
npm run build:win:x64

# 32位版本（用于旧系统）
npm run build:win:ia32
```

### Linux
```bash
npm run build:linux
```

打包后的应用会在 `dist` 目录中。

**重要**：构建会生成两种文件：
- **安装程序**：`图床小镇 Setup x.x.x.exe` - 用于安装到系统（推荐）
- **便携版**：`图床小镇 x.x.x.exe` - 可直接运行，无需安装
- **解压文件夹**：`win-unpacked/` - 包含所有文件，需要保持文件夹完整

⚠️ **注意**：不能只复制 exe 文件，Electron 应用需要所有依赖文件。请使用安装程序或便携版，或保持整个文件夹完整。

详细说明请查看 [BUILD_GUIDE.md](./BUILD_GUIDE.md)

## 功能特性

- 加载 https://imgbed.cn/ 网站
- 跨平台支持（macOS、Windows、Linux）
- 独立的桌面应用窗口
- 自定义应用图标支持

## Windows 10 安装问题

如果在 Windows 10 上安装时遇到问题，请查看 [WINDOWS_INSTALL_GUIDE.md](./WINDOWS_INSTALL_GUIDE.md) 了解详细解决方案。

### 常见错误

**错误："此应用无法在你的电脑上运行"**
- **原因**：架构不匹配（32位/64位）
- **解决方法**：
  1. 检查系统架构：设置 → 系统 → 关于 → 系统类型
  2. 64位系统使用：`npm run build:win:x64`
  3. 32位系统使用：`npm run build:win:ia32`

**错误：SmartScreen 拦截**
- **快速解决方法**：
  1. 右键点击安装包 → 属性 → 勾选"解除锁定"（如果有）
  2. 运行安装时，如果出现警告，点击"更多信息" → "仍要运行"

**错误：找不到 ffmpeg.dll**
- **原因**：缺少媒体处理库
- **解决方法**：已配置自动包含，重新构建应用即可：`npm run build:win:x64`

## 设置应用图标

查看 [ICON_GUIDE.md](./ICON_GUIDE.md) 了解如何设置应用图标。

简要步骤：
1. 准备图标文件（PNG, ICO, ICNS 格式）
2. 放入 `build/` 目录
3. 文件命名：`icon.png`, `icon.ico`, `icon.icns`

## 项目结构

- `main.js` - Electron 主进程文件
- `package.json` - 项目配置和依赖
- `build/` - 应用图标目录
- `ICON_GUIDE.md` - 图标设置详细指南
