import { app, contextBridge, ipcRenderer } from "electron";
import { Channels } from "../config/channels";

contextBridge.exposeInMainWorld("elecApi", {
  getInfo: () => {
    return {
      node: process.versions.node,
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      platform: process.platform,
    };
  },
  readDir() {
    return ipcRenderer.invoke(Channels.read_dir);
  },
  readConfig() {
    return ipcRenderer.invoke(Channels.read_config);
  },
  writeConfig(str: string) {
    return ipcRenderer.invoke(Channels.write_config, str);
  },
  openPathSelectDialog() {
    return ipcRenderer.invoke(Channels.open_path_select_dialog);
  },
  openMessageBox() {
    return ipcRenderer.invoke(Channels.open_message_box);
  },
  sendUserLanguage(language: string) {
    return ipcRenderer.invoke(Channels.send_user_language, language);
  },
  onReadLocalStorage(
    callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void
  ) {
    ipcRenderer.on(Channels.read_local_storage, callback);
  },
});
