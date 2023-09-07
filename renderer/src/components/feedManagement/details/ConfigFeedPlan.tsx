import { Box, Button, debounce, Typography, useTheme } from "@mui/material";
import { forwardRef, Fragment, memo, Ref, useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useChart, { ECOption } from "../../../hooks/useChart";
import {
  FeedPlanType,
  FeedPlanItem,
  FeedPlanItemFactory,
  FeedPlanItemKey,
  validateFeedPlanItemData,
  feedPlanSelectOptions,
  feedPlanIntervalSelectOptions,
  validateFeedPlanItemTime,
} from "../../../models/feeding.model";
import DisplayInfoCard from "../../common/tools/DisplayInfoCard";
import Iconfont from "../../common/tools/Iconfont";
import { ChangeEvent } from "react";
import { $message, isNull } from "../../../utils";
import MessageTip from "../../common/tools/MessageTip";
import MatDebounceInput from "../../common/mui/MatDebounceInput";
import EmptyData from "../../common/table/EmptyData";
import MatSelect from "../../common/mui/MatSelect";
import feedController from "../../../controllers/feed.controller";
import { handleResponseError } from "../../../models/request.model";

const defaultChartId = "feed-plan-detail-id";

interface ConfigFeedPlanProps {
  detail: FeedPlanType;
  reloadDetail?(): Promise<void>;
  chartId?: string;
  editMode?: boolean;
  showEditBtn?: boolean;
}

export interface ConfigFeedPlanRef {
  validate(): boolean;
  getValues(): FeedPlanType;
}

const planItemKeys: FeedPlanItemKey[] = ["startTime", "endTime", "timeInterval", "touchWeight", "touchInterval", "percent"];

const tableHeadTitles = ["stage", "startTime", "endTime", "timeInterval", "touchWeight", "touchInterval", "percent"];

const selectEditModeKeys: FeedPlanItemKey[] = ["startTime", "endTime"];

export default memo(
  forwardRef(function ConfigFeedPlan(props: ConfigFeedPlanProps, ref: Ref<ConfigFeedPlanRef>) {
    const { chartId = defaultChartId, detail, showEditBtn = true, reloadDetail = () => Promise.resolve() } = props;
    const { t } = useTranslation();
    const { setOption } = useChart({ id: chartId });
    const {
      palette: { primary, secondary1, other },
    } = useTheme();
    const [deleteMode, setDeleteMode] = useState(false);
    const [editMode, setEditMode] = useState(props.editMode);
    const [planName, setPlanName] = useState<string>(detail.planName || "");
    const [feedPlanItems, setFeedPlanItems] = useState<FeedPlanItem[]>([...(detail?.planData || [])]);
    //   const [selectedRow, setSelectedRow] = useState<FeedPlanItem>();
    const [onEditCell, setOnEditCell] = useState<{ id: string; key: FeedPlanItemKey }>({ id: null, key: null });

    const chartOption: ECOption = useMemo(() => {
      const xAxisData = [];
      const seriesData: number[] = [];
      feedPlanItems.forEach((item) => {
        xAxisData.push(t("feed.stage") + item.stage + ": " + item.startTime + "-" + item.endTime);
        seriesData.push(item.percent);
      });
      return {
        xAxis: {
          type: "category",
          data: xAxisData,
        },
        grid: {
          left: 45,
          bottom: 25,
          right: 40,
        },
        legend: {},
        yAxis: {
          type: "value",
          axisLabel: {
            formatter: "{value} %",
          },
        },
        tooltip: {},
        series: [
          {
            name: t("feed.stageBaitPercent"),
            data: seriesData,
            type: "bar",
            itemStyle: { color: secondary1.outlined },
            barWidth: 40,
          },
        ],
      };
    }, [feedPlanItems, t, secondary1]);

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
          // 如果一条饲喂计划数据都没有
          if (!feedPlanItems.length) {
            $message.error("feed.planConfigError.needPlanItem");
            return false;
          }
          // 如果没有输入思维计划的名称
          if (!planName) {
            $message.error("feed.planConfigError.needPlanName");
            return false;
          }
          // 判断百分比加起来是否等于100
          const percentResult = feedPlanItems.reduce((p, currentValue) => {
            return p + currentValue.percent;
          }, 0);
          // 如果百分比加起来不是百分百则报错
          if (percentResult !== 100) {
            $message.error("feed.planConfigError.percent");
            return false;
          }
          // 判断每条饲喂计划数据是否满足开始时间小于结束时间且百分比在大于0的校验规则
          const invalidTimeAndPercentItems: number[] = [];
          // 判断每个阶段的开始时间是否大于等于上一个阶段的结束时间并且
          const startTimeLessThanLastEndTimeStages: number[] = [];
          feedPlanItems?.forEach((item, index) => {
            if (!validateFeedPlanItemData(item)) {
              invalidTimeAndPercentItems.push(item.stage);
            }
            if (!validateFeedPlanItemTime(item, feedPlanItems[index - 1])) {
              startTimeLessThanLastEndTimeStages.push(item.stage);
            }
          });
          // 如果有不满足开始时间小于结束时间且百分比在大于0的校验规则的饲喂计划数据
          if (invalidTimeAndPercentItems.length) {
            $message.error(t("feed.planConfigError.planItemConfigError", { stages: invalidTimeAndPercentItems.join() }));
            return false;
          }
          // 如果有不满足该阶段开始时间大于等于前一阶段结束时间的规则的计划数据
          if (startTimeLessThanLastEndTimeStages.length) {
            $message.error(t("feed.planConfigError.planItemConfigTimeError", { stages: startTimeLessThanLastEndTimeStages.join() }));
            return false;
          }
          return true;
        },
        getValues() {
          return { ...detail, planName, planData: feedPlanItems };
        },
      };
    }, [t, feedPlanItems, detail, planName]);

    useImperativeHandle(ref, () => {
      return validation;
    });

    const editPlan = useCallback(() => {
      setEditMode(true);
    }, []);

    const cancelEdit = useCallback(() => {
      setEditMode(false);
      setFeedPlanItems([...(detail.planData || [])]);
      setPlanName(detail.planName || "");
    }, [detail]);

    const applyChange = useCallback(() => {
      if (validation.validate()) {
        feedController
          .modifyPlan(detail?.id, validation.getValues())
          .then(() => {
            reloadDetail().then(() => {
              setEditMode(false);
              $message.success("common.editSuccessed");
            });
          })
          .catch(handleResponseError);
      }
    }, [validation, detail, reloadDetail]);

    const addRow = useCallback(() => {
      const currentIndex = feedPlanItems.length;
      setFeedPlanItems([...feedPlanItems, new FeedPlanItemFactory(currentIndex + 1)]);
    }, [feedPlanItems]);

    const deleteRow = useCallback(() => {
      setDeleteMode(true);
    }, []);

    const confirmDelete = useCallback(() => {
      setFeedPlanItems((prev) => {
        prev.pop();
        return [...prev];
      });
      setDeleteMode(false);
    }, []);

    const handleDoubleClick = useCallback(
      (item: FeedPlanItem, key: FeedPlanItemKey) => {
        editMode && setOnEditCell({ id: item.id, key });
      },
      [editMode]
    );

    const onInputChange = useCallback((e: ChangeEvent<HTMLInputElement>, planItem: FeedPlanItem, key: FeedPlanItemKey, isNumber?: boolean) => {
      const value = isNumber ? Number(e.target.value) : e.target.value;
      if (planItem[key] === value) {
        return;
      }
      setFeedPlanItems((prev) =>
        prev.map((item) => {
          if (item.id === planItem.id && item[key] !== value) {
            if (isNumber) {
              return { ...item, [key]: Math.floor(value as number) };
            } else {
              return { ...item, [key]: value };
            }
          }
          return item;
        })
      );
    }, []);

    const onCellBlur = useCallback(
      (planItem: FeedPlanItem, key: FeedPlanItemKey) => {
        const foundItem = feedPlanItems.find((item) => item.id === planItem.id);
        if (foundItem[key] < 0 || isNull(feedPlanItems.find((item) => item.id === planItem.id)[key])) {
          setTimeout(() => {
            $message.error("feed.startTime0");
          }, 200);
          setFeedPlanItems((prev) =>
            prev.map((item) => {
              if (item.id === planItem.id) {
                return { ...item, [key]: 0 };
              }
              return item;
            })
          );
        }
        setOnEditCell({ id: null, key: null });
      },
      [feedPlanItems]
    );

    const computedRowSx = useCallback(
      (item: FeedPlanItem) => {
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
      setPlanName(event.target.value);
    }, []);

    return (
      <Box sx={{ pb: 3 }}>
        <Box sx={{ mb: 2.5, height: 56 }} className="flex-btw">
          {editMode && (
            <MatDebounceInput sx={{ maxWidth: 400 }} label="feed.planName" placeholder="feed.planNameHolder" onChange={onNameChange} value={planName}></MatDebounceInput>
          )}
          {!editMode && <Typography color="text.secondary">{t("feed.planNameLabel", { name: detail?.planName })}</Typography>}
          {showEditBtn && (
            <Box className="flex">
              {!editMode && (
                <Button onClick={editPlan} variant="contained">
                  {t("feed.editPlan")}
                </Button>
              )}
              {editMode && (
                <Fragment>
                  <Button onClick={cancelEdit} sx={{ mr: 2 }}>
                    {t("common.cancel")}
                  </Button>
                  <Button sx={{ whiteSpace: "nowrap" }} onClick={applyChange} variant="contained">
                    {t("common.saveChange")}
                  </Button>
                </Fragment>
              )}
            </Box>
          )}
        </Box>
        <DisplayInfoCard title="device.feedPlan">
          <Box id={chartId} sx={{ height: 280 }}></Box>
        </DisplayInfoCard>
        <DisplayInfoCard sx={{ mt: 3 }} title="feed.planData">
          <Box sx={{ px: 3, mt: 1, maxHeight: 280, overflow: "auto" }}>
            <Box className="flex-evenly" sx={{ position: "sticky", top: 0, bgcolor: "#fff", zIndex: 8 }}>
              {tableHeadTitles.map((title) => (
                <Box sx={{ bgcolor: other.input, flex: 1, p: 1, borderRight: 2, borderRightColor: "#fff" }} key={title}>
                  <Typography color="text.secondary" textAlign="center">
                    {t("feed." + title)}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Box>
              {feedPlanItems.length > 0 &&
                feedPlanItems.map((item) => {
                  // 这是一行可编辑单元格
                  return (
                    <Box sx={computedRowSx(item)} key={item.id} className="flex-evenly pointer">
                      <Box className="flex" sx={{ bgcolor: other.input, p: 1.25, flex: 1, borderRight: 1, borderColor: other.divider }}>
                        <Typography>{item.stage}</Typography>
                      </Box>
                      {planItemKeys.map((key) => {
                        // 处于编辑模式并且双击了
                        const isCellEdit = editMode && item.id === onEditCell?.id && key === onEditCell.key;
                        const isIntervalSelect = ["timeInterval", "touchInterval"].includes(key);
                        return (
                          <Box
                            key={key}
                            onDoubleClick={() => handleDoubleClick(item, key)}
                            className="flex"
                            sx={{ p: 1.25, pb: isCellEdit ? 0 : 1.25, flex: 1, borderRight: 1, borderColor: other.divider }}
                          >
                            {isCellEdit && selectEditModeKeys.includes(key) && (
                              <MatSelect
                                sx={{ "& .MuiInputBase-root": { mt: 0 } }}
                                options={feedPlanSelectOptions}
                                onChange={(e) => onInputChange(e, item, key)}
                                onBlur={() => onCellBlur(item, key)}
                                inputProps={{ autoFocus: "autofocus" }}
                                value={item[key]}
                              />
                            )}
                            {isCellEdit && isIntervalSelect && (
                              <MatSelect
                                sx={{ "& .MuiInputBase-root": { mt: 0 } }}
                                options={feedPlanIntervalSelectOptions}
                                onChange={(e) => onInputChange(e, item, key)}
                                onBlur={() => onCellBlur(item, key)}
                                inputProps={{ autoFocus: "autofocus" }}
                                value={item[key]}
                              />
                            )}
                            {isCellEdit && !selectEditModeKeys.includes(key) && !isIntervalSelect && (
                              <MatDebounceInput
                                onChange={(e) => onInputChange(e, item, key, true)}
                                onBlur={() => onCellBlur(item, key)}
                                inputProps={{ type: "number", autoFocus: "autofocus", min: 0 }}
                                value={item[key]}
                              />
                            )}
                            {!isCellEdit && <Typography>{isIntervalSelect ? item[key] + " min" : item[key]}</Typography>}
                          </Box>
                        );
                      })}
                    </Box>
                  );
                })}
              {!feedPlanItems.length && <EmptyData></EmptyData>}
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
                  <Button disabled={!feedPlanItems.length} onClick={deleteRow} sx={{ ml: 2 }} color="error" className="flex">
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
