import { Box, Button, debounce, lighten, PaletteColor, Typography, useTheme } from "@mui/material";
import { LineSeriesOption } from "echarts";
import { forwardRef, Fragment, memo, Ref, useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useChart, { ECOption } from "../../../hooks/useChart";
import { FeedCurveType, FeedCurveItem, FeedCurveItemFactory, FeedCurveItemKey, validateFeedCurveItem, CurveConfigDataParam } from "../../../models/feeding.model";
import DisplayInfoCard from "../../common/tools/DisplayInfoCard";
import Iconfont from "../../common/tools/Iconfont";
import { ChangeEvent } from "react";
import { $message, isNull } from "../../../utils";
import MessageTip from "../../common/tools/MessageTip";
import MatDebounceInput from "../../common/mui/MatDebounceInput";
import EmptyData from "../../common/table/EmptyData";
import feedController from "../../../controllers/feed.controller";
import { handleResponseError } from "../../../models/request.model";
import { LoadingButton } from "@mui/lab";

const defaultChartId = "feed-curve-detail-id";

interface ConfigFeedCurveProps {
  detail: FeedCurveType;
  reloadDetail?(): Promise<void>;
  chartId?: string;
  editMode?: boolean;
  showEditBtn?: boolean;
}

export interface ConfigFeedCurveRef {
  validate(): boolean;
  getValues(): CurveConfigDataParam;
}

const curveItemKeys: FeedCurveItemKey[] = ["min", "warn", "target", "max"];

const tableHeadTitles = ["day", "min", "warn", "target", "max"];

function genarateAreaStyle(color: PaletteColor): LineSeriesOption["areaStyle"] {
  return {
    color: {
      type: "linear",
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        {
          offset: 0,
          color: lighten(color.main, 0.5), // 0% 处的颜色
        },
        {
          offset: 1,
          color: "#fff", // 100% 处的颜色
        },
      ],
      global: false, // 缺省为 false
    },
  };
}

