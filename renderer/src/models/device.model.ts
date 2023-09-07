import { BaseData, OperationMenu, TreeData } from "./base.model";

// 设备组信息
export type DeviceGroupInfo = TreeData;
// 设备操作action
export enum DeviceAction {
  ENABLE,
  DISABLE,
  MOVE_TO_GROUP,
  ASSOCIATE_FODDER,
  SET_TAG,
}
// 料桶状态
export enum BucketStatus {
  FULL = "full",
  EMPTY = "empty",
}
// 设备类型
export enum DeviceType {
  JS = "VT-HMI05-IM8XMM-JS",
  JS_LITE = "VT-HMI05-IM8XMM-JS-LITE",
}
//
export const deviceTypeFilters = [new OperationMenu(null, "common.all"), new OperationMenu(DeviceType.JS, "JS"), new OperationMenu(DeviceType.JS_LITE, "JS_LITE")];
export const activeFilters = [new OperationMenu(null, "common.all"), new OperationMenu(true, "device.online"), new OperationMenu(false, "device.offline")];
// deviceStatusFilters
export const deviceStatusFilters = [new OperationMenu(null, "common.all"), new OperationMenu(true, "common.enable"), new OperationMenu(false, "common.disable")];
// bucketStateFilter
export const bucketStateFilter = [
  new OperationMenu(null, "common.all"),
  new OperationMenu(BucketStatus.FULL, "device.bucketStateLbels.FULL"),
  new OperationMenu(BucketStatus.EMPTY, "device.bucketStateLbels.EMPTY"),
];
export interface DeviceAttributes {
  deviceType?: DeviceType; // product
  product?: DeviceType;
  ipAddress?: string;
  bucketState?: BucketStatus;
  devicePen?: string;
  troughWeight?: number;
}
// 设备信息
export interface DeviceInfo extends BaseData {
  // 设备编号
  sn: string;
  // 栏位
  devicePen: string;
  // 设备类型
  type: DeviceType;
  // 标签
  tags: string[];
  // 在线状态
  active: boolean;
  // tankWeight: number;
  // bucketState: BucketStatus;
  // 启用状态
  enable: boolean;
  // 设备端属性
  attributes: DeviceAttributes;
  // 饲料ID
  feedForageId: string;
  // 其他属性
  additionalInfo: {
    associatedFeedForage: {
      forageName: string;
    };
  };
}
