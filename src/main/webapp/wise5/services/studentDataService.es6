class StudentDataService {
  constructor(
      $filter,
      $http,
      $injector,
      $q,
      $rootScope,
      AnnotationService,
      ConfigService,
      ProjectService,
      UtilService) {
    this.$filter = $filter;
    this.$http = $http;
    this.$injector = $injector;
    this.$q = $q;
    this.$rootScope = $rootScope;
    this.AnnotationService = AnnotationService;
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.UtilService = UtilService;
    this.$translate = this.$filter('translate');
    this.currentNode = null;
    this.previousStep = null;
    this.studentData = null;
    this.stackHistory = [];  // array of node id's
    this.visitedNodesHistory = [];
    this.nodeStatuses = {};
    this.runStatus = null;
    this.maxScore = null;

    this.maxPlanningNodeNumber = 0;

    /*
     * A counter to keep track of how many saveToServer requests we have
     * made that we haven't received a response for yet. When this value
     * goes back down to 0, we will send update the student status and then
     * save it to the server.
     */
    this.saveToServerRequestCount = 0;

    /*
     * A dummy student work id that is used in preview mode when we simulate
     * saving of student data.
     */
    this.dummyStudentWorkId = 1;

    // listen for node status changes
    this.$rootScope.$on('nodeStatusesChanged', (event, args) => {
      // calculate active global annotations and group them by group name as needed
      this.AnnotationService.calculateActiveGlobalAnnotationGroups();

      // go through the global annotations and see if they can be un-globalized by checking if their criterias have been met.
      let globalAnnotationGroups = this.AnnotationService.getActiveGlobalAnnotationGroups();
      globalAnnotationGroups.map((globalAnnotationGroup) => {
        let globalAnnotations = globalAnnotationGroup.annotations;
        globalAnnotations.map((globalAnnotation) => {
          if (globalAnnotation.data != null && globalAnnotation.data.isGlobal) {
            let unGlobalizeConditional = globalAnnotation.data.unGlobalizeConditional;
            let unGlobalizeCriteriaArray = globalAnnotation.data.unGlobalizeCriteria;
            if (unGlobalizeCriteriaArray != null) {
              if (unGlobalizeConditional === "any") {
                // at least one criteria in unGlobalizeCriteriaArray must be satisfied in any order before un-globalizing this annotation
                let anySatified = false;
                for (let unGlobalizeCriteria of unGlobalizeCriteriaArray) {
                  let unGlobalizeCriteriaResult = this.evaluateCriteria(unGlobalizeCriteria);
                  anySatified = anySatified || unGlobalizeCriteriaResult;
                }
                if (anySatified) {
                  globalAnnotation.data.unGlobalizedTimestamp = Date.parse(new Date());  // save when criteria was satisfied
                  this.saveAnnotations([globalAnnotation]);  // save changes to server
                }
              } else if (unGlobalizeConditional === "all") {
                // all criteria in unGlobalizeCriteriaArray must be satisfied in any order before un-globalizing this annotation
                let allSatisfied = true;
                for (let unGlobalizeCriteria of unGlobalizeCriteriaArray) {
                  let unGlobalizeCriteriaResult = this.evaluateCriteria(unGlobalizeCriteria);
                  allSatisfied = allSatisfied && unGlobalizeCriteriaResult;
                }
                if (allSatisfied) {
                  globalAnnotation.data.unGlobalizedTimestamp = Date.parse(new Date());  // save when criteria was satisfied
                  this.saveAnnotations([globalAnnotation]);  // save changes to server
                }
              }
            }
          }
        });
      })
    });

    /**
     * Listen for the 'newAnnotationReceived' event which is fired when
     * student receives a new annotation from the server
     */
    this.$rootScope.$on('newAnnotationReceived', (event, args) => {
      if (args) {
        // get the annotation that was saved to the server
        let annotation = args.annotation;
        this.handleAnnotationReceived(annotation);
      }
    });
  }

  retrieveStudentData() {
    if (this.ConfigService.isPreview()) {
      // we are previewing the project

      // initialize dummy student data
      this.studentData = {};
      this.studentData.componentStates = [];
      this.studentData.nodeStates = [];
      this.studentData.events = [];
      this.studentData.annotations = [];
      this.studentData.userName = this.$translate('PREVIEW_STUDENT');
      this.studentData.userId = '0';

      // set the annotations into the annotation service
      this.AnnotationService.setAnnotations(this.studentData.annotations);

      // populate the student history
      this.populateHistories(this.studentData.events);

      // update the node statuses
      this.updateNodeStatuses();
    } else {
      // we are in a run

      // get the url to get the student data
      const studentDataURL = this.ConfigService.getConfigParam('studentDataURL');

      const httpParams = {};
      httpParams.method = 'GET';
      httpParams.url = studentDataURL;

      // set the workgroup id and run id
      const params = {};
      params.workgroupId = this.ConfigService.getWorkgroupId();
      params.runId = this.ConfigService.getRunId();
      params.getStudentWork = true;
      params.getEvents = true;
      params.getAnnotations = true;
      params.toWorkgroupId = this.ConfigService.getWorkgroupId();
      httpParams.params = params;

      // make the request for the student data
      return this.$http(httpParams).then((result) => {
        const resultData = result.data;
        if (resultData != null) {
          this.studentData = {};

          // get student work
          this.studentData.componentStates = [];
          this.studentData.nodeStates = [];
          const studentWorkList = resultData.studentWorkList;
          for (let studentWork of studentWorkList) {
            if (studentWork.componentId != null) {
              this.studentData.componentStates.push(studentWork);
            } else {
              this.studentData.nodeStates.push(studentWork);
            }
          }

          // Check to see if this Project contains any Planning activities
          if (this.ProjectService.project.nodes != null && this.ProjectService.project.nodes.length > 0) {
            // Overload/add new nodes based on student's work in the NodeState for the planning group.
            for (let planningGroupNode of this.ProjectService.project.nodes) {
              if (planningGroupNode.planning) {
                let lastestNodeStateForPlanningGroupNode = this.getLatestNodeStateByNodeId(planningGroupNode.id);
                if (lastestNodeStateForPlanningGroupNode != null) {
                  let studentModifiedNodes = lastestNodeStateForPlanningGroupNode.studentData.nodes;
                  if (studentModifiedNodes != null) {
                    for (let studentModifiedNode of studentModifiedNodes) {
                      let studentModifiedNodeId = studentModifiedNode.id;
                      if (studentModifiedNode.planning) {
                        // If this is a Planning Node that exists in the project, replace the one in the original project with this one.
                        for (let n = 0; n < this.ProjectService.project.nodes.length; n++) {
                          if (this.ProjectService.project.nodes[n].id === studentModifiedNodeId) {
                            // Only overload the ids. This will allow authors to add more planningNodes during the run if needed.
                            this.ProjectService.project.nodes[n].ids = studentModifiedNode.ids;
                          }
                        }
                      } else {
                        // Otherwise, this is an instance of a PlanningNode template, so just append it to the end of the Project.nodes
                        this.ProjectService.project.nodes.push(studentModifiedNode);
                      }
                    }
                  }
                }
              }
            }
            // Re-parse the project with the modified changes
            this.ProjectService.parseProject();
          }

          // get events
          this.studentData.events = resultData.events;

          // get annotations
          this.studentData.annotations = resultData.annotations;

          this.AnnotationService.setAnnotations(this.studentData.annotations);

          // populate the student history
          this.populateHistories(this.studentData.events);

          // update the node statuses
          this.updateNodeStatuses();
        }

        return this.studentData;
      });
    }
  };

  /**
   * Retrieve the run status
   */
  retrieveRunStatus() {
    if (this.ConfigService.isPreview()) {
      // we are previewing the project
      this.runStatus = {};
    } else {
      // we are in a run
      const runStatusURL = this.ConfigService.getConfigParam('runStatusURL');
      const runId = this.ConfigService.getConfigParam('runId');

      //create the params for the request
      const params = {
        runId:runId
      };

      const httpParams = {};
      httpParams.method = 'GET';
      httpParams.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
      httpParams.url = runStatusURL;
      httpParams.params = params;

      // make the request for the run status
      return this.$http(httpParams).then((result) => {
        if (result != null) {
          const data = result.data;
          if (data != null) {
            // remember the run status
            this.runStatus = data;
          }
        }
      });
    }
  }

  getNodeStatuses() {
    return this.nodeStatuses;
  };

  setNodeStatusByNodeId(nodeId, nodeStatus) {
    if (nodeId != null && nodeStatus != null) {
      const nodeStatuses = this.nodeStatuses;
      if (nodeStatuses != null) {
        nodeStatuses[nodeId] = nodeStatus;
      }
    }
  }

  getNodeStatusByNodeId(nodeId) {
    let nodeStatus = null;
    const nodeStatuses = this.nodeStatuses;
    if (nodeId != null && nodeStatuses != null) {
      nodeStatus = nodeStatuses[nodeId];
    }
    return nodeStatus;
  };

  updateNodeStatuses() {
    let nodes = this.ProjectService.getNodes();
    let planningNodes = this.ProjectService.getPlanningNodes();
    const groups = this.ProjectService.getGroups();

    if (nodes != null) {
      if (planningNodes != null) {
        nodes = nodes.concat(planningNodes);
      }
      for (let node of nodes) {
        if (!this.ProjectService.isGroupNode(node.id)) {
          this.updateNodeStatusByNode(node);
        }
      }
    }

    let group;
    if (groups != null) {
      for (let group of groups) {
        group.depth = this.ProjectService.getNodeDepth(group.id);
      }

      // sort by descending depth order (need to calculate completion for lowest level groups first)
      groups.sort(function(a, b) {
        return b.depth - a.depth;
      });

      for (let group of groups) {
        this.updateNodeStatusByNode(group);
      }
    }

    // update max score
    this.maxScore = this.getMaxScore();
    this.$rootScope.$broadcast('nodeStatusesChanged');
  };

  /**
   * Update the node status for a node
   * @param node the node to update
   */
  updateNodeStatusByNode(node) {
    if (node != null) {
      const nodeId = node.id;
      const tempNodeStatus = {};
      tempNodeStatus.nodeId = nodeId;
      tempNodeStatus.isVisitable = true;
      tempNodeStatus.isCompleted = true;

      // get the constraints that affect this node
      let constraintsForNode = this.ProjectService.getConstraintsForNode(node);

      if (this.ConfigService.getConfigParam('constraints') == false) {
        /*
         * constraints have been disabled, most likely because we are
         * in preview without constraints mode
         */
        constraintsForNode = null;
      }

      if (constraintsForNode == null || constraintsForNode.length == 0) {
        if (this.ProjectService.getFlattenedProjectAsNodeIds().indexOf(nodeId) == -1 &&
          !this.ProjectService.isGroupNode(nodeId)) {
          // there are no transitions to this node so it is not visible
          tempNodeStatus.isVisible = false;
          tempNodeStatus.isVisitable = true;
        } else {
          // this node does not have any constraints so it is clickable
          tempNodeStatus.isVisible = true;
          tempNodeStatus.isVisitable = true;
        }
      } else {
        const isVisibleResults = [];
        const isVisitableResults = [];

        let result = false;
        const firstResult = true;

        for (let constraintForNode of constraintsForNode) {
          if (constraintForNode != null) {
            // evaluate the constraint to see if the node can be visited
            const tempResult = this.evaluateConstraint(node, constraintForNode);

            const action = constraintForNode.action;

            if (action != null) {
              if (action === 'makeThisNodeNotVisible') {
                isVisibleResults.push(tempResult);
              } else if (action === 'makeThisNodeNotVisitable') {
                isVisitableResults.push(tempResult);
              } else if (action === 'makeAllNodesAfterThisNotVisible') {
                isVisibleResults.push(tempResult);
              } else if (action === 'makeAllNodesAfterThisNotVisitable') {
                isVisitableResults.push(tempResult);
              } else if (action === 'makeAllOtherNodesNotVisible') {
                isVisibleResults.push(tempResult);
              } else if (action === 'makeAllOtherNodesNotVisitable') {
                isVisitableResults.push(tempResult);
              }
            }
          }
        }

        let isVisible = true;
        let isVisitable = true;

        for (let isVisibleResult of isVisibleResults) {
          isVisible = isVisible && isVisibleResult;
        }

        for (let isVisitableResult of isVisitableResults) {
          isVisitable = isVisitable && isVisitableResult;
        }

        tempNodeStatus.isVisible = isVisible;
        tempNodeStatus.isVisitable = isVisitable;
      }

      tempNodeStatus.isCompleted = this.isCompleted(nodeId);
      tempNodeStatus.isVisited = this.isNodeVisited(nodeId);

      const nodeStatus = this.getNodeStatusByNodeId(nodeId);

      if (nodeStatus == null) {
        this.setNodeStatusByNodeId(nodeId, tempNodeStatus);
      } else {
        /*
         * get the previous isCompleted value so that we can later check
         * if it has changed
         */
        const previousIsCompletedValue = this.nodeStatuses[nodeId].isCompleted;

        this.nodeStatuses[nodeId].isVisited = tempNodeStatus.isVisited;
        this.nodeStatuses[nodeId].isVisible = tempNodeStatus.isVisible;
        this.nodeStatuses[nodeId].isVisitable = tempNodeStatus.isVisitable;
        this.nodeStatuses[nodeId].isCompleted = tempNodeStatus.isCompleted;

        if (previousIsCompletedValue == false && tempNodeStatus.isCompleted) {
          /*
           * the node status just changed from false to true so we
           * will fire an event
           */
          this.$rootScope.$broadcast('nodeCompleted', { nodeId: nodeId });
        }
      }

      this.nodeStatuses[nodeId].progress = this.getNodeProgressById(nodeId);
      this.nodeStatuses[nodeId].icon = this.ProjectService.getNodeIconByNodeId(nodeId);

      // get the latest component state for the node
      const latestComponentStatesForNode = this.getLatestComponentStateByNodeId(nodeId);
      if (latestComponentStatesForNode != null) {
        // set the latest component state timestamp into the node status
        this.nodeStatuses[nodeId].latestComponentStateClientSaveTime = latestComponentStatesForNode.clientSaveTime;
        this.nodeStatuses[nodeId].latestComponentStateServerSaveTime = latestComponentStatesForNode.serverSaveTime;
      }
    }

    //return nodeStatus;
  };

  /**
   * Evaluate the constraint
   * @param node the node
   * @param constraintForNode the constraint object
   * @returns whether the node has satisfied the constraint
   */
  evaluateConstraint(node, constraintForNode) {
    let result = false;
    if (constraintForNode != null) {
      const removalCriteria = constraintForNode.removalCriteria;
      if (removalCriteria != null) {
        result = this.evaluateNodeConstraint(node, constraintForNode);
      }
    }
    return result;
  };

  /**
   * Evaluate the guided navigation constraint
   * @param node the node
   * @param constraintForNode the constraint object
   * @returns whether the node can be visited or not
   */
  evaluateGuidedNavigationConstraint(node, constraintForNode) {
    let result = false;
    if (node != null) {
      const nodeId = node.id;

      if (this.isNodeVisited(nodeId)) {
        // the node has been visited before so it should be clickable
        result = true;
      } else {
        // get all the nodes that have been visited
        const visitedNodes = this.getVisitedNodesHistory();

        let transitionsToNodeId = [];

        for (let visitedNodeId of visitedNodes) {
          // get the transitions from the visited node to the node status node
          const transitions = this.ProjectService.getTransitionsByFromAndToNodeId(visitedNodeId, nodeId);

          // TODO: check if the transition can be used by the student

          // concat the node ids
          transitionsToNodeId = transitionsToNodeId.concat(transitions);
        }

        if (transitionsToNodeId != null && transitionsToNodeId.length > 0) {
          // there is a transition between the current node and the node status node

          /*
           * there are transitions from the current node to the node status node so
           * the node status node is clickable
           */
          result = true;
        } else {
          /*
           * there is no transition between the visited nodes and the node status node
           * so we will set the node to be not clickable
           */
          result = false;
        }

        if (this.ProjectService.isStartNode(node)) {
          /*
           * the node is the start node of the project or a start node of a group
           * so we will make it clickable
           */
          result = true;
        }
      }
    }
    return result;
  };

  /**
   * Evaluate the node constraint
   * @param node the node
   * @param constraintForNode the constraint object
   * @returns whether the node satisifies the constraint
   */
  evaluateNodeConstraint(node, constraintForNode) {
    let result = false;

    if (constraintForNode != null) {
      const removalCriteria = constraintForNode.removalCriteria;
      const removalConditional = constraintForNode.removalConditional;
      if (removalCriteria == null) {
        result = true;
      } else {
        let firstResult = true;
        for (let tempCriteria of removalCriteria) {
          if (tempCriteria != null) {
            // evaluate the criteria
            const tempResult = this.evaluateCriteria(tempCriteria);

            if (firstResult) {
              // this is the first criteria in this for loop
              result = tempResult;
              firstResult = false;
            } else {
              // this is not the first criteria

              if (removalConditional === 'any') {
                // any of the criteria can be true to remove the constraint
                result = result || tempResult;
              } else {
                // all the criteria need to be true to remove the constraint
                result = result && tempResult;
              }
            }
          }
        }
      }
    }
    return result;
  };


  /**
   * Evaluate the criteria
   * @param criteria the criteria
   * @returns whether the criteria is satisfied or not
   */
  evaluateCriteria(criteria) {
    let result = false;
    if (criteria != null) {
      const functionName = criteria.name;
      if (functionName == null) {

      } else if (functionName === 'branchPathTaken') {
        result = this.evaluateBranchPathTakenCriteria(criteria);
      } else if (functionName === 'isVisible') {

      } else if (functionName === 'isVisitable') {

      } else if (functionName === 'isVisited') {
        result = this.evaluateIsVisitedCriteria(criteria);
      } else if (functionName === 'isVisitedAfter') {
        result = this.evaluateIsVisitedAfterCriteria(criteria);
      } else if (functionName === 'isRevisedAfter') {
        result = this.evaluateIsRevisedAfterCriteria(criteria);
      } else if (functionName === 'isVisitedAndRevisedAfter') {
        result = this.evaluateIsVisitedAndRevisedAfterCriteria(criteria);
      } else if (functionName === 'isCompleted') {
        result = this.evaluateIsCompletedCriteria(criteria);
      } else if (functionName === 'isCorrect') {
        result = this.evaluateIsCorrectCriteria(criteria);
      } else if (functionName === 'choiceChosen') {
        result = this.evaluateChoiceChosenCriteria(criteria);
      } else if (functionName === 'isPlanningActivityCompleted') {
        result = this.evaluateIsPlanningActivityCompletedCriteria(criteria);
      } else if (functionName === 'score') {
        result = this.evaluateScoreCriteria(criteria);
      } else if (functionName === 'usedXSubmits') {
        result = this.evaluateUsedXSubmitsCriteria(criteria);
      } else if (functionName === '') {

      }
    }
    return result;
  };

  /**
   * Check if the isCompleted criteria was satisfied
   * @param criteria an isCompleted criteria
   * @returns whether the criteria was satisfied or not
   */
  evaluateIsCompletedCriteria(criteria) {
    let result = false;
    if (criteria != null && criteria.params != null) {
      const params = criteria.params;
      const nodeId = params.nodeId;
      result = this.isCompleted(nodeId);
    }
    return result;
  }

  /**
   * Check if the isCorrect criteria was satisfied
   * @param criteria an isCorrect criteria
   * @returns whether the criteria was satisfied or not
   */
  evaluateIsCorrectCriteria(criteria) {
    if (criteria != null && criteria.params != null) {
      const params = criteria.params;
      const nodeId = params.nodeId;
      const componentId = params.componentId;

      if (nodeId != null && componentId != null) {
        const componentStates = this.getComponentStatesByNodeIdAndComponentId(nodeId, componentId);
        if (componentStates != null) {
          for (let componentState of componentStates) {
            if (componentState != null) {
              const studentData = componentState.studentData;
              if (studentData != null) {
                if (studentData.isCorrect) {
                  return true;
                }
              }
            }
          }
        }
      }
    }
    return false;
  }

  /**
   * Check if the isPlanningActivityCompleted criteria was satisfied
   * @param criteria a isPlanningActivityCompleted criteria
   * @returns whether the criteria was satisfied or not
   */
  evaluateIsPlanningActivityCompletedCriteria(criteria) {
    let result = false;
    if (criteria != null && criteria.params != null) {
      const params = criteria.params;

      // get the group id
      const nodeId = params.nodeId;

      // get the number of planning steps the student needs to create
      const planningStepsCreated = params.planningStepsCreated;

      // get whether the student needs to complete all the steps in the activity
      const planningStepsCompleted = params.planningStepsCompleted;

      let planningStepsCreatedSatisfied = false;
      let planningStepsCompletedSatisfied = false;

      let planningNodes = [];

      if (planningStepsCreated == null) {
        // there is no value set so we will regard it as satisfied
        planningStepsCreatedSatisfied = true;
      } else {
        /*
         * there is a value for number of planning steps that need to be created
         * so we will check if the student created enough planning steps
         */

        // get the node states for the activity
        const nodeStates = this.getNodeStatesByNodeId(nodeId);

        if (nodeStates != null) {
          for (let ns = nodeStates.length - 1; ns >= 0; ns--) {
            let planningStepCount = 0;
            const nodeState = nodeStates[ns];
            if (nodeState != null) {
              const studentData = nodeState.studentData;
              if (studentData != null) {
                const nodes = studentData.nodes;
                if (nodes != null) {
                  for (let node of nodes) {
                    if (node != null) {
                      if (node.type === 'node' && node.planningNodeTemplateId != null) {
                        // we have found a planning step the student created
                        planningStepCount++;
                      }
                    }
                  }

                  if (planningStepCount >= planningStepsCreated) {
                    // the student has created a sufficient number of planning steps
                    planningStepsCreatedSatisfied = true;
                    planningNodes = nodes;
                    break;
                  }
                }
              }
            }
          }
        }
      }

      if (planningStepsCompleted == null) {
        planningStepsCompletedSatisfied = true;
      } else {
        /*
         * check if the activity is completed. this checks if all
         * the children of the activity are completed.
         */
        if (this.isCompleted(nodeId)) {
          planningStepsCompletedSatisfied = true;
        }
      }

      if (planningStepsCreatedSatisfied && planningStepsCompletedSatisfied) {
        result = true;
      }
    }
    return result;
  }

  /**
   * Check if this branchPathTaken criteria was satisfied
   * @param criteria a branchPathTaken criteria
   * @returns whether the branchPathTaken criteria was satisfied
   */
  evaluateBranchPathTakenCriteria(criteria) {
    let result = false;
    if (criteria != null && criteria.params != null) {
      // get the expected from and to node ids
      const expectedFromNodeId = criteria.params.fromNodeId;
      const expectedToNodeId = criteria.params.toNodeId;

      // get all the branchPathTaken events from the from node id
      const branchPathTakenEvents = this.getBranchPathTakenEventsByNodeId(expectedFromNodeId);

      if (branchPathTakenEvents != null) {
        for (let branchPathTakenEvent of branchPathTakenEvents) {
          if (branchPathTakenEvent != null) {
            const data = branchPathTakenEvent.data;
            if (data != null) {
              // get the from and to node ids of the event
              const fromNodeId = data.fromNodeId;
              const toNodeId = data.toNodeId;
              if (expectedFromNodeId === fromNodeId && expectedToNodeId === toNodeId) {
                // the from and to node ids match the ones we are looking for
                result = true;
              }
            }
          }
        }
      }
    }
    return result;
  };

  /**
   * Check if the isVisited criteria was satisfied
   * @param criteria the isVisited criteria
   * @returns whether the node id is visited
   */
  evaluateIsVisitedCriteria(criteria) {
    let isVisited = false;
    if (criteria != null && criteria.params != null) {
      // get the node id we want to check if was visited
      const nodeId = criteria.params.nodeId;

      const events = this.studentData.events;
      if (events != null) {
        for (let event of events) {
          if (event != null) {
            if (nodeId == event.nodeId && 'nodeEntered' === event.event) {
              isVisited = true;
            }
          }
        }
      }
    }
    return isVisited;
  }

  /**
   * Check if the isVisitedAfter criteria was satisfied
   * @param criteria the isVisitedAfter criteria
   * @returns whether the node id is visited after the criteriaCreatedTimestamp
   */
  evaluateIsVisitedAfterCriteria(criteria) {
    let isVisitedAfter = false;
    if (criteria != null && criteria.params != null) {
      // get the node id we want to check if was visited
      let isVisitedAfterNodeId = criteria.params.isVisitedAfterNodeId;
      let criteriaCreatedTimestamp = criteria.params.criteriaCreatedTimestamp;

      let events = this.studentData.events;
      if (events != null) {
        for (let event of events) {
          if (event != null) {
            if (isVisitedAfterNodeId == event.nodeId && 'nodeEntered' === event.event && event.clientSaveTime > criteriaCreatedTimestamp) {
              // the student has entered the node after the criteriaCreatedTimestamp
              isVisitedAfter = true;
            }
          }
        }
      }
    }
    return isVisitedAfter;
  }

  /**
   * Check if the isRevisedAfter criteria was satisfied
   * @param criteria the isRevisedAfter criteria
   * @returns whether the specified node&component was revisted after the criteriaCreatedTimestamp
   */
  evaluateIsRevisedAfterCriteria(criteria) {
    let isRevisedAfter = false;
    if (criteria != null && criteria.params != null) {
      // get the node id we want to check if was visited
      let isRevisedAfterNodeId = criteria.params.isRevisedAfterNodeId;
      let isRevisedAfterComponentId = criteria.params.isRevisedAfterComponentId;
      let criteriaCreatedTimestamp = criteria.params.criteriaCreatedTimestamp;

      // the student has entered the node after the criteriaCreatedTimestamp.
      // now check if student has revised the work after this event
      let latestComponentStateForRevisedComponent = this.getLatestComponentStateByNodeIdAndComponentId(isRevisedAfterNodeId, isRevisedAfterComponentId);
      if (latestComponentStateForRevisedComponent.clientSaveTime > criteriaCreatedTimestamp) {
        isRevisedAfter = true;
      }
    }
    return isRevisedAfter;
  }

  /**
   * Check if the isVisitedAndRevisedAfter criteria was satisfied
   * @param criteria the isVisitedAndRevisedAfter criteria
   * @returns whether the specified nodes were visited and specified node&component was revisted after the criteriaCreatedTimestamp
   */
  evaluateIsVisitedAndRevisedAfterCriteria(criteria) {
    let isVisitedAndRevisedAfter = false;
    if (criteria != null && criteria.params != null) {
      // get the node id we want to check if was visited
      let isVisitedAfterNodeId = criteria.params.isVisitedAfterNodeId;
      let isRevisedAfterNodeId = criteria.params.isRevisedAfterNodeId;
      let isRevisedAfterComponentId = criteria.params.isRevisedAfterComponentId;
      let criteriaCreatedTimestamp = criteria.params.criteriaCreatedTimestamp;

      let events = this.studentData.events;
      if (events != null) {
        for (let event of events) {
          if (event != null) {
            if (isVisitedAfterNodeId == event.nodeId && 'nodeEntered' === event.event && event.clientSaveTime > criteriaCreatedTimestamp) {
              // the student has entered the node after the criteriaCreatedTimestamp.
              // now check if student has revised the work after this event
              let latestComponentStateForRevisedComponent = this.getLatestComponentStateByNodeIdAndComponentId(isRevisedAfterNodeId, isRevisedAfterComponentId);
              if (latestComponentStateForRevisedComponent.clientSaveTime > event.clientSaveTime) {
                isVisitedAndRevisedAfter = true;
              }
            }
          }
        }
      }
    }
    return isVisitedAndRevisedAfter;
  }

  /**
   * Get all the branchPathTaken events by node id
   * @params fromNodeId the from node id
   * @returns all the branchPathTaken events from the given node id
   */
  getBranchPathTakenEventsByNodeId(fromNodeId) {
    const branchPathTakenEvents = [];
    const events = this.studentData.events;
    if (events != null) {
      for (let event of events) {
        if (event != null) {
          if (fromNodeId === event.nodeId && 'branchPathTaken' === event.event) {
            // we have found a branchPathTaken event from the from node id
            branchPathTakenEvents.push(event);
          }
        }
      }
    }
    return branchPathTakenEvents;
  }

  /**
   * Evaluate the choice chosen criteria
   * @param criteria the criteria to evaluate
   * @returns a boolean value whether the criteria was satisfied or not
   */
  evaluateChoiceChosenCriteria(criteria) {
    let result = false;
    const serviceName = 'MultipleChoiceService';  // Assume MC component.
    if (this.$injector.has(serviceName)) {
      // get the MultipleChoiceService
      const service = this.$injector.get(serviceName);

      // check if the criteria was satisfied
      result = service.choiceChosen(criteria);
    }
    return result;
  };

  /**
   * Evaluate the score criteria
   * @param criteria the criteria to evaluate
   * @returns a boolean value whether the criteria was satisfied or not
   */
  evaluateScoreCriteria(criteria) {
    let result = false;
    const params = criteria.params;
    if (params != null) {
      const nodeId = params.nodeId;
      const componentId = params.componentId;
      const scores = params.scores;
      const workgroupId = this.ConfigService.getWorkgroupId();
      const scoreType = 'any';
      if (nodeId != null && componentId != null && scores != null) {
        // get the latest score annotation
        const latestScoreAnnotation = this.AnnotationService.getLatestScoreAnnotation(nodeId, componentId, workgroupId, scoreType);

        if (latestScoreAnnotation != null) {
          // get the score value
          const scoreValue = this.AnnotationService.getScoreValueFromScoreAnnotation(latestScoreAnnotation);

          // check if the score value matches what the criteria is looking for. works when scores is array of integers or integer strings
          if (scores.indexOf(scoreValue) != -1 || (scoreValue != null && scores.indexOf(scoreValue.toString()) != -1)) {
            /*
             * the student has received a score that matches a score
             * we're looking for
             */
            result = true;
          }
        }
      }
    }
    return result;
  };

  /**
   * Evaluate the used x submits criteria which requires the student to submit
   * at least x number of times.
   * @param criteria the criteria to evaluate
   * @returns a boolean value whether the student submitted at least x number
   * of times
   */
  evaluateUsedXSubmitsCriteria(criteria) {
    let result = false;
    const params = criteria.params;
    if (params != null) {
      // get the node id and component id to check the submit counter for
      const nodeId = params.nodeId;
      const componentId = params.componentId;

      // get the number of submits required
      const requiredSubmitCount = params.requiredSubmitCount;

      if (nodeId != null && componentId != null) {
        // get the component states for the component
        const componentStates = this.getComponentStatesByNodeIdAndComponentId(nodeId, componentId);
        if (componentStates != null) {
          // counter for manually counting the component states with isSubmit=true
          let manualSubmitCounter = 0;

          // counter for remembering the highest submitCounter value found in studentData objects
          let highestSubmitCounter = 0;

          /*
           * We are counting with two submit counters for backwards compatibility.
           * Some componentStates only have isSubmit=true and do not keep an
           * updated submitCounter for the number of submits.
           */

          for (let componentState of componentStates) {
            if (componentState != null) {
              if (componentState.isSubmit) {
                manualSubmitCounter++;
              }
              const studentData = componentState.studentData;
              if (studentData != null) {
                if (studentData.submitCounter != null) {
                  if (studentData.submitCounter > highestSubmitCounter) {
                    /*
                     * the submit counter in the student data is higher
                     * than we have previously seen
                     */
                    highestSubmitCounter = studentData.submitCounter;
                  }
                }
              }
            }
          }

          if (manualSubmitCounter >= requiredSubmitCount || highestSubmitCounter >= requiredSubmitCount) {
            // the student submitted the required number of times
            result = true;
          }
        }
      }
    }
    return result;
  }

  /**
   * Populate the stack history and visited nodes history
   * @param events the events
   */
  populateHistories(events) {
    this.stackHistory = [];
    this.visitedNodesHistory = [];

    if (events != null) {
      for (let event of events) {
        if (event != null) {
          if (event.event === 'nodeEntered') {
            // the student has visited this node id before
            this.updateStackHistory(event.nodeId);
            this.updateVisitedNodesHistory(event.nodeId);
          }
        }
      }
    }
  };

  getStackHistoryAtIndex(index) {
    if (index < 0) {
      index = this.stackHistory.length + index;
    }
    let stackHistoryResult = null;
    if (this.stackHistory != null && this.stackHistory.length > 0) {
      stackHistoryResult = this.stackHistory[index];
    }
    return stackHistoryResult;
  };

  getStackHistory() {
    return this.stackHistory;
  };

  updateStackHistory(nodeId) {
    const indexOfNodeId = this.stackHistory.indexOf(nodeId);
    if (indexOfNodeId === -1) {
      this.stackHistory.push(nodeId);
    } else {
      this.stackHistory.splice(indexOfNodeId + 1, this.stackHistory.length);
    }
  };

  updateVisitedNodesHistory(nodeId) {
    const indexOfNodeId = this.visitedNodesHistory.indexOf(nodeId);
    if (indexOfNodeId === -1) {
      this.visitedNodesHistory.push(nodeId);
    }
  };

  getVisitedNodesHistory() {
    return this.visitedNodesHistory;
  };

  isNodeVisited(nodeId) {
    let result = false;
    const visitedNodesHistory = this.visitedNodesHistory;
    if (visitedNodesHistory != null) {
      const indexOfNodeId = visitedNodesHistory.indexOf(nodeId);
      if (indexOfNodeId !== -1) {
        result = true;
      }
    }
    return result;
  };

  createComponentState() {
    const componentState = {};
    componentState.timestamp = Date.parse(new Date());
    return componentState;
  };

  addComponentState(componentState) {
    if (this.studentData != null && this.studentData.componentStates != null) {
      this.studentData.componentStates.push(componentState);
    }
  };

  addNodeState(nodeState) {
    if (this.studentData != null && this.studentData.nodeStates != null) {
      this.studentData.nodeStates.push(nodeState);
    }
  };

  /**
   * Returns all NodeStates
   * @returns Array of all NodeStates
   */
  getNodeStates() {
    let nodeStates = [];
    if (this.studentData != null && this.studentData.nodeStates != null) {
      nodeStates = this.studentData.nodeStates;
    }
    return nodeStates;
  };

  /**
   * Get all NodeStates for a specific node
   * @param nodeId id of node
   * @returns Array of NodeStates for the specified node
   */
  getNodeStatesByNodeId(nodeId) {
    const nodeStatesByNodeId = [];
    if (this.studentData != null && this.studentData.nodeStates != null) {
      const nodeStates = this.studentData.nodeStates;
      for (let nodeState of nodeStates) {
        if (nodeState != null) {
          const tempNodeId = nodeState.nodeId;
          if (nodeId === tempNodeId) {
            nodeStatesByNodeId.push(nodeState);
          }
        }
      }
    }
    return nodeStatesByNodeId;
  };

  addEvent(event) {
    if (this.studentData != null && this.studentData.events != null) {
      this.studentData.events.push(event);
    }
  };

  addAnnotation(annotation) {
    if (this.studentData != null && this.studentData.annotations != null) {
      this.studentData.annotations.push(annotation);
    }
  };

  handleAnnotationReceived(annotation) {
    // add the annotation to the local annotations array
    this.studentData.annotations.push(annotation);

    if (annotation.notebookItemId) {
      // broadcast the event that a new notebook item annotation has been received
      this.$rootScope.$broadcast('notebookItemAnnotationReceived', {annotation: annotation});
    } else {
      // broadcast the event that a new annotation has been received
      this.$rootScope.$broadcast('annotationReceived', {annotation: annotation});
    }
  }

  saveComponentEvent(component, category, event, data) {
    if (component == null || category == null || event == null) {
      alert(this.$translate('STUDENT_DATA_SERVICE_SAVE_COMPONENT_EVENT_COMPONENT_CATEGORY_EVENT_ERROR'));
      return;
    }
    const context = "Component";
    const nodeId = component.nodeId;
    const componentId = component.componentId;
    const componentType = component.componentType;
    if (nodeId == null || componentId == null || componentType == null) {
      alert(this.$translate('STUDENT_DATA_SERVICE_SAVE_COMPONENT_EVENT_NODE_ID_COMPONENT_ID_COMPONENT_TYPE_ERROR'));
      return;
    }
    this.saveEvent(context, nodeId, componentId, componentType, category, event, data);
  };

  saveVLEEvent(nodeId, componentId, componentType, category, event, data) {
    if (category == null || event == null) {
      alert(this.$translate('STUDENT_DATA_SERVICE_SAVE_VLE_EVENT_CATEGORY_EVENT_ERROR'));
      return;
    }
    const context = "VLE";
    this.saveEvent(context, nodeId, componentId, componentType, category, event, data);
  };

  saveEvent(context, nodeId, componentId, componentType, category, event, data) {
    const events = [];
    const newEvent = this.createNewEvent();
    newEvent.context = context;
    newEvent.nodeId = nodeId;
    newEvent.componentId = componentId;
    newEvent.type = componentType;
    newEvent.category = category;
    newEvent.event = event;
    newEvent.data = data;
    events.push(newEvent);
    const componentStates = null;
    const nodeStates = null;
    const annotations = null;
    this.saveToServer(componentStates, nodeStates, events, annotations);
  };

  /**
   * Create a new empty event
   * @return a new empty event
   */
  createNewEvent() {
    const event = {};
    event.projectId = this.ConfigService.getProjectId();
    event.runId = this.ConfigService.getRunId();
    event.periodId = this.ConfigService.getPeriodId();
    event.workgroupId = this.ConfigService.getWorkgroupId();
    event.clientSaveTime = Date.parse(new Date());
    return event;
  };

  saveNodeStates(nodeStates) {
    const componentStates = null;
    const events = null;
    const annotations = null;
    this.saveToServer(componentStates, nodeStates, events, annotations);
  };


  saveAnnotations(annotations) {
    const componentStates = null;
    const nodeStates = null;
    const events = null;
    this.saveToServer(componentStates, nodeStates, events, annotations);
  };

  saveToServer(componentStates, nodeStates, events, annotations) {
    /*
     * increment the request count since we are about to save data
     * to the server
     */
    this.saveToServerRequestCount += 1;

    // merge componentStates and nodeStates into StudentWork before posting
    const studentWorkList = [];
    if (componentStates != null && componentStates.length > 0) {
      for (let componentState of componentStates) {
        if (componentState != null) {
          componentState.requestToken = this.UtilService.generateKey(); // use this to keep track of unsaved componentStates.
          this.addComponentState(componentState);
          studentWorkList.push(componentState);
        }
      }
    }

    if (nodeStates != null && nodeStates.length > 0) {
      for (let nodeState of nodeStates) {
        if (nodeState != null) {
          nodeState.requestToken = this.UtilService.generateKey(); // use this to keep track of unsaved componentStates.
          this.addNodeState(nodeState);
          studentWorkList.push(nodeState);
        }
      }
    }

    if (events != null && events.length > 0) {
      for (let event of events) {
        if (event != null) {
          event.requestToken = this.UtilService.generateKey(); // use this to keep track of unsaved events.
          this.addEvent(event);
        }
      }
    } else {
      events = [];
    }

    if (annotations != null && annotations.length > 0) {
      for (let annotation of annotations) {
        if (annotation != null) {
          annotation.requestToken = this.UtilService.generateKey(); // use this to keep track of unsaved annotations.
          if (annotation.id == null) {
            // add to local annotation array if this annotation has not been saved to the server before.
            this.addAnnotation(annotation);
          }
        }
      }
    } else {
      annotations = [];
    }

    if (this.ConfigService.isPreview()) {
      const savedStudentDataResponse = {
        studentWorkList: studentWorkList,
        events: events,
        annotations: annotations
      };

      // if we're in preview, don't make any request to the server but pretend we did
      this.saveToServerSuccess(savedStudentDataResponse);
      let deferred = this.$q.defer();
      deferred.resolve(savedStudentDataResponse);
      return deferred.promise;
    } else {
      // set the workgroup id and run id
      const params = {};
      params.projectId = this.ConfigService.getProjectId();
      params.runId = this.ConfigService.getRunId();
      params.workgroupId = this.ConfigService.getWorkgroupId();
      params.studentWorkList = angular.toJson(studentWorkList);
      params.events = angular.toJson(events);
      params.annotations = angular.toJson(annotations);

      // get the url to POST the student data
      const httpParams = {};
      httpParams.method = 'POST';
      httpParams.url = this.ConfigService.getConfigParam('studentDataURL');
      httpParams.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
      httpParams.data = $.param(params);

      // make the request to post the student data
      return this.$http(httpParams).then(
        result => {
          // get the local references to the component states that were posted and set their id and serverSaveTime
          if (result != null && result.data != null) {
            const savedStudentDataResponse = result.data;

            this.saveToServerSuccess(savedStudentDataResponse);

            return savedStudentDataResponse;
          }
        }, result => {
          // a server error occured

          /*
           * decrement the request count since this request failed
           * but is now completed
           */
          this.saveToServerRequestCount -= 1;

          return null;
        }
      );
    }
  };

  saveToServerSuccess(savedStudentDataResponse) {
    /*
     * decrement the request count since we have received a response to
     * one of our save requests
     */
    this.saveToServerRequestCount -= 1;

    if (this.saveToServerRequestCount == 0) {
      /*
       * we have received the reponse to all of the saveToServer requests
       * so we will now update the student status and save it to the
       * server
       */
      this.updateNodeStatuses();
      this.saveStudentStatus();
    }

    // set dummy serverSaveTime for use if we're in preview mode
    let serverSaveTime = Date.parse(new Date());

    // handle saved studentWork
    if (savedStudentDataResponse.studentWorkList) {
      let savedStudentWorkList = savedStudentDataResponse.studentWorkList;
      let localStudentWorkList = this.studentData.componentStates;
      if (this.studentData.nodeStates) {
        localStudentWorkList = localStudentWorkList.concat(this.studentData.nodeStates);
      }

      // set the id and serverSaveTime in the local studentWorkList
      for (let savedStudentWork of savedStudentWorkList) {
        /*
         * loop through all the student work that were posted
         * to find the one with the matching request token
         */
        for (let l = localStudentWorkList.length - 1; l >= 0; l--) {
          const localStudentWork = localStudentWorkList[l];
          if (localStudentWork.requestToken &&
            localStudentWork.requestToken === savedStudentWork.requestToken) {
            localStudentWork.id = savedStudentWork.id;
            localStudentWork.serverSaveTime = savedStudentWork.serverSaveTime ? savedStudentWork.serverSaveTime : serverSaveTime;
            localStudentWork.requestToken = null; // requestToken is no longer needed.

            if (this.ConfigService.getMode() == "preview" && localStudentWork.id == null) {
              /*
               * we are in preview mode so we will set a dummy
               * student work id into the student work
               */
              localStudentWork.id = this.dummyStudentWorkId;

              /*
               * increment the dummy student work id for the next
               * student work
               */
              this.dummyStudentWorkId++;
            }

            this.$rootScope.$broadcast('studentWorkSavedToServer', {studentWork: localStudentWork});
            break;
          }
        }
      }
    }
    // handle saved events
    if (savedStudentDataResponse.events) {
      const savedEvents = savedStudentDataResponse.events;

      const localEvents = this.studentData.events;

      // set the id and serverSaveTime in the local event
      for (let savedEvent of savedEvents) {
        /*
         * loop through all the events that were posted
         * to find the one with the matching request token
         */
        for (let l = localEvents.length - 1; l >= 0; l--) {
          const localEvent = localEvents[l];
          if (localEvent.requestToken &&
            localEvent.requestToken === savedEvent.requestToken) {
            localEvent.id = savedEvent.id;
            localEvent.serverSaveTime = savedEvent.serverSaveTime ? savedEvent.serverSaveTime : serverSaveTime;
            localEvent.requestToken = null; // requestToken is no longer needed.

            this.$rootScope.$broadcast('eventSavedToServer', {event: localEvent});
            break;
          }
        }
      }
    }

    // handle saved annotations
    if (savedStudentDataResponse.annotations) {
      const savedAnnotations = savedStudentDataResponse.annotations;
      const localAnnotations = this.studentData.annotations;

      // set the id and serverSaveTime in the local annotation
      for (let savedAnnotation of savedAnnotations) {
        /*
         * loop through all the events that were posted
         * to find the one with the matching request token
         */
        for (let l = localAnnotations.length - 1; l >= 0; l--) {
          const localAnnotation = localAnnotations[l];
          if (localAnnotation.requestToken &&
            localAnnotation.requestToken === savedAnnotation.requestToken) {
            localAnnotation.id = savedAnnotation.id;
            localAnnotation.serverSaveTime = savedAnnotation.serverSaveTime ? savedAnnotation.serverSaveTime : serverSaveTime;
            localAnnotation.requestToken = null; // requestToken is no longer needed.

            this.$rootScope.$broadcast('annotationSavedToServer', {annotation: localAnnotation});
            break;
          }
        }
      }
    }
  };

  /**
   * POSTs student status to server
   * Returns a promise of the POST request
   */
  saveStudentStatus() {
    if (!this.ConfigService.isPreview()) {
      // we are in a run
      const studentStatusURL = this.ConfigService.getStudentStatusURL();
      if (studentStatusURL != null) {
        const runId = this.ConfigService.getRunId();
        const periodId = this.ConfigService.getPeriodId();
        const workgroupId = this.ConfigService.getWorkgroupId();

        // get the current node id
        const currentNodeId = this.getCurrentNodeId();

        // get the node statuses
        const nodeStatuses = this.getNodeStatuses();

        // get the project completion percentage
        const projectCompletion = this.getProjectCompletion();

        // create the JSON that will be saved to the database
        const studentStatusJSON = {};
        studentStatusJSON.runId = runId;
        studentStatusJSON.periodId = periodId;
        studentStatusJSON.workgroupId = workgroupId;
        studentStatusJSON.currentNodeId = currentNodeId;
        studentStatusJSON.nodeStatuses = nodeStatuses;
        studentStatusJSON.projectCompletion = projectCompletion;

        // get the student status as a string
        const status = angular.toJson(studentStatusJSON);

        /*
         * create the params for the message that will be sent
         * to the StudentStatusController and saved in the
         * database
         */
        const studentStatusParams = {};
        studentStatusParams.runId = runId;
        studentStatusParams.periodId = periodId;
        studentStatusParams.workgroupId = workgroupId;
        studentStatusParams.status = status;

        // get the url to POST the student data
        const httpParams = {};
        httpParams.method = 'POST';
        httpParams.url = studentStatusURL;
        httpParams.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
        httpParams.data = $.param(studentStatusParams);

        // make the request to post the student status
        return this.$http(httpParams).then(
          result => {
            return true;
          }, result => {
            // a server error occured
            return false;
          }
        );
      }
    }
  };

  retrieveComponentStates(runId, periodId, workgroupId) {

  };

  getLatestComponentState() {
    let latestComponentState = null;
    const studentData = this.studentData;
    if (studentData != null) {
      const componentStates = studentData.componentStates;
      if (componentStates != null) {
        latestComponentState = componentStates[componentStates.length - 1];
      }
    }
    return latestComponentState;
  };

  /**
   * Check whether the component has unsubmitted work
   * @return boolean whether or not there is unsubmitted work
   */
  isComponentSubmitDirty() {
    let submitDirty = false;
    let latestComponentState = this.getLatestComponentState();
    if (latestComponentState && !latestComponentState.isSubmit) {
      submitDirty = true;
    }
    return submitDirty;
  };

  /**
   * Get the latest NodeState for the specified node id
   * @param nodeId the node id
   * @return the latest node state with the matching node id or null if none are found
   */
  getLatestNodeStateByNodeId(nodeId) {
    let latestNodeState = null;
    let allNodeStatesByNodeId = this.getNodeStatesByNodeId(nodeId);
    if (allNodeStatesByNodeId != null && allNodeStatesByNodeId.length > 0) {
      latestNodeState = allNodeStatesByNodeId[allNodeStatesByNodeId.length - 1];
    }
    return latestNodeState;
  };

  /**
   * Get the latest component state for the given node id and component
   * id.
   * @param nodeId the node id
   * @param componentId the component id (optional)
   * @return the latest component state with the matching node id and
   * component id or null if none are found
   */
  getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId) {
    let latestComponentState = null;
    if (nodeId) {
      const studentData = this.studentData;
      if (studentData) {
        // get the component states
        const componentStates = studentData.componentStates;
        if (componentStates) {
          for (let c = componentStates.length - 1; c >= 0; c--) {
            const componentState = componentStates[c];
            if (componentState) {
              const componentStateNodeId = componentState.nodeId;
              if (nodeId === componentStateNodeId) {
                if (componentId) {
                  const componentStateComponentId = componentState.componentId;
                  if (componentId === componentStateComponentId) {
                    latestComponentState = componentState;
                    break;
                  }
                } else {
                  latestComponentState = componentState;
                  break;
                }
              }
            }
          }
        }
      }
    }
    return latestComponentState;
  };

  /**
   * Get the student work by specified student work id, which can be a ComponentState or NodeState
   * @param studentWorkId the student work id
   * @return an StudentWork or null
   */
  getStudentWorkByStudentWorkId(studentWorkId) {
    if (studentWorkId != null) {
      const componentStates = this.studentData.componentStates;
      if (componentStates != null) {
        for (let componentState of componentStates) {
          if (componentState != null && componentState.id === studentWorkId) {
            return componentState;
          }
        }
      }

      const nodeStates = this.studentData.nodeStates;
      if (nodeStates != null) {
        for (let nodeState of nodeStates) {
          if (nodeState != null && nodeState.id === studentWorkId) {
            return nodeState;
          }
        }
      }
    }
    return null;
  };

  /**
   * Returns all the component states for this workgroup
   */
  getComponentStates() {
    return this.studentData.componentStates;
  };

  /**
   * Get the component states for the given node id
   * @param nodeId the node id
   * @return an array of component states for the given node id
   */
  getComponentStatesByNodeId(nodeId) {
    const componentStatesByNodeId = [];
    if (nodeId != null) {
      const studentData = this.studentData;
      if (studentData != null) {
        const componentStates = studentData.componentStates;
        if (componentStates != null) {
          for (let componentState of componentStates) {
            if (componentState != null) {
              const componentStateNodeId = componentState.nodeId;
              if (nodeId == componentStateNodeId) {
                componentStatesByNodeId.push(componentState);
              }
            }
          }
        }
      }
    }
    return componentStatesByNodeId;
  };

  /**
   * Get the component states for the given node id and component id
   * @param nodeId the node id
   * @param componentId the component id
   * @return an array of component states for the given node id and
   * component id
   */
  getComponentStatesByNodeIdAndComponentId(nodeId, componentId) {
    const componentStatesByNodeIdAndComponentId = [];
    if (nodeId != null && componentId != null) {
      const studentData = this.studentData;
      if (studentData != null) {
        const componentStates = studentData.componentStates;
        if (componentStates != null) {
          for (let componentState of componentStates) {
            if (componentState != null) {
              const componentStateNodeId = componentState.nodeId;
              const componentStateComponentId = componentState.componentId;
              if (nodeId == componentStateNodeId &&
                  componentId == componentStateComponentId) {
                componentStatesByNodeIdAndComponentId.push(componentState);
              }
            }
          }
        }
      }
    }

    return componentStatesByNodeIdAndComponentId;
  };

  /**
   * Get all events
   * @returns all events for the student
   */
  getEvents() {
    if (this.studentData != null && this.studentData.events != null) {
      return this.studentData.events;
    } else {
      return [];
    }
  };

  /**
   * Get the events for a node id
   * @param nodeId the node id
   * @returns the events for the node id
   */
  getEventsByNodeId(nodeId) {
    const eventsByNodeId = [];
    if (nodeId != null) {
      if (this.studentData != null && this.studentData.events != null) {
        const events = this.studentData.events;
        for (let event of events) {
          if (event != null) {
            const eventNodeId = event.nodeId;
            if (nodeId === eventNodeId) {
              eventsByNodeId.push(event);
            }
          }
        }
      }
    }
    return eventsByNodeId;
  };

  /**
   * Get the events for a component id
   * @param nodeId the node id
   * @param componentId the component id
   * @returns an array of events for the component id
   */
  getEventsByNodeIdAndComponentId(nodeId, componentId) {
    const eventsByNodeId = [];
    if (nodeId != null) {
      if (this.studentData != null && this.studentData.events != null) {
        const events = this.studentData.events;
        for (let event of events) {
          if (event != null) {
            const eventNodeId = event.nodeId;
            const eventComponentId = event.componentId;
            if (nodeId === eventNodeId && componentId === eventComponentId) {
              eventsByNodeId.push(event);
            }
          }
        }
      }
    }
    return eventsByNodeId;
  };

  /**
   * Get the node id of the latest node entered event for an active node that
   * exists in the project. We need to check if the node exists in the project
   * in case the node has been deleted from the project. We also need to check
   * that the node is active in case the node has been moved to the inactive
   * section of the project.
   * @return the node id of the latest node entered event for an active node
   * that exists in the project
   */
  getLatestNodeEnteredEventNodeIdWithExistingNode() {
    const events = this.studentData.events;
    for (let e = events.length - 1; e >= 0; e--) {
      const event = events[e];
      if (event != null) {
        const eventName = event.event;
        if (eventName == 'nodeEntered') {
          const nodeId = event.nodeId;
          const node = this.ProjectService.getNodeById(nodeId);
          if (node != null) {
            if (this.ProjectService.isActive(nodeId)) {
              return nodeId;
            }
          }
        }
      }
    }
    return null;
  }

  /**
   * Check if the student can visit the node
   * @param nodeId the node id
   * @returns whether the student can visit the node
   */
  canVisitNode(nodeId) {
    let result = false;
    if (nodeId != null) {
      // get the node status for the node
      const nodeStatus = this.getNodeStatusByNodeId(nodeId);
      if (nodeStatus != null) {
        if (nodeStatus.isVisitable) {
          result = true;
        }
      }
    }
    return result;
  };

  /**
   * Get the node status by node id
   * @param nodeId the node id
   * @returns the node status object for a node
   */
  getNodeStatusByNodeId(nodeId) {
    const nodeStatuses = this.nodeStatuses;
    let nodeStatus = null;
    if (nodeId != null) {
      nodeStatus = nodeStatuses[nodeId];
    }
    return nodeStatus;
  };

  /**
   * Get progress information for a given node
   * @param nodeId the node id
   * @returns object with number of completed items (both all and for items
   * that capture student work), number of visible items (all/with work),
   * completion % (for all items, items with student work)
   */
  getNodeProgressById(nodeId) {
    let completedItems = 0;
    let completedItemsWithWork = 0;
    let totalItems = 0;
    let totalItemsWithWork = 0;
    let progress = {};

    if (this.ProjectService.isGroupNode(nodeId)) {
      let nodeIds = this.ProjectService.getChildNodeIdsById(nodeId);
      for (let id of nodeIds) {
        let status = this.nodeStatuses[id];
        if (this.ProjectService.isGroupNode(id)) {
          if (status.progress.totalItemsWithWork > -1) {
            completedItems += status.progress.completedItems;
            totalItems += status.progress.totalItems;
            completedItemsWithWork += status.progress.completedItemsWithWork;
            totalItemsWithWork += status.progress.totalItemsWithWork;
          } else {
            // we have a legacy node status so we'll need to calculate manually
            let groupProgress = this.getNodeProgressById(id);
            completedItems += groupProgress.completedItems;
            totalItems += groupProgress.totalItems;
            completedItemsWithWork += groupProgress.completedItemsWithWork;
            totalItemsWithWork += groupProgress.totalItemsWithWork;
          }
        } else {
          if (status.isVisible) {
            totalItems++;

            let hasWork = this.ProjectService.nodeHasWork(id);
            if (hasWork) {
              totalItemsWithWork++;
            }

            if (status.isCompleted) {
              completedItems++;

              if (hasWork) {
                completedItemsWithWork++;
              }
            }
          }
        }
      }

      let completionPct = totalItems ? Math.round(completedItems / totalItems * 100) : 0;
      let completionPctWithWork = totalItemsWithWork ? Math.round(completedItemsWithWork / totalItemsWithWork * 100) : 0;

      progress = {
        "completedItems": completedItems,
        "completedItemsWithWork": completedItemsWithWork,
        "totalItems": totalItems,
        "totalItemsWithWork": totalItemsWithWork,
        "completionPct": completionPct,
        "completionPctWithWork": completionPctWithWork
      };
    }

    // TODO: implement for steps (using components instead of child nodes)?

    return progress;
  };

  /**
   * Check if the given node or component is completed
   * @param nodeId the node id
   * @param componentId (optional) the component id
   * @returns whether the node or component is completed
   */
  isCompleted(nodeId, componentId) {
    let result = false;
    if (nodeId && componentId) {
      // check that the component is completed

      // get the component states for the component
      const componentStates = this.getComponentStatesByNodeIdAndComponentId(nodeId, componentId);

      // get the component events
      const componentEvents = this.getEventsByNodeIdAndComponentId(nodeId, componentId);

      // get the node events
      const nodeEvents = this.getEventsByNodeId(nodeId);

      // get the component object
      const component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);

      const node = this.ProjectService.getNodeById(nodeId);
      if (component != null) {
        // get the component type
        const componentType = component.type;

        if (componentType != null) {
          // get the service for the component type
          const service = this.$injector.get(componentType + 'Service');

          // check if the component is completed
          if (service.isCompleted(component, componentStates, componentEvents, nodeEvents, node)) {
            result = true;
          }
        }
      }
    } else if (nodeId) {
      // check if node is a group
      const isGroup = this.ProjectService.isGroupNode(nodeId);

      const node = this.ProjectService.getNodeById(nodeId);

      if (isGroup) {
        // node is a group
        let tempResult = true;

        // check that all the nodes in the group are visible and completed
        const nodeIds = this.ProjectService.getChildNodeIdsById(nodeId);

        if (nodeIds.length) {
          for (let id of nodeIds) {
            if (this.nodeStatuses[id] == null || !this.nodeStatuses[id].isVisible || !this.nodeStatuses[id].isCompleted) {
              // the child is not visible or not completed so the group is not completed
              tempResult = false;
              break;
            }
          }
        } else {
          // there are no nodes in the group (could be a planning activity, for example), so set isCompleted to false
          tempResult = false;
        }
        result = tempResult;
      } else {
        // check that all the components in the node are completed

        // get all the components in the node
        const components = this.ProjectService.getComponentsByNodeId(nodeId);

        // we will default to is completed true
        let tempResult = true;

        /*
         * All components must be completed in order for the node to be completed
         * so we will loop through all the components and check if they are
         * completed
         */
        for (let component of components) {
          if (component != null) {
            const componentId = component.id;
            const componentType = component.type;
            const showPreviousWorkNodeId = component.showPreviousWorkNodeId;
            const showPreviousWorkComponentId = component.showPreviousWorkComponentId;

            let tempNodeId = nodeId;
            let tempNode = node;
            let tempComponentId = componentId;
            let tempComponent = component;

            if (showPreviousWorkNodeId != null && showPreviousWorkComponentId != null) {
              /*
               * this is a show previous work component so we will check if the
               * previous component was completed
               */
              tempNodeId = showPreviousWorkNodeId;
              tempComponentId = showPreviousWorkComponentId;
              tempNode = this.ProjectService.getNodeById(tempNodeId);
              tempComponent = this.ProjectService.getComponentByNodeIdAndComponentId(tempNodeId, tempComponentId);
            }

            if (componentType != null) {
              try {
                // get the service name
                const serviceName = componentType + 'Service';

                if (this.$injector.has(serviceName)) {
                  // get the service for the component type
                  const service = this.$injector.get(serviceName);

                  // get the component states for the component
                  const componentStates = this.getComponentStatesByNodeIdAndComponentId(tempNodeId, tempComponentId);

                  // get the component events
                  const componentEvents = this.getEventsByNodeIdAndComponentId(tempNodeId, tempComponentId);

                  // get the node events
                  const nodeEvents = this.getEventsByNodeId(tempNodeId);

                  // check if the component is completed
                  const isComponentCompleted = service.isCompleted(tempComponent, componentStates, componentEvents, nodeEvents, tempNode);

                  tempResult = tempResult && isComponentCompleted;
                }
              } catch (e) {
                console.log(this.$translate('ERROR_COULD_NOT_CALCULATE_IS_COMPLETED') + tempComponentId);
              }
            }
          }
        }
        result = tempResult;
      }
    }
    return result;
  };

  /**
   * Get the current node
   * @returns the current node object
   */
  getCurrentNode() {
    return this.currentNode;
  };

  /**
   * Get the current node id
   * @returns the current node id
   */
  getCurrentNodeId() {
    let currentNodeId = null;
    if (this.currentNode != null) {
      currentNodeId = this.currentNode.id;
    }
    return currentNodeId;
  };

  /**
   * Set the current node
   * @param nodeId the node id
   */
  setCurrentNodeByNodeId(nodeId) {
    if (nodeId != null) {
      const node = this.ProjectService.getNodeById(nodeId);
      this.setCurrentNode(node);
    }
  };

  /**
   * Set the current node
   * @param node the node object
   */
  setCurrentNode(node) {
    const previousCurrentNode = this.currentNode;
    if (previousCurrentNode !== node) {
      // the current node is about to change

      if (previousCurrentNode && !this.ProjectService.isGroupNode(previousCurrentNode.id)) {
        // set the previous node to the current node
        this.previousStep = previousCurrentNode;
      }

      // set the current node to the new node
      this.currentNode = node;

      // broadcast the event that the current node has changed
      this.$rootScope.$broadcast('currentNodeChanged', {previousNode: previousCurrentNode, currentNode: this.currentNode});
    }
  };

  /**
   * End the current node
   */
  endCurrentNode() {
    // get the current node
    const previousCurrentNode = this.currentNode;
    if (previousCurrentNode != null) {
      // tell the node to exit
      this.$rootScope.$broadcast('exitNode', {nodeToExit: previousCurrentNode});
    }
  };

  /**
   * End the current node and set the current node
   * @param nodeId the node id of the new current node
   */
  endCurrentNodeAndSetCurrentNodeByNodeId(nodeId) {
    // check if the node is visitable
    if (this.nodeStatuses[nodeId].isVisitable) {
      // the node is visitable
      // end the current node
      this.endCurrentNode();

      // set the current node
      this.setCurrentNodeByNodeId(nodeId);
    } else {
      // the node is not visitable
      this.nodeClickLocked(nodeId);
    }
  };

  /**
   * Broadcast a listenable event that a locked node has been clicked (attempted to be opened)
   * @param nodeId
   */
  nodeClickLocked(nodeId) {
    this.$rootScope.$broadcast('nodeClickLocked', {nodeId: nodeId});
  };

  /**
   * This will parse a delimited string into an array of
   * arrays. The default delimiter is the comma, but this
   * can be overriden in the second argument.
   * Source: http://www.bennadel.com/blog/1504-ask-ben-parsing-csv-strings-with-javascript-exec-regular-expression-command.htm
   */
  CSVToArray( strData, strDelimiter ) {
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");

    // Create a regular expression to parse the CSV values.
    const objPattern = new RegExp(
      (
        // Delimiters.
        "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

        // Quoted fields.
        "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

        // Standard fields.
        "([^\"\\" + strDelimiter + "\\r\\n]*))"
      ),
      "gi"
    );

    // Create an array to hold our data. Give the array
    // a default empty first row.
    const arrData = [[]];

    // Create an array to hold our individual pattern
    // matching groups.
    let arrMatches = null;


    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec( strData )) {

      // Get the delimiter that was found.
      const strMatchedDelimiter = arrMatches[ 1 ];

      // Check to see if the given delimiter has a length
      // (is not the start of string) and if it matches
      // field delimiter. If id does not, then we know
      // that this delimiter is a row delimiter.
      if (
        strMatchedDelimiter.length &&
        (strMatchedDelimiter != strDelimiter)
      ){

        // Since we have reached a new row of data,
        // add an empty row to our data array.
        arrData.push( [] );
      }

      // Now that we have our delimiter out of the way,
      // let's check to see which kind of value we
      // captured (quoted or unquoted).
      if (arrMatches[ 2 ]){

        // We found a quoted value. When we capture
        // this value, unescape any double quotes.
        const strMatchedValue = arrMatches[ 2 ].replace(
          new RegExp( "\"\"", "g" ),
          "\""
        );

      } else {
        // We found a non-quoted value.
        const strMatchedValue = arrMatches[ 3 ];
      }

      // Now that we have our value string, let's add
      // it to the data array.
      let finalValue = strMatchedValue;
      const floatVal = parseFloat(strMatchedValue);
      if (!isNaN(floatVal)) {
        finalValue = floatVal;
      }
      arrData[ arrData.length - 1 ].push( finalValue );
    }
    // Return the parsed data.
    return( arrData );
  };

  /**
   * Get the total score for the workgroup
   * @returns the total score for the workgroup
   */
  getTotalScore() {
    const annotations = this.studentData.annotations;
    const workgroupId = this.ConfigService.getWorkgroupId();
    return this.AnnotationService.getTotalScore(annotations, workgroupId);
  }

  /**
   * Get the project completion for the signed in student
   * @returns the project completion percentage for the signed in student
   */
  getProjectCompletion() {
    // group0 is always the root node of the whole project
    const nodeId = 'group0';

    // get the progress including all of the children nodes
    const progress = this.getNodeProgressById(nodeId);

    return progress;
  }

  /**
   * Get the run status
   */
  getRunStatus() {
    return this.runStatus;
  }

  /**
   * Get the next available planning node instance node id
   * @returns the next available planning node instance node id
   */
  getNextAvailablePlanningNodeId() {
    // used to keep track of the highest planning node number we have found, which is 1-based
    let currentMaxPlanningNodeNumber = 1;

    let nodeStates = this.getNodeStates();
    if (nodeStates != null) {
      for (let nodeState of nodeStates) {
        if (nodeState != null) {
          let nodeStateNodeId = nodeState.nodeId;
          if (this.ProjectService.isPlanning(nodeStateNodeId) && nodeState.studentData != null) {
            let nodes = nodeState.studentData.nodes;
            for (let node of nodes) {
              let nodeId = node.id;
              // regex to match the planning node id e.g. planningNode2
              let planningNodeIdRegEx = /planningNode(.*)/;

              // run the regex on the node id
              let result = nodeId.match(planningNodeIdRegEx);

              if (result != null) {
                // we have found a planning node instance node id

                /*
                 * get the number part of the planning node instance node id
                 * e.g. if the nodeId is planningNode2, the number part
                 * would be 2
                 */
                let planningNodeNumber = parseInt(result[1]);

                if (planningNodeNumber > currentMaxPlanningNodeNumber) {
                  /*
                   * update the max number part if we have found a new
                   * higher number
                   */
                  currentMaxPlanningNodeNumber = planningNodeNumber;
                }
              }
            }
          }
        }
      }
    }

    if (this.maxPlanningNodeNumber < currentMaxPlanningNodeNumber) {
      // Update maxPlanningNodeNumber if we find a bigger number in the NodeStates
      this.maxPlanningNodeNumber = currentMaxPlanningNodeNumber;
    }

    // Increment maxPlanningNodeNumber each time this function is called.
    this.maxPlanningNodeNumber++;

    // return the next available planning node instance node id
    return 'planningNode' + this.maxPlanningNodeNumber;
  }

  /**
   * Get the annotations
   * @returns the annotations
   */
  getAnnotations() {
    let annotations = null;
    if (this.studentData != null && this.studentData.annotations != null) {
      annotations = this.studentData.annotations;
    }
    return annotations;
  }

  /**
   * Get the latest component states for a node
   * @param nodeId get the component states for the node
   * @return an array containing the work for the node
   */
  getLatestComponentStatesByNodeId(nodeId) {
    const latestComponentStates = [];
    if (nodeId) {
      const studentData = this.studentData;
      if (studentData) {
        const node = this.ProjectService.getNodeById(nodeId);
        if (node != null) {
          const components = node.components;
          if (components != null) {
            for (let component of components) {
              if (component != null) {
                const componentId = component.id;
                let componentState =
                    this.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);
                if (componentState == null) {
                  /*
                   * there is no component state for the component so we will
                   * create an object that just contains the node id and
                   * component id
                   */
                  componentState = {};
                  componentState.nodeId = nodeId;
                  componentState.componentId = componentId;
                }
                latestComponentStates.push(componentState);
              }
            }
          }
        }
      }
    }
    return latestComponentStates;
  }

  /**
   * Get the latest component state for a node
   * @param nodeId get the latest component state for the node
   * @return the latest component state for the node
   */
  getLatestComponentStateByNodeId(nodeId) {
    let latestComponentState = null;
    if (nodeId != null) {
      const studentData = this.studentData;
      if (studentData) {
        // get the component states for the node
        const componentStates = this.getComponentStatesByNodeId(nodeId);

        // get the latest component state
        latestComponentState = componentStates[componentStates.length - 1];
      }
    }
    return latestComponentState;
  }

  /**
   * Check if the completion criteria is satisfied
   * @param completionCriteria the completion criteria
   * @return whether the completion criteria was satisfied
   */
  isCompletionCriteriaSatisfied(completionCriteria) {
    let result = true;
    if (completionCriteria != null) {
      if (completionCriteria.inOrder) {
        // the criteria need to be satisfied in order

        let tempTimestamp = 0;
        const criteria = completionCriteria.criteria;
        for (let completionCriterion of criteria) {
          let tempResult = true;
          if (completionCriterion != null) {
            // get the function name e.g. 'isVisited', 'isSaved', 'isSubmitted'
            const functionName = completionCriterion.name;

            if (functionName == 'isSubmitted') {
              const nodeId = completionCriterion.nodeId;
              const componentId = completionCriterion.componentId;

              // get the first submit component state after the timestamp
              const tempComponentState = this.getComponentStateSubmittedAfter(nodeId, componentId, tempTimestamp);

              if (tempComponentState == null) {
                // we did not find a component state
                result = false;
                break;
              } else {
                // we found a component state so we will update timestamp
                tempTimestamp = tempComponentState.serverSaveTime;
              }
            } else if (functionName == 'isSaved') {
              const nodeId = completionCriterion.nodeId;
              const componentId = completionCriterion.componentId;

              // get the first save component state after the timestamp
              const tempComponentState = this.getComponentStateSavedAfter(nodeId, componentId, tempTimestamp);

              if (tempComponentState == null) {
                // we did not find a component state
                result = false;
                break;
              } else {
                // we found a component state so we will update timestamp
                tempTimestamp = tempComponentState.serverSaveTime;
              }
            } else if (functionName == 'isVisited') {
              const nodeId = completionCriterion.nodeId;

              // get the first visit event after the timestamp
              const tempEvent = this.getVisitEventAfter(nodeId, tempTimestamp);

              if (tempEvent == null) {
                // we did not find a component state
                result = false;
                break;
              } else {
                // we found a component state so we will update timestamp
                tempTimestamp = tempEvent.serverSaveTime;
              }
            }
          }
        }
      }
    }
    return result;
  }

  /**
   * Get the first save component state after the given timestamp
   * @param nodeId the node id of the component state
   * @param componentId the component id of the component state
   * @param timestamp look for a save component state after this timestamp
   */
  getComponentStateSavedAfter(nodeId, componentId, timestamp) {
    let componentState = null;
    const componentStates = this.studentData.componentStates;
    if (componentStates != null) {
      for (let tempComponentState of componentStates) {
        if (tempComponentState != null &&
            tempComponentState.serverSaveTime > timestamp &&
            tempComponentState.nodeId === nodeId &&
            tempComponentState.componentId === componentId) {
          // we have found a save component state after the timestamp
          componentState = tempComponentState;
          break;
        }
      }
    }
    return componentState;
  }

  /**
   * Get the first submit component state after the given timestamp
   * @param nodeId the node id of the component state
   * @param componentId the component id of the component state
   * @param timestamp look for a submit component state after this timestamp
   */
  getComponentStateSubmittedAfter(nodeId, componentId, timestamp) {
    let componentState = null;
    const componentStates = this.studentData.componentStates;
    if (componentStates != null) {
      for (let tempComponentState of componentStates) {
        if (tempComponentState != null &&
            tempComponentState.serverSaveTime > timestamp &&
            tempComponentState.nodeId === nodeId &&
            tempComponentState.componentId === componentId &&
            tempComponentState.isSubmit) {
          // we have found a submit component state after the timestamp
          componentState = tempComponentState;
          break;
        }
      }
    }
    return componentState;
  }

  /**
   * Get the first visit event after the timestamp
   */
  getVisitEventAfter(nodeId, timestamp) {
    let event = null;
    const events = this.studentData.events;
    if (events != null) {
      for (let tempEvent of events) {
        if (tempEvent != null &&
            tempEvent.serverSaveTime > timestamp &&
            tempEvent.nodeId === nodeId &&
            tempEvent.event === 'nodeEntered') {
          // we have found a visit event after the timestamp
          event = tempEvent;
          break;
        }
      }
    }
    return event;
  }

  /**
   * Get classmate student work
   * @param nodeId the node id
   * @param componentId the component id
   * @param showClassmateWorkSource Where to get the work from.
   * 'period' will get the classmate work only from the period the student is in.
   * null will get work from the whole class (all periods).
   *
   * @return a promise that will return the component states from classmates
   */
  getClassmateStudentWork(nodeId, componentId, showClassmateWorkSource) {
    // get the url to get the student data
    const studentDataURL = this.ConfigService.getConfigParam('studentDataURL');

    const httpParams = {};
    httpParams.method = 'GET';
    httpParams.url = studentDataURL;

    // set the workgroup id and run id
    const params = {};
    params.runId = this.ConfigService.getRunId();
    params.nodeId = nodeId;
    params.componentId = componentId;
    params.getStudentWork = true;
    params.getEvents = false;
    params.getAnnotations = false;
    params.onlyGetLatest = true;

    if (showClassmateWorkSource == 'period') {
      // get the period the student is in
      params.periodId = this.ConfigService.getPeriodId();
    }

    httpParams.params = params;

    // make the request for the student data
    return this.$http(httpParams).then((result) => {
      let componentStates = [];
      const resultData = result.data;

      if (resultData != null) {
        componentStates = resultData.studentWorkList;
      }
      return componentStates;
    });
  }

  /**
   * Get the max possible score for the project
   * @returns the sum of the max scores for all the nodes in the project visible
   * to the current workgroup or null if none of the visible components has max scores.
   */
  getMaxScore() {
    let maxScore = null;
    for (let p in this.nodeStatuses) {
      if (this.nodeStatuses.hasOwnProperty(p)) {
        let nodeStatus = this.nodeStatuses[p];
        let nodeId = nodeStatus.nodeId;

        if (nodeStatus.isVisible && !this.ProjectService.isGroupNode(nodeId)) {
          // node is visible and is not a group
          // get node max score
          let nodeMaxScore = this.ProjectService.getMaxScoreForNode(nodeId);

          if (nodeMaxScore) {
            // there is a max score for the node, so add to total
            maxScore += nodeMaxScore;
          }
        }
      }
    }
    return maxScore;
  }
}

StudentDataService.$inject = [
  '$filter',
  '$http',
  '$injector',
  '$q',
  '$rootScope',
  'AnnotationService',
  'ConfigService',
  'ProjectService',
  'UtilService'
];

export default StudentDataService;
