import { Box, IconButton, Tooltip, Typography, useTheme } from "@mui/material";
import { LoadingButton } from "@mui/lab";
// import { useNavigate } from "react-router-dom";
import MatInput from "../components/common/mui/MatInput";
import { useFormik } from "formik";
import * as Yup from "yup";
import MatPassword from "../components/common/mui/MatPassword";
import MatCheckbox from "../components/common/mui/MatCheckbox";
import { useTranslation } from "react-i18next";
import { KeyboardEvent, useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../store/mainSlice";
import { useNavigate } from "react-router-dom";
import userController from "../controllers/user.controller";
import { handleResponseError } from "../models/request.model";
import Iconfont from "../components/common/tools/Iconfont";
import ConfigServerUrl from "../components/common/tools/ConfigServerUrl";
import { $message } from "../utils";

interface LoginParams {
  username: string;
  password: string;
  remember: boolean;
}

// 登录界面
export default function Login() {
  // const [dirs, setDirs] = useState<string[]>([]);
  const theme = useTheme();
  const {
    palette: { primary, background },
  } = theme;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [urlConfigOpen, setUrlConfigOpen] = useState(false);

  const handleConfigServerUrlOk = useCallback(() => {}, []);

  // const loggedIn = useSelector(selectIsLoggin);

  // const dirStr = useMemo(() => dirs.join(), [dirs]);

  const formik = useFormik<LoginParams>({
    initialValues: {
      username: localStorage.getItem("username") || "",
      password: localStorage.getItem("password") || "",
      remember: localStorage.getItem("remember") === "true",
    },
    validateOnChange: true,
    validationSchema: Yup.object({
      username: Yup.string().max(255).required(t("user.createAdminErrors.username")),
      password: Yup.string().max(255).min(6, t("user.createAdminErrors.passwordMin6")).required(t("user.createAdminErrors.password")),
    }),
    onSubmit(values, formikHelpers) {
      const { username, password, remember } = values;
      const result = userController.login({ username, password });
      result
        .then((res) => {
          if (remember) {
            window.localStorage.setItem("username", username);
            window.localStorage.setItem("password", password);
          } else {
            window.localStorage.removeItem("username");
            window.localStorage.removeItem("password");
          }
          window.localStorage.setItem("remember", remember.toString());
          window.localStorage.setItem("jwt_token", res.accessToken);
          dispatch(setUserInfo({ ...values, id: "" }));
          navigate("/");
        })
        .catch((err) => {
          if (err?.data?.errorMessage) {
            handleResponseError(err);
          } else {
            $message.error("user.loginFailedAndCheckServer");
          }
        });
      return result;
    },
  });

  const handleLogin = useCallback(() => {
    formik.handleSubmit();
  }, [formik]);

  const getFieldProps = useCallback(
    (key: string) => {
      return {
        ...formik.getFieldProps(key),
        error: Boolean(formik.touched[key] && formik.errors[key]),
        helperText: formik.touched[key] && formik.errors[key],
        onKeyPress(e: KeyboardEvent<Element>) {
          if (e.key === "Enter") {
            handleLogin();
          }
        },
      };
    },
    [formik, handleLogin]
  );

  return (
    <Box sx={{ height: 1, bgcolor: primary.main }} className="flex relative-position">
      <Tooltip title={t("user.configServerUrl")}>
        <IconButton onClick={() => setUrlConfigOpen(true)} sx={{ top: 4, right: 4, position: "absolute" }}>
          <Iconfont icon="ic_setting" mr={0}></Iconfont>
        </IconButton>
      </Tooltip>
      <Box sx={{ bgcolor: background.default, p: 4, borderRadius: 2, width: 360 }}>
        <Typography variant="h5" color="primary" letterSpacing={2} sx={{ mb: 2 }}>
          {t("user.loginTitle")}
        </Typography>
        <Box sx={{ mt: 2, height: 64 }}>
          <MatInput variant="outlined" width={400} {...getFieldProps("username")} label="user.username"></MatInput>
        </Box>
        <Box sx={{ height: 64 }}>
          <MatPassword width={400} {...getFieldProps("password")} label="user.password"></MatPassword>
        </Box>
        <MatCheckbox sx={{ mb: 1, mt: -1.5 }} {...getFieldProps("remember")} label="user.rememberPwd"></MatCheckbox>
        <LoadingButton loading={formik.isSubmitting} fullWidth variant="contained" onClick={handleLogin}>
          {t("user.login")}
        </LoadingButton>
      </Box>
      <ConfigServerUrl open={urlConfigOpen} onOk={handleConfigServerUrlOk} onClose={() => setUrlConfigOpen(false)} />
    </Box>
  );
}
