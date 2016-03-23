'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NodeProgressController = function () {
    function NodeProgressController($scope, $state, ConfigService, ProjectService, StudentStatusService, TeacherDataService, TeacherWebSocketService) {
        var _this = this;

        _classCallCheck(this, NodeProgressController);

        this.$scope = $scope;
        this.$state = $state;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.StudentStatusService = StudentStatusService;
        this.TeacherDataService = TeacherDataService;
        this.TeacherWebSocketService = TeacherWebSocketService;
        this.currentGroup = null;
        this.items = null;
        this.periods = [];

        // initialize the periods
        this.initializePeriods();

        this.items = this.ProjectService.idToOrder;

        this.$scope.$on('currentNodeChanged', function (event, args) {
            var previousNode = args.previousNode;
            var currentNode = args.currentNode;
            if (previousNode != null && previousNode.type === 'group') {
                var nodeId = previousNode.id;
            }

            if (currentNode != null) {

                var currentNodeId = currentNode.id;

                if (_this.ProjectService.isGroupNode(currentNodeId)) {
                    // current node is a group

                    _this.currentGroup = currentNode;
                    _this.currentGroupId = _this.currentGroup.id;
                    _this.$scope.currentgroupid = _this.currentGroupId;
                } else if (_this.ProjectService.isApplicationNode(currentNodeId)) {
                    // current node is an application node
                    // load the step grading view
                    _this.$state.go('root.nodeGrading', { nodeId: currentNodeId });
                }
            }

            _this.$scope.$apply();
        });

        var startNodeId = this.ProjectService.getStartNodeId();
        var rootNode = this.ProjectService.getRootNode(startNodeId);

        this.currentGroup = rootNode;

        if (this.currentGroup != null) {
            this.currentGroupId = this.currentGroup.id;
            this.$scope.currentgroupid = this.currentGroupId;
        }

        var flattenedProjectNodeIds = this.ProjectService.getFlattenedProjectAsNodeIds();
        //console.log(JSON.stringify(flattenedProjectNodeIds, null, 4));

        var branches = this.ProjectService.getBranches();
    }

    _createClass(NodeProgressController, [{
        key: 'getNodeTitleByNodeId',
        value: function getNodeTitleByNodeId(nodeId) {
            return this.ProjectService.getNodeTitleByNodeId(nodeId);
        }
    }, {
        key: 'isGroupNode',
        value: function isGroupNode(nodeId) {
            return this.ProjectService.isGroupNode(nodeId);
        }
    }, {
        key: 'getNodePositionById',
        value: function getNodePositionById(nodeId) {
            return this.ProjectService.getNodePositionById(nodeId);
        }
    }, {
        key: 'initializePeriods',


        /**
         * Initialize the periods
         */
        value: function initializePeriods() {

            // create an option for all periods
            var allPeriodOption = {
                periodId: -1,
                periodName: 'All'
            };

            this.periods.push(allPeriodOption);

            this.periods = this.periods.concat(this.ConfigService.getPeriods());

            // set the current period if it hasn't been set yet
            if (this.getCurrentPeriod() == null) {
                if (this.periods != null && this.periods.length > 0) {
                    // set it to the all periods option
                    this.setCurrentPeriod(this.periods[0]);
                }
            }
        }
    }, {
        key: 'setCurrentPeriod',


        /**
         * Set the current period
         * @param period the period object
         */
        value: function setCurrentPeriod(period) {
            this.TeacherDataService.setCurrentPeriod(period);
        }
    }, {
        key: 'getCurrentPeriod',


        /**
         * Get the current period
         */
        value: function getCurrentPeriod() {
            return this.TeacherDataService.getCurrentPeriod();
        }
    }, {
        key: 'nodeClicked',
        value: function nodeClicked(nodeId) {
            this.$state.go('root.nodeGrading', { nodeId: nodeId });
        }
    }, {
        key: 'getNumberOfStudentsOnNode',


        /**
         * Get the number of students on the node
         * @param nodeId the node id
         * @returns the number of students that are on the node
         */
        value: function getNumberOfStudentsOnNode(nodeId) {
            // get the currently selected period
            var currentPeriod = this.getCurrentPeriod();
            var periodId = currentPeriod.periodId;

            // get the number of students that are on the node in the period
            var count = this.StudentStatusService.getNumberOfStudentsOnNode(nodeId, periodId);

            return count;
        }

        /**
         * Get the percentage of the class or period that has completed the node
         * @param nodeId the node id
         * @returns the percentage of the class or period that has completed the node
         */

    }, {
        key: 'getNodeCompletion',
        value: function getNodeCompletion(nodeId) {
            // get the currently selected period
            var currentPeriod = this.getCurrentPeriod();
            var periodId = currentPeriod.periodId;

            // get the percentage of the class or period that has completed the node
            var completionPercentage = this.StudentStatusService.getNodeCompletion(nodeId, periodId);

            return completionPercentage;
        }

        /**
         * Check if there are any online students on the node
         * @param nodeId the node id
         * @returns whether there are any online students on the node
         */

    }, {
        key: 'isWorkgroupOnlineOnNode',
        value: function isWorkgroupOnlineOnNode(nodeId) {
            // get the currently selected period
            var currentPeriod = this.getCurrentPeriod();
            var periodId = currentPeriod.periodId;

            // get the workgroup ids that are online
            var studentsOnline = this.TeacherWebSocketService.getStudentsOnline();

            // check if there are any online students on the node in the period
            var isOnline = this.StudentStatusService.isWorkgroupOnlineOnNode(studentsOnline, nodeId, periodId);

            return isOnline;
        }

        /**
         * Get the average score for the node
         * @param nodeId the node id
         * @returns the average score for the node
         */

    }, {
        key: 'getNodeAverageScore',
        value: function getNodeAverageScore(nodeId) {
            // get the currently selected period
            var currentPeriod = this.getCurrentPeriod();
            var periodId = currentPeriod.periodId;

            // get the max score for the node
            var nodeMaxScore = this.ProjectService.getMaxScoreForNode(nodeId);

            // get the average score for the node
            var averageScore = this.StudentStatusService.getNodeAverageScore(nodeId, periodId);

            var averageScoreDisplay = null;

            if (averageScore != null && nodeMaxScore != null) {
                // create the average score display e.g. 8/10
                averageScoreDisplay = averageScore + '/' + nodeMaxScore;
            }

            return averageScoreDisplay;
        }
    }]);

    return NodeProgressController;
}();

NodeProgressController.$inject = ['$scope', '$state', 'ConfigService', 'ProjectService', 'StudentStatusService', 'TeacherDataService', 'TeacherWebSocketService'];

exports.default = NodeProgressController;
//# sourceMappingURL=nodeProgressController.js.map