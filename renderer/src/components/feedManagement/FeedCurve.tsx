import { Box, Button, Typography, useTheme } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import feedController from "../../controllers/feed.controller";
import useDataFetch from "../../hooks/useDataFetch";
import { OperationMenu } from "../../models/base.model";
import { FeedCurveAction, FeedCurveType } from "../../models/feeding.model";
import { handleMultiRequestResponse, handleResponseError, PageLink, PageLinkInterface, ResponseContent } from "../../models/request.model";
import { $confirm, $message, commonPageSize } from "../../utils";
import MatDropdown from "../common/mui/MatDropdown";
import MatSearchInput from "../common/mui/MatSearchInput";
import CommonTable, { TableColumns, TableDateColumns, TableOperationColumns, TableStickyColumns } from "../common/table/CommonTable";
import CustomLink from "../common/tools/CustomLink";
import CurveEditDrawer, { CurveEditMode } from "./config/CurveEditDrawer";

// 设备action列表
const actionOptions: OperationMenu<FeedCurveAction>[] = [
  new OperationMenu(FeedCurveAction.EDIT, "common.edit", "ic_start"),
  new OperationMenu(FeedCurveAction.COPY, "common.copy", "ic_forbid"),
  new OperationMenu(FeedCurveAction.DELETE, "common.delete", "ic_move"),
];

const createDetailOptionMenus = (curveInfo: FeedCurveType) => {
  return actionOptions;
};

const pageSize = commonPageSize;

