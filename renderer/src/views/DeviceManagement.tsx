import { Box } from "@mui/material";
import { useState } from "react";
import GroupTreeList from "../components/group/GroupTreeList";
import DeviceList from "../components/devices/DeviceList";
import { BaseNameData, GroupType } from "../models/base.model";

export default function DeviceManagement() {
  const [selectedGroup, setSelectedGroup] = useState<BaseNameData>();
  return (
    <Box className="flex-start items-start border-box flex-nowrap" sx={{ p: 2, height: 1 }}>
      <GroupTreeList type={GroupType.DEVICE} setSelected={setSelectedGroup}></GroupTreeList>
      <DeviceList selectedGroup={selectedGroup}></DeviceList>
    </Box>
  );
}
