"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GlobalAnnotationsListController = function () {
    function GlobalAnnotationsListController($rootScope, $scope, $filter, AnnotationService, ProjectService) {
        var _this = this;

        _classCallCheck(this, GlobalAnnotationsListController);

        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$filter = $filter;
        this.AnnotationService = AnnotationService;
        this.ProjectService = ProjectService;

        this.$translate = this.$filter('translate');

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
    }

    _createClass(GlobalAnnotationsListController, [{
        key: 'setModel',
        value: function setModel() {
            var latestGlobalAnnotationGroup = this.getLatestGlobalAnnotationGroup();
            this.latestGlobalComment = null;
            this.latestGlobalScore = null;

            if (latestGlobalAnnotationGroup) {
                var annotations = latestGlobalAnnotationGroup.annotations;

                var n = annotations.length - 1;
                for (var i = n; i > -1; i--) {
                    var annotation = annotations[i];
                    var type = annotation.type;
                    if (type === 'autoComment') {
                        this.latestGlobalComment = annotation;
                    } else if (type === 'autoScore') {
                        this.latestGlobalScore = annotation;
                    }

                    if (this.latestGlobalComment && this.latestGlobalScore) {
                        break;
                    }
                }

                var nodeId = latestGlobalAnnotationGroup.nodeId;
                this.nodeTitle = this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);
            }
        }

        /**
         * Return the latest active global annotatin group
         */

    }, {
        key: 'getLatestGlobalAnnotationGroup',
        value: function getLatestGlobalAnnotationGroup() {
            var latestGlobalAnnotationGroup = null;

            var annotations = this.AnnotationService.getActiveGlobalAnnotationGroups();
            var total = annotations.length;

            if (total) {
                annotations.sort(function (a, b) {
                    return new Date(b.serverSaveTime) - new Date(a.serverSaveTime);
                });

                latestGlobalAnnotationGroup = annotations[0];
            }

            return latestGlobalAnnotationGroup;
        }
    }]);

    return GlobalAnnotationsListController;
}();

GlobalAnnotationsListController.$inject = ['$rootScope', '$scope', '$filter', 'AnnotationService', 'ProjectService'];

var GlobalAnnotationsList = {
    bindings: {},
    template: '<p class="md-body-1 text-secondary" style="text-decoration: underline;">From {{$ctrl.nodeTitle}}<br /></p>\n        <div class="md-body-1">\n            <p ng-if="$ctrl.latestGlobalComment">\n                <compile data="$ctrl.latestGlobalComment.data.value"></compile>\n            </p>\n            <p ng-if="$ctrl.latestGlobalScore">\n                Score: {{$ctrl.latestGlobalScore.data.value}}<span ng-if="$ctrl.maxScore">/{{$ctrl.maxScore}}</span>\n            </p>\n        </div>',
    controller: GlobalAnnotationsListController
};

exports.default = GlobalAnnotationsList;
//# sourceMappingURL=globalAnnotationsList.js.map
