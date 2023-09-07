import { alpha, Button, styled } from "@mui/material";

const TextButton = styled(Button)(({ theme }) => {
  const color = alpha(theme.palette.primary.main, 0.08);
  const hoveredColor = alpha(theme.palette.primary.main, 0.16);
  const disabledColor = alpha(theme.palette.action.disabled, 0.11);
  return {
    backgroundColor: color,
    "&:hover": {
      backgroundColor: hoveredColor,
    },
    "&.btn-disabled": {
      backgroundColor: disabledColor,
      cursor: "not-allowed",
      opacity: 0.4,
    },
    "&.btn-disabled:active": {
      backgroundColor: disabledColor,
      cursor: "not-allowed",
      opacity: 0.4,
    },
  };
});

export default TextButton;
