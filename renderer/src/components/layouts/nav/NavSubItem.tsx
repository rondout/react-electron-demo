import { memo, useCallback, useEffect, useState } from "react";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
// import ExpandLess from "@mui/icons-material/ExpandLess";
// import ExpandMore from "@mui/icons-material/ExpandMore";
import { Box } from "@mui/material";
import { NavItemProps, navItemStyle } from "./Nav";
import { NavItems } from "../../../models/nav.model";
import { useTranslation } from "react-i18next";
import NavItem from "./NavItem";
import { useLocation } from "react-router-dom";

export default memo(function NavSubItem(props: NavItemProps) {
  const { data } = props;
  const [open, setOpen] = useState<boolean>(false);
  const { t } = useTranslation();
  const location = useLocation();

  const setInitOpenState = useCallback<() => void>(() => {
    const defaultOpen = location.pathname?.includes(data.path);
    setOpen(defaultOpen);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setInitOpenState();
  }, [setInitOpenState]);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <List
      sx={{
        width: "100%",
        maxWidth: 360,
        bgcolor: "transparent",
        mb: 0,
        pt: 0,
        pb: 0,
      }}
      component="nav"
      aria-labelledby="nested-list-subheader"
    >
      <ListItemButton onClick={handleClick} sx={{ ...navItemStyle, mt: 0 }}>
        {/* <Icon sx={{ mr: 2 }}>{data.icon}</Icon> */}
        <ListItemText primary={t("nav." + data.title)} />
        {/* {open ? <ExpandLess /> : <ExpandMore />} */}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {data.children?.map((navItem: NavItems, index: number) => {
            return (
              // 调用NavItem组件
              <Box key={index} sx={{ borderRadius: 2, ml: 0 }}>
                <NavItem sx={{ px: 3 }} data={navItem}></NavItem>
              </Box>
            );
          })}
        </List>
      </Collapse>
    </List>
  );
});
