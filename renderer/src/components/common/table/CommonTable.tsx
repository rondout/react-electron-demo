import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import { Pagination, Typography } from "@mui/material";
import { EnhancedTableHead, Order } from "./EnhancedTableHead";
import { BaseData, OperationMenu, SortOrder } from "../../../models/base.model";
import { TableCellProps } from "@mui/material";
import EmptyData from "./EmptyData";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { isNull, timeFormat } from "../../../utils";
import TableLoading from "./TableLoading";
import { useCallback } from "react";
// import AddDescription from "../tools/AddDescription";
import StyledRow from "../styled/StyledRow";

export interface HeadCell {
  id: string;
  label: string;
}

export enum TableCellPadding {
  NORMAL,
  NONE,
  CHECKBOX,
}

type StickyType = "left" | "right";
// 普通的tableColumns
export class TableColumns<T extends BaseData<string> = BaseData> {
  public sortKey: string;
  constructor(
    public key: string,
    public title: string,
    public width?: number,
    public customCell?: (data: T, index?: number) => React.ReactNode | string,
    public keepWidth?: boolean,
    public sortAble?: boolean | string
  ) {
    if (typeof sortAble === "string") {
      this.sortKey = sortAble;
    } else {
      this.sortKey = this.key;
    }
  }
  public padding = "normal";
}

export class TableSortColumns<T extends BaseData<string> = BaseData> extends TableColumns<T> {
  constructor(
    public key: string,
    public title: string,
    public sortAble?: boolean | string,
    public width?: number,
    public customCell?: (data: T, index?: number) => React.ReactNode | string,
    public keepWidth?: boolean
  ) {
    super(key, title, width, customCell, keepWidth, sortAble);
  }
}
// 操作按钮的tableColumns
export class TableOperationColumns<T extends BaseData<string> = BaseData> extends TableColumns<T> {
  constructor(
    public key: string,
    public title: string = "common.operation",
    public sticky?: StickyType,
    public width?: number,
    public customCell?: (data: T, index?: number) => React.ReactNode | string,
    public keepWidth?: boolean,
    public sortAble?: boolean
  ) {
    super(key, title, width, customCell, keepWidth, sortAble);
  }
  public padding = "none";
}
// 解析时间的tableColumns
export class TableDateColumns<T extends BaseData<string> = BaseData> extends TableColumns<T> {
  constructor(
    public key: string,
    public title: string,
    public formatter?: string,
    public width: number = 175,
    public customCell?: (data: T, index?: number) => React.ReactNode | string,
    public keepWidth?: boolean,
    public sortAble?: boolean
  ) {
    super(key, title, width, customCell, keepWidth, sortAble);
    if (!customCell) {
      this.customCell = (data) => <Typography>{timeFormat(data[key], formatter) || "-"}</Typography>;
    }
  }
  public padding = "normal";
}
// “描述”字段的tableColumns
// export class TableDescriptionColumns<T extends BaseData<string> = BaseData> extends TableColumns<T> {
//   constructor(
//     private onOk: (data: T) => Promise<any>,
//     public width?: number,
//     public customCell?: (data: T, index?: number) => React.ReactNode | string,
//     public key: string = "description",
//     public title: string = "common.description",
//     public keepWidth?: boolean,
//     public sortAble?: boolean
//   ) {
//     super(key, title, width, customCell, keepWidth, sortAble);
//     if (!customCell) {
//       this.customCell = (data) => {
//         const value = data[key];
//         const onAddDescOk = (description: string) => {
//           const newData: T = { ...data, description };
//           // 这里直接修改data里面的description字段
//           return this.onOk(newData);
//         };
//         return (
//           <Box sx={{ pl: 2 }}>
//             <AddDescription value={value} onOk={onAddDescOk}></AddDescription>
//           </Box>
//         );
//       };
//     }
//     this.padding = "none";
//   }
// }

export class TableStickyColumns<T extends BaseData<string> = BaseData> extends TableColumns<T> {
  constructor(
    public sticky: StickyType,
    public key: string,
    public title: string,
    public width?: number,
    public customCell?: (data: T, index?: number) => React.ReactNode | string,
    public keepWidth?: boolean,
    public sortAble?: boolean
  ) {
    super(key, title, width, customCell, keepWidth, sortAble);
  }
  public padding = "none";
}

export class TableFilterColumns<T extends BaseData<string> = BaseData, F = any> extends TableOperationColumns<T> {
  constructor(
    public key: string,
    public title: string = "common.operation",
    public filters: OperationMenu<F>[],
    public onFilterChange: (filter: F) => void,
    public customCell?: (data: T, index?: number) => React.ReactNode | string,
    public width?: number,
    public sticky?: StickyType,
    public keepWidth?: boolean,
    public sortAble?: boolean
  ) {
    super(key, title, sticky, width, customCell, keepWidth, sortAble);
  }
}

