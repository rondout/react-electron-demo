import * as React from "react";
import Button from "@mui/material/Button";
import { styled, SxProps } from "@mui/material/styles";
import Dialog, { DialogProps } from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import LoadingButton from "@mui/lab/LoadingButton";
import { MuiButtonProps } from "../../../models/material.models";
import { t } from "i18next";
import Iconfont from "../tools/Iconfont";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(3),
  },
  "& .MuiDialogTitle-root+.MuiDialogContent-root": {
    paddingTop: theme.spacing(1),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

export interface DialogTitleProps {
  children?: React.ReactNode;
  transparentBg?: boolean;
  onClose?: () => void;
  sx?: SxProps;
}

export const BootstrapDialogTitle = (props: DialogTitleProps) => {
  const { children, onClose, transparentBg, sx = {}, ...other } = props;

  return (
    <DialogTitle
      sx={{
        m: 0,
        p: 2,
        px: 3,
        bgcolor: transparentBg ? "#fff" : (theme) => theme.palette.primary.main,
        color: transparentBg ? "#4d4d4d" : "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 1,
        ...sx,
      }}
      {...other}
    >
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            ml: 3,
            color: (theme) => (transparentBg ? "#4d4d4d" : theme.palette.background.default),
          }}
        >
          <Iconfont icon="ic_close" mr={0}></Iconfont>
        </IconButton>
      ) : null}
    </DialogTitle>
  );
};

// ok按钮数据类型
export interface OkBtnProps extends MuiButtonProps {
  loading?: boolean;
}

// 自定义Dialog的props数据类型
export interface MatDialogProps<T = any> {
  open: boolean;
  onClose?: () => void;
  onOk?: (...rest: T[]) => void | Promise<void | any>;
  title?: string;
  children?: React.ReactNode;
  okBtnProps?: OkBtnProps;
  cancelBtnProps?: MuiButtonProps;
  size?: DialogProps["maxWidth"];
  transparentTitleBg?: boolean;
  showDivider?: boolean;
  contentPadding?: number;
  maxHeight?: number;
  footerPadding?: number;
  hideFooter?: boolean;
  sx?: SxProps;
  fullWidth?: boolean;
}

export default function MatDialog(props: MatDialogProps) {
  const {
    open,
    onClose = () => {},
    onOk = () => {},
    title = "Dialog Title",
    children,
    okBtnProps = {},
    cancelBtnProps = {},
    transparentTitleBg = true,
    size = "sm",
    contentPadding = 3,
    sx = {},
    fullWidth = true,
  } = props;

  const [loading, setLoading] = React.useState<boolean>(Boolean(okBtnProps?.loading));
  // 如果onOk返回的是Promise类型，则会根据promise的状态自动控制确定按钮的loading状态以及自动关闭弹窗
  const onDialogOk = () => {
    const result = onOk();
    if (result instanceof Promise) {
      setLoading(true);
      result
        .then(() => {
          onClose();
          setLoading(false);
        })
        .catch(() => {
          // props.onClose();
          setLoading(false);
        });
      // props.onClose();
      // } else {
      //   props.onClose();
    }
  };

  return (
    <div>
      <BootstrapDialog maxWidth={size} onClose={onClose} aria-labelledby="customized-dialog-title" open={open} fullWidth={fullWidth}>
        <BootstrapDialogTitle onClose={onClose} transparentBg={transparentTitleBg}>
          {t(title)}
        </BootstrapDialogTitle>
        <DialogContent dividers={props.showDivider} sx={{ p: contentPadding, maxHeight: props.maxHeight || null, ...sx }}>
          {/* Dialog Content Start*/}
          {children}
          {/* Dialog Content End*/}
        </DialogContent>
        {!props.hideFooter && (
          <DialogActions sx={{ p: 2, pr: props.footerPadding || 3 }}>
            {cancelBtnProps && (
              <Button autoFocus variant="text" {...cancelBtnProps} onClick={onClose}>
                {t(cancelBtnProps.text || "common.cancel")}
              </Button>
            )}
            {okBtnProps && (
              <LoadingButton variant="contained" autoFocus {...okBtnProps} loading={loading} onClick={onDialogOk}>
                <span>{t(okBtnProps.text || "common.ok")}</span>
              </LoadingButton>
            )}
          </DialogActions>
        )}
      </BootstrapDialog>
    </div>
  );
}
