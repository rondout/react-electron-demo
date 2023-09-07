import { Box, Button, Typography, useTheme } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import pigController from "../../controllers/pig.controller";
import useDataFetch from "../../hooks/useDataFetch";
import { BaseNameData, OperationMenu, SortOrder } from "../../models/base.model";
import { createPigDetailOptionMenus, initActionDialogOpen, ModifyPigParams, PigAction, PigInfo, PigStatus } from "../../models/pig.model";
import { handleMultiRequestResponse, PageLink, PageLinkInterface, ResponseContent } from "../../models/request.model";
import { $deleteConfirm, commonPageSize, dateFormat, isNull } from "../../utils";
import MatDropdown from "../common/mui/MatDropdown";
import MatSearchInput from "../common/mui/MatSearchInput";
import CommonTable, { TableColumns, TableFilterColumns, TableOperationColumns, TableStickyColumns } from "../common/table/CommonTable";
import CustomLink from "../common/tools/CustomLink";
import Iconfont from "../common/tools/Iconfont";
import { PigStatusComponent } from "../common/tools/StatusDot";
// import PigNameCell from "./options/PigNameCell";
import PigActionsHandler from "./PigActionsHandler";
import PigCurveDayCell from "./PigCurveDayCell";

const pageSize = commonPageSize;

enum PigStateFilter {
  GESTATION,
  PARTURITION,
  OUT_PEN,
}

const pigStatusFilters = [
  new OperationMenu(null, "pig.statusLabel.ALL"),
  new OperationMenu(PigStateFilter.GESTATION, "pig.statusLabel.GESTATION"),
  new OperationMenu(PigStateFilter.PARTURITION, "pig.statusLabel.PARTURITION"),
  new OperationMenu(PigStateFilter.OUT_PEN, "pig.statusLabel.OUT_PEN"),
];

