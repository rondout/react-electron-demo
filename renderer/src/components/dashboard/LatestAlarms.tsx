import { Box, Typography } from "@mui/material";
import { UIEvent, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import alarmController from "../../controllers/alarm.controller";
import useDataFetch from "../../hooks/useDataFetch";
import { AlarmItemType } from "../../models/alarm.model";
import { PageLink } from "../../models/request.model";
import AlarmItem from "../alarm/AlarmItem";
import EmptyData from "../common/table/EmptyData";
import TableLoading from "../common/table/TableLoading";
import DisplayInfoCard from "../common/tools/DisplayInfoCard";

export default function LatestAlarms() {
  const { t } = useTranslation();
  const { data, loading, setPagelinkParams } = useDataFetch({ fetchFn: alarmController.getAlarms, pageLink: new PageLink(0, 40) });
  const [alarms, setAlarms] = useState<AlarmItemType[]>([]);
  useEffect(() => {
    data?.result && setAlarms((prev) => [...prev, ...data.result]);
  }, [data]);

  const onScroll = useCallback(
    (ev: UIEvent<Element>) => {
      const { clientHeight, scrollTop, scrollHeight } = ev.currentTarget;
      if (clientHeight + scrollTop >= scrollHeight) {
        if (alarms.length < data?.total) {
          setPagelinkParams((prev) => ({ pageOffset: prev.pageOffset + 1 }));
        }
      }
    },
    [setPagelinkParams, data, alarms.length]
  );

  return (
    <DisplayInfoCard sx={{ mt: 3, position: "relative" }} contentSx={{ mt: 1 }} title="common.alarms">
      <Box onScroll={onScroll} sx={{ height: 280, overflow: "auto" }}>
        <TableLoading loading={loading} />
        {alarms.map((alarm) => (
          <AlarmItem key={alarm.id} alarm={alarm} />
        ))}
        {!loading && alarms.length === 0 && <EmptyData />}
        {!loading && alarms.length >= data?.total && (
          <Typography sx={{ p: 2 }} textAlign="center">
            {t("common.scrollFetchFinished")}
          </Typography>
        )}
      </Box>
    </DisplayInfoCard>
  );
}
