import { Box, SxProps, Table, TableBody, TableCell, TableHead, TableRow, Typography, useTheme } from "@mui/material";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import EmptyData from "./EmptyData";
import TableLoading from "./TableLoading";

export class PlainTableColumns<T = any> {
  constructor(public key: string, public title: string, public customCell?: (data: T, index?: number) => ReactNode | string) {}
}

interface PlainTableProps<T> {
  rows: T[];
  columns: PlainTableColumns<T>[];
  loading?: boolean;
  sx?: SxProps;
}

export default function PlainTable<T = any>(props: PlainTableProps<T>) {
  const { rows = [], columns, sx = {}, loading = false } = props;
  const { t } = useTranslation();
  const { palette } = useTheme();

  return (
    <Box sx={{ overflow: loading ? "hidden" : "auto", ...sx }} className="relative-position">
      <TableLoading loading={loading} />
      <Table stickyHeader>
        <TableHead className="flex-evenly" sx={{ bgcolor: "#fff" }}>
          <TableRow sx={{ bgcolor: "#fff" }}>
            {columns.map((column) => (
              <TableCell sx={{ bgcolor: "#fff", flex: 1, p: 0, borderRight: 2, borderRightColor: "#fff" }} key={column.key}>
                <Box sx={{ bgcolor: palette.primary.hoverBg, p: 1 }}>
                  <Typography textAlign="center" color="text.secondary">
                    {t(column.title)}
                  </Typography>
                </Box>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length > 0 &&
            rows.map((item, index) => (
              <TableRow key={index} className="flex-evenly" sx={{ borderColor: palette.primary.main }}>
                {columns.map((column) => (
                  <TableCell key={column.key} className="flex" sx={{ p: 1.25, flex: 1, borderRight: 1, borderColor: palette.other.divider, textAlign: "center" }}>
                    {column.customCell && column.customCell(item)}
                    {!column.customCell && <Typography textAlign="center">{item[column.key]}</Typography>}
                  </TableCell>
                ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>
      {!rows.length && <EmptyData />}
    </Box>
  );
}
