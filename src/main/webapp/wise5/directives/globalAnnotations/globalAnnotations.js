"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GlobalAnnotationsController = function () {
    function GlobalAnnotationsController($mdDialog, $rootScope, $scope, $timeout, $translate, AnnotationService) {
        var _this = this;

        _classCallCheck(this, GlobalAnnotationsController);

        this.$mdDialog = $mdDialog;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.$translate = $translate;
        this.AnnotationService = AnnotationService;

        this.active = false;

        this.$onInit = function () {
            _this.setModel();
        };

        // list for new annotations or updates
        this.$scope.$on('annotationSavedToServer', function (event, args) {
            _this.setModel();
        });

        // listen for node status changes
        this.$rootScope.$on('nodeStatusesChanged', function (event, args) {
            _this.setModel();
        });

        // listen for the display global annotation event
        this.$rootScope.$on('displayGlobalAnnotations', function (event, args) {
            _this.$timeout(function () {
                /* waiting slightly here to make sure the #globalMsgTrigger is
                 * shown and $mdDialog can get it's position upon opening
                 */
                _this.show();
            }, 300);
        });
    }

    _createClass(GlobalAnnotationsController, [{
        key: 'setModel',
        value: function setModel() {
            var activeGlobalAnnotationGroups = this.AnnotationService.getActiveGlobalAnnotationGroups();

            if (activeGlobalAnnotationGroups.length) {
                this.visible = true;
            } else {
                this.visible = false;
            }
        }
    }, {
        key: 'show',
        value: function show() {
            //this.$translate(['itemLocked', 'ok']).then((translations) => {
            this.$mdDialog.show({
                template: '<md-dialog aria-label="Global Feedback Dialog">\n                        <!--<md-toolbar md-theme="light">\n                            <div class="md-toolbar-tools">\n                                <h2>Feedback</h2>\n                                <span flex></span>\n                                <md-button class="md-icon-button" ng-click="close()">\n                                    <md-icon aria-label="Close dialog"> close </md-icon>\n                                </md-button>\n                            </div>\n                        </md-toolbar>-->\n                        <md-dialog-content class="md-dialog-content">\n                            <h2 class="md-title">{{ \'FEEDBACK\' | translate }}</h2>\n                            <global-annotations-list></global-annotations-list>\n                        </md-dialog-content>\n                        <md-dialog-actions>\n                            <md-button ng-click="close()" class="md-primary">\n                                {{ \'CLOSE\' | translate }}\n                            </md-button>\n                        </md-dialog-actions>\n                    </md-dialog>',
                closeTo: angular.element(document.querySelector('#globalMsgTrigger')),
                openFrom: angular.element(document.querySelector('#globalMsgTrigger')),
                controller: GlobalAnnotationsDialogController
            });

            function GlobalAnnotationsDialogController($scope, $mdDialog) {
                $scope.close = function () {
                    $mdDialog.hide();
                };
            }

            GlobalAnnotationsDialogController.$inject = ["$scope", "$mdDialog"];
            //})
        }
    }]);

    return GlobalAnnotationsController;
}();

GlobalAnnotationsController.$inject = ['$mdDialog', '$rootScope', '$scope', '$timeout', '$translate', 'AnnotationService'];

var GlobalAnnotations = {
    bindings: {},
    template: '<md-button id="globalMsgTrigger"\n                    class="md-fab md-fab-bottom-right animate-fade"\n                    aria-label="View Messages"\n                    ng-if="$ctrl.visible && !$ctrl.active" ng-click="$ctrl.show()">\n            <md-icon>forum</md-icon>\n            <md-tooltip md-direction="left">Feedback</md-tooltip>\n        </md-button>',
    controller: GlobalAnnotationsController
};

exports.default = GlobalAnnotations;
//# sourceMappingURL=globalAnnotations.js.map