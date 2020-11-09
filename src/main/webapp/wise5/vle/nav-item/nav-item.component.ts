"use strict";

import { Subscription } from "rxjs";
import { ProjectService } from "../../services/projectService";
import { StudentDataService } from "../../services/studentDataService";

class NavItemController {

  currentNode: any;
  currentNodeChangedSubscription: Subscription;
  expanded: boolean = false;
  isCurrentNode: boolean;
  isGroup: boolean;
  item: any;
  nodeId: string;
  nodeStatus: any;
  nodeTitle: string;
  showPosition: any;
  type: string;

  static $inject = ['$scope', 'ProjectService', 'StudentDataService'];

  constructor(private $scope: any, private ProjectService: ProjectService,
      private StudentDataService: StudentDataService) {
  }

  $onInit() {
    this.item = this.ProjectService.idToNode[this.nodeId];
    this.isGroup = this.ProjectService.isGroupNode(this.nodeId);
    this.nodeStatus = this.StudentDataService.nodeStatuses[this.nodeId];
    this.nodeTitle = this.showPosition ? (this.ProjectService.nodeIdToNumber[this.nodeId] + ': ' + this.item.title) : this.item.title;
    this.currentNode = this.StudentDataService.currentNode;
    this.isCurrentNode = (this.currentNode.id === this.nodeId);

    this.currentNodeChangedSubscription = this.StudentDataService.currentNodeChanged$
        .subscribe(({previousNode: oldNode, currentNode: newNode}) => {
      this.currentNode = newNode;
      this.isCurrentNode = (this.nodeId === newNode.id);
      let isPrev = false;
      if (this.ProjectService.isApplicationNode(newNode.id)) {
        return;
      }
      if (oldNode) {
        isPrev = (this.nodeId === oldNode.id);
        if (this.StudentDataService.previousStep) {
          this.$scope.$parent.isPrevStep = (this.nodeId === this.StudentDataService.previousStep.id);
        }
      }
      if (this.isGroup) {
        let prevNodeisGroup = (!oldNode || this.ProjectService.isGroupNode(oldNode.id));
        let prevNodeIsDescendant = this.ProjectService.isNodeDescendentOfGroup(oldNode, this.item);
        if (this.isCurrentNode) {
          this.expanded = true;
          if (prevNodeisGroup || !prevNodeIsDescendant) {
            this.zoomToElement();
          }
        } else {
          if (!prevNodeisGroup) {
            if (prevNodeIsDescendant) {
              this.expanded = true;
            } else {
              this.expanded = false;
            }
          }
        }
        this.$scope.$parent.itemExpanded = this.expanded;
      } else {
        if (isPrev && this.ProjectService.isNodeDescendentOfGroup(this.item, newNode)) {
          this.zoomToElement();
        }
      }
    });
  }

  zoomToElement() {
    // TODO: implement me
  };

  itemClicked(event) {
    if (this.isGroup) {
      this.expanded = !this.expanded;
      if (this.expanded) {
        if (this.isCurrentNode) {
          this.zoomToElement();
        } else {
          this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(this.nodeId);
        }
      }
    } else {
      this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(this.nodeId);
    }
  };
}

export const NavItem = {
  bindings: {
    nodeId: '<',
    showPosition: '<',
    type: '@'
  },
  templateUrl: '/wise5/vle/nav-item/nav-item.component.html',
  controller: NavItemController
};
