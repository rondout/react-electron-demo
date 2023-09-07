import { Box, Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import feedController from "../../../controllers/feed.controller";
import { DeviceInfo } from "../../../models/device.model";
import { handleResponseError } from "../../../models/request.model";
import TableLoading from "../../common/table/TableLoading";
import DisplayInfoCard from "../../common/tools/DisplayInfoCard";
import { BucketStatusComponent, DeviceStatusComponent, OnlineStatusComponent } from "../../common/tools/StatusDot";

const breakPoints = {
  sm: 4,
  md: 3,
};

export default function DeviceBasicInfo({ device }: { device: DeviceInfo }) {
  const { t } = useTranslation();
  const { feedForageId } = device;
  const [loading, setLoading] = useState(false);
  const [forageName, setForageName] = useState<string>();

  useEffect(() => {
    if (!feedForageId) {
      return;
    }
    setLoading(true);
    feedController
      .getForageDetail(feedForageId)
      .then((res) => {
        setForageName(res.forageName);
      })
      .catch(handleResponseError)
      .finally(() => setLoading(false));
  }, [feedForageId]);

  return (
    <DisplayInfoCard title="device.basicInfo">
      <Box sx={{ p: 3 }} className="relative-position">
        <TableLoading loading={loading} />
        <Grid container spacing={3}>
          <Grid item {...breakPoints}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t("device.sn")}
            </Typography>
            <Typography>{device?.sn}</Typography>
          </Grid>
          <Grid item {...breakPoints}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t("device.active")}
            </Typography>
            <OnlineStatusComponent device={device}></OnlineStatusComponent>
          </Grid>
          <Grid item {...breakPoints}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t("device.devicePen")}
            </Typography>
            <Typography>{device?.attributes?.devicePen || "-"}</Typography>
          </Grid>
          <Grid item {...breakPoints}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t("device.status")}
            </Typography>
            <DeviceStatusComponent device={device}></DeviceStatusComponent>
          </Grid>
          <Grid item {...breakPoints}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t("device.forageName")}
            </Typography>
            <Typography>{forageName || "-"}</Typography>
          </Grid>
          <Grid item {...breakPoints}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t("device.bucketState")}
            </Typography>
            <BucketStatusComponent device={device}></BucketStatusComponent>
          </Grid>
          <Grid item {...breakPoints}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t("device.tankWeight")}
            </Typography>
            <Typography>{device?.attributes?.troughWeight}</Typography>
          </Grid>
          <Grid item {...breakPoints}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t("device.ipAddr")}
            </Typography>
            <Typography>{device?.attributes?.ipAddress || "-"}</Typography>
          </Grid>
        </Grid>
      </Box>
    </DisplayInfoCard>
  );
}
