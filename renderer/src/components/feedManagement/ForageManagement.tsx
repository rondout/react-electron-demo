import { Box, Typography, useTheme } from "@mui/material";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import feedController from "../../controllers/feed.controller";
import useDataFetch from "../../hooks/useDataFetch";
import { FeedForage } from "../../models/feeding.model";
import { handleResponseError, PageLink, PageLinkInterface, ResponseContent } from "../../models/request.model";
import { $message, commonPageSize, isNull } from "../../utils";
import MatSearchInput from "../common/mui/MatSearchInput";
import CommonTable, { TableColumns, TableDateColumns, TableOperationColumns, TableStickyColumns } from "../common/table/CommonTable";
import EditAbleCell from "../common/table/EditableCell";

const pageSize = commonPageSize;

export default function ForageManagement() {
  const {
    commonBoxShadow,
    palette: { background },
  } = useTheme();
  const { t } = useTranslation();
  const { data, loading, setPage, page, pageLink, setPagelinkParams, refresh } = useDataFetch<ResponseContent<FeedForage>, PageLinkInterface>({
    fetchFn: feedController.getForages,
    pageLink: new PageLink(0, pageSize),
  });

  const onSearchChange = useCallback(
    (forageName: string) => {
      setPagelinkParams({ forageName, pageOffset: 0 });
    },
    [setPagelinkParams]
  );

  const handleModifyForage = useCallback(
    (id: string, forageName: string) => {
      if (!forageName) {
        $message.error("feed.forageNameRequired");
        return;
      }
      const result = feedController.modifyForage(id, { forageName });
      result
        .then(() => {
          refresh();
        })
        .catch((err) => {
          handleResponseError(err);
        });
      return result;
    },
    [refresh]
  );

  const columns = useMemo<TableColumns<FeedForage>[]>(() => {
    const renderWithUnit = (data: number | string, unit: string) => <Typography sx={{ pl: 2 }}>{isNull(data) ? "-" : data + unit}</Typography>;
    return [
      new TableStickyColumns("left", "forageName", "feed.forageName", undefined, (forage) => {
        return <EditAbleCell onOk={(name) => handleModifyForage(forage.id, name)} name={forage.forageName}></EditAbleCell>;
      }),
      new TableOperationColumns("weight1", "feed.weight1", undefined, undefined, (forage) => renderWithUnit(forage.weight1, "g")),
      new TableOperationColumns("weight2", "feed.weight2", undefined, undefined, (forage) => renderWithUnit(forage.weight2, "g")),
      new TableOperationColumns("weight3", "feed.weight3", undefined, undefined, (forage) => renderWithUnit(forage.weight3, "g")),
      new TableOperationColumns("multiturn", "feed.multiturn", undefined, undefined, (forage) => renderWithUnit(forage.multiturn, t("feed.turn"))),
      new TableOperationColumns("ratio", "feed.ratio", undefined, undefined, (forage) => (isNull(forage.ratio) ? "-" : renderWithUnit(forage.ratio.toFixed(6), ""))),
      new TableDateColumns("createdTime", "common.reportTime", undefined, null),
    ];
  }, [t, handleModifyForage]);

  return (
    <Box sx={{ flex: 1, overflow: "auto", boxShadow: commonBoxShadow, height: 1, borderRadius: 2, bgcolor: background.default }} className="border-box">
      <Box component={"header"} sx={{ height: 64, px: 2 }} className="flex-btw">
        <Typography color="text.secondary">{t("feed.forageManagement")}</Typography>
        <Box className="flex-end">
          <MatSearchInput value={pageLink.forageName} onChange={onSearchChange} placeholder="feed.forageSearchHolder"></MatSearchInput>
        </Box>
      </Box>
      <Box sx={{ px: 2, height: "calc(100% - 64px)" }}>
        <CommonTable<FeedForage>
          sortBy="active"
          pageSize={pageSize}
          hideBoxShadow
          columns={columns}
          total={data?.total}
          page={page}
          pageChange={setPage}
          loading={loading}
          rows={data?.result}
        ></CommonTable>
      </Box>
    </Box>
  );
}
