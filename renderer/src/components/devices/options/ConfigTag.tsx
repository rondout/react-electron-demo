import { Box, Button, Typography } from "@mui/material";
import { t } from "i18next";
import { ChangeEvent, memo, useCallback, useEffect, useMemo, useState } from "react";
import deviceController from "../../../controllers/device.controller";
import { DeviceInfo } from "../../../models/device.model";
import { $message } from "../../../utils";
import MatDialog, { MatDialogProps } from "../../common/mui/MatDialog";
import MatInput from "../../common/mui/MatInput";
import EmptyData from "../../common/table/EmptyData";
import Iconfont from "../../common/tools/Iconfont";

interface ConfigTagProps extends MatDialogProps {
  device: DeviceInfo;
}

const ConfigTag = memo(function (props: ConfigTagProps) {
  const [value, setValue] = useState("");
  const { onClose, onOk, device } = props;
  const [tags, setTags] = useState<string[]>(device?.tags || []);

  const initTags = useMemo(() => device?.tags || [], [device]);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);

  useEffect(() => {
    if (props.open) {
      setTags(initTags);
    }
  }, [initTags, props.open]);

  const onAddClick = useCallback(() => {
    if (!value?.trim()) {
      $message.error("device.tagsNameRequired");
      return;
    }
    if (tags.some((v) => v === value)) {
      $message.error("device.tagsNameExisted");
      return;
    }
    setTags((prev) => [...prev, value]);
    setValue("");
  }, [value, tags]);

  const handleClose = useCallback(() => {
    setValue("");
    setTags([]);
    onClose && onClose();
  }, [onClose]);

  const handleOk = useCallback(() => {
    const result = deviceController.modifyDevice(device?.id, { tags });
    result.then(() => onOk && onOk());
    return result;
  }, [tags, device, onOk]);

  const deleteTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((v) => v !== tag));
  }, []);

  return (
    <MatDialog size="xs" {...props} onClose={handleClose} onOk={handleOk} title="device.setTag">
      <Box className="flex-start flex-nowrap" sx={{ alignItems: "flex-end" }}>
        <MatInput value={value} onChange={onChange} label="device.tagsName"></MatInput>
        <Button onClick={onAddClick} className="flex">
          <Iconfont icon="ic_add"></Iconfont>
          <Typography variant="subtitle2" style={{ minWidth: 18, whiteSpace: "nowrap" }}>
            {t("common.add")}
          </Typography>
        </Button>
      </Box>
      <Box sx={{ mt: 3, maxHeight: 200, overflow: "auto", bgcolor: (theme) => theme.palette.primary.hoverBg }}>
        {tags.length > 0 &&
          tags.map((tag) => {
            return (
              <Box className="flex-btw" key={tag} sx={{ mx: 3, my: 1.25 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {tag}
                </Typography>
                <Iconfont pointer onClick={() => deleteTag(tag)} style={{}} icon="ic_delete"></Iconfont>
              </Box>
            );
          })}
        {!tags.length && <EmptyData height={200} pt={5} />}
      </Box>
    </MatDialog>
  );
});

export default ConfigTag;
