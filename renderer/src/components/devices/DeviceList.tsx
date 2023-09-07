import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import deviceController from "../../controllers/device.controller";
import useDataFetch from "../../hooks/useDataFetch";
import { BaseNameData, GroupType, OperationMenu } from "../../models/base.model";
import { BucketStatus, bucketStateFilter, DeviceAction, DeviceInfo, deviceStatusFilters, DeviceType, deviceTypeFilters, activeFilters } from "../../models/device.model";
import { ByGroupPageLink, handleResponseError, ResponseContent } from "../../models/request.model";
import { $confirm, $info, commonPageSize, isNull } from "../../utils";
import MatDropdown from "../common/mui/MatDropdown";
import CommonTable, { TableColumns, TableFilterColumns, TableOperationColumns, TableStickyColumns } from "../common/table/CommonTable";
import CustomChip from "../common/tools/CustomChip";
import CustomLink from "../common/tools/CustomLink";
import Iconfont from "../common/tools/Iconfont";
import { BucketStatusComponent, DeviceStatusComponent, OnlineStatusComponent } from "../common/tools/StatusDot";
import { DeviceStatus } from "../dashboard/DeviceStatistics";
import MoveToGroupDialog from "../group/MoveToGroupDialog";
import DeviceSearchInput, { DeviceSearchTypes } from "./DeviceSearchInput";
import AssociateForage from "./options/AssociateForage";
import ConfigTag from "./options/ConfigTag";

// 设备action列表
const actionOptions: OperationMenu<DeviceAction>[] = [
  new OperationMenu(DeviceAction.ENABLE, "device.constants.ENABLE", "ic_start"),
  new OperationMenu(DeviceAction.DISABLE, "device.constants.DISABLE", "ic_forbid"),
  new OperationMenu(DeviceAction.MOVE_TO_GROUP, "device.constants.MOVE_TO_GROUP", "ic_move"),
  new OperationMenu(DeviceAction.ASSOCIATE_FODDER, "device.constants.ASSOCIATE_FODDER", "ic_plan"),
  new OperationMenu(DeviceAction.SET_TAG, "device.constants.SET_TAG", "ic_tag_grey"),
];

const multiActionOptions = actionOptions.filter((item) => item.action !== DeviceAction.SET_TAG);

const createDetailOptionMenus = (deviceInfo: DeviceInfo) => {
  const menus = [actionOptions[2], actionOptions[3]];
  if (deviceInfo.enable) {
    menus.unshift(actionOptions[1]);
  } else {
    menus.unshift(actionOptions[0]);
  }
  // if (!deviceInfo.tags) {
  menus.unshift(actionOptions[4]);
  // }
  return menus;
};

const pageSize = commonPageSize;

