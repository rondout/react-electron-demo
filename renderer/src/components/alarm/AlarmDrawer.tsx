import { Box, Pagination } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import alarmController from "../../controllers/alarm.controller";
import { AlarmItemType } from "../../models/alarm.model";
import { handleResponseError, PageLink, PageLinkInterface, ResponseContent } from "../../models/request.model";
import MatDrawer from "../common/mui/MatDrawer";
import EmptyData from "../common/table/EmptyData";
import TableLoading from "../common/table/TableLoading";
import AlarmItem from "./AlarmItem";

interface AlarmDrawerProps {
  open: boolean;
  setOpen(open: boolean): void;
  setHasNewAlarm(has: boolean): void;
}

const lastSeenAlarmIdKey = "last_seen_alarm_id";
const pageSize = 10;

// 上一次查看的最新的告警Id
let lastSeenAlarmId: string = window.localStorage.getItem(lastSeenAlarmIdKey);
// 从服务器获取道德最新的Id，如果这两个Id不相同，则代表有新的未查看的告警
let lastestAlarmId = "";
let isDrawerOpen = false;

const saveLastSeenIdToLocalStorage = () => {
  if (isDrawerOpen) {
    // 每次打开drawer的时候就把最新的alarmId保存到localstorage中最为最近一次查看的alarmId
    lastSeenAlarmId = lastestAlarmId;
    window.localStorage.setItem(lastSeenAlarmIdKey, lastestAlarmId);
  }
};

export default function AlarmDrawer(props: AlarmDrawerProps) {
  const { open, setOpen, setHasNewAlarm } = props;
  // const { data, loading, setPage, page, fetchData } = useDataFetch({ fetchFn: alarmController.getAlarms, pageLink: new PageLink(0, pageSize) });
  const [alarmData, setAlarmData] = useState<ResponseContent<AlarmItemType>>();
  const [loading, setLoading] = useState(true);
  const [pageLink, setPageLink] = useState<PageLinkInterface>(new PageLink(0, pageSize));

  useEffect(() => {
    isDrawerOpen = open;
  }, [open]);

  useEffect(() => {
    if (open) {
      setPageLink((prev) => ({ ...prev, pageOffset: 0 }));
      saveLastSeenIdToLocalStorage();
      setHasNewAlarm(false);
    }
  }, [open, setHasNewAlarm]);

  const getAlarms = useCallback(
    (pageParams: PageLinkInterface) => {
      setLoading(true);
      const result = alarmController.getAlarms(pageParams);
      result
        .then((res) => {
          setAlarmData(res);
          if (res?.result[0] && pageParams.pageOffset === 0) {
            lastestAlarmId = res.result[0].id;
            // 如果最新的alarmId不等于上一次查看的alarmId  并且确保是第一页的请求
            if (lastestAlarmId !== lastSeenAlarmId) {
              setHasNewAlarm(true);
            }
            saveLastSeenIdToLocalStorage();
          }
        })
        .catch(handleResponseError)
        .finally(() => setLoading(false));
      return result;
    },
    [setHasNewAlarm]
  );

  // useEffect();

  useEffect(() => {
    getAlarms(pageLink);
  }, [getAlarms, pageLink]);

  const getAlarmsByTiming = useCallback(() => {
    // 每隔着一段时间去请求最新的告警信息，比对是否有新的告警信息过来
    setTimeout(() => {
      if (isDrawerOpen) {
        getAlarmsByTiming();
        return;
      }
      alarmController
        .getAlarms(new PageLink(0, 1))
        .then((res) => {
          const latestAlarm = res.result[0];
          if (!latestAlarm?.id) {
            // 如果没有告警信息 直接返回 递归过一定时间再次去查询
            getAlarmsByTiming();
            return;
          } else {
            // 如果有alarm数据，则判断，最新的和已经查看过的最新的是否是一样的
            if (latestAlarm.id === lastSeenAlarmId) {
              // 如果是一样的，则不需要显示小红点  然后继续查询
              getAlarmsByTiming();
              return;
            } else {
              // 若果不一样，则代表有新的alarm来了，需要设置最新的alarmId，并且触发父级Header组件去显示小红点
              lastestAlarmId = latestAlarm.id;
              setHasNewAlarm(true);
              getAlarmsByTiming();
            }
          }
        })
        .catch(() => {
          getAlarmsByTiming();
        });
    }, 10000);
  }, [setHasNewAlarm]);

  useEffect(() => {
    getAlarmsByTiming();
  }, [getAlarmsByTiming]);

  const closeDrawer = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <MatDrawer onClose={closeDrawer} sx={{ width: 460 }} contentSx={{ px: 0, boxSizing: "border-box" }} title="common.alarms" open={open} showFooter={false}>
      <Box className="flex-start flex-column flex-nowrap relative-position" sx={{ height: 1 }}>
        <TableLoading loading={loading} />
        <Box sx={{ flex: 1, width: 1, p: 2, overflow: "auto" }} className="border-box">
          {alarmData?.result.map((alarm) => (
            <AlarmItem key={alarm.id} alarm={alarm} />
          ))}
          {!loading && !(alarmData?.result.length > 0) && <EmptyData />}
        </Box>
        <Box sx={{ p: 2, width: 1, height: 64 }} className="flex-end border-box">
          {alarmData?.total > 0 && (
            <Pagination
              page={pageLink.pageOffset + 1}
              color="primary"
              count={Math.ceil(alarmData?.total / pageSize)}
              onChange={(e, p) => {
                setPageLink((prev) => ({ ...prev, pageOffset: p - 1 }));
              }}
            ></Pagination>
          )}
        </Box>
      </Box>
    </MatDrawer>
  );
}
