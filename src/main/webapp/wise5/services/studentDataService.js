'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StudentDataService = function () {
  function StudentDataService($filter, $http, $injector, $q, $rootScope, AnnotationService, ConfigService, PlanningService, ProjectService, UtilService) {
    var _this = this;

    _classCallCheck(this, StudentDataService);

    this.$filter = $filter;
    this.$http = $http;
    this.$injector = $injector;
    this.$q = $q;
    this.$rootScope = $rootScope;
    this.AnnotationService = AnnotationService;
    this.ConfigService = ConfigService;
    this.PlanningService = PlanningService;
    this.ProjectService = ProjectService;
    this.UtilService = UtilService;
    this.$translate = this.$filter('translate');
    this.currentNode = null;
    this.previousStep = null;
    this.studentData = null;
    this.stackHistory = []; // array of node id's
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
    this.$rootScope.$on('nodeStatusesChanged', function (event, args) {
      // calculate active global annotations and group them by group name as needed
      _this.AnnotationService.calculateActiveGlobalAnnotationGroups();

      // go through the global annotations and see if they can be un-globalized by checking if their criterias have been met.
      var globalAnnotationGroups = _this.AnnotationService.getActiveGlobalAnnotationGroups();
      globalAnnotationGroups.map(function (globalAnnotationGroup) {
        var globalAnnotations = globalAnnotationGroup.annotations;
        globalAnnotations.map(function (globalAnnotation) {
          if (globalAnnotation.data != null && globalAnnotation.data.isGlobal) {
            var unGlobalizeConditional = globalAnnotation.data.unGlobalizeConditional;
            var unGlobalizeCriteriaArray = globalAnnotation.data.unGlobalizeCriteria;
            if (unGlobalizeCriteriaArray != null) {
              if (unGlobalizeConditional === "any") {
                // at least one criteria in unGlobalizeCriteriaArray must be satisfied in any order before un-globalizing this annotation
                var anySatified = false;
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                  for (var _iterator = unGlobalizeCriteriaArray[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var unGlobalizeCriteria = _step.value;

                    var unGlobalizeCriteriaResult = _this.evaluateCriteria(unGlobalizeCriteria);
                    anySatified = anySatified || unGlobalizeCriteriaResult;
                  }
                } catch (err) {
                  _didIteratorError = true;
                  _iteratorError = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                      _iterator.return();
                    }
                  } finally {
                    if (_didIteratorError) {
                      throw _iteratorError;
                    }
                  }
                }

                if (anySatified) {
                  globalAnnotation.data.unGlobalizedTimestamp = Date.parse(new Date()); // save when criteria was satisfied
                  _this.saveAnnotations([globalAnnotation]); // save changes to server
                }
              } else if (unGlobalizeConditional === "all") {
                // all criteria in unGlobalizeCriteriaArray must be satisfied in any order before un-globalizing this annotation
                var allSatisfied = true;
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                  for (var _iterator2 = unGlobalizeCriteriaArray[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var _unGlobalizeCriteria = _step2.value;

                    var _unGlobalizeCriteriaResult = _this.evaluateCriteria(_unGlobalizeCriteria);
                    allSatisfied = allSatisfied && _unGlobalizeCriteriaResult;
                  }
                } catch (err) {
                  _didIteratorError2 = true;
                  _iteratorError2 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                      _iterator2.return();
                    }
                  } finally {
                    if (_didIteratorError2) {
                      throw _iteratorError2;
                    }
                  }
                }

                if (allSatisfied) {
                  globalAnnotation.data.unGlobalizedTimestamp = Date.parse(new Date()); // save when criteria was satisfied
                  _this.saveAnnotations([globalAnnotation]); // save changes to server
                }
              }
            }
          }
        });
      });
    });

    /**
     * Listen for the 'newAnnotationReceived' event which is fired when
     * student receives a new annotation from the server
     */
    this.$rootScope.$on('newAnnotationReceived', function (event, args) {
      if (args) {
        // get the annotation that was saved to the server
        var annotation = args.annotation;
        _this.handleAnnotationReceived(annotation);
      }
    });
  }

  _createClass(StudentDataService, [{
    key: 'retrieveStudentData',
    value: function retrieveStudentData() {
      var _this2 = this;

      if (this.ConfigService.isPreview()) {
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
        var studentDataURL = this.ConfigService.getConfigParam('studentDataURL');

        var httpParams = {};
        httpParams.method = 'GET';
        httpParams.url = studentDataURL;

        var params = {};
        params.workgroupId = this.ConfigService.getWorkgroupId();
        params.runId = this.ConfigService.getRunId();
        params.getStudentWork = true;
        params.getEvents = true;
        params.getAnnotations = true;
        params.toWorkgroupId = this.ConfigService.getWorkgroupId();
        httpParams.params = params;

        // make the request for the student data
        return this.$http(httpParams).then(function (result) {
          var resultData = result.data;
          if (resultData != null) {
            _this2.studentData = {};

            // get student work
            _this2.studentData.componentStates = [];
            _this2.studentData.nodeStates = [];
            var studentWorkList = resultData.studentWorkList;
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
              for (var _iterator3 = studentWorkList[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var studentWork = _step3.value;

                if (studentWork.componentId != null) {
                  _this2.studentData.componentStates.push(studentWork);
                } else {
                  _this2.studentData.nodeStates.push(studentWork);
                }
              }

              // Check to see if this Project contains any Planning activities
            } catch (err) {
              _didIteratorError3 = true;
              _iteratorError3 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                  _iterator3.return();
                }
              } finally {
                if (_didIteratorError3) {
                  throw _iteratorError3;
                }
              }
            }

            if (_this2.ProjectService.project.nodes != null && _this2.ProjectService.project.nodes.length > 0) {
              // Overload/add new nodes based on student's work in the NodeState for the planning group.
              var _iteratorNormalCompletion4 = true;
              var _didIteratorError4 = false;
              var _iteratorError4 = undefined;

              try {
                for (var _iterator4 = _this2.ProjectService.project.nodes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                  var planningGroupNode = _step4.value;

                  if (planningGroupNode.planning) {
                    var lastestNodeStateForPlanningGroupNode = _this2.getLatestNodeStateByNodeId(planningGroupNode.id);
                    if (lastestNodeStateForPlanningGroupNode != null) {
                      var studentModifiedNodes = lastestNodeStateForPlanningGroupNode.studentData.nodes;
                      if (studentModifiedNodes != null) {
                        var _iteratorNormalCompletion5 = true;
                        var _didIteratorError5 = false;
                        var _iteratorError5 = undefined;

                        try {
                          for (var _iterator5 = studentModifiedNodes[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                            var studentModifiedNode = _step5.value;

                            var studentModifiedNodeId = studentModifiedNode.id;
                            if (studentModifiedNode.planning) {
                              // If this is a Planning Node that exists in the project, replace the one in the original project with this one.
                              for (var n = 0; n < _this2.ProjectService.project.nodes.length; n++) {
                                if (_this2.ProjectService.project.nodes[n].id === studentModifiedNodeId) {
                                  // Only overload the ids. This will allow authors to add more planningNodes during the run if needed.
                                  _this2.ProjectService.project.nodes[n].ids = studentModifiedNode.ids;
                                }
                              }
                            } else {
                              // Otherwise, this is an instance of a PlanningNode template, so just append it to the end of the Project.nodes
                              _this2.ProjectService.project.nodes.push(studentModifiedNode);
                            }
                          }
                        } catch (err) {
                          _didIteratorError5 = true;
                          _iteratorError5 = err;
                        } finally {
                          try {
                            if (!_iteratorNormalCompletion5 && _iterator5.return) {
                              _iterator5.return();
                            }
                          } finally {
                            if (_didIteratorError5) {
                              throw _iteratorError5;
                            }
                          }
                        }
                      }
                    }
                  }
                }
                // Re-parse the project with the modified changes
              } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion4 && _iterator4.return) {
                    _iterator4.return();
                  }
                } finally {
                  if (_didIteratorError4) {
                    throw _iteratorError4;
                  }
                }
              }

              _this2.ProjectService.parseProject();
            }

            _this2.studentData.events = resultData.events;
            _this2.studentData.annotations = resultData.annotations;
            _this2.AnnotationService.setAnnotations(_this2.studentData.annotations);
            _this2.populateHistories(_this2.studentData.events);
            _this2.updateNodeStatuses();
          }

          return _this2.studentData;
        });
      }
    }
  }, {
    key: 'retrieveRunStatus',


    /**
     * Retrieve the run status
     */
    value: function retrieveRunStatus() {
      var _this3 = this;

      if (this.ConfigService.isPreview()) {
        this.runStatus = {};
      } else {
        var runStatusURL = this.ConfigService.getConfigParam('runStatusURL');
        var runId = this.ConfigService.getConfigParam('runId');

        var params = {
          runId: runId
        };

        var httpParams = {};
        httpParams.method = 'GET';
        httpParams.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        httpParams.url = runStatusURL;
        httpParams.params = params;

        return this.$http(httpParams).then(function (result) {
          if (result != null) {
            var data = result.data;
            if (data != null) {
              _this3.runStatus = data;
            }
          }
        });
      }
    }
  }, {
    key: 'getNodeStatuses',
    value: function getNodeStatuses() {
      return this.nodeStatuses;
    }
  }, {
    key: 'setNodeStatusByNodeId',
    value: function setNodeStatusByNodeId(nodeId, nodeStatus) {
      if (nodeId != null && nodeStatus != null) {
        var nodeStatuses = this.nodeStatuses;
        if (nodeStatuses != null) {
          nodeStatuses[nodeId] = nodeStatus;
        }
      }
    }
  }, {
    key: 'getNodeStatusByNodeId',
    value: function getNodeStatusByNodeId(nodeId) {
      var nodeStatuses = this.nodeStatuses;
      if (nodeId != null && nodeStatuses != null) {
        return nodeStatuses[nodeId];
      }
      return null;
    }
  }, {
    key: 'updateNodeStatuses',
    value: function updateNodeStatuses() {
      var nodes = this.ProjectService.getNodes();
      var planningNodes = this.PlanningService.getPlanningNodes();
      var groups = this.ProjectService.getGroups();

      if (nodes != null) {
        if (planningNodes != null) {
          nodes = nodes.concat(planningNodes);
        }
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = nodes[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var node = _step6.value;

            if (!this.ProjectService.isGroupNode(node.id)) {
              this.updateNodeStatusByNode(node);
            }
          }
        } catch (err) {
          _didIteratorError6 = true;
          _iteratorError6 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion6 && _iterator6.return) {
              _iterator6.return();
            }
          } finally {
            if (_didIteratorError6) {
              throw _iteratorError6;
            }
          }
        }
      }

      var group = void 0;
      if (groups != null) {
        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
          for (var _iterator7 = groups[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var _group = _step7.value;

            _group.depth = this.ProjectService.getNodeDepth(_group.id);
          }

          // sort by descending depth order (need to calculate completion for lowest level groups first)
        } catch (err) {
          _didIteratorError7 = true;
          _iteratorError7 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion7 && _iterator7.return) {
              _iterator7.return();
            }
          } finally {
            if (_didIteratorError7) {
              throw _iteratorError7;
            }
          }
        }

        groups.sort(function (a, b) {
          return b.depth - a.depth;
        });

        var _iteratorNormalCompletion8 = true;
        var _didIteratorError8 = false;
        var _iteratorError8 = undefined;

        try {
          for (var _iterator8 = groups[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
            var _group2 = _step8.value;

            this.updateNodeStatusByNode(_group2);
          }
        } catch (err) {
          _didIteratorError8 = true;
          _iteratorError8 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion8 && _iterator8.return) {
              _iterator8.return();
            }
          } finally {
            if (_didIteratorError8) {
              throw _iteratorError8;
            }
          }
        }
      }

      // update max score
      this.maxScore = this.getMaxScore();
      this.$rootScope.$broadcast('nodeStatusesChanged');
    }
  }, {
    key: 'updateNodeStatusByNode',


    /**
     * Update the node status for a node
     * @param node the node to update
     */
    value: function updateNodeStatusByNode(node) {
      if (node != null) {
        var nodeId = node.id;
        var tempNodeStatus = {};
        tempNodeStatus.nodeId = nodeId;
        tempNodeStatus.isVisitable = true;
        tempNodeStatus.isCompleted = true;

        // get the constraints that affect this node
        var constraintsForNode = this.ProjectService.getConstraintsForNode(node);

        if (this.ConfigService.getConfigParam('constraints') == false) {
          /*
           * constraints have been disabled, most likely because we are
           * in preview without constraints mode
           */
          constraintsForNode = null;
        }

        if (constraintsForNode == null || constraintsForNode.length == 0) {
          if (this.ProjectService.getFlattenedProjectAsNodeIds().indexOf(nodeId) == -1 && !this.ProjectService.isGroupNode(nodeId)) {
            // there are no transitions to this node so it is not visible
            tempNodeStatus.isVisible = false;
            tempNodeStatus.isVisitable = true;
          } else {
            // this node does not have any constraints so it is clickable
            tempNodeStatus.isVisible = true;
            tempNodeStatus.isVisitable = true;
          }
        } else {
          var isVisibleResults = [];
          var isVisitableResults = [];

          var result = false;
          var firstResult = true;

          var _iteratorNormalCompletion9 = true;
          var _didIteratorError9 = false;
          var _iteratorError9 = undefined;

          try {
            for (var _iterator9 = constraintsForNode[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
              var constraintForNode = _step9.value;

              if (constraintForNode != null) {
                // evaluate the constraint to see if the node can be visited
                var tempResult = this.evaluateConstraint(node, constraintForNode);

                var action = constraintForNode.action;

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
          } catch (err) {
            _didIteratorError9 = true;
            _iteratorError9 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion9 && _iterator9.return) {
                _iterator9.return();
              }
            } finally {
              if (_didIteratorError9) {
                throw _iteratorError9;
              }
            }
          }

          var isVisible = true;
          var isVisitable = true;

          var _iteratorNormalCompletion10 = true;
          var _didIteratorError10 = false;
          var _iteratorError10 = undefined;

          try {
            for (var _iterator10 = isVisibleResults[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
              var isVisibleResult = _step10.value;

              isVisible = isVisible && isVisibleResult;
            }
          } catch (err) {
            _didIteratorError10 = true;
            _iteratorError10 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion10 && _iterator10.return) {
                _iterator10.return();
              }
            } finally {
              if (_didIteratorError10) {
                throw _iteratorError10;
              }
            }
          }

          var _iteratorNormalCompletion11 = true;
          var _didIteratorError11 = false;
          var _iteratorError11 = undefined;

          try {
            for (var _iterator11 = isVisitableResults[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
              var isVisitableResult = _step11.value;

              isVisitable = isVisitable && isVisitableResult;
            }
          } catch (err) {
            _didIteratorError11 = true;
            _iteratorError11 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion11 && _iterator11.return) {
                _iterator11.return();
              }
            } finally {
              if (_didIteratorError11) {
                throw _iteratorError11;
              }
            }
          }

          tempNodeStatus.isVisible = isVisible;
          tempNodeStatus.isVisitable = isVisitable;
        }

        tempNodeStatus.isCompleted = this.isCompleted(nodeId);
        tempNodeStatus.isVisited = this.isNodeVisited(nodeId);

        var nodeStatus = this.getNodeStatusByNodeId(nodeId);

        if (nodeStatus == null) {
          this.setNodeStatusByNodeId(nodeId, tempNodeStatus);
        } else {
          /*
           * get the previous isCompleted value so that we can later check
           * if it has changed
           */
          var previousIsCompletedValue = this.nodeStatuses[nodeId].isCompleted;

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
        var latestComponentStatesForNode = this.getLatestComponentStateByNodeId(nodeId);
        if (latestComponentStatesForNode != null) {
          // set the latest component state timestamp into the node status
          this.nodeStatuses[nodeId].latestComponentStateClientSaveTime = latestComponentStatesForNode.clientSaveTime;
          this.nodeStatuses[nodeId].latestComponentStateServerSaveTime = latestComponentStatesForNode.serverSaveTime;
        }
      }
    }
  }, {
    key: 'evaluateConstraint',


    /**
     * Evaluate the constraint
     * @param node the node
     * @param constraintForNode the constraint object
     * @returns whether the node has satisfied the constraint
     */
    value: function evaluateConstraint(node, constraintForNode) {
      if (constraintForNode != null) {
        var removalCriteria = constraintForNode.removalCriteria;
        if (removalCriteria != null) {
          return this.evaluateNodeConstraint(node, constraintForNode);
        }
      }
      return false;
    }
  }, {
    key: 'evaluateNodeConstraint',


    /**
     * Evaluate the node constraint
     * @param node the node
     * @param constraintForNode the constraint object
     * @returns whether the node satisifies the constraint
     */
    value: function evaluateNodeConstraint(node, constraintForNode) {
      var result = false;

      if (constraintForNode != null) {
        var removalCriteria = constraintForNode.removalCriteria;
        var removalConditional = constraintForNode.removalConditional;
        if (removalCriteria == null) {
          result = true;
        } else {
          var firstResult = true;
          var _iteratorNormalCompletion12 = true;
          var _didIteratorError12 = false;
          var _iteratorError12 = undefined;

          try {
            for (var _iterator12 = removalCriteria[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
              var tempCriteria = _step12.value;

              if (tempCriteria != null) {
                // evaluate the criteria
                var tempResult = this.evaluateCriteria(tempCriteria);

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
          } catch (err) {
            _didIteratorError12 = true;
            _iteratorError12 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion12 && _iterator12.return) {
                _iterator12.return();
              }
            } finally {
              if (_didIteratorError12) {
                throw _iteratorError12;
              }
            }
          }
        }
      }
      return result;
    }
  }, {
    key: 'evaluateCriteria',


    /**
     * Evaluate the criteria
     * @param criteria the criteria
     * @returns whether the criteria is satisfied or not
     */
    value: function evaluateCriteria(criteria) {
      var result = false;
      if (criteria != null) {
        var functionName = criteria.name;
        if (functionName == null) {} else if (functionName === 'branchPathTaken') {
          result = this.evaluateBranchPathTakenCriteria(criteria);
        } else if (functionName === 'isVisible') {} else if (functionName === 'isVisitable') {} else if (functionName === 'isVisited') {
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
        } else if (functionName === 'wroteXNumberOfWords') {
          result = this.evaluateNumberOfWordsWrittenCriteria(criteria);
        } else if (functionName === '') {}
      }
      return result;
    }
  }, {
    key: 'evaluateIsCompletedCriteria',


    /**
     * Check if the isCompleted criteria was satisfied
     * @param criteria an isCompleted criteria
     * @returns whether the criteria was satisfied or not
     */
    value: function evaluateIsCompletedCriteria(criteria) {
      if (criteria != null && criteria.params != null) {
        var params = criteria.params;
        var nodeId = params.nodeId;
        return this.isCompleted(nodeId);
      }
      return false;
    }

    /**
     * Check if the isCorrect criteria was satisfied
     * @param criteria an isCorrect criteria
     * @returns whether the criteria was satisfied or not
     */

  }, {
    key: 'evaluateIsCorrectCriteria',
    value: function evaluateIsCorrectCriteria(criteria) {
      if (criteria != null && criteria.params != null) {
        var params = criteria.params;
        var nodeId = params.nodeId;
        var componentId = params.componentId;

        if (nodeId != null && componentId != null) {
          var componentStates = this.getComponentStatesByNodeIdAndComponentId(nodeId, componentId);
          if (componentStates != null) {
            var _iteratorNormalCompletion13 = true;
            var _didIteratorError13 = false;
            var _iteratorError13 = undefined;

            try {
              for (var _iterator13 = componentStates[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
                var componentState = _step13.value;

                if (componentState != null) {
                  var studentData = componentState.studentData;
                  if (studentData != null) {
                    if (studentData.isCorrect) {
                      return true;
                    }
                  }
                }
              }
            } catch (err) {
              _didIteratorError13 = true;
              _iteratorError13 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion13 && _iterator13.return) {
                  _iterator13.return();
                }
              } finally {
                if (_didIteratorError13) {
                  throw _iteratorError13;
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

  }, {
    key: 'evaluateIsPlanningActivityCompletedCriteria',
    value: function evaluateIsPlanningActivityCompletedCriteria(criteria) {
      var result = false;
      if (criteria != null && criteria.params != null) {
        var params = criteria.params;

        // get the group id
        var nodeId = params.nodeId;

        // get the number of planning steps the student needs to create
        var planningStepsCreated = params.planningStepsCreated;

        // get whether the student needs to complete all the steps in the activity
        var planningStepsCompleted = params.planningStepsCompleted;

        var planningStepsCreatedSatisfied = false;
        var planningStepsCompletedSatisfied = false;

        var planningNodes = [];

        if (planningStepsCreated == null) {
          // there is no value set so we will regard it as satisfied
          planningStepsCreatedSatisfied = true;
        } else {
          /*
           * there is a value for number of planning steps that need to be created
           * so we will check if the student created enough planning steps
           */

          // get the node states for the activity
          var nodeStates = this.getNodeStatesByNodeId(nodeId);

          if (nodeStates != null) {
            for (var ns = nodeStates.length - 1; ns >= 0; ns--) {
              var planningStepCount = 0;
              var nodeState = nodeStates[ns];
              if (nodeState != null) {
                var studentData = nodeState.studentData;
                if (studentData != null) {
                  var nodes = studentData.nodes;
                  if (nodes != null) {
                    var _iteratorNormalCompletion14 = true;
                    var _didIteratorError14 = false;
                    var _iteratorError14 = undefined;

                    try {
                      for (var _iterator14 = nodes[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
                        var node = _step14.value;

                        if (node != null) {
                          if (node.type === 'node' && node.planningNodeTemplateId != null) {
                            // we have found a planning step the student created
                            planningStepCount++;
                          }
                        }
                      }
                    } catch (err) {
                      _didIteratorError14 = true;
                      _iteratorError14 = err;
                    } finally {
                      try {
                        if (!_iteratorNormalCompletion14 && _iterator14.return) {
                          _iterator14.return();
                        }
                      } finally {
                        if (_didIteratorError14) {
                          throw _iteratorError14;
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

  }, {
    key: 'evaluateBranchPathTakenCriteria',
    value: function evaluateBranchPathTakenCriteria(criteria) {
      if (criteria != null && criteria.params != null) {
        // get the expected from and to node ids
        var expectedFromNodeId = criteria.params.fromNodeId;
        var expectedToNodeId = criteria.params.toNodeId;

        // get all the branchPathTaken events from the from node id
        var branchPathTakenEvents = this.getBranchPathTakenEventsByNodeId(expectedFromNodeId);

        if (branchPathTakenEvents != null) {
          var _iteratorNormalCompletion15 = true;
          var _didIteratorError15 = false;
          var _iteratorError15 = undefined;

          try {
            for (var _iterator15 = branchPathTakenEvents[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
              var branchPathTakenEvent = _step15.value;

              if (branchPathTakenEvent != null) {
                var data = branchPathTakenEvent.data;
                if (data != null) {
                  // get the from and to node ids of the event
                  var fromNodeId = data.fromNodeId;
                  var toNodeId = data.toNodeId;
                  if (expectedFromNodeId === fromNodeId && expectedToNodeId === toNodeId) {
                    // the from and to node ids match the ones we are looking for
                    return true;
                  }
                }
              }
            }
          } catch (err) {
            _didIteratorError15 = true;
            _iteratorError15 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion15 && _iterator15.return) {
                _iterator15.return();
              }
            } finally {
              if (_didIteratorError15) {
                throw _iteratorError15;
              }
            }
          }
        }
      }
      return false;
    }
  }, {
    key: 'evaluateIsVisitedCriteria',


    /**
     * Check if the isVisited criteria was satisfied
     * @param criteria the isVisited criteria
     * @returns whether the node id is visited
     */
    value: function evaluateIsVisitedCriteria(criteria) {
      if (criteria != null && criteria.params != null) {
        var nodeId = criteria.params.nodeId;
        var events = this.studentData.events;
        if (events != null) {
          var _iteratorNormalCompletion16 = true;
          var _didIteratorError16 = false;
          var _iteratorError16 = undefined;

          try {
            for (var _iterator16 = events[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
              var event = _step16.value;

              if (event != null) {
                if (nodeId == event.nodeId && 'nodeEntered' === event.event) {
                  return true;
                }
              }
            }
          } catch (err) {
            _didIteratorError16 = true;
            _iteratorError16 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion16 && _iterator16.return) {
                _iterator16.return();
              }
            } finally {
              if (_didIteratorError16) {
                throw _iteratorError16;
              }
            }
          }
        }
      }
      return false;
    }

    /**
     * Check if the isVisitedAfter criteria was satisfied
     * @param criteria the isVisitedAfter criteria
     * @returns whether the node id is visited after the criteriaCreatedTimestamp
     */

  }, {
    key: 'evaluateIsVisitedAfterCriteria',
    value: function evaluateIsVisitedAfterCriteria(criteria) {
      if (criteria != null && criteria.params != null) {
        var isVisitedAfterNodeId = criteria.params.isVisitedAfterNodeId;
        var criteriaCreatedTimestamp = criteria.params.criteriaCreatedTimestamp;

        var events = this.studentData.events;
        if (events != null) {
          var _iteratorNormalCompletion17 = true;
          var _didIteratorError17 = false;
          var _iteratorError17 = undefined;

          try {
            for (var _iterator17 = events[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
              var event = _step17.value;

              if (event != null) {
                if (isVisitedAfterNodeId == event.nodeId && 'nodeEntered' === event.event && event.clientSaveTime > criteriaCreatedTimestamp) {
                  return true;
                }
              }
            }
          } catch (err) {
            _didIteratorError17 = true;
            _iteratorError17 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion17 && _iterator17.return) {
                _iterator17.return();
              }
            } finally {
              if (_didIteratorError17) {
                throw _iteratorError17;
              }
            }
          }
        }
      }
      return false;
    }

    /**
     * Check if the isRevisedAfter criteria was satisfied
     * @param criteria the isRevisedAfter criteria
     * @returns whether the specified node&component was revisted after the criteriaCreatedTimestamp
     */

  }, {
    key: 'evaluateIsRevisedAfterCriteria',
    value: function evaluateIsRevisedAfterCriteria(criteria) {
      if (criteria != null && criteria.params != null) {
        var isRevisedAfterNodeId = criteria.params.isRevisedAfterNodeId;
        var isRevisedAfterComponentId = criteria.params.isRevisedAfterComponentId;
        var criteriaCreatedTimestamp = criteria.params.criteriaCreatedTimestamp;

        // the student has entered the node after the criteriaCreatedTimestamp.
        // now check if student has revised the work after this event
        var latestComponentStateForRevisedComponent = this.getLatestComponentStateByNodeIdAndComponentId(isRevisedAfterNodeId, isRevisedAfterComponentId);
        if (latestComponentStateForRevisedComponent.clientSaveTime > criteriaCreatedTimestamp) {
          return true;
        }
      }
      return false;
    }

    /**
     * Check if the isVisitedAndRevisedAfter criteria was satisfied
     * @param criteria the isVisitedAndRevisedAfter criteria
     * @returns whether the specified nodes were visited and specified node&component was revisted after the criteriaCreatedTimestamp
     */

  }, {
    key: 'evaluateIsVisitedAndRevisedAfterCriteria',
    value: function evaluateIsVisitedAndRevisedAfterCriteria(criteria) {
      if (criteria != null && criteria.params != null) {
        // get the node id we want to check if was visited
        var isVisitedAfterNodeId = criteria.params.isVisitedAfterNodeId;
        var isRevisedAfterNodeId = criteria.params.isRevisedAfterNodeId;
        var isRevisedAfterComponentId = criteria.params.isRevisedAfterComponentId;
        var criteriaCreatedTimestamp = criteria.params.criteriaCreatedTimestamp;

        var events = this.studentData.events;
        if (events != null) {
          var _iteratorNormalCompletion18 = true;
          var _didIteratorError18 = false;
          var _iteratorError18 = undefined;

          try {
            for (var _iterator18 = events[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
              var event = _step18.value;

              if (event != null) {
                if (isVisitedAfterNodeId == event.nodeId && 'nodeEntered' === event.event && event.clientSaveTime > criteriaCreatedTimestamp) {
                  // the student has entered the node after the criteriaCreatedTimestamp.
                  // now check if student has revised the work after this event
                  var latestComponentStateForRevisedComponent = this.getLatestComponentStateByNodeIdAndComponentId(isRevisedAfterNodeId, isRevisedAfterComponentId);
                  if (latestComponentStateForRevisedComponent.clientSaveTime > event.clientSaveTime) {
                    return true;
                  }
                }
              }
            }
          } catch (err) {
            _didIteratorError18 = true;
            _iteratorError18 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion18 && _iterator18.return) {
                _iterator18.return();
              }
            } finally {
              if (_didIteratorError18) {
                throw _iteratorError18;
              }
            }
          }
        }
      }
      return false;
    }

    /**
     * Get all the branchPathTaken events by node id
     * @params fromNodeId the from node id
     * @returns all the branchPathTaken events from the given node id
     */

  }, {
    key: 'getBranchPathTakenEventsByNodeId',
    value: function getBranchPathTakenEventsByNodeId(fromNodeId) {
      var branchPathTakenEvents = [];
      var events = this.studentData.events;
      if (events != null) {
        var _iteratorNormalCompletion19 = true;
        var _didIteratorError19 = false;
        var _iteratorError19 = undefined;

        try {
          for (var _iterator19 = events[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
            var event = _step19.value;

            if (event != null) {
              if (fromNodeId === event.nodeId && 'branchPathTaken' === event.event) {
                // we have found a branchPathTaken event from the from node id
                branchPathTakenEvents.push(event);
              }
            }
          }
        } catch (err) {
          _didIteratorError19 = true;
          _iteratorError19 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion19 && _iterator19.return) {
              _iterator19.return();
            }
          } finally {
            if (_didIteratorError19) {
              throw _iteratorError19;
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

  }, {
    key: 'evaluateChoiceChosenCriteria',
    value: function evaluateChoiceChosenCriteria(criteria) {
      var serviceName = 'MultipleChoiceService'; // Assume MC component.
      if (this.$injector.has(serviceName)) {
        var service = this.$injector.get(serviceName);
        return service.choiceChosen(criteria);
      }
      return false;
    }
  }, {
    key: 'evaluateScoreCriteria',


    /**
     * Evaluate the score criteria
     * @param criteria the criteria to evaluate
     * @returns a boolean value whether the criteria was satisfied or not
     */
    value: function evaluateScoreCriteria(criteria) {
      var params = criteria.params;
      if (params != null) {
        var nodeId = params.nodeId;
        var componentId = params.componentId;
        var scores = params.scores;
        var workgroupId = this.ConfigService.getWorkgroupId();
        var scoreType = 'any';
        if (nodeId != null && componentId != null && scores != null) {
          var latestScoreAnnotation = this.AnnotationService.getLatestScoreAnnotation(nodeId, componentId, workgroupId, scoreType);
          if (latestScoreAnnotation != null) {
            var scoreValue = this.AnnotationService.getScoreValueFromScoreAnnotation(latestScoreAnnotation);

            // check if the score value matches what the criteria is looking for. works when scores is array of integers or integer strings
            if (scores.indexOf(scoreValue) != -1 || scoreValue != null && scores.indexOf(scoreValue.toString()) != -1) {
              /*
               * the student has received a score that matches a score
               * we're looking for
               */
              return true;
            }
          }
        }
      }
      return false;
    }
  }, {
    key: 'evaluateUsedXSubmitsCriteria',


    /**
     * Evaluate the used x submits criteria which requires the student to submit
     * at least x number of times.
     * @param criteria the criteria to evaluate
     * @returns a boolean value whether the student submitted at least x number
     * of times
     */
    value: function evaluateUsedXSubmitsCriteria(criteria) {
      var params = criteria.params;
      if (params != null) {
        var nodeId = params.nodeId;
        var componentId = params.componentId;
        var requiredSubmitCount = params.requiredSubmitCount;

        if (nodeId != null && componentId != null) {
          var componentStates = this.getComponentStatesByNodeIdAndComponentId(nodeId, componentId);
          if (componentStates != null) {
            // counter for manually counting the component states with isSubmit=true
            var manualSubmitCounter = 0;

            // counter for remembering the highest submitCounter value found in studentData objects
            var highestSubmitCounter = 0;

            /*
             * We are counting with two submit counters for backwards compatibility.
             * Some componentStates only have isSubmit=true and do not keep an
             * updated submitCounter for the number of submits.
             */

            var _iteratorNormalCompletion20 = true;
            var _didIteratorError20 = false;
            var _iteratorError20 = undefined;

            try {
              for (var _iterator20 = componentStates[Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
                var componentState = _step20.value;

                if (componentState != null) {
                  if (componentState.isSubmit) {
                    manualSubmitCounter++;
                  }
                  var studentData = componentState.studentData;
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
            } catch (err) {
              _didIteratorError20 = true;
              _iteratorError20 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion20 && _iterator20.return) {
                  _iterator20.return();
                }
              } finally {
                if (_didIteratorError20) {
                  throw _iteratorError20;
                }
              }
            }

            if (manualSubmitCounter >= requiredSubmitCount || highestSubmitCounter >= requiredSubmitCount) {
              // the student submitted the required number of times
              return true;
            }
          }
        }
      }
      return false;
    }

    /**
     * Evaluate the number of words written criteria.
     * @param criteria The criteria to evaluate.
     * @return A boolean value whether the student wrote the required number of
     * words.
     */

  }, {
    key: 'evaluateNumberOfWordsWrittenCriteria',
    value: function evaluateNumberOfWordsWrittenCriteria(criteria) {
      if (criteria != null && criteria.params != null) {
        var params = criteria.params;
        var nodeId = params.nodeId;
        var componentId = params.componentId;
        var requiredNumberOfWords = params.requiredNumberOfWords;

        if (nodeId != null && componentId != null) {
          var componentState = this.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);
          if (componentState != null) {
            var studentData = componentState.studentData;
            var response = studentData.response;
            var numberOfWords = this.UtilService.wordCount(response);
            if (numberOfWords >= requiredNumberOfWords) {
              return true;
            }
          }
        }
      }
      return false;
    }

    /**
     * Populate the stack history and visited nodes history
     * @param events the events
     */

  }, {
    key: 'populateHistories',
    value: function populateHistories(events) {
      this.stackHistory = [];
      this.visitedNodesHistory = [];

      if (events != null) {
        var _iteratorNormalCompletion21 = true;
        var _didIteratorError21 = false;
        var _iteratorError21 = undefined;

        try {
          for (var _iterator21 = events[Symbol.iterator](), _step21; !(_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done); _iteratorNormalCompletion21 = true) {
            var event = _step21.value;

            if (event != null && event.event === 'nodeEntered') {
              this.updateStackHistory(event.nodeId);
              this.updateVisitedNodesHistory(event.nodeId);
            }
          }
        } catch (err) {
          _didIteratorError21 = true;
          _iteratorError21 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion21 && _iterator21.return) {
              _iterator21.return();
            }
          } finally {
            if (_didIteratorError21) {
              throw _iteratorError21;
            }
          }
        }
      }
    }
  }, {
    key: 'getStackHistoryAtIndex',
    value: function getStackHistoryAtIndex(index) {
      if (index < 0) {
        index = this.stackHistory.length + index;
      }
      if (this.stackHistory != null && this.stackHistory.length > 0) {
        return this.stackHistory[index];
      }
      return null;
    }
  }, {
    key: 'getStackHistory',
    value: function getStackHistory() {
      return this.stackHistory;
    }
  }, {
    key: 'updateStackHistory',
    value: function updateStackHistory(nodeId) {
      var indexOfNodeId = this.stackHistory.indexOf(nodeId);
      if (indexOfNodeId === -1) {
        this.stackHistory.push(nodeId);
      } else {
        this.stackHistory.splice(indexOfNodeId + 1, this.stackHistory.length);
      }
    }
  }, {
    key: 'updateVisitedNodesHistory',
    value: function updateVisitedNodesHistory(nodeId) {
      var indexOfNodeId = this.visitedNodesHistory.indexOf(nodeId);
      if (indexOfNodeId === -1) {
        this.visitedNodesHistory.push(nodeId);
      }
    }
  }, {
    key: 'getVisitedNodesHistory',
    value: function getVisitedNodesHistory() {
      return this.visitedNodesHistory;
    }
  }, {
    key: 'isNodeVisited',
    value: function isNodeVisited(nodeId) {
      var visitedNodesHistory = this.visitedNodesHistory;
      if (visitedNodesHistory != null) {
        var indexOfNodeId = visitedNodesHistory.indexOf(nodeId);
        if (indexOfNodeId !== -1) {
          return true;
        }
      }
      return false;
    }
  }, {
    key: 'createComponentState',
    value: function createComponentState() {
      var componentState = {};
      componentState.timestamp = Date.parse(new Date());
      return componentState;
    }
  }, {
    key: 'addComponentState',
    value: function addComponentState(componentState) {
      if (this.studentData != null && this.studentData.componentStates != null) {
        this.studentData.componentStates.push(componentState);
      }
    }
  }, {
    key: 'addNodeState',
    value: function addNodeState(nodeState) {
      if (this.studentData != null && this.studentData.nodeStates != null) {
        this.studentData.nodeStates.push(nodeState);
      }
    }
  }, {
    key: 'getNodeStates',


    /**
     * Returns all NodeStates
     * @returns Array of all NodeStates
     */
    value: function getNodeStates() {
      if (this.studentData != null && this.studentData.nodeStates != null) {
        return this.studentData.nodeStates;
      }
      return [];
    }
  }, {
    key: 'getNodeStatesByNodeId',


    /**
     * Get all NodeStates for a specific node
     * @param nodeId id of node
     * @returns Array of NodeStates for the specified node
     */
    value: function getNodeStatesByNodeId(nodeId) {
      var nodeStatesByNodeId = [];
      if (this.studentData != null && this.studentData.nodeStates != null) {
        var nodeStates = this.studentData.nodeStates;
        var _iteratorNormalCompletion22 = true;
        var _didIteratorError22 = false;
        var _iteratorError22 = undefined;

        try {
          for (var _iterator22 = nodeStates[Symbol.iterator](), _step22; !(_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done); _iteratorNormalCompletion22 = true) {
            var nodeState = _step22.value;

            if (nodeState != null) {
              var tempNodeId = nodeState.nodeId;
              if (nodeId === tempNodeId) {
                nodeStatesByNodeId.push(nodeState);
              }
            }
          }
        } catch (err) {
          _didIteratorError22 = true;
          _iteratorError22 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion22 && _iterator22.return) {
              _iterator22.return();
            }
          } finally {
            if (_didIteratorError22) {
              throw _iteratorError22;
            }
          }
        }
      }
      return nodeStatesByNodeId;
    }
  }, {
    key: 'addEvent',
    value: function addEvent(event) {
      if (this.studentData != null && this.studentData.events != null) {
        this.studentData.events.push(event);
      }
    }
  }, {
    key: 'addAnnotation',
    value: function addAnnotation(annotation) {
      if (this.studentData != null && this.studentData.annotations != null) {
        this.studentData.annotations.push(annotation);
      }
    }
  }, {
    key: 'handleAnnotationReceived',
    value: function handleAnnotationReceived(annotation) {
      this.studentData.annotations.push(annotation);
      if (annotation.notebookItemId) {
        this.$rootScope.$broadcast('notebookItemAnnotationReceived', { annotation: annotation });
      } else {
        this.$rootScope.$broadcast('annotationReceived', { annotation: annotation });
      }
    }
  }, {
    key: 'saveComponentEvent',
    value: function saveComponentEvent(component, category, event, data) {
      if (component == null || category == null || event == null) {
        alert(this.$translate('STUDENT_DATA_SERVICE_SAVE_COMPONENT_EVENT_COMPONENT_CATEGORY_EVENT_ERROR'));
        return;
      }
      var context = "Component";
      var nodeId = component.nodeId;
      var componentId = component.componentId;
      var componentType = component.componentType;
      if (nodeId == null || componentId == null || componentType == null) {
        alert(this.$translate('STUDENT_DATA_SERVICE_SAVE_COMPONENT_EVENT_NODE_ID_COMPONENT_ID_COMPONENT_TYPE_ERROR'));
        return;
      }
      this.saveEvent(context, nodeId, componentId, componentType, category, event, data);
    }
  }, {
    key: 'saveVLEEvent',
    value: function saveVLEEvent(nodeId, componentId, componentType, category, event, data) {
      if (category == null || event == null) {
        alert(this.$translate('STUDENT_DATA_SERVICE_SAVE_VLE_EVENT_CATEGORY_EVENT_ERROR'));
        return;
      }
      var context = "VLE";
      this.saveEvent(context, nodeId, componentId, componentType, category, event, data);
    }
  }, {
    key: 'saveEvent',
    value: function saveEvent(context, nodeId, componentId, componentType, category, event, data) {
      var events = [];
      var newEvent = this.createNewEvent();
      newEvent.context = context;
      newEvent.nodeId = nodeId;
      newEvent.componentId = componentId;
      newEvent.type = componentType;
      newEvent.category = category;
      newEvent.event = event;
      newEvent.data = data;
      events.push(newEvent);
      var componentStates = null;
      var nodeStates = null;
      var annotations = null;
      this.saveToServer(componentStates, nodeStates, events, annotations);
    }
  }, {
    key: 'createNewEvent',


    /**
     * Create a new empty event
     * @return a new empty event
     */
    value: function createNewEvent() {
      var event = {};
      event.projectId = this.ConfigService.getProjectId();
      event.runId = this.ConfigService.getRunId();
      event.periodId = this.ConfigService.getPeriodId();
      event.workgroupId = this.ConfigService.getWorkgroupId();
      event.clientSaveTime = Date.parse(new Date());
      return event;
    }
  }, {
    key: 'saveNodeStates',
    value: function saveNodeStates(nodeStates) {
      var componentStates = null;
      var events = null;
      var annotations = null;
      this.saveToServer(componentStates, nodeStates, events, annotations);
    }
  }, {
    key: 'saveAnnotations',
    value: function saveAnnotations(annotations) {
      var componentStates = null;
      var nodeStates = null;
      var events = null;
      this.saveToServer(componentStates, nodeStates, events, annotations);
    }
  }, {
    key: 'saveToServer',
    value: function saveToServer(componentStates, nodeStates, events, annotations) {
      var _this4 = this;

      /*
       * increment the request count since we are about to save data
       * to the server
       */
      this.saveToServerRequestCount += 1;

      // merge componentStates and nodeStates into StudentWork before posting
      var studentWorkList = [];
      if (componentStates != null && componentStates.length > 0) {
        var _iteratorNormalCompletion23 = true;
        var _didIteratorError23 = false;
        var _iteratorError23 = undefined;

        try {
          for (var _iterator23 = componentStates[Symbol.iterator](), _step23; !(_iteratorNormalCompletion23 = (_step23 = _iterator23.next()).done); _iteratorNormalCompletion23 = true) {
            var componentState = _step23.value;

            if (componentState != null) {
              componentState.requestToken = this.UtilService.generateKey(); // use this to keep track of unsaved componentStates.
              this.addComponentState(componentState);
              studentWorkList.push(componentState);
            }
          }
        } catch (err) {
          _didIteratorError23 = true;
          _iteratorError23 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion23 && _iterator23.return) {
              _iterator23.return();
            }
          } finally {
            if (_didIteratorError23) {
              throw _iteratorError23;
            }
          }
        }
      }

      if (nodeStates != null && nodeStates.length > 0) {
        var _iteratorNormalCompletion24 = true;
        var _didIteratorError24 = false;
        var _iteratorError24 = undefined;

        try {
          for (var _iterator24 = nodeStates[Symbol.iterator](), _step24; !(_iteratorNormalCompletion24 = (_step24 = _iterator24.next()).done); _iteratorNormalCompletion24 = true) {
            var nodeState = _step24.value;

            if (nodeState != null) {
              nodeState.requestToken = this.UtilService.generateKey(); // use this to keep track of unsaved componentStates.
              this.addNodeState(nodeState);
              studentWorkList.push(nodeState);
            }
          }
        } catch (err) {
          _didIteratorError24 = true;
          _iteratorError24 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion24 && _iterator24.return) {
              _iterator24.return();
            }
          } finally {
            if (_didIteratorError24) {
              throw _iteratorError24;
            }
          }
        }
      }

      if (events != null && events.length > 0) {
        var _iteratorNormalCompletion25 = true;
        var _didIteratorError25 = false;
        var _iteratorError25 = undefined;

        try {
          for (var _iterator25 = events[Symbol.iterator](), _step25; !(_iteratorNormalCompletion25 = (_step25 = _iterator25.next()).done); _iteratorNormalCompletion25 = true) {
            var event = _step25.value;

            if (event != null) {
              event.requestToken = this.UtilService.generateKey(); // use this to keep track of unsaved events.
              this.addEvent(event);
            }
          }
        } catch (err) {
          _didIteratorError25 = true;
          _iteratorError25 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion25 && _iterator25.return) {
              _iterator25.return();
            }
          } finally {
            if (_didIteratorError25) {
              throw _iteratorError25;
            }
          }
        }
      } else {
        events = [];
      }

      if (annotations != null && annotations.length > 0) {
        var _iteratorNormalCompletion26 = true;
        var _didIteratorError26 = false;
        var _iteratorError26 = undefined;

        try {
          for (var _iterator26 = annotations[Symbol.iterator](), _step26; !(_iteratorNormalCompletion26 = (_step26 = _iterator26.next()).done); _iteratorNormalCompletion26 = true) {
            var annotation = _step26.value;

            if (annotation != null) {
              annotation.requestToken = this.UtilService.generateKey(); // use this to keep track of unsaved annotations.
              if (annotation.id == null) {
                // add to local annotation array if this annotation has not been saved to the server before.
                this.addAnnotation(annotation);
              }
            }
          }
        } catch (err) {
          _didIteratorError26 = true;
          _iteratorError26 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion26 && _iterator26.return) {
              _iterator26.return();
            }
          } finally {
            if (_didIteratorError26) {
              throw _iteratorError26;
            }
          }
        }
      } else {
        annotations = [];
      }

      if (this.ConfigService.isPreview()) {
        var savedStudentDataResponse = {
          studentWorkList: studentWorkList,
          events: events,
          annotations: annotations
        };

        // if we're in preview, don't make any request to the server but pretend we did
        this.saveToServerSuccess(savedStudentDataResponse);
        var deferred = this.$q.defer();
        deferred.resolve(savedStudentDataResponse);
        return deferred.promise;
      } else {
        // set the workgroup id and run id
        var params = {};
        params.projectId = this.ConfigService.getProjectId();
        params.runId = this.ConfigService.getRunId();
        params.workgroupId = this.ConfigService.getWorkgroupId();
        params.studentWorkList = angular.toJson(studentWorkList);
        params.events = angular.toJson(events);
        params.annotations = angular.toJson(annotations);

        // get the url to POST the student data
        var httpParams = {};
        httpParams.method = 'POST';
        httpParams.url = this.ConfigService.getConfigParam('studentDataURL');
        httpParams.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        httpParams.data = $.param(params);

        // make the request to post the student data
        return this.$http(httpParams).then(function (result) {
          // get the local references to the component states that were posted and set their id and serverSaveTime
          if (result != null && result.data != null) {
            var _savedStudentDataResponse = result.data;

            _this4.saveToServerSuccess(_savedStudentDataResponse);

            return _savedStudentDataResponse;
          }
        }, function (result) {
          // a server error occured

          /*
           * decrement the request count since this request failed
           * but is now completed
           */
          _this4.saveToServerRequestCount -= 1;

          return null;
        });
      }
    }
  }, {
    key: 'saveToServerSuccess',
    value: function saveToServerSuccess(savedStudentDataResponse) {
      // set dummy serverSaveTime for use if we're in preview mode
      var serverSaveTime = Date.parse(new Date());

      // handle saved studentWork
      if (savedStudentDataResponse.studentWorkList) {
        var savedStudentWorkList = savedStudentDataResponse.studentWorkList;
        var localStudentWorkList = this.studentData.componentStates;
        if (this.studentData.nodeStates) {
          localStudentWorkList = localStudentWorkList.concat(this.studentData.nodeStates);
        }

        // set the id and serverSaveTime in the local studentWorkList
        var _iteratorNormalCompletion27 = true;
        var _didIteratorError27 = false;
        var _iteratorError27 = undefined;

        try {
          for (var _iterator27 = savedStudentWorkList[Symbol.iterator](), _step27; !(_iteratorNormalCompletion27 = (_step27 = _iterator27.next()).done); _iteratorNormalCompletion27 = true) {
            var savedStudentWork = _step27.value;

            /*
             * loop through all the student work that were posted
             * to find the one with the matching request token
             */
            for (var l = localStudentWorkList.length - 1; l >= 0; l--) {
              var localStudentWork = localStudentWorkList[l];
              if (localStudentWork.requestToken && localStudentWork.requestToken === savedStudentWork.requestToken) {
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

                this.$rootScope.$broadcast('studentWorkSavedToServer', { studentWork: localStudentWork });
                break;
              }
            }
          }
        } catch (err) {
          _didIteratorError27 = true;
          _iteratorError27 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion27 && _iterator27.return) {
              _iterator27.return();
            }
          } finally {
            if (_didIteratorError27) {
              throw _iteratorError27;
            }
          }
        }
      }
      // handle saved events
      if (savedStudentDataResponse.events) {
        var savedEvents = savedStudentDataResponse.events;

        var localEvents = this.studentData.events;

        // set the id and serverSaveTime in the local event
        var _iteratorNormalCompletion28 = true;
        var _didIteratorError28 = false;
        var _iteratorError28 = undefined;

        try {
          for (var _iterator28 = savedEvents[Symbol.iterator](), _step28; !(_iteratorNormalCompletion28 = (_step28 = _iterator28.next()).done); _iteratorNormalCompletion28 = true) {
            var savedEvent = _step28.value;

            /*
             * loop through all the events that were posted
             * to find the one with the matching request token
             */
            for (var _l = localEvents.length - 1; _l >= 0; _l--) {
              var localEvent = localEvents[_l];
              if (localEvent.requestToken && localEvent.requestToken === savedEvent.requestToken) {
                localEvent.id = savedEvent.id;
                localEvent.serverSaveTime = savedEvent.serverSaveTime ? savedEvent.serverSaveTime : serverSaveTime;
                localEvent.requestToken = null; // requestToken is no longer needed.

                this.$rootScope.$broadcast('eventSavedToServer', { event: localEvent });
                break;
              }
            }
          }
        } catch (err) {
          _didIteratorError28 = true;
          _iteratorError28 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion28 && _iterator28.return) {
              _iterator28.return();
            }
          } finally {
            if (_didIteratorError28) {
              throw _iteratorError28;
            }
          }
        }
      }

      // handle saved annotations
      if (savedStudentDataResponse.annotations) {
        var savedAnnotations = savedStudentDataResponse.annotations;
        var localAnnotations = this.studentData.annotations;

        // set the id and serverSaveTime in the local annotation
        var _iteratorNormalCompletion29 = true;
        var _didIteratorError29 = false;
        var _iteratorError29 = undefined;

        try {
          for (var _iterator29 = savedAnnotations[Symbol.iterator](), _step29; !(_iteratorNormalCompletion29 = (_step29 = _iterator29.next()).done); _iteratorNormalCompletion29 = true) {
            var savedAnnotation = _step29.value;

            /*
             * loop through all the events that were posted
             * to find the one with the matching request token
             */
            for (var _l2 = localAnnotations.length - 1; _l2 >= 0; _l2--) {
              var localAnnotation = localAnnotations[_l2];
              if (localAnnotation.requestToken && localAnnotation.requestToken === savedAnnotation.requestToken) {
                localAnnotation.id = savedAnnotation.id;
                localAnnotation.serverSaveTime = savedAnnotation.serverSaveTime ? savedAnnotation.serverSaveTime : serverSaveTime;
                localAnnotation.requestToken = null; // requestToken is no longer needed.

                this.$rootScope.$broadcast('annotationSavedToServer', { annotation: localAnnotation });
                break;
              }
            }
          }
        } catch (err) {
          _didIteratorError29 = true;
          _iteratorError29 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion29 && _iterator29.return) {
              _iterator29.return();
            }
          } finally {
            if (_didIteratorError29) {
              throw _iteratorError29;
            }
          }
        }
      }

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
    }
  }, {
    key: 'saveStudentStatus',


    /**
     * POSTs student status to server
     * Returns a promise of the POST request
     */
    value: function saveStudentStatus() {
      if (!this.ConfigService.isPreview()) {
        var studentStatusURL = this.ConfigService.getStudentStatusURL();
        if (studentStatusURL != null) {
          var runId = this.ConfigService.getRunId();
          var periodId = this.ConfigService.getPeriodId();
          var workgroupId = this.ConfigService.getWorkgroupId();
          var currentNodeId = this.getCurrentNodeId();
          var nodeStatuses = this.getNodeStatuses();
          var projectCompletion = this.getProjectCompletion();

          // create the JSON that will be saved to the database
          var studentStatusJSON = {};
          studentStatusJSON.runId = runId;
          studentStatusJSON.periodId = periodId;
          studentStatusJSON.workgroupId = workgroupId;
          studentStatusJSON.currentNodeId = currentNodeId;
          studentStatusJSON.nodeStatuses = nodeStatuses;
          studentStatusJSON.projectCompletion = projectCompletion;

          var status = angular.toJson(studentStatusJSON);
          var studentStatusParams = {};
          studentStatusParams.runId = runId;
          studentStatusParams.periodId = periodId;
          studentStatusParams.workgroupId = workgroupId;
          studentStatusParams.status = status;

          var httpParams = {};
          httpParams.method = 'POST';
          httpParams.url = studentStatusURL;
          httpParams.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
          httpParams.data = $.param(studentStatusParams);

          return this.$http(httpParams).then(function (result) {
            return true;
          }, function (result) {
            return false;
          });
        }
      }
    }
  }, {
    key: 'retrieveComponentStates',
    value: function retrieveComponentStates(runId, periodId, workgroupId) {}
  }, {
    key: 'getLatestComponentState',
    value: function getLatestComponentState() {
      var studentData = this.studentData;
      if (studentData != null) {
        var componentStates = studentData.componentStates;
        if (componentStates != null) {
          return componentStates[componentStates.length - 1];
        }
      }
      return null;
    }
  }, {
    key: 'isComponentSubmitDirty',


    /**
     * Check whether the component has unsubmitted work
     * @return boolean whether or not there is unsubmitted work
     */
    value: function isComponentSubmitDirty() {
      var latestComponentState = this.getLatestComponentState();
      if (latestComponentState && !latestComponentState.isSubmit) {
        return true;
      }
      return false;
    }
  }, {
    key: 'getLatestNodeStateByNodeId',


    /**
     * Get the latest NodeState for the specified node id
     * @param nodeId the node id
     * @return the latest node state with the matching node id or null if none are found
     */
    value: function getLatestNodeStateByNodeId(nodeId) {
      var allNodeStatesByNodeId = this.getNodeStatesByNodeId(nodeId);
      if (allNodeStatesByNodeId != null && allNodeStatesByNodeId.length > 0) {
        return allNodeStatesByNodeId[allNodeStatesByNodeId.length - 1];
      }
      return null;
    }
  }, {
    key: 'getLatestComponentStateByNodeIdAndComponentId',


    /**
     * Get the latest component state for the given node id and component
     * id.
     * @param nodeId the node id
     * @param componentId the component id (optional)
     * @return the latest component state with the matching node id and
     * component id or null if none are found
     */
    value: function getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId) {
      if (nodeId) {
        var studentData = this.studentData;
        if (studentData) {
          // get the component states
          var componentStates = studentData.componentStates;
          if (componentStates) {
            for (var c = componentStates.length - 1; c >= 0; c--) {
              var componentState = componentStates[c];
              if (componentState) {
                var componentStateNodeId = componentState.nodeId;
                if (nodeId === componentStateNodeId) {
                  if (componentId) {
                    var componentStateComponentId = componentState.componentId;
                    if (componentId === componentStateComponentId) {
                      return componentState;
                    }
                  } else {
                    return componentState;
                  }
                }
              }
            }
          }
        }
      }
      return null;
    }
  }, {
    key: 'getStudentWorkByStudentWorkId',


    /**
     * Get the student work by specified student work id, which can be a ComponentState or NodeState
     * @param studentWorkId the student work id
     * @return an StudentWork or null
     */
    value: function getStudentWorkByStudentWorkId(studentWorkId) {
      if (studentWorkId != null) {
        var componentStates = this.studentData.componentStates;
        if (componentStates != null) {
          var _iteratorNormalCompletion30 = true;
          var _didIteratorError30 = false;
          var _iteratorError30 = undefined;

          try {
            for (var _iterator30 = componentStates[Symbol.iterator](), _step30; !(_iteratorNormalCompletion30 = (_step30 = _iterator30.next()).done); _iteratorNormalCompletion30 = true) {
              var componentState = _step30.value;

              if (componentState != null && componentState.id === studentWorkId) {
                return componentState;
              }
            }
          } catch (err) {
            _didIteratorError30 = true;
            _iteratorError30 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion30 && _iterator30.return) {
                _iterator30.return();
              }
            } finally {
              if (_didIteratorError30) {
                throw _iteratorError30;
              }
            }
          }
        }

        var nodeStates = this.studentData.nodeStates;
        if (nodeStates != null) {
          var _iteratorNormalCompletion31 = true;
          var _didIteratorError31 = false;
          var _iteratorError31 = undefined;

          try {
            for (var _iterator31 = nodeStates[Symbol.iterator](), _step31; !(_iteratorNormalCompletion31 = (_step31 = _iterator31.next()).done); _iteratorNormalCompletion31 = true) {
              var nodeState = _step31.value;

              if (nodeState != null && nodeState.id === studentWorkId) {
                return nodeState;
              }
            }
          } catch (err) {
            _didIteratorError31 = true;
            _iteratorError31 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion31 && _iterator31.return) {
                _iterator31.return();
              }
            } finally {
              if (_didIteratorError31) {
                throw _iteratorError31;
              }
            }
          }
        }
      }
      return null;
    }
  }, {
    key: 'getComponentStates',


    /**
     * Returns all the component states for this workgroup
     */
    value: function getComponentStates() {
      return this.studentData.componentStates;
    }
  }, {
    key: 'getComponentStatesByNodeId',


    /**
     * Get the component states for the given node id
     * @param nodeId the node id
     * @return an array of component states for the given node id
     */
    value: function getComponentStatesByNodeId(nodeId) {
      var componentStatesByNodeId = [];
      if (nodeId != null) {
        var studentData = this.studentData;
        if (studentData != null) {
          var componentStates = studentData.componentStates;
          if (componentStates != null) {
            var _iteratorNormalCompletion32 = true;
            var _didIteratorError32 = false;
            var _iteratorError32 = undefined;

            try {
              for (var _iterator32 = componentStates[Symbol.iterator](), _step32; !(_iteratorNormalCompletion32 = (_step32 = _iterator32.next()).done); _iteratorNormalCompletion32 = true) {
                var componentState = _step32.value;

                if (componentState != null) {
                  var componentStateNodeId = componentState.nodeId;
                  if (nodeId == componentStateNodeId) {
                    componentStatesByNodeId.push(componentState);
                  }
                }
              }
            } catch (err) {
              _didIteratorError32 = true;
              _iteratorError32 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion32 && _iterator32.return) {
                  _iterator32.return();
                }
              } finally {
                if (_didIteratorError32) {
                  throw _iteratorError32;
                }
              }
            }
          }
        }
      }
      return componentStatesByNodeId;
    }
  }, {
    key: 'getComponentStatesByNodeIdAndComponentId',


    /**
     * Get the component states for the given node id and component id
     * @param nodeId the node id
     * @param componentId the component id
     * @return an array of component states for the given node id and
     * component id
     */
    value: function getComponentStatesByNodeIdAndComponentId(nodeId, componentId) {
      var componentStatesByNodeIdAndComponentId = [];
      if (nodeId != null && componentId != null) {
        var studentData = this.studentData;
        if (studentData != null) {
          var componentStates = studentData.componentStates;
          if (componentStates != null) {
            var _iteratorNormalCompletion33 = true;
            var _didIteratorError33 = false;
            var _iteratorError33 = undefined;

            try {
              for (var _iterator33 = componentStates[Symbol.iterator](), _step33; !(_iteratorNormalCompletion33 = (_step33 = _iterator33.next()).done); _iteratorNormalCompletion33 = true) {
                var componentState = _step33.value;

                if (componentState != null) {
                  var componentStateNodeId = componentState.nodeId;
                  var componentStateComponentId = componentState.componentId;
                  if (nodeId == componentStateNodeId && componentId == componentStateComponentId) {
                    componentStatesByNodeIdAndComponentId.push(componentState);
                  }
                }
              }
            } catch (err) {
              _didIteratorError33 = true;
              _iteratorError33 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion33 && _iterator33.return) {
                  _iterator33.return();
                }
              } finally {
                if (_didIteratorError33) {
                  throw _iteratorError33;
                }
              }
            }
          }
        }
      }

      return componentStatesByNodeIdAndComponentId;
    }
  }, {
    key: 'getEvents',


    /**
     * Get all events
     * @returns all events for the student
     */
    value: function getEvents() {
      if (this.studentData != null && this.studentData.events != null) {
        return this.studentData.events;
      } else {
        return [];
      }
    }
  }, {
    key: 'getEventsByNodeId',


    /**
     * Get the events for a node id
     * @param nodeId the node id
     * @returns the events for the node id
     */
    value: function getEventsByNodeId(nodeId) {
      var eventsByNodeId = [];
      if (nodeId != null) {
        if (this.studentData != null && this.studentData.events != null) {
          var events = this.studentData.events;
          var _iteratorNormalCompletion34 = true;
          var _didIteratorError34 = false;
          var _iteratorError34 = undefined;

          try {
            for (var _iterator34 = events[Symbol.iterator](), _step34; !(_iteratorNormalCompletion34 = (_step34 = _iterator34.next()).done); _iteratorNormalCompletion34 = true) {
              var event = _step34.value;

              if (event != null) {
                var eventNodeId = event.nodeId;
                if (nodeId === eventNodeId) {
                  eventsByNodeId.push(event);
                }
              }
            }
          } catch (err) {
            _didIteratorError34 = true;
            _iteratorError34 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion34 && _iterator34.return) {
                _iterator34.return();
              }
            } finally {
              if (_didIteratorError34) {
                throw _iteratorError34;
              }
            }
          }
        }
      }
      return eventsByNodeId;
    }
  }, {
    key: 'getEventsByNodeIdAndComponentId',


    /**
     * Get the events for a component id
     * @param nodeId the node id
     * @param componentId the component id
     * @returns an array of events for the component id
     */
    value: function getEventsByNodeIdAndComponentId(nodeId, componentId) {
      var eventsByNodeId = [];
      if (nodeId != null) {
        if (this.studentData != null && this.studentData.events != null) {
          var events = this.studentData.events;
          var _iteratorNormalCompletion35 = true;
          var _didIteratorError35 = false;
          var _iteratorError35 = undefined;

          try {
            for (var _iterator35 = events[Symbol.iterator](), _step35; !(_iteratorNormalCompletion35 = (_step35 = _iterator35.next()).done); _iteratorNormalCompletion35 = true) {
              var event = _step35.value;

              if (event != null) {
                var eventNodeId = event.nodeId;
                var eventComponentId = event.componentId;
                if (nodeId === eventNodeId && componentId === eventComponentId) {
                  eventsByNodeId.push(event);
                }
              }
            }
          } catch (err) {
            _didIteratorError35 = true;
            _iteratorError35 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion35 && _iterator35.return) {
                _iterator35.return();
              }
            } finally {
              if (_didIteratorError35) {
                throw _iteratorError35;
              }
            }
          }
        }
      }
      return eventsByNodeId;
    }
  }, {
    key: 'getLatestNodeEnteredEventNodeIdWithExistingNode',


    /**
     * Get the node id of the latest node entered event for an active node that
     * exists in the project. We need to check if the node exists in the project
     * in case the node has been deleted from the project. We also need to check
     * that the node is active in case the node has been moved to the inactive
     * section of the project.
     * @return the node id of the latest node entered event for an active node
     * that exists in the project
     */
    value: function getLatestNodeEnteredEventNodeIdWithExistingNode() {
      var events = this.studentData.events;
      for (var e = events.length - 1; e >= 0; e--) {
        var event = events[e];
        if (event != null) {
          var eventName = event.event;
          if (eventName == 'nodeEntered') {
            var nodeId = event.nodeId;
            var node = this.ProjectService.getNodeById(nodeId);
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

  }, {
    key: 'canVisitNode',
    value: function canVisitNode(nodeId) {
      if (nodeId != null) {
        // get the node status for the node
        var nodeStatus = this.getNodeStatusByNodeId(nodeId);
        if (nodeStatus != null) {
          if (nodeStatus.isVisitable) {
            return true;
          }
        }
      }
      return false;
    }
  }, {
    key: 'getNodeStatusByNodeId',


    /**
     * Get the node status by node id
     * @param nodeId the node id
     * @returns the node status object for a node
     */
    value: function getNodeStatusByNodeId(nodeId) {
      if (nodeId != null) {
        return this.nodeStatuses[nodeId];
      }
      return null;
    }
  }, {
    key: 'getNodeProgressById',


    /**
     * Get progress information for a given node
     * @param nodeId the node id
     * @returns object with number of completed items (both all and for items
     * that capture student work), number of visible items (all/with work),
     * completion % (for all items, items with student work)
     */
    value: function getNodeProgressById(nodeId) {
      var completedItems = 0;
      var completedItemsWithWork = 0;
      var totalItems = 0;
      var totalItemsWithWork = 0;
      var progress = {};

      if (this.ProjectService.isGroupNode(nodeId)) {
        var nodeIds = this.ProjectService.getChildNodeIdsById(nodeId);
        var _iteratorNormalCompletion36 = true;
        var _didIteratorError36 = false;
        var _iteratorError36 = undefined;

        try {
          for (var _iterator36 = nodeIds[Symbol.iterator](), _step36; !(_iteratorNormalCompletion36 = (_step36 = _iterator36.next()).done); _iteratorNormalCompletion36 = true) {
            var id = _step36.value;

            var status = this.nodeStatuses[id];
            if (this.ProjectService.isGroupNode(id)) {
              if (status.progress.totalItemsWithWork > -1) {
                completedItems += status.progress.completedItems;
                totalItems += status.progress.totalItems;
                completedItemsWithWork += status.progress.completedItemsWithWork;
                totalItemsWithWork += status.progress.totalItemsWithWork;
              } else {
                // we have a legacy node status so we'll need to calculate manually
                var groupProgress = this.getNodeProgressById(id);
                completedItems += groupProgress.completedItems;
                totalItems += groupProgress.totalItems;
                completedItemsWithWork += groupProgress.completedItemsWithWork;
                totalItemsWithWork += groupProgress.totalItemsWithWork;
              }
            } else {
              if (status.isVisible) {
                totalItems++;

                var hasWork = this.ProjectService.nodeHasWork(id);
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
        } catch (err) {
          _didIteratorError36 = true;
          _iteratorError36 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion36 && _iterator36.return) {
              _iterator36.return();
            }
          } finally {
            if (_didIteratorError36) {
              throw _iteratorError36;
            }
          }
        }

        var completionPct = totalItems ? Math.round(completedItems / totalItems * 100) : 0;
        var completionPctWithWork = totalItemsWithWork ? Math.round(completedItemsWithWork / totalItemsWithWork * 100) : 0;

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
    }
  }, {
    key: 'isCompleted',


    /**
     * Check if the given node or component is completed
     * @param nodeId the node id
     * @param componentId (optional) the component id
     * @returns whether the node or component is completed
     */
    value: function isCompleted(nodeId, componentId) {
      var result = false;
      if (nodeId && componentId) {
        // check that the component is completed

        // get the component states for the component
        var componentStates = this.getComponentStatesByNodeIdAndComponentId(nodeId, componentId);

        // get the component events
        var componentEvents = this.getEventsByNodeIdAndComponentId(nodeId, componentId);

        // get the node events
        var nodeEvents = this.getEventsByNodeId(nodeId);

        // get the component object
        var component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);

        var node = this.ProjectService.getNodeById(nodeId);
        if (component != null) {
          // get the component type
          var componentType = component.type;

          if (componentType != null) {
            // get the service for the component type
            var service = this.$injector.get(componentType + 'Service');

            // check if the component is completed
            if (service.isCompleted(component, componentStates, componentEvents, nodeEvents, node)) {
              result = true;
            }
          }
        }
      } else if (nodeId) {
        // check if node is a group
        var isGroup = this.ProjectService.isGroupNode(nodeId);

        var _node = this.ProjectService.getNodeById(nodeId);

        if (isGroup) {
          // node is a group
          var tempResult = true;

          // check that all the nodes in the group are visible and completed
          var nodeIds = this.ProjectService.getChildNodeIdsById(nodeId);

          if (nodeIds.length) {
            var _iteratorNormalCompletion37 = true;
            var _didIteratorError37 = false;
            var _iteratorError37 = undefined;

            try {
              for (var _iterator37 = nodeIds[Symbol.iterator](), _step37; !(_iteratorNormalCompletion37 = (_step37 = _iterator37.next()).done); _iteratorNormalCompletion37 = true) {
                var id = _step37.value;

                if (this.nodeStatuses[id] == null || !this.nodeStatuses[id].isVisible || !this.nodeStatuses[id].isCompleted) {
                  // the child is not visible or not completed so the group is not completed
                  tempResult = false;
                  break;
                }
              }
            } catch (err) {
              _didIteratorError37 = true;
              _iteratorError37 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion37 && _iterator37.return) {
                  _iterator37.return();
                }
              } finally {
                if (_didIteratorError37) {
                  throw _iteratorError37;
                }
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
          var components = this.ProjectService.getComponentsByNodeId(nodeId);

          // we will default to is completed true
          var _tempResult = true;

          /*
           * All components must be completed in order for the node to be completed
           * so we will loop through all the components and check if they are
           * completed
           */
          var _iteratorNormalCompletion38 = true;
          var _didIteratorError38 = false;
          var _iteratorError38 = undefined;

          try {
            for (var _iterator38 = components[Symbol.iterator](), _step38; !(_iteratorNormalCompletion38 = (_step38 = _iterator38.next()).done); _iteratorNormalCompletion38 = true) {
              var _component = _step38.value;

              if (_component != null) {
                var _componentId = _component.id;
                var _componentType = _component.type;
                var showPreviousWorkNodeId = _component.showPreviousWorkNodeId;
                var showPreviousWorkComponentId = _component.showPreviousWorkComponentId;

                var tempNodeId = nodeId;
                var tempNode = _node;
                var tempComponentId = _componentId;
                var tempComponent = _component;

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

                if (_componentType != null) {
                  try {
                    // get the service name
                    var serviceName = _componentType + 'Service';

                    if (this.$injector.has(serviceName)) {
                      // get the service for the component type
                      var _service = this.$injector.get(serviceName);

                      // get the component states for the component
                      var _componentStates = this.getComponentStatesByNodeIdAndComponentId(tempNodeId, tempComponentId);

                      // get the component events
                      var _componentEvents = this.getEventsByNodeIdAndComponentId(tempNodeId, tempComponentId);

                      // get the node events
                      var _nodeEvents = this.getEventsByNodeId(tempNodeId);

                      // check if the component is completed
                      var isComponentCompleted = _service.isCompleted(tempComponent, _componentStates, _componentEvents, _nodeEvents, tempNode);

                      _tempResult = _tempResult && isComponentCompleted;
                    }
                  } catch (e) {
                    console.log(this.$translate('ERROR_COULD_NOT_CALCULATE_IS_COMPLETED') + tempComponentId);
                  }
                }
              }
            }
          } catch (err) {
            _didIteratorError38 = true;
            _iteratorError38 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion38 && _iterator38.return) {
                _iterator38.return();
              }
            } finally {
              if (_didIteratorError38) {
                throw _iteratorError38;
              }
            }
          }

          result = _tempResult;
        }
      }
      return result;
    }
  }, {
    key: 'getCurrentNode',


    /**
     * Get the current node
     * @returns the current node object
     */
    value: function getCurrentNode() {
      return this.currentNode;
    }
  }, {
    key: 'getCurrentNodeId',


    /**
     * Get the current node id
     * @returns the current node id
     */
    value: function getCurrentNodeId() {
      if (this.currentNode != null) {
        return this.currentNode.id;
      }
      return null;
    }
  }, {
    key: 'setCurrentNodeByNodeId',


    /**
     * Set the current node
     * @param nodeId the node id
     */
    value: function setCurrentNodeByNodeId(nodeId) {
      if (nodeId != null) {
        var node = this.ProjectService.getNodeById(nodeId);
        this.setCurrentNode(node);
      }
    }
  }, {
    key: 'setCurrentNode',


    /**
     * Set the current node
     * @param node the node object
     */
    value: function setCurrentNode(node) {
      var previousCurrentNode = this.currentNode;
      if (previousCurrentNode !== node) {
        if (previousCurrentNode && !this.ProjectService.isGroupNode(previousCurrentNode.id)) {
          this.previousStep = previousCurrentNode;
        }
        this.currentNode = node;
        this.$rootScope.$broadcast('currentNodeChanged', { previousNode: previousCurrentNode, currentNode: this.currentNode });
      }
    }
  }, {
    key: 'endCurrentNode',


    /**
     * End the current node
     */
    value: function endCurrentNode() {
      var previousCurrentNode = this.currentNode;
      if (previousCurrentNode != null) {
        this.$rootScope.$broadcast('exitNode', { nodeToExit: previousCurrentNode });
      }
    }
  }, {
    key: 'endCurrentNodeAndSetCurrentNodeByNodeId',


    /**
     * End the current node and set the current node
     * @param nodeId the node id of the new current node
     */
    value: function endCurrentNodeAndSetCurrentNodeByNodeId(nodeId) {
      if (this.nodeStatuses[nodeId].isVisitable) {
        this.endCurrentNode();
        this.setCurrentNodeByNodeId(nodeId);
      } else {
        this.nodeClickLocked(nodeId);
      }
    }
  }, {
    key: 'nodeClickLocked',


    /**
     * Broadcast a listenable event that a locked node has been clicked (attempted to be opened)
     * @param nodeId
     */
    value: function nodeClickLocked(nodeId) {
      this.$rootScope.$broadcast('nodeClickLocked', { nodeId: nodeId });
    }
  }, {
    key: 'CSVToArray',


    /**
     * This will parse a delimited string into an array of
     * arrays. The default delimiter is the comma, but this
     * can be overriden in the second argument.
     * Source: http://www.bennadel.com/blog/1504-ask-ben-parsing-csv-strings-with-javascript-exec-regular-expression-command.htm
     */
    value: function CSVToArray(strData, strDelimiter) {
      // Check to see if the delimiter is defined. If not,
      // then default to comma.
      strDelimiter = strDelimiter || ",";

      // Create a regular expression to parse the CSV values.
      var objPattern = new RegExp(
      // Delimiters.
      "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

      // Quoted fields.
      "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

      // Standard fields.
      "([^\"\\" + strDelimiter + "\\r\\n]*))", "gi");

      // Create an array to hold our data. Give the array
      // a default empty first row.
      var arrData = [[]];

      // Create an array to hold our individual pattern
      // matching groups.
      var arrMatches = null;

      // Keep looping over the regular expression matches
      // until we can no longer find a match.
      while (arrMatches = objPattern.exec(strData)) {

        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[1];

        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (strMatchedDelimiter.length && strMatchedDelimiter != strDelimiter) {

          // Since we have reached a new row of data,
          // add an empty row to our data array.
          arrData.push([]);
        }

        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[2]) {

          // We found a quoted value. When we capture
          // this value, unescape any double quotes.
          var _strMatchedValue = arrMatches[2].replace(new RegExp("\"\"", "g"), "\"");
        } else {
          // We found a non-quoted value.
          var _strMatchedValue2 = arrMatches[3];
        }

        // Now that we have our value string, let's add
        // it to the data array.
        var finalValue = strMatchedValue;
        var floatVal = parseFloat(strMatchedValue);
        if (!isNaN(floatVal)) {
          finalValue = floatVal;
        }
        arrData[arrData.length - 1].push(finalValue);
      }
      // Return the parsed data.
      return arrData;
    }
  }, {
    key: 'getTotalScore',


    /**
     * Get the total score for the workgroup
     * @returns the total score for the workgroup
     */
    value: function getTotalScore() {
      var annotations = this.studentData.annotations;
      var workgroupId = this.ConfigService.getWorkgroupId();
      return this.AnnotationService.getTotalScore(annotations, workgroupId);
    }

    /**
     * Get the project completion for the signed in student
     * @returns the project completion percentage for the signed in student
     */

  }, {
    key: 'getProjectCompletion',
    value: function getProjectCompletion() {
      // group0 is always the root node of the whole project
      var nodeId = 'group0';

      // get the progress including all of the children nodes
      var progress = this.getNodeProgressById(nodeId);

      return progress;
    }

    /**
     * Get the run status
     */

  }, {
    key: 'getRunStatus',
    value: function getRunStatus() {
      return this.runStatus;
    }

    /**
     * Get the next available planning node instance node id
     * @returns the next available planning node instance node id
     */

  }, {
    key: 'getNextAvailablePlanningNodeId',
    value: function getNextAvailablePlanningNodeId() {
      // used to keep track of the highest planning node number we have found, which is 1-based
      var currentMaxPlanningNodeNumber = 1;

      var nodeStates = this.getNodeStates();
      if (nodeStates != null) {
        var _iteratorNormalCompletion39 = true;
        var _didIteratorError39 = false;
        var _iteratorError39 = undefined;

        try {
          for (var _iterator39 = nodeStates[Symbol.iterator](), _step39; !(_iteratorNormalCompletion39 = (_step39 = _iterator39.next()).done); _iteratorNormalCompletion39 = true) {
            var nodeState = _step39.value;

            if (nodeState != null) {
              var nodeStateNodeId = nodeState.nodeId;
              if (this.PlanningService.isPlanning(nodeStateNodeId) && nodeState.studentData != null) {
                var nodes = nodeState.studentData.nodes;
                var _iteratorNormalCompletion40 = true;
                var _didIteratorError40 = false;
                var _iteratorError40 = undefined;

                try {
                  for (var _iterator40 = nodes[Symbol.iterator](), _step40; !(_iteratorNormalCompletion40 = (_step40 = _iterator40.next()).done); _iteratorNormalCompletion40 = true) {
                    var node = _step40.value;

                    var nodeId = node.id;
                    // regex to match the planning node id e.g. planningNode2
                    var planningNodeIdRegEx = /planningNode(.*)/;

                    // run the regex on the node id
                    var result = nodeId.match(planningNodeIdRegEx);

                    if (result != null) {
                      // we have found a planning node instance node id

                      /*
                       * get the number part of the planning node instance node id
                       * e.g. if the nodeId is planningNode2, the number part
                       * would be 2
                       */
                      var planningNodeNumber = parseInt(result[1]);

                      if (planningNodeNumber > currentMaxPlanningNodeNumber) {
                        /*
                         * update the max number part if we have found a new
                         * higher number
                         */
                        currentMaxPlanningNodeNumber = planningNodeNumber;
                      }
                    }
                  }
                } catch (err) {
                  _didIteratorError40 = true;
                  _iteratorError40 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion40 && _iterator40.return) {
                      _iterator40.return();
                    }
                  } finally {
                    if (_didIteratorError40) {
                      throw _iteratorError40;
                    }
                  }
                }
              }
            }
          }
        } catch (err) {
          _didIteratorError39 = true;
          _iteratorError39 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion39 && _iterator39.return) {
              _iterator39.return();
            }
          } finally {
            if (_didIteratorError39) {
              throw _iteratorError39;
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

  }, {
    key: 'getAnnotations',
    value: function getAnnotations() {
      if (this.studentData != null && this.studentData.annotations != null) {
        return this.studentData.annotations;
      }
      return null;
    }

    /**
     * Get the latest component states for a node
     * @param nodeId get the component states for the node
     * @return an array containing the work for the node
     */

  }, {
    key: 'getLatestComponentStatesByNodeId',
    value: function getLatestComponentStatesByNodeId(nodeId) {
      var latestComponentStates = [];
      if (nodeId) {
        var studentData = this.studentData;
        if (studentData) {
          var node = this.ProjectService.getNodeById(nodeId);
          if (node != null) {
            var components = node.components;
            if (components != null) {
              var _iteratorNormalCompletion41 = true;
              var _didIteratorError41 = false;
              var _iteratorError41 = undefined;

              try {
                for (var _iterator41 = components[Symbol.iterator](), _step41; !(_iteratorNormalCompletion41 = (_step41 = _iterator41.next()).done); _iteratorNormalCompletion41 = true) {
                  var component = _step41.value;

                  if (component != null) {
                    var componentId = component.id;
                    var componentState = this.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);
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
              } catch (err) {
                _didIteratorError41 = true;
                _iteratorError41 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion41 && _iterator41.return) {
                    _iterator41.return();
                  }
                } finally {
                  if (_didIteratorError41) {
                    throw _iteratorError41;
                  }
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

  }, {
    key: 'getLatestComponentStateByNodeId',
    value: function getLatestComponentStateByNodeId(nodeId) {
      if (nodeId != null) {
        var studentData = this.studentData;
        if (studentData) {
          var componentStates = this.getComponentStatesByNodeId(nodeId);
          return componentStates[componentStates.length - 1];
        }
      }
      return null;
    }

    /**
     * Check if the completion criteria is satisfied
     * @param completionCriteria the completion criteria
     * @return whether the completion criteria was satisfied
     */

  }, {
    key: 'isCompletionCriteriaSatisfied',
    value: function isCompletionCriteriaSatisfied(completionCriteria) {
      var result = true;
      if (completionCriteria != null) {
        if (completionCriteria.inOrder) {
          // the criteria need to be satisfied in order

          var tempTimestamp = 0;
          var criteria = completionCriteria.criteria;
          var _iteratorNormalCompletion42 = true;
          var _didIteratorError42 = false;
          var _iteratorError42 = undefined;

          try {
            for (var _iterator42 = criteria[Symbol.iterator](), _step42; !(_iteratorNormalCompletion42 = (_step42 = _iterator42.next()).done); _iteratorNormalCompletion42 = true) {
              var completionCriterion = _step42.value;

              var tempResult = true;
              if (completionCriterion != null) {
                // get the function name e.g. 'isVisited', 'isSaved', 'isSubmitted'
                var functionName = completionCriterion.name;

                if (functionName == 'isSubmitted') {
                  var nodeId = completionCriterion.nodeId;
                  var componentId = completionCriterion.componentId;

                  // get the first submit component state after the timestamp
                  var tempComponentState = this.getComponentStateSubmittedAfter(nodeId, componentId, tempTimestamp);

                  if (tempComponentState == null) {
                    // we did not find a component state
                    result = false;
                    break;
                  } else {
                    // we found a component state so we will update timestamp
                    tempTimestamp = tempComponentState.serverSaveTime;
                  }
                } else if (functionName == 'isSaved') {
                  var _nodeId = completionCriterion.nodeId;
                  var _componentId2 = completionCriterion.componentId;

                  // get the first save component state after the timestamp
                  var _tempComponentState = this.getComponentStateSavedAfter(_nodeId, _componentId2, tempTimestamp);

                  if (_tempComponentState == null) {
                    // we did not find a component state
                    result = false;
                    break;
                  } else {
                    // we found a component state so we will update timestamp
                    tempTimestamp = _tempComponentState.serverSaveTime;
                  }
                } else if (functionName == 'isVisited') {
                  var _nodeId2 = completionCriterion.nodeId;

                  // get the first visit event after the timestamp
                  var tempEvent = this.getVisitEventAfter(_nodeId2, tempTimestamp);

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
          } catch (err) {
            _didIteratorError42 = true;
            _iteratorError42 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion42 && _iterator42.return) {
                _iterator42.return();
              }
            } finally {
              if (_didIteratorError42) {
                throw _iteratorError42;
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

  }, {
    key: 'getComponentStateSavedAfter',
    value: function getComponentStateSavedAfter(nodeId, componentId, timestamp) {
      var componentStates = this.studentData.componentStates;
      if (componentStates != null) {
        var _iteratorNormalCompletion43 = true;
        var _didIteratorError43 = false;
        var _iteratorError43 = undefined;

        try {
          for (var _iterator43 = componentStates[Symbol.iterator](), _step43; !(_iteratorNormalCompletion43 = (_step43 = _iterator43.next()).done); _iteratorNormalCompletion43 = true) {
            var tempComponentState = _step43.value;

            if (tempComponentState != null && tempComponentState.serverSaveTime > timestamp && tempComponentState.nodeId === nodeId && tempComponentState.componentId === componentId) {
              return tempComponentState;
            }
          }
        } catch (err) {
          _didIteratorError43 = true;
          _iteratorError43 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion43 && _iterator43.return) {
              _iterator43.return();
            }
          } finally {
            if (_didIteratorError43) {
              throw _iteratorError43;
            }
          }
        }
      }
      return null;
    }

    /**
     * Get the first submit component state after the given timestamp
     * @param nodeId the node id of the component state
     * @param componentId the component id of the component state
     * @param timestamp look for a submit component state after this timestamp
     */

  }, {
    key: 'getComponentStateSubmittedAfter',
    value: function getComponentStateSubmittedAfter(nodeId, componentId, timestamp) {
      var componentStates = this.studentData.componentStates;
      if (componentStates != null) {
        var _iteratorNormalCompletion44 = true;
        var _didIteratorError44 = false;
        var _iteratorError44 = undefined;

        try {
          for (var _iterator44 = componentStates[Symbol.iterator](), _step44; !(_iteratorNormalCompletion44 = (_step44 = _iterator44.next()).done); _iteratorNormalCompletion44 = true) {
            var tempComponentState = _step44.value;

            if (tempComponentState != null && tempComponentState.serverSaveTime > timestamp && tempComponentState.nodeId === nodeId && tempComponentState.componentId === componentId && tempComponentState.isSubmit) {
              return tempComponentState;
            }
          }
        } catch (err) {
          _didIteratorError44 = true;
          _iteratorError44 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion44 && _iterator44.return) {
              _iterator44.return();
            }
          } finally {
            if (_didIteratorError44) {
              throw _iteratorError44;
            }
          }
        }
      }
      return null;
    }

    /**
     * Get the first visit event after the timestamp
     */

  }, {
    key: 'getVisitEventAfter',
    value: function getVisitEventAfter(nodeId, timestamp) {
      var events = this.studentData.events;
      if (events != null) {
        var _iteratorNormalCompletion45 = true;
        var _didIteratorError45 = false;
        var _iteratorError45 = undefined;

        try {
          for (var _iterator45 = events[Symbol.iterator](), _step45; !(_iteratorNormalCompletion45 = (_step45 = _iterator45.next()).done); _iteratorNormalCompletion45 = true) {
            var tempEvent = _step45.value;

            if (tempEvent != null && tempEvent.serverSaveTime > timestamp && tempEvent.nodeId === nodeId && tempEvent.event === 'nodeEntered') {
              return tempEvent;
            }
          }
        } catch (err) {
          _didIteratorError45 = true;
          _iteratorError45 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion45 && _iterator45.return) {
              _iterator45.return();
            }
          } finally {
            if (_didIteratorError45) {
              throw _iteratorError45;
            }
          }
        }
      }
      return null;
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

  }, {
    key: 'getClassmateStudentWork',
    value: function getClassmateStudentWork(nodeId, componentId, showClassmateWorkSource) {
      var studentDataURL = this.ConfigService.getConfigParam('studentDataURL');
      var httpParams = {};
      httpParams.method = 'GET';
      httpParams.url = studentDataURL;

      var params = {};
      params.runId = this.ConfigService.getRunId();
      params.nodeId = nodeId;
      params.componentId = componentId;
      params.getStudentWork = true;
      params.getEvents = false;
      params.getAnnotations = false;
      params.onlyGetLatest = true;

      if (showClassmateWorkSource == 'period') {
        params.periodId = this.ConfigService.getPeriodId();
      }

      httpParams.params = params;

      return this.$http(httpParams).then(function (result) {
        var resultData = result.data;
        if (resultData != null) {
          return resultData.studentWorkList;
        }
        return [];
      });
    }

    /**
     * Get a student work from any student.
     * @param id The student work id.
     */

  }, {
    key: 'getStudentWorkById',
    value: function getStudentWorkById(id) {
      var studentDataURL = this.ConfigService.getConfigParam('studentDataURL');
      var httpParams = {};
      httpParams.method = 'GET';
      httpParams.url = studentDataURL;
      var params = {};
      params.runId = this.ConfigService.getRunId();
      params.id = id;
      params.getStudentWork = true;
      params.getEvents = false;
      params.getAnnotations = false;
      params.onlyGetLatest = true;
      httpParams.params = params;
      return this.$http(httpParams).then(function (result) {
        var resultData = result.data;
        if (resultData != null && resultData.studentWorkList.length > 0) {
          return resultData.studentWorkList[0];
        }
        return null;
      });
    }

    /**
     * Get the max possible score for the project
     * @returns the sum of the max scores for all the nodes in the project visible
     * to the current workgroup or null if none of the visible components has max scores.
     */

  }, {
    key: 'getMaxScore',
    value: function getMaxScore() {
      var maxScore = null;
      for (var p in this.nodeStatuses) {
        if (this.nodeStatuses.hasOwnProperty(p)) {
          var nodeStatus = this.nodeStatuses[p];
          var nodeId = nodeStatus.nodeId;

          if (nodeStatus.isVisible && !this.ProjectService.isGroupNode(nodeId)) {
            // node is visible and is not a group
            // get node max score
            var nodeMaxScore = this.ProjectService.getMaxScoreForNode(nodeId);

            if (nodeMaxScore) {
              // there is a max score for the node, so add to total
              // TODO geoffreykwan: trying to add to null?
              maxScore += nodeMaxScore;
            }
          }
        }
      }
      return maxScore;
    }
  }]);

  return StudentDataService;
}();

StudentDataService.$inject = ['$filter', '$http', '$injector', '$q', '$rootScope', 'AnnotationService', 'ConfigService', 'PlanningService', 'ProjectService', 'UtilService'];

exports.default = StudentDataService;
//# sourceMappingURL=studentDataService.js.map
