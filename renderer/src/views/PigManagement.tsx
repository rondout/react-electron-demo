import { Box } from "@mui/material";
import { useState } from "react";
import GroupTreeList from "../components/group/GroupTreeList";
import PigList from "../components/pigManagement/PigList";
import { BaseNameData, GroupType } from "../models/base.model";

export default function PigManagement() {
  const [selectedGroup, setSelectedGroup] = useState<BaseNameData>();

  return (
    <Box className="flex-start items-start border-box flex-nowrap" sx={{ p: 2, height: 1 }}>
      <GroupTreeList type={GroupType.PIG} setSelected={setSelectedGroup}></GroupTreeList>
      <PigList selectedGroup={selectedGroup}></PigList>
    </Box>
  );
}
