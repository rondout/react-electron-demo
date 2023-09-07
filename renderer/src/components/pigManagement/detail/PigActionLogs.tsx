import { Box, Divider, Pagination, Typography } from "@mui/material";
import { Fragment, useMemo } from "react";
import { useTranslation } from "react-i18next";
import userController from "../../../controllers/user.controller";
import useDataFetch from "../../../hooks/useDataFetch";
import { AuditLogInfo, pigActionLabelMap } from "../../../models/pig.model";
import { GetAuditLogPageLink } from "../../../models/request.model";
import { timeFormat } from "../../../utils";
import EmptyData from "../../common/table/EmptyData";
import TableLoading from "../../common/table/TableLoading";
import CommonLoading from "../../common/tools/CommonLoading";
import Iconfont from "../../common/tools/Iconfont";

const pageSize = 10;

export default function PigActionLogs({ pigNumber }: { pigNumber: string }) {
  const { data, loading, page, setPage } = useDataFetch({
    fetchFn: userController.getAuditLogs,
    pageLink: new GetAuditLogPageLink(0, pageSize, { "associatedPig.pigNumber": pigNumber }),
  });
  const { t } = useTranslation();

  const content: AuditLogInfo[] = useMemo(() => data?.result || [], [data]);

  if (loading) {
    return <CommonLoading />;
  }

  if (!data?.total) {
    return <EmptyData />;
  }

  return (
    <Box sx={{ bgcolor: "#fff", height: 1, pt: 0.5, alignItems: "unset" }} className="relative-position border-box flex-start flex-column">
      <Box sx={{ p: 3, flex: 1, overflow: "auto" }}>
        {content.map((log) => (
          <Fragment key={log.id}>
            <Box sx={{ height: 64 }} className="flex-btw">
              <Box className="flex">
                <Iconfont icon="ic_warn" fontSize={25.6}></Iconfont>
                <Typography>{t(pigActionLabelMap.get(log.additionalInfo?.associatedPig?.pigUpdateName))}</Typography>
              </Box>

              <Typography variant="subtitle2">{timeFormat(log.createdTime)}</Typography>
            </Box>
            <Divider></Divider>
          </Fragment>
        ))}
      </Box>
      <Box sx={{ p: 2 }} className="flex-end">
        <Pagination page={page + 1} color="primary" count={Math.ceil(data?.total / pageSize)} onChange={(e, p) => setPage(p - 1)}></Pagination>
      </Box>
      <TableLoading loading={loading}></TableLoading>
    </Box>
  );
}
