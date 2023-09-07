import { Box, SxProps, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import Iconfont from "./Iconfont";

export default function MessageTip({ title, sx = {} }: { title: string; sx?: SxProps }) {
  const { t } = useTranslation();

  return (
    <Box className="flex-start" sx={sx}>
      <Iconfont icon="ic_warn" fontSize={16} mr={0.5}></Iconfont>
      <Typography variant="subtitle2">{t(title)}</Typography>
    </Box>
  );
}
