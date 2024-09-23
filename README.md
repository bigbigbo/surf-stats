# Surf Stats 浏览统计插件
> Prower by [Cursor](https://www.cursor.com/)

Surf Stats 是一个Chrome浏览器扩展，用于记录和统计您每天的网页浏览情况。

## 功能特点

- 自动记录访问的网站
- 统计每个网站的访问次数和停留时间
- 使用indexedDB记录每日浏览数据
- 可隐藏特定网站的统计信息

## 安装方法

1. 下载本仓库的源代码
2. 打开Chrome浏览器，进入扩展程序页面（chrome://extensions/）
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"，选择下载的源代码文件夹

## 使用说明

1. 安装完成后，Surf Stats 会自动开始记录您的浏览活动
2. 点击浏览器工具栏中的 Surf Stats 图标，查看今日浏览统计
3. 在统计页面，您可以:
   - 查看各网站的访问次数和停留时间
   - 选择显示或隐藏特定网站的统计信息
   - 进入设置页面进行更多自定义配置

## 隐私说明

Surf Stats 仅在本地记录和存储您的浏览数据，不会将任何信息上传到远程服务器。您可以随时清除或重置统计数据。

## 开发

本项目使用以下技术栈：

- React
- TypeScript
- Plasmo 框架
- Tailwind CSS

要进行开发，请按以下步骤操作：

1. 克隆仓库：`git clone [仓库URL]`
2. 安装依赖：`npm install`
3. 启动开发服务器：`npm run dev`
4. 构建生产版本：`npm run build`

## 贡献

欢迎提交 Issue 或 Pull Request 来帮助改进这个项目！

## 许可证

本项目采用 MIT 许可证。详情请见 [LICENSE](LICENSE) 文件。
