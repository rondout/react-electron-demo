import { Box } from "@mui/material";
import jwtDecode from "jwt-decode";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import useWindowSize from "../../hooks/useWindowSize";
import { Redirect } from "../../router";
// import { Redirect } from "../../router";
import CommonLoading from "../common/tools/CommonLoading";
// import { useSelector } from "react-redux";
// import { selectIsLoggin } from "../../store/mainSlice";
// import { Redirect } from "../../router";
import HeaderBar from "./HeaderBar";
import { Nav } from "./nav/Nav";

export default function MainLayout() {
  // const isLoggedIn = useSelector(selectIsLoggin);
  const { watchWindowSize } = useWindowSize();
  const [checkingLoginStatus, setCheckingLoginStatus] = useState(true);
  const [, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem("jwt_token");
    const tokenValid = token && jwtDecode<{ exp: number }>(token).exp > new Date().valueOf() / 1000;
    setLoggedIn(tokenValid);
    setCheckingLoginStatus(false);
  }, []);

  useEffect(() => {
    watchWindowSize();
  }, [watchWindowSize]);

  if (checkingLoginStatus) {
    return <CommonLoading />;
  }

  // 如果没有登录就重定向到登录界面
  if (!window.localStorage.getItem("jwt_token")) {
    return <Redirect to="/login" />;
  }

  return (
    <Box sx={{ height: 1 }}>
      <Box sx={{ height: 1 }} className="flex-start  flex-nowrap">
        {/* <Box sx={{ height: 1, bgcolor: theme.palette.success.main, width: 200 }}> */}
        <Nav></Nav>
        {/* </Box> */}
        <Box sx={{ flex: 1, height: 1, width: "calc(100% - 72px)" }}>
          <HeaderBar></HeaderBar>
          <Box sx={{ height: "calc(100% - 54px)", bgcolor: (theme) => theme.palette.primary.hoverBg }} className="border-box">
            <Outlet></Outlet>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