export default function PigList({ selectedGroup }: { selectedGroup: BaseNameData }) {
  const {
    commonBoxShadow,
    palette: { background, primary },
  } = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    data: pigData,
    loading,
    page,
    setPage,
    setPagelinkParams,
    pageLink,
    refresh,
  } = useDataFetch<ResponseContent<PigInfo>, PageLinkInterface>({
    fetchFn: pigController.getPigsByGroupId,
    pageLink: new PageLink(0, pageSize, null, undefined, undefined, (p) => !!p.groupId, { groupId: selectedGroup?.id, queryAssociatedEntities: true }),
  });
  const [onConfigPig, setOnConfgiPig] = useState<PigInfo>();
  const [selectedPigs, setSelectedPigs] = useState<PigInfo[]>([]);
  const [dialogCtrls, setDialogCtrls] = useState(new Map(initActionDialogOpen));
  const { pathname } = useLocation();
  // 判断是单个操作还是多选操作
  // const isMultipleOperation = useMemo(() => !onConfigPig, [onConfigPig]);

  const openAddDialog = useCallback(() => {
    setDialogCtrls((prev) => {
      prev.set(PigAction.ADD, true);
      return new Map(prev);
    });
  }, []);

  const onPigStatefilterChange = useCallback(
    (filter: PigStateFilter) => {
      switch (filter) {
        case null:
          // 如果筛选的是全部
          setPagelinkParams({ pageOffset: 0, inPen: null, pigState: null });
          break;
        case PigStateFilter.OUT_PEN:
          setPagelinkParams({ pageOffset: 0, inPen: false, pigState: null });
          //如果筛选的是离栏状态
          break;
        case PigStateFilter.PARTURITION:
          setPagelinkParams({ pageOffset: 0, inPen: true, pigState: PigStatus.PARTURITION });
          // 如果筛选的是分娩状态
          break;
        case PigStateFilter.GESTATION:
          setPagelinkParams({ pageOffset: 0, inPen: true, pigState: PigStatus.GESTATION });
          // 如果筛选的是妊娠状态
          break;
      }
    },
    [setPagelinkParams]
  );

  const refreshList = useCallback(
    (clearSelection: boolean = false, resetPage?: boolean) => {
      refresh(resetPage);
      clearSelection && setSelectedPigs([]);
    },
    [refresh]
  );

  const deletePigs = useCallback(
    (pigs = selectedPigs) => {
      $deleteConfirm({
        title: t("pig.deletePigTitle", { count: pigs.length }),
        content: t("pig.deletePigContent"),
        onOk() {
          const result = handleMultiRequestResponse(pigController.deletePigs(pigs), pigs.length);
          result.then((res) => {
            refreshList(true, true);
          });
        },
      });
    },
    [selectedPigs, t, refreshList]
  );

  useEffect(() => {
    if (selectedGroup?.id) {
      setSelectedPigs([]);
      setPagelinkParams({ pageOffset: 0, groupId: selectedGroup?.id });
    }
  }, [selectedGroup?.id, setPagelinkParams]);

  const onSearchChange = useCallback(
    (pigNumber: string) => {
      setPagelinkParams({ pageOffset: 0, pigNumber });
    },
    [setPagelinkParams]
  );

  const viewDeviceDetail = useCallback(
    (pig: PigInfo) => {
      navigate("/pig-management/" + pig.id);
    },
    [navigate]
  );

  const onOperation = useCallback(
    (action: PigAction, data?: PigInfo) => {
      setDialogCtrls((prev) => {
        prev.set(action, true);
        return new Map(prev);
      });
      // 后续通过判断onConfigData的值是否为空来判断是多选操作还是单选
      if (data) {
        setOnConfgiPig(data);
      } else {
        setOnConfgiPig(null);
      }
      const pigs = data ? [data] : selectedPigs;
      switch (action) {
        case PigAction.DELETE:
          deletePigs(pigs);
      }
    },
    [selectedPigs, deletePigs]
  );

  const onActionTriggered = useCallback(
    (action: PigAction) => {
      onOperation(action);
    },
    [onOperation]
  );

  const onActionDialogClose = useCallback(() => {
    setDialogCtrls(new Map(initActionDialogOpen));
  }, []);

  const onSortChange = useCallback(
    (direction: SortOrder, sortBy: string) => {
      setPagelinkParams({ direction, sortBy });
    },
    [setPagelinkParams]
  );

  const columns = useMemo<TableColumns<PigInfo>[]>(() => {
    return [
      new TableStickyColumns("left", "pigNumber", "pig.pigNumber", undefined, (data) => {
        return (
          <CustomLink showUnderline={false} sx={{ color: primary.main, cursor: "pointer" }} onClick={() => viewDeviceDetail(data)}>
            {data.pigNumber?.toString()}
          </CustomLink>
        );
      }),
      // new TableOperationColumns("name", "pig.pigName", undefined, undefined, (pig) => <PigNameCell pig={pig} />),
      new TableOperationColumns("days", "pig.days", undefined, undefined, (pig) => <PigCurveDayCell pig={pig} />),
      new TableColumns("curve", "pig.curveName", undefined, ({ additionalInfo, inPen, curveId }) => {
        // if (curveId && inPen) {
        return <CustomLink onClick={() => navigate("/feed-management/feed-curve/" + curveId)}>{additionalInfo?.associatedCurve?.curveName || "-"}</CustomLink>;
        // }
        // return "-";
      }),
      new TableColumns("plan", "pig.planName", undefined, ({ additionalInfo, inPen, planId }) => {
        // if (planId && inPen) {
        return <CustomLink onClick={() => navigate("/feed-management/feed-plan/" + planId)}>{additionalInfo?.associatedPlan?.planName || "-"}</CustomLink>;
        // }
        // return "-";
      }),
      new TableOperationColumns("strategyLevel", "pig.strategyLevel", undefined, undefined, ({ strategyLevel, inPen }) => (
        <Typography sx={{ pl: 2 }}>{isNull(strategyLevel) ? "-" : (strategyLevel * 100).toFixed() + "%"}</Typography>
      )),
      new TableColumns("curveStartDate", "pig.curveStartDate", 125, ({ inPen, curveStartDate }) => (inPen ? dateFormat(curveStartDate) : "-")),
      // new TableSortColumns("feedingStatus", "pig.feedingStatus", true, undefined, (pig) => {
      //   return <PigFeedingStatusComponent pig={pig} sx={{}} />;
      // }),
      new TableFilterColumns("pigState", "pig.pigState", pigStatusFilters, onPigStatefilterChange, (pig) => <PigStatusComponent sx={{ ml: 2 }} pig={pig} />),
      new TableColumns("devicePen", "device.devicePen", undefined, (pig) => {
        const penName = pig.additionalInfo?.associatedDevice?.attributes?.devicePen || "";
        const deviceSn = pig.additionalInfo?.associatedDevice?.sn || "";
        if (pig.inPen && pig.deviceId) {
          return (
            <CustomLink onClick={() => navigate("/device-management/" + pig.deviceId, { state: { fromUrl: pathname } })}>{pig.inPen ? `${penName} (${deviceSn})` : "-"}</CustomLink>
          );
        }
        return "-";
      }),
      new TableColumns("inPenTime", "pig.inPenTime", 125, ({ inPen, inPenTime }) => (inPen ? dateFormat(inPenTime) : "-")),
      new TableOperationColumns<PigInfo>(
        "operation",
        undefined,
        "right",
        80,
        (data) => (
          <Box sx={{ px: 1 }}>
            <MatDropdown<PigAction> sx={{ pl: 0.8 }} menus={createPigDetailOptionMenus(data)} onMenuClick={(action) => onOperation(action, data)}></MatDropdown>
          </Box>
        ),
        true
      ),
    ];
  }, [primary, viewDeviceDetail, onOperation, onPigStatefilterChange, navigate, pathname]);
  // 操作完成后需要更改猪只信息 以免影响到后续继续操作
  const afterPigActionOk = useCallback((changedIds: string[], param: ModifyPigParams) => {
    setSelectedPigs((prev) => {
      return prev.map((pig) => {
        if (changedIds.includes(pig.id)) {
          return { ...pig, ...param };
        }
        return pig;
      });
    });
  }, []);

  return (
    <Box
      sx={{ flex: 1, overflow: "auto", boxShadow: commonBoxShadow, height: 1, display: "flex", borderRadius: 2, bgcolor: background.default }}
      className="border-box flex-column"
    >
      <Box component={"header"} sx={{ minHeight: 64, px: 2 }} className="flex-btw">
        <Typography color="text.secondary">{selectedGroup?.name && t("pig.pigListTitle", { name: selectedGroup.name })}</Typography>
        <Box className="flex-end">
          {/* <PigSearchInput type={key} onTypeChange={onSearchKeyChange} value={textSearch} onChange={onSearchChange} placeholder={"device.holders." + key}></PigSearchInput> */}
          <MatSearchInput value={pageLink.pigNumber} onChange={onSearchChange} placeholder={"pig.holders.pigNumber"}></MatSearchInput>
          <Button sx={{ ml: 2 }} onClick={openAddDialog} variant="contained">
            {t("pig.addPig")}
          </Button>
          {/* <Button variant="contained" onClick={() => deletePigs()} disabled={!selectedPigs.length} color="error" sx={{ color: "#fff" }}>
            {t("pig.deletePig")}
          </Button> */}
          <MatDropdown<PigAction>
            disabled={!selectedPigs.length}
            // sx={{ mr: 2 }}
            trigger={
              <Button disabled={!selectedPigs.length} variant="contained">
                <span className="flex">
                  <span style={{ position: "relative", top: 0, paddingRight: 4 }}>{t("common.action")}</span>
                  <Iconfont icon="ic_arrowdown" style={{ transform: "scale(1.75)" }} fontSize={16} mr={0} />
                </span>
              </Button>
            }
            menus={createPigDetailOptionMenus()}
            onMenuClick={onActionTriggered}
          ></MatDropdown>
        </Box>
      </Box>
      <Box sx={{ px: 2, flex: 1, overflow: "auto" }}>
        <CommonTable
          selected={selectedPigs}
          onSelectChange={setSelectedPigs}
          selectDisableRule={(pig) => pig.pigState === PigStatus.OUT_PEN}
          loading={loading}
          onSortChange={onSortChange}
          sortBy="pigState"
          pageSize={pageSize}
          hideBoxShadow
          columns={columns}
          showSelect
          rows={pigData?.result}
          page={page}
          pageChange={setPage}
          total={pigData?.total}
        ></CommonTable>
      </Box>
      <PigActionsHandler
        onOk={afterPigActionOk}
        refreshList={refreshList}
        selectedPigs={selectedPigs}
        dialogCtrls={dialogCtrls}
        onConfigPig={onConfigPig}
        onClose={onActionDialogClose}
      />
    </Box>
  );
}
