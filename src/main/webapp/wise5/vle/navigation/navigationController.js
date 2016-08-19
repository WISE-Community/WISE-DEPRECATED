'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NavigationController = function () {
    function NavigationController($rootScope, ConfigService, ProjectService, StudentDataService) {
        _classCallCheck(this, NavigationController);

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

            if (toState.name === 'root.vle') {
                var nodeId = toParams.nodeId;
                if (this.ProjectService.isApplicationNode(nodeId)) {
                    // scroll to top when viewing a new step
                    document.getElementById('content').scrollTop = 0;
                }
            }
        }.bind(this));
    }

    /**
     * Invokes OpenCPU to calculate and display student statistics
     */


    _createClass(NavigationController, [{
        key: 'showStudentStatistics',
        value: function showStudentStatistics() {
            var openCPUURL = this.ConfigService.getOpenCPUURL();
            if (openCPUURL != null) {
                var allEvents = this.StudentDataService.getEvents();
                ocpu.seturl(openCPUURL);
                //perform the request
                var request = ocpu.call("getTotalTimeSpent", {
                    "events": allEvents
                }, function (session) {
                    session.getStdout(function (echoedData) {
                        alert(echoedData);
                    });
                });

                //if R returns an error, alert the error message
                request.fail(function () {
                    alert("Server error: " + request.responseText);
                });
            }
        }
    }]);

    return NavigationController;
}();

NavigationController.$inject = ['$rootScope', 'ConfigService', 'ProjectService', 'StudentDataService'];

exports.default = NavigationController;
//# sourceMappingURL=navigationController.js.map