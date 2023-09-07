import { Box, IconButton, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import feedController from "../../../controllers/feed.controller";
import useDataFetch from "../../../hooks/useDataFetch";
import { FeedingMethodLabelMap, FeedRecordItem } from "../../../models/feeding.model";
import { MAX_SAFE_PAGE_SIZE, PageLink, PageLinkInterface, ResponseContent } from "../../../models/request.model";
import { timeFormat } from "../../../utils";
import PlainTable, { PlainTableColumns } from "../../common/table/PlainTable";
import DisplayInfoCard from "../../common/tools/DisplayInfoCard";
import Iconfont from "../../common/tools/Iconfont";

interface FeedingDataTableProps {
  sn: string;
  selectedDate: string;
  clearSelectedDate(): void;
}

export default function FeedingDataTable({ sn, selectedDate, clearSelectedDate }: FeedingDataTableProps) {
  const { t } = useTranslation();
  const { data, loading, setPagelinkParams, pageLink } = useDataFetch<ResponseContent<FeedRecordItem>, PageLinkInterface>({
    fetchFn: feedController.getFeedRecords,
    pageLink: new PageLink(0, MAX_SAFE_PAGE_SIZE, undefined, undefined, undefined, undefined, { sn: sn, startDate: selectedDate, endDate: selectedDate }),
  });

  useEffect(() => {
    if (selectedDate !== pageLink.startDate) {
      setPagelinkParams({ startDate: selectedDate, endDate: selectedDate });
    }
  }, [selectedDate, setPagelinkParams, pageLink.startDate]);

  const columns = useMemo<PlainTableColumns<FeedRecordItem>[]>(() => {
    return [
      new PlainTableColumns("feedTime", "device.time", (data) => timeFormat(data.feedTime)),
      new PlainTableColumns("feedType", "device.method", (data) => t(FeedingMethodLabelMap.get(data.feedType))),
      new PlainTableColumns("feedWeight", "device.feedAmount"),
    ];
  }, [t]);

  const renderHeaderChild = useCallback(() => {
    if (!selectedDate) {
      return null;
    }
    return (
      <Box className="flex relative-position">
        <Typography sx={{ mr: 4.5 }}>{selectedDate}</Typography>
        <IconButton sx={{ position: "absolute", right: 0 }} onClick={() => clearSelectedDate()}>
          <Iconfont mr={0} fontSize={16} pointer icon="ic_close1"></Iconfont>
        </IconButton>
      </Box>
    );
  }, [selectedDate, clearSelectedDate]);

  return (
    <DisplayInfoCard title="device.feedingData" headerChild={renderHeaderChild()}>
      <PlainTable loading={loading} columns={columns} rows={data?.result} sx={{ height: 300, mt: 1.5 }}></PlainTable>
    </DisplayInfoCard>
  );
}
