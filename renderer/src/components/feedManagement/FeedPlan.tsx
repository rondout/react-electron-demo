import { Box, Button, Typography, useTheme } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import feedController from "../../controllers/feed.controller";
import useDataFetch from "../../hooks/useDataFetch";
import { OperationMenu } from "../../models/base.model";
import { FeedPlanAction, FeedPlanType } from "../../models/feeding.model";
import { handleMultiRequestResponse, handleResponseError, PageLink, PageLinkInterface, ResponseContent } from "../../models/request.model";
import { $confirm, $message, commonPageSize } from "../../utils";
import MatDropdown from "../common/mui/MatDropdown";
import MatSearchInput from "../common/mui/MatSearchInput";
import CommonTable, { TableColumns, TableDateColumns, TableOperationColumns, TableStickyColumns } from "../common/table/CommonTable";
import CustomLink from "../common/tools/CustomLink";
import PlanEditDrawer, { PlanEditMode } from "./config/PlanEditDrawer";

// 设备action列表
const actionOptions: OperationMenu<FeedPlanAction>[] = [
  new OperationMenu(FeedPlanAction.EDIT, "common.edit", "ic_start"),
  new OperationMenu(FeedPlanAction.COPY, "common.copy", "ic_forbid"),
  new OperationMenu(FeedPlanAction.DELETE, "common.delete", "ic_move"),
];

const createDetailOptionMenus = (planInfo: FeedPlanType) => {
  return actionOptions;
};

const pageSize = commonPageSize;

