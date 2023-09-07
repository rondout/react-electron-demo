import * as echarts from "echarts/core";
import {
  BarChart,
  // 系列类型的定义后缀都为 SeriesOption
  BarSeriesOption,
  LineChart,
  LineSeriesOption,
  PieChart,
  PieSeriesOption,
} from "echarts/charts";
import {
  TitleComponent,
  // 组件类型的定义后缀都为 ComponentOption
  TitleComponentOption,
  TooltipComponent,
  TooltipComponentOption,
  GridComponent,
  GridComponentOption,
  // 数据集组件
  // 内置数据转换器组件 (filter, sort)
  TransformComponent,
  DataZoomComponent,
  DataZoomComponentOption,
  LegendComponentOption,
  LegendComponent,
} from "echarts/components";
import { LabelLayout, UniversalTransition } from "echarts/features";
import { SVGRenderer } from "echarts/renderers";
import { useCallback, useEffect, useState } from "react";
import { LegendOption } from "echarts/types/dist/shared";
import useWindowSize from "./useWindowSize";

// 通过 ComposeOption 来组合出一个只有必须组件和图表的 Option 类型
export type ECOption = echarts.ComposeOption<
  | LineSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | BarSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | DataZoomComponentOption
  | LegendComponentOption
  | PieSeriesOption
  | LegendOption
>;

// 注册必须的组件
echarts.use([
  TitleComponent,
  LegendComponent,
  TooltipComponent,
  GridComponent,
  TransformComponent,
  BarChart,
  LineChart,
  PieChart,
  LabelLayout,
  UniversalTransition,
  SVGRenderer,
  DataZoomComponent,
]);

export default function useChart(props: { id: string; option?: ECOption }) {
  const [chart, setChart] = useState<echarts.ECharts>();

  // const windowWidth = useSelector(selectWidth);
  // const windowHeight = useSelector(selectHeight);
  // const collapsed = useSelector(selectCollapsed);

  const { innerHeight: windowHeight, innerWidth: windowWidth } = useWindowSize();

  const initChart = useCallback(
    (id = props.id) => {
      const domEl = document.getElementById(id);
      if (!domEl) {
        return;
      }
      const myChart = echarts.init(domEl);
      if (props.option) {
        myChart.setOption<ECOption>(props.option);
      }
      setChart(myChart);
    },
    [props]
  );

  useEffect(() => {
    chart?.resize && chart?.resize();
  }, [windowWidth, windowHeight, chart]);

  useEffect(() => {
    chart?.resize && chart?.resize();
  }, [chart]);

  useEffect(() => {
    initChart();
  }, [initChart]);

  const setOption = useCallback(
    (option: ECOption) => {
      if (!chart || !option) {
        return;
      }
      chart.setOption(option);
    },
    [chart]
  );

  const setId = useCallback(
    (id: string) => {
      initChart(id);
    },
    [initChart]
  );

  return { chart, setOption, setId };
}
