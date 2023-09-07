import { FormControl, InputBaseProps, SxProps, TextField } from "@mui/material";
import { useCallback } from "react";
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

export default memo(function MatInput(props: MatInputProps) {
  const { width, size = "small", fullWidth = true, onKeyPress, variant = "standard" } = props;
  const { t } = useTranslation();
  const value = isNull(props.value) ? "" : props.value;

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (onKeyPress) {
        onKeyPress(e);
      }
    },
    [onKeyPress]
  );

  return (
    <FormControl error={props.error} sx={{ maxWidth: width || 1 / 1 }} fullWidth={fullWidth}>
      <TextField variant={variant} {...props} size={size} label={props.label && t(props.label)} value={value} onKeyPress={(e) => handleKeyPress(e)}></TextField>
    </FormControl>
  );
});
