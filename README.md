# webviewinkylin

一个带有web view 的麒麟系统客户端，可以把web项目打包成一个可在麒麟下运行的桌面应用程序。

目前支持功能：

- 将一个网站打包成.deb文件（APP），可直接安装到麒麟系统中；
- APP打开，自动加载某个URL；
- 可以配置修改APP打开的默认URL；
- 支持启动时全屏打开APP（可用于展厅等国产化系统）；
- 支持快捷键，Esc快捷退出全屏，点击最大化按钮全屏显示。

使用的语言和框架：

- js  
- Electron 框架


主要文件:

- `package.json` - 配置文件，配置主入口，打包的相关信息，依赖等
- `main.js` - 主入口
- `editUrl.html` - 修改URL的页面
- `preload.js` - 在渲染进程加载前执行的脚本，用于ipc通讯


## 使用

需要安装 [Git](https://git-scm.com) 跟 [Node.js](https://nodejs.org/en/download/) (以及npm [npm](http://npmjs.com))，打开命令行并执行:

```bash
# 克隆仓库
git clone https://github.com/zhichutech/webviewinkylin
# 进入仓库
cd webviewinkylin
# 安装依赖
npm install
# 启动应用
npm start
# 修改应用图标
替换public文件夹中的icon.png文件，并执行
npm run electron:generate-icons
# 修改默认加载的URL
替换main.js中defaultUrl的值
# 打包deb应用
npm run builder
```
目前 package.json 中配置的是运行于麒麟桌面操作系统V10，x86-64架构的参数，
更多打包相关参数（应用名称等），以及其他平台的支持，可参考 [麒麟官网](https://eco.kylinos.cn/document/science.html) 的打包指南（需注册）。

## 调试
* 开发环境调试js： 若使用VSCode，可参考[这篇](https://juejin.cn/post/7054613172161871885#/)。
* 开发环境调试html：打开// mainWindow.webContents.openDevTools(); 或者// editWindow.webContents.openDevTools();的注释。
* 正式环境调试：使用脚本运行程序，并添加--remote-debugging-port参数，打开Chrome浏览器，输入chrome://inspect，更详细的信息请自行查阅。

## 注意事项

* **版本匹配**

在package.json中配置的electron版本需要匹配运行的设备系统

```bash
"devDependencies": {
    "electron": "20.0.3",
    ...
  },
```
如何知道是否匹配呢，可下载相应版本的eletron包，npm install后在node_modules/electron目录中查看README.md文件，也可到git上直接下载，有类似如下信息

```bash
## Platform support

Each Electron release provides binaries for macOS, Windows, and Linux.

* macOS (El Capitan and up): Electron provides 64-bit Intel and ARM binaries for macOS. Apple Silicon support was added in Electron 11.
* Windows (Windows 7 and up): Electron provides `ia32` (`x86`), `x64` (`amd64`), and `arm64` binaries for Windows. Windows on ARM support was added in Electron 5.0.8.
* Linux: The prebuilt binaries of Electron are built on Ubuntu 20.04. They have also been verified to work on:
  * Ubuntu 14.04 and newer
  * Fedora 24 and newer
  * Debian 8 and newer
```
若版本不匹配，可能出现加载本地html的一些样式问题（白屏等）。

* **最大化按钮**

基于业务需求，在点击最大化按钮的时候，需要让应用窗口进行全屏显示，Mac上点击后默认是全屏的（前提是启动时是全屏的），但在Linux上最大化后会有默认的系统菜单栏，为实现这一功能，一般做法是使用无边框窗口，亦即设置window的frame属性为false，通过html/css自定义顶部的最大/最小/关闭等选项的菜单栏。通过ipc进行渲染进程跟主进程之间的通信，同时需要处理拖拽等事件。该项目的做法是通过监听window的'maximize'事件，在里面进行全屏展示的逻辑处理。

## 相关参考文档

- [electron桌面应用图标更改](https://www.jianshu.com/p/a00e8b08be48)
- [麒麟官网技术文档](https://eco.kylinos.cn/document/science.html)
- [electron的ipc通讯](https://www.electronjs.org/zh/docs/latest/tutorial/context-isolation)
- [electron 自定义菜单](https://cloud.tencent.com/developer/article/2401332)

## License

[CC0 1.0 (Public Domain)](LICENSE.md)
