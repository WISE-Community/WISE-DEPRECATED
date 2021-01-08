'use strict';

import { Component, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProjectService } from '../../services/projectService';
import { StudentDataService } from '../../services/studentDataService';

@Component({
  selector: 'nav-item',
  styleUrls: ['nav-item.component.scss'],
  templateUrl: 'nav-item.component.html'
})
export class NavItemComponent {
  currentNode: any;
  currentNodeChangedSubscription: Subscription;
  expanded: boolean = false;
  isCurrentNode: boolean;
  isGroup: boolean;
  isPrevStep: boolean = false;
  item: any;
  navItemExpandedSubscription: Subscription;

  @Input()
  nodeId: string;
  nodeStatus: any;
  nodeTitle: string;

  @Input()
  showPosition: any;

  @Input()
  type: string;

  constructor(
    private ProjectService: ProjectService,
    private StudentDataService: StudentDataService
  ) {}

  ngOnInit() {
    this.item = this.ProjectService.idToNode[this.nodeId];
    this.isGroup = this.ProjectService.isGroupNode(this.nodeId);
    this.nodeStatus = this.StudentDataService.nodeStatuses[this.nodeId];
    this.nodeTitle = this.showPosition
      ? this.ProjectService.nodeIdToNumber[this.nodeId] + ': ' + this.item.title
      : this.item.title;
    this.currentNode = this.StudentDataService.currentNode;
    this.isCurrentNode = this.currentNode.id === this.nodeId;
    this.navItemExpandedSubscription = this.StudentDataService.navItemIsExpanded$.subscribe(
      ({ nodeId, isExpanded }) => {
        if (nodeId === this.nodeId) {
          this.expanded = isExpanded;
        }
      }
    );
    this.currentNodeChangedSubscription = this.StudentDataService.currentNodeChanged$.subscribe(
      ({ previousNode: oldNode, currentNode: newNode }) => {
        this.currentNode = newNode;
        this.isCurrentNode = this.nodeId === newNode.id;
        let isPrev = false;
        if (this.ProjectService.isApplicationNode(newNode.id)) {
          return;
        }
        if (oldNode) {
          isPrev = this.nodeId === oldNode.id;
          if (this.StudentDataService.previousStep) {
            this.isPrevStep = this.nodeId === this.StudentDataService.previousStep.id;
          }
        }
        if (this.isGroup) {
          let prevNodeisGroup = !oldNode || this.ProjectService.isGroupNode(oldNode.id);
          let prevNodeIsDescendant = this.ProjectService.isNodeDescendentOfGroup(
            oldNode,
            this.item
          );
          if (this.isCurrentNode) {
            this.expanded = true;
            this.StudentDataService.setNavItemExpanded(this.nodeId, this.expanded);
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
        } else {
          if (isPrev && this.ProjectService.isNodeDescendentOfGroup(this.item, newNode)) {
            this.zoomToElement();
          }
        }
      }
    );
  }

  ngOnDestroy() {
    this.currentNodeChangedSubscription.unsubscribe();
    this.navItemExpandedSubscription.unsubscribe();
  }

  zoomToElement() {
    // TODO: implement me
  }

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
      this.StudentDataService.setNavItemExpanded(this.nodeId, this.expanded);
    } else {
      this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(this.nodeId);
    }
  }
}
