import { Box, Grid } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import deviceController from "../../../controllers/device.controller";
import { DeviceInfo } from "../../../models/device.model";
import { handleResponseError } from "../../../models/request.model";
import EmptyData from "../../common/table/EmptyData";
import CommonLoading from "../../common/tools/CommonLoading";
import DeviceBasicInfo from "./DeviceBasicInfo";
import FeedingChart from "./FeedingChart";
import FeedingDataTable from "./FeedingDataTable";

export default function DeviceDetails() {
  const { id } = useParams<{ id: string }>();
  const [deviceDetail, setDevcieDetail] = useState<DeviceInfo>();
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>();

  const getDeviceDetail = useCallback(() => {
    setLoading(true);
    deviceController
      .getDeviceDetail(id)
      .then((res) => {
        setDevcieDetail(res);
        setLoading(false);
      })
      .catch((err) => {
        handleResponseError(err);
        setLoading(false);
      });
  }, [id]);

  const handleDateSelect = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  useEffect(() => {
    getDeviceDetail();
  }, [getDeviceDetail]);

  if (loading) {
    return <CommonLoading />;
  }
  if (!deviceDetail) {
    return <EmptyData />;
  }
  return (
    <Box sx={{ bgcolor: "#fff", overflow: "auto", height: 1, p: 5 }} className="border-box">
      <Box sx={{ height: 1 }} className="border-box">
        <DeviceBasicInfo device={deviceDetail}></DeviceBasicInfo>
        <Box sx={{ mt: 3 }}>
          <Grid container spacing={3} sx={{ pb: 5 }}>
            <Grid item xs={12} md={6}>
              <FeedingChart handleDateSelect={handleDateSelect} sn={deviceDetail?.sn}></FeedingChart>
            </Grid>
            <Grid item xs={12} md={6}>
              <FeedingDataTable selectedDate={selectedDate} clearSelectedDate={() => setSelectedDate(null)} sn={deviceDetail?.sn}></FeedingDataTable>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
