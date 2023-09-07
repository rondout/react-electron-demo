import { lighten, styled, TableRow } from "@mui/material";

const StyledRow = styled(TableRow)(({ theme }) => {
  return {
    "& .MuiTableCell-root": {
      color: theme.custom.tableColor,
    },
    "& .sticky-cell": {
      position: "sticky",
      backgroundColor: "#fff",
    },
    // "& .sticky-left-with-select": {
    //   "&::after": {
    //     content: "''",
    //     boxShadow: commonBoxShadow,
    //   },
    // },
    "&.MuiTableRow-root:hover": {
      backgroundColor: "#fbfbfb",
      "& .sticky-cell": {
        backgroundColor: "#fbfbfb",
      },
    },
    "&.Mui-selected": {
      backgroundColor: lighten(theme.palette.primary.main, 0.95),
      "& .sticky-cell": {
        backgroundColor: lighten(theme.palette.primary.main, 0.95),
      },
    },
    "&.Mui-selected:hover": {
      backgroundColor: lighten(theme.palette.primary.main, 0.9),
      "& .sticky-cell": {
        backgroundColor: lighten(theme.palette.primary.main, 0.9),
      },
    },
  };
});

export default StyledRow;
