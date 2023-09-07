// import ActionType from "../store/action.type";

import { SxProps } from "@mui/material";
import React, { KeyboardEvent, ReactNode } from "react";
// import { Authority, LicenseInfo } from "./user.model";
// 语言
export enum Languages {
  zh = "zh_CN",
  en = "en_US",
}

export interface BaseData<T = string> {
  id: T;
}

export interface BaseNameData<T = string> extends BaseData<T> {
  name: string;
}

export interface UserInfo extends BaseData {
  username: string;
  password: string;
}
export class OperationMenu<T = any> {
  public customStartComponent?: ReactNode;
  constructor(public action: T, public title: string, public icon?: any, public showDivider?: boolean, public disabled?: boolean) {}
}
// 自定义操作按钮选项
export class CustomOperationMenu<T = any> extends OperationMenu<T> {
  constructor(public action: T, public title: string, public customStartComponent?: ReactNode, public icon?: any, public showDivider?: boolean, public disabled?: boolean) {
    super(action, title, icon, showDivider, disabled);
  }
}
// 步骤条item类型
export class StepsItem<T> {
  constructor(public label: string, public path: string, public key: T, public component?: React.ReactNode) {}
}
// form表单的类型
export interface MatFormItemProps<T = string> {
  value: T;
  name?: string;
  label?: string;
  // options: MatSelectOption[];
  required?: boolean;
  onBlur?: (e: any) => void;
  onChange?: (e: any) => void;
  onKeyPress?: (e: KeyboardEvent) => void;
  error?: boolean;
  helperText?: string;
  placeholder?: string;
  width?: number;
  disabled?: boolean;
  sx?: SxProps;
  [propsName: string]: any;
}
// Mui开关的props
export interface MatSwitchItem<T = string> {
  key: string;
  label: string;
  tip?: T;
  defaultValue?: boolean;
}

export class MatSwitchItemFactory<T = string> implements MatSwitchItem<T> {
  label: string;
  constructor(public key: string, label?: string, public tip?: T) {
    if (!label) {
      this.label = key;
    }
  }
}

export interface TreeData extends BaseData, BaseNameData {
  parentId: string;
  path: string;
  root_node?: boolean;
  children?: TreeData[];
  [propName: string]: any;
}

export function treeDataToList(data: TreeData[]) {
  const dataList: BaseNameData[] = [{ name: "ALL", id: "ALL" }];

  function flatTree(tree: TreeData) {
    const { name, id, children } = tree;
    dataList.push({ name, id });
    children?.map((child) => flatTree(child));
  }
  data.forEach((item) => flatTree(item));
  return dataList;
}

export type SortOrder = "Ascending" | "Descending";

export enum GroupType {
  DEVICE = "DEVICE",
  PIG = "PIG",
}

export interface ExtraConfig {
  version: string;
  base_url: string;
}
