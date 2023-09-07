import { Box, SxProps, Typography } from "@mui/material";
import { PropsWithChildren } from "react";

interface CustomLinkProps {
  onClick?(): void;
  underlineOnHover?: boolean;
  showUnderline?: boolean;
  sx?: SxProps;
}

export default function CustomLink(props: PropsWithChildren<CustomLinkProps>) {
  const { underlineOnHover = true, sx = {}, showUnderline = false } = props;

  const handleClick = () => {
    if (props.onClick) {
      props.onClick();
    }
  };

  return (
    <Box onClick={handleClick}>
      <Typography
        sx={{
          color: (theme) => theme.palette.primary.main,
          cursor: "pointer",
          textDecoration: showUnderline ? "underline" : "none",
          "&:hover": { textDecoration: underlineOnHover ? "underline" : "none" },
          ...sx,
        }}
      >
        {props.children}
      </Typography>
    </Box>
  );
}
