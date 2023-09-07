import { AlertProps } from "@mui/material";
import { ReactNode } from "react";

export interface MuiButtonProps {
  text?: string;
  [propName: string]: any;
}

// message模块
export interface SnackBarConfig {
  content?: string;
  open?: boolean;
  duration?: number;
  type?: AlertProps["severity"];
}
export interface CommomConfirmConfigData {
  title: string;
  content?: string | React.ReactNode;
  customContent?: boolean;
  okBtnDisabled?: boolean;
  onOk?: () => void | Promise<any>;
  onCancel?: () => void;
  open?: boolean;
  okText?: string;
  cancelText?: string;
  showWarningIcon?: boolean;
  showCancelButton?: boolean;
  okBtnType?: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning";
}
// confirm模块
export interface ConfirmConfigData extends CommomConfirmConfigData {
  content: string | React.ReactNode;
}

export interface DeleteConfirmConfigData extends CommomConfirmConfigData {
  content?: string | ReactNode;
}
