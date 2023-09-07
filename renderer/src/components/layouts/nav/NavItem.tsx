import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
// import Icon from "@mui/material/Icon";
import { NavItemProps, navItemStyle } from "./Nav";
import { useTranslation } from "react-i18next";
import { matchPath, useLocation, useNavigate } from "react-router-dom";
import { memo } from "react";
import Iconfont from "../../common/tools/Iconfont";
import { useSelector } from "react-redux";
import { selectCollapsed } from "../../../store/mainSlice";
import { alpha } from "@mui/material";

export default memo(function NavItem(props: NavItemProps) {
  const { data } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const compareMatch = (path: string) => matchPath(path, location.pathname);
  const active = data.pathMatch.some((v) => compareMatch(v));
  const { sx = {} } = props;

  const collapsed = useSelector(selectCollapsed);

  return (
    <List
      sx={{
        width: "100%",
        maxWidth: 360,
        bgcolor: "transparent",
        py: 0,
        boxSizing: "border-box",
      }}
      component="nav"
      aria-labelledby="nested-list-subheader"
    >
      <ListItemButton
        onClick={() => navigate(data.path)}
        sx={[
          {
            justifyContent: "center",
            height: 56,
            pl: 2.25,
            ...navItemStyle,

            ...sx,
          },
          // 判断是否为当前路由菜单
          active
            ? {
                bgcolor: alpha("#000", 0.6 * 0.44),
                // bgcolor: "#00000099",
                // background: `linear-gradient(0deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), rgba(48, 160, 254, 0.8)`,
                opacity: 1,
                "&:hover": {
                  bgcolor: alpha("#000", 0.6 * 0.44),
                  // background: `linear-gradient(0deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), rgba(48, 160, 254, 0.8)`,
                  // bgcolor: "#00000099",
                  // backgroundImage: (theme) => theme.palette.secondary.main,
                  // bgcolor: "primary.hoverBg",
                  opacity: 1,
                },
                // backgroundImage: (theme) => theme.custom?.navItemHoverBg,
              }
            : {},
        ]}
      >
        <Iconfont my={0.5} mr={!collapsed ? 2 : 0} color="#fff" icon={active ? data.icon + "_selected" : data.icon}></Iconfont>
        {!collapsed && <ListItemText sx={{ whiteSpace: "nowrap" }} primary={t(data.title)} />}
      </ListItemButton>
    </List>
  );
});
