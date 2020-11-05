import { StudentDataService } from "../../../../services/studentDataService";

class NodeStatusIconController {
  nodeId: string;
  nodeStatus: any;

  static $inject = ['StudentDataService'];

  constructor(private StudentDataService: StudentDataService) {}

  $onChanges() {
    this.nodeStatus = this.StudentDataService.nodeStatuses[this.nodeId];
  }
}

export const NodeStatusIcon = {
  bindings: {
    nodeId: '<',
    customClass: '<'
  },
  controller: NodeStatusIconController,
  templateUrl: `/wise5/themes/default/themeComponents/nodeStatusIcon/node-status-icon.component.html`
}
