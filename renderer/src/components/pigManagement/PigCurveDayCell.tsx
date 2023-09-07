import { Typography, useTheme } from "@mui/material";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { PigInfo } from "../../models/pig.model";
import { dateFormat, isNull } from "../../utils";
import CustomChip from "../common/tools/CustomChip";

export default function PigCurveDayCell({ pig }: { pig: PigInfo }) {
  const { t } = useTranslation();
  const {
    palette: { action },
  } = useTheme();

  // 如果没有曲线开始时间或者猪只处于离栏状态，就显示空 用"-"表示
  if (isNull(pig.curveStartDate) || !pig.inPen) {
    return <Typography sx={{ pl: 2 }}>{"-"}</Typography>;
  }
  // 比较曲线开始日期和现在的日期
  let days = "";
  const startDataTime = moment(pig.curveStartDate).valueOf();
  const nowDateTime = moment(dateFormat(moment().valueOf())).valueOf();
  const curveDays = pig.additionalInfo?.associatedCurve?.curveData?.length;
  // 如果开始日期小于现在的日期，说明曲线已经生效了
  if (curveDays && nowDateTime >= startDataTime) {
    // 计算到今天为止一共执行了多少天了
    const currentExecutedDays = moment.duration(nowDateTime - startDataTime).asDays() + 1;
    // 如果执行的天数大于了曲线总共天数，就展示曲线已经执行完毕
    if (currentExecutedDays > curveDays) {
      return <CustomChip sx={{ px: 0.5, ml: 2 }} customColor={action.active} title={t("pig.curveExecuted")}></CustomChip>;
    }
    days = currentExecutedDays.toString() + "/" + curveDays;
  } else if (curveDays && nowDateTime <= startDataTime) {
    // 如果开始日期大于现在的日期，说明曲线还未开始执行
    return <CustomChip sx={{ px: 0.5, ml: 2 }} title={t("pig.curveNotStartExecution")}></CustomChip>;
  }
  return <Typography sx={{ pl: 2 }}>{days ? days : "-"}</Typography>;
}
