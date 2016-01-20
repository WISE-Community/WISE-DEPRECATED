'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NodeProgressController = function () {
    function NodeProgressController($scope, $state, ConfigService, ProjectService, TeacherDataService) {
        _classCallCheck(this, NodeProgressController);

        this.$scope = $scope;
        this.$state = $state;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.TeacherDataService = TeacherDataService;
        this.title = 'Grade By Step';
        this.currentGroup = null;
        this.items = null;
        this.periods = [];

        // initialize the periods
        this.initializePeriods();

        this.items = this.ProjectService.idToOrder;

        this.$scope.$on('currentNodeChanged', angular.bind(this, function (event, args) {
            var previousNode = args.previousNode;
            var currentNode = args.currentNode;
            if (previousNode != null && previousNode.type === 'group') {
                var nodeId = previousNode.id;
            }

            if (currentNode != null) {

                var currentNodeId = currentNode.id;

                if (this.ProjectService.isGroupNode(currentNodeId)) {
                    // current node is a group

                    this.currentGroup = currentNode;
                    this.currentGroupId = this.currentGroup.id;
                    this.$scope.currentgroupid = this.currentGroupId;
                } else if (this.ProjectService.isApplicationNode(currentNodeId)) {
                    // current node is an application node
                    // load the step grading view
                    this.$state.go('root.nodeGrading', { nodeId: currentNodeId });
                }
            }

            this.$scope.$apply();
        }));

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
    }]);

    return NodeProgressController;
}();

NodeProgressController.$inject = ['$scope', '$state', 'ConfigService', 'ProjectService', 'TeacherDataService'];

exports.default = NodeProgressController;
//# sourceMappingURL=nodeProgressController.js.map