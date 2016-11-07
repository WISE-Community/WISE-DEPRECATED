"use strict";

class GlobalAnnotationsController {
    constructor($mdDialog,
                $rootScope,
                $scope,
                $translate,
                AnnotationService) {
        this.$mdDialog = $mdDialog;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$translate = $translate;
        this.AnnotationService = AnnotationService;

        this.active = false;

        this.$onInit = () => {
            this.setModel();
        }

        // list for new annotations or updates
        this.$scope.$on('annotationSavedToServer', (event, args) => {
            this.setModel();
        });

        // listen for node status changes
        this.$rootScope.$on('nodeStatusesChanged', (event, args) => {
            this.setModel();
        });

        // listen for the display global annotation event
        this.$rootScope.$on('displayGlobalAnnotations', (event, args) => {
            this.show(event);
        });
    };

    setModel() {
        let activeGlobalAnnotationGroups = this.AnnotationService.getActiveGlobalAnnotationGroups();

        if (activeGlobalAnnotationGroups.length) {
            this.visible = true;
        } else {
            this.visible = false;
        }
    }

    show($event) {
        //this.$translate(['itemLocked', 'ok']).then((translations) => {
            this.$mdDialog.show({
                targetEvent: $event,
                template:
                    `<md-dialog aria-label="Global Feedback Dialog">
                        <!--<md-toolbar md-theme="light">
                            <div class="md-toolbar-tools">
                                <h2>Feedback</h2>
                                <span flex></span>
                                <md-button class="md-icon-button" ng-click="close()">
                                    <md-icon aria-label="Close dialog"> close </md-icon>
                                </md-button>
                            </div>
                        </md-toolbar>-->
                        <md-dialog-content class="md-dialog-content">
                            <h2 class="md-title">Feedback</h2>
                            <global-annotations-list></global-annotations-list>
                        </md-dialog-content>
                        <md-dialog-actions>
                            <md-button ng-click="close()" class="md-primary">
                                Close
                            </md-button>
                        </md-dialog-actions>
                    </md-dialog>`,
                controller: GlobalAnnotationsDialogController
            });

            function GlobalAnnotationsDialogController($scope, $mdDialog) {
                $scope.close = function() {
                    $mdDialog.hide();
                }
            }

            GlobalAnnotationsDialogController.$inject = ["$scope", "$mdDialog"];
        //})
    }
}

GlobalAnnotationsController.$inject = [
    '$mdDialog',
    '$rootScope',
    '$scope',
    '$translate',
    'AnnotationService'
];

const GlobalAnnotations = {
    bindings: {},
    template:
        `<md-button class="md-fab md-fab-bottom-right animate-fade"
                    aria-label="View Messages"
                    ng-if="$ctrl.visible && !$ctrl.active" ng-click="$ctrl.show($event)">
            <md-icon>forum</md-icon>
            <md-tooltip md-direction="left">Feedback</md-tooltip>
        </md-button>`,
    controller: GlobalAnnotationsController
};

export default GlobalAnnotations;
