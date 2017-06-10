'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NodeProgressController = function () {
    function NodeProgressController($filter, $mdDialog, $scope, $state, ConfigService, ProjectService, StudentStatusService, TeacherDataService, TeacherWebSocketService) {
        var _this = this;

        _classCallCheck(this, NodeProgressController);

        this.$filter = $filter;
        this.$mdDialog = $mdDialog;
        this.$scope = $scope;
        this.$state = $state;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.StudentStatusService = StudentStatusService;
        this.TeacherDataService = TeacherDataService;
        this.TeacherWebSocketService = TeacherWebSocketService;

        this.$translate = this.$filter('translate');

        this.currentGroup = null;

        // the current workgroup
        this.currentWorkgroup = this.TeacherDataService.getCurrentWorkgroup();

        this.items = this.ProjectService.idToOrder;

        this.maxScore = this.ProjectService.getMaxScore();

        this.nodeId = null;
        var stateParams = null;
        var stateParamNodeId = null;

        if (this.$state != null) {
            stateParams = this.$state.params;
        }

        if (stateParams != null) {
            stateParamNodeId = stateParams.nodeId;
        }

        if (stateParamNodeId != null && stateParamNodeId !== '') {
            this.nodeId = stateParamNodeId;
        }

        if (this.nodeId == null || this.nodeId === '') {
            this.nodeId = this.ProjectService.rootNode.id;
        }

        this.TeacherDataService.setCurrentNodeByNodeId(this.nodeId);

        var startNodeId = this.ProjectService.getStartNodeId();
        this.rootNode = this.ProjectService.getRootNode(startNodeId);

        this.currentGroup = this.rootNode;

        if (this.currentGroup != null) {
            this.currentGroupId = this.currentGroup.id;
            this.$scope.currentgroupid = this.currentGroupId;
        }

        var flattenedProjectNodeIds = this.ProjectService.getFlattenedProjectAsNodeIds();
        //console.log(JSON.stringify(flattenedProjectNodeIds, null, 4));

        var branches = this.ProjectService.getBranches();

        var currentPeriod = this.getCurrentPeriod();

        if (currentPeriod) {
            this.isPaused = this.TeacherDataService.isPeriodPaused(currentPeriod.periodId);
        }

        this.showRubricButton = false;

        if (this.projectHasRubric()) {
            this.showRubricButton = true;
        }

        /**
         * Listen for current node changed event
         */
        this.$scope.$on('currentNodeChanged', function (event, args) {
            var previousNode = args.previousNode;
            var currentNode = args.currentNode;
            if (previousNode != null && previousNode.type === 'group') {
                var _nodeId = previousNode.id;
            }

            if (currentNode != null) {

                _this.nodeId = currentNode.id;
                _this.TeacherDataService.setCurrentNode(currentNode);

                if (_this.isGroupNode(_this.nodeId)) {
                    // current node is a group

                    _this.currentGroup = currentNode;
                    _this.currentGroupId = _this.currentGroup.id;
                    _this.$scope.currentgroupid = _this.currentGroupId;
                    //} else if (this.isApplicationNode(this.nodeId)) {
                }
            }

            _this.$state.go('root.nodeProgress', { nodeId: _this.nodeId });
        });

        /**
         * Listen for current period changed event
         */
        this.$scope.$on('currentPeriodChanged', function (event, args) {
            var currentPeriod = args.currentPeriod;
            _this.isPaused = _this.TeacherDataService.isPeriodPaused(currentPeriod.periodId);
        });

        // listen for the currentWorkgroupChanged event
        this.$scope.$on('currentWorkgroupChanged', function (event, args) {
            _this.currentWorkgroup = args.currentWorkgroup;
        });

        /**
         * Listen for state change event
         */
        this.$scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            var toNodeId = toParams.nodeId;
            var fromNodeId = fromParams.nodeId;
            if (toNodeId && fromNodeId && toNodeId !== fromNodeId) {
                _this.TeacherDataService.endCurrentNodeAndSetCurrentNodeByNodeId(toNodeId);
            }

            if (toState.name === 'root.project') {
                var _nodeId2 = toParams.nodeId;
                if (_this.ProjectService.isApplicationNode(_nodeId2)) {
                    // scroll to top when viewing a new step
                    document.getElementById('content').scrollTop = 0;
                }
            }
        });

        this.$scope.$on('$destroy', function () {
            // set the currently selected workgroup to null on state exit
            _this.TeacherDataService.setCurrentWorkgroup(null);
        });

        // save event when node progress view is displayed
        var context = "ClassroomMonitor",
            nodeId = this.nodeId,
            componentId = null,
            componentType = null,
            category = "Navigation",
            event = "nodeProgressViewDisplayed",
            data = { nodeId: this.nodeId };
        this.TeacherDataService.saveEvent(context, nodeId, componentId, componentType, category, event, data);
    }

    _createClass(NodeProgressController, [{
        key: 'isGroupNode',
        value: function isGroupNode(nodeId) {
            return this.ProjectService.isGroupNode(nodeId);
        }
    }, {
        key: 'isApplicationNode',
        value: function isApplicationNode(nodeId) {
            return this.ProjectService.isApplicationNode(nodeId);
        }

        /**
         * Get the current period
         */

    }, {
        key: 'getCurrentPeriod',
        value: function getCurrentPeriod() {
            return this.TeacherDataService.getCurrentPeriod();
        }

        /**
         * Get the number of students on the node
         * @param nodeId the node id
         * @returns the number of students that are on the node
         */

    }, {
        key: 'getNumberOfStudentsOnNode',
        value: function getNumberOfStudentsOnNode(nodeId) {
            // get the currently selected period
            var currentPeriod = this.getCurrentPeriod();
            var periodId = currentPeriod.periodId;

            // get the number of students that are on the node in the period
            var count = this.StudentStatusService.getWorkgroupIdsOnNode(nodeId, periodId).length;

            return count;
        }

        /**
         * Get the percentage of the class or period that has completed the node
         * @param nodeId the node id
         * @returns the percentage of the class or period that has completed the node
         */

    }, {
        key: 'getNodeCompletion',
        value: function getNodeCompletion(nodeId) {
            // get the currently selected period
            var currentPeriod = this.getCurrentPeriod();
            var periodId = currentPeriod.periodId;

            // get the percentage of the class or period that has completed the node
            var completionPercentage = this.StudentStatusService.getNodeCompletion(nodeId, periodId);

            return completionPercentage;
        }

        /**
         * The pause screen status was changed. Update period(s) accordingly.
         */

    }, {
        key: 'pauseScreensChanged',
        value: function pauseScreensChanged(isPaused) {
            this.TeacherDataService.pauseScreensChanged(isPaused);
        }

        /**
         * Check if the project has a rubric
         * @return whether the project has a rubric
         */

    }, {
        key: 'projectHasRubric',
        value: function projectHasRubric() {

            // get the project rubric
            var projectRubric = this.ProjectService.getProjectRubric();

            if (projectRubric != null && projectRubric != '') {
                // the project has a rubric
                return true;
            }

            return false;
        }

        /**
         * Show the project rubric
         */

    }, {
        key: 'showRubric',
        value: function showRubric($event) {

            // get the project title
            var projectTitle = this.ProjectService.getProjectTitle();
            var rubricTitle = this.$translate('projectInfo');

            /*
             * create the header for the popup that contains the project title,
             * 'Open in New Tab' button, and 'Close' button
             */
            var dialogHeader = '<md-toolbar>\n                <div class="md-toolbar-tools gray-darkest-bg">\n                    <h2 class="overflow--ellipsis">' + projectTitle + '</h2>\n                    <span flex>&nbsp;</span>\n                    <span class="md-subhead">' + rubricTitle + '</span>\n                </div>\n            </md-toolbar>';

            var dialogActions = '<md-dialog-actions layout="row" layout-align="end center">\n                <md-button class="md-primary" ng-click="openInNewWindow()" aria-label="{{ \'openInNewWindow\' | translate }}">{{ \'openInNewWindow\' | translate }}</md-button>\n                <md-button class="md-primary" ng-click="close()" aria-label="{{ \'close\' | translate }}">{{ \'close\' | translate }}</md-button>\n            </md-dialog-actions>';

            /*
             * create the header for the new window that contains the project title
             */
            var windowHeader = '<md-toolbar class="layout-row">\n                <div class="md-toolbar-tools gray-darkest-bg" style="color: #ffffff;">\n                    <h2>' + projectTitle + '</h2>\n                    <span class="flex">&nbsp;</span>\n                    <span class="md-subhead">' + rubricTitle + '</span>\n                </div>\n            </md-toolbar>';

            // create the string that will hold the rubric content
            var rubricContent = '<md-content class="md-whiteframe-1dp md-padding" style="background-color: #ffffff;">';

            // get the project rubric
            var rubric = this.ProjectService.replaceAssetPaths(this.ProjectService.getProjectRubric());

            if (rubric != null) {
                rubricContent += rubric + '</md-content>';
            }

            var dialogContent = '<md-dialog-content class="gray-lighter-bg">\n                <div class="md-dialog-content">' + rubricContent + '</div>\n            </md-dialog-content>';

            // create the dialog string
            var dialogString = '<md-dialog class="dialog--wider" aria-label="' + projectTitle + ' - ' + rubricTitle + '">' + dialogHeader + dialogContent + dialogActions + '</md-dialog>';

            // create the window string
            var windowString = '<link rel=\'stylesheet\' href=\'../wise5/lib/bootstrap/css/bootstrap.min.css\' />\n            <link rel=\'stylesheet\' href=\'../wise5/themes/default/style/monitor.css\'>\n            <link rel=\'stylesheet\' href=\'../wise5/themes/default/style/angular-material.css\'>\n            <link rel=\'stylesheet\' href=\'../wise5/lib/summernote/dist/summernote.css\' />\n            <body class="layout-column">\n                <div class="layout-column">' + windowHeader + '<md-content class="md-padding">' + rubricContent + '</div></md-content></div>\n            </body>';

            // display the rubric in a popup
            this.$mdDialog.show({
                template: dialogString,
                fullscreen: true,
                controller: ['$scope', '$mdDialog', function DialogController($scope, $mdDialog) {

                    // display the rubric in a new tab
                    $scope.openInNewWindow = function () {

                        // open a new tab
                        var w = window.open('', '_blank');

                        // write the rubric content to the new tab
                        w.document.write(windowString);

                        // close the popup
                        $mdDialog.hide();
                    };

                    // close the popup
                    $scope.close = function () {
                        $mdDialog.hide();
                    };
                }],
                targetEvent: $event,
                clickOutsideToClose: true,
                escapeToClose: true
            });
        }

        /**
         * Gets and returns the avatar color the currently selected workgroup
         * @return color string or null
         */

    }, {
        key: 'getCurrentWorkgroupAvatarColor',
        value: function getCurrentWorkgroupAvatarColor() {
            var color = '';
            if (this.currentWorkgroup) {
                color = this.ConfigService.getAvatarColorForWorkgroupId(this.currentWorkgroup.workgroupId);
            }
            return color;
        }

        /**
         * Gets and returns the project completion for the currently selected workgroup
         * @return completion object or null
         */

    }, {
        key: 'getCurrentWorkgroupCompletion',
        value: function getCurrentWorkgroupCompletion() {
            var completion = null;

            if (this.currentWorkgroup) {
                // get the workgroup's studentStatus
                var status = this.StudentStatusService.getStudentStatusForWorkgroupId(this.currentWorkgroup.workgroupId);
                if (status) {
                    completion = status.projectCompletion;
                }
            }

            return completion;
        }

        /**
         * Gets and returns the display names for the currently selected workgroup
         * @return names string or null
         */

    }, {
        key: 'getCurrentWorkgroupDisplayNames',
        value: function getCurrentWorkgroupDisplayNames() {
            var names = '';
            if (this.currentWorkgroup) {
                names = this.ConfigService.getDisplayNamesByWorkgroupId(this.currentWorkgroup.workgroupId);
            }
            return names;
        }

        /**
         * Gets and returns the number of students in the currently selected workgroup
         * @return number of students or null
         */

    }, {
        key: 'getCurrentWorkgroupNumberOfStudents',
        value: function getCurrentWorkgroupNumberOfStudents() {
            var num = null;

            if (this.currentWorkgroup) {
                var userInfo = this.ConfigService.getUserInfoByWorkgroupId(this.currentWorkgroup.workgroupId);

                if (userInfo != null) {
                    var userNames = userInfo.userName.split(':');
                    num = userNames.length;
                }
            }

            return num;
        }
    }, {
        key: 'getCurrentWorkgroupScore',


        /**
         * Gets and returns the total project score for the currently selected workgroup
         * @return score object or null
         */
        value: function getCurrentWorkgroupScore() {
            var score = null;

            if (this.currentWorkgroup) {
                score = this.TeacherDataService.getTotalScoreByWorkgroupId(this.currentWorkgroup.workgroupId);
            }

            return score;
        }
    }]);

    return NodeProgressController;
}();

NodeProgressController.$inject = ['$filter', '$mdDialog', '$scope', '$state', 'ConfigService', 'ProjectService', 'StudentStatusService', 'TeacherDataService', 'TeacherWebSocketService'];

exports.default = NodeProgressController;
//# sourceMappingURL=nodeProgressController.js.map