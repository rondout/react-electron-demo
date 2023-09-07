import i18next from "i18next";
import { $message, calcGroupId, isNull } from "../utils";
import { BaseData } from "./base.model";

export type SortOrder = "Ascending" | "Descending";

// http请求的返回值
export interface BaseResponse {
  success?: boolean;
  respCode?: number;
  errorCode?: number;
  errMsg?: string;
}
// 带分页数据的返回值
export interface BaseResponseData extends BaseResponse {
  total?: number;
  totalElements?: number;
  hasNext?: boolean;
  last?: boolean;
}
// 分页数据键值为data
export interface ResponseData<T = BaseData> extends BaseResponseData {
  data: T[];
}
// 分页数据键值为content
export interface ResponseContent<T = BaseData> extends BaseResponseData {
  result: T[];
}
export interface FetchDataFunction<T = BaseData> {
  (pageLink: PageLink): Promise<ResponseData<T>>;
}
// 分页查询参数pageLink
export interface PageLinkInterface<S = string> {
  pageOffset: number;
  pageSize: number;
  sortBy?: S;
  direction?: SortOrder;
  textSearch?: string;
  [propName: string]: any;
}
export class BasePageLink {
  constructor(public pageOffset: number = 0, public pageSize: number = 10) {}
}
/**
 *
 * @description 分页查询参数pageLink的实现类
 * @class PageLink
 * @implements {PageLinkInterface}
 */
export class PageLink<S = string> extends BasePageLink implements PageLinkInterface<S> {
  constructor(
    public pageOffset: number = 0,
    public pageSize: number = 10,
    public textSearch?: string,
    public sortBy?: S,
    public direction?: SortOrder,
    public fetchTrigger?: (p?: PageLinkInterface) => boolean,
    ...rest: any[]
  ) {
    super(pageOffset, pageSize);
    try {
      rest?.forEach((item) => {
        Object.entries(item).forEach(([key, value]) => {
          this[key] = value;
        });
      });
    } catch (error) {}
  }

  public get params() {
    return JSON.parse(JSON.stringify(this));
  }
}
// 获取审计日志pageLink
export class GetAuditLogPageLink extends PageLink {
  public additionalInfoFilter: string;
  constructor(public pageOffset: number = 0, public pageSize: number = 10, additionalFilterObj?: { [propName: string]: any }) {
    super(pageOffset, pageSize);
    try {
      this.additionalInfoFilter = Object.entries(additionalFilterObj)
        .filter((v) => !isNull(v[1]))
        ?.map((v) => v[0] + ":" + v[1])
        .join();
    } catch (error) {}
  }
}
// 通过组id获取设备和猪只列表的专用pageLink
export class ByGroupPageLink<F = any, T = any, S = string> extends PageLink<S> {
  public groupId: string;
  public queryAssociatedEntities = true;

  constructor(
    public pageOffset: number = 0,
    public pageSize: number = 10,
    groupId: string,
    public textSearchObj?: T,
    public filtersObj?: F,
    public fetchTrigger: (p?: PageLinkInterface) => boolean = () => true,
    public active?: boolean,
    public enable?: boolean,
    // public type?: boolean,
    public sn?: string,
    public sortBy?: S,
    public direction?: SortOrder,
    public tags?: string,
    ...rest: any[]
  ) {
    super(pageOffset, pageSize, undefined, sortBy, direction, fetchTrigger, ...rest);
    this.groupId = calcGroupId(groupId);
    this.fetchTrigger = function () {
      return !!this.groupId;
    };
  }

  public get attributesFilter() {
    try {
      return Object.entries(this.filtersObj)
        .filter((v) => !isNull(v[1]))
        ?.map((v) => v[0] + ":" + v[1])
        .join();
    } catch (error) {
      return undefined;
    }
  }

  public get attributesSearch() {
    try {
      return Object.entries(this.textSearchObj)
        ?.map((v) => v[0] + ":" + v[1])
        .join();
    } catch (error) {
      return undefined;
    }
  }

  public get params() {
    const { attributesFilter, attributesSearch, pageOffset, pageSize, groupId, active, enable, sn, queryAssociatedEntities, tags } = this;
    return { attributesFilter, attributesSearch, pageOffset, pageSize, active: active, enable, sn, queryAssociatedEntities, tags, groupId: calcGroupId(groupId) };
  }
}

export interface TextSearchParams {
  textSearch: string;
}
export const MAX_SAFE_PAGE_SIZE = 2147483647;

export function handleResponseError(err: any) {
  err?.data?.errorMessage && $message.error(err.data.errorMessage);
}

export const tokenIgnoredUrls = ["/api/v2/users/authenticate"];

export function ignoreToken(url: string) {
  return tokenIgnoredUrls.includes(url);
}

export interface MultiRequestResponse {
  item: string;
  success: boolean;
  msg?: string;
  id: string;
}
/**
 *
 * @param promiseRes
 * @param  {{number}} totalCount
 * @description 处理多选操作的结果（多少成功，多少失败，并给相应的提示）
 * @returns
 */
export async function handleMultiRequestResponse(
  promiseRes: Promise<MultiRequestResponse[]>,
  totalCount: number
): Promise<{ successedIds: string[]; success: "all" | "part" | "false"; reason?: string }> {
  // 这里需要判断是全部成功还是部分成功
  try {
    const res = await promiseRes;
    return new Promise((resolve, reject) => {
      const successedRequests = res.filter((v) => v.success);
      const failedRequests = res.filter((v) => !v.success);
      const reason = failedRequests.map((v) => v.item + ": " + v.msg).join();
      const successedIds = successedRequests.map((v) => v.id);
      if (successedRequests.length === totalCount) {
        // 全部成功
        $message.success("common.operateSuccessed");
        resolve({ success: "all", successedIds });
      } else if (successedRequests.length === 0) {
        // 如果全部失败
        $message.error(i18next.t("common.operateFailed", { reason }));
        reject({ success: "false", successedIds, reason: failedRequests.map((v) => v.item + ": " + v.msg).join() });
      } else {
        // 如果部分成功
        $message.error(i18next.t("common.operatePartlySuccessed", { reason: reason }));
        resolve({ success: "part", successedIds, reason });
        // reject();
      }
    });
  } catch (error) {
    return Promise.reject();
  }
}
