'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StudentStatusService = function () {
    function StudentStatusService($http, ConfigService, ProjectService) {
        _classCallCheck(this, StudentStatusService);

        this.$http = $http;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.studentStatuses = null;

        this.newNodeVisits = [];
    }

    _createClass(StudentStatusService, [{
        key: 'retrieveStudentStatuses',
        value: function retrieveStudentStatuses(config) {
            var studentStatusURL = this.ConfigService.getStudentStatusURL();
            var runId = this.ConfigService.getRunId();

            var requestConfig = {
                params: {
                    runId: runId
                }
            };

            return this.$http.get(studentStatusURL, requestConfig).then(angular.bind(this, function (result) {
                var studentStatuses = result.data;

                this.studentStatuses = studentStatuses;

                return studentStatuses;
            }));
        }
    }, {
        key: 'getStudentStatuses',
        value: function getStudentStatuses() {
            return this.studentStatuses;
        }
    }, {
        key: 'getCurrentNodeTitleForWorkgroupId',
        value: function getCurrentNodeTitleForWorkgroupId(workgroupId) {
            var nodeTitle = null;

            var studentStatus = this.getStudentStatusForWorkgroupId(workgroupId);

            if (studentStatus != null) {
                var currentNodeId = studentStatus.currentNodeId;
                nodeTitle = this.ProjectService.getNodeTitleByNodeId(currentNodeId);
            }

            return nodeTitle;
        }
    }, {
        key: 'getNewNodeVisits',
        value: function getNewNodeVisits() {
            return this.newNodeVisits;
        }
    }, {
        key: 'addNewNodeVisit',
        value: function addNewNodeVisit(nodeVisit) {
            this.newNodeVisits.push(nodeVisit);
        }
    }, {
        key: 'getStudentStatusForWorkgroupId',
        value: function getStudentStatusForWorkgroupId(workgroupId) {

            var studentStatus = null;
            var studentStatuses = this.getStudentStatuses();

            for (var x = 0; x < studentStatuses.length; x++) {
                var tempStudentStatus = studentStatuses[x];

                if (tempStudentStatus != null) {
                    var tempWorkgroupId = tempStudentStatus.workgroupId;

                    if (workgroupId == tempWorkgroupId) {
                        studentStatus = tempStudentStatus;
                        break;
                    }
                }
            }

            return studentStatus;
        }
    }, {
        key: 'setStudentStatusForWorkgroupId',
        value: function setStudentStatusForWorkgroupId(workgroupId, studentStatus) {

            var studentStatuses = this.getStudentStatuses();

            for (var x = 0; x < studentStatuses.length; x++) {
                var tempStudentStatus = studentStatuses[x];

                if (tempStudentStatus != null) {
                    var tempWorkgroupId = tempStudentStatus.workgroupId;

                    if (workgroupId === tempWorkgroupId) {
                        studentStatuses.splice(x, 1, studentStatus);
                        break;
                    }
                }
            }
        }
    }, {
        key: 'getAvatarColorForWorkgroupId',
        value: function getAvatarColorForWorkgroupId(workgroupId) {
            var avatarColors = ['#E91E63', '#9C27B0', '#CDDC39', '#2196F3', '#FDD835', '#43A047', '#795548', '#EF6C00', '#C62828', '#607D8B'];
            var modulo = workgroupId % 10;
            return avatarColors[modulo];
        }
    }]);

    return StudentStatusService;
}();

StudentStatusService.$inject = ['$http', 'ConfigService', 'ProjectService'];

exports.default = StudentStatusService;
//# sourceMappingURL=studentStatusService.js.map