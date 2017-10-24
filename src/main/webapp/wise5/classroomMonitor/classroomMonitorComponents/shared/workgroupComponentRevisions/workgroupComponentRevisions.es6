"use strict";

class WorkgroupComponentRevisionsController {
    constructor(ConfigService,
                TeacherDataService) {
        this.ConfigService = ConfigService;
        this.TeacherDataService = TeacherDataService;

        this.$onInit = () => {
            this.populateData();

            /**
             * Set a constant specifying the number of additional component
             * states to show each time more states are shown
             */
            this.increment = 5;
            this.totalShown = this.increment;
        };
    };

    /**
     * Get the component states and annotations for this workgroup and component
     */
    populateData() {
        // create a data object that holds the componentStates and accompanying annotations, keyed by componentState id
        this.data = {};

        // add componentStates to the data object
        if (this.componentStates) {
            for (let i = 0; i < this.componentStates.length; i++) {
                let componentState = this.componentStates[i];
                let id = componentState.id;
                this.data[id] = {
                    clientSaveTime: this.convertToClientTimestamp(componentState.serverSaveTime),
                    componentState: componentState
                };
            }
        }
    }

    convertToClientTimestamp(time) {
        return this.ConfigService.convertToClientTimestamp(time);
    }

    /**
     * Increase the number of component states shown by 5
     */
    showMore() {
        this.totalShown += this.increment;
    }

    /**
     * The show more element has come into or out of view
     * @param inview whether the element is in view or not
     */
    moreInView(inview) {
        if (inview && this.totalShown > this.increment) {
            // automatically show more component states
            this.showMore();
        }
    }
}

WorkgroupComponentRevisionsController.$inject = [
    'ConfigService',
    'TeacherDataService'
];

const WorkgroupComponentRevisions = {
    bindings: {
        componentStates: '<',
        workgroupId: '@'
    },
    template:
        `<md-list class="component-revisions">
            <div ng-repeat="item in $ctrl.data | toArray | orderBy: '-clientSaveTime'"
                 ng-if="$index < $ctrl.totalShown">
                <md-list-item class="list-item md-whiteframe-1dp component-revisions__item"
                              ng-class="{'component-revisions__item--latest': $first}">
                    <div class="md-list-item-text component-revisions__item__text"
                         flex>
                        <h3 class="accent-2 md-body-2 gray-lightest-bg component__header">
                            #{{$ctrl.componentStates.length - $index}}
                            <span ng-if="$first"> (Latest)</span>
                        </h3>
                        <div>
                            <component component-state="{{ item.componentState }}"
                                       workgroup-id="{{ $ctrl.workgroupId }}"
                                       mode="gradingRevision">
                        </div>
                    </div>
                </md-list-item>
            </div>
            <div ng-if="$ctrl.totalShown > $ctrl.increment"
                 in-view="$ctrl.moreInView($inview)"></div>
            <div class="md-padding center">
                <md-button class="md-raised"
                           ng-if="$ctrl.totalShown <= $ctrl.increment"
                           ng-click="$ctrl.showMore()"
                           translate="SHOW_MORE">
                </md-button>
            </div>
        </md-list>`,
    controller: WorkgroupComponentRevisionsController
};

export default WorkgroupComponentRevisions;
