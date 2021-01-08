export class Notification {
  id: number;
  runId: number;
  type: string;
  nodeId: string;
  componentId: string;
  nodePosition: string;
  nodePositionAndTitle: string;
  periodId: number;
  fromWorkgroupId: number;
  toWorkgroupId: number;
  message: string;
  data: string;
  groupId: string;
  timeGenerated: number;
  timeDismissed: number;
  constructor(jsonObject: any = {}) {
    for (const key of Object.keys(jsonObject)) {
      if (jsonObject[key] != null) {
        this[key] = jsonObject[key];
      }
    }
  }
}
