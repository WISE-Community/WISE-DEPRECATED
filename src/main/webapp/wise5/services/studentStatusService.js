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
         * Get the student project completion by workgroup id
         * @param workgroupId the workgroup id
         * @returns the project completion percentage for the given workgroup
         */
        value: function getStudentProjectCompletion(workgroupId) {

            var completionPercentage = null;

            // get the student status for the workgroup
            var studentStatus = this.getStudentStatusForWorkgroupId(workgroupId);

            if (studentStatus != null) {

                if (studentStatus != null) {

                    // get the project completion object
                    var projectCompletion = studentStatus.projectCompletion;

                    if (projectCompletion != null) {
                        // get the project completion percentage
                        completionPercentage = projectCompletion.completionPct;
                    }
                }
            }

            return completionPercentage;
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
            for (var ss = 0; ss < studentStatuses.length; ss++) {
                var studentStatus = studentStatuses[ss];

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

            return workgroupIds;
        }

        /**
         * Get the percentage of the period that has completed the node
         * @param nodeId the node id
         * @param periodId the period id. pass in -1 to select all periods.
         * @param workgroupId the workgroup id to limit results to (optional)
         * @param excludeNonWorkNodes boolean whether to exclude nodes without student work or not (optional)
         * @returns the percentage of the period that has completed the node.
         * this value will be an integer between 0-100.
         */

    }, {
        key: 'getNodeCompletion',
        value: function getNodeCompletion(nodeId, periodId, workgroupId, excludeNonWorkNodes) {
            var numCompleted = 0;
            var numTotal = 0;
            var isGroupNode = this.ProjectService.isGroupNode(nodeId);

            var studentStatuses = this.studentStatuses;

            // loop through all the student statuses
            for (var ss = 0; ss < studentStatuses.length; ss++) {
                var studentStatus = studentStatuses[ss];

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
                                        if (excludeNonWorkNodes) {
                                            /* nodeStatus.progress includes completion information for all nodes;
                                             * we want only nodes that capture student work, so we need to do a custom calculation
                                             */
                                            var group = this.ProjectService.getNodeById(nodeId);

                                            // get all the descendants of the group
                                            var descendants = this.ProjectService.getDescendentsOfGroup(group);
                                            var l = descendants.length;

                                            // loop through all the descendants to check for completion
                                            for (var i = 0; i < l; i++) {
                                                var descendantId = descendants[i];

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
                                        } else {
                                            // we're looking for completion percentage of all nodes, so we can use nodeStatus.progress
                                            var progress = nodeStatus.progress;
                                            if (progress) {
                                                numTotal += progress.totalItems;
                                                numCompleted += progress.completedItems;
                                            }
                                        }
                                    } else {
                                        if (nodeStatus.isVisible) {
                                            /*
                                             * the student can see the step. we need this check
                                             * for cases when a project has branching. this way
                                             * we only calculate the step completion percentage
                                             * based on the students that can actually go to
                                             * the step.
                                             */

                                            // check whether we should include the node in the calculation
                                            // i.e. either includeNonWorkNodes is true or the node has student work
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

            /*
             * generate the percentage number rounded down to the nearest integer.
             * the value will be between 0-100
             */
            var completionPercentage = numTotal > 0 ? Math.floor(100 * numCompleted / numTotal) : 0;

            return completionPercentage;
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
            var n = workgroupsOnline.length;
            for (var i = 0; i < n; i++) {
                var workgroup = workgroupsOnline[i];
                var studentStatus = this.getStudentStatusForWorkgroupId(workgroup);
                if (studentStatus) {
                    var pId = studentStatus.periodId;
                    if (periodId == -1 || pId == periodId) {
                        workgroupsOnlineInPeriod.push(workgroup);
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
    }]);

    return StudentStatusService;
}();

StudentStatusService.$inject = ['$http', 'AnnotationService', 'ConfigService', 'ProjectService'];

exports.default = StudentStatusService;
//# sourceMappingURL=studentStatusService.js.map