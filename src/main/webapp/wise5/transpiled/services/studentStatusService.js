'use strict';

define(['configService', 'projectService'], function (configService, projectService) {

    var service = ['$http', '$q', '$rootScope', 'ConfigService', 'ProjectService', 'OpenResponseService', function ($http, $q, $rootScope, ConfigService, ProjectService, OpenResponseService) {
        var serviceObject = {};

        serviceObject.studentStatuses = null;

        serviceObject.newNodeVisits = [];

        serviceObject.retrieveStudentStatuses = function (config) {
            var studentStatusURL = ConfigService.getStudentStatusURL();
            var runId = ConfigService.getRunId();

            var requestConfig = {
                params: {
                    runId: runId
                }
            };

            return $http.get(studentStatusURL, requestConfig).then(angular.bind(this, function (result) {
                var studentStatuses = result.data;

                this.studentStatuses = studentStatuses;

                return studentStatuses;
            }));
        };

        serviceObject.getStudentStatuses = function () {
            return this.studentStatuses;
        };

        serviceObject.getCurrentNodeTitleForWorkgroupId = function (workgroupId) {
            var nodeTitle = null;

            var studentStatus = this.getStudentStatusForWorkgroupId(workgroupId);

            if (studentStatus != null) {
                var currentNodeId = studentStatus.currentNodeId;
                nodeTitle = ProjectService.getNodeTitleByNodeId(currentNodeId);
            }

            return nodeTitle;
        };

        serviceObject.getNewNodeVisits = function () {
            return this.newNodeVisits;
        };

        serviceObject.addNewNodeVisit = function (nodeVisit) {
            this.newNodeVisits.push(nodeVisit);
        };

        serviceObject.getStudentStatusForWorkgroupId = function (workgroupId) {

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
        };

        serviceObject.setStudentStatusForWorkgroupId = function (workgroupId, studentStatus) {

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
        };

        serviceObject.getAvatarColorForWorkgroupId = function (workgroupId) {
            var avatarColors = ['#E91E63', '#9C27B0', '#CDDC39', '#2196F3', '#FDD835', '#43A047', '#795548', '#EF6C00', '#C62828', '#607D8B'];
            var modulo = workgroupId % 10;
            return avatarColors[modulo];
        };

        return serviceObject;
    }];

    return service;
});