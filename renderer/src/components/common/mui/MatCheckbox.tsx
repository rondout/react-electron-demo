import { FormControlLabel, FormControl } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import { useTranslation } from "react-i18next";
import { MatFormItemProps } from "../../../models/base.model";

export interface MatCheckboxProps extends MatFormItemProps<boolean> {}

export default function MatCheckbox(props: MatCheckboxProps) {
  const { t } = useTranslation();
  return (
    <FormControl
      sx={{
        height: 1 / 1,
        display: "flex",
        justifyContent: "center",
        ...(props.sx || {}),
      }}
    >
      <FormControlLabel
        control={
          <Checkbox
            disabled={props.disabled}
            onBlur={props.onBlur}
            name={props.name}
            onChange={props.onChange}
            checked={props.value || false}
          />
        }
        label={t(props.label) as string}
      />
    </FormControl>
  );
}
