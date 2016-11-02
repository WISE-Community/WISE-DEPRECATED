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

        let workgroupAnnotations = this.TeacherDataService.getAnnotationsToWorkgroupId(this.workgroupId);
        let annotations = workgroupAnnotations.filter((annotation) => {
            return annotation.toWorkgroupId === this.workgroupId;
        });

        // create a data object that holds the componentStates and accompanying annotations, keyed by componentState id
        this.data = {};

        // add componentStates to the data object
        let c = this.componentStates.length;
        for (let i = 0; i < c; i++) {
            let componentState = this.componentStates[i];
            let id = componentState.id;
            this.data[id] = {
                time: componentState.serverSaveTime,
                componentState: componentState,
                annotations: []
            };
        }

        // add annotations to the data object
        let a = annotations.length;
        for (let x = 0; x < a; x++) {
            let annotation = annotations[x];
            let id = annotation.studentWorkId;
            if (id && this.data[id]) {
                this.data[id].annotations.push(annotation);
            }
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
        workgroupId: '<',
        componentId: '@',
        maxScore: '<'
    },
    template:
        `<div class="component-revisions" ng-repeat="item in $ctrl.data | toArray | orderBy: '-time'">
            <md-card>
                <md-card-content>
                    <div class="md-card-title">
                        Version {{$ctrl.componentStates.length - $index}}
                        <span ng-if="$first"> (Latest Work)</span>
                    </div>
                    <div>
                        <component component-state="{{item.componentState}}" mode="onlyShowWork">
                    </div>
                    <div>
                        <div ng-repeat="annotation in item.annotations | orderBy: '-serverSaveTime'">
                            <div ng-if="annotation.type === 'comment'">
                                Teacher Comment: {{annotation.data.value}}
                            </div>
                            <div ng-if="annotation.type === 'autoComment'">
                                Auto Comment:
                                <compile data="annotation.data.value"></compile>
                            </div>
                            <div ng-if="annotation.type === 'score'">
                                Teacher Score: {{annotation.data.value}}/{{$ctrl.maxScore}}
                            </div>
                            <div ng-if="annotation.type === 'autoScore'">
                                Auto Score: {{annotation.data.value}}/{{$ctrl.maxScore}}
                            </div>
                        </div>
                    </div>
                </md-card-content>
            </md-card>
            <md-divider ng-if="$first" class="component-revisions__divider"></md-divider>
        </div>`,
    controller: WorkgroupComponentRevisionsController
};

export default WorkgroupComponentRevisions;
