import { DeviceAttributes, DeviceInfo } from "../models/device.model";
import { ByGroupPageLink, ResponseContent } from "../models/request.model";
import HttpController from "./http.controller";

interface ModifyDeviceParams {
  attributes?: DeviceAttributes;
  groupIds?: string[];
  enable?: boolean;
  tags?: string[];
  feedForageId?: string;
}

export class DeviceController extends HttpController {
  getDeviceByGroupId = (pageLink: ByGroupPageLink) => {
    return super.get<ResponseContent<DeviceInfo>>("/api/v2/devices", { params: pageLink.params });
  };

  getAvailableDevices = () => super.get<DeviceInfo[]>("/api/v2/devices/availableDevices");

  getDeviceDetail = (deviceId: string) => super.get<DeviceInfo>(`/api/v2/devices/${deviceId}`);

  modifyDevice = (deviceId: string, data: ModifyDeviceParams) => super.put(`/api/v2/devices/${deviceId}`, data);

  modifyDevices = (deviceIds: string[], data: ModifyDeviceParams) => {
    return super.all(deviceIds.map((id) => this.modifyDevice(id, data)));
  };
}

const deviceController = new DeviceController();

export default deviceController;
