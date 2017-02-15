'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AnnotationController = function () {
    function AnnotationController($scope, $element, $attrs, AnnotationService, ConfigService, ProjectService, UtilService) {
        _classCallCheck(this, AnnotationController);

        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.UtilService = UtilService;
        this.component = null;
        this.value = null;

        this.runId = ConfigService.getRunId();

        if (this.nodeId != null && this.componentId != null) {
            // get the component
            this.component = this.ProjectService.getComponentByNodeIdAndComponentId(this.nodeId, this.componentId);
            if (this.component) {
                this.gradingMaxScore = this.component.maxScore;
            }
        }

        if (this.mode === 'student') {

            if (!this.annotation) {
                var annotationParams = {};
                annotationParams.nodeId = this.nodeId;
                annotationParams.componentId = this.componentId;
                annotationParams.fromWorkgroupId = this.fromWorkgroupId;
                annotationParams.toWorkgroupId = this.toWorkgroupId;
                annotationParams.type = this.type;
                annotationParams.studentWorkId = this.componentStateId;
                annotationParams.notebookItemId = this.notebookItemId;

                // get the latest annotation that matches the params
                this.annotation = this.AnnotationService.getLatestAnnotation(annotationParams);
            }

            if (this.annotation != null) {
                var data = this.annotation.data;
                var dataJSONObject = angular.fromJson(data);

                if (dataJSONObject) {
                    this.value = dataJSONObject.value;
                }
            }
        } else if (this.mode === 'grading') {

            var _annotationParams = {};
            _annotationParams.nodeId = this.nodeId;
            _annotationParams.componentId = this.componentId;
            _annotationParams.fromWorkgroupId = this.fromWorkgroupId;
            _annotationParams.toWorkgroupId = this.toWorkgroupId;
            _annotationParams.type = this.type;
            _annotationParams.studentWorkId = this.componentStateId;
            _annotationParams.notebookItemId = this.notebookItemId;

            if (this.active) {
                /*
                 * this directive instance is the active annotation that the teacher can use to
                 * grade so we will get the latest annotation for the student work
                 */
                this.annotation = this.AnnotationService.getLatestAnnotation(_annotationParams);
            } else {
                /*
                 * this directive instance is not the active annotation so we will get the
                 * annotation directly associated with the student work
                 */
                this.annotation = this.AnnotationService.getAnnotation(_annotationParams);
            }

            if (this.annotation != null) {
                if (this.componentStateId == this.annotation.studentWorkId) {
                    /*
                     * the annotation is for the component state that is being displayed.
                     * sometimes the annotation may not be for the component state that
                     * is being displayed which can happen when student submits work,
                     * the teacher annotates it, and then the student submits new work.
                     * when this happens, we will show the teacher annotation but the
                     * annotation is associated with the first student work and not the
                     * second student work. setting the annotationId in the scope will
                     * cause the server to update the annotation as opposed to creating
                     * a new annotation row in the database.
                     */
                    this.annotationId = this.annotation.id;
                }
            }

            var toUserInfo = this.ConfigService.getUserInfoByWorkgroupId(this.toWorkgroupId);

            if (toUserInfo != null) {
                // set the period id
                this.periodId = toUserInfo.periodId;
            }

            if (this.annotation != null) {

                if (this.annotation.data != null) {
                    this.value = this.annotation.data.value;
                }
            }
        }
    }

    /**
     * Save the annotation to the server
     */


    _createClass(AnnotationController, [{
        key: 'postAnnotation',
        value: function postAnnotation() {
            var _this = this;

            if (this.runId != null && this.periodId != null && this.nodeId != null && this.componentId != null && this.fromWorkgroupId != null && this.toWorkgroupId != null && this.type != null && this.value != null) {

                // get the current time
                var clientSaveTime = new Date().getTime();

                // get the value
                var value = this.value;

                // convert the value to a number if possible
                value = this.UtilService.convertStringToNumber(value);

                var data = {
                    value: value
                };

                // create the annotation object
                var annotation = this.AnnotationService.createAnnotation(this.annotationId, this.runId, this.periodId, this.fromWorkgroupId, this.toWorkgroupId, this.nodeId, this.componentId, this.componentStateId, this.localNotebookItemId, this.notebookItemId, this.type, data, clientSaveTime);

                // save the annotation to the server
                this.AnnotationService.saveAnnotation(annotation).then(function (result) {
                    var localAnnotation = result;

                    if (localAnnotation != null) {
                        if (_this.annotationId == null) {
                            // set the annotation id if there was no annotation id
                            _this.annotationId = localAnnotation.id;
                        }
                    }
                });
            }
        }
    }]);

    return AnnotationController;
}();

AnnotationController.$inject = ['$scope', '$element', '$attrs', 'AnnotationService', 'ConfigService', 'ProjectService', 'UtilService'];

var Annotation = {
    bindings: {
        annotation: '<',
        type: '@',
        mode: '<',
        nodeId: '<',
        componentId: '<',
        fromWorkgroupId: '<',
        toWorkgroupId: '<',
        componentStateId: '<',
        notebookItemId: '<',
        active: '<',
        maxScore: '<'
    },
    templateUrl: 'wise5/directives/annotation/annotation.html',
    controller: AnnotationController,
    controllerAs: 'annotationController'
};

exports.default = Annotation;
//# sourceMappingURL=annotation.js.map