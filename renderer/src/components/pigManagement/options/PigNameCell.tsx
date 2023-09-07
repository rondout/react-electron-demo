import { Box, Tooltip, Typography } from "@mui/material";
import { ChangeEvent, Fragment, useCallback, useState } from "react";
import { PigInfo } from "../../../models/pig.model";
import MatInput from "../../common/mui/MatInput";
import Iconfont from "../../common/tools/Iconfont";

export default function PigNameCell({ pig }: { pig: PigInfo }) {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(pig.name);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  const handleOk = useCallback(() => {
    setEditMode(false);
  }, []);

  const cancelEdit = useCallback(() => {
    setName(pig.name);
    setEditMode(false);
  }, [pig]);

  return (
    <Box sx={{ pl: 2, "&:hover .rename-pig-name": { display: "block" }, width: 150 }} className="flex-start flex-nowrap">
      {!editMode && (
        <Fragment>
          <Tooltip placement="bottom-start" title={pig.name}>
            <Typography className="line-clamp" sx={{ mr: 0.5, flex: 1 }}>
              {name}
            </Typography>
          </Tooltip>
          <Box className="rename-pig-name" sx={{ display: "none" }}>
            <Iconfont onClick={() => setEditMode(true)} pointer icon="ic_rename1"></Iconfont>
          </Box>
        </Fragment>
      )}
      {editMode && (
        <Fragment>
          <MatInput onBlur={cancelEdit} value={name} autoFocus onChange={onChange}></MatInput>
          <Box sx={{ ml: 0.5 }} className="flex-start item-end flex-nowrap">
            <Iconfont onClick={handleOk} pointer fontSize={16} icon="ic_ok"></Iconfont>
            <Iconfont onClick={cancelEdit} mr={0} fontSize={16} pointer icon="ic_close"></Iconfont>
          </Box>
        </Fragment>
      )}
    </Box>
  );
}
