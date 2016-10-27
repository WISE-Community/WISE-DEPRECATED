'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NodeGradingController = function () {
    function NodeGradingController($filter, $state, $stateParams, AnnotationService, ConfigService, NodeService, ProjectService, StudentStatusService, TeacherDataService) {
        var _this = this;

        _classCallCheck(this, NodeGradingController);

        this.$filter = $filter;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.NodeService = NodeService;
        this.ProjectService = ProjectService;
        this.StudentStatusService = StudentStatusService;
        this.TeacherDataService = TeacherDataService;

        this.nodeId = this.$stateParams.nodeId;

        // the max score for the node
        this.maxScore = this.ProjectService.getMaxScoreForNode(this.nodeId);
        this.hasMaxScore = typeof this.maxScore === 'number';

        // TODO: add loading indicator
        this.TeacherDataService.retrieveStudentDataByNodeId(this.nodeId).then(function (result) {

            // field that will hold the node content
            _this.nodeContent = null;

            _this.teacherWorkgroupId = _this.ConfigService.getWorkgroupId();

            _this.periods = [];

            var node = _this.ProjectService.getNodeById(_this.nodeId);

            if (node != null) {

                // field that will hold the node content
                _this.nodeContent = node;
            }

            _this.workgroupIds = _this.ConfigService.getClassmateWorkgroupIds();

            _this.canViewStudentNames = true;
            _this.canGradeStudentWork = true;

            // get the role of the teacher for the run e.g. 'owner', 'write', 'read'
            var role = _this.ConfigService.getTeacherRole(_this.teacherWorkgroupId);

            if (role === 'owner') {
                // the teacher is the owner of the run and has full access
                _this.canViewStudentNames = true;
                _this.canGradeStudentWork = true;
            } else if (role === 'write') {
                // the teacher is a shared teacher that can grade the student work
                _this.canViewStudentNames = true;
                _this.canGradeStudentWork = true;
            } else if (role === 'read') {
                // the teacher is a shared teacher that can only view the student work
                _this.canViewStudentNames = false;
                _this.canGradeStudentWork = false;
            }

            _this.annotationMappings = {};

            _this.componentStateHistory = [];

            // scroll to the top of the page when the page loads
            document.body.scrollTop = document.documentElement.scrollTop = 0;
        });
    }

    /**
     * Get the html template for the component
     * @param componentType the component type
     * @return the path to the html template for the component
     */


    _createClass(NodeGradingController, [{
        key: 'getComponentTemplatePath',
        value: function getComponentTemplatePath(componentType) {
            return this.NodeService.getComponentTemplatePath(componentType);
        }

        /**
         * Get the components for this node.
         * @return an array that contains the content for the components
         */

    }, {
        key: 'getComponents',
        value: function getComponents() {
            var components = null;

            if (this.nodeContent != null) {
                components = this.nodeContent.components;
            }

            if (components != null && this.isDisabled) {
                for (var c = 0; c < components.length; c++) {
                    var component = components[c];

                    component.isDisabled = true;
                }
            }

            if (components != null && this.nodeContent.lockAfterSubmit) {
                for (c = 0; c < components.length; c++) {
                    component = components[c];

                    component.lockAfterSubmit = true;
                }
            }

            return components;
        }
    }, {
        key: 'getComponentById',
        value: function getComponentById(componentId) {
            var component = null;

            if (componentId != null) {
                var components = this.getComponents();

                if (components != null) {
                    for (var c = 0; c < components.length; c++) {
                        var tempComponent = components[c];

                        if (tempComponent != null) {
                            if (componentId === tempComponent.id) {
                                component = tempComponent;
                                break;
                            }
                        }
                    }
                }
            }

            return component;
        }

        /**
         * Get the student data for a specific part
         * @param the componentId
         * @param the workgroupId id of Workgroup who created the component state
         * @return the student data for the given component
         */

    }, {
        key: 'getLatestComponentStateByWorkgroupIdAndComponentId',
        value: function getLatestComponentStateByWorkgroupIdAndComponentId(workgroupId, componentId) {
            var componentState = null;

            if (workgroupId != null && componentId != null) {
                // get the latest component state for the component
                componentState = this.TeacherDataService.getLatestComponentStateByWorkgroupIdNodeIdAndComponentId(workgroupId, this.nodeId, componentId);
            }

            return componentState;
        }

        /**
         * Get the student data for a specific part
         * @param the componentId
         * @param the workgroupId id of Workgroup who created the component state
         * @return the student data for the given component
         */

    }, {
        key: 'getLatestComponentStateByWorkgroupIdAndNodeIdAndComponentId',
        value: function getLatestComponentStateByWorkgroupIdAndNodeIdAndComponentId(workgroupId, nodeId, componentId) {
            var componentState = null;

            if (workgroupId != null && nodeId != null && componentId != null) {

                // get the latest component state for the component
                componentState = this.TeacherDataService.getLatestComponentStateByWorkgroupIdNodeIdAndComponentId(workgroupId, nodeId, componentId);
            }

            return componentState;
        }
    }, {
        key: 'getComponentStatesByWorkgroupIdAndNodeId',
        value: function getComponentStatesByWorkgroupIdAndNodeId(workgroupId, nodeId) {
            var componentStates = this.TeacherDataService.getComponentStatesByWorkgroupIdAndNodeId(workgroupId, nodeId);

            //AnnotationService.populateAnnotationMappings(this.annotationMappings, workgroupId, componentStates);

            return componentStates;
        }
    }, {
        key: 'getUserNameByWorkgroupId',
        value: function getUserNameByWorkgroupId(workgroupId) {
            return this.ConfigService.getUserNameByWorkgroupId(workgroupId);
        }
    }, {
        key: 'getAnnotationByStepWorkIdAndType',
        value: function getAnnotationByStepWorkIdAndType(stepWorkId, type) {
            return this.AnnotationService.getAnnotationByStepWorkIdAndType(stepWorkId, type);
        }
    }, {
        key: 'getNodeScoreByWorkgroupIdAndNodeId',
        value: function getNodeScoreByWorkgroupIdAndNodeId(workgroupId, nodeId) {
            var score = this.AnnotationService.getScore(workgroupId, nodeId);
            return typeof score === 'number' ? score : '-';
        }
    }, {
        key: 'scoreChanged',
        value: function scoreChanged(stepWorkId) {
            var annotation = this.annotationMappings[stepWorkId + '-score'];
            this.AnnotationService.saveAnnotation(annotation);
        }
    }, {
        key: 'commentChanged',
        value: function commentChanged(stepWorkId) {
            var annotation = this.annotationMappings[stepWorkId + '-comment'];
            this.AnnotationService.saveAnnotation(annotation);
        }
    }, {
        key: 'setupComponentStateHistory',
        value: function setupComponentStateHistory() {
            this.getComponentStatesByWorkgroupIdAndNodeId();
        }

        /**
         * Get the period id for a workgroup id
         * @param workgroupId the workgroup id
         * @returns the period id for the workgroup id
         */

    }, {
        key: 'getPeriodIdByWorkgroupId',
        value: function getPeriodIdByWorkgroupId(workgroupId) {
            return this.ConfigService.getPeriodIdByWorkgroupId(workgroupId);
        }

        /**
         * Get the current period
         */

    }, {
        key: 'getCurrentPeriod',
        value: function getCurrentPeriod() {
            return this.TeacherDataService.getCurrentPeriod();
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
         * Get the average score for the node
         * @param nodeId the node id
         * @returns the average score for the node
         */

    }, {
        key: 'getNodeAverageScore',
        value: function getNodeAverageScore() {
            // get the currently selected period
            var currentPeriod = this.TeacherDataService.getCurrentPeriod();
            var periodId = currentPeriod.periodId;

            // get the average score for the node
            var averageScore = this.StudentStatusService.getNodeAverageScore(this.nodeId, periodId);

            return averageScore === null ? 'N/A' : this.$filter('number')(averageScore, 1);
        }

        /**
         * Checks whether a workgroup is in the current period
         * @param workgroupId the workgroupId to look for
         * @returns boolean whether the workgroup is in the current period
         */

    }, {
        key: 'isWorkgroupInCurrentPeriod',
        value: function isWorkgroupInCurrentPeriod(workgroupId) {
            return this.getCurrentPeriod().periodName === "All" || this.getPeriodIdByWorkgroupId(workgroupId) === this.getCurrentPeriod().periodId;
        }
    }]);

    return NodeGradingController;
}();

NodeGradingController.$inject = ['$filter', '$state', '$stateParams', 'AnnotationService', 'ConfigService', 'NodeService', 'ProjectService', 'StudentStatusService', 'TeacherDataService'];

exports.default = NodeGradingController;
//# sourceMappingURL=nodeGradingController.js.map