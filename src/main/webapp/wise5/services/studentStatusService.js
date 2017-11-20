'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StudentStatusService = function () {
  function StudentStatusService($http, AnnotationService, ConfigService, ProjectService) {
    _classCallCheck(this, StudentStatusService);

    this.$http = $http;
    this.AnnotationService = AnnotationService;
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.studentStatuses = null;
  }

  _createClass(StudentStatusService, [{
    key: 'retrieveStudentStatuses',
    value: function retrieveStudentStatuses(config) {
      var _this = this;

      var studentStatusURL = this.ConfigService.getStudentStatusURL();
      var runId = this.ConfigService.getRunId();

      var requestConfig = {
        params: {
          runId: runId
        }
      };

      return this.$http.get(studentStatusURL, requestConfig).then(function (result) {
        var studentStatuses = result.data;

        _this.studentStatuses = studentStatuses;

        return studentStatuses;
      });
    }
  }, {
    key: 'getStudentStatuses',
    value: function getStudentStatuses() {
      return this.studentStatuses;
    }
  }, {
    key: 'getCurrentNodePositionAndNodeTitleForWorkgroupId',


    /**
     * Get the current node position and title for a workgroup
     * e.g. 2.2: Newton Scooter Concepts
     * @param workgroupId the workgroup id
     * @returns the node position and title
     */
    value: function getCurrentNodePositionAndNodeTitleForWorkgroupId(workgroupId) {
      var nodePositionAndTitle = null;

      var studentStatus = this.getStudentStatusForWorkgroupId(workgroupId);

      if (studentStatus != null) {
        var currentNodeId = studentStatus.currentNodeId;
        nodePositionAndTitle = this.ProjectService.getNodePositionAndTitleByNodeId(currentNodeId);
      }

      return nodePositionAndTitle;
    }
  }, {
    key: 'getStudentStatusForWorkgroupId',
    value: function getStudentStatusForWorkgroupId(workgroupId) {

      var studentStatus = null;
      var studentStatuses = this.getStudentStatuses();

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = studentStatuses[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var tempStudentStatus = _step.value;

          if (tempStudentStatus != null) {
            var tempWorkgroupId = tempStudentStatus.workgroupId;

            if (workgroupId == tempWorkgroupId) {
              studentStatus = tempStudentStatus;
              break;
            }
          }
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

      return studentStatus;
    }
  }, {
    key: 'setStudentStatusForWorkgroupId',
    value: function setStudentStatusForWorkgroupId(workgroupId, studentStatus) {

      var studentStatuses = this.getStudentStatuses();

      for (var x = 0; x < studentStatuses.length; x++) {
        var tempStudentStatus = studentStatuses[x];

        if (tempStudentStatus != null) {
          var tempWorkgroupId = tempStudentStatus.workgroupId;

          if (workgroupId === tempWorkgroupId) {
            studentStatuses.splice(x, 1, studentStatus);
            break;
          }
        }
      }
    }
  }, {
    key: 'getStudentProjectCompletion',


    /**
     * Get the student project completion data by workgroup id
     * @param workgroupId the workgroup id
     * @param excludeNonWorkNodes boolean whether to exclude nodes without
     * @returns object with completed, total, and percent completed (integer
     * between 0 and 100)
     */
    value: function getStudentProjectCompletion(workgroupId, excludeNonWorkNodes) {
      var completion = {
        totalItems: 0,
        completedItems: 0,
        completionPct: 0
      };

      // get the student status for the workgroup
      var studentStatus = this.getStudentStatusForWorkgroupId(workgroupId);

      if (studentStatus) {
        // get the project completion object
        var projectCompletion = studentStatus.projectCompletion;

        if (projectCompletion) {
          if (excludeNonWorkNodes) {
            // we're only looking for completion of nodes with work
            var completionPctWithWork = projectCompletion.completionPctWithWork;

            if (completionPctWithWork) {
              completion.totalItems = projectCompletion.totalItemsWithWork;
              completion.completedItems = projectCompletion.completedItemsWithWork;
              completion.completionPct = projectCompletion.completionPctWithWork;
            } else {
              /*
               * we have a legacy projectCompletion object that only includes information for all nodes
               * so we need to calculate manually
               */
              completion = this.getNodeCompletion('group0', -1, workgroupId, true);
            }
          } else {
            completion = projectCompletion;
          }
        }
      }

      return completion;
    }

    /**
     * Get the workgroups on a node in the given period
     * @param nodeId the node id
     * @param periodId the period id. pass in -1 to select all periods.
     * @returns an array of workgroup ids on a node in a period
     */

  }, {
    key: 'getWorkgroupIdsOnNode',
    value: function getWorkgroupIdsOnNode(nodeId, periodId) {
      var workgroupIds = [];
      var studentStatuses = this.studentStatuses;

      // loop through all the student statuses
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = studentStatuses[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var studentStatus = _step2.value;

          if (studentStatus != null) {

            if (periodId == -1 || periodId == studentStatus.periodId) {
              // the period matches the one we are looking for
              var currentNodeId = studentStatus.currentNodeId;
              if (nodeId === currentNodeId) {
                // the node id matches the one we are looking for
                workgroupIds.push(studentStatus.workgroupId);
              } else if (this.ProjectService.isGroupNode(nodeId)) {
                var currentNode = this.ProjectService.getNodeById(currentNodeId);
                var group = this.ProjectService.getNodeById(nodeId);

                if (this.ProjectService.isNodeDescendentOfGroup(currentNode, group)) {
                  // the node id is a descendent of the group we're looking for
                  workgroupIds.push(studentStatus.workgroupId);
                }
              }
            }
          }
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

      return workgroupIds;
    }

    /**
     * Get node completion info for the given parameters
     * @param nodeId the node id
     * @param periodId the period id (pass in -1 to select all periods)
     * @param workgroupId the workgroup id to limit results to (optional)
     * @param excludeNonWorkNodes boolean whether to exclude nodes without
     * student work or not (optional)
     * @returns object with completed, total, and percent completed (integer
     * between 0 and 100).
     */

  }, {
    key: 'getNodeCompletion',
    value: function getNodeCompletion(nodeId, periodId, workgroupId, excludeNonWorkNodes) {
      var numCompleted = 0;
      var numTotal = 0;
      var isGroupNode = this.ProjectService.isGroupNode(nodeId);

      var studentStatuses = this.studentStatuses;

      // loop through all the student statuses
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = studentStatuses[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var studentStatus = _step3.value;

          if (studentStatus) {

            if (periodId == -1 || periodId == studentStatus.periodId) {
              // the period matches the one we are looking for

              if (!workgroupId || workgroupId === studentStatus.workgroupId) {
                // either no workgroupId was specified or the workgroupId matches the one we're looking for

                var nodeStatuses = studentStatus.nodeStatuses;

                if (nodeStatuses) {
                  // get the node status for the node
                  var nodeStatus = nodeStatuses[nodeId];

                  if (nodeStatus != null) {
                    if (isGroupNode) {
                      // given node is a group
                      // get progress object from the nodeStatus
                      var progress = nodeStatus.progress;

                      if (excludeNonWorkNodes) {
                        // we're looking for only nodes with student work
                        if (progress && progress.totalItemsWithWork) {
                          numTotal += progress.totalItemsWithWork;
                          numCompleted += progress.completedItemsWithWork;
                        } else {
                          /*
                           * we have a legacy nodeStatus.progress that only includes completion information for all nodes
                           * so we need to calculate manually
                           */
                          var group = this.ProjectService.getNodeById(nodeId);

                          // get all the descendants of the group
                          var descendants = this.ProjectService.getDescendentsOfGroup(group);

                          // loop through all the descendants to check for completion
                          var _iteratorNormalCompletion4 = true;
                          var _didIteratorError4 = false;
                          var _iteratorError4 = undefined;

                          try {
                            for (var _iterator4 = descendants[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                              var descendantId = _step4.value;

                              if (!this.ProjectService.isGroupNode(descendantId)) {
                                // node is not a group, so add to totals if visible and has student work
                                var descendantStatus = nodeStatuses[descendantId];

                                if (descendantStatus && descendantStatus.isVisible && this.ProjectService.nodeHasWork(descendantId)) {
                                  numTotal++;

                                  if (descendantStatus.isCompleted) {
                                    numCompleted++;
                                  }
                                }
                              }
                            }
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
                        }
                      } else {
                        // we're looking for completion percentage of all nodes
                        if (progress) {
                          numTotal += progress.totalItems;
                          numCompleted += progress.completedItems;
                        }
                      }
                    } else {
                      // given node is not a group
                      if (nodeStatus.isVisible) {
                        /*
                         * the student can see the step. we need this check
                         * for cases when a project has branching. this way
                         * we only calculate the step completion percentage
                         * based on the students that can actually go to
                         * the step.
                         */

                        /*
                         * check whether we should include the node in the calculation
                         * i.e. either includeNonWorkNodes is true or the node has student work
                         */
                        var includeNode = !excludeNonWorkNodes || this.ProjectService.nodeHasWork(nodeId);

                        if (includeNode) {
                          numTotal++;

                          if (nodeStatus.isCompleted) {
                            // the student has completed the node
                            numCompleted++;
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }

        // generate the percentage number rounded down to the nearest integer
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

      var completionPercentage = numTotal > 0 ? Math.floor(100 * numCompleted / numTotal) : 0;

      return {
        completedItems: numCompleted,
        totalItems: numTotal,
        completionPct: completionPercentage
      };
    }

    /**
     * Get the total number of steps that are descendants of a given node
     * @param nodeId the node id
     * @returns the total number of step (application node) descendants; returns
     * @param periodId the period id. pass in -1 to select all periods.
     * an average for all students in the selected period if the group is a
     * planning activity
     */
    /*getTotalApplicationNodeDescendents(nodeId, periodId) {
        let numTotal = 0;
        let numWorkgroups = 0;
         let isGroupNode = this.ProjectService.isGroupNode(nodeId);
         if (isGroupNode) {
            let isPlanning = this.ProjectService.isPlanning(nodeId);
            let studentStatuses = this.studentStatuses;
             // loop through all the student statuses
            for (let ss = 0; ss < studentStatuses.length; ss++) {
                let studentStatus = studentStatuses[ss];
                 if (studentStatus) {
                     if (periodId == -1 || periodId == studentStatus.periodId) {
                        // the period matches the one we are looking for
                         let nodeStatuses = studentStatus.nodeStatuses;
                         if (nodeStatuses) {
                            // get the node status for the node
                            let nodeStatus = nodeStatuses[nodeId];
                             if (nodeStatus) {
                                let progress = nodeStatus.progress;
                                if (progress) {
                                    let totalItems = progress.totalItems;
                                    if (totalItems) {
                                        numWorkgroups++;
                                         if (isPlanning) {
                                            numTotal += progress.totalItems;
                                        } else {
                                            // this is not a planning activity, so we can assume the total number of items is the same for all students
                                            numTotal = progress.totalItems;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
         return (numWorkgroups > 0 ? numTotal/numWorkgroups : 0);
    };*/

    /**
     * Check if there is a workgroup that is online and on the node
     * @param workgroupsOnline the workgroup ids that are online
     * @param nodeId the node id
     * @param periodId the period id. pass in -1 to select all periods.
     * @returns whether there is a workgroup that is online and on the node
     */

  }, {
    key: 'isWorkgroupOnlineOnNode',
    value: function isWorkgroupOnlineOnNode(workgroupsOnline, nodeId, periodId) {
      var result = false;

      // find workgroups online in the given period
      var workgroupsOnlineInPeriod = [];
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = workgroupsOnline[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var workgroup = _step5.value;

          var studentStatus = this.getStudentStatusForWorkgroupId(workgroup);
          if (studentStatus) {
            var pId = studentStatus.periodId;
            if (periodId == -1 || pId == periodId) {
              workgroupsOnlineInPeriod.push(workgroup);
            }
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

      if (workgroupsOnlineInPeriod.length) {
        // get workgroups on the given node
        var workgroupsOnNode = this.getWorkgroupIdsOnNode(nodeId, periodId);

        // check if any online workgroups in the current period are on this node
        result = workgroupsOnNode.some(function (w) {
          return workgroupsOnlineInPeriod.indexOf(w) > -1;
        });
      }

      return result;
    }

    /**
     * Get the average score for a node for a period
     * @param nodeId the node id
     * @param periodId the period id. pass in -1 to select all periods.
     * @returns the average score for the node for the period
     */

  }, {
    key: 'getNodeAverageScore',
    value: function getNodeAverageScore(nodeId, periodId) {
      var studentScoreSum = 0;
      var numStudentsWithScore = 0;

      var studentStatuses = this.studentStatuses;

      // loop through all the student statuses
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = studentStatuses[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var studentStatus = _step6.value;

          if (studentStatus != null) {

            if (periodId == -1 || periodId == studentStatus.periodId) {
              // the period matches the one we are looking for

              var workgroupId = studentStatus.workgroupId;

              // get the workgroups score on the node
              var score = this.AnnotationService.getScore(workgroupId, nodeId);

              if (score != null) {
                // increment the counter of students with a score for this node
                numStudentsWithScore++;

                // accumulate the sum of the scores for this node
                studentScoreSum += score;
              }
            }
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

      var averageScore = null;

      if (numStudentsWithScore != 0) {
        // calculate the average score for this node rounded down to the nearest hundredth
        averageScore = Math.floor(100 * studentScoreSum / numStudentsWithScore) / 100;
      }

      return averageScore;
    }

    /**
     * Get the max score for the project for the given workgroup id
     * @param workgroupId
     * @returns the sum of the max scores for all the nodes in the project visible
     * to the given workgroupId or null if none of the visible components has max scores.
     */

  }, {
    key: 'getMaxScoreForWorkgroupId',
    value: function getMaxScoreForWorkgroupId(workgroupId) {
      var maxScore = null;

      var studentStatus = this.getStudentStatusForWorkgroupId(workgroupId);

      if (studentStatus) {
        var nodeStatuses = studentStatus.nodeStatuses;

        if (nodeStatuses) {
          // loop through all the node statuses
          for (var p in nodeStatuses) {
            if (nodeStatuses.hasOwnProperty(p)) {
              var nodeStatus = nodeStatuses[p];
              var nodeId = nodeStatus.nodeId;

              if (nodeStatus.isVisible && !this.ProjectService.isGroupNode(nodeId)) {
                // node is visible and is not a group
                // get node max score
                var nodeMaxScore = this.ProjectService.getMaxScoreForNode(nodeId);

                if (nodeMaxScore) {
                  // there is a max score for the node, so add to total
                  maxScore += nodeMaxScore;
                }
              }
            }
          }
        }
      }

      return maxScore;
    }
  }]);

  return StudentStatusService;
}();

StudentStatusService.$inject = ['$http', 'AnnotationService', 'ConfigService', 'ProjectService'];

exports.default = StudentStatusService;
//# sourceMappingURL=studentStatusService.js.map
