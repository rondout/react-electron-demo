import { Box, Tooltip, Typography } from "@mui/material";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { alarmCodeToLabelMap, AlarmItemType, AlarmLevelIconMap } from "../../models/alarm.model";
import { timeFormat } from "../../utils";
import CustomLink from "../common/tools/CustomLink";
import Iconfont from "../common/tools/Iconfont";

export default function AlarmItem({ alarm }: { alarm: AlarmItemType }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const viewDeviceDetail = useCallback(() => {
    const deviceId = alarm.deviceId;
    deviceId && navigate("/device-management/" + deviceId);
  }, [navigate, alarm]);

  const devicePenLabel = useMemo(() => {
    const penName = alarm.additionalInfo?.associatedDevice?.attributes?.devicePen || "";
    const deviceSn = alarm.additionalInfo?.associatedDevice?.sn || "";

    return `${penName}(${deviceSn})`;
  }, [alarm]);

  return (
    <Box sx={{ py: 2, mx: 1, overflow: "hidden", borderBottom: 1, borderColor: (theme) => theme.palette.other.divider }} className="flex-start flex-nowrap items-start">
      <Tooltip placement="top" title={t("alarm.alarmLevel." + alarm.level)}>
        <Box component={"span"}>
          <Iconfont style={{ minWidth: 24 }} icon={AlarmLevelIconMap.get(alarm.level) || "ic_alert_red"} mr={2}></Iconfont>
        </Box>
      </Tooltip>
      <Box sx={{ flex: 1, pr: 2, overflow: "hidden" }} className="flex-start flex-column items-start">
        <Typography sx={{ mb: 1, width: 1 }} className="line-clamp">
          <Typography component={"span"} variant="subtitle2">
            {t("alarm.alarmType") + ": "}
          </Typography>
          {t(alarmCodeToLabelMap.get(alarm.code) || alarm.msg)}
        </Typography>
        <Typography component={"div"} sx={{ mb: 1, width: 1 }} className="line-clamp flex-start">
          <Typography component={"span"} variant="subtitle2">
            {t("device.devicePen") + ": "}
          </Typography>
          <CustomLink onClick={viewDeviceDetail}>{devicePenLabel}</CustomLink>
        </Typography>
        <Typography variant="subtitle2">{timeFormat(alarm.time)}</Typography>
      </Box>
    </Box>
  );
}