export function getColumnStickyStatus<T extends BaseData<string>>(column: TableColumns<T>, showSelect: boolean) {
  if (column instanceof TableStickyColumns || column instanceof TableOperationColumns) {
    if (column.sticky === "left") {
      if (showSelect) {
        return "sticky-cell sticky-left-with-select";
      } else {
        return "sticky-cell sticky-left";
      }
    } else if (column.sticky === "right") {
      return "sticky-cell sticky-right";
    }
    return column.sticky;
  } else {
    return null;
  }
}

// 这里的泛型需要约束为BaseData类型  为了兼容性BaseData类型的泛型参数可能是Id或者string  因为整个系统中的
export interface CommonTableProps<T extends BaseData<string> = BaseData> extends React.PropsWithChildren<any> {
  rows: T[];
  total?: number;
  columns: TableColumns<T>[];
  orderAble?: boolean;
  sortBy?: string;
  showSelect?: boolean;
  selected?: T[];
  width?: number;
  height?: number | string;
  minHeight?: number | string;
  pageSize?: number;
  hideBoxShadow?: boolean;
  pageChange?: (page: number) => void | Promise<any>;
  onSelectChange?(selected: T[]): void;
  onSortChange?(order: SortOrder, property: string): void;
  // 选择框是否可选的规则
  selectDisableRule?(data: T): boolean;
  children?: ReactNode;
  footerPy?: number;
  pagination?: boolean;
  loading?: boolean;
  page?: number;
  clearSelectOnPageChange?: boolean;
}

/**
 *
 *
 * @export
 * @template T
 * @param {CommonTableProps<T>} props
 * @description table的分页有两种模式 一种是父级组件控制，通常是服务端分页的情况，另一种是本组件自己维护分页，通过是否传入pageChange方法这个prop来确定
 * @returns
 */
