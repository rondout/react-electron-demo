import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import FeedingMenu from "../components/feedManagement/FeedingMenu";

export default function FeedManagement() {
  return (
    <Box className="flex-start items-start border-box flex-nowrap" sx={{ p: 2, height: 1 }}>
      <FeedingMenu></FeedingMenu>
      <Box sx={{ height: 1, flex: 1, overflow: "auto" }}>
        <Outlet />
      </Box>
    </Box>
  );
}
