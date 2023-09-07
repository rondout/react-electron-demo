import { Badge, Box, IconButton, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { OperationMenu } from "../../models/base.model";
import { logout } from "../../store/mainSlice";
import { timeFormat } from "../../utils";
import AlarmDrawer from "../alarm/AlarmDrawer";
import MatDropdown from "../common/mui/MatDropdown";
import Iconfont from "../common/tools/Iconfont";
import { ResetPassword } from "../common/tools/ResetPassword";
import HeaderBreadCrumb from "./HeaderBreadCrumb";

let timer: NodeJS.Timer = null;

enum UserActions {
  RESET_PWD,
  LOGOUT,
}

const userDropdownMenus = [new OperationMenu(UserActions.RESET_PWD, "common.resetPwd", "ic_edit"), new OperationMenu(UserActions.LOGOUT, "common.logout", "ic_out")];

export default function HeaderBar() {
  const dispatch = useDispatch();
  const [currentTime, setCurrentTime] = useState(new Date().valueOf());
  const navigate = useNavigate();
  const [alarmDrawerOpen, setAalrmDrawerOpen] = useState(false);
  const [resetPwdOpen, setResetPwdOpen] = useState(false);
  const [hasNewAlarm, setHasNewAlarm] = useState(false);

  const handleResetPwdClose = useCallback(() => {
    setResetPwdOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    window.localStorage.removeItem("jwt_token");
    navigate("/login");
  }, [dispatch, navigate]);

  useEffect(() => {
    timer = setInterval(() => {
      setCurrentTime((prev) => {
        const newDate = new Date().valueOf();
        const lastTimeString = timeFormat(prev);
        const newTimeString = timeFormat(newDate);

        if (lastTimeString === newTimeString) {
          return prev;
        }
        return newDate;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      timer && clearInterval(timer);
    };
  }, []);

  const onAction = useCallback(
    (action: UserActions) => {
      switch (action) {
        case UserActions.LOGOUT:
          handleLogout();
          break;
        case UserActions.RESET_PWD:
          setResetPwdOpen(true);
          break;
      }
    },
    [handleLogout]
  );

  return (
    <Box
      sx={{
        height: 56,
        px: 3,
        boxShadow: "0px 2px 8px rgba(100, 129, 153, 0.12)",
        zIndex: 2,
      }}
      className="flex-btw relative-position"
    >
      {/* <img src={logo} width={100} height={24} alt="" /> */}
      <HeaderBreadCrumb />
      <Box className="flex">
        <Typography variant="subtitle1" color="text.secondary">
          {timeFormat(currentTime, "YYYY/MM/DD HH:mm")}
        </Typography>
        {/* <Button variant="contained" onClick={handleLogout}>
          Logout
        </Button> */}
        <IconButton onClick={() => setAalrmDrawerOpen(true)} sx={{ ml: 2, mr: 1 }}>
          <Badge color="error" variant="dot" invisible={!hasNewAlarm}>
            <Iconfont icon="ic_alert" primary mr={0}></Iconfont>
          </Badge>
        </IconButton>
        <MatDropdown
          sx={{ pl: 0 }}
          trigger={
            <IconButton>
              <Iconfont icon="ic_header" primary mr={0}></Iconfont>
            </IconButton>
          }
          onMenuClick={onAction}
          menus={userDropdownMenus}
        ></MatDropdown>
        <ResetPassword handleLogout={handleLogout} open={resetPwdOpen} handleClose={handleResetPwdClose} />
        <AlarmDrawer setHasNewAlarm={setHasNewAlarm} open={alarmDrawerOpen} setOpen={setAalrmDrawerOpen} />
      </Box>
    </Box>
  );
}
