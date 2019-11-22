"use strict";

class ComponentSelectController {
    constructor($filter,
                ProjectService,
                UtilService) {
        this.$filter = $filter;
        this.ProjectService = ProjectService;
        this.UtilService = UtilService;

        this.$translate = this.$filter('translate');

        this.$onInit = () => {
            this.selectedComponents = [];
            this.components = this.getComponents();
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
     * Get the components for this node
     * @return an array that contains the content for the components
     */
    getComponents() {
        let components = null;
        let nodeContent = this.getNodeContent();

        if (nodeContent) {
            components = nodeContent.components;

            if (components) {
                for (let c = 0; c < components.length; c++) {
                    let component = components[c];

                    // set whether component captures student work (for filtering purposes)
                    component.hasWork = this.ProjectService.componentHasWork(component);

                    if (component.hasWork) {
                        // component has work, so add it to the initial selectedComponents array
                        this.selectedComponents.push(component.id);
                    }
                }
            }
        }

        return components;
    }

    /**
     * Get the component type label for the given component type
     * @param componentType string
     * @return string of the component type label
     */
    getComponentTypeLabel(componentType) {
        return this.UtilService.getComponentTypeLabel(componentType);
    }

    /**
     * Get the text to display for the select dropdown
     * @return string selected text
     */
    getSelectedText() {
        let nComponents = this.$filter('filter')(this.components, {hasWork: true}).length;
        return this.$translate('selectedComponentsLabel', { selected: this.selectedComponents.length, total: nComponents });
    }

    /**
     * Selected components have changed, so run the onChange function
     */
    selectedComponentsChange() {
        let hiddenComponents = [];

        for (let i = 0; i < this.components.length; i++) {
            let component = this.components[i];
            let id = component.id;

            if (this.selectedComponents.indexOf(id) < 0) {
                // component isn't selected for view, so add to hiddenComponents
                hiddenComponents.push(id);
            }
        }

        this.onChange({value: hiddenComponents});
    }
}

ComponentSelectController.$inject = [
    '$filter',
    'ProjectService',
    'UtilService'
];

const ComponentSelect = {
    bindings: {
        nodeId: '@',
        onChange: '&'
    },
    template:
        `<md-select class="md-no-underline md-button md-raised"
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
