import { useCallback, useRef } from "react";
import feedController from "../../../controllers/feed.controller";
import { FeedCurveDetailFactory, FeedCurveType } from "../../../models/feeding.model";
import { handleResponseError } from "../../../models/request.model";
import MatDrawer from "../../common/mui/MatDrawer";
import ConfigFeedCurve, { ConfigFeedCurveRef } from "../details/ConfigFeedCurve";

export enum CurveEditMode {
  CREATE,
  COPY,
  EDIT,
}

const configTitleMap = new Map<CurveEditMode, string>([
  [CurveEditMode.CREATE, "feed.createCurve"],
  [CurveEditMode.COPY, "feed.copyCurve"],
  [CurveEditMode.EDIT, "feed.editCurve"],
]);

interface CurveEditDrawerProps {
  open: boolean;
  onOk(): void;
  closeDrawer(): void;
  details?: FeedCurveType;
  configMode: CurveEditMode;
}

export default function CurveEditDrawer(props: CurveEditDrawerProps) {
  const { closeDrawer, configMode, details = new FeedCurveDetailFactory(), onOk } = props;
  const createCurveRef = useRef<ConfigFeedCurveRef>();

  const onClose = useCallback(() => {
    closeDrawer();
  }, [closeDrawer]);

  const handleOk = useCallback(() => {
    const { validate, getValues } = createCurveRef.current;
    if (!validate()) {
      return;
    }
    // if (isCopy) {
    // } else {
    const { curveData, curveName } = getValues();
    if (configMode === CurveEditMode.EDIT) {
      const result = feedController.modifyCurve(details.id, { curveData, curveName });
      result.then(() => onOk()).catch(handleResponseError);
      return result;
    } else {
      const result = feedController.createCurve({ curveData, curveName });
      result.then(() => onOk()).catch(handleResponseError);
      return result;
    }
    // }
    // return new Promise<void>((resolve, reject) =>
    // setTimeout(() => {
    //   const { validate, getValues } = createCurveRef.current;
    //   if (validate()) {
    //     console.log(getValues());
    //     resolve();
    //   } else {
    //     reject();
    //   }
    // }, 2000)
    // );
  }, [createCurveRef, configMode, details?.id, onOk]);

  return (
    <MatDrawer title={configTitleMap.get(configMode)} anchor="right" open={props.open} sx={{ width: 960 }} onOk={handleOk} onClose={onClose}>
      <ConfigFeedCurve ref={createCurveRef} editMode={true} showEditBtn={false} detail={details}></ConfigFeedCurve>
    </MatDrawer>
  );
}
