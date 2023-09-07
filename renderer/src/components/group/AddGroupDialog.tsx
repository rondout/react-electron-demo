import { Box } from "@mui/material";
import { t } from "i18next";
import { ChangeEvent, useState } from "react";
import { $message } from "../../utils";
import MatInput from "../common/mui/MatInput";
import MatDialog, { MatDialogProps } from "../common/mui/MatDialog";
import MessageTip from "../common/tools/MessageTip";

interface AddGroupDialogProps extends MatDialogProps {}

export default function AddGroupDialog(props: AddGroupDialogProps) {
  const [name, setName] = useState<string>("");
  const onOk = () => {
    if (!name) {
      $message.error("device.errors.needGroupName");
      return;
    }
    return props.onOk && props.onOk(name);
  };

  const onClose = () => {
    setName("");
    props.onClose();
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value?.trim());
  };

  return (
    <MatDialog transparentTitleBg size="xs" title="device.addGroup" open={props.open} onClose={onClose} onOk={onOk}>
      <Box sx={{ pl: 2 }} className="flex-start flex-wrap">
        <Box sx={{ width: 1, mr: 2 }}>
          <MatInput name="groupName" onChange={onChange} label="common.name" value={name} placeholder={t("device.holders.groupName")} inputProps={{ maxLength: 12 }}></MatInput>
          <MessageTip sx={{ mt: 2 }} title="device.groupName12"></MessageTip>
        </Box>
      </Box>
    </MatDialog>
  );
}
