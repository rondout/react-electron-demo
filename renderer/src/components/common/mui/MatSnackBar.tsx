import { Alert, AlertProps, Snackbar } from "@mui/material";
import { t } from "i18next";
import { useSelector, useDispatch } from "react-redux";
import { closeSnackBar, selectSnackBarConfig } from "../../../store/toolSlice";

export interface MatSnackBarProps {
  duration: number;
  type: AlertProps["severity"];
}

export default function MatSnackBar() {
  const config = useSelector(selectSnackBarConfig);
  const dispatch = useDispatch();

  const onSnackbarClose = () => {
    dispatch(closeSnackBar());
  };

  return (
    <Snackbar anchorOrigin={{ vertical: "top", horizontal: "center" }} open={config.open} onClose={onSnackbarClose} autoHideDuration={config.duration * 1000}>
      <Alert severity={config.type} sx={{ width: "100%" }}>
        {t(config.content)}
      </Alert>
    </Snackbar>
  );
}
