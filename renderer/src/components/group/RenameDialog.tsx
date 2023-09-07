import { Box } from "@mui/material";
import { t } from "i18next";
import { ChangeEvent, useEffect, useState } from "react";
import { $message } from "../../utils";
import MatInput from "../common/mui/MatInput";
import MatDialog, { MatDialogProps } from "../common/mui/MatDialog";
import MessageTip from "../common/tools/MessageTip";

interface RenameDialogProps extends MatDialogProps {
  name: string;
  onOk(name: string): Promise<any>;
  placeholder?: string;
}

export default function RenameDialog(props: RenameDialogProps) {
  const { name } = props;
  const [value, setValue] = useState<string>(name);

  useEffect(() => {
    setValue(name);
  }, [name]);

  const onOk = () => {
    if (!value) {
      $message.error("common.fillRequiredFields");
      return;
    }
    return props.onOk && props.onOk(value);
  };

  const onClose = () => {
    setValue(name);
    props.onClose();
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  return (
    <MatDialog transparentTitleBg title={props.title} open={props.open} onClose={onClose} onOk={onOk} size="xs">
      <Box sx={{ pl: 2 }} className="flex-start flex-wrap">
        <Box sx={{ width: 1, mr: 2 }}>
          <MatInput fullWidth name="groupName" onChange={onChange} label="common.name" value={value} placeholder={t(props.placeholder)} inputProps={{ maxLength: 12 }}></MatInput>
        </Box>
        <MessageTip sx={{ mt: 2 }} title="device.groupName12"></MessageTip>
        {/* <MessageTip content="regTemp.max12Chars"></MessageTip> */}
      </Box>
    </MatDialog>
  );
}