export default function FeedPlan() {
  const {
    commonBoxShadow,
    palette: { background, primary },
  } = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [copyDrawerOpen, setCopyDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [selectedPlans, setSelectedPlans] = useState<FeedPlanType[]>([]);
  const [onConfigDetails, setOnConfigDetails] = useState<FeedPlanType>();
  const { loading, data, page, setPage, refresh, pageLink, setPagelinkParams } = useDataFetch<ResponseContent<FeedPlanType>, PageLinkInterface>({
    fetchFn: feedController.getFeedPlans,
    pageLink: new PageLink(0, pageSize),
  });

  const onSearchChange = useCallback(
    (planName: string) => {
      setPagelinkParams({ planName, pageOffset: 0 });
    },
    [setPagelinkParams]
  );

  const viewPlanDetail = useCallback(
    (plan: FeedPlanType) => {
      navigate("/feed-management/feed-plan/" + plan.id);
    },
    [navigate]
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

  const handleDeleteSinglePlan = useCallback(
    (plan: FeedPlanType) => {
      $confirm({
        title: t("feed.singleDeletePlanTitle", { name: plan.planName }),
        content: "common.deleteContent",
        okBtnType: "error",
        okText: "common.delete",
        onOk() {
          const result = feedController.deletePlan(plan.id);
          result
            .then(() => {
              $message.success("common.deleteSuccessed");
              refresh(true);
              setSelectedPlans((prev) => prev.filter((p) => p.id !== plan.id));
            })
            .catch(handleResponseError);
          return result;
        },
      });
    },
    [t, refresh]
  );

  const handleDeletePlans = useCallback(() => {
    $confirm({
      title: t("feed.deletePlanTitle", { count: selectedPlans.length }),
      content: "common.deleteContent",
      okBtnType: "error",
      okText: "common.delete",
      onOk() {
        const result = handleMultiRequestResponse(feedController.deletePlans(selectedPlans), selectedPlans.length);
        result
          .then((res) => {
            refresh && refresh(true);
            setSelectedPlans((prev) => prev.filter((p) => !res.successedIds.includes(p.id)));
          })
          .catch((err) => {});
        return result;
        // return new Promise<void>((resolve, reject) => {
        //   result
        //     .then((res) => {
        //       const { success, reason, successedIds } = handleMultiRequestResponse(res, selectedPlans.length);
        //       setSelectedPlans((prev) => prev.filter((p) => !successedIds.includes(p.id)));
        //       switch (success) {
        //         case "all":
        //           // 如果全部成功
        //           $message.success("common.operateSuccessed");
        //           refresh && refresh(true);
        //           resolve();
        //           break;
        //         case "part":
        //           // 如果部分成功
        //           $message.error(t("common.operatePartlySuccessed", { reason: reason }));
        //           refresh && refresh(true);
        //           resolve();
        //           break;
        //         case "false":
        //           // 如果全部失败
        //           $message.error(t("common.operateAllFailed", { reason: reason }));
        //           reject();
        //           break;
        //       }
        //       // 如果全部成功
        //       // $message.success("common.deleteSuccessed");
        //       // refresh(true);
        //       // setSelectedPlan((prev) => prev.filter((c) => !ids.includes(c.id)));
        //     })
        //     .catch((err) => {
        //       console.log(err);
        //     });
        // });
      },
    });
  }, [selectedPlans, t, refresh]);

  const onOperation = useCallback(
    (action: FeedPlanAction, data: FeedPlanType) => {
      setOnConfigDetails(data);
      switch (action) {
        case FeedPlanAction.COPY:
          Promise.resolve().then(() => {
            setCopyDrawerOpen(true);
          });
          break;
        case FeedPlanAction.DELETE:
          handleDeleteSinglePlan(data);
          break;
        case FeedPlanAction.EDIT:
          Promise.resolve().then(() => {
            setEditDrawerOpen(true);
          });
          break;
      }
    },
    [handleDeleteSinglePlan]
  );

  const columns = useMemo<TableColumns<FeedPlanType>[]>(() => {
    return [
      new TableStickyColumns("left", "name", "feed.planName", undefined, (data) => {
        return (
          <CustomLink showUnderline={false} sx={{ color: primary.main, cursor: "pointer" }} onClick={() => viewPlanDetail(data)}>
            {data.planName?.toString()}
          </CustomLink>
        );
      }),
      new TableOperationColumns("stage", "feed.feedStage", undefined, undefined, (plan) => (
        <Box component={"span"} sx={{ pl: 2 }}>
          {plan.planData?.length + " " + t("feed.stage")}
        </Box>
      )),
      new TableDateColumns("updatedTime", "common.updatedTime", undefined, null),
      new TableOperationColumns<FeedPlanType>(
        "operation",
        undefined,
        "right",
        80,
        (data) => (
          <Box sx={{ px: 1 }}>
            <MatDropdown<FeedPlanAction> sx={{ pl: 0.8 }} menus={createDetailOptionMenus(data)} onMenuClick={(action) => onOperation(action, data)}></MatDropdown>
          </Box>
        ),
        true
      ),
    ];
  }, [primary, viewPlanDetail, onOperation, t]);

  return (
    <Box sx={{ flex: 1, overflow: "auto", boxShadow: commonBoxShadow, height: 1, borderRadius: 2, bgcolor: background.default }} className="border-box">
      <Box component={"header"} sx={{ height: 64, px: 2 }} className="flex-btw">
        <Typography color="text.secondary">{t("feed.feedPlan")}</Typography>
        <Box className="flex-end">
          <MatSearchInput value={pageLink.planName} onChange={onSearchChange} placeholder="feed.planSearchHolder"></MatSearchInput>
          <Button variant="contained" onClick={() => setCreateDrawerOpen(true)} sx={{ mx: 2 }}>
            {t("feed.addPlan")}
          </Button>
          <Button variant="contained" onClick={handleDeletePlans} disabled={!selectedPlans.length} color="error" sx={{ color: "#fff" }}>
            {t("feed.deletePlan")}
          </Button>
        </Box>
      </Box>
      <Box sx={{ px: 2, height: "calc(100% - 64px)" }}>
        <CommonTable<FeedPlanType>
          selected={selectedPlans}
          onSelectChange={setSelectedPlans}
          sortBy="stage"
          pageSize={pageSize}
          hideBoxShadow
          columns={columns}
          showSelect
          loading={loading}
          page={page}
          total={data?.total}
          pageChange={setPage}
          rows={data?.result}
        ></CommonTable>
      </Box>
      <PlanEditDrawer onOk={refresh} configMode={PlanEditMode.CREATE} open={createDrawerOpen} closeDrawer={closeCreateDrawer}></PlanEditDrawer>
      <PlanEditDrawer onOk={refresh} configMode={PlanEditMode.COPY} details={onConfigDetails} open={copyDrawerOpen} closeDrawer={closeCopyDrawer}></PlanEditDrawer>
      <PlanEditDrawer onOk={refresh} configMode={PlanEditMode.EDIT} details={onConfigDetails} open={editDrawerOpen} closeDrawer={closeEditDrawer}></PlanEditDrawer>
    </Box>
  );
}
