class AnnotationController {
    constructor(AnnotationService,
                ConfigService,
                UtilService) {

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
    postAnnotation() {

        if (this.runId != null &&
            this.periodId != null &&
            this.nodeId != null &&
            this.componentId != null &&
            this.fromWorkgroupId != null &&
            this.toWorkgroupId != null &&
            this.type != null &&
            this.value != null) {

            // get the current time
            var clientSaveTime = new Date().getTime();

            // get the value
            var value = this.value;

            // convert the value to a number if possible
            value = this.UtilService.convertStringToNumber(value);

            var data = {};
            data.value = value;

            // create the annotation object
            var annotation = this.AnnotationService.createAnnotation(
                this.annotationId,
                this.runId,
                this.periodId,
                this.fromWorkgroupId,
                this.toWorkgroupId,
                this.nodeId,
                this.componentId,
                this.componentStateId,
                this.type,
                data,
                clientSaveTime);

            // save the annotation to the server
            this.AnnotationService.saveAnnotation(annotation).then(angular.bind(this, function(result) {
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
}

AnnotationController.$inject = [
    'AnnotationService',
    'ConfigService',
    'UtilService'
];

export default AnnotationController;
