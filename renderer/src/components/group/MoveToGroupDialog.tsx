import { Box } from "@mui/material";
import { t } from "i18next";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { $message, isNull } from "../../utils";
import MatSelect from "../common/mui/MatSelect";
import MatDialog, { MatDialogProps } from "../common/mui/MatDialog";
import { BaseNameData, GroupType, treeDataToList } from "../../models/base.model";
import groupController from "../../controllers/group.controller";
import { handleResponseError } from "../../models/request.model";

interface MoveToGroupDialogProps extends MatDialogProps {
  title: string;
  placeholder: string;
  type: GroupType;
  count?: number;
  label?: string;
}

export default function MoveToGroupDialog(props: MoveToGroupDialogProps) {
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [groups, setGroups] = useState<BaseNameData[]>([]);
  const [loading, setLoading] = useState(false);
  const { label = "device.labels.selectDeviceGroup", title, placeholder } = props;

  const onOk = () => {
    if (isNull(selectedGroup)) {
      $message.error("device.errors.needGroup");
      return;
    }
    const result = props.onOk(selectedGroup === "ALL" ? undefined : selectedGroup);
    if (result instanceof Promise) {
      result.then(() => {
        onClose();
      });
    }
    return result;
  };

  useEffect(() => {
    if (!props.open) {
      return;
    }
    setLoading(true);
    groupController
      .getGroupTree(props.type)
      .then((res) => {
        setLoading(false);
        setGroups(treeDataToList(res));
      })
      .catch((err) => {
        handleResponseError(err);
        setLoading(false);
      });
  }, [props.open, props.type]);

  const onClose = () => {
    setSelectedGroup("");
    props.onClose();
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedGroup(event.target.value);
  };

  const groupOptions = useMemo(() => groups?.map((group) => ({ label: group.name, value: group.id })), [groups]);

  return (
    <MatDialog transparentTitleBg title={t(title)} open={props.open} size="xs" onClose={onClose} onOk={onOk}>
      <Box sx={{ pl: 2 }} className="flex-start flex-wrap">
        <Box sx={{ width: 1, mr: 2 }}>
          <MatSelect name="group" onChange={onChange} options={groupOptions} loading={loading} placeholder={placeholder} label={label} value={selectedGroup}></MatSelect>
        </Box>
        {/* <MessageTip content="regTemp.max12Chars"></MessageTip> */}
      </Box>
    </MatDialog>
  );
}
