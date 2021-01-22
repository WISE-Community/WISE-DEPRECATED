'use strict';

import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfigService } from './configService';
import { ProjectService } from './projectService';
import { UpgradeModule } from '@angular/upgrade/static';
import { ChooseBranchPathDialogComponent } from '../../site/src/app/preview/modules/choose-branch-path-dialog/choose-branch-path-dialog.component';
import { DataService } from '../../site/src/app/services/data.service';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class NodeService {
  $mdDialog: any;
  $translate: any;
  transitionResults = {};
  chooseTransitionPromises = {};
  private nodeSubmitClickedSource: Subject<any> = new Subject<any>();
  public nodeSubmitClicked$: Observable<any> = this.nodeSubmitClickedSource.asObservable();
  private doneRenderingComponentSource: Subject<any> = new Subject<any>();
  public doneRenderingComponent$ = this.doneRenderingComponentSource.asObservable();
  private componentShowSubmitButtonValueChangedSource: Subject<any> = new Subject<any>();
  public componentShowSubmitButtonValueChanged$: Observable<any> = this.componentShowSubmitButtonValueChangedSource.asObservable();
  private showRubricSource: Subject<string> = new Subject<string>();
  public showRubric$: Observable<string> = this.showRubricSource.asObservable();
  private siblingComponentStudentDataChangedSource: Subject<any> = new Subject<any>();
  public siblingComponentStudentDataChanged$: Observable<any> = this.siblingComponentStudentDataChangedSource.asObservable();
  private starterStateRequestSource: Subject<any> = new Subject<any>();
  public starterStateRequest$: Observable<any> = this.starterStateRequestSource.asObservable();
  private starterStateResponseSource: Subject<any> = new Subject<any>();
  public starterStateResponse$: Observable<any> = this.starterStateResponseSource.asObservable();

  constructor(
    private upgrade: UpgradeModule,
    private dialog: MatDialog,
    private ConfigService: ConfigService,
    private ProjectService: ProjectService,
    private DataService: DataService
  ) {
    this.$mdDialog = this.upgrade.$injector.get('$mdDialog');
    this.$translate = this.upgrade.$injector.get('$filter')('translate');
  }

  /**
   * Create a new empty node state
   * @return a new empty node state
   */
  createNewComponentState(): any {
    return {
      clientSaveTime: new Date().getTime()
    };
  }

  /**
   * Create a new empty node state
   * @return a new empty node state
   */
  createNewNodeState() {
    return {
      runId: this.ConfigService.getRunId(),
      periodId: this.ConfigService.getPeriodId(),
      workgroupId: this.ConfigService.getWorkgroupId(),
      clientSaveTime: new Date().getTime()
    };
  }

  /**
   * Get the node type in camel case
   * @param nodeType the node type e.g. OpenResponse
   * @return the node type in camel case
   * e.g.
   * openResponse
   */
  toCamelCase(nodeType) {
    if (nodeType != null && nodeType.length > 0) {
      const firstChar = nodeType.charAt(0);
      if (firstChar != null) {
        const firstCharLowerCase = firstChar.toLowerCase();
        if (firstCharLowerCase != null) {
          return firstCharLowerCase + nodeType.substr(1);
        }
      }
    }
    return null;
  }

  /**
   * Check if the string is in all uppercase
   * @param str the string to check
   * @return whether the string is in all uppercase
   */
  isStringUpperCase(str) {
    return str != null && str === str.toUpperCase();
  }

  getComponentTemplatePath(componentType) {
    return this.getComponentFolderPath(componentType) + '/index.html';
  }

  getComponentAuthoringTemplatePath(componentType) {
    return this.getComponentFolderPath(componentType) + '/authoring.html';
  }

  /**
   * Get the html template for the component
   * @param componentType the component type
   * @return the path to the html template for the component
   */
  getComponentFolderPath(componentType) {
    if (this.isStringUpperCase(componentType)) {
      componentType = componentType.toLowerCase();
    } else {
      componentType = this.toCamelCase(componentType);
    }
    return this.ConfigService.getWISEBaseURL() + '/wise5/components/' + componentType;
  }

  /**
   * Get the component content
   * @param componentContent the component content
   * @param componentId the component id
   * @return the component content
   */
  getComponentContentById(nodeContent, componentId) {
    if (nodeContent != null && componentId != null) {
      const components = nodeContent.components;
      if (components != null) {
        for (let tempComponent of components) {
          if (tempComponent != null) {
            const tempComponentId = tempComponent.id;
            if (tempComponentId === componentId) {
              return tempComponent;
            }
          }
        }
      }
    }
    return null;
  }

  /**
   * Check if any of the component states were submitted
   * @param componentStates an array of component states
   * @return whether any of the component states were submitted
   */
  isWorkSubmitted(componentStates) {
    if (componentStates != null) {
      for (let componentState of componentStates) {
        if (componentState != null) {
          if (componentState.isSubmit) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Check if the node or component is completed
   * @param functionParams the params that will specify which node or component
   * to check for completion
   * @returns whether the specified node or component is completed
   */
  isCompleted(functionParams) {
    if (functionParams != null) {
      const nodeId = functionParams.nodeId;
      const componentId = functionParams.componentId;
      return this.DataService.isCompleted(nodeId, componentId);
    }
    return false;
  }

  goToNextNode() {
    return this.getNextNodeId().then((nextNodeId) => {
      if (nextNodeId != null) {
        const mode = this.ConfigService.getMode();
        this.DataService.endCurrentNodeAndSetCurrentNodeByNodeId(nextNodeId);
      }
      return nextNodeId;
    });
  }

  /**
   * Get the next node in the project sequence. We return a promise because
   * in preview mode we allow the user to specify which branch path they want
   * to go to. In all other cases we will resolve the promise immediately.
   * @param currentId (optional)
   * @returns a promise that returns the next node id
   */
  getNextNodeId(currentId?) {
    const promise = new Promise((resolve, reject) => {
      let nextNodeId = null;
      let currentNodeId = null;
      let mode = this.ConfigService.getMode();
      if (currentId) {
        currentNodeId = currentId;
      } else {
        let currentNode = null;
        currentNode = this.DataService.getCurrentNode();
        if (currentNode) {
          currentNodeId = currentNode.id;
        }
      }
      if (currentNodeId) {
        if (mode === 'classroomMonitor' || mode === 'author') {
          let currentNodeOrder = this.ProjectService.getNodeOrderById(currentNodeId);
          if (currentNodeOrder) {
            let nextNodeOrder = currentNodeOrder + 1;
            let nextId = this.ProjectService.getNodeIdByOrder(nextNodeOrder);
            if (nextId) {
              if (this.ProjectService.isApplicationNode(nextId)) {
                nextNodeId = nextId;
              } else if (this.ProjectService.isGroupNode(nextId)) {
                nextNodeId = this.getNextNodeId(nextId);
              }
            }
          }
          resolve(nextNodeId);
        } else {
          const transitionLogic = this.ProjectService.getTransitionLogicByFromNodeId(currentNodeId);
          const branchPathTakenEvents = this.DataService.getBranchPathTakenEventsByNodeId(
            currentNodeId
          );
          if (
            branchPathTakenEvents != null &&
            branchPathTakenEvents.length > 0 &&
            transitionLogic != null &&
            transitionLogic.canChangePath != true
          ) {
            // the student has branched on this node before and they are not allowed to change paths
            for (let b = branchPathTakenEvents.length - 1; b >= 0; b--) {
              const branchPathTakenEvent = branchPathTakenEvents[b];
              if (branchPathTakenEvent != null) {
                const data = branchPathTakenEvent.data;
                if (data != null) {
                  const toNodeId = data.toNodeId;
                  nextNodeId = toNodeId;
                  resolve(nextNodeId);
                  break;
                }
              }
            }
          } else {
            // the student has not branched on this node before
            if (transitionLogic != null) {
              const transitions = transitionLogic.transitions;
              if (transitions == null || transitions.length == 0) {
                /*
                 * this node does not have any transitions so we will
                 * check if the parent group has transitions
                 */
                const parentGroupId = this.ProjectService.getParentGroupId(currentNodeId);
                let parentHasTransitionLogic = false;
                if (parentGroupId != null) {
                  const parentTransitionLogic = this.ProjectService.getTransitionLogicByFromNodeId(
                    parentGroupId
                  );
                  if (parentTransitionLogic != null) {
                    parentHasTransitionLogic = true;
                    this.chooseTransition(parentGroupId, parentTransitionLogic).then(
                      (transition) => {
                        if (transition != null) {
                          const transitionToNodeId = transition.to;
                          if (this.ProjectService.isGroupNode(transitionToNodeId)) {
                            const startId = this.ProjectService.getGroupStartId(transitionToNodeId);
                            if (startId == null || startId == '') {
                              nextNodeId = transitionToNodeId;
                            } else {
                              nextNodeId = startId;
                            }
                          } else {
                            nextNodeId = transitionToNodeId;
                          }
                        }
                        resolve(nextNodeId);
                      }
                    );
                  }
                }
              } else {
                this.chooseTransition(currentNodeId, transitionLogic).then((transition) => {
                  resolve(transition.to);
                });
              }
            }
          }
        }
      }
    });
    return promise;
  }

  /**
   * Go to the next node that captures work
   * @return a promise that will return the next node id
   */
  goToNextNodeWithWork() {
    this.getNextNodeIdWithWork().then((nextNodeId) => {
      if (nextNodeId) {
        this.DataService.endCurrentNodeAndSetCurrentNodeByNodeId(nextNodeId);
      }
      return nextNodeId;
    });
  }

  /**
   * Get the next node id in the project sequence that captures student work
   * @param currentId (optional)
   * @returns next node id
   */
  getNextNodeIdWithWork(currentId = null) {
    return this.getNextNodeId(currentId).then((nextNodeId: string) => {
      if (nextNodeId) {
        if (this.ProjectService.nodeHasWork(nextNodeId)) {
          return nextNodeId;
        } else {
          return this.getNextNodeIdWithWork(nextNodeId);
        }
      } else {
        return null;
      }
    });
  }

  goToPrevNode() {
    const prevNodeId = this.getPrevNodeId();
    this.DataService.endCurrentNodeAndSetCurrentNodeByNodeId(prevNodeId);
  }

  /**
   * Get the previous node in the project sequence
   * @param currentId (optional)
   */
  getPrevNodeId(currentId?) {
    let prevNodeId = null;
    let currentNodeId = null;
    const mode = this.ConfigService.getMode();
    if (currentId) {
      currentNodeId = currentId;
    } else {
      let currentNode = null;
      currentNode = this.DataService.getCurrentNode();
      if (currentNode) {
        currentNodeId = currentNode.id;
      }
    }
    if (currentNodeId) {
      if (['classroomMonitor', 'author'].includes(mode)) {
        let currentNodeOrder = this.ProjectService.getNodeOrderById(currentNodeId);
        if (currentNodeOrder) {
          let prevNodeOrder = currentNodeOrder - 1;
          let prevId = this.ProjectService.getNodeIdByOrder(prevNodeOrder);
          if (prevId) {
            if (this.ProjectService.isApplicationNode(prevId)) {
              // node is a step, so set it as the next node
              prevNodeId = prevId;
            } else if (this.ProjectService.isGroupNode(prevId)) {
              // node is an activity, so get next nodeId
              prevNodeId = this.getPrevNodeId(prevId);
            }
          }
        }
      } else {
        // get all the nodes that transition to the current node
        const nodeIdsByToNodeId = this.ProjectService.getNodesWithTransitionToNodeId(currentNodeId);
        if (nodeIdsByToNodeId == null) {
        } else if (nodeIdsByToNodeId.length === 1) {
          // there is only one node that transitions to the current node
          prevNodeId = nodeIdsByToNodeId[0];
        } else if (nodeIdsByToNodeId.length > 1) {
          // there are multiple nodes that transition to the current node

          const stackHistory = this.DataService.getStackHistory();

          // loop through the stack history node ids from newest to oldest
          for (let s = stackHistory.length - 1; s >= 0; s--) {
            const stackHistoryNodeId = stackHistory[s];
            if (nodeIdsByToNodeId.indexOf(stackHistoryNodeId) != -1) {
              // we have found a node that we previously visited that transitions to the current node
              prevNodeId = stackHistoryNodeId;
              break;
            }
          }
        }
      }
    }
    return prevNodeId;
  }

  /**
   * Go to the previous node that captures work
   */
  goToPrevNodeWithWork() {
    const prevNodeId = this.getPrevNodeIdWithWork();
    this.DataService.endCurrentNodeAndSetCurrentNodeByNodeId(prevNodeId);
  }

  /**
   * Get the previous node id in the project sequence that captures student work
   * @param currentId (optional)
   * @returns next node id
   */
  getPrevNodeIdWithWork(currentId = null) {
    const prevNodeId = this.getPrevNodeId(currentId);
    if (prevNodeId) {
      if (this.ProjectService.nodeHasWork(prevNodeId)) {
        return prevNodeId;
      } else {
        return this.getPrevNodeIdWithWork(prevNodeId);
      }
    } else {
      return null;
    }
  }

  /**
   * Close the current node (and open the current node's parent group)
   */
  closeNode() {
    let currentNode = null;
    currentNode = this.DataService.getCurrentNode();
    if (currentNode) {
      let currentNodeId = currentNode.id;
      let parentNode = this.ProjectService.getParentGroup(currentNodeId);
      let parentNodeId = parentNode.id;
      this.DataService.endCurrentNodeAndSetCurrentNodeByNodeId(parentNodeId);
    }
  }

  /**
   * Choose the transition the student will take
   * @param nodeId the current node id
   * @param transitionLogic an object containing transitions and parameters
   * for how to choose a transition
   * @returns a promise that will return a transition
   */
  chooseTransition(nodeId, transitionLogic): any {
    const existingPromise = this.getChooseTransitionPromise(nodeId);
    if (existingPromise != null) {
      return existingPromise;
    }
    const promise = new Promise((resolve, reject) => {
      let transitionResult = this.getTransitionResultByNodeId(nodeId);
      if (
        transitionResult == null ||
        (transitionLogic != null && transitionLogic.canChangePath == true)
      ) {
        /*
         * we have not previously calculated the transition or the
         * transition logic allows the student to change branch paths
         * so we will calculate the transition again
         */
        const transitions = transitionLogic.transitions;
        if (transitions != null) {
          const availableTransitions = this.getAvailableTransitions(transitions);
          if (availableTransitions.length == 0) {
            transitionResult = null;
          } else if (availableTransitions.length == 1) {
            transitionResult = availableTransitions[0];
          } else if (availableTransitions.length > 1) {
            if (this.ConfigService.isPreview()) {
              /*
               * we are in preview mode so we will let the user choose
               * the branch path to go to
               */
              if (transitionResult != null) {
                /*
                 * the user has previously chosen the branch path
                 * so we will use the transition they chose and
                 * not ask them again
                 */
              } else {
                const paths = [];
                for (const availableTransition of availableTransitions) {
                  const toNodeId = availableTransition.to;
                  const path = {
                    nodeId: toNodeId,
                    nodeTitle: this.ProjectService.getNodePositionAndTitleByNodeId(toNodeId),
                    transition: availableTransition
                  };
                  paths.push(path);
                }
                const dialogRef = this.dialog.open(ChooseBranchPathDialogComponent, {
                  data: {
                    paths: paths,
                    nodeId: nodeId
                  },
                  disableClose: true
                });
                dialogRef.afterClosed().subscribe((result) => {
                  resolve(result);
                });
              }
            } else {
              /*
               * we are in regular student run mode so we will choose
               * the branch according to how the step was authored
               */
              const howToChooseAmongAvailablePaths = transitionLogic.howToChooseAmongAvailablePaths;
              if (
                howToChooseAmongAvailablePaths == null ||
                howToChooseAmongAvailablePaths === '' ||
                howToChooseAmongAvailablePaths === 'random'
              ) {
                // choose a random transition

                const randomIndex = Math.floor(Math.random() * availableTransitions.length);
                transitionResult = availableTransitions[randomIndex];
              } else if (howToChooseAmongAvailablePaths === 'workgroupId') {
                // use the workgroup id to choose the transition

                const workgroupId = this.ConfigService.getWorkgroupId();
                const index = workgroupId % availableTransitions.length;
                transitionResult = availableTransitions[index];
              } else if (howToChooseAmongAvailablePaths === 'firstAvailable') {
                // choose the first available transition

                transitionResult = availableTransitions[0];
              } else if (howToChooseAmongAvailablePaths === 'lastAvailable') {
                // choose the last available transition
                transitionResult = availableTransitions[availableTransitions.length - 1];
              }
            }
          }
        }
      }
      if (transitionResult != null) {
        this.setTransitionResult(nodeId, transitionResult);
        resolve(transitionResult);
      }
    });
    const availableTransitions = this.getAvailableTransitions(transitionLogic.transitions);
    const transitionResult = this.getTransitionResultByNodeId(nodeId);
    if (
      this.ConfigService.isPreview() &&
      availableTransitions.length > 1 &&
      transitionResult == null
    ) {
      this.setChooseTransitionPromise(nodeId, promise);
    }
    return promise;
  }

  getAvailableTransitions(transitions: any) {
    const availableTransitions = [];
    for (const transition of transitions) {
      const criteria = transition.criteria;
      if (criteria == null || (criteria != null && this.DataService.evaluateCriterias(criteria))) {
        availableTransitions.push(transition);
      }
    }
    return availableTransitions;
  }

  currentNodeHasTransitionLogic() {
    const currentNode: any = this.DataService.getCurrentNode();
    if (currentNode != null) {
      const transitionLogic = currentNode.transitionLogic;
      if (transitionLogic != null) {
        return true;
      }
    }
    return false;
  }

  /**
   * Evaluate the transition logic for the current node and create branch
   * path taken events if necessary.
   */
  evaluateTransitionLogic() {
    const currentNode: any = this.DataService.getCurrentNode();
    if (currentNode != null) {
      const nodeId = currentNode.id;
      const transitionLogic = currentNode.transitionLogic;
      if (transitionLogic != null) {
        const transitions = transitionLogic.transitions;
        const canChangePath = transitionLogic.canChangePath;
        let alreadyBranched = false;
        const events = this.DataService.getBranchPathTakenEventsByNodeId(currentNode.id);
        if (events.length > 0) {
          alreadyBranched = true;
        }

        let transition, fromNodeId, toNodeId;
        if (alreadyBranched) {
          if (canChangePath) {
            this.chooseTransition(nodeId, transitionLogic).then((transition) => {
              if (transition != null) {
                fromNodeId = currentNode.id;
                toNodeId = transition.to;
                this.createBranchPathTakenEvent(fromNodeId, toNodeId);
              }
            });
          } else {
            // student can't change path
          }
        } else {
          // student has not branched yet

          this.chooseTransition(nodeId, transitionLogic).then((transition) => {
            if (transition != null) {
              fromNodeId = currentNode.id;
              toNodeId = transition.to;
              this.createBranchPathTakenEvent(fromNodeId, toNodeId);
            }
          });
        }
      }
    }
  }

  /**
   * Create a branchPathTaken event
   * @param fromNodeId the from node id
   * @param toNodeid the to node id
   */
  createBranchPathTakenEvent(fromNodeId, toNodeId) {
    const nodeId = fromNodeId;
    const componentId = null;
    const componentType = null;
    const category = 'Navigation';
    const event = 'branchPathTaken';
    const eventData = {
      fromNodeId: fromNodeId,
      toNodeId: toNodeId
    };
    this.DataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);
  }

  evaluateTransitionLogicOn(event) {
    const currentNode: any = this.DataService.getCurrentNode();
    if (currentNode != null) {
      const transitionLogic = currentNode.transitionLogic;
      const whenToChoosePath = transitionLogic.whenToChoosePath;
      if (event === whenToChoosePath) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get the transition result for a node
   * @param nodeId the the node id
   * @returns the transition object that was chosen for the node
   */
  getTransitionResultByNodeId(nodeId) {
    return this.transitionResults[nodeId];
  }

  /**
   * Set the transition result for a node
   * @param nodeId the node id
   * @param transitionResult the transition object that was chosen for the node
   */
  setTransitionResult(nodeId, transitionResult) {
    if (nodeId != null) {
      this.transitionResults[nodeId] = transitionResult;
    }
  }

  /**
   * Get the promise that was created for a specific node when the
   * chooseTransition() function was called. This promise has not been
   * resolved yet.
   * @param nodeId the node id
   * @returns the promise that was created when chooseTransition() was called
   * or null if there is no unresolved promise.
   */
  getChooseTransitionPromise(nodeId) {
    return this.chooseTransitionPromises[nodeId];
  }

  /**
   * Set the promise that was created for a specific node when the
   * chooseTransition() function was called. This promise has not been
   * resolved yet.
   * @param nodeId the node id
   * @param promise the promise
   */
  setChooseTransitionPromise(nodeId, promise) {
    this.chooseTransitionPromises[nodeId] = promise;
  }

  /**
   * Move the component(s) within the node
   * @param nodeId we are moving component(s) in this node
   * @param componentIds the component(s) we are moving
   * @param insertAfterComponentId Insert the component(s) after this given
   * component id. If this argument is null, we will place the new
   * component(s) in the first position.
   */
  moveComponent(nodeId, componentIds, insertAfterComponentId) {
    const node = this.ProjectService.getNodeById(nodeId);
    const components = node.components;
    const extractedComponents = this.extractComponents(components, componentIds);
    if (insertAfterComponentId == null) {
      components.unshift(...extractedComponents);
    } else {
      this.insertComponentsAfter(extractedComponents, components, insertAfterComponentId);
    }
  }

  extractComponents(components, componentIds) {
    const extractedComponents = [];
    for (let i = 0; i < components.length; i++) {
      if (componentIds.includes(components[i].id)) {
        extractedComponents.push(components.splice(i--, 1)[0]);
      }
    }
    return extractedComponents;
  }

  insertComponentsAfter(componentsToInsert, components, insertAfterComponentId) {
    for (let i = 0; i < components.length; i++) {
      if (components[i].id === insertAfterComponentId) {
        components.splice(i + 1, 0, ...componentsToInsert);
        return;
      }
    }
  }

  /**
   * Show the node content in a dialog. We will show the step content
   * plus the node rubric and all component rubrics.
   */
  showNodeInfo(nodeId, $event) {
    let stepNumberAndTitle = this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);
    let rubricTitle = this.$translate('STEP_INFO');

    /*
     * create the dialog header, actions, and content elements
     */
    let dialogHeader = `<md-toolbar>
                <div class="md-toolbar-tools">
                    <h2>${stepNumberAndTitle}</h2>
                </div>
            </md-toolbar>`;

    let dialogActions = `<md-dialog-actions layout="row" layout-align="end center">
                <md-button class="md-primary" ng-click="openInNewWindow()" aria-label="{{ 'openInNewWindow' | translate }}">{{ 'openInNewWindow' | translate }}</md-button>
                <md-button class="md-primary" ng-click="close()" aria-label="{{ 'close' | translate }}">{{ 'close' | translate }}</md-button>
            </md-dialog-actions>`;

    let dialogContent = `<md-dialog-content class="gray-lighter-bg">
                <div class="md-dialog-content" id="nodeInfo_${nodeId}">
                    <node-info node-id="${nodeId}"></node-info>
                </div>
            </md-dialog-content>`;

    let dialogString = `<md-dialog class="dialog--wider" aria-label="${stepNumberAndTitle} - ${rubricTitle}">${dialogHeader}${dialogContent}${dialogActions}</md-dialog>`;

    // display the rubric in a popup
    this.$mdDialog.show({
      template: dialogString,
      fullscreen: true,
      multiple: true,
      controller: [
        '$scope',
        '$mdDialog',
        function DialogController($scope, $mdDialog) {
          // display the rubric in a new tab
          $scope.openInNewWindow = function () {
            // open a new tab
            let w = window.open('', '_blank');

            /*
             * create the header for the new window that contains the project title
             */
            let windowHeader = `<md-toolbar class="layout-row">
                                <div class="md-toolbar-tools primary-bg" style="color: #ffffff;">
                                    <h2>${stepNumberAndTitle}</h2>
                                </div>
                            </md-toolbar>`;

            let rubricContent = document.getElementById('nodeInfo_' + nodeId).innerHTML;

            // create the window string
            let windowString = `<link rel='stylesheet' href='../wise5/themes/default/style/monitor.css'>
                            <link rel='stylesheet' href='../wise5/themes/default/style/angular-material.css'>
                            <link rel="stylesheet" href="http://fonts.googleapis.com/css?family=Roboto:300,400,500,700,400italic%7CMaterial+Icons" media="all">
                            <body class="layout-column">
                                <div class="layout-column">${windowHeader}<md-content class="md-padding">${rubricContent}</div></md-content></div>
                            </body>`;
            w.document.write(windowString);
            $mdDialog.hide();
          };
          $scope.close = () => {
            $mdDialog.hide();
          };
        }
      ],
      targetEvent: $event,
      clickOutsideToClose: true,
      escapeToClose: true
    });
  }

  broadcastNodeSubmitClicked(args: any) {
    this.nodeSubmitClickedSource.next(args);
  }

  broadcastDoneRenderingComponent(nodeIdAndComponentId: any) {
    this.doneRenderingComponentSource.next(nodeIdAndComponentId);
  }

  broadcastComponentShowSubmitButtonValueChanged(args: any) {
    this.componentShowSubmitButtonValueChangedSource.next(args);
  }

  broadcastSiblingComponentStudentDataChanged(args: any) {
    this.siblingComponentStudentDataChangedSource.next(args);
  }

  requestStarterState(args: any) {
    this.starterStateRequestSource.next(args);
  }

  respondStarterState(args: any) {
    this.starterStateResponseSource.next(args);
  }

  showRubric(id: string): void {
    this.showRubricSource.next(id);
  }
}
