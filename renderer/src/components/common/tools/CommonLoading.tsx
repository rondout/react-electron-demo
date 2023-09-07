import { Box, CircularProgress, SxProps } from "@mui/material";
import { Fragment, ReactNode } from "react";
import "./loading.scss";

type LoadingSize = "small" | "medium" | "large";

interface CommonLoadingProps {
  size?: LoadingSize;
  title?: string;
  children?: ReactNode;
  loading?: boolean;
  sx?: SxProps;
}

const loadingStyleMap = new Map<LoadingSize, number>([
  ["small", 40],
  ["medium", 50],
  ["large", 60],
]);

export default function CommonLoading(props: CommonLoadingProps) {
  // const classes = useStyles();

  const {
    size = "medium",
    loading = true,
    title = "loading...",
    sx = {},
  } = props;

  return (
    <Fragment>
      {loading && (
        <Box
          sx={{ height: 1 / 1, flexDirection: "column", ...sx }}
          className="flex"
        >
          <CircularProgress sx={{ mb: 1 }} size={loadingStyleMap.get(size)} />
          <span className="loading-text">{title}</span>
        </Box>
      )}
      {props.children}
    </Fragment>
  );
}
