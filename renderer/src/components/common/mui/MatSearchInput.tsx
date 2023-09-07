import { alpha, InputBaseProps, styled, TextField, SxProps, debounce } from "@mui/material";
import { t } from "i18next";
import { ChangeEvent, Fragment, memo, ReactNode, useEffect, useMemo, useState } from "react";
import Iconfont from "../tools/Iconfont";

const SytledInput = styled(TextField)(({ theme }) => {
  return {
    "& .MuiOutlinedInput-root": {
      paddingRight: 4,
      width: "100%",
    },
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    "&:hover devicePenset": {
      borderColor: theme.palette.primary.main + " !important",
    },
  };
});

export interface MatSearchInputProps {
  value: string;
  onChange(text: string): void;
  placeholder?: string;
  width?: number;
  fullWidth?: boolean;
  inputProps?: InputBaseProps["inputProps"];
  sx?: SxProps;
  startAdorment?: ReactNode;
}

export default memo(function MatSearchInput(props: MatSearchInputProps) {
  const { value: propsValue = "" } = props;
  const [value, setValue] = useState(propsValue);
  const onValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    emitChangeByProps(event);
  };
  const { startAdorment, ...rest } = props;

  const { onChange, width = 250, sx = {} } = props;

  // 这里用debounce做防抖  做性能优化
  const emitChangeByProps = useMemo(() => {
    return debounce(function (event: ChangeEvent<HTMLInputElement>) {
      onChange && onChange(event.target.value);
    }, 300);
  }, [onChange]);

  // const clearContent = () => {
  //   setValue("");
  //   props.onChange("");
  // };
  useEffect(() => {
    setValue(propsValue);
  }, [propsValue]);

  return (
    <Fragment>
      <SytledInput
        {...rest}
        sx={{ ...sx, width: props.fullWidth ? "100%" : width }}
        InputProps={{
          // startAdornment: !!value && <Iconfont onClick={clearContent} icon="ic_chip_close" mr={0.5} fontSize={16} style={{ cursor: "pointer" }}></Iconfont>,
          endAdornment: <Iconfont icon="ic_search"></Iconfont>,
          startAdornment: startAdorment,
        }}
        placeholder={props.placeholder ? t(props.placeholder) : "Search..."}
        color="primary"
        size="small"
        value={value}
        onChange={onValueChange}
      ></SytledInput>
      <input type="text" className="not-to-show" />
    </Fragment>
  );
});
