'use strict';

class NodeProgressController {

    constructor($filter,
                $mdDialog,
                $scope,
                $state,
                ConfigService,
                ProjectService,
                StudentStatusService,
                TeacherDataService,
                TeacherWebSocketService) {

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

        // clear out the current workgroup
        this.currentWorkgroup = null;
        this.TeacherDataService.setCurrentWorkgroup(null);

        this.items = this.ProjectService.idToOrder;

        this.maxScore = this.ProjectService.getMaxScore();

        this.nodeId = null;
        let stateParams = null;
        let stateParamNodeId = null;

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

        let startNodeId = this.ProjectService.getStartNodeId();
        this.rootNode = this.ProjectService.getRootNode(startNodeId);

        this.currentGroup = this.rootNode;

        if (this.currentGroup != null) {
            this.currentGroupId = this.currentGroup.id;
            this.$scope.currentgroupid = this.currentGroupId;
        }

        var flattenedProjectNodeIds = this.ProjectService.getFlattenedProjectAsNodeIds();
        //console.log(JSON.stringify(flattenedProjectNodeIds, null, 4));

        var branches = this.ProjectService.getBranches();

        let currentPeriod = this.getCurrentPeriod();

        this.showRubricButton = false;

        if (this.projectHasRubric()) {
            this.showRubricButton = true;
        }

        /**
         * Listen for current node changed event
         */
        this.$scope.$on('currentNodeChanged', (event, args) => {
            let previousNode = args.previousNode;
            let currentNode = args.currentNode;
            if (previousNode != null && previousNode.type === 'group') {
                let nodeId = previousNode.id;
            }

            if (currentNode != null) {

                this.nodeId = currentNode.id;
                this.TeacherDataService.setCurrentNode(currentNode);

                if (this.isGroupNode(this.nodeId)) {
                    // current node is a group

                    this.currentGroup = currentNode;
                    this.currentGroupId = this.currentGroup.id;
                    this.$scope.currentgroupid = this.currentGroupId;
                //} else if (this.isApplicationNode(this.nodeId)) {
                }
            }

            this.$state.go('root.project', {nodeId: this.nodeId});
        });

        // listen for the currentWorkgroupChanged event
        this.$scope.$on('currentWorkgroupChanged', (event, args) => {
            this.currentWorkgroup = args.currentWorkgroup;
        });

        /**
         * Listen for state change event
         */
        this.$scope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) => {
            let toNodeId = toParams.nodeId;
            let fromNodeId = fromParams.nodeId;
            if (toNodeId && fromNodeId && toNodeId !== fromNodeId) {
                this.TeacherDataService.endCurrentNodeAndSetCurrentNodeByNodeId(toNodeId);
            }

            if (toState.name === 'root.project') {
                let nodeId = toParams.nodeId;
                if (this.ProjectService.isApplicationNode(nodeId)) {
                    // scroll to top when viewing a new step
                    document.getElementById('content').scrollTop = 0;
                }
            }
        });

        this.$scope.$on('$destroy', () => {
            // set the currently selected workgroup to null on state exit
            this.TeacherDataService.setCurrentWorkgroup(null);
        });

        // save event when node progress view is displayed
        let context = "ClassroomMonitor", nodeId = this.nodeId, componentId = null, componentType = null,
            category = "Navigation", event = "nodeProgressViewDisplayed", data = { nodeId: this.nodeId };
        this.TeacherDataService.saveEvent(context, nodeId, componentId, componentType, category, event, data);
    }

    isGroupNode(nodeId) {
        return this.ProjectService.isGroupNode(nodeId);
    }

    isApplicationNode(nodeId) {
        return this.ProjectService.isApplicationNode(nodeId);
    }

    /**
     * Get the current period
     */
    getCurrentPeriod() {
        return this.TeacherDataService.getCurrentPeriod();
    }

    /**
     * Get the number of students on the node
     * @param nodeId the node id
     * @returns the number of students that are on the node
     */
    getNumberOfStudentsOnNode(nodeId) {
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
    getNodeCompletion(nodeId) {
        // get the currently selected period
        var currentPeriod = this.getCurrentPeriod();
        var periodId = currentPeriod.periodId;

        // get the percentage of the class or period that has completed the node
        var completionPercentage = this.StudentStatusService.getNodeCompletion(nodeId, periodId).completionPct;

        return completionPercentage;
    }

    /**
     * Check if the project has a rubric
     * @return whether the project has a rubric
     */
    projectHasRubric() {

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
    showRubric($event) {

        // get the project title
        let projectTitle = this.ProjectService.getProjectTitle();
        let rubricTitle = this.$translate('projectInfo');

        /*
         * create the header for the popup that contains the project title,
         * 'Open in New Tab' button, and 'Close' button
         */
        let dialogHeader =
            `<md-toolbar>
                <div class="md-toolbar-tools">
                    <h2 class="overflow--ellipsis">${ projectTitle }</h2>
                    <span flex>&nbsp;</span>
                    <span class="md-subhead">${ rubricTitle }</span>
                </div>
            </md-toolbar>`;

        let dialogActions =
            `<md-dialog-actions layout="row" layout-align="end center">
                <md-button class="md-primary" ng-click="openInNewWindow()" aria-label="{{ ::'openInNewWindow' | translate }}">{{ ::'openInNewWindow' | translate }}</md-button>
                <md-button class="md-primary" ng-click="close()" aria-label="{{ ::'close' | translate }}">{{ ::'close' | translate }}</md-button>
            </md-dialog-actions>`;

        /*
         * create the header for the new window that contains the project title
         */
        let windowHeader =
            `<md-toolbar class="layout-row">
                <div class="md-toolbar-tools" style="color: #ffffff;">
                    <h2>${ projectTitle }</h2>
                    <span class="flex">&nbsp;</span>
                    <span class="md-subhead">${ rubricTitle }</span>
                </div>
            </md-toolbar>`;

        // create the string that will hold the rubric content
        let rubricContent = '<md-content class="md-whiteframe-1dp md-padding" style="background-color: #ffffff;">';

        // get the project rubric
        let rubric = this.ProjectService.replaceAssetPaths(this.ProjectService.getProjectRubric());

        if (rubric != null) {
            rubricContent += rubric + '</md-content>';
        }

        let dialogContent =
            `<md-dialog-content class="gray-lighter-bg">
                <div class="md-dialog-content">${ rubricContent }</div>
            </md-dialog-content>`;

        // create the dialog string
        let dialogString = `<md-dialog class="dialog--wider" aria-label="${ projectTitle } - ${ rubricTitle }">${ dialogHeader }${ dialogContent }${ dialogActions }</md-dialog>`;

        // create the window string
        let windowString =
            `<link rel='stylesheet' href='../wise5/lib/bootstrap/css/bootstrap.min.css' />
            <link rel='stylesheet' href='../wise5/themes/default/style/monitor.css'>
            <link rel='stylesheet' href='../wise5/themes/default/style/angular-material.css'>
            <link rel='stylesheet' href='../wise5/lib/summernote/dist/summernote.css' />
            <body class="layout-column">
                <div class="layout-column">${ windowHeader }<md-content class="md-padding">${ rubricContent }</div></md-content></div>
            </body>`;

        // display the rubric in a popup
        this.$mdDialog.show({
            template : dialogString,
            fullscreen: true,
            controller: ['$scope', '$mdDialog',
                function DialogController($scope, $mdDialog) {

                    // display the rubric in a new tab
                    $scope.openInNewWindow = function() {

                        // open a new tab
                        let w = window.open('', '_blank');

                        // write the rubric content to the new tab
                        w.document.write(windowString);

                        // close the popup
                        $mdDialog.hide();
                    }

                    // close the popup
                    $scope.close = () => {
                        $mdDialog.hide();
                    }
                }
            ],
            targetEvent: $event,
            clickOutsideToClose: true,
            escapeToClose: true
        });
    }
}

NodeProgressController.$inject = [
    '$filter',
    '$mdDialog',
    '$scope',
    '$state',
    'ConfigService',
    'ProjectService',
    'StudentStatusService',
    'TeacherDataService',
    'TeacherWebSocketService'
];

export default NodeProgressController;
