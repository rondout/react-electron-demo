import { Box, useTheme } from "@mui/material";
import moment from "moment";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import feedController, { GetDailyFeedDataParams } from "../../../controllers/feed.controller";
import useChart, { ECOption } from "../../../hooks/useChart";
import { DailyFeedData } from "../../../models/feeding.model";
import { handleResponseError } from "../../../models/request.model";
import DisplayInfoCard from "../../common/tools/DisplayInfoCard";
import { $message } from "../../../utils/index";
import EmptyData from "../../common/table/EmptyData";
import TableLoading from "../../common/table/TableLoading";
import DateRangePicker, { DateRangePickerParams } from "../../common/tools/DateRangePicker";

const chartId = "feeding-chart-id";

export interface FeedingChartProps {
  sn: string;
  handleDateSelect(date: string): void;
}

export default function FeedingChart({ sn, handleDateSelect }: FeedingChartProps) {
  const { t } = useTranslation();
  const { chart } = useChart({ id: chartId, option: {} });
  const { palette } = useTheme();
  const [data, setData] = useState<DailyFeedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState<GetDailyFeedDataParams>({ startDate: moment().subtract(6, "days").format("YYYY-MM-DD"), endDate: moment().format("YYYY-MM-DD"), sn });

  const getDailyFeedData = useCallback(() => {
    setLoading(true);
    feedController
      .getFeedRecordByDay(params)
      .then((res) => {
        setData(res || []);
      })
      .catch(handleResponseError)
      .finally(() => {
        setLoading(false);
      });
  }, [params]);

  useEffect(() => {
    getDailyFeedData();
  }, [getDailyFeedData]);

  const chartOption: ECOption = useMemo(() => {
    return {
      xAxis: {
        type: "category",
        data: data.map((v) => ({ value: v.day })),
        name: t("feed.date"),
        axisLabel: {
          formatter(value: string) {
            return moment(value).format("MM/DD");
          },
        },
      },
      legend: {},
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { type: "dashed" } },
        name: "(g)",
        nameLocation: "end",
        nameTextStyle: {
          // marginLeft: 120,
          align: "right",
          padding: [0, 8, 0, 0],
        },
      },
      tooltip: {
        trigger: "axis",
      },
      grid: {
        left: 60,
        bottom: 30,
        // right: 50,
      },
      series: [
        {
          name: t("feed.dailyFeedWeight"),
          data: data.map((v) => v.totalFeedWeight),
          type: "bar",
          barWidth: 24,
          color: palette.primary.outlined,
        },
      ],
    };
  }, [palette, data, t]);

  useEffect(() => {
    if (!chart) return;
    chart && chart.setOption(chartOption);
  }, [chart, chartOption]);

  useEffect(() => {
    if (!chart) return;
    chart.on("click", function (data) {
      handleDateSelect(data.name);
    });
  }, [chart, handleDateSelect]);

  const onDateChange = useCallback(
    (dateRangeParams: DateRangePickerParams) => {
      const newParams = { ...params, ...dateRangeParams };
      if (moment(newParams.startDate) > moment(newParams.endDate)) {
        $message.error("device.startTimeBiggerError");
        return;
      }
      setParams(newParams);
    },
    [params]
  );

  const showChart = !loading && data?.length > 0;

  return (
    <DisplayInfoCard
      title="device.feedingChart"
      headerChild={<DateRangePicker onDateChange={onDateChange} startDate={params.startDate} endDate={params.endDate}></DateRangePicker>}
    >
      <Box sx={{ height: 300 }} className="relative-position">
        <TableLoading loading={loading}></TableLoading>
        <Box sx={{ height: 300, opacity: showChart ? 1 : 0 }} id={chartId}></Box>
        {!showChart && !loading && <EmptyData sx={{ position: "absolute", top: 0, width: 1 }}></EmptyData>}
      </Box>
    </DisplayInfoCard>
  );
}
