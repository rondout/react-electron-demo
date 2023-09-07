import { treeItemClasses, TreeView } from "@mui/lab";
import { alpha, Box, IconButton, styled, Typography, useTheme } from "@mui/material";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import groupController from "../../controllers/group.controller";
import { BaseNameData, GroupType, OperationMenu, TreeData } from "../../models/base.model";
import { handleResponseError } from "../../models/request.model";
import { $confirm, $message, calcGroupId, calcTreeLevel, initTreeData } from "../../utils";
import MatDropdown from "../common/mui/MatDropdown";
import CustomTreeItem from "../common/styled/CustomTreeItem";
import EmptyData from "../common/table/EmptyData";
import CommonLoading from "../common/tools/CommonLoading";
import Iconfont from "../common/tools/Iconfont";
import AddGroupDialog from "./AddGroupDialog";
// import MoveToGroupDialog from "./MoveToGroupDialog";
import RenameDialog from "./RenameDialog";

// "更多"操作
enum GroupActions {
  RENAME,
  ADD_CHILD_GROUP,
  // MOVE_GROUP,
  DELETE_GROUP,
}
// "更多"下拉菜单
const createDropdownMenus = (groupInfo: TreeData) => {
  const menus = [
    new OperationMenu<GroupActions>(GroupActions.RENAME, "device.constants.RENAME", "ic_rename"),
    new OperationMenu<GroupActions>(GroupActions.ADD_CHILD_GROUP, "device.constants.ADD_CHILD_GROUP", "ic_add"),
    // new OperationMenu<GroupActions>(GroupActions.MOVE_GROUP, "device.constants.MOVE_GROUP", "ic_move"),
    new OperationMenu<GroupActions>(GroupActions.DELETE_GROUP, "device.constants.DELETE_GROUP", "ic_delete"),
  ];
  if (groupInfo.root_node) {
    return [menus[1]];
  }
  return menus;
};

const singleTreeNodeStyle = {
  padding: "0 16px",
  marginBottom: 4,
  //   borderRadius: 4,
  height: 40,
  //   width: 250,
};

const StyledTreeView = styled(TreeView)(({ theme }) => {
  return {
    height: "100%",
    "& .Mui-focused": {
      backgroundColor: "transparent !important",
    },
    "& .Mui-selected": {
      backgroundColor: alpha(theme.palette.primary.main, 0.1) + " !important",
      "& .tree-item-operation button": {
        display: "block !important",
      },
    },
    [`& .${treeItemClasses.group}`]: {
      marginLeft: 0,
      [`& .${treeItemClasses.content}`]: {
        paddingLeft: theme.spacing(2),
      },
    },
  };
});

const StyledTreeItem = styled(CustomTreeItem)(({ theme }) => {
  return {
    ".MuiTreeItem-content": {
      ...singleTreeNodeStyle,
      "&.MuiCollapse-root": {
        // marginLeft: 12,
      },
      "&.MuiTreeItem-group": {
        marginLeft: 12,
      },
      "& .tree-item-operation button": {
        display: "none",
      },
      "&:hover .tree-item-operation button": {
        display: "block",
      },
    },
  };
});

interface GroupTreeListProps {
  setSelected(data: BaseNameData): void;
  type: GroupType;
}

