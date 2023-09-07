"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = require("path");
// import installExtension, {
//   REACT_DEVELOPER_TOOLS,
// } from "electron-devtools-installer";
var channels_1 = require("../config/channels");
var promises_1 = require("fs/promises");
var util_1 = require("../config/util");
var isWindows = process.platform === util_1.PlatformTypes.WINDOWS;
var userLanguage = "en_US";
function createWindow() {
    var _this = this;
    var win = new electron_1.BrowserWindow({
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
    if (electron_1.app.isPackaged) {
        // 'build/index.html'
        win.loadURL("file://".concat(__dirname, "/../index.html"));
    }
    else {
        // win.loadURL("https://mdm.bluesphere.cloud");
        win.loadURL("http://localhost:3003/login");
        win.webContents.openDevTools();
        // Hot Reloading on 'node_modules/.bin/electronPath'
        require("electron-reload")(__dirname, {
            electron: path.join(__dirname, "..", "..", "node_modules", ".bin", "electron" + (isWindows ? ".cmd" : "")),
            forceHardReset: true,
            hardResetMethod: "exit",
        });
    }
    // 注册事件
    electron_1.ipcMain.handle(channels_1.Channels.read_dir, function () { return __awaiter(_this, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, promises_1.readFile)((0, util_1.resolveConfigPath)())];
                case 1:
                    data = _a.sent();
                    return [2 /*return*/, [data.toString(), (0, util_1.resolveConfigPath)()]];
            }
        });
    }); });
    // 读取配置文件
    electron_1.ipcMain.handle(channels_1.Channels.read_config, function () { return __awaiter(_this, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, util_1.checkConfigPath)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, promises_1.readFile)((0, util_1.resolveConfigPath)())];
                case 2:
                    data = _a.sent();
                    return [2 /*return*/, data === null || data === void 0 ? void 0 : data.toString()];
            }
        });
    }); });
    electron_1.ipcMain.handle(channels_1.Channels.write_config, function (event, str) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, (0, util_1.checkConfigPath)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, promises_1.writeFile)((0, util_1.resolveConfigPath)(), str)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, true];
                case 3:
                    error_1 = _a.sent();
                    return [2 /*return*/, error_1];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    electron_1.ipcMain.handle(channels_1.Channels.open_message_box, function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, electron_1.dialog.showMessageBox(win, {
                    type: "error",
                    message: "this is a message",
                    title: "this is a title",
                    checkboxLabel: "Checkbox label",
                    buttons: ["cacnel", "ok"],
                    defaultId: 1,
                })];
        });
    }); });
    electron_1.ipcMain.handle(channels_1.Channels.open_path_select_dialog, function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, electron_1.dialog.showOpenDialog(win)];
        });
    }); });
    electron_1.ipcMain.handle(channels_1.Channels.send_user_language, function (ev, language) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log("ON_SEND_USER_LANGUAGE", language);
            userLanguage = language;
            return [2 /*return*/];
        });
    }); });
    // 监听消息
    // ipcMain.on(Channels.read_local_storage, (event, value) => {
    //   console.log("监听消息", value);
    // });
    // 设置菜单  生产环境下关闭菜单栏
    // isWindows && Menu.setApplicationMenu(null);
    electron_1.Menu.setApplicationMenu(null);
    var closeAllWindow = function () {
        return electron_1.BrowserWindow.getAllWindows().forEach(function (w) { return w.destroy(); });
    };
    win.on("close", function (e) {
        e.preventDefault();
        var isZh = userLanguage !== "en_US";
        electron_1.dialog
            .showMessageBox(win, {
            type: "warning",
            message: isZh ? "确定退出吗？" : "Are you sure to quit?",
            title: isZh ? "退出" : "Quit",
            // checkboxLabel: "Checkbox label",
            buttons: [isZh ? "取消" : "Cancel ", isZh ? "确认" : "Ok "],
            defaultId: 1,
        })
            .then(function (res) {
            if (res.response === 1) {
                // 0 代表取消 1 代表确认关闭
                closeAllWindow();
                electron_1.app.quit();
                // } else {
                //   console.log("else");
                //   win.webContents.send(Channels.read_local_storage);
            }
        });
    });
}
electron_1.app.whenReady().then(function () {
    // DevTools
    // installExtension(REACT_DEVELOPER_TOOLS)
    //   .then((name) => console.log(`Added Extension:  ${name}`))
    //   .catch((err) => console.log("An error occurred: ", err));
    createWindow();
    electron_1.app.on("activate", function () {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
    electron_1.app.on("window-all-closed", function () {
        if (process.platform !== "darwin") {
            electron_1.app.quit();
        }
    });
});
//# sourceMappingURL=main.js.map