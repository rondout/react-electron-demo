"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var channels_1 = require("../config/channels");
electron_1.contextBridge.exposeInMainWorld("elecApi", {
    getInfo: function () {
        return {
            node: process.versions.node,
            electron: process.versions.electron,
            chrome: process.versions.chrome,
            platform: process.platform,
        };
    },
    readDir: function () {
        return electron_1.ipcRenderer.invoke(channels_1.Channels.read_dir);
    },
    readConfig: function () {
        return electron_1.ipcRenderer.invoke(channels_1.Channels.read_config);
    },
    writeConfig: function (str) {
        return electron_1.ipcRenderer.invoke(channels_1.Channels.write_config, str);
    },
    openPathSelectDialog: function () {
        return electron_1.ipcRenderer.invoke(channels_1.Channels.open_path_select_dialog);
    },
    openMessageBox: function () {
        return electron_1.ipcRenderer.invoke(channels_1.Channels.open_message_box);
    },
    sendUserLanguage: function (language) {
        return electron_1.ipcRenderer.invoke(channels_1.Channels.send_user_language, language);
    },
    onReadLocalStorage: function (callback) {
        electron_1.ipcRenderer.on(channels_1.Channels.read_local_storage, callback);
    },
});
//# sourceMappingURL=preload.js.map