import { app, BrowserWindow, dialog, ipcMain, Menu } from "electron";
import * as path from "path";
// import installExtension, {
//   REACT_DEVELOPER_TOOLS,
// } from "electron-devtools-installer";
import { Channels } from "../config/channels";
import { readFile, writeFile } from "fs/promises";
import {
  checkConfigPath,
  PlatformTypes,
  resolveConfigPath,
} from "../config/util";

const isWindows = process.platform === PlatformTypes.WINDOWS;

let userLanguage = "en_US";

function createWindow() {
  const win = new BrowserWindow({
    width: 1366,
    height: 768,
    minHeight: 400,
    minWidth: 960,
    webPreferences: {
      // contextIsolation: false,
      webSecurity: false,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (app.isPackaged) {
    // 'build/index.html'
    win.loadURL(`file://${__dirname}/../index.html`);
  } else {
    // win.loadURL("https://mdm.bluesphere.cloud");
    win.loadURL("http://localhost:3003/login");

    win.webContents.openDevTools();

    // Hot Reloading on 'node_modules/.bin/electronPath'
    require("electron-reload")(__dirname, {
      electron: path.join(
        __dirname,
        "..",
        "..",
        "node_modules",
        ".bin",
        "electron" + (isWindows ? ".cmd" : "")
      ),
      forceHardReset: true,
      hardResetMethod: "exit",
    });
  }
  // 注册事件
  ipcMain.handle(Channels.read_dir, async () => {
    const data = await readFile(resolveConfigPath());
    return [data.toString(), resolveConfigPath()];
  });
  // 读取配置文件
  ipcMain.handle(Channels.read_config, async () => {
    await checkConfigPath();
    const data = await readFile(resolveConfigPath());
    return data?.toString();
  });
  ipcMain.handle(Channels.write_config, async (event, str: string) => {
    try {
      await checkConfigPath();
      await writeFile(resolveConfigPath(), str);
      return true;
    } catch (error) {
      return error;
    }
  });
  ipcMain.handle(Channels.open_message_box, async () => {
    return dialog.showMessageBox(win, {
      type: "error",
      message: "this is a message",
      title: "this is a title",
      checkboxLabel: "Checkbox label",
      buttons: ["cacnel", "ok"],
      defaultId: 1,
    });
  });
  ipcMain.handle(Channels.open_path_select_dialog, async () => {
    return dialog.showOpenDialog(win);
  });

  ipcMain.handle(Channels.send_user_language, async (ev, language) => {
    console.log("ON_SEND_USER_LANGUAGE", language);
    userLanguage = language;
  });
  // 监听消息
  // ipcMain.on(Channels.read_local_storage, (event, value) => {
  //   console.log("监听消息", value);
  // });
  // 设置菜单  生产环境下关闭菜单栏
  // isWindows && Menu.setApplicationMenu(null);
  Menu.setApplicationMenu(null);

  const closeAllWindow = () =>
    BrowserWindow.getAllWindows().forEach((w) => w.destroy());

  win.on("close", (e) => {
    e.preventDefault();
    const isZh = userLanguage !== "en_US";
    dialog
      .showMessageBox(win, {
        type: "warning",
        message: isZh ? "确定退出吗？" : "Are you sure to quit?",
        title: isZh ? "退出" : "Quit",
        // checkboxLabel: "Checkbox label",
        buttons: [isZh ? "取消" : "Cancel ", isZh ? "确认" : "Ok "],
        defaultId: 1,
      })
      .then((res) => {
        if (res.response === 1) {
          // 0 代表取消 1 代表确认关闭
          closeAllWindow();
          app.quit();
          // } else {
          //   console.log("else");
          //   win.webContents.send(Channels.read_local_storage);
        }
      });
  });
}

app.whenReady().then(() => {
  // DevTools
  // installExtension(REACT_DEVELOPER_TOOLS)
  //   .then((name) => console.log(`Added Extension:  ${name}`))
  //   .catch((err) => console.log("An error occurred: ", err));

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
});
