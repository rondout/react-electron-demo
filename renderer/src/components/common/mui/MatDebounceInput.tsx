import { debounce, FormControl, InputBaseProps, SxProps, TextField } from "@mui/material";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { KeyboardEvent, memo } from "react";
import { useTranslation } from "react-i18next";
import { MatFormItemProps } from "../../../models/base.model";
import { isNull } from "../../../utils";

interface MatInputProps extends MatFormItemProps<string | number> {
  multiline?: boolean;
  maxRows?: number;
  minRows?: number;
  inputProps?: InputBaseProps["inputProps"];
  sx?: SxProps;
  variant?: "standard" | "outlined" | "filled";
  fullWidth?: boolean;
}

export default memo(function MatDebounceInput(props: MatInputProps) {
  const { width, size = "small", fullWidth = true, onKeyPress, variant = "standard" } = props;
  const propOnChange = props.onChange;
  const { t } = useTranslation();
  const value = isNull(props.value) ? "" : props.value;
  const [debounceEvent, setDebounceEvent] = useState<ChangeEvent<HTMLInputElement>>(null);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (onKeyPress) {
        onKeyPress(e);
      }
    },
    [onKeyPress]
  );

  const debounceValue = useMemo(() => {
    if (debounceEvent) {
      return debounceEvent.target.value;
    }
    return value;
  }, [value, debounceEvent]);

  useEffect(() => {
    setDebounceEvent(null);
  }, [value]);

  const debounceChangeEvent = useMemo(() => {
    return debounce((event: ChangeEvent<HTMLInputElement>) => {
      event && propOnChange && propOnChange(event);
    }, 300);
  }, [propOnChange]);

  useEffect(() => {
    debounceChangeEvent(debounceEvent);
  }, [debounceChangeEvent, debounceEvent]);

  const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setDebounceEvent(event);
  }, []);

  return (
    <FormControl error={props.error} sx={{ maxWidth: width || 1 / 1 }} fullWidth={fullWidth}>
      <TextField
        variant={variant}
        {...props}
        onChange={onChange}
        value={debounceValue}
        size={size}
        placeholder={props.placeholder && t(props.placeholder)}
        label={props.label && t(props.label)}
        // value={value}
        onKeyPress={(e) => handleKeyPress(e)}
      ></TextField>
    </FormControl>
  );
});
