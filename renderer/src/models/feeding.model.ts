import { nanoid } from "nanoid";
import { MatSelectOptionFactory } from "../components/common/mui/MatSelect";
import { BaseData } from "./base.model";

export interface CurveConfigDataParam {
  curveName: string;
  curveData: FeedCurveItem[];
  curveCriticalPoint?: number;
}

export interface FeedCurveType extends BaseData, CurveConfigDataParam {
  updatedTime?: number | string;
  days?: number;
}

export interface PlanConfigDataParam {
  planName: string;
  planData: FeedPlanItem[];
}

export interface FeedPlanType extends BaseData, PlanConfigDataParam {
  // stage: number;
  updatedTime?: number | string;
}

export interface FeedForage extends BaseData {
  forageName: string;
  weight1: number;
  weight2: number;
  weight3: number;
  multiturn: number;
  ratio: number;
  reportTime: string | number;
  createdTime?: string | number;
  updatedime?: string | number;
}

// export interface FeedPlanItem extends BaseData {
//   stage: number;
//   startTime: string;
// }

export const feedPlanTimes = Array.from({ length: 48 })
  .map((item, index) => {
    const h = Math.floor(index / 2);
    const m = index % 2;
    const hTitle = h <= 9 ? "0" + h : h;
    const mTitle = m === 0 ? "00" : "30";
    return hTitle + ":" + mTitle;
  })
  .concat("23:59");

export const feedPlanSelectOptions = feedPlanTimes.map((item) => new MatSelectOptionFactory(item, item, true));

export interface FeedPlanItem extends BaseData {
  stage: number;
  startTime: string;
  endTime: string;
  timeInterval: number;
  percent: number;
  touchInterval: number;
  touchWeight: number;
}

export const feedPlanIntervalSelectOptions = [5, 10, 15, 30, 45, 60, 90].map((item) => new MatSelectOptionFactory(item, item + " min"));

export interface FeedCurveItem extends BaseData {
  day: number;
  min: number;
  warn: number;
  target: number;
  max: number;
}

export class FeedCurveDetailFactory implements FeedCurveType {
  constructor(public id: string = nanoid(), public curveName: string = "", public curveData: FeedCurveItem[] = [new FeedCurveItemFactory()], public days: number = 1) {}
}

export class FeedPlanFactory implements FeedPlanType {
  constructor(public id: string = nanoid(), public planName: string = "", public planData: FeedPlanItem[] = [new FeedPlanItemFactory()]) {}
}

export type FeedCurveItemKey = keyof FeedCurveItem;

export type FeedPlanItemKey = keyof FeedPlanItem;

export class FeedCurveItemFactory implements FeedCurveItem {
  constructor(public day: number = 1, public min: number = 0, public warn: number = 0, public target: number = 0, public max: number = 0, public id: string = nanoid()) {}
}

export class FeedPlanItemFactory implements FeedPlanItem {
  constructor(
    public stage = 1,
    public startTime = feedPlanTimes[0],
    public endTime = feedPlanTimes[0],
    public timeInterval = 30,
    public percent = 0,
    public id = nanoid(),
    public touchWeight: number = 0,
    public touchInterval: number = 30
  ) {}
}

export enum FeedCurveAction {
  EDIT,
  COPY,
  DELETE,
}

export enum FeedPlanAction {
  EDIT,
  COPY,
  DELETE,
}

/**
 *
 * @param curve
 * @description 校验饲喂曲线配置是否正确
 * @returns
 */
export function validateFeedCurveItem(curve: FeedCurveItem): boolean {
  const { min, warn, target, max } = curve;

  if (min >= 100 && min <= warn && warn <= target && target <= max) {
    return true;
  }
  return false;
}
/**
 *
 * @param {number} plan
 * @description 校验饲喂计划配置是否正确
 * @returns {boolean} 结果
 */
export function validateFeedPlanItemData(plan: FeedPlanItem): boolean {
  const { startTime, endTime, percent, touchWeight } = plan;
  // 如果开始时间大于结束时间  则返回错误（校验失败）
  if (feedPlanTimes.findIndex((v) => v === startTime) >= feedPlanTimes.findIndex((v) => v === endTime)) {
    return false;
  }
  // 如果百分比或者触碰下料小于等于0  同样返回错误
  if (percent <= 0 || touchWeight <= 0) {
    return false;
  }
  return true;
}
/**
 *
 * @param item 需要校验的饲喂计划数据
 * @param prevItem 相比较的（前一个）饲喂计划数据
 */
export function validateFeedPlanItemTime(item: FeedPlanItem, prevItem: FeedPlanItem) {
  if (!prevItem) {
    return true;
  }
  if (item.startTime < prevItem.endTime) {
    return false;
  }
  return true;
}

export enum FeedingStatus {
  NORMAL,
  ERROR,
}

export enum FeedingMethod {
  // 定时下料
  TIMER = "TIMER",
  // 触碰下料
  TOUCH = "TOUCH",
  // 手动下料
  MANUAL = "MANUAL",
  // NONE
  NONE = "NONE",
}

export const FeedingMethodLabelMap = new Map<FeedingMethod, string>([
  [FeedingMethod.TIMER, "feed.feedMethods.TIMER"],
  [FeedingMethod.TOUCH, "feed.feedMethods.TOUCH"],
  [FeedingMethod.MANUAL, "feed.feedMethods.MANUAL"],
  [FeedingMethod.NONE, "NONE"],
]);

export interface FeedRecordItem extends BaseData {
  feedTime: string;
  metaData: {
    sn: string;
    pigNumber: string;
  };
  feedType: FeedingMethod;
  feedWeight: number;
  troughWeight: number;
}

export interface DailyFeedData {
  day: string;
  totalFeedWeight: number;
}
