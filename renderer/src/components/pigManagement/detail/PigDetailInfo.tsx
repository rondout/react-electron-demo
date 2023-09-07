import { Box, Grid, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import deviceController from "../../../controllers/device.controller";
import feedController from "../../../controllers/feed.controller";
import useDataFetch from "../../../hooks/useDataFetch";
import { DeviceInfo } from "../../../models/device.model";
import { FeedCurveType, FeedingMethodLabelMap, FeedPlanType, FeedRecordItem } from "../../../models/feeding.model";
import { PigInfo } from "../../../models/pig.model";
import { handleResponseError, MAX_SAFE_PAGE_SIZE, PageLink, PageLinkInterface, ResponseContent } from "../../../models/request.model";
import { dateFormat, timeFormat } from "../../../utils";
import EmptyData from "../../common/table/EmptyData";
import PlainTable, { PlainTableColumns } from "../../common/table/PlainTable";
import TableLoading from "../../common/table/TableLoading";
import CustomLink from "../../common/tools/CustomLink";
import DisplayInfoCard from "../../common/tools/DisplayInfoCard";
import { PigStatusComponent } from "../../common/tools/StatusDot";
import PigFeedingChart from "./PigFeedingChart";

const breakPoints = {
  sm: 4,
  md: 3,
};

const infoKeys: (string | { key: string; customRender(p: PigInfo): string })[] = [
  "pigNumber",
  // "name",
  "inPenTime",
  "devicePen",
  "pigState",
  "curveName",
  "planName",
  "strategyLevel",
  "outPenTime",
];

export default function PigDetailInfo(props: { detail: PigInfo }) {
  const { t } = useTranslation();
  const { detail } = props;
  const [additionalInfo, setAdditionalInfo] = useState<{ curveInfo: FeedCurveType; planInfo: FeedPlanType; deviceInfo: DeviceInfo }>({
    curveInfo: null,
    planInfo: null,
    deviceInfo: null,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { data: feedRecordData, loading: getFeedRecordLoading } = useDataFetch<ResponseContent<FeedRecordItem>, PageLinkInterface>({
    fetchFn: feedController.getFeedRecords,
    pageLink: new PageLink(0, MAX_SAFE_PAGE_SIZE, undefined, undefined, undefined, undefined, { pigNumber: detail.pigNumber }),
  });

  const handleNavigate = useCallback(
    (key: string) => {
      if (key === "curveName") {
        additionalInfo.curveInfo?.id && navigate("/feed-management/feed-curve/" + additionalInfo.curveInfo?.id);
      } else if (key === "planName") {
        additionalInfo.planInfo?.id && navigate("/feed-management/feed-plan/" + additionalInfo.planInfo?.id);
      } else if (key === "devicePen") {
        additionalInfo.deviceInfo?.id && navigate("/device-management/" + additionalInfo.deviceInfo?.id);
      }
    },
    [navigate, additionalInfo]
  );

  const getCurveNameAndPlanName = useCallback(() => {
    setLoading(true);
    const promises = [];
    if (detail.curveId) {
      const getCurveDetail = feedController.getCurveDetail(detail.curveId);
      getCurveDetail.then((res) => setAdditionalInfo((prev) => ({ ...prev, curveInfo: res }))).catch(handleResponseError);
      promises.push(getCurveDetail);
    }
    if (detail.planId) {
      const getPlanDetail = feedController.getPlanDetail(detail.planId);
      getPlanDetail.then((res) => setAdditionalInfo((prev) => ({ ...prev, planInfo: res }))).catch(handleResponseError);
      promises.push(getPlanDetail);
    }
    if (detail.deviceId) {
      const getDeviceDetail = deviceController.getDeviceDetail(detail.deviceId);
      getDeviceDetail.then((res) => setAdditionalInfo((prev) => ({ ...prev, deviceInfo: res }))).catch(handleResponseError);
      promises.push(getDeviceDetail);
    }
    Promise.all(promises).finally(() => setLoading(false));
  }, [detail]);

  useEffect(() => {
    getCurveNameAndPlanName();
  }, [getCurveNameAndPlanName]);

  const feedDataColumns = useMemo(() => {
    return [
      new PlainTableColumns("feedTime", "device.time", (data) => timeFormat(data.feedTime)),
      new PlainTableColumns("feedType", "device.method", (data) => t(FeedingMethodLabelMap.get(data.feedType))),
      new PlainTableColumns("feedWeight", "device.feedAmount"),
    ];
  }, [t]);

  const { inPen } = detail;

  return (
    <Box sx={{ p: 3 }}>
      <DisplayInfoCard title="pig.basicInfo">
        <Box sx={{ p: 3, pb: 1 }} className="relative-position">
          <TableLoading sx={{ minHeight: "unset" }} loading={loading}></TableLoading>
          <Grid container spacing={3}>
            {infoKeys.map((key) => {
              const keyStr = typeof key === "string" ? key : key.key;
              return (
                <Grid key={keyStr} item {...breakPoints}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {t("pig." + key)}
                  </Typography>
                  {(() => {
                    if (key === "pigState") {
                      return <PigStatusComponent pig={detail} />;
                    } else if (key === "pigNumber") {
                      return <Typography>{detail.pigNumber}</Typography>;
                    } else if (key === "outPenTime") {
                      if (inPen) {
                        return "-";
                      }
                      return <Typography>{dateFormat(detail.outPenTime) || "-"}</Typography>;
                    } else if (key === "strategyLevel") {
                      return <Typography>{(detail?.strategyLevel && (detail?.strategyLevel * 100).toFixed() + "%") || "-"}</Typography>;
                    } else if ("curveName" === keyStr) {
                      return <CustomLink onClick={() => handleNavigate(keyStr)}>{additionalInfo.curveInfo?.curveName || "-"}</CustomLink>;
                    } else if ("planName" === keyStr) {
                      return <CustomLink onClick={() => handleNavigate(keyStr)}>{additionalInfo.planInfo?.planName || "-"}</CustomLink>;
                    } else if (!inPen) {
                      return "-";
                    } else if (key === "devicePen") {
                      const deviceSn = additionalInfo?.deviceInfo?.sn || "";
                      const devicePen = additionalInfo?.deviceInfo?.attributes?.devicePen || "";
                      return <CustomLink onClick={() => handleNavigate(keyStr)}>{devicePen ? `${devicePen} (${deviceSn})` : "-"}</CustomLink>;
                    } else if (key === "inPenTime") {
                      return <Typography>{dateFormat(detail.inPenTime) || "-"}</Typography>;
                    }

                    // @ts-ignore
                    return <Typography>{detail[keyStr] || "-"}</Typography>;
                  })()}
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </DisplayInfoCard>
      <DisplayInfoCard sx={{ mt: 3 }} title="pig.feedChart">
        {detail.curveId && <PigFeedingChart pigNumber={detail?.pigNumber} curveStartDate={detail?.curveStartDate} curveDataItems={additionalInfo?.curveInfo?.curveData} />}
        {!detail?.curveId && <EmptyData />}
      </DisplayInfoCard>
      <Box sx={{ mt: 3 }}>
        <Grid sx={{}} container spacing={3}>
          <Grid item xs={12} md={12}>
            <DisplayInfoCard title="pig.feedData">
              <PlainTable loading={getFeedRecordLoading} rows={feedRecordData?.result} columns={feedDataColumns} sx={{ height: 284, mt: 2 }}></PlainTable>
            </DisplayInfoCard>
          </Grid>
          {/* <Grid item xs={12} md={6}>
            <DisplayInfoCard title="pig.eatingStatus"></DisplayInfoCard>
          </Grid> */}
        </Grid>
      </Box>
    </Box>
  );
}
