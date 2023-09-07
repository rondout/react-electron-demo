import { Box, Checkbox, TableCell, TableRow } from "@mui/material";
import TableHead from "@mui/material/TableHead";
import TableSortLabel from "@mui/material/TableSortLabel";
import { styled } from "@mui/styles";
import { visuallyHidden } from "@mui/utils";
import { MouseEvent, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { BaseData } from "../../../models/base.model";
import MatDropdown from "../mui/MatDropdown";
import { getColumnStickyStatus, TableColumns, TableFilterColumns, TableStickyColumns } from "./CommonTable";

export type Order = "Ascending" | "Descending";

/**
 *
 *
 * @export
 * @interface EnhancedTableProps
 * @template T 用户将table内容定义的数据结构T传递给TableColumns
 */
export interface EnhancedTableProps<T extends BaseData<string>> {
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
  headerCells: TableColumns<T>[];
  orderAble?: boolean;
  showSelect?: boolean;
}

const StyledTableHead = styled(TableHead)(() => {
  return {
    "& .sticky-cell": {
      zIndex: 4,
    },
    bgcolor: "red",
  };
});

const computeOrderForMui = (order: Order) => {
  if (order === "Ascending") {
    return "asc";
  } else if (order === "Descending") {
    return "desc";
  }
  return "desc";
};

const FilterComponent = function <T extends BaseData, F = any>(props: {
  column: TableColumns<T> | TableFilterColumns<T, F>;
  createSortHandler: (property: string) => (event: MouseEvent<unknown>) => void;
  order: Order;
  orderBy: string;
}) {
  const { column, createSortHandler, order, orderBy } = props;
  const [selected, setSelected] = useState<F>(null);
  const { t } = useTranslation();

  const onChange = useCallback(
    (data: F) => {
      if (data === selected) {
        return;
      }
      if (column instanceof TableFilterColumns<T, F>) {
        column.onFilterChange(data);
      }
      setSelected(data);
    },
    [column, selected]
  );

  const title = useMemo(() => {
    if (column instanceof TableFilterColumns<T>) {
      const label = column.filters.find((v) => v.action === selected)?.title;
      return label && ":" + t(label);
    }
    return "";
  }, [column, selected, t]);

  return (
    <Box className="flex-start flex-nowrap">
      {column.sortAble ? (
        <TableSortLabel active={orderBy === column.sortKey} direction={orderBy === column.sortKey ? computeOrderForMui(order) : "desc"} onClick={createSortHandler(column.sortKey)}>
          {orderBy === column.sortKey && (
            <Box component="span" sx={visuallyHidden}>
              {order === "Descending" ? "sorted descending" : "sorted ascending"}
            </Box>
          )}
          {t(column.title) + title}
        </TableSortLabel>
      ) : (
        t(column.title) + title || <div></div>
      )}
      {column instanceof TableFilterColumns && (
        <MatDropdown
          sx={{ pl: 0 }}
          menus={column.filters}
          onMenuClick={onChange}
          selected={selected}
          trigger={
            <Box
              component="span"
              className="relative-position pointer"
              sx={{ border: 5, borderColor: "transparent", borderTopColor: (theme) => theme.palette.text.secondary, display: "inline-block", top: 4, left: 4 }}
            ></Box>
          }
        ></MatDropdown>
      )}
    </Box>
  );
};

export function EnhancedTableHead<T extends BaseData<string>>(props: EnhancedTableProps<T>) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, showSelect } = props;
  const createSortHandler = (property: string) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <StyledTableHead>
      <TableRow sx={{ borderLeft: "1px solid rgba(224, 224, 224, 1)" }}>
        {showSelect ? (
          <TableCell sx={{ zIndex: 4 }} className="sticky-cell" padding="checkbox">
            <Checkbox
              color="primary"
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{
                "aria-label": "select all desserts",
              }}
            />
          </TableCell>
        ) : null}
        {props.headerCells?.map((headCell) => {
          let zIndex = 3;
          if (headCell instanceof TableStickyColumns) {
            zIndex = 4;
          }
          return (
            <TableCell
              className={getColumnStickyStatus<T>(headCell, props.showSelect)}
              sx={{ color: "#0000008c", zIndex }}
              key={headCell.key}
              align="left"
              padding={"normal"}
              sortDirection={orderBy === headCell.sortKey ? computeOrderForMui(order) : false}
            >
              {/* <Box className="flex-start"> */}
              <FilterComponent createSortHandler={createSortHandler} column={headCell} orderBy={orderBy} order={order}></FilterComponent>
            </TableCell>
          );
        })}
      </TableRow>
    </StyledTableHead>
  );
}
