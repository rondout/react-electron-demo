import { Box, Grid, Typography, useTheme } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import deviceController from "../../controllers/device.controller";
import { DeviceInfo } from "../../models/device.model";
import { ByGroupPageLink, handleResponseError, ResponseContent } from "../../models/request.model";
import { isNull } from "../../utils";
import TableLoading from "../common/table/TableLoading";
import Iconfont from "../common/tools/Iconfont";

export enum DeviceStatus {
  ALL,
  ONLINE,
  OFFLINE,
}

export default function DeviceStatistics() {
  const { t } = useTranslation();
  const { palette } = useTheme();
  const [loading, setLoading] = useState(true);
  const [deviceNums, setDeviceNums] = useState({ all: null, online: null, offline: null });

  useEffect(() => {
    const promises: Promise<ResponseContent<DeviceInfo>>[] = [];
    const getAllDeviceCount = deviceController.getDeviceByGroupId(new ByGroupPageLink(0, 1, null));
    const getOnlineDeviceCount = deviceController.getDeviceByGroupId(new ByGroupPageLink(0, 1, null, null, null, null, true));
    const getOfflineDeviceCount = deviceController.getDeviceByGroupId(new ByGroupPageLink(0, 1, null, null, null, null, false));
    promises.push(getAllDeviceCount, getOnlineDeviceCount, getOfflineDeviceCount);
    Promise.all(promises)
      .then((res) => {
        const [{ total: all }, { total: online }, { total: offline }] = res;
        setDeviceNums((prev) => ({ all, online, offline }));
      })
      .catch((err) => handleResponseError(err))
      .finally(() => setLoading(false));
  }, []);

  const deviceStatistics = useMemo(
    () => [
      { status: DeviceStatus.ALL, count: deviceNums.all, icon: "ic_device", label: "device.statusLabel.ALL" },
      { status: DeviceStatus.ONLINE, count: deviceNums.online, icon: "ic_online1", label: "device.statusLabel.ONLINE" },
      { status: DeviceStatus.OFFLINE, count: deviceNums.offline, icon: "ic_offline1", label: "device.statusLabel.OFFLINE" },
    ],
    [deviceNums]
  );

  return (
    <Grid container spacing={3}>
      {deviceStatistics.map((item) => (
        <Grid item xs={4} key={item.status}>
          <Box
            sx={{ py: 2, pl: { xs: 1, sm: 2, md: 3, lg: 5 }, pr: 2, border: 1, borderRadius: 1, borderColor: palette.other.divider }}
            className="flex-start flex-nowrap relative-position"
          >
            <TableLoading loading={loading} sx={{ minHeight: "unset" }} />
            <Iconfont icon={item.icon} fontSize={40} mr={3}></Iconfont>
            <Box>
              <Typography className="line-clamp" color="text.secondary">
                {t(item.label)}
              </Typography>
              <Typography variant="h6">{isNull(item.count) ? "-" : item.count}</Typography>
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}
