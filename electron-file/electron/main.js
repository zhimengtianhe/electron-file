import { app, BrowserWindow, Menu, screen, ipcMain, dialog } from 'electron';
import path from 'path'
import { fileURLToPath } from 'url'
const __filenameNew = fileURLToPath(import.meta.url)
const __dirnameNew = path.dirname(__filenameNew)

// 是否是生产环境
const isPackaged = app.isPackaged;

let mainWindow;
Menu.setApplicationMenu(null);
const createWindow = () => {
  mainWindow = new BrowserWindow({
    title: "批量修改工具",
    // 设置窗口尺寸为屏幕工作区尺寸
    width: screen.getPrimaryDisplay().workAreaSize.width,
    height: screen.getPrimaryDisplay().workAreaSize.height,
    // 设置最小尺寸
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      // 开启node
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  // 使用 loadFile 加载 electron/index.html 文件
  if (isPackaged) {
    mainWindow.loadURL(`file://${path.join(__dirnameNew, "../dist/index.html")}`, {
      hash: 'fileRenam',
    });
  } else {
    mainWindow.loadURL("http://localhost:3004/");
  }

  mainWindow.webContents.openDevTools()
}

// 在应用准备就绪时调用函数
app.whenReady().then(() => {
  createWindow()
})

//获取文件夹
ipcMain.on('open-directory-dialog', (event) => {
  dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'multiSelections']
  }).then(result => {
    if (!result.canceled) {
      event.sender.send('selected-directory', result.filePaths);
    }
  }).catch(err => {
    console.log(err);
  });
});


app.on(
  "certificate-error",
  function(event, webContents, url, error, certificate, callback) {
    event.preventDefault();
    callback(true);
  }
);
