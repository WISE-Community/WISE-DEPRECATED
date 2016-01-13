'use strict';

define(['app'], function (app) {
    app.$controllerProvider.register('AnnotationController', function ($injector, $rootScope, $scope, $state, $stateParams, AnnotationService, ConfigService, UtilService) {

        this.annotationId = null;
        this.nodeId = null;
        this.periodId = null;
        this.componentId = null;
        this.fromWorkgroupId = null;
        this.toWorkgroupId = null;
        this.componentStateId = null;
        this.type = null;
        this.value = null;

        /**
         * Perform any necessary setup for the controller
         */
        this.setup = function () {
            this.runId = ConfigService.getRunId();
        };

        /**
         * Save the annotation to the server
         */
        this.postAnnotation = function () {

            if (this.runId != null && this.periodId != null && this.nodeId != null && this.componentId != null && this.fromWorkgroupId != null && this.toWorkgroupId != null && this.type != null && this.value != null) {

                // get the current time
                var clientSaveTime = new Date().getTime();

                // get the value
                var value = this.value;

                // convert the value to a number if possible
                value = UtilService.convertStringToNumber(value);

                var data = {};
                data.value = value;

                // create the annotation object
                var annotation = AnnotationService.createAnnotation(this.annotationId, this.runId, this.periodId, this.fromWorkgroupId, this.toWorkgroupId, this.nodeId, this.componentId, this.componentStateId, this.type, data, clientSaveTime);

                // save the annotation to the server
                AnnotationService.saveAnnotation(annotation).then(angular.bind(this, function (result) {
                    var localAnnotation = result;

                    if (localAnnotation != null) {
                        if (this.annotationId == null) {
                            // set the annotation id if there was no annotation id
                            this.annotationId = localAnnotation.id;
                        }
                    }
                }));
            }
        };

        this.setup();
    });
});