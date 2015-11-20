define(['app'], function(app) {

    app
    .$controllerProvider
    .register('NodeGradingController', ['$state', '$stateParams', 'AnnotationService', 'ConfigService', 'NodeService', 'ProjectService', 'StudentDataService', 'StudentStatusService', 'TeacherDataService',
                                            function ($state, $stateParams, AnnotationService, ConfigService, NodeService, ProjectService, StudentDataService, StudentStatusService, TeacherDataService) {
        // the node id of the current node
        this.nodeId = $stateParams.nodeId;

        this.title = 'Node Grading: ' + this.nodeId;

        // field that will hold the node content
        this.nodeContent = ProjectService.getNodeContentByNodeId(this.nodeId);

        // render components in show student work only mode
        this.mode = "showStudentWorkOnly";

        var vleStates = TeacherDataService.getVLEStates();
        
        this.workgroupIds = ConfigService.getClassmateWorkgroupIds();
        
        this.annotationMappings = {};

        /**
         * Get the html template for the component
         * @param componentType the component type
         * @return the path to the html template for the component
         */
        this.getComponentTypeHTML = function(componentType) {
            return NodeService.getComponentTypeHTML(componentType);
        };

        /**
         * Get the components for this node.
         * @return an array that contains the content for the components
         */
        this.getComponents = function() {
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

        /**
         * Get the student data for a specific part
         * @param the componentId
         * @param the workgroupId id of Workgroup who created the component state
         * @return the student data for the given component
         */
        this.getComponentStateByWorkgroupIdAndComponentId = function(workgroupId,  componentId) {
            var componentState = null;

            if (componentId != null) {

                // get the latest component state for the component
                componentState = TeacherDataService.getLatestComponentStateByWorkgroupIdNodeIdAndComponentId(workgroupId, this.nodeId, componentId);
            }

            return componentState;
        };

        this.getNodeVisitsByWorkgroupIdAndNodeId = function(workgroupId, nodeId) {
            var nodeVisits = TeacherDataService.getNodeVisitsByWorkgroupIdAndNodeId(workgroupId, nodeId);
            
            AnnotationService.populateAnnotationMappings(this.annotationMappings, workgroupId, nodeVisits);
            
            return nodeVisits;
        };
        
        this.getUserNameByWorkgroupId = function(workgroupId) {
            var userName = null;
            var userInfo = ConfigService.getUserInfoByWorkgroupId(workgroupId);
            
            if (userInfo != null) {
                userName = userInfo.userName;
            }
            
            return userName;
        };
        
        this.getAnnotationByStepWorkIdAndType = function(stepWorkId, type) {
            var annotation = AnnotationService.getAnnotationByStepWorkIdAndType(stepWorkId, type);
            return annotation;
        };
        
        this.scoreChanged = function(stepWorkId) {
            var annotation = this.annotationMappings[stepWorkId + '-score'];
            AnnotationService.saveAnnotation(annotation);
        };
        
        this.commentChanged = function(stepWorkId) {
            var annotation = this.annotationMappings[stepWorkId + '-comment'];
            AnnotationService.saveAnnotation(annotation);
        }
    }]);
    
});