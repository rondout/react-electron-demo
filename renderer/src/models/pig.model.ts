import { MatSelectOptionFactory } from "../components/common/mui/MatSelect";
import { BaseData, BaseNameData, OperationMenu, TreeData } from "./base.model";
import { DeviceAttributes } from "./device.model";
import { FeedCurveItem, FeedingStatus } from "./feeding.model";

// 设备组信息
export interface PigGroupInfo extends BaseNameData, TreeData {}

export enum PigStatus {
  // 妊娠
  GESTATION = "GESTATION",
  // 分娩
  PARTURITION = "PARTURITION",
  // 离栏
  OUT_PEN = "OUT_PEN",
}

export enum PigAction {
  ADD = "ADD",
  IN_PEN = "IN_PEN",
  DELETE = "DELETE",
  MOVE_TO_GROUP = "MOVE_TO_GROUP",
  MODIFY_PIG_STATE = "MODIFY_PIG_STATE",
  LINK_FEED_CURVE = "LINK_FEED_CURVE",
  LINK_FEED_PLAN = "LINK_FEED_PLAN",
  MODIFY_STRATEGY_LEVEL = "MODIFY_STRATEGY_LEVEL",
  OUT_PEN = "OUT_PEN",
  // 下面三种仅存在于服务端（和设备端），前端只做展示
  TIMER = "TIMER",
  TOUCH = "TOUCH",
  MANUAL = "MANUAL",
  NONE = "NONE",
}

export interface AuditLogInfo extends BaseNameData {
  createdTime: string;
  additionalInfo: {
    associatedPig: {
      pigNumber: string;
      pigUpdateName: PigAction;
    };
  };
}

export const pigActionLabelMap = new Map<PigAction, string>([
  [PigAction.MODIFY_PIG_STATE, "pig.constants.MODIFY_PIG_STATE"],
  [PigAction.MOVE_TO_GROUP, "pig.constants.MOVE_TO_GROUP"],
  [PigAction.MANUAL, "pig.constants.MANUAL"],
  [PigAction.TIMER, "pig.constants.TIMER"],
  [PigAction.TOUCH, "pig.constants.TOUCH"],
  [PigAction.NONE, "pig.constants.NONE"],
  [PigAction.LINK_FEED_CURVE, "pig.constants.LINK_FEED_CURVE"],
  [PigAction.LINK_FEED_PLAN, "pig.constants.LINK_FEED_PLAN"],
  [PigAction.MODIFY_STRATEGY_LEVEL, "pig.constants.MODIFY_STRATEGY_LEVEL"],
  [PigAction.IN_PEN, "pig.constants.IN_PEN"],
  [PigAction.OUT_PEN, "pig.constants.OUT_PEN"],
  [PigAction.DELETE, "pig.constants.DELETE"],
]);

// 设备action列表
export const pigActionOptions: OperationMenu<PigAction>[] = [
  new OperationMenu(PigAction.MODIFY_PIG_STATE, pigActionLabelMap.get(PigAction.MODIFY_PIG_STATE), "ic_edit "),
  new OperationMenu(PigAction.MOVE_TO_GROUP, pigActionLabelMap.get(PigAction.MOVE_TO_GROUP), "ic_move"),
  new OperationMenu(PigAction.LINK_FEED_CURVE, pigActionLabelMap.get(PigAction.LINK_FEED_CURVE), "ic_curve"),
  new OperationMenu(PigAction.LINK_FEED_PLAN, pigActionLabelMap.get(PigAction.LINK_FEED_PLAN), "ic_plan"),
  new OperationMenu(PigAction.MODIFY_STRATEGY_LEVEL, pigActionLabelMap.get(PigAction.MODIFY_STRATEGY_LEVEL), "ic_stratege"),
  new OperationMenu(PigAction.IN_PEN, pigActionLabelMap.get(PigAction.IN_PEN), "ic_enter"),
  new OperationMenu(PigAction.OUT_PEN, pigActionLabelMap.get(PigAction.OUT_PEN), "ic_out"),
  new OperationMenu(PigAction.DELETE, pigActionLabelMap.get(PigAction.DELETE), "ic_delete"),
];
export const createPigDetailOptionMenus = (pigInfo?: PigInfo) => {
  const [MODIFY_PIG_STATE, MOVE_TO_GROUP, LINK_FEED_CURVE, LINK_FEED_PLAN, MODIFY_STRATEGY_LEVEL, IN_PEN, OUT_PEN, DELETE] = pigActionOptions;
  // 通过是否传入pigInfo判断是单个操作还是多个操作，多个操作没有入栏
  if (!pigInfo) {
    return [MODIFY_PIG_STATE, MOVE_TO_GROUP, LINK_FEED_CURVE, LINK_FEED_PLAN, MODIFY_STRATEGY_LEVEL, OUT_PEN, DELETE];
  }
  // 如果是出栏状态，就只有入栏和删除
  if (!pigInfo.inPen) {
    return [IN_PEN, DELETE];
  } else {
    const options = [...pigActionOptions];
    options.splice(5, 1);
    return options;
  }
};

export const strategyLevelSelectOptions = [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200].map(
  (item) => new MatSelectOptionFactory(item / 100, item + "%")
);

export const pigStateSelectOptions = [
  new MatSelectOptionFactory(PigStatus.GESTATION, "pig.statusLabel.GESTATION"),
  new MatSelectOptionFactory(PigStatus.PARTURITION, "pig.statusLabel.PARTURITION"),
  // new MatSelectOptionFactory(PigStatus.OUT_PEN, "pig.statusLabel.OUT_PEN"),
];

export interface BasePigInfo {
  pigNumber: string;
  pigState?: PigStatus;
  devicePen?: string;
  name?: string;
  inPen?: boolean;
}

export interface ModifyPigParams {
  pigState?: PigStatus;
  curveId?: string;
  planId?: string;
  strategyLevel?: number;
  curveStartDate?: string;
  outPenTime?: string | number;
  deviceId?: string;
  groupIds?: string[];
  inPen?: boolean;
  devicePenId?: string;
  inPenTime?: string;
}

export interface PigInfo extends BaseData, BasePigInfo, ModifyPigParams {
  days: number;
  feedingStatus: FeedingStatus;
  additionalInfo: {
    associatedCurve: { curveName: string; curveData: FeedCurveItem[] };
    associatedPlan: { planName: string };
    associatedDevice: {
      sn: string;
      attributes: DeviceAttributes;
    };
  };
}

export const initActionDialogOpen = new Map<PigAction, boolean>([
  [PigAction.MODIFY_PIG_STATE, false],
  [PigAction.MOVE_TO_GROUP, false],
  [PigAction.ADD, false],
  [PigAction.LINK_FEED_CURVE, false],
  [PigAction.LINK_FEED_PLAN, false],
  [PigAction.MODIFY_STRATEGY_LEVEL, false],
  [PigAction.OUT_PEN, false],
  [PigAction.IN_PEN, false],
]);
