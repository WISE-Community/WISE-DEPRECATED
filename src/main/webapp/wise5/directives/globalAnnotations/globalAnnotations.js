"use strict";

class GlobalAnnotationsController {
    constructor($filter,
                $mdDialog,
                $rootScope,
                $scope,
                $timeout,
                AnnotationService) {

        this.$filter = $filter;
        this.$mdDialog = $mdDialog;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.AnnotationService = AnnotationService;

        this.$translate = this.$filter('translate');

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
            this.$timeout(() => {
                /* waiting slightly here to make sure the #globalMsgTrigger is
                 * shown and $mdDialog can get it's position upon opening
                 */
                this.show();
            }, 300);
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

    show() {
        //this.$translate(['itemLocked', 'ok']).then((translations) => {
            this.$mdDialog.show({
                template:
                    `<md-dialog aria-label="Global Feedback Dialog">
                        <!--<md-toolbar md-theme="light">
                            <div class="md-toolbar-tools">
                                <h2>{{ 'FEEDBACK' | translate }}</h2>
                                <span flex></span>
                                <md-button class="md-icon-button" ng-click="close()">
                                    <md-icon aria-label="Close dialog"> close </md-icon>
                                </md-button>
                            </div>
                        </md-toolbar>-->
                        <md-dialog-content class="md-dialog-content">
                            <h2 class="md-title">{{ 'FEEDBACK' | translate }}</h2>
                            <global-annotations-list></global-annotations-list>
                        </md-dialog-content>
                        <md-dialog-actions>
                            <md-button ng-click="close()" class="md-primary">
                                {{ 'CLOSE' | translate }}
                            </md-button>
                        </md-dialog-actions>
                    </md-dialog>`,
                closeTo: angular.element(document.querySelector('#globalMsgTrigger')),
                openFrom: angular.element(document.querySelector('#globalMsgTrigger')),
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
    '$filter',
    '$mdDialog',
    '$rootScope',
    '$scope',
    '$timeout',
    'AnnotationService'
];

const GlobalAnnotations = {
    bindings: {},
    template:
        `<md-button id="globalMsgTrigger"
                    class="md-fab md-fab-bottom-right animate-fade"
                    aria-label="View Messages"
                    ng-if="$ctrl.visible && !$ctrl.active" ng-click="$ctrl.show()">
            <md-icon>forum</md-icon>
            <md-tooltip md-direction="left">Feedback</md-tooltip>
        </md-button>`,
    controller: GlobalAnnotationsController
};

export default GlobalAnnotations;
