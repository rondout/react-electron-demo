import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from ".";
import { CommomConfirmConfigData, SnackBarConfig } from "../models/material.models";

// 工具模块
export interface ToolsState {
  snackBarConfig: SnackBarConfig;
  confirmConfig: CommomConfirmConfigData;
}

const initialState: ToolsState = {
  snackBarConfig: { type: "success", duration: 3, content: "", open: false },
  confirmConfig: {} as CommomConfirmConfigData,
};

export const toolSlice = createSlice({
  name: "tool",
  initialState,
  reducers: {
    openConfirmAction(state, action: PayloadAction<CommomConfirmConfigData>) {
      state.confirmConfig = { ...state.confirmConfig, ...action.payload };
    },
    openSnackBar(state, action: PayloadAction<SnackBarConfig>) {
      state.snackBarConfig = { ...state.snackBarConfig, ...action.payload };
    },
    closeSnackBar(state) {
      state.snackBarConfig = { ...state.snackBarConfig, ...{ open: false } };
    },
    closeConfirmAction(state) {
      state.confirmConfig = { ...state.confirmConfig, ...{ open: false } };
    },
  },
});

export const { openConfirmAction, openSnackBar, closeSnackBar, closeConfirmAction } = toolSlice.actions;

export const selectSnackBarConfig = (state: RootState) => state.tool.snackBarConfig;

export const selectConfirmConfig = (state: RootState) => state.tool.confirmConfig;

export default toolSlice.reducer;
