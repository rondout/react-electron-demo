import { alpha, Box, InputAdornment, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { OperationMenu } from "../../models/base.model";
import MatDropdown from "../common/mui/MatDropdown";
import MatSearchInput, { MatSearchInputProps } from "../common/mui/MatSearchInput";

const useStyle = makeStyles((theme: Theme) => {
  return {
    dropDowbTrigger: {
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
      padding: "8px 16px",
      marginLeft: "-14px",
      borderRadius: "4px 0 0 4px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
    },
    dropdownIcon: {
      border: "6px solid transparent",
      borderTopColor: "#0000008f",
      marginLeft: "8px",
      marginTop: "6px",
    },
  };
});

export enum PigSearchTypes {
  NO = "sn",
  FIELD = "devicePen",
  TAG = "tags",
}

const menus = [
  new OperationMenu(PigSearchTypes.NO, "device.searchTypes.NO"),
  new OperationMenu(PigSearchTypes.FIELD, "device.searchTypes.FIELD"),
  new OperationMenu(PigSearchTypes.TAG, "device.searchTypes.TAG"),
];

interface PigSearchInputProps extends MatSearchInputProps {
  type: PigSearchTypes;
  onTypeChange(type: PigSearchTypes): void;
}

export default function PigSearchInput(props: PigSearchInputProps) {
  const classes = useStyle();
  const { t } = useTranslation();
  const { type, onTypeChange, ...rest } = props;

  const label = useMemo(() => {
    return t(menus.find((v) => v.action === type).title);
  }, [t, type]);

  return (
    <MatSearchInput
      startAdorment={
        <InputAdornment position="start">
          <MatDropdown
            sx={{ pl: 0 }}
            trigger={
              <Box className={classes.dropDowbTrigger}>
                <Typography>{label}</Typography>
                <Box className={classes.dropdownIcon}></Box>
              </Box>
            }
            selected={type}
            menus={menus}
            onMenuClick={onTypeChange}
          ></MatDropdown>
        </InputAdornment>
      }
      {...rest}
    ></MatSearchInput>
  );
}
