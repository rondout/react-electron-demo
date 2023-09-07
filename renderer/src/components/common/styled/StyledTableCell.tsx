import { styled, TableCell } from "@mui/material";

const StyledTableCell = styled(TableCell)(() => ({
  "&.MuiTableCell-root": {
    color:"red"
  }
}));

export default StyledTableCell
