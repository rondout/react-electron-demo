import { BaseData } from "./base.model";
import { DeviceAttributes } from "./device.model";

export enum AlarmCode {
  WEIGHING_MODULE_ERROR = "401",
  MOTOR_ERROR = "402",
  TROUGH_WEIGHT_ERROR = "403",
  EMPTY_BUCKET = "404",
  DEVICE_PEN_EMPTY = "405",
  CURVE_ABOUT_TO_OVER = "406",
  CURVE_EXECUTED = "407",
  READ_BUCKET_ERROR = "408",
  DEVICE_CUT_FORAGE_ERROR = "409",
  DEVICE_CUT_FORCE_LESS_THAN_ALARM_VALUE = "410",
}

export const alarmCodeToLabelMap = new Map<AlarmCode, string>([
  [AlarmCode.WEIGHING_MODULE_ERROR, "alarm.WEIGHING_MODULE_ERROR"],
  [AlarmCode.MOTOR_ERROR, "alarm.MOTOR_ERROR"],
  [AlarmCode.TROUGH_WEIGHT_ERROR, "alarm.TROUGH_WEIGHT_ERROR"],
  [AlarmCode.EMPTY_BUCKET, "alarm.EMPTY_BUCKET"],
  [AlarmCode.DEVICE_PEN_EMPTY, "alarm.DEVICE_PEN_EMPTY"],
  [AlarmCode.CURVE_ABOUT_TO_OVER, "alarm.CURVE_ABOUT_TO_OVER"],
  [AlarmCode.CURVE_EXECUTED, "alarm.CURVE_EXECUTED"],
  [AlarmCode.READ_BUCKET_ERROR, "alarm.READ_BUCKET_ERROR"],
  [AlarmCode.DEVICE_CUT_FORAGE_ERROR, "alarm.DEVICE_CUT_FORAGE_ERROR"],
  [AlarmCode.DEVICE_CUT_FORCE_LESS_THAN_ALARM_VALUE, "alarm.DEVICE_CUT_FORCE_LESS_THAN_ALARM_VALUE"],
]);

export interface AlarmItemType extends BaseData {
  msg: string;
  code: AlarmCode;
  detail: string;
  level: "error" | "serious" | "warn";
  time: number | string;
  deviceId: string;
  additionalInfo: {
    associatedDevice: {
      sn: string;
      attributes: DeviceAttributes;
    };
  };
}

export const AlarmLevelIconMap = new Map<AlarmItemType["level"], string>([
  ["error", "ic_error"],
  ["serious", "ic_alert_red"],
  ["warn", "ic_alert1"],
]);
