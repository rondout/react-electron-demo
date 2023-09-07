import { LoadingButton } from "@mui/lab";
import { Box, Button, Drawer, DrawerProps, SxProps, Typography } from "@mui/material";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import Iconfont from "../tools/Iconfont";

/**
 * @template P ok点击后返回的Promise的类型
 */
interface MatDrawerProps<P = any> extends DrawerProps {
  title: string;
  okText?: string;
  onCancel?(): void;
  onOk?(): void | Promise<P>;
  showFooter?: boolean;
  contentSx?: SxProps;
}

export default function MatDrawer(props: MatDrawerProps) {
  const { t } = useTranslation();
  const { title, onClose = () => {}, okText = "common.save", onCancel, onOk, anchor = "right", open, sx = {}, contentSx = {}, showFooter = true } = props;
  const [confirmLoading, setConfirmLoading] = useState(false);

  const closeDrawer = useCallback(() => {
    onClose(undefined, undefined);
  }, [onClose]);

  const handleCancel = useCallback(() => {
    onCancel && onCancel();
    closeDrawer();
  }, [onCancel, closeDrawer]);

  const handleOk = useCallback(() => {
    if (!onOk) {
      return;
    }
    const result = onOk();

    if (result instanceof Promise) {
      setConfirmLoading(true);
      result
        .then(() => {
          setConfirmLoading(false);
          closeDrawer();
        })
        .catch(() => {
          setConfirmLoading(false);
        });
      // } else {
      //   closeDrawer();
    }
  }, [onOk, closeDrawer]);

  return (
    <Drawer className="ssssssss" {...{ onClose, open, anchor }} sx={{ "& .MuiPaper-root": { maxWidth: 1, ...sx } } as SxProps}>
      <Box className="flex-btw" sx={{ height: 56, px: 3 }}>
        <Typography fontSize={16}>{t(title)}</Typography>
        <Iconfont pointer onClick={closeDrawer} icon="ic_close"></Iconfont>
      </Box>
      <Box sx={{ height: showFooter ? "calc(100% - 110px)" : "calc(100% - 56px)", px: 5, overflow: "auto", ...contentSx }} className="border-box">
        {props.children}
      </Box>
      {showFooter && (
        <Box className="flex-end" sx={{ height: 54, px: 3 }}>
          <Button onClick={handleCancel} sx={{ mr: 2 }}>
            {t("common.cancel")}
          </Button>
          <LoadingButton loading={confirmLoading} onClick={handleOk} variant="contained">
            {t(okText)}
          </LoadingButton>
        </Box>
      )}
    </Drawer>
  );
}
