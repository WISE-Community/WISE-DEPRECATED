'use strict';

import ClassroomMonitorProjectService from '../../../classroomMonitorProjectService';
import UtilService from '../../../../services/utilService';

class ComponentSelectController {
  $translate: any;
  components: any[];
  nodeId: string;
  onChange: any;
  selectedComponents: any[];

  static $inject = ['$filter', 'ProjectService', 'UtilService'];
  constructor(
    private $filter: any,
    private ProjectService: ClassroomMonitorProjectService,
    private UtilService: UtilService
  ) {
    this.$translate = this.$filter('translate');
  }

  $onInit() {
    this.selectedComponents = [];
    this.components = this.getComponents();
  }

  getNodeContent() {
    return this.ProjectService.getNodeById(this.nodeId);
  }

  getComponents() {
    let components = null;
    let nodeContent = this.getNodeContent();
    if (nodeContent) {
      components = nodeContent.components;
      if (components) {
        for (let c = 0; c < components.length; c++) {
          let component = components[c];
          component.hasWork = this.ProjectService.componentHasWork(component);
          if (component.hasWork) {
            this.selectedComponents.push(component.id);
          }
        }
      }
    }
    return components;
  }

  getComponentTypeLabel(componentType) {
    return this.UtilService.getComponentTypeLabel(componentType);
  }

  getSelectedText() {
    const nComponents = this.$filter('filter')(this.components, { hasWork: true }).length;
    return this.$translate('selectedComponentsLabel', {
      selected: this.selectedComponents.length,
      total: nComponents
    });
  }

  selectedComponentsChange() {
    const hiddenComponents = [];
    for (let i = 0; i < this.components.length; i++) {
      let component = this.components[i];
      let id = component.id;
      if (this.selectedComponents.indexOf(id) < 0) {
        hiddenComponents.push(id);
      }
    }
    this.onChange({ value: hiddenComponents });
  }
}

const ComponentSelect = {
  bindings: {
    nodeId: '@',
    onChange: '&'
  },
  template: `<md-select class="md-no-underline md-button md-raised"
                    ng-if="($ctrl.components | filter:{hasWork: true}).length > 1"
                    ng-model="$ctrl.selectedComponents"
                    ng-change="$ctrl.selectedComponentsChange()"
                    md-selected-html="$ctrl.getSelectedText()"
                    placeholder="{{ ::'assessmentItemsToShow' | translate }"
                    multiple>
            <md-optgroup label="{{ ::'assessmentItemsToShow' | translate }}">
                <md-option ng-value="component.id" ng-repeat="component in $ctrl.components | filter:{hasWork: true}">
                    {{ $index+1 }}: {{ $ctrl.getComponentTypeLabel(component.type) }}
                </md-option>
            </md-optgroup>
        </md-select>
        <md-button class="md-body-1 md-raised" aria-label="{{ ::'assessmentItemsToShow' | translate }" disabled
                   ng-if="($ctrl.components | filter:{hasWork: true}).length === 0">
            {{ ::'numberOfAssessmentItems_0' | translate }}
        </md-button>
        <md-button class="md-body-1 md-raised" aria-label="{{ ::'assessmentItemsToShow' | translate }" disabled
                   ng-if="($ctrl.components | filter:{hasWork: true}).length === 1">
            {{ ::'numberOfAssessmentItems_1' | translate }}
        </md-button>`,
  controller: ComponentSelectController
};

export default ComponentSelect;
