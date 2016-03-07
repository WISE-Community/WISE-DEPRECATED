'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AnnotationController = function () {
    function AnnotationController(AnnotationService, ConfigService, UtilService) {
        _classCallCheck(this, AnnotationController);

        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.UtilService = UtilService;

        this.annotationId = null;
        this.nodeId = null;
        this.periodId = null;
        this.componentId = null;
        this.fromWorkgroupId = null;
        this.toWorkgroupId = null;
        this.componentStateId = null;
        this.type = null;
        this.value = null;

        this.runId = this.ConfigService.getRunId();
    }

    /**
     * Save the annotation to the server
     */


    _createClass(AnnotationController, [{
        key: 'postAnnotation',
        value: function postAnnotation() {

            if (this.runId != null && this.periodId != null && this.nodeId != null && this.componentId != null && this.fromWorkgroupId != null && this.toWorkgroupId != null && this.type != null && this.value != null) {

                // get the current time
                var clientSaveTime = new Date().getTime();

                // get the value
                var value = this.value;

                // convert the value to a number if possible
                value = this.UtilService.convertStringToNumber(value);

                var data = {};
                data.value = value;

                // create the annotation object
                var annotation = this.AnnotationService.createAnnotation(this.annotationId, this.runId, this.periodId, this.fromWorkgroupId, this.toWorkgroupId, this.nodeId, this.componentId, this.componentStateId, this.type, data, clientSaveTime);

                // save the annotation to the server
                this.AnnotationService.saveAnnotation(annotation).then(angular.bind(this, function (result) {
                    var localAnnotation = result;

                    if (localAnnotation != null) {
                        if (this.annotationId == null) {
                            // set the annotation id if there was no annotation id
                            this.annotationId = localAnnotation.id;
                        }
                    }
                }));
            }
        }
    }]);

    return AnnotationController;
}();

AnnotationController.$inject = ['AnnotationService', 'ConfigService', 'UtilService'];

exports.default = AnnotationController;
//# sourceMappingURL=annotationController.js.map