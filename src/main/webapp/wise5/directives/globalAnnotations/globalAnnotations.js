"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GlobalAnnotationsController = function () {
    function GlobalAnnotationsController($mdDialog, $rootScope, $scope, $translate, AnnotationService, StudentDataService) {
        var _this = this;

        _classCallCheck(this, GlobalAnnotationsController);

        this.$mdDialog = $mdDialog;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$translate = $translate;
        this.AnnotationService = AnnotationService;
        this.StudentDataService = StudentDataService;

        // listen for the display global annotation event
        this.$rootScope.$on('displayGlobalAnnotations', function (event, args) {
            _this.show(event);
        });

        this.$scope.$on('nodeStatusesChanged', function (event, args) {
            // calculate active global annotations and group them by group name as needed
            _this.AnnotationService.calculateActiveGlobalAnnoationGroups();

            // go through the global annotations and see if they can be un-globalized by checking if their criterias have been met.
            var globalAnnotationGroups = _this.AnnotationService.getActiveGlobalAnnotationGroups();
            globalAnnotationGroups.map(function (globalAnnotationGroup) {
                var globalAnnotations = globalAnnotationGroup.annotations;
                globalAnnotations.map(function (globalAnnotation) {
                    if (globalAnnotation.data != null && globalAnnotation.data.isGlobal) {
                        var unGlobalizeConditional = globalAnnotation.data.unGlobalizeConditional;
                        var unGlobalizeCriteriaArray = globalAnnotation.data.unGlobalizeCriteria;
                        if (unGlobalizeCriteriaArray != null) {
                            if (unGlobalizeConditional === "any") {
                                // at least one criteria in unGlobalizeCriteriaArray must be satisfied in any order before un-globalizing this annotation
                                var anySatified = false;
                                for (var i = 0; i < unGlobalizeCriteriaArray.length; i++) {
                                    var unGlobalizeCriteria = unGlobalizeCriteriaArray[i];
                                    var unGlobalizeCriteriaResult = _this.StudentDataService.evaluateCriteria(unGlobalizeCriteria);
                                    anySatified = anySatified || unGlobalizeCriteriaResult;
                                }
                                if (anySatified) {
                                    globalAnnotation.data.unGlobalizedTimestamp = Date.parse(new Date()); // save when criteria was satisfied
                                    _this.StudentDataService.saveAnnotations([globalAnnotation]); // save changes to server
                                }
                            } else if (unGlobalizeConditional === "all") {
                                // all criteria in unGlobalizeCriteriaArray must be satisfied in any order before un-globalizing this annotation
                                var allSatified = true;
                                for (var _i = 0; _i < unGlobalizeCriteriaArray.length; _i++) {
                                    var _unGlobalizeCriteria = unGlobalizeCriteriaArray[_i];
                                    var _unGlobalizeCriteriaResult = _this.StudentDataService.evaluateCriteria(_unGlobalizeCriteria);
                                    allSatified = allSatified && _unGlobalizeCriteriaResult;
                                }
                                if (allSatified) {
                                    globalAnnotation.data.unGlobalizedTimestamp = Date.parse(new Date()); // save when criteria was satisfied
                                    _this.StudentDataService.saveAnnotations([globalAnnotation]); // save changes to server
                                }
                            }
                        }
                    }
                });
            });
        });
    }

    _createClass(GlobalAnnotationsController, [{
        key: 'show',
        value: function show($event) {
            var latestGlobalAnnotationGroup = this.getLatestGlobalAnnotationGroup();
            //this.$translate(['itemLocked', 'ok']).then((translations) => {
            this.$mdDialog.show({
                targetEvent: $event,
                template: '<md-dialog aria-label="Global Feedback Dialog">\n                        <md-dialog-content class="md-dialog-content">\n                            <div ng-repeat="globalAnnotation in latestGlobalAnnotationGroup.annotations">\n                                <div ng-if="globalAnnotation.type == \'autoScore\'">Score: {{globalAnnotation.data.value}}</div>\n                                <compile ng-if="globalAnnotation.type == \'autoComment\'" data="globalAnnotation.data.value"></compile>\n                            </div>\n                        </md-dialog-content>\n                        <md-dialog-actions>\n                            <md-button ng-click="close()" class="md-primary">\n                                Close\n                            </md-button>\n                        </md-dialog-actions>\n                    </md-dialog>',
                controller: GlobalAnnotationsDialogController,
                locals: {
                    latestGlobalAnnotationGroup: latestGlobalAnnotationGroup
                }
            });

            function GlobalAnnotationsDialogController($scope, $mdDialog, latestGlobalAnnotationGroup) {
                $scope.latestGlobalAnnotationGroup = latestGlobalAnnotationGroup;

                $scope.close = function () {
                    $mdDialog.hide();
                };
            }

            GlobalAnnotationsDialogController.$inject = ["$scope", "$mdDialog", "latestGlobalAnnotationGroup"];
            //})
        }

        /**
         * Return an array containing active annotations
         */

    }, {
        key: 'getLatestGlobalAnnotationGroup',
        value: function getLatestGlobalAnnotationGroup() {
            var latest = null;

            var annotations = this.AnnotationService.getActiveGlobalAnnotationGroups();
            var total = annotations.length;

            if (total) {
                latest = annotations[total - 1];
            }

            return latest;
        }
    }]);

    return GlobalAnnotationsController;
}();

GlobalAnnotationsController.$inject = ['$mdDialog', '$rootScope', '$scope', '$translate', 'AnnotationService', 'StudentDataService'];

var GlobalAnnotations = {
    bindings: {},
    controller: GlobalAnnotationsController
};

exports.default = GlobalAnnotations;
//# sourceMappingURL=globalAnnotations.js.map