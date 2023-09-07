import { CurveConfigDataParam, DailyFeedData, FeedCurveType, FeedForage, FeedPlanType, FeedRecordItem, PlanConfigDataParam } from "../models/feeding.model";
import { MultiRequestResponse, PageLink, PageLinkInterface, ResponseContent } from "../models/request.model";
import { getTimezone } from "../utils";
import HttpController from "./http.controller";

export interface GetDailyFeedDataParams {
  startDate: string;
  endDate: string;
  pigNumber?: string;
  sn?: string;
}

export class FeedController extends HttpController {
  getFeedCurves = (params: PageLink) => super.get<ResponseContent<FeedCurveType>>("/api/v2/feedCurves", { params });

  getForages = (params: PageLink) => super.get<ResponseContent<FeedForage>>("/api/v2/feedForages", { params });

  modifyForage = (forageId: string, data: { forageName: string }) => super.put(`/api/v2/feedForages/${forageId}`, data);

  getForageDetail = (forageId: string) => super.get<FeedForage>(`/api/v2/feedForages/${forageId}`);

  createCurve = (data: CurveConfigDataParam) => super.post("/api/v2/feedCurves", data);

  getCurveDetail = (curveId: string) => super.get<FeedCurveType>(`/api/v2/feedCurves/${curveId}`);

  modifyCurve = (curveId: string, data: CurveConfigDataParam) => super.put(`/api/v2/feedCurves/${curveId}`, data);

  deleteCurve = (curveId: string) => super.delete(`/api/v2/feedCurves/${curveId}`);

  deleteCurves = (curves: FeedCurveType[]) => {
    const promises = curves.map(
      (curve) =>
        new Promise<MultiRequestResponse>((resolve) => {
          this.deleteCurve(curve.id)
            .then(() => {
              resolve({ item: curve.curveName, id: curve.id, success: true });
            })
            .catch((err) => {
              resolve({ item: curve.curveName, id: curve.id, success: false, msg: err?.data?.errorMessage });
            });
        })
    );
    return Promise.all(promises);
  };

  createPlan = (data: PlanConfigDataParam) => super.post("/api/v2/feedPlans", data);

  getFeedPlans = (params: PageLink) => super.get<ResponseContent<FeedPlanType>>("/api/v2/feedPlans", { params });

  getPlanDetail = (planId: string) => super.get<FeedPlanType>(`/api/v2/feedPlans/${planId}`);

  modifyPlan = (planId: string, data: PlanConfigDataParam) => super.put(`/api/v2/feedPlans/${planId}`, data);

  deletePlan = (planId: string) => super.delete(`/api/v2/feedPlans/${planId}`);

  deletePlans = (plans: FeedPlanType[]) => {
    const promises = plans.map(
      (plan) =>
        new Promise<MultiRequestResponse>((resolve) => {
          this.deletePlan(plan.id)
            .then(() => {
              resolve({ item: plan.planName, id: plan.id, success: true });
            })
            .catch((err) => {
              resolve({ item: plan.planName, id: plan.id, success: false, msg: err?.data?.errorMessage });
            });
        })
    );
    return Promise.all(promises);
  };

  getFeedRecords = (params: PageLinkInterface) => super.get<ResponseContent<FeedRecordItem>>(`/api/v2/feedRecords`, { params: { ...params, timezone: getTimezone() } });

  getFeedRecordByDay = (params: GetDailyFeedDataParams) => super.get<DailyFeedData[]>("/api/v2/feedRecords/statisticsByDay", { params: { ...params, timezone: getTimezone() } });
}

const feedController = new FeedController();

export default feedController;
