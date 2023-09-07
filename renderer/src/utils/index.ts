import { AlertProps, alpha, createTheme, darken, PaletteColorOptions, SimplePaletteColorOptions, Theme } from "@mui/material";
import jwtDecode from "jwt-decode";
import moment, { Moment } from "moment";
import { TreeData } from "../models/base.model";
import { ConfirmConfigData, DeleteConfirmConfigData } from "../models/material.models";
import { store } from "../store";
import { openConfirmAction, openSnackBar } from "../store/toolSlice";
export * as Yup from "yup";

export function isNull(param: any): boolean {
  return [null, undefined, "", NaN].includes(param);
}

export const isProd = process.env.NODE_ENV === "production";

declare module "@mui/material" {
  interface SimplePaletteColorOptions {
    outlined?: string;
    hoverBg?: string;
  }
  interface PaletteColor {
    outlined?: string;
    hoverBg?: string;
  }
  interface PaletteOtherColorOptions extends SimplePaletteColorOptions {
    background?: string;
    white?: string;
    black?: string;
    mask?: string;
    standardInputLine?: string;
    divider?: string;
    input?: string;
  }
  interface PaletteOptions {
    secondary1?: PaletteColorOptions;
    secondary2?: PaletteColorOptions;
    other?: PaletteOtherColorOptions;
  }
  interface Palette {
    secondary1?: PaletteColor;
    secondary2?: PaletteColor;
    other?: PaletteOtherColorOptions;
  }
  interface Theme {
    commonBoxShadow?: string;
    custom?: {
      contentPadding?: string | number;
      background?: string;
      commonBg: string;
      headerAvatarColor: string;
      navItemHoverBg: string;
      tableBgColor?: string;
      templateConfigCardPadding?: string;
      borderColor?: string;
      tableColor?: string;
    };
  }
  interface ThemeOptions {
    commonBoxShadow?: string;
    custom?: {
      contentPadding?: string | number;
      background?: string;
      commonBg: string;
      headerAvatarColor: string;
      navItemHoverBg: string;
      tableBgColor?: string;
      templateConfigCardPadding?: string;
      borderColor?: string;
      tableColor?: string;
    };
  }
}

export interface ColorConfigOptions {
  main: string;
  light: string;
}

export const baseFontSize = 14;

export function generateTheme(mainColor = "#30A0FE"): Theme {
  const primary: ColorConfigOptions = { main: mainColor, light: "#64D0FF" };
  const secondary1: ColorConfigOptions = { main: "#3EC6BF", light: "#60E9E2" };
  const secondary2: ColorConfigOptions = { main: "#3465F8", light: "#528FFF" };
  const error: ColorConfigOptions = { main: "#FE6430", light: "#FF8A4A" };
  const warning: ColorConfigOptions = { main: "#FECA30", light: "#FFE559" };
  const success: ColorConfigOptions = { main: "#6FBE20", light: "#9DE961" };
  return createTheme({
    palette: {
      primary: {
        ...createThemeOptions(primary),
        // 明显差异的颜色的自定义，因为Mui会自己判断颜色是深色还是浅色，因此会给到按钮等组件的字体颜色，
        // 然而并不是每次判断都是准确的符合我们的设计的，因此这里也可以自定义
        contrastText: "#fff",
      },
      secondary1: createThemeOptions(secondary1),
      secondary2: createThemeOptions(secondary2),
      error: createThemeOptions(error),
      warning: createThemeOptions(warning),
      success: createThemeOptions(success),
      action: {
        active: "#0C112BA3",
        disabled: "#0C112B52",
      },
      other: { main: "", divider: "#0C112B1F", input: "#0C112B05" },
    },
    typography: {
      fontSize: (baseFontSize / 16) * 14,
      body1: {
        color: "#0C112BE0",
      },
      subtitle2: {
        color: "#0C112B99",
      },
    },
    // overrides: {
    //   MuiButton: {
    //     raisedPrimary: {
    //       color: "white",
    //     },
    //   },
    // },
    commonBoxShadow: "0px 2px 8px rgba(100, 129, 153, 0.12)",
    custom: {
      contentPadding: 16,
      commonBg: "#fff",
      background: "#F5F9FF",
      headerAvatarColor: "red",
      navItemHoverBg: `linear-gradient(89deg, #ffffff61, ${primary});opacity: 1`,
      tableBgColor: "red",
      templateConfigCardPadding: "12px 24px 12px 40px",
      borderColor: "rgba(0, 0, 0, 0.12)",
      tableColor: "#45484ede",
    },
  });
}

function createThemeOptions(colorOptions: ColorConfigOptions): SimplePaletteColorOptions {
  return {
    ...colorOptions,
    dark: darken(colorOptions.main, 0.2),
    outlined: alpha(colorOptions.main, 0.5),
    hoverBg: alpha(colorOptions.main, 0.08),
  };
}

