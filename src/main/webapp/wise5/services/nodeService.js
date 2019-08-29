class NodeService {
  constructor(
      $filter,
      $http,
      $injector,
      $mdDialog,
      $q,
      ConfigService,
      ProjectService,
      StudentDataService) {
    this.$filter = $filter;
    this.$http = $http;
    this.$injector = $injector;
    this.$mdDialog = $mdDialog;
    this.$q = $q;
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.StudentDataService = StudentDataService;
    if (this.$filter) {
      this.$translate = this.$filter('translate');
    }
    if (this.ConfigService != null &&
        (this.ConfigService.getMode() === 'classroomMonitor' ||
        this.ConfigService.getMode() === 'author')) {
      // in the classroom monitor, we need access to the TeacherDataService
      this.TeacherDataService = this.$injector.get('TeacherDataService');
    }
    this.transitionResults = {};
    this.chooseTransitionPromises = {};
  }

  /**
   * Create a new empty node state
   * @return a new empty node state
   */
  createNewComponentState() {
    const componentState = {};
    componentState.clientSaveTime = Date.parse(new Date());
    return componentState;
  };

  /**
   * Create a new empty node state
   * @return a new empty node state
   */
  createNewNodeState() {
    const nodeState = {};
    nodeState.runId = this.ConfigService.getRunId();
    nodeState.periodId = this.ConfigService.getPeriodId();
    nodeState.workgroupId = this.ConfigService.getWorkgroupId();
    nodeState.clientSaveTime = Date.parse(new Date());
    return nodeState;
  };

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
  };

  /**
   * Check if the string is in all uppercase
   * @param str the string to check
   * @return whether the string is in all uppercase
   */
  isStringUpperCase(str) {
    return str != null && str === str.toUpperCase();
  };

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
  };

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
  };

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
      return this.StudentDataService.isCompleted(nodeId, componentId);
    }
    return false;
  };

  /**
   * Go to the next node
   * @return a promise that will return the next node id
   */
  goToNextNode() {
    return this.getNextNodeId().then((nextNodeId) => {
      if (nextNodeId != null) {
        const mode = this.ConfigService.getMode();
        if (mode === 'classroomMonitor' || mode === 'author') {
          this.TeacherDataService.endCurrentNodeAndSetCurrentNodeByNodeId(nextNodeId);
        } else {
          this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(nextNodeId);
        }
      }
      return nextNodeId;
    });
  };

  /**
   * Get the next node in the project sequence. We return a promise because
   * in preview mode we allow the user to specify which branch path they want
   * to go to. In all other cases we will resolve the promise immediately.
   * @param currentId (optional)
   * @returns a promise that returns the next node id
   */
  getNextNodeId(currentId) {
    // create a promise that will return the next node id
    let deferred = this.$q.defer();
    let promise = deferred.promise;
    let nextNodeId = null;
    let currentNodeId = null;
    let mode = this.ConfigService.getMode();

    if (currentId) {
      currentNodeId = currentId;
    } else {
      let currentNode = null;
      if (mode === 'classroomMonitor' || mode === 'author') {
        currentNode = this.TeacherDataService.getCurrentNode();
      } else {
        currentNode = this.StudentDataService.getCurrentNode();
      }
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
              // node is a step, so set it as the next node
              nextNodeId = nextId;
            } else if (this.ProjectService.isGroupNode(nextId)){
              // node is an activity, so get next nodeId
              nextNodeId = this.getNextNodeId(nextId);
            }
          }
        }

        // resolve the promise with the next node id
        deferred.resolve(nextNodeId);
      } else {
        // get the transition logic from the current node
        const transitionLogic = this.ProjectService.getTransitionLogicByFromNodeId(currentNodeId);

        // get all the branchPathTaken events for the current node
        const branchPathTakenEvents = this.StudentDataService.getBranchPathTakenEventsByNodeId(currentNodeId);

        if (branchPathTakenEvents != null && branchPathTakenEvents.length > 0 &&
          (transitionLogic != null && transitionLogic.canChangePath != true)) {
          // the student has branched on this node before and they are not allowed to change paths

          // loop through all the branchPathTaken events from newest to oldest
          for (let b = branchPathTakenEvents.length - 1; b >= 0; b--) {
            const branchPathTakenEvent = branchPathTakenEvents[b];
            if (branchPathTakenEvent != null) {
              const data = branchPathTakenEvent.data;
              if (data != null) {
                const toNodeId = data.toNodeId;
                nextNodeId = toNodeId;
                deferred.resolve(nextNodeId);
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
                const parentTransitionLogic = this.ProjectService.getTransitionLogicByFromNodeId(parentGroupId);
                if (parentTransitionLogic != null) {
                  parentHasTransitionLogic = true;

                  this.chooseTransition(parentGroupId, parentTransitionLogic).then((transition) => {
                    if (transition != null) {
                      // get the to node id
                      const transitionToNodeId = transition.to;
                      if (this.ProjectService.isGroupNode(transitionToNodeId)) {
                        // the to node is a group

                        const startId = this.ProjectService.getGroupStartId(transitionToNodeId);
                        if (startId == null || startId == '') {
                          // the group does not have a start id so we will just use the group
                          nextNodeId = transitionToNodeId;
                        } else {
                          // the group has a start id so we will use the start id
                          nextNodeId = startId;
                        }
                      } else {
                        // the to node is a step
                        nextNodeId = transitionToNodeId;
                      }
                    }

                    // resolve the promise with the next node id
                    deferred.resolve(nextNodeId);
                  });
                }
              }

              if (!parentHasTransitionLogic) {
                /*
                 * the parent does not have any transition logic so
                 * there is no next node from the parent
                 */
                deferred.resolve(null);
              }
            } else {
              // choose a transition
              this.chooseTransition(currentNodeId, transitionLogic).then((transition) => {
                if (transition != null) {
                  // move the student to the toNodeId
                  nextNodeId = transition.to;

                  // resolve the promise with the next node id
                  deferred.resolve(nextNodeId);
                }
              });
            }
          }
        }
      }
    } else {
      deferred.resolve(null);
    }
    return promise;
  };

  /**
   * Go to the next node that captures work
   * @return a promise that will return the next node id
   */
  goToNextNodeWithWork() {
    this.getNextNodeIdWithWork().then((nextNodeId) => {
      if (nextNodeId) {
        const mode = this.ConfigService.getMode();
        if (mode === 'classroomMonitor' || mode === 'author') {
          this.TeacherDataService.endCurrentNodeAndSetCurrentNodeByNodeId(nextNodeId);
        } else {
          this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(nextNodeId);
        }
      }
      return nextNodeId;
    });
  };

  /**
   * Get the next node id in the project sequence that captures student work
   * @param currentId (optional)
   * @returns next node id
   */
  getNextNodeIdWithWork(currentId) {
    return this.getNextNodeId(currentId).then((nextNodeId) => {
      if (nextNodeId) {
        const hasWork = this.ProjectService.nodeHasWork(nextNodeId);
        if (hasWork) {
          return nextNodeId;
        } else {
          return this.getNextNodeIdWithWork(nextNodeId);
        }
      } else {
        return null;
      }
    });
  };

  /**
   * Go to the previous node
   */
  goToPrevNode() {
    const prevNodeId = this.getPrevNodeId();
    const mode = this.ConfigService.getMode();
    if (mode === 'classroomMonitor' || mode === 'author') {
      this.TeacherDataService.endCurrentNodeAndSetCurrentNodeByNodeId(prevNodeId);
    } else {
      this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(prevNodeId);
    }
  };

  /**
   * Get the previous node in the project sequence
   * @param currentId (optional)
   */
  getPrevNodeId(currentId) {
    let prevNodeId = null;
    let currentNodeId = null;
    let mode = this.ConfigService.getMode();

    if (currentId) {
      currentNodeId = currentId;
    } else {
      let currentNode = null;

      if (mode === 'classroomMonitor' || mode === 'author') {
        currentNode = this.TeacherDataService.getCurrentNode();
      } else {
        currentNode = this.StudentDataService.getCurrentNode();
      }
      if (currentNode) {
        currentNodeId = currentNode.id;
      }
    }

    if (currentNodeId) {
      if (mode === 'classroomMonitor' || mode === 'author') {
        let currentNodeOrder = this.ProjectService.getNodeOrderById(currentNodeId);
        if (currentNodeOrder) {
          let prevNodeOrder = currentNodeOrder - 1;
          let prevId = this.ProjectService.getNodeIdByOrder(prevNodeOrder);
          if (prevId) {
            if (this.ProjectService.isApplicationNode(prevId)) {
              // node is a step, so set it as the next node
              prevNodeId = prevId;
            } else if (this.ProjectService.isGroupNode(prevId)){
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

          const stackHistory = this.StudentDataService.getStackHistory();

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
  };

  /**
   * Go to the previous node that captures work
   */
  goToPrevNodeWithWork() {
    const prevNodeId = this.getPrevNodeIdWithWork();
    const mode = this.ConfigService.getMode();
    if (mode === 'classroomMonitor' || mode === 'author') {
      this.TeacherDataService.endCurrentNodeAndSetCurrentNodeByNodeId(prevNodeId);
    } else {
      this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(prevNodeId);
    }
  };

  /**
   * Get the previous node id in the project sequence that captures student work
   * @param currentId (optional)
   * @returns next node id
   */
  getPrevNodeIdWithWork(currentId) {
    const prevNodeId = this.getPrevNodeId(currentId);
    if (prevNodeId) {
      const hasWork = this.ProjectService.nodeHasWork(prevNodeId);
      if (hasWork) {
        return prevNodeId;
      } else {
        return this.getPrevNodeIdWithWork(prevNodeId);
      }
    } else {
      return null;
    }
  };

  /**
   * Close the current node (and open the current node's parent group)
   */
  closeNode() {
    let mode = this.ConfigService.getMode();
    let currentNode = null;
    if (mode === 'classroomMonitor') {
      currentNode = this.TeacherDataService.getCurrentNode();
    } else {
      currentNode = this.StudentDataService.getCurrentNode();
    }

    if (currentNode) {
      let currentNodeId = currentNode.id;

      // get the parent node of the current node
      let parentNode = this.ProjectService.getParentGroup(currentNodeId);
      let parentNodeId = parentNode.id;

      // set the current node to the parent node
      if (mode === 'classroomMonitor') {
        this.TeacherDataService.endCurrentNodeAndSetCurrentNodeByNodeId(parentNodeId);
      } else {
        this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(parentNodeId);
      }
    }
  };

  /**
   * Choose the transition the student will take
   * @param nodeId the current node id
   * @param transitionLogic an object containing transitions and parameters
   * for how to choose a transition
   * @returns a promise that will return a transition
   */
  chooseTransition(nodeId, transitionLogic) {
    const deferred = this.$q.defer();

    // see if there is already a promise for this step
    let promise = this.getChooseTransitionPromise(nodeId);

    if (promise == null) {
      // there is no existing promise for this step so we will create one
      promise = deferred.promise;
    } else {
      // there is an existing promise for this step so we will use it
      return promise;
    }

    let resolvePromiseNow = true;

    // check if the transition was already previously calculated
    let transitionResult = this.getTransitionResultByNodeId(nodeId);
    if (transitionResult == null || (transitionLogic != null && transitionLogic.canChangePath == true)) {
      /*
       * we have not previously calculated the transition or the
       * transition logic allows the student to change branch paths
       * so we will calculate the transition again
       */

      const transitions = transitionLogic.transitions;
      if (transitions != null) {
        let availableTransitions = [];
        for (let transition of transitions) {
          const toNodeId = transition.to;
          const criteria = transition.criteria;

          // set the default result to true in case there is no criteria
          let criteriaResult = true;
          if (criteria != null) {
            let firstResult = true;
            let tempResult = true;

            // loop through all of the criteria
            for (let tempCriteria of criteria) {
              // check if the criteria is satisfied
              tempResult = this.StudentDataService.evaluateCriteria(tempCriteria);

              if (firstResult) {
                // this is the first criteria in this for loop
                criteriaResult = tempResult;
                firstResult = false;
              } else {
                // this is not the first criteria in this for loop so we will && the result
                criteriaResult = criteriaResult && tempResult;
              }
            }
          }

          if (toNodeId != null) {
            // check if the criteria was satisfied and the to node is visitable
            if (criteriaResult) {
              // the student is allowed to use the transition
              availableTransitions.push(transition);
            }
          }
        }

        if (availableTransitions.length == 0) {
          // there are no available transitions for the student
          transitionResult = null;
        } else if (availableTransitions.length == 1) {
          // there is one available transition for the student
          transitionResult = availableTransitions[0];
        } else if (availableTransitions.length > 1) {
          // there are multiple available transitions for the student
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
              // ask the user which branch path to go to

              resolvePromiseNow = false;
              let chooseBranchPathTemplateUrl = this.ProjectService.getThemePath() + '/templates/branchPathChooser.html';
              const dialogOptions = {
                templateUrl: chooseBranchPathTemplateUrl,
                controller: ChooseBranchPathController,
                locals: {
                  availableTransitions: availableTransitions,
                  deferred: deferred,
                  nodeId: nodeId
                }
              };

              /**
               * Controller that handles the dialog popup that lets the user
               * which branch path to go to.
               * @param $scope the scope
               * @param $mdDialog the dialog popup object
               * @param availableTransitions the branch paths
               * @param deferred used to resolve the promise once the user
               * has chosen a branch path
               * @param nodeId the current node
               */
              function ChooseBranchPathController($scope, $mdDialog, NodeService, ProjectService, availableTransitions, deferred, nodeId) {
                $scope.availableTransitions = availableTransitions;
                $scope.NodeService = NodeService;
                $scope.ProjectService = ProjectService;

                // called when the user clicks on a branch path
                $scope.chooseBranchPath = (transitionResult) => {
                  // remember the transition that was chosen
                  $scope.NodeService.setTransitionResult(nodeId, transitionResult);

                  // resolve the promise
                  deferred.resolve(transitionResult);

                  /*
                   * don't remember the promise for this step anymore
                   * since we have resolved it
                   */
                  $scope.NodeService.setChooseTransitionPromise(nodeId, null);

                  // close the dialog
                  $mdDialog.hide();
                };

                // obtains the step number and title
                $scope.getNodePositionAndTitleByNodeId = (nodeId) => {
                  return $scope.ProjectService.getNodePositionAndTitleByNodeId(nodeId);
                };

                // called when the dialog is closed
                $scope.close = () => {
                  $mdDialog.hide();
                }
              }

              ChooseBranchPathController.$inject = ['$scope', '$mdDialog', 'NodeService', 'ProjectService', 'availableTransitions', 'deferred', 'nodeId'];

              /*
               * show the popup dialog that lets the user choose the
               * branch path
               */
              this.$mdDialog.show(dialogOptions);
            }
          } else {
            /*
             * we are in regular student run mode so we will choose
             * the branch according to how the step was authored
             */
            const howToChooseAmongAvailablePaths = transitionLogic.howToChooseAmongAvailablePaths;
            if (howToChooseAmongAvailablePaths == null ||
              howToChooseAmongAvailablePaths === '' ||
              howToChooseAmongAvailablePaths === 'random') {
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

    if (resolvePromiseNow) {
      // remember the transition that was chosen for this step
      this.setTransitionResult(nodeId, transitionResult);

      // resolve the promise immediately
      deferred.resolve(transitionResult);
    } else {
      /*
       * remember the promise in case someone else calls chooseTransition()
       * so we can chain off of this promise instead of creating another
       * promise
       */
      this.setChooseTransitionPromise(nodeId, promise);
    }
    return promise;
  };

  currentNodeHasTransitionLogic() {
    const currentNode = this.StudentDataService.getCurrentNode();
    if (currentNode != null) {
      const transitionLogic = currentNode.transitionLogic;
      if (transitionLogic != null) {
        return true;
      }
    }
    return false;
  };

  /**
   * Evaluate the transition logic for the current node and create branch
   * path taken events if necessary.
   */
  evaluateTransitionLogic() {
    const currentNode = this.StudentDataService.getCurrentNode();
    if (currentNode != null) {
      const nodeId = currentNode.id;
      const transitionLogic = currentNode.transitionLogic;
      if (transitionLogic != null) {
        // get all the transitions from the current node
        const transitions = transitionLogic.transitions;
        const canChangePath = transitionLogic.canChangePath;
        let alreadyBranched = false;

        // get all the branchPathTaken events for the current node
        const events = this.StudentDataService.getBranchPathTakenEventsByNodeId(currentNode.id);

        if (events.length > 0) {
          // the student has branched from this node before
          alreadyBranched = true;
        }

        let transition, fromNodeId, toNodeId;
        if (alreadyBranched) {
          // student has previously branched
          if (canChangePath) {
            // student can change path

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
  };

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
    const eventData = {};
    eventData.fromNodeId = fromNodeId;
    eventData.toNodeId = toNodeId;
    this.StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);
  }

  evaluateTransitionLogicOn(event) {
    const currentNode = this.StudentDataService.getCurrentNode();
    if (currentNode != null) {
      const transitionLogic = currentNode.transitionLogic;
      const whenToChoosePath = transitionLogic.whenToChoosePath;
      if (event === whenToChoosePath) {
        return true;
      }
    }
    return false;
  };

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
    if (nodeId != null) {
      this.chooseTransitionPromises[nodeId] = promise;
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
    let dialogHeader =
      `<md-toolbar>
                <div class="md-toolbar-tools">
                    <h2>${ stepNumberAndTitle }</h2>
                </div>
            </md-toolbar>`;

    let dialogActions =
      `<md-dialog-actions layout="row" layout-align="end center">
                <md-button class="md-primary" ng-click="openInNewWindow()" aria-label="{{ 'openInNewWindow' | translate }}">{{ 'openInNewWindow' | translate }}</md-button>
                <md-button class="md-primary" ng-click="close()" aria-label="{{ 'close' | translate }}">{{ 'close' | translate }}</md-button>
            </md-dialog-actions>`;

    let dialogContent =
      `<md-dialog-content class="gray-lighter-bg">
                <div class="md-dialog-content" id="nodeInfo_${ nodeId }">
                    <node-info node-id="${ nodeId }"></node-info>
                </div>
            </md-dialog-content>`;

    let dialogString = `<md-dialog class="dialog--wider" aria-label="${ stepNumberAndTitle } - ${ rubricTitle }">${ dialogHeader }${  dialogContent }${ dialogActions }</md-dialog>`;

    // display the rubric in a popup
    this.$mdDialog.show({
      template : dialogString,
      fullscreen: true,
      controller: ['$scope', '$mdDialog',
        function DialogController($scope, $mdDialog) {
          // display the rubric in a new tab
          $scope.openInNewWindow = function() {
            // open a new tab
            let w = window.open('', '_blank');

            /*
             * create the header for the new window that contains the project title
             */
            let windowHeader =
              `<md-toolbar class="layout-row">
                                <div class="md-toolbar-tools primary-bg" style="color: #ffffff;">
                                    <h2>${ stepNumberAndTitle }</h2>
                                </div>
                            </md-toolbar>`;

            let rubricContent = document.getElementById('nodeInfo_' + nodeId).innerHTML;

            // create the window string
            let windowString =
              `<link rel='stylesheet' href='../wise5/lib/bootstrap/css/bootstrap.min.css' />
                            <link rel='stylesheet' href='../wise5/themes/default/style/monitor.css'>
                            <link rel='stylesheet' href='../wise5/themes/default/style/angular-material.css'>
                            <link rel='stylesheet' href='../wise5/lib/summernote/dist/summernote.css' />
                            <link rel="stylesheet" href="http://fonts.googleapis.com/css?family=Roboto:300,400,500,700,400italic%7CMaterial+Icons" media="all">
                            <body class="layout-column">
                                <div class="layout-column">${ windowHeader }<md-content class="md-padding">${ rubricContent }</div></md-content></div>
                            </body>`;

            // write the rubric content to the new tab
            w.document.write(windowString);

            // close the popup
            $mdDialog.hide();
          };

          // close the popup
          $scope.close = () => {
            $mdDialog.hide();
          }
        }
      ],
      targetEvent: $event,
      clickOutsideToClose: true,
      escapeToClose: true
    });
  }
}

NodeService.$inject = [
  '$filter',
  '$http',
  '$injector',
  '$mdDialog',
  '$q',
  'ConfigService',
  'ProjectService',
  'StudentDataService'
];

export default NodeService;
