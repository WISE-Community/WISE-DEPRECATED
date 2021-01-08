import { Component } from '@angular/core';
import { UpgradeModule } from '@angular/upgrade/static';
import { ConfigService } from '../../../../../../wise5/services/configService';
import { TeacherProjectService } from '../../../../../../wise5/services/teacherProjectService';

@Component({
  styleUrls: ['choose-import-step-location.component.scss'],
  templateUrl: 'choose-import-step-location.component.html'
})
export class ChooseImportStepLocationComponent {
  nodeIds: string[];

  constructor(
    private upgrade: UpgradeModule,
    private ConfigService: ConfigService,
    private ProjectService: TeacherProjectService
  ) {
    this.nodeIds = Object.keys(this.ProjectService.idToOrder);
    this.nodeIds.shift(); // remove the 'group0' master root node from consideration
  }

  importSelectedNodes(nodeIdToInsertInsideOrAfter) {
    this.ProjectService.copyNodes(
      this.upgrade.$injector.get('$stateParams').selectedNodes,
      this.upgrade.$injector.get('$stateParams').importFromProjectId,
      this.ConfigService.getProjectId(),
      nodeIdToInsertInsideOrAfter
    ).then(() => {
      this.ProjectService.checkPotentialStartNodeIdChangeThenSaveProject().then(() => {
        this.ProjectService.refreshProject();
        this.upgrade.$injector.get('$state').go('root.at.project');
      });
    });
  }

  isGroupNode(nodeId) {
    return this.ProjectService.isGroupNode(nodeId);
  }

  getNodeTitleByNodeId(nodeId) {
    return this.ProjectService.getNodeTitleByNodeId(nodeId);
  }

  getNodePositionById(nodeId) {
    return this.ProjectService.getNodePositionById(nodeId);
  }

  isNodeInAnyBranchPath(nodeId) {
    return this.ProjectService.isNodeInAnyBranchPath(nodeId);
  }

  cancel() {
    this.upgrade.$injector.get('$state').go('root.at.project');
  }
}