export default function CommonTable<T extends BaseData<string> = BaseData>(props: CommonTableProps<T>) {
  let {
    rows = [],
    orderAble,
    total,
    columns,
    children,
    width,
    height,
    pageSize = 10,
    pagination = true,
    pageChange,
    onSortChange,
    clearSelectOnPageChange,
    selectDisableRule,
  } = props;
  // 如果没有传入total就自己计算页数
  const totalPage = useMemo(() => {
    if (!total) {
      return 0;
    } else {
      return Math.ceil(total / pageSize);
    }
  }, [total, pageSize]);

  const [order, setOrder] = useState<Order>("Descending");
  // const [orderBy, setOrderBy] = useState<string>(columns ? columns.find((v) => v.sortAble)?.key : null);
  const [orderBy, setOrderBy] = useState<string>(props.sortBy || null);
  const [selected, setSelected] = useState<T[]>(props.selected || []);
  const [page, setPage] = useState(props.page || 0);
  // const isOb = useObSelector();

  const computedShowSelect = useMemo(() => {
    return props.showSelect;
  }, [props.showSelect]);

  // 监听页码变化
  const onPageChange = useCallback(
    (event: any, page: number) => {
      if (pageChange) {
        // 如果是有自定义pageChange事件则代表数据是来自分页查询数据 因此在pageChange的时候需要重置selected
        if (props.page !== page - 1) {
          pageChange(page - 1);
          if (clearSelectOnPageChange) {
            setSelected([]);
          }
        }
      } else {
        setPage(page - 1);
      }
    },
    [pageChange, props.page, clearSelectOnPageChange]
  );

  // 如果有传入pageChange  rows就接直接使用  否则需要利用page进行分页
  const displayedRows = useMemo(() => {
    if (pageChange) {
      return rows;
    } else {
      return rows.slice(page * pageSize, page * pageSize + pageSize);
    }
  }, [page, pageSize, rows, pageChange]);

  useEffect(() => {
    if (displayedRows.length <= 0 && rows.length) {
      onPageChange(null, 1);
    }
  }, [displayedRows, onPageChange, rows]);

  // 随时注意同步props传过来的selected数组
  useEffect(() => {
    if (props.selected) {
      setSelected(props.selected);
    }
  }, [props.selected]);

  // 排序
  const handleRequestSort = (event: React.MouseEvent<unknown>, property: string) => {
    const isDesc = orderBy === property && order === "Descending";
    const direction = isDesc ? "Ascending" : "Descending";
    setOrder(direction);
    setOrderBy(property);
    onSortChange && onSortChange(direction, property);
  };

  const isSelected = (data: T) => selected.some((v) => v.id === data.id);
  // 被选中的属于当前页的
  const selectedOfThisPage = useMemo(() => {
    const selectedIds = selected.map((v) => v.id);
    return displayedRows.filter((v) => selectedIds.includes(v.id));
  }, [selected, displayedRows]);
  //
  const selectedIdsOfThisPage = useMemo<string[]>(() => selectedOfThisPage.map((v) => v.id), [selectedOfThisPage]);
  // 点击全选CheckBox的时候的操作
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = displayedRows.map((n: T) => n).filter((sn) => !selectDisableRule || !selectDisableRule(sn));
      setSelected(Array.from(new Set([...newSelecteds, ...selected])));
      return;
    }
    setSelected(selected.filter((item) => !selectedIdsOfThisPage.includes(item.id)));
  };

  // 如果props里面有pageChange参数 就由父组件自己控制分页  否则由该组件自己控制
  const currentPage = pageChange ? props.page || 0 : page;

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>, data: T) => {
    if (event.target.checked) {
      setSelected([data, ...selected]);
    } else {
      setSelected(selected.filter((v) => v.id !== data.id));
    }
  };

  // 监听selected的变化
  useEffect(() => {
    if (props.onSelectChange) {
      props.onSelectChange(selected);
    }
    // eslint-disable-next-line
  }, [selected]);

  // Avoid a layout jump when reaching the last page with empty rows.
  // const emptyRows = page > 0 ? Math.max(0, (1 + page) * pageSize - rows.length) : 0;

  const maxTableHeight = useMemo(() => {
    if (height) {
      return height;
    } else if (pagination) {
      return "calc(100% - 68px)";
    } else {
      return "100%";
    }
  }, [height, pagination]);

  const ableToSelectRows = useMemo(() => {
    return displayedRows.filter((item) => !selectDisableRule || !selectDisableRule(item));
  }, [displayedRows, selectDisableRule]);

  return (
    <Box sx={{ width: "100%", height: 1 / 1 }}>
      <Paper
        sx={{
          width: "100%",
          height: 1 / 1,
          boxShadow: props.hideBoxShadow ? "none !important" : (theme) => theme.commonBoxShadow,
          position: "relative",
          // overflow: "hidden",
          boxSizing: "border-box",
          minHeight: props.minHeight,
        }}
      >
        <TableContainer sx={{ maxHeight: maxTableHeight, height: 1 / 1, minHeight: props.minHeight }}>
          <Table stickyHeader={true} sx={{ minWidth: width }} aria-labelledby="tableTitle" size="medium">
            {rows.length >= 0 && (
              <EnhancedTableHead<T>
                numSelected={selectedOfThisPage.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={ableToSelectRows.length}
                headerCells={columns}
                orderAble={orderAble}
                showSelect={computedShowSelect}
              />
            )}
            <TableBody>
              {displayedRows?.map((row, index) => {
                const isItemSelected = isSelected(row);
                return (
                  <StyledRow
                    hover
                    // onClick={(event) => handleSelect(event, row)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    sx={{ pb: 2 }}
                  >
                    {computedShowSelect ? (
                      <TableCell className="sticky-cell" sx={{ border: "none" }} onClick={() => {}} padding="checkbox">
                        <Checkbox disabled={selectDisableRule && selectDisableRule(row)} onChange={(event) => handleSelect(event, row)} color="primary" checked={isItemSelected} />
                      </TableCell>
                    ) : null}
                    {columns?.map((column) => (
                      <TableCell
                        className={getColumnStickyStatus<T>(column, computedShowSelect)}
                        sx={{ border: "none" }}
                        width={column.width}
                        padding={column.padding as TableCellProps["padding"]}
                        key={column.key}
                      >
                        <Box sx={{ width: column.width, maxWidth: column.width }}>
                          {!isNull(column.customCell) ? (
                            column.customCell(row, index) || "-"
                          ) : (
                            <Typography className="word-ellipsis">{isNull(row[column.key]) ? "-" : row[column.key]}</Typography>
                          )}
                        </Box>
                      </TableCell>
                    ))}
                  </StyledRow>
                );
              })}
            </TableBody>
          </Table>
          {rows.length <= 0 && !props.loading && (children || <EmptyData pt={4} />)}
        </TableContainer>
        {pagination && (
          <Box sx={{ p: 1.5, py: props.footerPy || 2, opacity: rows.length ? 1 : 0, pt: props.footerPy || 2.5 }}>
            <Pagination sx={{ display: "flex", justifyContent: "flex-end" }} count={totalPage} color="primary" onChange={onPageChange} page={currentPage + 1} />
          </Box>
        )}
        {props.loading && <TableLoading></TableLoading>}
      </Paper>
    </Box>
  );
}
