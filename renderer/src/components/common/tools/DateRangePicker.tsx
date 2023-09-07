import { Box, Button, Typography } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { dateFormat } from "../../../utils";
import MatDatePicker from "../mui/MatDatePicker";
import MatDropdown from "../mui/MatDropdown";

export interface DateRangePickerParams {
  startDate?: string;
  endDate?: string;
}

interface DateRangePickerProps extends DateRangePickerParams {
  onDateChange(param: DateRangePickerParams): void;
}

export default function DateRangePicker(props: DateRangePickerProps) {
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const { t } = useTranslation();

  const dateLabels = useMemo(() => {
    const start = props.startDate ? dateFormat(props.startDate) : t("device.startDate");
    const end = props.endDate ? dateFormat(props.endDate) : t("device.endDate");
    return { start, end };
  }, [t, props]);

  const handleDateChange = useCallback(
    (type: keyof DateRangePickerParams, date: number) => {
      props.onDateChange({ [type]: dateFormat(date, "YYYY-MM-DD") });
    },
    [props]
  );

  return (
    <Box className="flex">
      <MatDropdown open={startOpen} trigger={<Button onClick={() => setStartOpen(true)}>{dateLabels.start}</Button>}>
        <MatDatePicker onChange={(date) => handleDateChange("startDate", date)} value={props.startDate} staticMode></MatDatePicker>
      </MatDropdown>
      <Typography>-</Typography>
      <MatDropdown open={endOpen} sx={{ pl: 0 }} trigger={<Button onClick={() => setEndOpen(true)}>{dateLabels.end}</Button>}>
        <MatDatePicker onChange={(date) => handleDateChange("endDate", date)} value={props.endDate} staticMode></MatDatePicker>
      </MatDropdown>
    </Box>
  );
}
