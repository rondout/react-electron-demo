import { alpha, List, styled } from "@mui/material";

const StyledUserMenu = styled(List)(({ theme }) => {
  const primary = theme.palette.primary.main;
  return {
    padding: "0",
    "& .MuiListItemButton-root": {
      paddingLeft: 24,
      "& .vantron": {
        color: "#757575",
      },
      "& .MuiTypography-root": {
        color: alpha(theme.palette.text.primary, 0.6),
      },
      "&:hover": {
        backgroundColor: "rgb(0 0 0 / 1%)",
      },
    },
    "& .Mui-selected": {
      backgroundColor: alpha(primary, 0.08),
      "& .vantron": {
        color: primary,
      },
      "& .MuiTypography-root": {
        color: primary,
      },
    },
  };
});
export default StyledUserMenu;
