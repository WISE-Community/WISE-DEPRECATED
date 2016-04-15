"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NavItemController = function () {
    function NavItemController($scope, $element, ProjectService, StudentDataService) {
        _classCallCheck(this, NavItemController);

        this.$scope = $scope;
        this.$element = $element;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;

        this.expanded = false;

        this.item = this.ProjectService.idToNode[this.nodeId];
        this.isGroup = this.ProjectService.isGroupNode(this.nodeId);
        this.nodeStatuses = this.StudentDataService.nodeStatuses;
        this.nodeStatus = this.nodeStatuses[this.nodeId];

        this.nodeTitle = this.showPosition ? this.ProjectService.idToPosition[this.nodeId] + ': ' + this.item.title : this.item.title;
        this.currentNode = this.StudentDataService.currentNode;
        this.isCurrentNode = this.currentNode.id === this.nodeId;
        this.setNewNode = false;

        // whether this node is a planning node
        this.isPlanning = this.ProjectService.isPlanning(this.nodeId);
        this.availablePlanningNodeIds = null;

        if (this.isPlanning) {
            /*
             * planning is enabled so we will get the available planning
             * nodes that can be used in this group
             */
            this.availablePlanningNodeIds = this.ProjectService.getAvailablePlanningNodeIds(this.nodeId);
        }

        this.$scope.$watch(function () {
            return this.StudentDataService.currentNode;
        }.bind(this), function (newNode) {
            this.currentNode = newNode;
            if (this.StudentDataService.previousStep) {
                this.$scope.$parent.isPrevStep = this.nodeId === this.StudentDataService.previousStep.id;
            }
            this.isCurrentNode = this.currentNode.id === this.nodeId;
            if (this.isCurrentNode || this.ProjectService.isApplicationNode(newNode.id) || newNode.id === this.ProjectService.rootNode.id) {
                this.setExpanded();
            }
        }.bind(this));

        this.$scope.$watch(function () {
            return this.expanded;
        }.bind(this), function (value) {
            this.$scope.$parent.itemExpanded = value;
            if (value) {
                this.zoomToElement();
            }
        }.bind(this));

        this.setExpanded();
    }

    _createClass(NavItemController, [{
        key: 'getTemplateUrl',
        value: function getTemplateUrl() {
            return this.ProjectService.getThemePath() + '/themeComponents/navItem/navItem.html';
        }
    }, {
        key: 'setExpanded',
        value: function setExpanded() {
            this.$scope.expanded = this.isCurrentNode || this.$scope.isGroup && this.ProjectService.isNodeDescendentOfGroup(this.$scope.currentNode, this.$scope.item);
            if (this.$scope.expanded && this.isCurrentNode) {
                this.expanded = true;
                this.zoomToElement();
            }
        }
    }, {
        key: 'zoomToElement',
        value: function zoomToElement() {
            var _this = this;

            setTimeout(function () {
                // smooth scroll to expanded group's page location
                var location = _this.isGroup ? _this.$element[0].offsetTop - 32 : 0;
                var delay = _this.isGroup ? 350 : 0;
                $('#content').animate({
                    scrollTop: location
                }, delay, 'linear', function () {
                    if (_this.setNewNode) {
                        _this.setNewNode = false;
                        _this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(_this.nodeId);
                    }
                });
            }, 250);
        }
    }, {
        key: 'itemClicked',
        value: function itemClicked() {
            if (this.isGroup) {
                if (!this.expanded) {
                    this.setNewNode = true;
                }
                this.expanded = !this.expanded;
            } else {
                this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(this.nodeId);
            }
        }
    }, {
        key: 'addPlanningNodeInstance',


        /**
         * Create a planning node instance and add it to the project
         * @param groupId the group the new planning node instance will be added to
         * @param nodeId the node id of the planning node template
         */
        value: function addPlanningNodeInstance(groupId, nodeId) {
            // create the planning node instance
            this.ProjectService.createPlanningNodeInstance(groupId, nodeId);

            /*
             * update the node statuses so that a node status is created for
             * the new planning node instance
             */
            this.StudentDataService.updateNodeStatuses();
        }
    }]);

    return NavItemController;
}();

NavItemController.$inject = ['$scope', '$element', 'ProjectService', 'StudentDataService'];

exports.default = NavItemController;
//# sourceMappingURL=navItemController.js.map