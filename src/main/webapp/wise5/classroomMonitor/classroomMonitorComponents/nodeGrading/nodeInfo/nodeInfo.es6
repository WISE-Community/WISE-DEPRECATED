"use strict";

class NodeInfoController {
    constructor(ProjectService) {
        this.ProjectService = ProjectService;

        this.$onInit = () => {
            this.nodeContent = this.getNodeContent();
            this.components = this.getComponents();

            this.color = this.ProjectService.getNodeIconByNodeId(this.nodeId).color;
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
     * Get the components for this node with student work.
     * @return an array that contains the content for the components
     */
    getComponents() {
        let components = null;

        if (this.nodeContent) {
            components = this.nodeContent.components;

            for (let c = 0; c < components.length; c++) {
                let component = components[c];

                if (this.isDisabled) {
                    component.isDisabled = true;
                }

                if (this.nodeContent.lockAfterSubmit) {
                    component.lockAfterSubmit = true;
                }

                component.hasWork = this.ProjectService.componentHasWork(component);
            }
        }

        return components;
    }
}

NodeInfoController.$inject = [
    'ProjectService'
];

const NodeInfo = {
    bindings: {
        nodeId: '@',
    },
    controller: NodeInfoController,
    template:
        `<md-card class="node-info node-content" style="border-color: {{ $ctrl.color }};">
            <md-card-content>
                <div ng-if="$ctrl.nodeContent.rubric">
                    <md-card class="annotations annotations--node-info">
                        <md-card-title class="annotations__header gray-darker-bg">
                            <div class="annotations__avatar md-avatar avatar--icon md-36 avatar md-whiteframe-1dp">
                                <md-icon class="annotations__icon md-36">check</md-icon>
                            </div>
                            <div class="annotations__title" layout="row" flex>
                                <span>{{ 'teachingTips' | translate }}</span>
                            </div>
                        </md-card-title>
                        <md-card-content class="annotations__body md-body-1">
                            <div ng-bind-html="$ctrl.nodeContent.rubric"></div>
                        </md-card-content>
                    </md-card>
                    <md-divider class="divider divider--dashed"></md-divider>
                </div>
                <div id="{{component.id}}"
                     class="component-section"
                     ng-repeat='component in $ctrl.components'>
                    <md-divider class="divider divider--dashed" ng-if="!$first"></md-divider>
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
                    <md-card class="annotations annotations--node-info" ng-if="component.rubric">
                       <md-card-title class="annotations__header gray-darker-bg">
                           <div class="annotations__avatar md-avatar avatar--icon md-36 avatar md-whiteframe-1dp">
                               <md-icon class="annotations__icon md-36">check</md-icon>
                           </div>
                           <div class="annotations__title" layout="row" flex>
                               <span>{{ 'itemInfo' | translate }}</span>
                           </div>
                       </md-card-title>
                       <md-card-content class="annotations__body md-body-1">
                           <div ng-bind-html="component.rubric"></div>
                       </md-card-content>
                    </md-card>
                </div>
            </md-card-content>
        </md-card>`
};

export default NodeInfo;
