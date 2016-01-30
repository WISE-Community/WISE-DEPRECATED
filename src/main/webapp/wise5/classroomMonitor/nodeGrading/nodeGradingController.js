'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NodeGradingController = function () {
    function NodeGradingController($state, $stateParams, AnnotationService, ConfigService, NodeService, ProjectService, TeacherDataService) {
        _classCallCheck(this, NodeGradingController);

        this.$state = $state;
        this.$stateParams = $stateParams;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.NodeService = NodeService;
        this.ProjectService = ProjectService;
        this.TeacherDataService = TeacherDataService;

        this.nodeId = this.$stateParams.nodeId;

        this.nodeTitle = null;

        // field that will hold the node content
        this.nodeContent = null;

        this.teacherWorkgroupId = this.ConfigService.getWorkgroupId();

        this.periods = [];

        var node = this.ProjectService.getNodeById(this.nodeId);

        if (node != null) {
            var position = this.ProjectService.getPositionById(this.nodeId);

            if (position != null) {
                this.nodeTitle = position + ' ' + node.title;
            } else {
                this.nodeTitle = node.title;
            }

            // field that will hold the node content
            this.nodeContent = node;
        }

        // render components in show student work only mode
        //this.mode = "showStudentWorkOnly";

        //var vleStates = this.TeacherDataService.getVLEStates();
        var vleStates = null;

        this.workgroupIds = this.ConfigService.getClassmateWorkgroupIds();

        this.annotationMappings = {};

        this.componentStateHistory = [];
        // initialize the periods
        this.initializePeriods();

        // scroll to the top of the page when the page loads
        document.body.scrollTop = document.documentElement.scrollTop = 0;
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
    }, {
        key: 'getComponents',

        /**
         * Get the components for this node.
         * @return an array that contains the content for the components
         */
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
    }, {
        key: 'getLatestComponentStateByWorkgroupIdAndComponentId',

        /**
         * Get the student data for a specific part
         * @param the componentId
         * @param the workgroupId id of Workgroup who created the component state
         * @return the student data for the given component
         */
        value: function getLatestComponentStateByWorkgroupIdAndComponentId(workgroupId, componentId) {
            var componentState = null;

            if (workgroupId != null && componentId != null) {
                // get the latest component state for the component
                componentState = this.TeacherDataService.getLatestComponentStateByWorkgroupIdNodeIdAndComponentId(workgroupId, this.nodeId, componentId);
            }

            return componentState;
        }
    }, {
        key: 'getLatestComponentStateByWorkgroupIdAndNodeIdAndComponentId',

        /**
         * Get the student data for a specific part
         * @param the componentId
         * @param the workgroupId id of Workgroup who created the component state
         * @return the student data for the given component
         */
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
            var userName = null;
            var userInfo = this.ConfigService.getUserInfoByWorkgroupId(workgroupId);

            if (userInfo != null) {
                userName = userInfo.userName;
            }

            return userName;
        }
    }, {
        key: 'getAnnotationByStepWorkIdAndType',
        value: function getAnnotationByStepWorkIdAndType(stepWorkId, type) {
            var annotation = this.AnnotationService.getAnnotationByStepWorkIdAndType(stepWorkId, type);
            return annotation;
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
    }, {
        key: 'getPeriodIdByWorkgroupId',

        /**
         * Get the period id for a workgroup id
         * @param workgroupId the workgroup id
         * @returns the period id for the workgroup id
         */
        value: function getPeriodIdByWorkgroupId(workgroupId) {
            return this.ConfigService.getPeriodIdByWorkgroupId(workgroupId);
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
    }]);

    return NodeGradingController;
}();

NodeGradingController.$inject = ['$state', '$stateParams', 'AnnotationService', 'ConfigService', 'NodeService', 'ProjectService', 'TeacherDataService'];

exports.default = NodeGradingController;

//# sourceMappingURL=nodeGradingController.js.map