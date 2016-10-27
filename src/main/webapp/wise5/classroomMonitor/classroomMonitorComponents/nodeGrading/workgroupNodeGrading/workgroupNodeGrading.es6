"use strict";

class WorkgroupNodeGradingController {
    constructor(ConfigService,
                ProjectService,
                TeacherDataService) {
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.TeacherDataService = TeacherDataService;

        this.$onInit = () => {
            this.nodeContent = this.getNodeContent();
            this.components = this.getComponents();
            this.teacherWorkgroupId = this.ConfigService.getWorkgroupId();
            this.latestWork = this.latestWorkTime;
        };

        this.$onChanges = (changesObj) => {
            if (changesObj.latestWorkTime) {
                this.latestWork = this.convertToClientTimestamp(changesObj.latestWorkTime.currentValue);
            }
        };
    };

    getNodeContent() {
        let result = null;

        let node = this.ProjectService.getNodeById(this.nodeId);
        if (node != null) {
            // field that will hold the node content
            result = node;
        }

        return result;
    }

    /**
     * Get the components for this node.
     * @return an array that contains the content for the components
     */
    getComponents() {
        let components = null;

        if (this.nodeContent) {
            components = this.nodeContent.components;
        }

        if (components && this.isDisabled) {
            for (var c = 0; c < components.length; c++) {
                var component = components[c];

                component.isDisabled = true;
            }
        }

        if (components && this.nodeContent.lockAfterSubmit) {
            for (c = 0; c < components.length; c++) {
                component = components[c];

                component.lockAfterSubmit = true;
            }
        }

        return components;
    }

    /**
     * Get the student data for a specific part
     * @param the componentId
     * @param the workgroupId id of Workgroup who created the component state
     * @return the student data for the given component
     */
    getLatestComponentStateByWorkgroupIdAndComponentId(workgroupId,  componentId) {
        let componentState = null;

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
    getLatestComponentStateByWorkgroupIdAndNodeIdAndComponentId(workgroupId, nodeId, componentId) {
        let componentState = null;

        if (workgroupId != null && nodeId != null && componentId != null) {

            // get the latest component state for the component
            componentState = this.TeacherDataService.getLatestComponentStateByWorkgroupIdNodeIdAndComponentId(workgroupId, nodeId, componentId);
        }

        return componentState;
    }

    convertToClientTimestamp(time) {
        return this.ConfigService.convertToClientTimestamp(time);
    }
}

WorkgroupNodeGradingController.$inject = [
    'ConfigService',
    'ProjectService',
    'TeacherDataService'
];

const WorkgroupNodeGrading = {
    bindings: {
        workgroupId: '<',
        nodeId: '@',
        latestWorkTime: '<'
    },
    template:
        `<div class="nav-item__grading md-whiteframe-1dp">
            <!--<div class="nav-item__grading__info md-body-1 accent-2">
                <span ng-if="$ctrl.latestWork">
                    <span translate="latestWork"></span>&nbsp;<span class="nav-item__grading__timestamp" am-time-ago="$ctrl.latestWork"></span>
                    <md-tooltip md-direction="right">{{ $ctrl.latestWork | amDateFormat:'ddd, MMM D YYYY, h:mm a' }}</md-tooltip>
                </span>
                <span ng-if="!$ctrl.latestWork" translate="teamNoWorkSubmitted"></span>
            </div>-->
            <div id="{{component.id}}_{{$ctrl.workgroupId}}" class="component--grading" ng-repeat='component in $ctrl.components'>
                <component ng-if='component.showPreviousWorkNodeId != null && component.showPreviousWorkComponentId != null && component.showPreviousWorkNodeId != "" && component.showPreviousWorkComponentId != ""'
                           node-id='{{component.showPreviousWorkNodeId}}'
                           component-id='{{component.showPreviousWorkComponentId}}'
                           component-state='{{$ctrl.getLatestComponentStateByWorkgroupIdAndNodeIdAndComponentId($ctrl.workgroupId, component.showPreviousWorkNodeId, component.showPreviousWorkComponentId)}}'
                           workgroup-id='{{$ctrl.workgroupId}}'
                           teacher-workgroup-id='{{$ctrl.teacherWorkgroupId}}'
                           mode='grading'></component>
                <component ng-if='component.showPreviousWorkNodeId == null || component.showPreviousWorkComponentId == null || component.showPreviousWorkNodeId == "" || component.showPreviousWorkComponentId == ""'
                           node-id='{{$ctrl.nodeId}}'
                           component-id='{{component.id}}'
                           component-state='{{$ctrl.getLatestComponentStateByWorkgroupIdAndComponentId($ctrl.workgroupId, component.id)}}'
                           workgroup-id='{{$ctrl.workgroupId}}'
                           teacher-workgroup-id='{{$ctrl.teacherWorkgroupId}}'
                           mode='grading'></component>

            </div>
        </div>`,
    controller: WorkgroupNodeGradingController
};

export default WorkgroupNodeGrading;
