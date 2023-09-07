import { Box } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import feedController from "../../../controllers/feed.controller";
import { FeedPlanType } from "../../../models/feeding.model";
import { handleResponseError } from "../../../models/request.model";
import EmptyData from "../../common/table/EmptyData";
import CommonLoading from "../../common/tools/CommonLoading";
import ConfigFeedPlan from "./ConfigFeedPlan";

export default function FeedPlanDetail() {
  const [detail, setDetail] = useState<FeedPlanType>();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);

  const getPlanDetail = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      setLoading(true);
      feedController
        .getPlanDetail(id)
        .then((res) => {
          setDetail(res);
          setLoading(false);
          resolve();
        })
        .catch((err) => {
          handleResponseError(err);
          setLoading(false);
          reject();
        });
    });
  }, [id]);

  useEffect(() => {
    getPlanDetail();
  }, [getPlanDetail]);

  if (loading) {
    return <CommonLoading />;
  }

  if (!detail) {
    return <EmptyData />;
  }

  return (
    <Box sx={{ height: 1, bgcolor: "#fff", p: 2, overflow: "auto" }} className="border-box">
      <Box sx={{ height: 1, p: 3 }} className="border-box">
        {/* <MatInput value={""} placeholder=""></MatInput> */}
        <ConfigFeedPlan reloadDetail={getPlanDetail} detail={detail}></ConfigFeedPlan>
      </Box>
    </Box>
  );
}
