'use strict';

class NodeProgressController {

    constructor($mdDialog,
                $scope,
                $state,
                ProjectService,
                StudentStatusService,
                TeacherDataService,
                TeacherWebSocketService) {

        this.$mdDialog = $mdDialog;
        this.$scope = $scope;
        this.$state = $state;
        this.ProjectService = ProjectService;
        this.StudentStatusService = StudentStatusService;
        this.TeacherDataService = TeacherDataService;
        this.TeacherWebSocketService = TeacherWebSocketService;
        this.currentGroup = null;

        // the current workgroup
        this.currentWorkgroup = this.TeacherDataService.getCurrentWorkgroup();

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

            this.$state.go('root.nodeProgress', {nodeId: this.nodeId});
        });

        /**
         * Listen for current period changed event
         */
        this.$scope.$on('currentPeriodChanged', (event, args) => {
            let currentPeriod = args.currentPeriod;
            this.isPaused = this.TeacherDataService.isPeriodPaused(currentPeriod.periodId);
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

    /**
     * Gets and returns the studentStatus object for the currently selected workgroup
     * @return studentStatus object or null
     */
    getCurrentWorkgroupCompletion() {
        let completion = null;

        if (this.currentWorkgroup) {
            // get the workgroup's studentStatus
            let status = this.StudentStatusService.getStudentStatusForWorkgroupId(this.currentWorkgroup.workgroupId);
            if (status) {
                completion = status.projectCompletion;
            }
        }

        return completion;
    }

    /**
     * Gets and returns the total project score for the currently selected workgroup
     * @return score object or null
     */
    getCurrentWorkgroupScore() {
        let score = null;

        if (this.currentWorkgroup) {
            score = this.TeacherDataService.getTotalScoreByWorkgroupId(this.currentWorkgroup.workgroupId);
        }

        return score;
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
        var completionPercentage = this.StudentStatusService.getNodeCompletion(nodeId, periodId);

        return completionPercentage;
    }

    /**
     * The pause screen status was changed. Update period(s) accordingly.
     */
    pauseScreensChanged(isPaused) {
        this.TeacherDataService.pauseScreensChanged(isPaused);
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
     * Show the rubric in the grading view. We will show the step rubric and the
     * component rubrics.
     */
    showRubric() {

        // get the project title
        var projectTitle = this.ProjectService.getProjectTitle();

        /*
         * create the header for the popup that contains the project title,
         * 'Open in New Tab' button, and 'Close' button
         */
        var popupHeader = "<div style='display: flex; margin-left: 30px; margin-right: 30px; margin-top: 30px; margin-bottom: 30px;'><div style='flex: 50%'><h3>" + projectTitle + "</h3></div><div style='flex: 50%; text-align: right'><md-button class='md-primary md-raised' ng-click='openRubricInNewTab()' translate='openInNewTab'></md-button> <md-button class='md-primary md-raised' ng-click='closeRubric()' translate='CLOSE'></md-button></div></div>";

        /*
         * create the header for the new tab that contains the project title
         */
        var tabHeader = "<link rel='stylesheet' href='../wise5/lib/bootstrap/css/bootstrap.min.css' /><link rel='stylesheet' href='../wise5/lib/summernote/dist/summernote.css' /><div style='display: flex; margin-left: 30px; margin-right: 30px; margin-top: 30px; margin-bottom: 30px;'><h1>" + projectTitle + "</h1></div>";

        // create the div that will hold the rubric content
        var rubricContent = "<div style='margin-left:30px;margin-right:30px;margin-top:30px;margin-bottom:30px;'>";

        // get the rubric content
        rubricContent += this.ProjectService.replaceAssetPaths(this.ProjectService.getProjectRubric());

        rubricContent += '</div>';

        // create the popup content
        var popupContent = popupHeader + rubricContent;

        // create the tab content
        var tabContent = tabHeader + rubricContent;

        // display the rubric in a popup
        this.$mdDialog.show({
            template: popupContent,
            controller: ['$scope', '$mdDialog',
                function DialogController($scope, $mdDialog) {

                    // display the rubric in a new tab
                    $scope.openRubricInNewTab = function() {

                        // open a new tab
                        var w = window.open('', '_blank');

                        // write the rubric content to the new tab
                        w.document.write(tabContent);

                        // close the popup
                        $mdDialog.hide();
                    }

                    // close the popup
                    $scope.closeRubric = function() {
                        $mdDialog.hide();
                    }
                }
            ],
            clickOutsideToClose: true,
            escapeToClose: true
        });
    }
}

NodeProgressController.$inject = [
    '$mdDialog',
    '$scope',
    '$state',
    'ProjectService',
    'StudentStatusService',
    'TeacherDataService',
    'TeacherWebSocketService'
];

export default NodeProgressController;
