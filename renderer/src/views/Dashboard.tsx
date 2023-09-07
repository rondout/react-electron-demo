import { Box, Grid } from "@mui/material";
import DisplayInfoCard from "../components/common/tools/DisplayInfoCard";
import DeviceStatistics from "../components/dashboard/DeviceStatistics";
import LatestAlarms from "../components/dashboard/LatestAlarms";
import LatestFeedChart from "../components/dashboard/LatestFeedChart";
import PigStatusChart from "../components/dashboard/PigStatusChart";

export default function Dashboard() {
  return (
    <Box sx={{ height: 1, p: 2, overflow: "auto" }} className="border-box">
      <Box sx={{ bgcolor: "#fff", py: 3, px: 5 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{}}>
              {/* 设备数量统计 */}
              <DeviceStatistics></DeviceStatistics>
              {/* 最近投料统计 */}
              {/* <DisplayInfoCard headerSx={{ p: 1 }} sx={{ mt: 3 }} title="device.latestFeedWeightStatistics">
                <Box sx={{ height: 288, p: 1 }}> */}
              <LatestFeedChart></LatestFeedChart>
              {/* </Box>
              </DisplayInfoCard> */}
            </Box>
          </Grid>
          {/* 猪只状态统计 */}
          <Grid item xs={12} md={4}>
            <Box sx={{ height: 1, minHeight: 460 }}>
              <DisplayInfoCard headerSx={{ p: 1 }} contentSx={{ height: "calc(100% - 37px)" }} title="device.pigState" sx={{ boxSizing: "border-box", height: 1 }}>
                <Box sx={{ p: 1, height: 1 }} className="border-box">
                  <PigStatusChart></PigStatusChart>
                </Box>
              </DisplayInfoCard>
            </Box>
          </Grid>
        </Grid>
        <LatestAlarms />
      </Box>
    </Box>
  );
}
