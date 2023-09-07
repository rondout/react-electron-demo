import { AlarmItemType } from "../models/alarm.model";
import { PageLinkInterface, ResponseContent } from "../models/request.model";
import HttpController from "./http.controller";

export class AlarmController extends HttpController {
  getAlarms = (params: PageLinkInterface) => super.get<ResponseContent<AlarmItemType>>("/api/v2/alarms", { params });
}

const alarmController = new AlarmController();

export default alarmController;
