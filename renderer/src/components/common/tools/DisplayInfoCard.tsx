import { Box, SxProps, Typography, useTheme } from "@mui/material";
import { PropsWithChildren, ReactNode, RefObject } from "react";
import { useTranslation } from "react-i18next";

interface DisplayInfoCardProps {
  title: string;
  headerChild?: ReactNode | string;
  sx?: SxProps;
  headerSx?: SxProps;
  contentSx?: SxProps;
  showBorder?: boolean;
  containerRef?: RefObject<any>;
}

export default function DisplayInfoCard(props: PropsWithChildren<DisplayInfoCardProps>) {
  const { title, headerChild, children, containerRef, sx = {}, headerSx = {}, contentSx = {}, showBorder = true } = props;
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Box sx={{ border: showBorder ? 1 : 0, borderRadius: 1, borderColor: theme.palette.other.divider, p: 2, ...sx }}>
      <Box className="flex-btw" sx={headerSx}>
        <Box className="flex-start">
          {showBorder && <Box sx={{ width: 3, height: 12, bgcolor: theme.palette.primary.main, mr: 1 }}></Box>}
          <Typography>{t(title)}</Typography>
        </Box>
        {headerChild}
      </Box>
      <Box ref={containerRef} sx={contentSx}>
        {children}
      </Box>
    </Box>
  );
}
