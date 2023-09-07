import "./App.scss";
import { ThemeProvider } from "@mui/material";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "./store";
import { MessageBoxReturnValue, OpenDialogReturnValue } from "electron";
import { generateTheme } from "./utils";
import MatSnackBar from "./components/common/mui/MatSnackBar";
import MatConfirm from "./components/common/mui/MatConfirm";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { readBaseUrlFromConfig } from "./store/mainSlice";

export const baseFontSize = 14;

declare global {
  interface Window {
    elecApi: {
      readDir(): Promise<string[]>;
      readConfig(): Promise<string>;
      writeConfig(str: string): Promise<boolean | Error>;
      openPathSelectDialog(): Promise<OpenDialogReturnValue>;
      openMessageBox(): Promise<MessageBoxReturnValue>;
      sendUserLanguage(language: string): Promise<string[]>;
      onReadLocalStorage: (callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void;
    };
  }
}

const theme = generateTheme();
// const theme = generateTheme("#3f51b5");

function App() {
  const { i18n } = useTranslation();
  const [readConfigFinish, setReadConfigFinish] = useState(false);
  // 将render进程的语言信息传递给主进程
  const sendLanguageToMainProcess = useCallback(() => {
    window.elecApi?.sendUserLanguage(i18n.language);
  }, [i18n]);
  // 将render进程的语言信息传递给主进程
  useEffect(() => {
    window.elecApi?.onReadLocalStorage((event: Electron.IpcRendererEvent) => {
      event.sender.send("read_local_storage", JSON.stringify(window.localStorage));
    });
  }, [sendLanguageToMainProcess]);
  // 设置语言
  useEffect(() => {
    window.localStorage.setItem("language", i18n.language);
  }, [i18n.language]);
  // 从主进程读取配置文件
  useEffect(() => {
    readBaseUrlFromConfig().then(() => {
      setReadConfigFinish(true);
    });
  }, []);

  useEffect(() => {
    sendLanguageToMainProcess();
  }, [sendLanguageToMainProcess]);

  if (!readConfigFinish) {
    // 每次启动程序前应该先读取配置文件
    return null;
  }

  return (
    // 主题
    <ThemeProvider theme={theme}>
      {/* 全局状态redux */}
      <ReduxProvider store={store}>
        <MatSnackBar />
        <MatConfirm />
        {/* 路由React-router */}
        <RouterProvider router={router}></RouterProvider>
      </ReduxProvider>
    </ThemeProvider>
  );
}

export default App;
