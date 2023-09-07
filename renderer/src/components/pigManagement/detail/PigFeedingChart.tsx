import { Box, debounce, lighten, PaletteColor, useTheme } from "@mui/material";
import { LineSeriesOption } from "echarts";
import moment from "moment";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import feedController from "../../../controllers/feed.controller";
import useChart, { ECOption } from "../../../hooks/useChart";
import { DailyFeedData, FeedCurveItem, FeedCurveItemKey } from "../../../models/feeding.model";
import { dateFormat } from "../../../utils";

const chartId = "pig-detail-chart-id";

interface PigFeedingChartProps {
  curveDataItems: FeedCurveItem[];
  curveStartDate: string;
  pigNumber: string;
}

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

const curveItemKeys: FeedCurveItemKey[] = ["min", "warn", "target", "max"];

export default function PigFeedingChart(props: PigFeedingChartProps) {
  const { curveDataItems = [], curveStartDate, pigNumber } = props;
  const { setOption } = useChart({ id: chartId });
  const { t } = useTranslation();
  const {
    palette: { primary, secondary1, warning, error },
  } = useTheme();
  const [actualFeedData, setActualFeedData] = useState<DailyFeedData[]>([]);

  const getActualFeedData = useCallback(() => {
    if (!curveDataItems?.length) {
      return;
    }
    const startDate = curveStartDate;
    // const startDate = moment(curveStartDate).add(curveDataItems?.length, "days").format("YYYY-MM-DD");
    const endDate = moment(curveStartDate).add(curveDataItems?.length, "days").format("YYYY-MM-DD");
    feedController.getFeedRecordByDay({ startDate, endDate, pigNumber }).then((res) => {
      setActualFeedData(res);
    });
  }, [curveDataItems, curveStartDate, pigNumber]);

  useEffect(() => {
    getActualFeedData();
  }, [getActualFeedData]);

  const curveKeyColorMap = useMemo(
    () =>
      new Map<FeedCurveItemKey, PaletteColor>([
        ["min", error],
        ["warn", warning],
        ["target", secondary1],
        ["max", primary],
      ]),
    [error, warning, secondary1, primary]
  );

  const chartOption: ECOption = useMemo(() => {
    const curveData: { [key in FeedCurveItemKey]?: number[] } = {
      min: [],
      warn: [],
      target: [],
      max: [],
    };
    const xAxisData = [];
    curveDataItems.forEach(({ min, warn, target, max, day }) => {
      curveData.min.push(min);
      curveData.warn.push(warn);
      curveData.target.push(target);
      curveData.max.push(max);
      xAxisData.push(dateFormat(moment(curveStartDate).add(day - 1, "days")));
    });
    const createSeriesData = (color: PaletteColor, key: FeedCurveItemKey, index: number) => {
      return {
        smooth: true,
        name: t("feed." + key),
        type: "line" as "line",
        //   stack: "Total",
        data: curveData[key],
        lineStyle: { color: color.main },
        areaStyle: genarateAreaStyle(color),
        showSymbol: false,
        z: -index,
      };
    };
    const barSeriesData = {
      barWidth: 24,
      type: "bar" as "bar",
      data: xAxisData.map((item) => actualFeedData.find((v) => moment(v.day).valueOf() === moment(item).valueOf())?.totalFeedWeight || null),
      color: lighten(primary.main, 0.5),
      name: t("feed.actualFeed"),
    };
    return {
      tooltip: {
        trigger: "axis",
      },
      legend: {
        data: [
          { name: t("feed.actualFeed"), icon: "roundRect" },
          ...curveItemKeys.map((key) => {
            return { name: t("feed." + key), itemStyle: { color: curveKeyColorMap.get(key).main } };
          }),
        ],
        icon: "circle",
      },
      grid: {
        left: "20",
        right: "50",
        bottom: "2%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: xAxisData,
        name: t("feed.date"),
        axisLabel: {
          formatter(value: string) {
            return moment(value).format("MM/DD");
          },
        },
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { type: "dashed" } },
        name: "(g)",
        nameTextStyle: {
          padding: [0, 24, 0, 0],
        },
      },
      animationDuration: 500,
      series: [...curveItemKeys.map((key, index) => createSeriesData(curveKeyColorMap.get(key), key, index)).reverse(), barSeriesData],
    };
  }, [curveDataItems, t, curveKeyColorMap, curveStartDate, actualFeedData, primary.main]);

  const setChartOption = useMemo(() => {
    return debounce((option: ECOption) => {
      setOption(option);
    });
  }, [setOption]);

  useEffect(() => {
    setChartOption(chartOption);
  }, [chartOption, setChartOption]);

  return <Box id={chartId} sx={{ height: 320 }}></Box>;
}
