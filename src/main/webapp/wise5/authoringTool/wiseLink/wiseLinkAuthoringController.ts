'use strict';

import { ProjectService } from '../../services/projectService';

class WISELinkAuthoringController {
  $rootScope: any;
  $stateParams: any;
  $mdDialog: any;
  ProjectService: ProjectService;
  projectId: number;
  nodeId: string;
  componentId: string;
  target: any;
  items: any[];
  wiseLinkNodeId: string = '';
  wiseLinkComponentId: string = '';
  wiseLinkType: string = 'link';
  wiseLinkText: string = '';
  wiseLinkClass: string = '';

  static $inject = ['$rootScope', '$stateParams', '$mdDialog', 'ProjectService'];

  constructor($rootScope, $stateParams, $mdDialog, ProjectService) {
    this.$rootScope = $rootScope;
    this.$stateParams = $stateParams;
    this.$mdDialog = $mdDialog;
    this.ProjectService = ProjectService;
    this.projectId = $stateParams.projectId;
    this.nodeId = $stateParams.nodeId;
    this.componentId = $stateParams.componentId;
    this.target = $stateParams.target;
    this.items = this.ProjectService.idToOrder;
  }

  wiseLinkNodeIdChanged() {
    if (this.wiseLinkNodeId != null && this.wiseLinkNodeId != '') {
      this.wiseLinkComponentId = '';
      let position = this.getNodePositionById(this.wiseLinkNodeId);
      let title = this.getNodeTitleByNodeId(this.wiseLinkNodeId);
      this.wiseLinkText = position + ': ' + title;
    }
  }

  getNodePositionById(nodeId) {
    return this.ProjectService.getNodePositionById(nodeId);
  }

  getNodeTitleByNodeId(nodeId) {
    return this.ProjectService.getNodeTitleByNodeId(nodeId);
  }

  isGroupNode(nodeId) {
    return this.ProjectService.isGroupNode(nodeId);
  }

  getComponentsByNodeId(nodeId) {
    return this.ProjectService.getComponentsByNodeId(nodeId);
  }

  /**
   * TODO: i18n
   */
  createWISELink() {
    if (this.wiseLinkNodeId == null || this.wiseLinkNodeId == '') {
      alert('You must select a step.');
    } else if (this.wiseLinkText == null || this.wiseLinkText == '') {
      alert('You must enter text.');
    } else {
      const params = {
        projectId: this.projectId,
        nodeId: this.nodeId,
        componentId: this.componentId,
        target: this.target,
        wiseLinkNodeId: this.wiseLinkNodeId,
        wiseLinkComponentId: this.wiseLinkComponentId,
        wiseLinkType: this.wiseLinkType,
        wiseLinkText: this.wiseLinkText,
        wiseLinkClass: this.wiseLinkClass
      };
      this.$mdDialog.hide(params);
    }
  }

  cancelWISELinkAuthoring() {
    this.$mdDialog.cancel();
  }
}

export default WISELinkAuthoringController;
