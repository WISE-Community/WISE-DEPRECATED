'use strict';

define(['app'], function (app) {

    app.$controllerProvider.register('NodeGradingController', ['$state', '$stateParams', 'AnnotationService', 'ConfigService', 'NodeService', 'ProjectService', 'StudentDataService', 'StudentStatusService', 'TeacherDataService', function ($state, $stateParams, AnnotationService, ConfigService, NodeService, ProjectService, StudentDataService, StudentStatusService, TeacherDataService) {

        this.nodeId = $stateParams.nodeId;

        this.nodeTitle = null;

        // field that will hold the node content
        this.nodeContent = null;

        this.teacherWorkgroupId = ConfigService.getWorkgroupId();

        this.periods = [];

        var node = ProjectService.getNodeById(this.nodeId);

        if (node != null) {
            var position = ProjectService.getPositionById(this.nodeId);

            if (position != null) {
                this.nodeTitle = position + ' ' + node.title;
            } else {
                this.nodeTitle = node.title;
            }

            // field that will hold the node content
            this.nodeContent = node.content;
        }

        // render components in show student work only mode
        //this.mode = "showStudentWorkOnly";

        //var vleStates = TeacherDataService.getVLEStates();
        var vleStates = null;

        this.workgroupIds = ConfigService.getClassmateWorkgroupIds();

        this.annotationMappings = {};

        this.componentStateHistory = [];

        /**
         * Get the html template for the component
         * @param componentType the component type
         * @return the path to the html template for the component
         */
        this.getComponentTemplatePath = function (componentType) {
            return NodeService.getComponentTemplatePath(componentType);
        };

        /**
         * Get the components for this node.
         * @return an array that contains the content for the components
         */
        this.getComponents = function () {
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
        };

        this.getComponentById = function (componentId) {
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
        };

        /**
         * Get the student data for a specific part
         * @param the componentId
         * @param the workgroupId id of Workgroup who created the component state
         * @return the student data for the given component
         */
        this.getLatestComponentStateByWorkgroupIdAndComponentId = function (workgroupId, componentId) {
            var componentState = null;

            if (workgroupId != null && componentId != null) {
                // get the latest component state for the component
                componentState = TeacherDataService.getLatestComponentStateByWorkgroupIdNodeIdAndComponentId(workgroupId, this.nodeId, componentId);
            }

            return componentState;
        };

        /**
         * Get the student data for a specific part
         * @param the componentId
         * @param the workgroupId id of Workgroup who created the component state
         * @return the student data for the given component
         */
        this.getLatestComponentStateByWorkgroupIdAndNodeIdAndComponentId = function (workgroupId, nodeId, componentId) {
            var componentState = null;

            if (workgroupId != null && nodeId != null && componentId != null) {

                // get the latest component state for the component
                componentState = TeacherDataService.getLatestComponentStateByWorkgroupIdNodeIdAndComponentId(workgroupId, nodeId, componentId);
            }

            return componentState;
        };

        this.getComponentStatesByWorkgroupIdAndNodeId = function (workgroupId, nodeId) {
            var componentStates = TeacherDataService.getComponentStatesByWorkgroupIdAndNodeId(workgroupId, nodeId);

            //AnnotationService.populateAnnotationMappings(this.annotationMappings, workgroupId, componentStates);

            return componentStates;
        };

        this.getUserNameByWorkgroupId = function (workgroupId) {
            var userName = null;
            var userInfo = ConfigService.getUserInfoByWorkgroupId(workgroupId);

            if (userInfo != null) {
                userName = userInfo.userName;
            }

            return userName;
        };

        this.getAnnotationByStepWorkIdAndType = function (stepWorkId, type) {
            var annotation = AnnotationService.getAnnotationByStepWorkIdAndType(stepWorkId, type);
            return annotation;
        };

        this.scoreChanged = function (stepWorkId) {
            var annotation = this.annotationMappings[stepWorkId + '-score'];
            AnnotationService.saveAnnotation(annotation);
        };

        this.commentChanged = function (stepWorkId) {
            var annotation = this.annotationMappings[stepWorkId + '-comment'];
            AnnotationService.saveAnnotation(annotation);
        };

        this.setupComponentStateHistory = function () {
            this.getComponentStatesByWorkgroupIdAndNodeId();
        };

        /**
         * Get the period id for a workgroup id
         * @param workgroupId the workgroup id
         * @returns the period id for the workgroup id
         */
        this.getPeriodIdByWorkgroupId = function (workgroupId) {
            return ConfigService.getPeriodIdByWorkgroupId(workgroupId);
        };

        /**
         * Initialize the periods
         */
        this.initializePeriods = function () {

            // create an option for all periods
            var allPeriodOption = {
                periodId: -1,
                periodName: 'All'
            };

            this.periods.push(allPeriodOption);

            this.periods = this.periods.concat(ConfigService.getPeriods());

            // set the current period if it hasn't been set yet
            if (this.getCurrentPeriod() == null) {
                if (this.periods != null && this.periods.length > 0) {
                    // set it to the all periods option
                    this.setCurrentPeriod(this.periods[0]);
                }
            }
        };

        /**
         * Set the current period
         * @param period the period object
         */
        this.setCurrentPeriod = function (period) {
            TeacherDataService.setCurrentPeriod(period);
        };

        /**
         * Get the current period
         */
        this.getCurrentPeriod = function () {
            return TeacherDataService.getCurrentPeriod();
        };

        // initialize the periods
        this.initializePeriods();

        // scroll to the top of the page when the page loads
        document.body.scrollTop = document.documentElement.scrollTop = 0;
    }]);
});