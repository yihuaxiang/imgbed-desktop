# Windows 10 安装问题解决方案

## 问题描述

在 Windows 10 上安装应用时可能遇到以下错误：
- "无法安装此应用"
- "此应用无法在你的电脑上运行，若要找到适用于你的电脑的版本，请咨询软件发布者"
- "Windows 已保护你的电脑"
- SmartScreen 拦截提示

## 原因分析

1. **架构不匹配**：最常见的原因，32位系统尝试安装64位应用，或反之
2. **未签名应用**：Windows 10 的 SmartScreen 会拦截未签名的应用程序
3. **权限问题**：安装器可能需要管理员权限
4. **安全策略**：Windows Defender 可能将未签名的应用标记为不安全

## 解决方案

### 方案 0：检查系统架构（最重要！）

如果遇到"此应用无法在你的电脑上运行"错误，**首先检查系统架构**：

1. **检查 Windows 系统架构**：
   - 按 `Win + X`，选择"系统"
   - 查看"系统类型"：
     - "64位操作系统" → 需要 64位（x64）安装包
     - "32位操作系统" → 需要 32位（ia32）安装包

2. **检查安装包架构**：
   - 右键点击安装包 → 属性 → 详细信息
   - 查看"体系结构"或"架构"信息
   - 或查看文件名，通常包含 `x64` 或 `ia32` 标识

3. **重新构建对应架构的安装包**：
   ```bash
   # 64位系统（大多数 Windows 10）
   npm run build:win:x64
   
   # 32位系统（较少见）
   npm run build:win:ia32
   ```

4. **如果构建脚本没有指定架构，默认会构建 x64（64位）版本**

### 方案 1：手动绕过 SmartScreen（推荐用于测试）

1. **下载安装包后**：
   - 右键点击安装包（.exe 文件）
   - 选择"属性"
   - 在"常规"选项卡底部，勾选"解除锁定"（如果有此选项）
   - 点击"确定"

2. **运行安装时**：
   - 如果出现 SmartScreen 警告，点击"更多信息"
   - 然后点击"仍要运行"

3. **通过 Windows Defender**：
   - 打开 Windows 安全中心
   - 进入"病毒和威胁防护"
   - 在"威胁历史记录"中，找到被阻止的应用
   - 选择"允许在设备上"

### 方案 2：使用组策略（企业环境）

如果是企业环境，可以通过组策略禁用 SmartScreen：
1. 按 `Win + R`，输入 `gpedit.msc`
2. 导航到：计算机配置 → 管理模板 → Windows 组件 → Windows Defender SmartScreen → Explorer
3. 配置"配置 Windows Defender SmartScreen"策略

### 方案 3：代码签名（生产环境推荐）

对于正式发布的应用，建议使用代码签名证书：

1. **获取代码签名证书**：
   - 从证书颁发机构（CA）购买代码签名证书
   - 或使用自签名证书（仅用于测试）

2. **配置签名**：
   在 `package.json` 的 `build.win` 中添加：
   ```json
   "win": {
     "certificateFile": "path/to/certificate.pfx",
     "certificatePassword": "your-password",
     "signingHashAlgorithms": ["sha256"],
     "sign": "path/to/signtool.exe"
   }
   ```

3. **使用环境变量**：
   ```bash
   # Windows
   set CSC_LINK=path/to/certificate.pfx
   set CSC_KEY_PASSWORD=your-password
   npm run build:win
   ```

## 当前配置说明

已更新的配置包括：

- **`downloadAlternateFFmpeg: true`**：自动下载并包含 ffmpeg.dll（解决媒体播放问题）
- **`requestedExecutionLevel: "asInvoker"`**：不需要管理员权限即可安装
- **`oneClick: false`**：使用标准安装向导，允许用户选择安装路径
- **`allowToChangeInstallationDirectory: true`**：允许用户选择安装目录
- **`verifyUpdateCodeSignature: false`**：不验证更新签名（适用于未签名应用）

### 构建脚本说明

- `npm run build:win` - 构建 64位 Windows 安装包（默认）
- `npm run build:win:x64` - 明确构建 64位版本
- `npm run build:win:ia32` - 构建 32位版本（用于旧系统）

## 安装步骤

1. **重新构建应用**：
   ```bash
   npm run build:win
   ```

2. **在 Windows 10 上安装**：
   - 找到 `dist/` 目录中的安装包
   - 右键点击安装包，选择"以管理员身份运行"（如果需要）
   - 如果出现 SmartScreen 警告，按照方案 1 的步骤操作

3. **验证安装**：
   - 安装完成后，从开始菜单或桌面快捷方式启动应用
   - 确认应用正常运行

## 常见错误及解决方法

### 错误 1：安装程序无法启动
**解决方法**：
- 确保以管理员权限运行安装程序
- 检查 Windows Defender 是否拦截
- 尝试禁用杀毒软件临时测试

### 错误 2：安装过程中断
**解决方法**：
- 检查磁盘空间是否充足
- 确保有写入权限
- 关闭可能冲突的其他程序

### 错误 3：安装后无法运行
**解决方法**：
- 检查 Windows 事件查看器中的错误日志
- 确保所有依赖项已正确安装
- 尝试以管理员身份运行应用

### 错误 4：此应用无法在你的电脑上运行 ⚠️
**这是架构不匹配错误，解决方法**：
1. **确认系统架构**：
   - 打开"设置" → "系统" → "关于"
   - 查看"系统类型"（64位或32位）

2. **确认安装包架构**：
   - 查看安装包文件名或属性
   - 64位系统必须使用 x64 安装包
   - 32位系统必须使用 ia32 安装包

3. **重新构建正确架构的安装包**：
   ```bash
   # 对于 64位 Windows 10（最常见）
   npm run build:win:x64
   
   # 对于 32位 Windows 10（较少见）
   npm run build:win:ia32
   ```

4. **如果仍然无法运行**：
   - 检查是否安装了 Visual C++ Redistributable
   - 检查 Windows 版本是否过旧（需要 Windows 7 或更高版本）
   - 尝试在兼容模式下运行

### 错误 5：找不到 ffmpeg.dll ⚠️
**错误信息**："由于找不到 ffmpeg.dll,无法继续执行代码。重新安装程序可能会解决此问题。"

**原因**：Electron 应用需要 ffmpeg.dll 来处理媒体内容，但默认构建可能不包含此文件。

**解决方法**：
1. **已修复**：配置中已添加 `downloadAlternateFFmpeg: true`，重新构建即可
2. **重新构建应用**：
   ```bash
   npm run build:win:x64
   ```
3. **验证**：构建完成后，检查 `dist/win-unpacked/` 目录中是否包含 `ffmpeg.dll` 文件
4. **如果问题仍然存在**：
   - 确保使用最新构建的安装包
   - 检查应用安装目录中是否有 `ffmpeg.dll`
   - 尝试完全卸载后重新安装

## 长期解决方案

对于正式发布的应用，强烈建议：

1. **获取代码签名证书**：从受信任的 CA 购买证书
2. **使用自动更新**：配置自动更新机制
3. **发布到 Microsoft Store**：通过 Microsoft Store 分发可以避免大部分安装问题

## 相关资源

- [Electron Builder Windows 配置文档](https://www.electron.build/configuration/win)
- [Windows 代码签名指南](https://www.electron.build/code-signing)
- [SmartScreen 说明](https://support.microsoft.com/zh-cn/windows/windows-defender-smartscreen-%E4%B8%8E%E6%B5%8F%E8%A7%88%E5%99%A8%E4%BF%9D%E6%8A%A4-0c8e9517-6260-ba6f-4d1d-7cd30fc81ef6)
