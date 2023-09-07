import { Box, SxProps, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

type EmptydataType = "device" | "template" | "application" | "file" | "geofence";

interface EmptyDataProps {
  emptyTitle?: string;
  type?: EmptydataType;
  height?: number;
  pt?: number;
  sx?: SxProps;
}

export default function EmptyData(props: EmptyDataProps) {
  const { height, emptyTitle = "common.noDataFound", pt = 10, sx = {} } = props;

  const { t } = useTranslation();
  return (
    <Box sx={{ height, flexDirection: "column", justifyContent: "flex-start", pt, ...sx }} className="flex border-box">
      <Typography sx={{ mt: 6, mb: 6 }} variant="subtitle1">
        {t(emptyTitle)}
      </Typography>
    </Box>
  );
}
