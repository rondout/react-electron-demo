import { Box, useTheme } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import pigController from "../../controllers/pig.controller";
import useChart, { ECOption } from "../../hooks/useChart";
import { PigStatus } from "../../models/pig.model";
import { handleResponseError, PageLink } from "../../models/request.model";
import TableLoading from "../common/table/TableLoading";

const chartId = "pig-status-chart-idF";

export default function PigStatusChart() {
  const { setOption } = useChart({ id: chartId });
  const { palette } = useTheme();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [pigData, setPigData] = useState({
    TOTAL: 0,
    GESTATION: 0,
    PARTURITION: 0,
    OUT_PEN: 0,
  });

  const getPigStatistics = useCallback(() => {
    setLoading(true);
    const getAllPigs = pigController.getPigsByGroupId(new PageLink(0, 1));
    const getGestationPigs = pigController.getPigsByGroupId(new PageLink(0, 1, undefined, undefined, undefined, undefined, { inPen: true, pigState: PigStatus.GESTATION }));
    const getParturitionPigs = pigController.getPigsByGroupId(new PageLink(0, 1, undefined, undefined, undefined, undefined, { inPen: true, pigState: PigStatus.PARTURITION }));
    const getOutPenPigs = pigController.getPigsByGroupId(new PageLink(0, 1, undefined, undefined, undefined, undefined, { inPen: false }));
    Promise.all([getAllPigs, getGestationPigs, getParturitionPigs, getOutPenPigs])
      .then((res) => {
        const [{ total: TOTAL }, { total: GESTATION }, { total: PARTURITION }, { total: OUT_PEN }] = res;
        setPigData({ TOTAL, GESTATION, PARTURITION, OUT_PEN });
      })
      .catch((err) => {
        handleResponseError(err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getPigStatistics();
  }, [getPigStatistics]);

  const chartOption = useMemo<ECOption>(() => {
    return {
      tooltip: { trigger: "item" },
      legend: {
        bottom: "32px",
        itemWidth: 16,
        itemHeight: 16,
        formatter(name) {
          return t("pig.statusLabel." + name) + "  " + pigData[name] + "  ";
        },
      },
      series: [
        {
          center: ["50%", "38%"],
          type: "pie" as "pie",
          radius: ["45%", "60%"],
          avoidLabelOverlap: false,
          label: {
            show: true,
            fontSize: 40,
            position: "center",
            formatter: `{a|${pigData?.TOTAL}}\n{c| }\n{b|${t("pig.pigs")}}`,
            rich: { a: { fontSize: 22, color: "#0C112BE0", fontWeight: "bold", marginBottom: 120 }, b: { fontSize: 16, color: "#0C112B99" }, c: { fontSize: 16 } },
          },
          tooltip: {
            show: true,
            formatter(value) {
              return value.marker + "  " + t("pig.statusLabel." + value.data.name) + "      " + value.data.value;
            },
          },
          labelLine: { show: false },
          data: [
            { name: "GESTATION", value: pigData.GESTATION, itemStyle: { color: palette.secondary1.main } },
            { name: "PARTURITION", value: pigData.PARTURITION, itemStyle: { color: palette.secondary2.main } },
            { name: "OUT_PEN", value: pigData.OUT_PEN, itemStyle: { color: palette.action.disabled } },
          ],
        },
      ],
    };
  }, [t, palette, pigData]);

  useEffect(() => {
    setOption(chartOption);
  }, [setOption, chartOption]);

  return (
    <Box sx={{ height: 1 }} className="relative-position">
      <TableLoading loading={loading} />
      <Box id={chartId} sx={{ height: 1 }}></Box>
    </Box>
  );
}
