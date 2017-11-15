class StudentStatusService {
  constructor($http,
              AnnotationService,
              ConfigService,
              ProjectService) {
    this.$http = $http;
    this.AnnotationService = AnnotationService;
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.studentStatuses = null;
  }

  retrieveStudentStatuses(config) {
    var studentStatusURL = this.ConfigService.getStudentStatusURL();
    var runId = this.ConfigService.getRunId();

    var requestConfig = {
      params: {
        runId: runId
      }
    };

    return this.$http.get(studentStatusURL, requestConfig).then((result) => {
      var studentStatuses = result.data;

      this.studentStatuses = studentStatuses;

      return studentStatuses;
    });
  };

  getStudentStatuses() {
    return this.studentStatuses;
  };

  /**
   * Get the current node position and title for a workgroup
   * e.g. 2.2: Newton Scooter Concepts
   * @param workgroupId the workgroup id
   * @returns the node position and title
   */
  getCurrentNodePositionAndNodeTitleForWorkgroupId(workgroupId) {
    var nodePositionAndTitle = null;

    var studentStatus = this.getStudentStatusForWorkgroupId(workgroupId);

    if(studentStatus != null) {
      var currentNodeId = studentStatus.currentNodeId;
      nodePositionAndTitle = this.ProjectService.getNodePositionAndTitleByNodeId(currentNodeId);
    }

    return nodePositionAndTitle;
  };

  getStudentStatusForWorkgroupId(workgroupId) {

    var studentStatus = null;
    var studentStatuses = this.getStudentStatuses();

    for (var x = 0; x < studentStatuses.length; x++) {
      var tempStudentStatus = studentStatuses[x];

      if (tempStudentStatus != null) {
        var tempWorkgroupId = tempStudentStatus.workgroupId;

        if (workgroupId == tempWorkgroupId) {
          studentStatus = tempStudentStatus;
          break;
        }
      }
    }

    return studentStatus;
  };

  setStudentStatusForWorkgroupId(workgroupId, studentStatus) {

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
  };

  /**
   * Get the student project completion data by workgroup id
   * @param workgroupId the workgroup id
   * @param excludeNonWorkNodes boolean whether to exclude nodes without
   * @returns object with completed, total, and percent completed (integer
   * between 0 and 100)
   */
  getStudentProjectCompletion(workgroupId, excludeNonWorkNodes) {
    let completion = {
      totalItems: 0,
      completedItems: 0,
      completionPct: 0
    };

    // get the student status for the workgroup
    let studentStatus = this.getStudentStatusForWorkgroupId(workgroupId);

    if (studentStatus) {
      // get the project completion object
      let projectCompletion = studentStatus.projectCompletion;

      if (projectCompletion) {
        if (excludeNonWorkNodes) {
          // we're only looking for completion of nodes with work
          let completionPctWithWork = projectCompletion.completionPctWithWork;

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
  getWorkgroupIdsOnNode(nodeId, periodId) {
    let workgroupIds = [];
    let studentStatuses = this.studentStatuses;

    // loop through all the student statuses
    for (var ss = 0; ss < studentStatuses.length; ss++) {
      var studentStatus = studentStatuses[ss];

      if (studentStatus != null) {

        if (periodId == -1 || periodId == studentStatus.periodId) {
          // the period matches the one we are looking for
          let currentNodeId = studentStatus.currentNodeId;
          if (nodeId === currentNodeId) {
            // the node id matches the one we are looking for
            workgroupIds.push(studentStatus.workgroupId);
          } else if (this.ProjectService.isGroupNode(nodeId)) {
            let currentNode = this.ProjectService.getNodeById(currentNodeId);
            let group = this.ProjectService.getNodeById(nodeId);

            if (this.ProjectService.isNodeDescendentOfGroup(currentNode, group)) {
              // the node id is a descendent of the group we're looking for
              workgroupIds.push(studentStatus.workgroupId);
            }
          }
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
  getNodeCompletion(nodeId, periodId, workgroupId, excludeNonWorkNodes) {
    let numCompleted = 0;
    let numTotal = 0;
    let isGroupNode = this.ProjectService.isGroupNode(nodeId);

    let studentStatuses = this.studentStatuses;

    // loop through all the student statuses
    for (let ss = 0; ss < studentStatuses.length; ss++) {
      let studentStatus = studentStatuses[ss];

      if (studentStatus) {

        if (periodId == -1 || periodId == studentStatus.periodId) {
          // the period matches the one we are looking for

          if (!workgroupId || workgroupId === studentStatus.workgroupId) {
            // either no workgroupId was specified or the workgroupId matches the one we're looking for

            let nodeStatuses = studentStatus.nodeStatuses;

            if (nodeStatuses) {
              // get the node status for the node
              let nodeStatus = nodeStatuses[nodeId];

              if (nodeStatus != null) {
                if (isGroupNode) {
                  // given node is a group
                  // get progress object from the nodeStatus
                  let progress = nodeStatus.progress;

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
                      let group = this.ProjectService.getNodeById(nodeId);

                      // get all the descendants of the group
                      let descendants = this.ProjectService.getDescendentsOfGroup(group);
                      let l = descendants.length;

                      // loop through all the descendants to check for completion
                      for (let i = 0; i < l; i++) {
                        let descendantId = descendants[i];

                        if (!this.ProjectService.isGroupNode(descendantId)) {
                          // node is not a group, so add to totals if visible and has student work
                          let descendantStatus = nodeStatuses[descendantId];

                          if (descendantStatus && descendantStatus.isVisible && this.ProjectService.nodeHasWork(descendantId)) {
                            numTotal++;

                            if (descendantStatus.isCompleted) {
                              numCompleted++;
                            }
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
                    let includeNode = !excludeNonWorkNodes || this.ProjectService.nodeHasWork(nodeId);

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
    let completionPercentage = (numTotal > 0 ? Math.floor(100 * numCompleted / numTotal) : 0);

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
  isWorkgroupOnlineOnNode(workgroupsOnline, nodeId, periodId) {
    let result = false;

    // find workgroups online in the given period
    let workgroupsOnlineInPeriod = [];
    let n = workgroupsOnline.length;
    for (let i = 0; i < n; i++) {
      let workgroup = workgroupsOnline[i];
      let studentStatus = this.getStudentStatusForWorkgroupId(workgroup);
      if (studentStatus) {
        let pId = studentStatus.periodId;
        if (periodId == -1 || pId == periodId) {
          workgroupsOnlineInPeriod.push(workgroup);
        }
      }
    }

    if (workgroupsOnlineInPeriod.length) {
      // get workgroups on the given node
      let workgroupsOnNode = this.getWorkgroupIdsOnNode(nodeId, periodId);

      // check if any online workgroups in the current period are on this node
      result = workgroupsOnNode.some(w => {
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
  getNodeAverageScore(nodeId, periodId) {
    var studentScoreSum = 0;
    var numStudentsWithScore = 0;

    var studentStatuses = this.studentStatuses;

    // loop through all the student statuses
    for (var ss = 0; ss < studentStatuses.length; ss++) {
      var studentStatus = studentStatuses[ss];

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
  getMaxScoreForWorkgroupId(workgroupId) {
    let maxScore = null;

    let studentStatus = this.getStudentStatusForWorkgroupId(workgroupId);

    if (studentStatus) {
      let nodeStatuses = studentStatus.nodeStatuses;

      if (nodeStatuses) {
        // loop through all the node statuses
        for (var p in nodeStatuses) {
          if (nodeStatuses.hasOwnProperty(p)) {
            let nodeStatus = nodeStatuses[p];
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
      }
    }

    return maxScore;
  }
}

StudentStatusService.$inject = [
  '$http',
  'AnnotationService',
  'ConfigService',
  'ProjectService'
];

export default StudentStatusService;
