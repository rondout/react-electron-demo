import { Box, Button, Tab, Tabs } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import pigController from "../../../controllers/pig.controller";
import { createPigDetailOptionMenus, initActionDialogOpen, PigAction, PigInfo } from "../../../models/pig.model";
import { handleResponseError } from "../../../models/request.model";
import { $deleteConfirm, $message } from "../../../utils";
import MatDropdown from "../../common/mui/MatDropdown";
import EmptyData from "../../common/table/EmptyData";
import CommonLoading from "../../common/tools/CommonLoading";
import Iconfont from "../../common/tools/Iconfont";
import PigActionsHandler from "../PigActionsHandler";
import PigActionLogs from "./PigActionLogs";
import PigDetailInfo from "./PigDetailInfo";

enum PigDetailTab {
  DETAIL,
  ACTION_LOG,
}

export default function PigDetail() {
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState(PigDetailTab.DETAIL);
  const [pigInfo, setPigInfo] = useState<PigInfo>(null);
  const [loading, setLoading] = useState(true);
  const [dialogCtrls, setDialogCtrls] = useState(new Map(initActionDialogOpen));
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const getPigDetails = useCallback(() => {
    setLoading(true);
    pigController
      .getPigDetailsById(id)
      .then((res) => {
        setLoading(false);
        setPigInfo(res);
      })
      .catch((err) => {
        handleResponseError(err);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    getPigDetails();
  }, [getPigDetails]);

  const handleChange = useCallback((e: any, value: PigDetailTab) => {
    setCurrentTab(value);
  }, []);

  const handleAction = useCallback(
    (action: PigAction) => {
      if (action === PigAction.DELETE) {
        $deleteConfirm({
          title: t("pig.deleteOnePigTitle"),
          content: t("pig.deletePigContent"),
          onOk() {
            const result = pigController
              .deletePig(pigInfo.id)
              .then((res) => {
                $message.success("common.deleteSuccessed");
                navigate("/pig-management");
              })
              .catch(handleResponseError);
            return result;
          },
        });
      } else {
        setDialogCtrls((prev) => {
          prev.set(action, true);
          return new Map(prev);
        });
      }
    },
    [navigate, t, pigInfo]
  );

  const onActionDialogClose = useCallback(() => {
    setDialogCtrls(new Map(initActionDialogOpen));
  }, []);

  if (loading) {
    return <CommonLoading></CommonLoading>;
  }

  if (!pigInfo) {
    return <EmptyData />;
  }

  return (
    <Box sx={{ height: 1 }} className="border-box flex flex-column items-start">
      <Box className="flex-btw border-box" sx={{ p: 2, width: 1 }}>
        <Tabs variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile value={currentTab} onChange={handleChange} aria-label="basic tabs example">
          <Tab value={PigDetailTab.DETAIL} label={t("pig.pigDetail")} />
          <Tab value={PigDetailTab.ACTION_LOG} label={t("pig.actionLog")} />
        </Tabs>
        {currentTab === PigDetailTab.DETAIL && (
          <Box className="flex">
            {/* <Button variant="contained">{t("pig.editPigInfo")}</Button> */}
            <MatDropdown<PigAction>
              sx={{ mr: 2 }}
              trigger={
                <Button variant="contained">
                  <span className="flex">
                    <span style={{ position: "relative", top: 0, paddingRight: 4 }}>{t("common.action")}</span>
                    <Iconfont icon="ic_arrowdown" style={{ transform: "scale(1.75)" }} fontSize={16} mr={0} />
                  </span>
                </Button>
              }
              menus={createPigDetailOptionMenus(pigInfo)}
              onMenuClick={handleAction}
            ></MatDropdown>
          </Box>
        )}
      </Box>
      {currentTab === PigDetailTab.DETAIL && (
        <Box sx={{ p: 2, pt: 1, overflow: "auto", flex: 1, width: 1 }} className="border-box">
          {/* <Box sx={{ height: 1, bgcolor: "#fff", overflow: "auto" }}> */}
          <Box sx={{ bgcolor: "#fff", borderRadius: 2 }}>
            <PigDetailInfo detail={pigInfo}></PigDetailInfo>
          </Box>
        </Box>
      )}
      {currentTab === PigDetailTab.ACTION_LOG && (
        <Box sx={{ overflow: "auto", width: 1, flex: 1, p: 2, pt: 1 }} className="border-box">
          <PigActionLogs pigNumber={pigInfo?.pigNumber}></PigActionLogs>
        </Box>
      )}
      <PigActionsHandler onOk={getPigDetails} dialogCtrls={dialogCtrls} onConfigPig={pigInfo} onClose={onActionDialogClose} />
    </Box>
  );
}
