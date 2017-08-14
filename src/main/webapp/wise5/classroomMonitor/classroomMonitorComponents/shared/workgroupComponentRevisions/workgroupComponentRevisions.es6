"use strict";

class WorkgroupComponentRevisionsController {
    constructor(ConfigService,
                TeacherDataService) {
        this.ConfigService = ConfigService;
        this.TeacherDataService = TeacherDataService;

        this.$onInit = () => {
            this.populateData();
        };
    };

    /**
     * Get the component states and annotations for this workgroup and component
     */
    populateData() {
        this.componentStates = this.TeacherDataService.getComponentStatesByWorkgroupIdAndComponentId(this.workgroupId, this.componentId);

        // create a data object that holds the componentStates and accompanying annotations, keyed by componentState id
        this.data = {};

        // add componentStates to the data object
        let c = this.componentStates.length;
        for (let i = 0; i < c; i++) {
            let componentState = this.componentStates[i];
            let id = componentState.id;
            this.data[id] = {
                clientSaveTime: this.convertToClientTimestamp(componentState.serverSaveTime),
                componentState: componentState
            };
        }
    }

    convertToClientTimestamp(time) {
        return this.ConfigService.convertToClientTimestamp(time);
    }
}

WorkgroupComponentRevisionsController.$inject = [
    'ConfigService',
    'TeacherDataService'
];

const WorkgroupComponentRevisions = {
    bindings: {
        workgroupId: '@',
        componentId: '@'
    },
    template:
        `<md-list class="component-revisions">
            <div ng-repeat="item in $ctrl.data | toArray | orderBy: '-clientSaveTime'">
                <md-list-item class="list-item md-whiteframe-1dp component-revisions__item" ng-class="{'component-revisions__item--latest': $first}">
                    <div class="md-list-item-text component-revisions__item__text" flex>
                        <h3 class="accent-2 md-body-2 gray-lightest-bg component__header">
                            #{{$ctrl.componentStates.length - $index}}
                            <span ng-if="$first"> (Latest)</span>
                        </h3>
                        <div>
                            <component component-state="{{ item.componentState }}" workgroup-id="{{ $ctrl.workgroupId }}" mode="gradingRevision">
                        </div>
                    </div>
                </md-list-item>
            </div>
        </md-list>`,
    controller: WorkgroupComponentRevisionsController
};

export default WorkgroupComponentRevisions;
