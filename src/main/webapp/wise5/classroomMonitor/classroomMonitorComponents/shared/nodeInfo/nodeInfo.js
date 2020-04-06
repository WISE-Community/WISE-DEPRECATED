'use strict';

class NodeInfoController {
  constructor(
    $injector,
    AnnotationService,
    ProjectService,
    SummaryService,
    TeacherDataService,
    UtilService
  ) {
    this.$injector = $injector;
    this.AnnotationService = AnnotationService;
    this.ProjectService = ProjectService;
    this.SummaryService = SummaryService;
    this.TeacherDataService = TeacherDataService;
    this.UtilService = UtilService;
    this.periodId = this.TeacherDataService.getCurrentPeriod().periodId;
    this.$onInit = () => {
      this.nodeContent = this.getNodeContent();
      this.components = this.getComponents();

      this.color = this.ProjectService.getNodeIconByNodeId(this.nodeId).color;
    };
  }

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

  isResponsesSummaryAvailableForComponentType(componentType) {
    return this.SummaryService.isResponsesSummaryAvailableForComponentType(componentType);
  }

  isScoresSummaryAvailableForComponentType(componentType) {
    return this.SummaryService.isScoresSummaryAvailableForComponentType(componentType);
  }

  componentHasScoreAnnotation(componentId) {
    return this.AnnotationService.isThereAnyScoreAnnotation(
      this.nodeId,
      componentId,
      this.periodId
    );
  }

  componentHasCorrectAnswer(component) {
    const service = this.$injector.get(component.type + 'Service');
    return service.componentHasCorrectAnswer(component);
  }
}

NodeInfoController.$inject = [
  '$injector',
  'AnnotationService',
  'ProjectService',
  'SummaryService',
  'TeacherDataService',
  'UtilService'
];

const NodeInfo = {
  bindings: {
    nodeId: '@'
  },
  controller: NodeInfoController,
  template: `<md-card ng-if="$ctrl.nodeContent.rubric" class="annotations annotations--info">
            <md-card-title class="annotations__header">
                <div class="annotations__avatar md-avatar avatar--icon md-36 avatar md-whiteframe-1dp">
                    <md-icon class="annotations__icon md-36 info">info</md-icon>
                </div>
                <div class="annotations__title" layout="row" flex>
                    <span>{{ ::'STEP_INFO' | translate }}</span>
                </div>
            </md-card-title>
            <md-card-content class="annotations__body md-body-1">
                <div ng-bind-html="$ctrl.getRubricWithAssetPaths($ctrl.nodeContent.rubric)"></div>
            </md-card-content>
        </md-card>
        <md-card class="node-info node-content" style="border-color: {{ ::$ctrl.color }};">
            <md-card-content>
                <div id="component_{{::component.id}}" ng-repeat='component in ::$ctrl.components' class="component">
                    <md-divider class="divider divider--dashed" ng-if="!$first"></md-divider>
                    <h3 ng-if="component.hasWork"
                        class="accent-2 md-body-2 gray-lightest-bg
                            component__header">
                        {{ component.assessmentItemIndex + '. ' + $ctrl.getComponentTypeLabel(component.type) }}&nbsp;
                    </h3>
                    <component node-id='{{::$ctrl.nodeId}}'
                               component-id='{{::component.id}}'
                               mode='student'></component>
                    <md-card class="annotations annotations--info" ng-if="component.rubric">
                       <md-card-title class="annotations__header">
                           <div class="annotations__avatar md-avatar avatar--icon md-36 avatar md-whiteframe-1dp">
                               <md-icon class="annotations__icon md-36 info">info</md-icon>
                           </div>
                           <div class="annotations__title" layout="row" flex>
                               <span>{{ ::'ITEM_INFO' | translate }}</span>
                           </div>
                       </md-card-title>
                       <md-card-content class="annotations__body md-body-1">
                           <div ng-bind-html="$ctrl.getRubricWithAssetPaths(component.rubric)"></div>
                       </md-card-content>
                    </md-card>
                    <div ng-if='$ctrl.isResponsesSummaryAvailableForComponentType(component.type)'>
                        <summary-display ng-if='component.type === "MultipleChoice"'
                                node-id='::$ctrl.nodeId' component-id='::component.id'
                                period-id='$ctrl.periodId' student-data-type='"responses"' 
                                highlight-correct-answer='$ctrl.componentHasCorrectAnswer(component)'>
                        </summary-display>
                    </div>
                    <div ng-if='$ctrl.isScoresSummaryAvailableForComponentType(component.type) &&
                            $ctrl.componentHasScoreAnnotation(component.id)'>
                        <summary-display node-id='::$ctrl.nodeId' component-id='::component.id'
                                period-id='$ctrl.periodId' student-data-type='"scores"'>
                        </summary-display>
                    </div>
                </div>
            </md-card-content>
        </md-card>`
};

export default NodeInfo;
