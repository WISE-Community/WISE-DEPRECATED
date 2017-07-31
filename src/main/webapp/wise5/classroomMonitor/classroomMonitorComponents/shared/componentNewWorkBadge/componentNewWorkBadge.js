"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ComponentNewWorkBadgeController = function () {
    function ComponentNewWorkBadgeController(AnnotationService, TeacherDataService, $scope) {
        var _this = this;

        _classCallCheck(this, ComponentNewWorkBadgeController);

        this.AnnotationService = AnnotationService;
        this.TeacherDataService = TeacherDataService;
        this.$scope = $scope;

        this.$onInit = function () {
            _this.hasNewWork = false;
            _this.checkHasNewWork();
        };

        this.$scope.$on('annotationSavedToServer', function (event, args) {
            if (args != null) {

                // get the annotation that was saved to the server
                var annotation = args.annotation;

                if (annotation != null) {

                    // get the node id and component id of the annotation
                    var annotationNodeId = annotation.nodeId;
                    var annotationComponentId = annotation.componentId;

                    // make sure the annotation was for this component
                    if (_this.nodeId === annotationNodeId && _this.componentId === annotationComponentId) {

                        // re-check for new work
                        _this.checkHasNewWork();
                    }
                }
            }
        });
    }

    _createClass(ComponentNewWorkBadgeController, [{
        key: 'checkHasNewWork',
        value: function checkHasNewWork() {
            var latestComponentState = this.TeacherDataService.getLatestComponentStateByWorkgroupIdNodeIdAndComponentId(this.workgroupId, this.nodeId, this.componentId);
            var latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId, null, 'comment');

            if (latestComponentState) {
                // there is work for this component

                var latestComponentStateTime = latestComponentState.serverSaveTime;
                var latestTeacherComment = null;
                var latestTeacherScore = null;
                var latestTeacherAnnotationTime = 0;

                if (latestAnnotations && latestAnnotations.comment) {
                    latestTeacherComment = latestAnnotations.comment;
                }

                if (latestAnnotations && latestAnnotations.score) {
                    if (latestAnnotations.score !== 'autoScore') {
                        latestTeacherScore = latestAnnotations.score;
                    }
                }

                var commentSaveTime = latestTeacherComment ? latestTeacherComment.serverSaveTime : 0;
                var scoreSaveTime = latestTeacherScore ? latestTeacherScore.serverSaveTime : 0;

                if (commentSaveTime >= scoreSaveTime) {
                    latestTeacherAnnotationTime = commentSaveTime;
                } else if (scoreSaveTime > commentSaveTime) {
                    latestTeacherAnnotationTime = scoreSaveTime;
                }

                if (latestComponentStateTime > latestTeacherAnnotationTime) {
                    // latest component state is newer than latest annotation, so work is new
                    this.hasNewWork = true;
                }
            }
        }
    }]);

    return ComponentNewWorkBadgeController;
}();

ComponentNewWorkBadgeController.$inject = ['AnnotationService', 'TeacherDataService', '$scope'];

var ComponentNewWorkBadge = {
    bindings: {
        workgroupId: '<',
        componentId: '<',
        nodeId: '<'
    },
    template: '<span ng-if="$ctrl.hasNewWork" class="badge badge--info">{{ \'NEW\' | translate }}</span>',
    controller: ComponentNewWorkBadgeController
};

exports.default = ComponentNewWorkBadge;
//# sourceMappingURL=componentNewWorkBadge.js.map