const GroupTreeList = memo(function (props: GroupTreeListProps) {
  const {
    commonBoxShadow,
    palette: { background },
  } = useTheme();
  const { setSelected: propsSetSelected, type } = props;
  const [groups, setGroups] = useState<TreeData[]>();
  const { t } = useTranslation();
  // const [parentId, setParentId] = useState("");
  const [selected, setSelected] = useState<BaseNameData>(null);
  const [loading, setLoading] = useState(true);
  const [onConfigGroup, setOnConfigGroup] = useState<TreeData>();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  // const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [defaultExpanded, setDefaultExpanded] = useState("");
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);

  const parentId = useMemo(() => onConfigGroup?.id, [onConfigGroup?.id]);

  // const viewGroupDetail = (data: TreeData) => {};
  const getGroup = useCallback(() => {
    setLoading(true);
    groupController
      .getGroupTree(type)
      .then((res) => {
        const { groups, name, id } = initTreeData(res);
        setGroups(groups);
        setSelected((prev) => prev || { name, id });
        // setGroups(res);
        setDefaultExpanded(id);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        handleResponseError(err);
      });
  }, [setSelected, type]);

  useEffect(() => propsSetSelected(selected), [selected, propsSetSelected]);

  useEffect(() => {
    getGroup();
  }, [getGroup]);

  const onAddClick = (data: TreeData) => {
    // setParentId(data.id);
    setAddDialogOpen(true);
  };

  const handleDeleteGroup = useCallback(
    (groupInfo: TreeData) => {
      $confirm({
        title: t("device." + (type === GroupType.DEVICE ? "deleteDeviceGroupTitle" : "deletePigGroupTitle"), { name: groupInfo?.name }),
        content: "device.deleteGroupContent",
        okBtnType: "error",
        okText: "common.delete",
        onOk() {
          const result = groupController.deleteGroup(groupInfo?.id);
          result
            .then(() => {
              $message.success("deleteSuccessed");
              getGroup();
              if (selected?.id === groupInfo?.id) {
                const { name, id } = groups[0];
                setSelected({ name, id });
              }
            })
            .catch(handleResponseError);
          return result;
        },
      });
    },
    [t, getGroup, groups, selected, type]
  );

  const onMenuClick = (action: GroupActions, data: TreeData) => {
    setOnConfigGroup(data);
    switch (action) {
      case GroupActions.RENAME:
        setRenameDialogOpen(true);
        break;
      // case GroupActions.MOVE_GROUP:
      //   setMoveDialogOpen(true);
      //   break;
      case GroupActions.ADD_CHILD_GROUP:
        setAddDialogOpen(true);
        break;
      case GroupActions.DELETE_GROUP:
        handleDeleteGroup(data);
        break;
    }
  };

  const onRenameOk = (name: string) => {
    const result = groupController.renameGroup(name, parentId);
    result
      .then(() => {
        getGroup();
        if (selected?.id === parentId) {
          setSelected((prev) => ({ ...prev, name }));
        }
      })
      .catch((err) => {
        handleResponseError(err);
      });
    return result;
  };

  // const afterMoveDialogOk = (name: string, groupId: string) => {
  //   const result = new Promise<void>((resolve) => {
  //     setTimeout(() => resolve(), 1000);
  //   });
  //   return result;
  // };

  const onAddOK = useCallback(
    (name: string) => {
      const result = groupController.createGroup({ name, parentId: calcGroupId(parentId), type });
      result
        .then(() => {
          getGroup();
        })
        .catch(handleResponseError);
      return result;
    },
    [parentId, type, getGroup]
  );

  const closeRenameDialog = () => {
    setRenameDialogOpen(false);
  };

  // const closeMoveDialog = () => {
  //   setMoveDialogOpen(false);
  // };

  const closeAddDialog = () => {
    setAddDialogOpen(false);
  };

  // "更多"按钮
  const createDetailComponent = (data: TreeData) => {
    let menus = createDropdownMenus(data);
    // if (data.level === 0) {
    //   return null;
    //   // menus = [];
    //   // menus = [dropdownMenus[0]];
    // }
    return (
      <Box key={0} className="tree-item-operation" onClick={(e) => e.stopPropagation()}>
        <MatDropdown<GroupActions>
          sx={{ pl: 0 }}
          menus={menus}
          onMenuClick={(action) => onMenuClick(action, data)}
          trigger={
            <IconButton sx={{ ml: 0 }} size="small">
              <Iconfont mr={0} icon="ic_more"></Iconfont>
            </IconButton>
          }
        ></MatDropdown>
      </Box>
    );
  };

  const renderTrees = (data: TreeData) => {
    // const index = data.level % 6;
    // const avatarColor = colors[index];
    const onSelected = (group: BaseNameData) => {
      setSelected(group);
    };

    const computedPl = () => {
      if (data.root_node) {
        return 0;
      }
      if (data.children) {
        return 1 * calcTreeLevel(data);
      }
      return 1 * (calcTreeLevel(data) - 1);
    };

    return (
      <StyledTreeItem
        ContentProps={{
          innerSx: { pl: computedPl },
          operationComponents: [createDetailComponent(data)],
          //   avatarColor,
          onAddClick: () => onAddClick(data),
          onSelected,
          showAddButton: false,
          //   onDetailClick: () => viewGroupDetail(data),
        }}
        // sx={{ pl: 2 }}
        checked={false}
        onClick={() => {}}
        key={data.id}
        nodeId={data.id}
        label={data.name}
      >
        {data.children?.map((children) => renderTrees(children))}
      </StyledTreeItem>
    );
  };

  const buildTreeItems = (groups: TreeData[]) => {
    return groups.map((group) => renderTrees(group));
  };

  return (
    <Box sx={{ mr: 2, boxShadow: commonBoxShadow, height: 1, borderRadius: 2, bgcolor: background.default, width: 200, minWidth: 200 }} className="border-box">
      <Box sx={{ height: 64, px: 2 }} className="flex-start">
        <Typography color="text.secondary">{t("device.grupTypes." + type)}</Typography>
      </Box>
      <Box sx={{ px: 0, pb: 14 / 8, height: "calc(100% - 64px)" }} className="border-box">
        <CommonLoading loading={loading} size="small"></CommonLoading>
        {defaultExpanded !== "" && (
          <StyledTreeView
            selected={selected?.id}
            defaultExpanded={[defaultExpanded]}
            defaultCollapseIcon={<Iconfont icon="ic_open" mr={0} />}
            defaultExpandIcon={<Iconfont icon="ic_fold" mr={0} />}
            sx={{ flexGrow: 1, overflowY: "auto", display: loading ? "none" : "block" }}
          >
            {groups && buildTreeItems(groups)}
            {!groups.length && <EmptyData></EmptyData>}
          </StyledTreeView>
        )}
      </Box>
      <RenameDialog
        open={renameDialogOpen}
        name={onConfigGroup?.name}
        onClose={closeRenameDialog}
        onOk={onRenameOk}
        placeholder="device.holders.groupName"
        title="device.renameDeviceGroup"
      />
      {/* <MoveToGroupDialog
        placeholder="device.holders.moveDeviceGroup"
        title="device.moveDeviceGroup"
        open={moveDialogOpen}
        onClose={closeMoveDialog}
        onOk={afterMoveDialogOk}
      ></MoveToGroupDialog> */}
      <AddGroupDialog open={addDialogOpen} onClose={closeAddDialog} onOk={onAddOK}></AddGroupDialog>
      {/* <Box sx={{ height: 64, px: 2 }} className="flex">
        <Button variant="contained" fullWidth className="flex">
          <Iconfont icon="ic_addgroup"></Iconfont>
          <span>{t("device.createGroup")}</span>
        </Button>
      </Box> */}
    </Box>
  );
});

export default GroupTreeList;