export default function FeedCurve() {
  const {
    commonBoxShadow,
    palette: { background, primary },
  } = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [onConfigDetails, setOnConfigDetails] = useState<FeedCurveType>();
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [copyDrawerOpen, setCopyDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [selectedCurve, setSelectedCurve] = useState<FeedCurveType[]>([]);
  // const [loading]
  const { data, loading, setPage, page, refresh, pageLink, setPagelinkParams } = useDataFetch<ResponseContent<FeedCurveType>, PageLinkInterface>({
    fetchFn: feedController.getFeedCurves,
    pageLink: new PageLink(0, pageSize),
  });

  const onSearchChange = useCallback(
    (curveName: string) => {
      setPagelinkParams({ curveName, pageOffset: 0 });
    },
    [setPagelinkParams]
  );

  const viewCurveDetail = useCallback(
    (curve: FeedCurveType) => {
      navigate("/feed-management/feed-curve/" + curve.id);
    },
    [navigate]
  );

  const handleDeleteSingleCurve = useCallback(
    (curve: FeedCurveType) => {
      $confirm({
        title: t("feed.singleDeleteCurveTitle", { name: curve.curveName }),
        content: "common.deleteContent",
        okBtnType: "error",
        okText: "common.delete",
        onOk() {
          const result = feedController.deleteCurve(curve.id);
          result
            .then(() => {
              $message.success("common.deleteSuccessed");
              refresh(true);
              setSelectedCurve((prev) => prev.filter((c) => c.id !== curve.id));
            })
            .catch(handleResponseError);
          return result;
        },
      });
    },
    [t, refresh]
  );

  const onOperation = useCallback(
    (action: FeedCurveAction, data: FeedCurveType) => {
      setOnConfigDetails(data);
      switch (action) {
        case FeedCurveAction.COPY:
          Promise.resolve().then(() => {
            setCopyDrawerOpen(true);
          });
          break;
        case FeedCurveAction.DELETE:
          handleDeleteSingleCurve(data);
          break;
        case FeedCurveAction.EDIT:
          Promise.resolve().then(() => {
            setEditDrawerOpen(true);
          });
          break;
      }
    },
    [handleDeleteSingleCurve]
  );

  const closeCreateDrawer = useCallback(() => {
    setCreateDrawerOpen(false);
  }, []);

  const closeCopyDrawer = useCallback(() => {
    setCopyDrawerOpen(false);
  }, []);

  const closeEditDrawer = useCallback(() => {
    setEditDrawerOpen(false);
  }, []);

  const handleDeleteCurves = useCallback(() => {
    $confirm({
      title: t("feed.deleteCurveTitle", { count: selectedCurve.length }),
      content: "common.deleteContent",
      okBtnType: "error",
      okText: "common.delete",
      onOk() {
        const result = handleMultiRequestResponse(feedController.deleteCurves(selectedCurve), selectedCurve.length);
        result
          .then((res) => {
            refresh && refresh(true);
            setSelectedCurve((prev) => prev.filter((p) => !res.successedIds.includes(p.id)));
          })
          .catch((err) => {});
        return result;
      },
    });
  }, [selectedCurve, t, refresh]);

  const columns = useMemo<TableColumns<FeedCurveType>[]>(() => {
    return [
      new TableStickyColumns("left", "curveName", "feed.curveName", undefined, (data) => {
        return (
          <CustomLink showUnderline={false} sx={{ color: primary.main, cursor: "pointer" }} onClick={() => viewCurveDetail(data)}>
            {data.curveName?.toString()}
          </CustomLink>
        );
      }),
      new TableOperationColumns("days", "feed.curveDays", undefined, undefined, (curve) => (
        <Box component={"span"} sx={{ pl: 2 }}>
          {curve.curveData.length + " " + t("feed.day")}
        </Box>
      )),
      new TableDateColumns("updatedTime", "common.updatedTime", undefined, null),
      new TableOperationColumns<FeedCurveType>(
        "operation",
        undefined,
        "right",
        80,
        (data) => (
          <Box sx={{ px: 1 }}>
            <MatDropdown<FeedCurveAction> sx={{ pl: 0.8 }} menus={createDetailOptionMenus(data)} onMenuClick={(action) => onOperation(action, data)}></MatDropdown>
          </Box>
        ),
        true
      ),
    ];
  }, [primary, viewCurveDetail, onOperation, t]);

  return (
    <Box sx={{ flex: 1, overflow: "auto", boxShadow: commonBoxShadow, height: 1, borderRadius: 2, bgcolor: background.default }} className="border-box">
      <Box component={"header"} sx={{ height: 64, px: 2 }} className="flex-btw">
        <Typography color="text.secondary">{t("feed.feedCurve")}</Typography>
        <Box className="flex-end">
          <MatSearchInput value={pageLink.curveName} onChange={onSearchChange} placeholder="feed.curveSearchHolder"></MatSearchInput>
          <Button variant="contained" onClick={() => setCreateDrawerOpen(true)} sx={{ mx: 2 }}>
            {t("feed.addCurve")}
          </Button>
          <Button disabled={!selectedCurve.length} onClick={handleDeleteCurves} variant="contained" color="error" sx={{ color: "#fff" }}>
            {t("feed.deleteCurve")}
          </Button>
        </Box>
      </Box>
      <Box sx={{ px: 2, height: "calc(100% - 64px)" }}>
        <CommonTable<FeedCurveType>
          selected={selectedCurve}
          onSelectChange={setSelectedCurve}
          sortBy="active"
          pageSize={pageSize}
          hideBoxShadow
          columns={columns}
          total={data?.total}
          page={page}
          showSelect
          pageChange={setPage}
          loading={loading}
          rows={data?.result}
        ></CommonTable>
      </Box>
      <CurveEditDrawer configMode={CurveEditMode.CREATE} open={createDrawerOpen} onOk={refresh} closeDrawer={closeCreateDrawer}></CurveEditDrawer>
      <CurveEditDrawer configMode={CurveEditMode.COPY} details={onConfigDetails} onOk={refresh} open={copyDrawerOpen} closeDrawer={closeCopyDrawer}></CurveEditDrawer>
      <CurveEditDrawer configMode={CurveEditMode.EDIT} details={onConfigDetails} onOk={refresh} open={editDrawerOpen} closeDrawer={closeEditDrawer}></CurveEditDrawer>
    </Box>
  );
}
