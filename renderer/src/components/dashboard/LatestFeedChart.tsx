import { Box, lighten, PaletteColor, useTheme } from "@mui/material";
import { LineSeriesOption } from "echarts";
import moment from "moment";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import feedController, { GetDailyFeedDataParams } from "../../controllers/feed.controller";
import useChart, { ECOption } from "../../hooks/useChart";
import { DailyFeedData } from "../../models/feeding.model";
import { handleResponseError } from "../../models/request.model";
import { $message } from "../../utils";
import EmptyData from "../common/table/EmptyData";
import TableLoading from "../common/table/TableLoading";
import DateRangePicker, { DateRangePickerParams } from "../common/tools/DateRangePicker";
import DisplayInfoCard from "../common/tools/DisplayInfoCard";

function genarateAreaStyle(color: PaletteColor): LineSeriesOption["areaStyle"] {
  return {
    color: {
      type: "linear",
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        {
          offset: 0,
          color: lighten(color.main, 0.5), // 0% 处的颜色
        },
        {
          offset: 1,
          color: "#fff", // 100% 处的颜色
        },
      ],
      global: false, // 缺省为 false
    },
  };
}

const chartId = "latest-feed-amount-statistics";

export default function LatestFeedAmountStatistics() {
  const { setOption } = useChart({ id: chartId });
  const { t } = useTranslation();
  const { palette } = useTheme();
  const [data, setData] = useState<DailyFeedData[]>([]);
  const [loading, setLoading] = useState(true);
  // 默认显示最近十天的
  const [params, setParams] = useState<GetDailyFeedDataParams>({ startDate: moment().subtract(9, "days").format("YYYY-MM-DD"), endDate: moment().format("YYYY-MM-DD") });

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

  const getDailyFeedData = useCallback(() => {
    setLoading(true);
    feedController
      .getFeedRecordByDay(params)
      .then((res) => {
        setData(res || []);
        // setData([...res, { day: "2023-04-06", totalFeedWeight: 3200 }, { day: "2023-04-09", totalFeedWeight: 300 }] || []);
      })
      .catch(handleResponseError)
      .finally(() => {
        setLoading(false);
      });
  }, [params]);

  useEffect(() => {
    getDailyFeedData();
  }, [getDailyFeedData]);

  const amountKeyColorMap = useMemo(() => {
    return new Map<string, PaletteColor>([
      ["target", palette.secondary2],
      ["actual", palette.primary],
    ]);
  }, [palette]);

  const chartOption: ECOption = useMemo(() => {
    return {
      tooltip: {
        trigger: "axis",
      },
      legend: {
        data: ["target", "actual"].map((key) => {
          return { name: t("feed.dashboardLabel." + key), itemStyle: { color: amountKeyColorMap.get(key).main } };
        }),
        icon: "circle",
      },
      grid: {
        left: 65,
        right: 40,
        bottom: 20,
        // containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: data.map((v) => v.day),
        axisLabel: {
          formatter(value: string) {
            return moment(value).format("MM/DD");
          },
        },
        name: t("feed.date"),
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { type: "dashed" } },
        name: "(kg)",
        nameTextStyle: {
          padding: [0, 24, 0, 0],
        },
      },
      animationDuration: 500,
      series: [
        {
          smooth: true,
          name: t("feed.dashboardLabel.actual"),
          type: "line" as "line",
          barWidth: 10,
          data: data.map((v) => (v.totalFeedWeight / 1000).toFixed(3)),
          lineStyle: { color: palette.primary.main },
          areaStyle: genarateAreaStyle(palette.primary),
          showSymbol: false,
        },
      ],
    };
  }, [amountKeyColorMap, t, data, palette]);

  useEffect(() => {
    setOption(chartOption);
  }, [chartOption, setOption]);

  const hasNoData = data?.length <= 0;

  return (
    <DisplayInfoCard
      headerSx={{ p: 1 }}
      sx={{ mt: 3 }}
      headerChild={<DateRangePicker onDateChange={onDateChange} startDate={params.startDate} endDate={params.endDate}></DateRangePicker>}
      title="device.latestFeedWeightStatistics"
    >
      <Box sx={{ height: 288, p: 1 }}>
        <Box sx={{ height: 1, overflow: "hidden" }} className="relative-position">
          <TableLoading loading={loading} sx={{ minHeight: 320 }} />
          <Box style={{ opacity: hasNoData ? 0 : 1 }} id={chartId} sx={{ height: 1 }}></Box>
          {!loading && hasNoData && <EmptyData sx={{ position: "absolute", top: 0, width: 1 }} />}
        </Box>
      </Box>
    </DisplayInfoCard>
  );
}
