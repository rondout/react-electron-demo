import { Box, Chip, SxProps, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { BucketStatus, DeviceInfo } from "../../../models/device.model";
import { PigInfo, PigStatus } from "../../../models/pig.model";
import { isNull } from "../../../utils";
import Iconfont from "./Iconfont";

interface StatusCommonProps {
  sx?: SxProps;
}

interface DeviceStatusProps extends StatusCommonProps {
  device: DeviceInfo;
}

interface PigStatusProps extends StatusCommonProps {
  pig: PigInfo;
}
export function OnlineStatusComponent({ device, sx = {} }: DeviceStatusProps) {
  return (
    <Box className="flex-start" sx={sx}>
      <Iconfont icon={device.active ? "ic_online" : "ic_offline"}></Iconfont>
      <Typography>{device.active ? "在线" : "离线"}</Typography>
    </Box>
  );
}

export function DeviceStatusComponent({ device, sx = {} }: DeviceStatusProps) {
  const { t } = useTranslation();
  const {
    palette: { primary, error },
  } = useTheme();

  const label = device.enable ? t("common.enable") : t("common.disable");
  const bgcolor = device.enable ? primary.main : error.main;
  return (
    <Box className="flex-start flex-nowrap" sx={sx}>
      <Box sx={{ borderRadius: "50%", bgcolor, height: 8, width: 8, mr: 1 }}></Box>
      {/* <Iconfont icon={icon}></Iconfont> */}
      <Typography>{label}</Typography>
    </Box>
  );
}

export function PigFeedingStatusComponent({ pig, sx = {} }: PigStatusProps) {
  const {
    palette: { info, error },
  } = useTheme();
  const { t } = useTranslation();

  const label = pig.feedingStatus ? t("common.usual") : t("common.unusual");
  const bgcolor = pig.feedingStatus ? info.main : error.main;

  if (isNull(pig.feedingStatus)) {
    return <span>"-"</span>;
  }

  return (
    <Box className="flex-start flex-nowrap" sx={sx}>
      <Box sx={{ borderRadius: "50%", bgcolor, height: 8, width: 8, mr: 1 }}></Box>
      <Typography>{label}</Typography>
    </Box>
  );
}

export function BucketStatusComponent({ device, sx = {} }: DeviceStatusProps) {
  const {
    palette: { secondary1, error },
  } = useTheme();
  const { t } = useTranslation();
  const label = device.attributes.bucketState === BucketStatus.FULL ? "device.bucketStateLbels.FULL" : "device.bucketStateLbels.EMPTY";
  const bgcolor = device.attributes.bucketState === BucketStatus.FULL ? secondary1.main : error.main;
  if (isNull(device.attributes.bucketState)) {
    return <Typography sx={{ pl: 2 }}>-</Typography>;
  }
  return <Chip sx={{ px: 0.5, bgcolor, color: "#fff", ...sx }} label={t(label)} size="small"></Chip>;
}

export function PigStatusComponent({ pig, sx = {} }: PigStatusProps) {
  const {
    palette: { secondary1, action, secondary2 },
  } = useTheme();
  const { t } = useTranslation();

  const PigStatusColorMap = new Map<PigStatus, { bgcolor: string; label: string }>([
    [PigStatus.GESTATION, { bgcolor: secondary1.main, label: t("pig.statusLabel.GESTATION") }],
    [PigStatus.PARTURITION, { bgcolor: secondary2.main, label: t("pig.statusLabel.PARTURITION") }],
    [null, { bgcolor: action.disabled, label: t("pig.statusLabel.OUT_PEN") }],
  ]);

  const { bgcolor, label } = PigStatusColorMap.get(pig.pigState);
  if (!pig.inPen) {
    return <Chip sx={{ px: 0.5, bgcolor: action.disabled, color: "#fff", ...sx }} label={t("pig.statusLabel.OUT_PEN")} size="small"></Chip>;
  }
  return <Chip sx={{ px: 0.5, bgcolor, color: "#fff", ...sx }} label={label} size="small"></Chip>;
}
