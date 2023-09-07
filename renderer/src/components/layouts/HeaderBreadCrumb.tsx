import { Box, Typography } from "@mui/material";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { matchRoutes, useLocation, useNavigate } from "react-router-dom";
import { routes } from "../../router";
import { BreadCrumbFactory, BreadcrumbsMap, Pathnames } from "../../router/router.config";
import Iconfont from "../common/tools/Iconfont";

export default function HeaderBreadCrumb() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const matchedRoutes = matchRoutes(routes, pathname);
  let breadcrumbData: BreadCrumbFactory = { title: null, linkPath: null };
  if (matchedRoutes?.length) {
    const matchedRoute = matchedRoutes[matchedRoutes.length - 1];
    const matchedPath: Pathnames = matchedRoute.route.path as Pathnames;
    BreadcrumbsMap.get(matchedPath) && (breadcrumbData = BreadcrumbsMap.get(matchedPath));
  }

  const { title, linkPath } = breadcrumbData;

  const handleBack = useCallback(() => {
    navigate(linkPath);
  }, [linkPath, navigate]);

  return (
    <Box className="flex-start flex-nowrap">
      {linkPath && <Iconfont onClick={handleBack} icon="ic_fold" pointer style={{ transform: "rotate(180deg)" }}></Iconfont>}
      {title && <Typography>{t("user.pathnames." + title)}</Typography>}
      {/* {breadcrumbData.length > 1 && (
        <Breadcrumbs separator={<Iconfont mr={0} fontSize={16} icon="ic_arrow_right" />} aria-label="breadcrumb">
          {breadcrumbData.map((item, index) => {
            if (index === breadcrumbData.length - 1) {
              return (
                <Typography key={item.path} color="textPrimary">
                  {t("user.navTitles." + item.title)}
                </Typography>
              );
            } else {
              return (
                <Link key={item.path} underline="none" color="inherit" onClick={() => onLinkClick(item.path)}>
                  {t("user.navTitles." + item.title)}
                </Link>
              );
            }
          })}
        </Breadcrumbs>
      )} */}
    </Box>
  );
}
