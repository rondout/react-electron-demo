import { alpha, Avatar, Box, Divider, Typography, useTheme } from "@mui/material";
// import { useLocation } from "react-router-dom";
import NavItem from "./NavItem";
import NavSubItem from "./NavSubItem";
import { NavItems, createNavItems } from "../../../models/nav.model";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import config from "../../../../package.json";
import headerLogo from "../../../assets/imgs/header-logo.png";

const { version } = config;

export interface NavItemProps {
  data: NavItems;
  [propName: string]: any;
}

export const navItemStyle = { opacity: 0.7 };

export function Nav() {
  const navItems = useMemo(() => createNavItems(), []);
  const theme = useTheme();
  const { t } = useTranslation();

  // const width = useSelector(selectNavMenuWidth);

  return (
    <Box
      sx={{
        width: 72,
        minWidth: 72,
        height: "100%",
        transition: "width 0.3s",
        bgcolor: alpha(theme.palette.primary.main, 0.8),
        // "&:hover": {
        //   backgroundColor: "primary.main",
        //   opacity: [0.9, 0.8, 0.7],
        // },
        boxShadow: "0px 2px 8px rgba(100, 129, 153, 0.12)",
      }}
      className="border-box"
    >
      <Box sx={{ height: 1 }}>
        <Box sx={{ height: 72, bgcolor: alpha("#000", 0.66) }} className="flex">
          <Avatar src={headerLogo} sx={{ width: 32, height: 32 }}></Avatar>
        </Box>
        <Box sx={{ height: "calc(100% - 168px)", minHeight: 230, bgcolor: alpha("#000", 0.56), overflowY: "auto", pb: 0, pt: 1 }}>
          {navItems.map((navItem: NavItems, index: number) => {
            if (navItem.isDivider) {
              return <Divider key={index} sx={{ my: 2, borderColor: "#ffffff33" }}></Divider>;
            }
            if (navItem.children) {
              return <NavSubItem key={index} data={navItem}></NavSubItem>;
            } else {
              return <NavItem key={index} data={navItem}></NavItem>;
            }
          })}
        </Box>
        <Box sx={{ height: 96, bgcolor: alpha("#000", 0.56) }}>
          <Box sx={{ height: 56, py: 1 }}>
            <Typography sx={{ mb: 0 }} variant="subtitle2" textAlign={"center"} color="#fff">
              {t("version")}
            </Typography>
            <Typography sx={{ mb: 0 }} variant="subtitle2" textAlign={"center"} color="#fff">
              {"v " + version}
            </Typography>
          </Box>
          <Box sx={{ height: 40 }}></Box>
        </Box>
      </Box>
    </Box>
  );
}
