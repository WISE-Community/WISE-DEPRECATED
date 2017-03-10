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
        };

        this.$onChanges = (changesObj) => {
            if (changesObj.hiddenComponents) {
                this.hiddenComponents = changesObj.hiddenComponents.currentValue;
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
     * Get the student data for a specific component
     * @param the componentId
     * @param the workgroupId id of Workgroup who created the component state
     * @return the student data for the given component
     */
    getLatestComponentStateByWorkgroupIdAndComponentId(workgroupId, componentId) {
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

    isComponentVisible(componentId) {
        let result = true;

        let index = this.hiddenComponents.indexOf(componentId);
        if (index > -1) {
            result = false;
        }

        return result;
    }

    toggleComponentVisibility($event, componentId) {
        let index = this.hiddenComponents.indexOf(componentId);
        if (index > -1) {
            this.hiddenComponents.splice(index, 1);
        } else {
            this.hiddenComponents.push(componentId);
        }

        this.onUpdate({value: this.hiddenComponents, event: $event});
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
        visibleComponents: '<',
        hiddenComponents: '<',
        onUpdate: '&'
    },
    template:
        `<div class="nav-item__grading md-whiteframe-1dp">
            <div id="{{component.id}}_{{$ctrl.workgroupId}}" class="component--grading" ng-repeat='component in $ctrl.components'>
                <div ng-if="$ctrl.components.length > 1" layout="row" layout-align="end center">
                    <md-button ng-click="$ctrl.toggleComponentVisibility($event, component.id)"
                               class="component--grading__toggle transform--none"
                               flex="100"
                               ng-class="{'component--grading__toggle--hidden':!$ctrl.isComponentVisible(component.id)}"
                               aria-label="{{$ctrl.isComponentVisible(component.id) ? ('hideSection'|translate) : ('showSection'|translate)}}"
                               title="{{$ctrl.isComponentVisible(component.id) ? ('hideSection'|translate) : ('showSection'|translate)}}">
                        <md-icon ng-if="$ctrl.isComponentVisible(component.id)">expand_less</md-icon>
                        <md-icon ng-if="!$ctrl.isComponentVisible(component.id)">expand_more</md-icon>
                    </md-button>
                </div>
                <component ng-if='component.showPreviousWorkNodeId != null && component.showPreviousWorkComponentId != null && component.showPreviousWorkNodeId != "" && component.showPreviousWorkComponentId != ""'
                           ng-show="$ctrl.isComponentVisible(component.id)"
                           class="component-container"
                           node-id='{{component.showPreviousWorkNodeId}}'
                           component-id='{{component.showPreviousWorkComponentId}}'
                           component-state='{{$ctrl.getLatestComponentStateByWorkgroupIdAndNodeIdAndComponentId($ctrl.workgroupId, component.showPreviousWorkNodeId, component.showPreviousWorkComponentId)}}'
                           workgroup-id='{{$ctrl.workgroupId}}'
                           teacher-workgroup-id='{{$ctrl.teacherWorkgroupId}}'
                           mode='grading'></component>
                <component ng-if='component.showPreviousWorkNodeId == null || component.showPreviousWorkComponentId == null || component.showPreviousWorkNodeId == "" || component.showPreviousWorkComponentId == ""'
                           ng-show="$ctrl.isComponentVisible(component.id)"
                           class="component-container"
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