export function timeFormat(date: string | number | Moment, format = "YYYY-MM-DD HH:mm") {
  if (isNull(date)) {
    return "";
  }
  return moment(date).format(format);
}

export function dateFormat(date: string | number | Moment, format = "YYYY/MM/DD") {
  return timeFormat(date, format);
}

export function message(type = "info" as AlertProps["severity"], content = "", duration = 3) {
  store.dispatch(openSnackBar({ open: true, type, content, duration }));
}
/**
 *
 * @param {string} content 显示的内容 可以直接写翻译参数
 * @param {number} [duration=3] 显示的时间 默认3秒
 */
export const $message = {
  success(content: string, duration = 3) {
    message("success", content, duration);
  },
  info(content: string, duration = 3) {
    message("info", content, duration);
  },
  warning(content: string, duration = 3) {
    message("warning", content, duration);
  },
  error(content: string, duration = 3) {
    message("error", content, duration);
  },
};
/**
 * @param {ConfirmConfigData} config
 * @description 对话确认框 用showWarningIcon来控制是否展示警告图表
 */
export function $confirm(config: ConfirmConfigData) {
  // 给定默认值
  const { showWarningIcon = true, showCancelButton = true, okText = "common.confirm", okBtnType = "primary", customContent = false, okBtnDisabled = false } = config;
  store.dispatch(openConfirmAction({ ...config, open: true, showWarningIcon, showCancelButton, okText, okBtnType, customContent, okBtnDisabled }));
}
export function $deleteConfirm(config: DeleteConfirmConfigData) {
  const {
    showWarningIcon = true,
    showCancelButton = true,
    okText = "common.delete",
    okBtnType = "error",
    customContent = false,
    okBtnDisabled = false,
    content = "common.deleteContent",
  } = config;
  store.dispatch(openConfirmAction({ open: true, showWarningIcon, showCancelButton, okText, okBtnType, customContent, okBtnDisabled, content, ...config }));
}
/**
 * @param {ConfirmConfigData} config
 * @description 信息提示确认框
 */
export function $info(config: ConfirmConfigData) {
  store.dispatch(openConfirmAction({ okBtnType: "primary", open: true, showCancelButton: false, okText: "common.confirm", onOk() {}, ...config }));
}

export function calcTreeLevel(data: TreeData): number {
  if (data.root_node) {
    return 0;
  }
  if (!data?.path) {
    return 1;
  }
  return data.path.split(",").length - 1;
}

export const ROOT_GROUP_ID = "group_id_demo";

export function initTreeData(data: TreeData[]) {
  const name = "ALL";
  const rootNode: TreeData = {
    root_node: true,
    path: null,
    children: data,
    id: ROOT_GROUP_ID,
    name,
    parentId: null,
  };
  return { groups: [rootNode], name, id: ROOT_GROUP_ID };
}

export function calcGroupId(id: string) {
  if (id === ROOT_GROUP_ID) {
    return null;
  }
  return id;
}

export function deepClone<T>(target: T, ignoreFields?: string[]): T {
  // 先判断是否为空
  if (target === null) {
    return target;
  }
  // 判断是否为时间对象
  if (target instanceof Date) {
    return new Date(target.getTime()) as any;
  }
  // 再判断是不是数组，如果是需要递归遍历克隆
  if (target instanceof Array) {
    const cp = [] as any[];
    (target as any[]).forEach((v) => {
      cp.push(v);
    });
    return cp.map((n: any) => deepClone<any>(n)) as any;
  }
  // 判断是不是object 如果是就需要一层层递归遍历
  if (typeof target === "object") {
    const cp = { ...(target as { [key: string]: any }) } as {
      [key: string]: any;
    };
    Object.keys(cp).forEach((k) => {
      // 判断遍历的key是否为需要忽略的key 不是就继续递归调用
      if (!ignoreFields || ignoreFields.indexOf(k) === -1) {
        cp[k] = deepClone<any>(cp[k]);
      }
    });
    return cp as T;
  }
  return target;
}

export function shallowClone<T = any>(obj: T): T {
  var clone = Object.create(Object.getPrototypeOf(obj));

  var props = Object.getOwnPropertyNames(obj);
  props.forEach(function (key) {
    var desc = Object.getOwnPropertyDescriptor(obj, key);
    Object.defineProperty(clone, key, desc);
  });

  return clone;
}

export function validateToken() {
  const token = window.localStorage.getItem("jwt_token");
  if (isNull(token)) {
    return false;
  }
  const expireTime = jwtDecode<{ exp: number }>(token)?.exp;
  if (isNull(expireTime)) {
    return false;
  }
  return expireTime * 1000 > new Date().valueOf();
}

export const commonPageSize = 8;

export function getTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
