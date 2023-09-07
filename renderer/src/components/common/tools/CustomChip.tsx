import { alpha, Box, SxProps, Typography, useTheme } from "@mui/material";
import { memo } from "react";
import { useTranslation } from "react-i18next";

interface CustomChipProps {
  title: string;
  color?: "primary" | "error" | "secondary1" | "secondary2" | "warn";
  customColor?: string;
  sx?: SxProps;
}

export default memo(function CustomChip({ title, color: propsColor = "primary", sx = {}, customColor }: CustomChipProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const color = customColor || theme.palette[propsColor].main;
  const bgcolor = customColor ? alpha(customColor, 0.02) : theme.palette[propsColor].hoverBg;

  return (
    <Box
      component={"span"}
      className="flex"
      sx={{ display: "inline-block", py: 0.25, width: "fit-content", px: 1.25, border: 1, borderRadius: 1, bgcolor, borderColor: color, ...sx }}
    >
      <Typography component={"span"} color={color} variant="subtitle2">
        {t(title)}
      </Typography>
    </Box>
  );
});
