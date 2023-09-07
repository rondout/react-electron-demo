import { Box, CircularProgress, SxProps } from "@mui/material";
import { Fragment } from "react";

export default function TableLoading(props: { loading?: boolean; sx?: SxProps }) {
  const { loading = true, sx = {} } = props;
  return (
    <Fragment>
      {loading && (
        <Box
          className="flex"
          sx={{
            minHeight: 400,
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 2,
            width: 1 / 1,
            height: 1 / 1,
            bgcolor: "#ffffffb5",
            userSelect: "none",
            color: (theme) => theme.palette.primary.main,
            ...sx,
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Fragment>
  );
}
