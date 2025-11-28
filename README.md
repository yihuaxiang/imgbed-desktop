# Imgbed Desktop

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
npm run build:win
```

### Linux
```bash
npm run build:linux
```

打包后的应用会在 `dist` 目录中。

## 功能特性

- 加载 https://imgbed.cn/ 网站
- 跨平台支持（macOS、Windows、Linux）
- 独立的桌面应用窗口

## 项目结构

- `main.js` - Electron 主进程文件
- `package.json` - 项目配置和依赖
