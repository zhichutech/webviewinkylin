// Modules to control application life and create native browser window
const { app, Menu, MenuItem, ipcMain, BrowserWindow, screen, globalShortcut, dialog } = require('electron')
const path = require('node:path')
const fs = require('fs');

// 默认 URL
const defaultUrl = 'https://www.baidu.com';
// 目标 URL
let targetUrl = '';
// 编辑窗口
let editWindow = null;
let mainWindow = null;


function createWindow () {
  // Create the browser window.

  // 下面这个是工作区大小，扣除上下菜单栏的高度，而非真正全屏
  // const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  // 下面这个才是屏幕大小
  // fullWidth = screen.getPrimaryDisplay().size.width
  // fullHeight = screen.getPrimaryDisplay().size.height

  mainWindow = new BrowserWindow({
    icon: path.join(__dirname, 'release/icons/256x256.png'), // 设置窗口图标，这里以png为例
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, // 保持为 false 以提高安全性
      contextIsolation: true, // 启用上下文隔离
    },
    fullscreen: true, // 全屏
    autoHideMenuBar: false, // 自动隐藏菜单栏
    fullscreenable: true, // 全屏
    resizable: true, // 可调整大小
  })

  // 加载第三方网页
  mainWindow.loadURL(targetUrl);
  // mainWindow.webContents.openDevTools();

  // 为Esc注册全屏退出快捷键，也可以设置F11或其他，记得退出时注销
  globalShortcut.register('Esc', () => {
    if (mainWindow.isFocused()) {
      if (mainWindow.isFullScreen()) {
        mainWindow.setFullScreen(false);
        mainWindow.unmaximize();
      }
    }
  });

  let isFullScreen = true;

  mainWindow.on('maximize', () => {
    if (!isFullScreen) {
      isFullScreen = true;
      if (!mainWindow.isFullScreen()) {
        mainWindow.setFullScreen(true);
      }  
    }
    console.log('maximize');
  });

  mainWindow.on('unmaximize', () => {
    console.log('unmaximize');
  });

  mainWindow.on('minimize', () => {
    console.log('minimize');
  });

  mainWindow.on('leave-full-screen', () => {
    mainWindow.unmaximize();
    setTimeout(function(){
      isFullScreen = false;
    },1000);
  });

  mainWindow.on('enter-full-screen', () => {
  });

  // 设置自定义菜单
  setCustomMenu();
}

app.whenReady().then(() => {
  // 加载设置
  loadUrlFromSettings();
  createWindow()
  ipcCommunication();
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
  editWindow = null;
})


app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// 设置URL地址
const urlMenuItem = new MenuItem({
  label: '目标地址',
  click: () => {
    showEditWindow();
  }
});

// 自定义菜单设置
function setCustomMenu() {
  const template = [
    {
      label: '设置',
      submenu: [urlMenuItem]
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// 加载设置
function loadUrlFromSettings() {
  const filePath = path.join(app.getPath('userData'), 'settings.json');
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const savedSettings = JSON.parse(data);
    targetUrl = savedSettings.url;
  } catch (error) {
     // 如果文件不存在或读取失败，则创建默认的设置文件
     const defaultSettings = { url: defaultUrl };
     fs.writeFileSync(filePath, JSON.stringify(defaultSettings));
     targetUrl = defaultUrl;
  }
}

function saveUrlToSettings(newUrl) {
  const filePath = path.join(app.getPath('userData'), 'settings.json');
  fs.writeFileSync(filePath, JSON.stringify({ url: newUrl }));
}

// 显示编辑窗口
function showEditWindow() {
  if (editWindow) {
    return
  }
  editWindow = new BrowserWindow({
    width: 600,
    height: 450,
    minWidth: 600,
    minHeight: 450,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, // 保持为 false 以提高安全性
      contextIsolation: true, // 启用上下文隔离
    },
    parent: mainWindow,
    modal: true
  });  
  editWindow.loadFile('editUrl.html');
  editWindow.webContents.on('did-finish-load', () => {
    editWindow.webContents.send('current-url', targetUrl);
  });
  // 打开开发者工具
  // editWindow.webContents.openDevTools();
}

function showErrorMessage(message) {
  dialog.showErrorBox('错误', message);
}

function showCustomConfirm(message) {
  return dialog.showMessageBoxSync({
    type: 'question',
    buttons: ['确定', '取消'],
    defaultId: 0,
    title: '',
    message: message,
    icon: path.join(__dirname, 'release/icons/256x256.png') // 自定义图标路径
  });
}

function ipcCommunication() {
  // 监听编辑窗口的消息
  ipcMain.on('save-url', (event, newUrl) => {
    saveUrlFromIpc(newUrl);
  });
  
  ipcMain.on('cancel', () => {
    // 取消操作，关闭窗口
    cancelFromIpc();
  });
}

function saveUrlFromIpc(newUrl) {
  // 弹出确认提示框
  const confirmSave = showCustomConfirm('确定保存并重启应用吗？');
  if (confirmSave == 0) {
    // 保存新的URL
    saveUrlToSettings(newUrl)
    // 关闭窗口
    editWindow.close();
    // 重启应用加载新的URL
    app.relaunch();
    app.quit();
  }
}

function cancelFromIpc() {
  // 关闭窗口
  editWindow.close();
  editWindow = null;
}
