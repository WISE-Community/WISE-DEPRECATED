'use strict'

import MilestonesController from "../milestones/milestonesController";

class ManageStudentsController {

    constructor($injector,
                $filter,
                $mdDialog,
                $rootScope,
                $scope,
                $state,
                AchievementService,
                ConfigService,
                ProjectService,
                StudentStatusService,
                TeacherDataService,
                TeacherWebSocketService,
                UtilService,
                moment) {
        this.runId = ConfigService.getRunId();
        this.iframeSrc = "/wise/teacher/management/viewmystudents?runId=" + this.runId;
    }
}

ManageStudentsController.$inject = [
    '$injector',
    '$filter',
    '$mdDialog',
    '$rootScope',
    '$scope',
    '$state',
    'AchievementService',
    'ConfigService',
    'ProjectService',
    'StudentStatusService',
    'TeacherDataService',
    'TeacherWebSocketService',
    'UtilService',
    'moment'
];

export default ManageStudentsController;
