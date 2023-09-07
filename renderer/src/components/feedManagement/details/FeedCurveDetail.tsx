import { Box } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import feedController from "../../../controllers/feed.controller";
import { FeedCurveType } from "../../../models/feeding.model";
import { handleResponseError } from "../../../models/request.model";
import EmptyData from "../../common/table/EmptyData";
import CommonLoading from "../../common/tools/CommonLoading";
import ConfigFeedCurve from "./ConfigFeedCurve";

export default function FeedCurveDetail() {
  const [detail, setDetail] = useState<FeedCurveType>();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);

  const getCurveDetail = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      setLoading(true);
      feedController
        .getCurveDetail(id)
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
    getCurveDetail();
  }, [getCurveDetail]);

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
        <ConfigFeedCurve reloadDetail={getCurveDetail} detail={detail}></ConfigFeedCurve>
      </Box>
    </Box>
  );
}
