import { GroupType, TreeData } from "../models/base.model";
import HttpController from "./http.controller";

export class GroupController extends HttpController {
  getGroupTree = (type: GroupType) => super.get<TreeData[]>("/api/v2/groups/tree", { params: { type } });

  createGroup = (data: { name: string; parentId: string; type: GroupType }) => super.post("/api/v2/groups", data);

  renameGroup = (name: String, groupId: string) => super.put(`/api/v2/groups/${groupId}`, { name });

  deleteGroup = (groupId: string) => {
    try {
      const result = super.delete(`/api/v2/groups/${groupId}`);
      return result;
    } catch (error) {}
  };
}

const groupController = new GroupController();

export default groupController;
