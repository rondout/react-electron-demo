import { alpha, Box, List, ListItemButton, styled, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import Iconfont from "../common/tools/Iconfont";

const StyledList = styled(List)(({ theme }) => {
  const primary = theme.palette.primary.main;
  return {
    padding: "0",
    "& .MuiListItemButton-root": {
      paddingLeft: 8,
      "& .vantron": {
        color: "#757575",
      },
      // "& .MuiTypography-root": {
      //   color: alpha(theme.palette.text.primary, 0.6),
      // },
      "&:hover": {
        backgroundColor: "rgb(0 0 0 / 1%)",
      },
    },
    "& .Mui-selected": {
      backgroundColor: alpha(primary, 0.08),
      "& .MuiTypography-root": {
        // color: primary,
      },
    },
  };
});

export default function FeedingMenu() {
  const {
    commonBoxShadow,
    palette: { background },
  } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <Box sx={{ mr: 2, boxShadow: commonBoxShadow, height: 1, borderRadius: 2, bgcolor: background.default, width: 200, minWidth: 200 }} className="border-box">
      <Box sx={{ height: 64, px: 2 }} className="flex-start flex-nowrap">
        <Typography color="text.secondary">{t("nav.feedManagement")}</Typography>
      </Box>
      <Box sx={{ px: 1, pb: 14 / 8, pt: 2, height: "calc(100% - 80px)" }} className="border-box">
        <StyledList>
          <ListItemButton
            onClick={() => navigate("/feed-management/feed-curve")}
            className="flex-start flex-nowrap"
            sx={{ height: 40, mb: 0.5 }}
            selected={pathname?.includes("/feed-curve")}
          >
            <Iconfont icon="ic_curve"></Iconfont>
            <Typography sx={{ ml: 1 }}>{t("device.feedCurve")}</Typography>
          </ListItemButton>
          <ListItemButton
            onClick={() => navigate("/feed-management/feed-plan")}
            className="flex-start flex-nowrap"
            sx={{ height: 40, mb: 0.5 }}
            selected={pathname?.includes("/feed-plan")}
          >
            <Iconfont icon="ic_plan"></Iconfont>
            <Typography sx={{ ml: 1 }}>{t("device.feedPlan")}</Typography>
          </ListItemButton>
          <ListItemButton
            onClick={() => navigate("/feed-management/forage")}
            className="flex-start flex-nowrap"
            sx={{ height: 40, mb: 0.5 }}
            selected={pathname?.includes("/forage")}
          >
            <Iconfont icon="ic_feed"></Iconfont>
            <Typography sx={{ ml: 1 }}>{t("feed.forageManagement")}</Typography>
          </ListItemButton>
        </StyledList>
      </Box>
    </Box>
  );
}
