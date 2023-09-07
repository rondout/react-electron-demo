import { Box, FormControl, InputLabel, MenuItem, Select, SxProps, Typography } from "@mui/material";
import { nanoid } from "nanoid";
import { memo, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { MatFormItemProps } from "../../../models/base.model";
import { isNull } from "../../../utils";

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: 280,
      // width: 250,
    },
  },
};

export interface MatSelectOption<T = string | number | readonly string[] | any> {
  value: T;
  label: string;
  ignoreTranslate?: boolean;
}

export class MatSelectOptionFactory<T = string | number | readonly string[] | any> implements MatSelectOption<T> {
  constructor(public value: MatSelectOption["value"], public label: string, public ignoreTranslate = false) {}
}

export interface MatSelectProps<T = string | number | readonly string[] | any> extends MatFormItemProps<MatSelectOption["value"]> {
  options: MatSelectOption<T>[];
  size?: "small" | "medium";
  customRender?(data?: T): ReactNode;
  sx?: SxProps;
  variant?: "standard" | "outlined" | "filled";
  loading?: boolean;
}

const initNoneValue = "@@INIT" + nanoid();

export default memo(function MatSelect(props: MatSelectProps) {
  const { t } = useTranslation();
  const { variant = "standard", loading = false } = props;

  // 初始化默认值  根据是否传入placeholder来判断
  const defaultValue = props.placeholder ? initNoneValue : "";

  const value = isNull(props.value) ? defaultValue : props.value;
  const optionHeight = props.size === "medium" ? 48 : 40;

  return (
    <FormControl error={props.error} size={props.size || "small"} variant={variant} fullWidth sx={{ maxWidth: props.width || 1 / 1, ...(props.sx || {}) }}>
      <InputLabel>{t(props.label)}</InputLabel>
      <Select
        onChange={props.onChange}
        disabled={props.disabled}
        onBlur={props.onBlur}
        name={props.name}
        error={props.error}
        MenuProps={MenuProps}
        value={value}
        label={props.label ? t(props.label) : undefined}
      >
        {loading && <Typography sx={{ px: 2, py: 1 }}>loading...</Typography>}
        {props.placeholder && (
          <MenuItem sx={{ display: "none" }} disabled value={initNoneValue}>
            <Typography color={"text.secondary"}>{t(props.placeholder)}</Typography>
          </MenuItem>
        )}
        {!(props.options?.length > 0) && loading !== true && <Box sx={{ px: 2, py: 1 }}>{t("common.noDataFound")}</Box>}
        {!loading &&
          props.options?.map((option, index) => (
            <MenuItem key={index} sx={{ height: optionHeight }} value={option.value}>
              {props.customRender && props.customRender(option.value)}
              {!props.customRender && option.ignoreTranslate ? option.label : t(option.label)}
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  );
});