export default memo(
  forwardRef(function ConfigFeedCurve(props: ConfigFeedCurveProps, ref: Ref<ConfigFeedCurveRef>) {
    const { chartId = defaultChartId, detail, showEditBtn = true, reloadDetail = () => Promise.resolve() } = props;
    const { t } = useTranslation();
    const { setOption } = useChart({ id: chartId });
    const {
      palette: { primary, secondary1, warning, error, other },
    } = useTheme();
    const [deleteMode, setDeleteMode] = useState(false);
    const [editMode, setEditMode] = useState(props.editMode);
    const [curveName, setCurveName] = useState<string>(detail.curveName || "");
    const [feedCurveItems, setFeedCurveItems] = useState<FeedCurveItem[]>([...(detail?.curveData || [])]);
    //   const [selectedRow, setSelectedRow] = useState<FeedCurveItem>();
    const [onEditCell, setOnEditCell] = useState<{ id: string; key: FeedCurveItemKey }>({ id: null, key: null });
    const [saveLoading, setSaveLoading] = useState(false);

    const curveKeyColorMap = useMemo(
      () =>
        new Map<FeedCurveItemKey, PaletteColor>([
          ["min", error],
          ["warn", warning],
          ["target", secondary1],
          ["max", primary],
        ]),
      [error, warning, secondary1, primary]
    );

    const chartOption: ECOption = useMemo(() => {
      const curveData: { [key in FeedCurveItemKey]?: number[] } = {
        min: [],
        warn: [],
        target: [],
        max: [],
      };
      const xAxisData = [];
      feedCurveItems.forEach(({ min, warn, target, max, day }) => {
        curveData.min.push(min);
        curveData.warn.push(warn);
        curveData.target.push(target);
        curveData.max.push(max);
        xAxisData.push(day);
      });
      const createSeriesData = (color: PaletteColor, key: FeedCurveItemKey, index: number) => {
        return {
          smooth: true,
          name: t("feed." + key),
          type: "line" as "line",
          //   stack: "Total",
          barWidth: 10,
          data: curveData[key],
          lineStyle: { color: color.main },
          areaStyle: genarateAreaStyle(color),
          showSymbol: false,
          z: -index,
        };
      };
      return {
        //   title: {
        //     text: "Stacked Line",
        //   },
        tooltip: {
          trigger: "axis",
        },
        legend: {
          data: curveItemKeys.map((key) => {
            return { name: t("feed." + key), itemStyle: { color: curveKeyColorMap.get(key).main } };
          }),
          icon: "circle",
        },
        grid: {
          left: "1%",
          right: "3.5%",
          bottom: "2%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: xAxisData,
          name: t("feed.day"),
        },
        yAxis: {
          type: "value",
          splitLine: { lineStyle: { type: "dashed" } },
          name: "(g)",
        },
        animationDuration: 500,
        series: curveItemKeys.map((key, index) => createSeriesData(curveKeyColorMap.get(key), key, index)).reverse(),
      };
    }, [feedCurveItems, t, curveKeyColorMap]);

    const setChartOption = useMemo(() => {
      return debounce((option: ECOption) => {
        setOption(option);
      });
    }, [setOption]);

    useEffect(() => {
      setChartOption(chartOption);
    }, [chartOption, setChartOption]);

    const validation = useMemo(() => {
      return {
        validate() {
          if (!feedCurveItems.length) {
            $message.error("feed.curveConfigError.needCurveItem");
            return false;
          }
          if (!curveName) {
            $message.error("feed.curveConfigError.needCurveName");
            return false;
          }
          const errorDays: number[] = [];
          feedCurveItems?.forEach((item) => {
            if (!validateFeedCurveItem(item)) {
              errorDays.push(item.day);
            }
          });
          if (errorDays.length) {
            $message.error(t("feed.curveConfigError.curveItemConfigError", { days: errorDays.join() }));
            return false;
          }
          return true;
        },
        getValues() {
          return { ...detail, curveName, curveData: feedCurveItems };
        },
      };
    }, [t, curveName, detail, feedCurveItems]);

    useImperativeHandle(ref, () => {
      return validation;
    });

    const editCurve = useCallback(() => {
      setEditMode(true);
    }, []);

    const cancelEdit = useCallback(() => {
      setEditMode(false);
      setFeedCurveItems([...(detail.curveData || [])]);
      setCurveName(detail.curveName || "");
      setSaveLoading(false);
    }, [detail]);

    const applyChange = useCallback(() => {
      if (validation.validate()) {
        feedController
          .modifyCurve(detail?.id, { curveData: feedCurveItems, curveName })
          .then(() => {
            reloadDetail().then(() => {
              setEditMode(false);
              setSaveLoading(false);
              $message.success("common.editSuccessed");
            });
          })
          .catch((err) => {
            setSaveLoading(false);
            handleResponseError(err);
          });
      }
    }, [curveName, reloadDetail, feedCurveItems, detail, validation]);

    const addRow = useCallback(() => {
      const currentIndex = feedCurveItems.length + 1;
      setFeedCurveItems([...feedCurveItems, new FeedCurveItemFactory(currentIndex)]);
    }, [feedCurveItems]);

    const deleteRow = useCallback(() => {
      setDeleteMode(true);
    }, []);

    const confirmDelete = useCallback(() => {
      setFeedCurveItems((prev) => {
        prev.pop();
        return [...prev];
      });
      setDeleteMode(false);
    }, []);

    const handleDoubleClick = useCallback(
      (item: FeedCurveItem, key: FeedCurveItemKey) => {
        editMode && setOnEditCell({ id: item.id, key });
      },
      [editMode]
    );

    const onInputChange = useCallback((e: ChangeEvent<HTMLInputElement>, curveItem: FeedCurveItem, key: FeedCurveItemKey) => {
      const value = e.target.value === "" ? undefined : Number(e.target.value);
      if (curveItem[key] === value) {
        return;
      }
      setFeedCurveItems((prev) =>
        prev.map((item) => {
          if (item.id === curveItem.id && item[key] !== value) {
            return { ...item, [key]: Math.floor(value) };
          }
          return item;
        })
      );
    }, []);

    const onCellBlur = useCallback(
      (curveItem: FeedCurveItem, key: FeedCurveItemKey) => {
        const foundItem = feedCurveItems.find((item) => item.id === curveItem.id);
        if (foundItem[key] < 0 || isNull(feedCurveItems.find((item) => item.id === curveItem.id)[key])) {
          setTimeout(() => {
            $message.error("feed.min0");
          }, 200);
          setFeedCurveItems((prev) =>
            prev.map((item) => {
              if (item.id === curveItem.id) {
                return { ...item, [key]: 0 };
              }
              return item;
            })
          );
        }
        setOnEditCell({ id: null, key: null });
      },
      [feedCurveItems]
    );

    const computedRowSx = useCallback(
      (item: FeedCurveItem) => {
        return {
          borderBottom: 1,
          height: 40,
          borderColor: other.divider,
          "&:hover": { bgcolor: primary.hoverBg },
        };
      },
      [primary, other]
    );

    const onNameChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
      setCurveName(event.target.value);
    }, []);

    return (
      <Box sx={{ pb: 3 }}>
        <Box sx={{ mb: 2.5, height: 56 }} className="flex-btw">
          {editMode && (
            <MatDebounceInput sx={{ maxWidth: 400 }} label="feed.curveName" placeholder="feed.curveNameHolder" onChange={onNameChange} value={curveName}></MatDebounceInput>
          )}
          {!editMode && <Typography color="text.secondary">{t("feed.cueveNameLabel", { name: detail?.curveName })}</Typography>}
          {showEditBtn && (
            <Box className="flex">
              {!editMode && (
                <Button onClick={editCurve} variant="contained">
                  {t("feed.editCurve")}
                </Button>
              )}
              {editMode && (
                <Fragment>
                  <Button onClick={cancelEdit} sx={{ mr: 2 }}>
                    {t("common.cancel")}
                  </Button>
                  <LoadingButton loading={saveLoading} sx={{ whiteSpace: "nowrap" }} onClick={applyChange} variant="contained">
                    {t("common.saveChange")}
                  </LoadingButton>
                </Fragment>
              )}
            </Box>
          )}
        </Box>
        <DisplayInfoCard title="device.feedCurve" showBorder={!editMode}>
          <Box id={chartId} sx={{ height: 280 }}></Box>
        </DisplayInfoCard>
        <DisplayInfoCard showBorder={!editMode} sx={{ mt: 3 }} title="feed.curveData">
          <Box sx={{ px: 3, mt: 2, maxHeight: 280, overflow: "auto" }}>
            <Box className="flex-evenly" sx={{ position: "sticky", top: 0, bgcolor: "#fff", zIndex: 8 }}>
              {tableHeadTitles.map((title) => (
                <Box sx={{ bgcolor: other.input, flex: 1, p: 1, borderRight: 2, borderRightColor: "#fff" }} key={title}>
                  <Typography color="text.secondary" textAlign="center">
                    {t("feed.labelWithTitles." + title)}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Box>
              {feedCurveItems.length > 0 &&
                feedCurveItems.map((item) => {
                  // 这是一行可编辑单元格
                  return (
                    <Box sx={computedRowSx(item)} key={item.id} className="flex-evenly pointer">
                      <Box className="flex" sx={{ bgcolor: other.input, p: 1.25, flex: 1, borderRight: 1, borderColor: other.divider }}>
                        <Typography>{item.day}</Typography>
                      </Box>
                      {curveItemKeys.map((key) => {
                        // 处于编辑模式并且双击了
                        const isCellEdit = editMode && item.id === onEditCell?.id && key === onEditCell.key;
                        return (
                          <Box
                            key={key}
                            onDoubleClick={() => handleDoubleClick(item, key)}
                            className="flex"
                            sx={{ p: 1.25, pb: isCellEdit ? 0 : 1.25, flex: 1, borderRight: 1, borderColor: other.divider }}
                          >
                            {isCellEdit && (
                              <MatDebounceInput
                                onChange={(e) => onInputChange(e, item, key)}
                                onBlur={() => onCellBlur(item, key)}
                                inputProps={{ type: "number", autoFocus: "autofocus", min: 100 }}
                                value={item[key]}
                              />
                            )}
                            {!isCellEdit && <Typography>{item[key]}</Typography>}
                          </Box>
                        );
                      })}
                    </Box>
                  );
                })}
              {!feedCurveItems.length && <EmptyData></EmptyData>}
            </Box>
          </Box>
        </DisplayInfoCard>
        {editMode && (
          <Box className="flex-btw" sx={{ my: 2, height: 40 }}>
            <Box>
              <MessageTip title="feed.dbClickTip"></MessageTip>
            </Box>
            <Box>
              {!deleteMode && (
                <Fragment>
                  <Button className="flex" onClick={addRow}>
                    {/* <Iconfont icon="ic_addgroup"></Iconfont> */}
                    <span>{t("feed.addNewTableRow")}</span>
                  </Button>
                  <Button disabled={!feedCurveItems.length} onClick={deleteRow} sx={{ ml: 2 }} color="error" className="flex">
                    {/* <Iconfont icon="ic_delete"></Iconfont> */}
                    <span>{t("feed.deleteTableRow")}</span>
                  </Button>
                </Fragment>
              )}
              {deleteMode && (
                <Box className="flex flex-nowrap">
                  <Typography sx={{ mr: 2 }}>{t("feed.deleteRowTitle")}</Typography>
                  <Iconfont pointer icon="ic_online" onClick={confirmDelete}></Iconfont>
                  <Iconfont onClick={() => setDeleteMode(false)} pointer icon="ic_offline"></Iconfont>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
    );
  })
);
