class NavigationController {
    constructor($rootScope,
                ConfigService,
                ProjectService,
                StudentDataService) {

        this.$rootScope = $rootScope;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;

        this.rootNode = this.ProjectService.rootNode;

        this.$rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            var toNodeId = toParams.nodeId;
            var fromNodeId = fromParams.nodeId;
            if (toNodeId && fromNodeId && toNodeId !== fromNodeId) {
                this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(toNodeId);
            }
        }.bind(this));
    }

    /**
     * Invokes OpenCPU to calculate and display student statistics
     */
    showStudentStatistics() {
        let openCPUURL = this.ConfigService.getOpenCPUURL();
        if (openCPUURL != null) {
            let allEvents = this.StudentDataService.getEvents();
            ocpu.seturl(openCPUURL);
            //perform the request
            var request = ocpu.call("getTotalTimeSpent", {
                "events": allEvents
            }, (session) => {
                session.getStdout((echoedData) => {
                    alert(echoedData);
                });
            });

            //if R returns an error, alert the error message
            request.fail(() => {
                alert("Server error: " + request.responseText);
            });
        }
    }
}

NavigationController.$inject = [
    '$rootScope',
    'ConfigService',
    'ProjectService',
    'StudentDataService'
];

export default NavigationController;
