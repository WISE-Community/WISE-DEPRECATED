"use strict";

class GlobalAnnotationsController {
    constructor($mdDialog,
                $rootScope,
                $scope,
                $translate,
                AnnotationService,
                StudentDataService) {
        this.$mdDialog = $mdDialog;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$translate = $translate;
        this.AnnotationService = AnnotationService;
        this.StudentDataService = StudentDataService;

        // listen for the display global annotation event
        this.$rootScope.$on('displayGlobalAnnotations', (event, args) => {
            this.show(event);
        });

        this.$scope.$on('nodeStatusesChanged', (event, args) => {
            // calculate active global annotations and group them by group name as needed
            this.AnnotationService.calculateActiveGlobalAnnoationGroups();

            // go through the global annotations and see if they can be un-globalized by checking if their criterias have been met.
            let globalAnnotationGroups = this.AnnotationService.getActiveGlobalAnnotationGroups();
            globalAnnotationGroups.map((globalAnnotationGroup) => {
                let globalAnnotations = globalAnnotationGroup.annotations;
                globalAnnotations.map((globalAnnotation) => {
                    if (globalAnnotation.data != null && globalAnnotation.data.isGlobal) {
                        let unGlobalizeConditional = globalAnnotation.data.unGlobalizeConditional;
                        let unGlobalizeCriteriaArray = globalAnnotation.data.unGlobalizeCriteria;
                        if (unGlobalizeCriteriaArray != null) {
                            if (unGlobalizeConditional === "any") {
                                // at least one criteria in unGlobalizeCriteriaArray must be satisfied in any order before un-globalizing this annotation
                                let anySatified = false;
                                for (let i = 0; i < unGlobalizeCriteriaArray.length; i++) {
                                    let unGlobalizeCriteria = unGlobalizeCriteriaArray[i];
                                    let unGlobalizeCriteriaResult = this.StudentDataService.evaluateCriteria(unGlobalizeCriteria);
                                    anySatified = anySatified || unGlobalizeCriteriaResult;
                                }
                                if (anySatified) {
                                    globalAnnotation.data.unGlobalizedTimestamp = Date.parse(new Date());  // save when criteria was satisfied
                                    this.StudentDataService.saveAnnotations([globalAnnotation]);  // save changes to server
                                }
                            } else if (unGlobalizeConditional === "all") {
                                // all criteria in unGlobalizeCriteriaArray must be satisfied in any order before un-globalizing this annotation
                                let allSatified = true;
                                for (let i = 0; i < unGlobalizeCriteriaArray.length; i++) {
                                    let unGlobalizeCriteria = unGlobalizeCriteriaArray[i];
                                    let unGlobalizeCriteriaResult = this.StudentDataService.evaluateCriteria(unGlobalizeCriteria);
                                    allSatified = allSatified && unGlobalizeCriteriaResult;
                                }
                                if (allSatified) {
                                    globalAnnotation.data.unGlobalizedTimestamp = Date.parse(new Date());  // save when criteria was satisfied
                                    this.StudentDataService.saveAnnotations([globalAnnotation]);  // save changes to server
                                }
                            }
                        }
                    }
                });
            })
        });
    };

    show($event) {
        let latestGlobalAnnotationGroup = this.getLatestGlobalAnnotationGroup();
        //this.$translate(['itemLocked', 'ok']).then((translations) => {
            this.$mdDialog.show({
                targetEvent: $event,
                template:
                    `<md-dialog aria-label="Global Feedback Dialog">
                        <md-dialog-content class="md-dialog-content">
                            <div ng-repeat="globalAnnotation in latestGlobalAnnotationGroup.annotations">
                                <div ng-if="globalAnnotation.type == 'autoScore'">Score: {{globalAnnotation.data.value}}</div>
                                <compile ng-if="globalAnnotation.type == 'autoComment'" data="globalAnnotation.data.value"></compile>
                            </div>
                        </md-dialog-content>
                        <md-dialog-actions>
                            <md-button ng-click="close()" class="md-primary">
                                Close
                            </md-button>
                        </md-dialog-actions>
                    </md-dialog>`,
                controller: GlobalAnnotationsDialogController,
                locals: {
                    latestGlobalAnnotationGroup: latestGlobalAnnotationGroup
                }
            });

            function GlobalAnnotationsDialogController($scope, $mdDialog, latestGlobalAnnotationGroup) {
                $scope.latestGlobalAnnotationGroup = latestGlobalAnnotationGroup;

                $scope.close = function() {
                    $mdDialog.hide();
                }
            }

            GlobalAnnotationsDialogController.$inject = ["$scope", "$mdDialog", "latestGlobalAnnotationGroup"];
        //})
    }

    /**
     * Return an array containing active annotations
     */
    getLatestGlobalAnnotationGroup() {
        let latest = null;

        let annotations = this.AnnotationService.getActiveGlobalAnnotationGroups();
        let total = annotations.length;

        if (total) {
            latest = annotations[total - 1];
        }

        return latest;
    }
}

GlobalAnnotationsController.$inject = [
    '$mdDialog',
    '$rootScope',
    '$scope',
    '$translate',
    'AnnotationService',
    'StudentDataService'
];

const GlobalAnnotations = {
    bindings: {},
    controller: GlobalAnnotationsController
};

export default GlobalAnnotations;
