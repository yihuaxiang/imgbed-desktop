# 应用图标设置指南

## 📁 图标文件位置

将图标文件放在 `build/` 目录下：

```
imgbed-desktop/
├── build/
│   ├── icon.icns    # macOS 图标
│   ├── icon.ico     # Windows 图标
│   └── icon.png     # Linux 图标 (推荐 512x512 或 1024x1024)
├── main.js
└── package.json
```

## 🎨 图标格式要求

### macOS (.icns)
- 格式：ICNS
- 推荐尺寸：包含多个尺寸 (16x16 到 1024x1024)
- 可以使用在线工具转换：https://cloudconvert.com/png-to-icns

### Windows (.ico)
- 格式：ICO
- 推荐尺寸：包含多个尺寸 (16x16, 32x32, 48x48, 256x256)
- 可以使用在线工具转换：https://cloudconvert.com/png-to-ico

### Linux (.png)
- 格式：PNG
- 推荐尺寸：512x512 或 1024x1024
- 支持透明背景

## 🛠️ 图标制作步骤

### 方法 1: 使用在线工具

1. 准备一个高质量的 PNG 图片 (推荐 1024x1024，支持透明背景)
2. 访问 https://cloudconvert.com/ 或 https://convertio.co/
3. 分别转换为：
   - PNG → ICNS (macOS)
   - PNG → ICO (Windows)
   - 保留原 PNG (Linux)
4. 将生成的文件重命名为 `icon.icns`、`icon.ico`、`icon.png`
5. 放入 `build/` 目录

### 方法 2: 使用 electron-icon-builder (推荐)

安装工具：
```bash
npm install --save-dev electron-icon-builder
```

在 package.json 中添加脚本：
```json
"scripts": {
  "generate-icons": "electron-icon-builder --input=./icon.png --output=build --flatten"
}
```

运行生成图标：
```bash
npm run generate-icons
```

### 方法 3: 使用 ImageMagick (命令行)

**生成 ICO (Windows):**
```bash
convert icon.png -define icon:auto-resize=256,128,96,64,48,32,16 build/icon.ico
```

**生成 ICNS (macOS):**
```bash
# 需要在 macOS 系统上执行
mkdir icon.iconset
sips -z 16 16     icon.png --out icon.iconset/icon_16x16.png
sips -z 32 32     icon.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32     icon.png --out icon.iconset/icon_32x32.png
sips -z 64 64     icon.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128   icon.png --out icon.iconset/icon_128x128.png
sips -z 256 256   icon.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256   icon.png --out icon.iconset/icon_256x256.png
sips -z 512 512   icon.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512   icon.png --out icon.iconset/icon_512x512.png
sips -z 1024 1024 icon.png --out icon.iconset/icon_512x512@2x.png
iconutil -c icns icon.iconset -o build/icon.icns
rm -rf icon.iconset
```

## ✅ 验证图标设置

### 开发环境
运行应用查看窗口图标：
```bash
npm start
```

### 打包后验证
打包应用后检查：
```bash
npm run build:mac   # macOS
npm run build:win   # Windows
npm run build:linux # Linux
```

检查 `dist/` 目录中生成的应用程序图标。

## 📝 注意事项

1. **图标质量**：使用高质量、高分辨率的图标源文件
2. **透明背景**：PNG 图标建议使用透明背景
3. **文件命名**：必须严格按照 `icon.icns`、`icon.ico`、`icon.png` 命名
4. **路径配置**：图标文件必须放在 `build/` 目录下
5. **跨平台**：不同平台需要不同格式的图标文件

## 🔧 常见问题

**Q: 开发环境看不到图标？**
A: 确保 `build/icon.png` 文件存在，且 main.js 中的图标路径正确。

**Q: 打包后的应用没有图标？**
A: 检查 package.json 中的 build 配置，确保图标路径正确。

**Q: macOS 上图标显示异常？**
A: 确保 .icns 文件包含多个尺寸，建议使用专业工具生成。

**Q: 想临时测试但没有所有格式的图标？**
A: 可以先只准备一个 PNG 图标用于开发测试，打包时再补充其他格式。
