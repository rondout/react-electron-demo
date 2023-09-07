import { AuditLogInfo } from "../models/pig.model";
import { GetAuditLogPageLink, ResponseContent } from "../models/request.model";
import HttpController from "./http.controller";

export class UserController extends HttpController {
  login = (params: { username: String; password: string }) => super.post<{ accessToken: string }>("/api/v2/users/authenticate", params);

  modifyPassword = (data: { oldPassword: string; newPassword: string }) => super.put("/api/v2/users/password", data);

  getAuditLogs = (params: GetAuditLogPageLink) => super.get<ResponseContent<AuditLogInfo>>("/api/v2/auditLogs", { params });
}

const userController = new UserController();

export default userController;