export default function DeviceList(props: { selectedGroup: BaseNameData }) {
  const {
    commonBoxShadow,
    palette: { background, primary },
  } = useTheme();
  const { selectedGroup } = props;
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [textSearch, setTextSearch] = useState("");
  const [onConfigDevice, setOnConfigDevcie] = useState<DeviceInfo>();
  const [selectedDevices, setSelectedDevcies] = useState<DeviceInfo[]>([]);
  const [editTagOpen, setEditTagOpen] = useState(false);
  const [moveToGroupOpen, setMoveToGroupOpen] = useState(false);
  const [associateForageTagOpen, setAssociateForageOpen] = useState(false);
  const [searchKey, setKey] = useState(DeviceSearchTypes.NO);
  const { data, setPagelinkParams, loading, page, setPage, refresh } = useDataFetch<ResponseContent<DeviceInfo>, ByGroupPageLink>({
    fetchFn: deviceController.getDeviceByGroupId,
    pageLink: new ByGroupPageLink(0, pageSize, selectedGroup?.id, undefined, undefined),
  });

  const computeToBeConfigredDevcies = useCallback(() => {
    let devices = [];
    if (onConfigDevice) {
      devices = [onConfigDevice];
    } else {
      devices = selectedDevices;
    }
    return devices.map((v) => v.id);
  }, [onConfigDevice, selectedDevices]);

  useEffect(() => {
    if (selectedGroup?.id) {
      setSelectedDevcies([]);
      setPagelinkParams({ pageOffset: 0, groupId: selectedGroup?.id });
    }
  }, [selectedGroup?.id, setPagelinkParams]);

  const changeDeviceStatus = useCallback(
    (enable: boolean, devices: DeviceInfo[]) => {
      const toChangeEnableDevices = devices.filter((device) => isNull(device.enable) || device.enable !== enable);
      const allCount = devices.length;
      const toChangeCount = toChangeEnableDevices.length;
      const arg = enable ? t("common.enable") : t("common.disable");

      // 如果选中的均为修改的状态  则无需发请求修改
      if (!toChangeCount) {
        $info({ title: "device.noNeedChangeEnableTitle", content: t("device.noNeedChangeEnableContent", { arg }) });
        return;
      }
      let content = t("device.changeEnableConfirmContent", { arg });
      if (allCount !== toChangeCount) {
        content = t("device.changeEnableConfirmContentWithArg", { all: allCount, valid: toChangeCount, arg });
      }
      const toChangeEnableDeviceIds = toChangeEnableDevices.map((v) => v.id);
      $confirm({
        title: "device.changeEnableConfirmTitle",
        content,
        onOk() {
          const result = deviceController.modifyDevices(toChangeEnableDeviceIds, { enable });
          result.then(() => {
            refresh();
            setSelectedDevcies((prev) => {
              return prev.map((p) => {
                if (toChangeEnableDeviceIds.includes(p.id)) {
                  return { ...p, enable };
                }
                return p;
              });
            });
          });
          return result;
        },
      });
    },
    [t, refresh]
  );

  const onActionTriggered = useCallback(
    (action: DeviceAction, data?: DeviceInfo) => {
      if (data) {
        setOnConfigDevcie(data);
      } else {
        setOnConfigDevcie(null);
      }
      let devices = selectedDevices;
      if (data) {
        devices = [data];
      }
      switch (action) {
        case DeviceAction.ASSOCIATE_FODDER:
          setAssociateForageOpen(true);
          break;
        case DeviceAction.SET_TAG:
          setEditTagOpen(true);
          break;
        case DeviceAction.MOVE_TO_GROUP:
          setMoveToGroupOpen(true);
          break;
        case DeviceAction.ENABLE:
          changeDeviceStatus(true, devices);
          break;
        case DeviceAction.DISABLE:
          Promise.resolve().then(() => {
            changeDeviceStatus(false, devices);
          });
          break;
      }
    },
    [changeDeviceStatus, selectedDevices]
  );

  const onSearchChange = useCallback(
    (value: string) => {
      setTextSearch(value);
      // 这里要判断搜索的键的类型  如果是搜素sn这种设备字段 直接设置pageLink
      // 反之如果搜索的事attributes里面的东子，则需要设置pageLink的textSearchObj字段
      // ByGroupPageLink会自动根据传入的searchObj生成服务端需要的attributesSearch字符串格式）
      if (searchKey === DeviceSearchTypes.FIELD) {
        setPagelinkParams({ pageOffset: 0, textSearchObj: value ? { [searchKey]: value } : null });
      } else if (searchKey === DeviceSearchTypes.NO) {
        setPagelinkParams({ pageOffset: 0, sn: value || null });
      } else if (searchKey === DeviceSearchTypes.TAGS) {
        setPagelinkParams({ pageOffset: 0, tags: value || null });
      }
    },
    [setPagelinkParams, searchKey]
  );

  const viewDeviceDetail = useCallback(
    (device: DeviceInfo) => {
      navigate("/device-management/" + device.id);
    },
    [navigate]
  );

  const addTag = useCallback((device: DeviceInfo) => {
    setOnConfigDevcie(device);
    setEditTagOpen(true);
  }, []);

  const onAssociateForageOk = useCallback(
    (feedForageId: string) => {
      if (!feedForageId) {
        return;
      }
      const result = deviceController.modifyDevices(computeToBeConfigredDevcies(), { feedForageId });
      result
        .then(() => {
          refresh();
        })
        .catch(handleResponseError);
      return result;
    },
    [computeToBeConfigredDevcies, refresh]
  );

  const handleMoveDialogOk = useCallback(
    (groupId: string) => {
      // 如果移动到全部组，就相当于修改groupIds字段为空数组
      const result = deviceController.modifyDevices(computeToBeConfigredDevcies(), { groupIds: groupId ? [groupId] : [] });
      result.then(() => {
        setSelectedDevcies([]);
        refresh(true);
      });
      return result;
    },
    [computeToBeConfigredDevcies, refresh]
  );

  const closeMoveDialog = useCallback(() => {
    setMoveToGroupOpen(false);
  }, []);

  const onActiveChange = useCallback(
    (active: boolean) => {
      setPagelinkParams({ pageOffset: 0, active });
    },
    [setPagelinkParams]
  );

  const onTypeFilterChange = useCallback(
    (product: DeviceType) => {
      // setPagelinkParams({ pageOffset: 0, type });
      setPagelinkParams((prev) => ({ pageOffset: 0, filtersObj: { ...prev.filtersObj, product } }));
    },
    [setPagelinkParams]
  );

  const onBucketFilterChange = useCallback(
    (bucketState: BucketStatus) => {
      setPagelinkParams((prev) => ({ pageOffset: 0, filtersObj: { ...prev.filtersObj, bucketState } }));
    },
    [setPagelinkParams]
  );

  const onDeviceStatusFilterChange = useCallback(
    (enable: DeviceStatus) => {
      setPagelinkParams({ pageOffset: 0, enable });
    },
    [setPagelinkParams]
  );

  const onSearchKeyChange = useCallback(
    (action: DeviceSearchTypes) => {
      if (searchKey !== action) {
        setKey(action);
      }
      if (textSearch) {
        setTextSearch("");
        onSearchChange("");
      }
    },
    [onSearchChange, searchKey, textSearch]
  );

  const columns = useMemo<TableColumns<DeviceInfo>[]>(() => {
    return [
      new TableStickyColumns("left", "sn", "device.sn", undefined, (data) => {
        return (
          <CustomLink showUnderline={false} sx={{ color: primary.main, cursor: "pointer" }} onClick={() => viewDeviceDetail(data)}>
            {data.sn?.toString()}
          </CustomLink>
        );
      }),
      new TableColumns("devicePen", "device.devicePen", undefined, ({ attributes }) => <Typography>{attributes.devicePen || "-"}</Typography>),
      new TableFilterColumns<DeviceInfo, boolean>("active", "device.active", activeFilters, onActiveChange, (device) => {
        return <OnlineStatusComponent sx={{ px: 2 }} device={device} />;
      }),
      new TableOperationColumns("tags", "device.tags", undefined, undefined, (device) => {
        if (device.tags?.length) {
          return (
            <Box className="flex-start flex-nowrap" sx={{ mx: 2 }}>
              {device.tags.map((tag) => (
                <CustomChip key={tag} sx={{ mr: 1 }} color="primary" title={tag}></CustomChip>
              ))}
            </Box>
          );
        }
        return (
          <Button
            sx={{ mx: 2 }}
            className="flex"
            onClick={() => {
              addTag(device);
            }}
          >
            <Iconfont icon="ic_tag"></Iconfont>
            <span>{t("device.addTag")}</span>
          </Button>
        );
      }),
      new TableFilterColumns<DeviceInfo, DeviceType>("type", "device.deviceType", deviceTypeFilters, onTypeFilterChange, (data) => (
        <Typography sx={{ pl: 2 }}>{data.attributes.product || "-"}</Typography>
      )),
      new TableColumns("forageName", "device.forageName", undefined, ({ additionalInfo }) => {
        return <Typography>{additionalInfo?.associatedFeedForage?.forageName || "-"}</Typography>;
      }),
      new TableOperationColumns("tankWeight", "device.tankWeight", undefined, undefined, (device) => (
        <Typography sx={{ px: 2 }}>{isNull(device.attributes.troughWeight) ? "-" : device.attributes.troughWeight + " g"}</Typography>
      )),
      new TableFilterColumns("bucketState", "device.bucketState", bucketStateFilter, onBucketFilterChange, (device) => {
        return <BucketStatusComponent sx={{ mx: 2 }} device={device} />;
      }),
      new TableFilterColumns("enable", "device.status", deviceStatusFilters, onDeviceStatusFilterChange, (device) => <DeviceStatusComponent sx={{ mx: 2 }} device={device} />),
      new TableOperationColumns<DeviceInfo>(
        "operation",
        undefined,
        "right",
        80,
        (data) => (
          <Box sx={{ px: 1 }}>
            <MatDropdown<DeviceAction> sx={{ pl: 0.8 }} menus={createDetailOptionMenus(data)} onMenuClick={(action) => onActionTriggered(action, data)}></MatDropdown>
          </Box>
        ),
        true
      ),
    ];
  }, [primary, viewDeviceDetail, onActionTriggered, t, addTag, onActiveChange, onTypeFilterChange, onBucketFilterChange, onDeviceStatusFilterChange]);

  return (
    <Box sx={{ flex: 1, overflow: "auto", boxShadow: commonBoxShadow, height: 1, borderRadius: 2, bgcolor: background.default }} className="border-box">
      <Box component={"header"} sx={{ height: 64, px: 2 }} className="flex-btw">
        <Typography color="text.secondary">{!!props.selectedGroup && t("device.deviceListTitle", { name: props.selectedGroup?.name || "" })}</Typography>
        <Box className="flex-end">
          <DeviceSearchInput
            type={searchKey}
            onTypeChange={onSearchKeyChange}
            value={textSearch}
            onChange={onSearchChange}
            placeholder={"device.holders." + searchKey}
          ></DeviceSearchInput>
          {/* <MatSearchInput value={textSearch} onChange={onSearchChange} placeholder="请输入设备编号搜索"></MatSearchInput> */}
          <MatDropdown<DeviceAction>
            sx={{ mr: 2 }}
            disabled={!selectedDevices?.length}
            trigger={
              <Button variant="contained" disabled={!selectedDevices?.length}>
                <span className="flex">
                  <span style={{ position: "relative", top: 0, paddingRight: 4 }}>{t("common.action")}</span>
                  <Iconfont icon="ic_arrowdown" style={{ transform: "scale(1.75)" }} fontSize={16} mr={0} />
                </span>
              </Button>
            }
            menus={multiActionOptions}
            onMenuClick={onActionTriggered}
          ></MatDropdown>
          <IconButton onClick={() => refresh()} sx={{ ml: 0, color: "unset", mr: 1 }} size="small">
            <Iconfont mr={0} icon="ic_refresh"></Iconfont>
          </IconButton>
        </Box>
      </Box>
      <Box sx={{ px: 2, height: "calc(100% - 64px)" }}>
        <CommonTable
          loading={loading}
          // sortBy="active"
          pageSize={pageSize}
          page={page}
          pageChange={setPage}
          hideBoxShadow
          total={data?.total}
          columns={columns}
          showSelect
          selected={selectedDevices}
          onSelectChange={setSelectedDevcies}
          rows={data?.result}
        ></CommonTable>
      </Box>
      <ConfigTag open={editTagOpen} onOk={refresh} device={onConfigDevice} onClose={() => setEditTagOpen(false)}></ConfigTag>
      <AssociateForage open={associateForageTagOpen} onOk={onAssociateForageOk} onClose={() => setAssociateForageOpen(false)}></AssociateForage>
      <MoveToGroupDialog
        type={GroupType.DEVICE}
        placeholder="device.holders.moveDeviceGroup"
        title="device.moveDeviceGroup"
        open={moveToGroupOpen}
        onClose={closeMoveDialog}
        onOk={handleMoveDialogOk}
      ></MoveToGroupDialog>
    </Box>
  );
}
