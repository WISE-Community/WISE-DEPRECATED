"use strict";

class WorkgroupComponentRevisionsController {
    constructor(moment,
                AnnotationService,
                ConfigService,
                TeacherDataService) {
        this.moment = moment;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.TeacherDataService = TeacherDataService;

        this.$onInit = () => {
            /**
             * Set a constant specifying the number of additional component
             * states to show each time more states are shown
             */
            this.increment = 5;
            this.totalShown = this.increment;
        }

        this.$onChanges = () => {
            this.populateData();
        };
    };

    /**
     * Set the revisions for this workgroup and component.
     * A component state counts as a revision if it is a submit, has an
     * annotation associated with it, or is the last component state for a node
     * visit.
     */
    populateData() {
        // create a data object that holds the revisions (by componentState id)
        this.data = {};
        this.total = 0;

        // add revisions to the data object
        if (this.componentStates) {
            this.getNodeEnteredEvents().then((result) => {
                let events = result.events;
                let nodeVisits = [];
                if (events.length) {
                    for (let event of events) {
                        nodeVisits.push(
                            {
                                serverSaveTime: event.serverSaveTime,
                                states: []
                            }
                        );
                    }
                }
                let nVisits = nodeVisits.length;

                // group all component states by node visit
                for (let cStatesIndex = this.componentStates.length-1;
                        cStatesIndex > -1; cStatesIndex--) {
                    let componentState = this.componentStates[cStatesIndex];
                    let id = componentState.id;
                    let componentSaveTime = componentState.serverSaveTime;
                    if (nVisits > 0) {
                        // add state to corresponding node visit
                        for (let nVisitsIndex = nVisits-1; nVisitsIndex > -1;
                                nVisitsIndex--) {
                            let nodeVisit = nodeVisits[nVisitsIndex];
                            let visitSaveTime = nodeVisit.serverSaveTime;
                            if (this.moment(componentSaveTime).isSameOrAfter(visitSaveTime)) {
                                nodeVisit.states.push(componentState);
                                break;
                            }
                        }
                    } else {
                        /*
                         * We don't have any node visits, so count all
                         * all states as revisions.
                         */
                        this.total++;
                        this.data[id] = {
                            clientSaveTime: this.convertToClientTimestamp(componentSaveTime),
                            componentState: componentState
                        };
                    }
                }

                // find revisions in each node visit and add to model
                for (let visitsIndex = 0; visitsIndex < nVisits; visitsIndex++) {
                    let states = nodeVisits[visitsIndex].states;
                    let nStates = states.length;

                    // check if each state is a revision
                    for (let statesIndex = 0; statesIndex < nStates; statesIndex++) {
                        let state = states[statesIndex];
                        let isRevision = false;
                        if (statesIndex === 0) {
                            /*
                             * The latest state for a visit always counts as a
                             * revision
                             */
                            isRevision = true;
                        } else if (state.isSubmit) {
                            // any submit counts as a revision
                            isRevision = true;
                        } else {
                            /*
                             * Double check to see if there is an annotation
                             * associated with the component.
                             */
                            let latestAnnotations = this.AnnotationService.getAnnotationsByStudentWorkId(state.id);
                            for (let annotation of latestAnnotations) {
                                let type = annotation.type;
                                if (type === 'score' || type === 'autoScore'
                                    || type === 'comment' || type === 'autoComment') {
                                    isRevision = true;
                                    break;
                                }
                            }
                        }
                        if (isRevision) {
                            this.total++;
                            this.data[state.id] = {
                                clientSaveTime: this.convertToClientTimestamp(state.serverSaveTime),
                                componentState: state
                            };
                        }
                    }
                }
            });
        }
    }

    /**
     * Get the nodeEntered events for this workgroup and this node
     */
    getNodeEnteredEvents() {
        let params = {
            getAnnotations: false,
            getEvents: true,
            getStudentWork: false,
            event: 'nodeEntered',
            nodeId: this.nodeId,
            workgroupId: this.workgroupId
        }
        return this.TeacherDataService.retrieveStudentData(params);
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
    'moment',
    'AnnotationService',
    'ConfigService',
    'TeacherDataService'
];

const WorkgroupComponentRevisions = {
    bindings: {
        componentStates: '<',
        nodeId: '@',
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
                            #{{$ctrl.total - $index}}
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
            <div ng-if="$ctrl.total > $ctrl.increment" class="md-padding center">
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
