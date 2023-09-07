import { useCallback, useRef } from "react";
import feedController from "../../../controllers/feed.controller";
import { FeedPlanFactory, FeedPlanType } from "../../../models/feeding.model";
import { handleResponseError } from "../../../models/request.model";
import MatDrawer from "../../common/mui/MatDrawer";
import ConfigFeedPlan, { ConfigFeedPlanRef } from "../details/ConfigFeedPlan";

export enum PlanEditMode {
  CREATE,
  COPY,
  EDIT,
}

const configTitleMap = new Map<PlanEditMode, string>([
  [PlanEditMode.CREATE, "feed.createPlan"],
  [PlanEditMode.COPY, "feed.copyPlan"],
  [PlanEditMode.EDIT, "feed.editPlan"],
]);

interface PlanEditDrawerProps {
  open: boolean;
  onOk(): void;
  closeDrawer(): void;
  details?: FeedPlanType;
  configMode: PlanEditMode;
}

export default function PlanEditDrawer(props: PlanEditDrawerProps) {
  const { closeDrawer, configMode, details = new FeedPlanFactory(), onOk } = props;
  const createPlanRef = useRef<ConfigFeedPlanRef>();

  const onClose = useCallback(() => {
    closeDrawer();
  }, [closeDrawer]);

  const handleOk = useCallback(() => {
    const { validate, getValues } = createPlanRef.current;
    if (!validate()) {
      return;
    }
    const { planData, planName } = getValues();
    if (configMode === PlanEditMode.EDIT) {
      const result = feedController.modifyPlan(details?.id, { planData, planName });
      result.then(() => onOk()).catch(handleResponseError);
      return result;
    } else {
      const result = feedController.createPlan({ planData, planName });
      result.then(() => onOk()).catch(handleResponseError);
      return result;
    }
  }, [createPlanRef, onOk, configMode, details?.id]);

  return (
    <MatDrawer title={configTitleMap.get(configMode)} anchor="right" open={props.open} sx={{ width: 960 }} onOk={handleOk} onClose={onClose}>
      <ConfigFeedPlan ref={createPlanRef} editMode={true} showEditBtn={false} detail={details}></ConfigFeedPlan>
    </MatDrawer>
  );
}
