import { Fragment, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import pigController from "../../controllers/pig.controller";
import { GroupType } from "../../models/base.model";
import { ModifyPigParams, PigAction, PigInfo } from "../../models/pig.model";
import { handleMultiRequestResponse, handleResponseError } from "../../models/request.model";
import { $confirm, $info } from "../../utils";
import MoveToGroupDialog from "../group/MoveToGroupDialog";
import AddPigDialog from "./options/AddPigDialog";
import AssociateCurve from "./options/AssociateCurve";
import AssociateField from "./options/AssociateField";
import AssociatePlan from "./options/AssociatePlan";
import LeaveField from "./options/LeaveField";
import ModifyPigState from "./options/ModifyPigState";
import ModifyWeightStrategy from "./options/ModifyWeightStrategy";

interface PigActionsHandlerProps {
  dialogCtrls: Map<PigAction, boolean>;
  onConfigPig: PigInfo;
  onOk?(changedIds?: string[], params?: ModifyPigParams): void;
  onClose(): void;
  refreshList?(clear?: boolean, reset?: boolean): any;
  selectedPigs?: PigInfo[];
}

const needToClearSelect = (action: PigAction) => {
  return [PigAction.DELETE, PigAction.MOVE_TO_GROUP].includes(action);
};

export default function PigActionsHandler(props: PigActionsHandlerProps) {
  const { onConfigPig, dialogCtrls, onClose, refreshList, selectedPigs = [], onOk = () => {} } = props;
  const { t } = useTranslation();

  const pigsToConfig = useMemo(() => {
    if (onConfigPig) {
      return [onConfigPig];
    }
    return selectedPigs;
  }, [onConfigPig, selectedPigs]);

  const onActionDialogClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handlePigsAction = useCallback(
    (param: ModifyPigParams, action: PigAction, pigs: PigInfo[]) => {
      const result = handleMultiRequestResponse(pigController.multipleModifyPigs(pigs, param), pigs.length);
      result
        .then((res) => {
          onOk(
            pigs.map((p) => p.id),
            param
          );
          refreshList && refreshList(needToClearSelect(action), needToClearSelect(action));
          // setSelectedPlans((prev) => prev.filter((p) => !res.successedIds.includes(p.id)));
        })
        .catch((err) => {});
      return result;
      // const result = new Promise<void>((resolve, reject) => {
      //   pigController
      //     .multipleModifyPigs(pigs, param)
      //     .then((res) => {
      //       // 这里需要判断是全部成功还是部分成功
      //       const result = handleMultiRequestResponse(res, pigs.length);
      //       switch (result.success) {
      //         case "all":
      //           $message.success("common.operateSuccessed");
      //           refreshList && refreshList(needToClearSelect(action), needToClearSelect(action));
      //           resolve();
      //           break;
      //         case "part":
      //           // 如果部分成功
      //           $message.error(t("pig.operatePartlySuccessed", { reason: result.reason }));
      //           refreshList && refreshList(needToClearSelect(action), needToClearSelect(action));
      //           resolve();
      //           break;
      //         case "false":
      //           // 如果全部失败
      //           $message.error(t("pig.operateAllFailed", { reason: result.reason }));
      //           reject();
      //           break;
      //       }
      //     })
      //     .catch((err) => {
      //       handleResponseError(err);
      //     });
      // });
      // return result;
    },
    [refreshList, onOk]
  );

  const onActionDialogOk = useCallback(
    (param: ModifyPigParams, action: PigAction) => {
      const allSelectedPigCount = pigsToConfig.length;
      let ableToActionPigs: PigInfo[] = pigsToConfig;
      switch (action) {
        case PigAction.OUT_PEN:
          // 如果是出栏操作，则判断所选猪只中是有多少符合出栏操作的
          ableToActionPigs = pigsToConfig.filter((pig) => pig.inPen);
          break;
        case PigAction.IN_PEN:
          // 如果是入栏操作，则判断所选猪只中是有多少是没有在栏的
          ableToActionPigs = pigsToConfig.filter((pig) => !pig.inPen);
          break;
      }
      // 如果能操作的猪只数量和总共的猪只数量一样的，就直接发起操作
      if (allSelectedPigCount === ableToActionPigs.length) {
        return handlePigsAction(param, action, pigsToConfig);
      } else {
        return new Promise<boolean>((resolve, reject) => {
          if (!ableToActionPigs.length) {
            $info({
              title: t("pig.noPigAbleToActionTitle"),
              content: t("pig.noPigAbleToActionContent", { all: allSelectedPigCount, action: t("pig.constants." + action) }),
              onOk() {
                resolve(false);
              },
            });
          } else {
            $confirm({
              title: t("pig.partAbleToActionTitle", { action: t("pig.constants." + action) }),
              content: t("pig.partAbleToActionContent", { count: ableToActionPigs.length, all: allSelectedPigCount, action: t("pig.constants." + action) }),
              onOk() {
                const result = handlePigsAction(param, action, ableToActionPigs);
                result
                  .then(() => {
                    resolve(true);
                    refreshList([PigAction.OUT_PEN].includes(action));
                  })
                  .catch((err) => {
                    // // 如果是出栏操作，也需要刷新列表，因为出栏操作可能是部分成功部分失败
                    // [PigAction.OUT_PEN].includes(action) && refreshList(true);
                    handleResponseError(err);
                    reject();
                  });
                return result;
              },
            });
          }
        });
      }
    },
    [pigsToConfig, handlePigsAction, t, refreshList]
  );

  const handleMoveGroup = useCallback(
    (groupId: string) => {
      // 如果移动到全部组，就相当于修改groupIds字段为空数组
      return onActionDialogOk({ groupIds: groupId ? [groupId] : [] }, PigAction.MOVE_TO_GROUP);
    },
    [onActionDialogOk]
  );

  return (
    <Fragment>
      <MoveToGroupDialog
        type={GroupType.PIG}
        placeholder="pig.holders.moveGroup"
        title="pig.moveGroup"
        label="pig.pigGroup"
        open={dialogCtrls.get(PigAction.MOVE_TO_GROUP)}
        onOk={handleMoveGroup}
        onClose={onActionDialogClose}
      ></MoveToGroupDialog>
      <AddPigDialog open={dialogCtrls.get(PigAction.ADD)} onOk={refreshList} onClose={onActionDialogClose} />
      <AssociateField
        open={dialogCtrls.get(PigAction.IN_PEN)}
        onOk={(data: ModifyPigParams) => onActionDialogOk(data, PigAction.IN_PEN)}
        onClose={onActionDialogClose}
      ></AssociateField>
      <LeaveField open={dialogCtrls.get(PigAction.OUT_PEN)} onOk={(data: ModifyPigParams) => onActionDialogOk(data, PigAction.OUT_PEN)} onClose={onActionDialogClose}></LeaveField>
      <AssociateCurve
        open={dialogCtrls.get(PigAction.LINK_FEED_CURVE)}
        onOk={(data: ModifyPigParams) => onActionDialogOk(data, PigAction.LINK_FEED_CURVE)}
        onClose={onActionDialogClose}
      ></AssociateCurve>
      <AssociatePlan
        open={dialogCtrls.get(PigAction.LINK_FEED_PLAN)}
        onOk={(data: ModifyPigParams) => onActionDialogOk(data, PigAction.LINK_FEED_PLAN)}
        onClose={onActionDialogClose}
      ></AssociatePlan>
      <ModifyWeightStrategy
        open={dialogCtrls.get(PigAction.MODIFY_STRATEGY_LEVEL)}
        onOk={(data: ModifyPigParams) => onActionDialogOk(data, PigAction.MODIFY_STRATEGY_LEVEL)}
        onClose={onActionDialogClose}
      ></ModifyWeightStrategy>
      <ModifyPigState
        open={dialogCtrls.get(PigAction.MODIFY_PIG_STATE)}
        originStatus={onConfigPig?.pigState}
        onOk={(data: ModifyPigParams) => onActionDialogOk(data, PigAction.MODIFY_PIG_STATE)}
        onClose={onActionDialogClose}
      ></ModifyPigState>
    </Fragment>
  );
}
