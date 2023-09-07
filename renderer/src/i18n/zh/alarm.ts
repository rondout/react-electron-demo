import { LocaleFile } from "..";

const alarm: LocaleFile = {
  WEIGHING_MODULE_ERROR: "设备称重模块异常，读取不到料槽重量。",
  MOTOR_ERROR: "设备电机异常",
  TROUGH_WEIGHT_ERROR: "设备料槽重量异常",
  EMPTY_BUCKET: "设备料桶为空",
  DEVICE_PEN_EMPTY: "设备栏位号为空",
  CURVE_ABOUT_TO_OVER: "设备饲喂曲线即将执行完毕",
  CURVE_EXECUTED: "设备饲喂曲线已经执行完毕",
  READ_BUCKET_ERROR: "设备读取料桶状态异常",
  DEVICE_CUT_FORAGE_ERROR: "设备下料异常",
  DEVICE_CUT_FORCE_LESS_THAN_ALARM_VALUE: "猪只采食量异常(采食量过低)",
  device: "设备",
  alarmType: "告警类型",
  alarmLevel: {
    error: "错误",
    serious: "严重",
    warn: "警告",
  },
};

export default alarm;
