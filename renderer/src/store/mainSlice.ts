import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState, store } from ".";
import { ExtraConfig, UserInfo } from "../models/base.model";

export interface MainState {
  userInfo: UserInfo;
  collapsed: boolean;
  innerWidth: number;
  innerHeight: number;
  config: ExtraConfig;
}

const initialState: MainState = {
  userInfo: null,
  collapsed: true,
  innerHeight: 0,
  innerWidth: 0,
  config: {
    base_url: "http://192.168.16.117:8080",
    version: "1.0.0",
  },
};

export const mainSlice = createSlice({
  name: "main",
  initialState,
  reducers: {
    logout(state) {
      state.userInfo = null;
    },
    setUserInfo(state, action: PayloadAction<UserInfo>) {
      state.userInfo = action.payload;
    },
    setWindowSize(state, action: PayloadAction<{ innerWidth?: number; innerHeight?: number }>) {
      Object.assign(state, action.payload);
    },
    setExtraConfig(state, action: PayloadAction<ExtraConfig>) {
      state.config = action.payload;
    },
  },
});

export const { logout, setUserInfo, setWindowSize, setExtraConfig } = mainSlice.actions;

export const selectIsLoggin = (state: RootState) => !!state.main.userInfo;

export const selectCollapsed = (state: RootState) => state.main.collapsed;

export const selectConfig = (state: RootState) => state.main.config;

export const selectWindowSize = (state: RootState) => {
  const { innerHeight, innerWidth } = state.main;
  return { innerHeight, innerWidth };
};
// 从配置文件读取信息
export const readBaseUrlFromConfig = () => {
  return new Promise<void>((resolve) => {
    if (!window.elecApi) {
      resolve();
    } else {
      window.elecApi?.readConfig().then((res) => {
        const config: ExtraConfig = JSON.parse(res);
        store.dispatch(setExtraConfig(config));
        resolve();
      });
    }
  });
};

export default mainSlice.reducer;
