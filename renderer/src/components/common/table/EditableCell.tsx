import { Box, Tooltip, Typography } from "@mui/material";
import { ChangeEvent, Fragment, useCallback, useState } from "react";
import MatInput from "../../common/mui/MatInput";
import Iconfont from "../../common/tools/Iconfont";

let okHovered = false;

export default function EditAbleCell(props: { name: string; onOk(name: string): Promise<any> }) {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(props.name);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  const handleOk = useCallback(() => {
    props.onOk(name).then(() => {
      setEditMode(false);
    });
  }, [props, name]);

  const cancelEdit = useCallback(() => {
    setEditMode(false);
    setName(props.name);
  }, [props.name]);

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      if (okHovered) {
        return;
      }
      cancelEdit();
    }, 30);
  }, [cancelEdit]);

  return (
    <Box sx={{ pl: 2, "&:hover .rename-pig-name": { display: "block" }, width: 150 }} className="flex-start flex-nowrap">
      {!editMode && (
        <Fragment>
          <Tooltip placement="bottom-start" title={props.name}>
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
          <MatInput onBlur={handleBlur} value={name} autoFocus onChange={onChange}></MatInput>
          <Box sx={{ ml: 0.5 }} className="flex-start item-end flex-nowrap">
            <Box sx={{ position: "relative", top: 2 }} onMouseEnter={() => (okHovered = true)} onMouseLeave={() => (okHovered = false)} component="span">
              <Iconfont onClick={handleOk} pointer fontSize={16} icon="ic_ok"></Iconfont>
            </Box>
            <Iconfont onClick={cancelEdit} mr={0} fontSize={16} pointer icon="ic_close"></Iconfont>
          </Box>
        </Fragment>
      )}
    </Box>
  );
}
