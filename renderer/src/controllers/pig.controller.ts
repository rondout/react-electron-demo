import { BasePigInfo, ModifyPigParams, PigInfo } from "../models/pig.model";
import { MultiRequestResponse, PageLinkInterface, ResponseContent } from "../models/request.model";
import { calcGroupId } from "../utils";
import HttpController from "./http.controller";

export class PigController extends HttpController {
  getPigsByGroupId = (pageLink: PageLinkInterface) => {
    return super.get<ResponseContent<PigInfo>>("/api/v2/pigs", { params: { ...pageLink.params, groupId: calcGroupId(pageLink.groupId) } });
  };

  getPigDetailsById = (pigId: string) => super.get<PigInfo>(`/api/v2/pigs/${pigId}`);

  createPig = (data: BasePigInfo) => super.post("/api/v2/pigs", data);

  modifyPig = (pigId: string, data: ModifyPigParams) => super.put(`/api/v2/pigs/${pigId}`, data);

  multipleModifyPigs = (pigs: PigInfo[], data: ModifyPigParams) => {
    const promises = pigs.map(
      (pig) =>
        new Promise<MultiRequestResponse>((resolve) => {
          this.modifyPig(pig.id, data)
            .then(() => {
              resolve({ item: pig.pigNumber, id: pig.id, success: true });
            })
            .catch((err) => {
              resolve({ item: pig.pigNumber, id: pig.id, success: false, msg: err?.data?.errorMessage });
            });
        })
    );
    return Promise.all(promises);
  };

  deletePig = (pigId: string) => super.delete(`/api/v2/pigs/${pigId}`);

  deletePigs = (pigs: PigInfo[]) => {
    const promises = pigs.map(
      (pig) =>
        new Promise<MultiRequestResponse>((resolve) => {
          this.deletePig(pig.id)
            .then(() => {
              resolve({ item: pig.pigNumber, id: pig.id, success: true });
            })
            .catch((err) => {
              resolve({ item: pig.pigNumber, id: pig.id, success: false, msg: err?.data?.errorMessage });
            });
        })
    );
    return Promise.all(promises);
  };
  //  super.all(pigIds.map((pigId) => super.delete(`/api/v2/pigs/${pigId}`)));

  // getPigActionLogs = (params: PageLink) => {
  //   const data = mockLogs.slice(params.pageOffset * params.pageSize, (params.pageOffset + 1) * params.pageSize);
  //   return new Promise<ResponseContent<PigActionLogType>>((resolve) => {
  //     setTimeout(() => resolve({ result: data, totalElements: 26, total: 4, success: true }), 300);
  //   });
  // };
}

const pigController = new PigController();

export default pigController;
