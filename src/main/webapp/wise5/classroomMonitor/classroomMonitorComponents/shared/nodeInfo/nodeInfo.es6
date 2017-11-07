"use strict";

class NodeInfoController {
    constructor(ProjectService,
                UtilService) {
        this.ProjectService = ProjectService;
        this.UtilService = UtilService;

        this.$onInit = () => {
            this.nodeContent = this.getNodeContent();
            this.components = this.getComponents();

            this.color = this.ProjectService.getNodeIconByNodeId(this.nodeId).color;
        };
    };

    /**
     * Get the content for this node
     * @return object with the node content
     */
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
     * Get the components for this node with student work.
     * @return array that contains the content for the components
     */
    getComponents() {
        let components = null;

        if (this.nodeContent) {
            components = this.nodeContent.components;
            let assessmentItemIndex = 0;

            for (let c = 0; c < components.length; c++) {
                let component = components[c];

                if (this.isDisabled) {
                    component.isDisabled = true;
                }

                if (this.nodeContent.lockAfterSubmit) {
                    component.lockAfterSubmit = true;
                }

                component.hasWork = this.ProjectService.componentHasWork(component);
                if (component.hasWork) {
                    assessmentItemIndex++;
                    component.assessmentItemIndex = assessmentItemIndex;
                }
            }
        }

        return components;
    }

    /**
     * Get a rubric with the wise asset paths replaced
     * @param rubric string
     * @return string containing rubric html content
     */
    getRubricWithAssetPaths(rubric) {
        return this.ProjectService.replaceAssetPaths(rubric);
    }

    /**
     * Get the component type label for the given component type
     * @param componentType string
     * @return string of the component type label
     */
    getComponentTypeLabel(componentType) {
        return this.UtilService.getComponentTypeLabel(componentType);
    }
}

NodeInfoController.$inject = [
    'ProjectService',
    'UtilService'
];

const NodeInfo = {
    bindings: {
        nodeId: '@',
    },
    controller: NodeInfoController,
    template:
        `<md-card ng-if="$ctrl.nodeContent.rubric" class="annotations annotations--info">
            <md-card-title class="annotations__header">
                <div class="annotations__avatar md-avatar avatar--icon md-36 avatar md-whiteframe-1dp">
                    <md-icon class="annotations__icon md-36 info">info</md-icon>
                </div>
                <div class="annotations__title" layout="row" flex>
                    <span>{{ 'STEP_INFO' | translate }}</span>
                </div>
            </md-card-title>
            <md-card-content class="annotations__body md-body-1">
                <div ng-bind-html="$ctrl.getRubricWithAssetPaths($ctrl.nodeContent.rubric)"></div>
            </md-card-content>
        </md-card>
        <md-card class="node-info node-content" style="border-color: {{ $ctrl.color }};">
            <md-card-content>
                <div id="component_{{component.id}}" ng-repeat='component in $ctrl.components' class="component">
                    <md-divider class="divider divider--dashed" ng-if="!$first"></md-divider>
                    <h3 ng-if="component.hasWork"
                        class="accent-2 md-body-2 gray-lightest-bg
                            component__header">
                        {{ component.assessmentItemIndex + '. ' + $ctrl.getComponentTypeLabel(component.type) }}&nbsp;
                    </h3>
                    <component ng-if='component.showPreviousWorkNodeId != null && component.showPreviousWorkComponentId != null && component.showPreviousWorkNodeId != "" && component.showPreviousWorkComponentId != ""'
                               node-id='{{component.showPreviousWorkNodeId}}'
                               component-id='{{component.showPreviousWorkComponentId}}'
                               original-node-id={{$ctrl.nodeId}}
                               original-component-id={{component.id}}
                               mode='student'></component>
                    <component ng-if='component.showPreviousWorkNodeId == null || component.showPreviousWorkComponentId == null || component.showPreviousWorkNodeId == "" || component.showPreviousWorkComponentId == ""'
                               node-id='{{$ctrl.nodeId}}'
                               component-id='{{component.id}}'
                               mode='student'></component>
                    <md-card class="annotations annotations--info" ng-if="component.rubric">
                       <md-card-title class="annotations__header">
                           <div class="annotations__avatar md-avatar avatar--icon md-36 avatar md-whiteframe-1dp">
                               <md-icon class="annotations__icon md-36 info">info</md-icon>
                           </div>
                           <div class="annotations__title" layout="row" flex>
                               <span>{{ 'ITEM_INFO' | translate }}</span>
                           </div>
                       </md-card-title>
                       <md-card-content class="annotations__body md-body-1">
                           <div ng-bind-html="$ctrl.getRubricWithAssetPaths(component.rubric)"></div>
                       </md-card-content>
                    </md-card>
                </div>
            </md-card-content>
        </md-card>`
};

export default NodeInfo;
