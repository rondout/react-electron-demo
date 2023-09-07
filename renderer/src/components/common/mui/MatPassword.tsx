import { FormHelperText, IconButton, InputAdornment, InputLabel, OutlinedInput, FormControl, Input } from "@mui/material";
import { memo, PropsWithChildren, useState } from "react";
import { useTranslation } from "react-i18next";
import { MatFormItemProps } from "../../../models/base.model";
import Iconfont from "../tools/Iconfont";

interface MatPasswordProps extends MatFormItemProps {
  type?: "standard" | "outlined";
}

export default memo(function MatPassword(props: PropsWithChildren<MatPasswordProps>) {
  const [showPassword, setShowPwd] = useState<boolean>(false);
  const { t } = useTranslation();
  const { onChange = () => {}, onBlur = () => {}, onKeyPress = () => {}, value = "", type = "outlined" } = props;

  const handleClickShowPassword = () => {
    setShowPwd(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const InputComponent = type === "outlined" ? OutlinedInput : Input;

  return (
    <FormControl size={props.size || "small"} variant={type} sx={{ maxWidth: props.width || 1 / 1 }} fullWidth>
      <p>{props.error}</p>
      <InputLabel error={props.error}>{t(props.label)}</InputLabel>
      <InputComponent
        disabled={props.disabled}
        value={value}
        error={props.error}
        name={props.name}
        onChange={onChange}
        onBlur={onBlur}
        onKeyPress={onKeyPress}
        type={showPassword ? "text" : "password"}
        endAdornment={
          <InputAdornment position="end">
            <IconButton size="small" aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end">
              {!showPassword ? <Iconfont icon="ic_eye_open" mr={0} /> : <Iconfont icon="ic_eye_close" mr={0} />}
            </IconButton>
          </InputAdornment>
        }
        label={type === "outlined" ? props.label && t(props.label) : null}
      />
      {props.helperText && (
        <FormHelperText error={props.error}>
          <span>{props.helperText}</span>
        </FormHelperText>
      )}
    </FormControl>
  );
});
