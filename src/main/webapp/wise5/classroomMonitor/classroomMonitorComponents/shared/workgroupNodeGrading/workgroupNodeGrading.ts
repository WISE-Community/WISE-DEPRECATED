'use strict';

import { ConfigService } from '../../../../services/configService';
import { TeacherDataService } from '../../../../services/teacherDataService';
import { UtilService } from '../../../../services/utilService';
import { TeacherProjectService } from '../../../../services/teacherProjectService';

class WorkgroupNodeGradingController {
  components: any;
  hiddenComponents: any;
  isDisabled: boolean;
  nodeContent: any;
  nodeId: string;
  teacherWorkgroupId: number;

  static $inject = ['ConfigService', 'ProjectService', 'TeacherDataService', 'UtilService'];

  constructor(
    private ConfigService: ConfigService,
    private ProjectService: TeacherProjectService,
    private TeacherDataService: TeacherDataService,
    private UtilService: UtilService
  ) {
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.TeacherDataService = TeacherDataService;
    this.UtilService = UtilService;
  }

  $onInit() {
    this.nodeContent = this.getNodeContent();
    this.components = this.getComponents().filter((component) => {
      return this.ProjectService.componentHasWork(component);
    });
    this.teacherWorkgroupId = this.ConfigService.getWorkgroupId();
  }

  $onChanges(changesObj) {
    if (changesObj.hiddenComponents) {
      this.hiddenComponents = changesObj.hiddenComponents.currentValue;
    }
  }

  getNodeContent() {
    let result = null;
    let node = this.ProjectService.getNodeById(this.nodeId);
    if (node != null) {
      result = node;
    }
    return result;
  }

  getComponents() {
    let components = null;
    if (this.nodeContent) {
      components = this.nodeContent.components;
      for (let c = 0; c < components.length; c++) {
        let component = components[c];
        if (this.isDisabled) {
          component.isDisabled = true;
        }
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
      componentState = this.TeacherDataService.getLatestComponentStateByWorkgroupIdNodeIdAndComponentId(
        workgroupId,
        this.nodeId,
        componentId
      );
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
      componentState = this.TeacherDataService.getLatestComponentStateByWorkgroupIdNodeIdAndComponentId(
        workgroupId,
        nodeId,
        componentId
      );
    }
    return componentState;
  }

  convertToClientTimestamp(time) {
    return this.ConfigService.convertToClientTimestamp(time);
  }

  isComponentVisible(componentId) {
    if (this.hiddenComponents != null) {
      return !this.hiddenComponents.includes(componentId);
    }
    return true;
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

const WorkgroupNodeGrading = {
  bindings: {
    workgroupId: '<',
    nodeId: '@',
    hiddenComponents: '<'
  },
  template: `<div class="grading__item">
            <div id="component_{{::component.id}}_{{::$ctrl.workgroupId}}" class="component component--grading" ng-repeat='component in $ctrl.components'>
                <div ng-show="$ctrl.isComponentVisible(component.id)">
                    <h3 class="accent-1 md-body-2 gray-lightest-bg component__header">
                        {{ $index+1 + '. ' + $ctrl.getComponentTypeLabel(component.type) }}&nbsp;
                        <component-new-work-badge [component-id]="component.id"
                                                  [workgroup-id]="$ctrl.workgroupId"
                                                  [node-id]="$ctrl.nodeId"></component-new-work-badge>
                    </h3>
                    <component class="component-container"
                               node-id='{{::$ctrl.nodeId}}'
                               component-id='{{::component.id}}'
                               component-state='{{$ctrl.getLatestComponentStateByWorkgroupIdAndComponentId($ctrl.workgroupId, component.id)}}'
                               workgroup-id='::$ctrl.workgroupId'
                               teacher-workgroup-id='::$ctrl.teacherWorkgroupId'
                               mode='grading'></component>
                </div>
            </div>
        </div>`,
  controller: WorkgroupNodeGradingController
};

export default WorkgroupNodeGrading;
