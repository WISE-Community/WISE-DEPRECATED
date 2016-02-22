'use strict';

class ThemeController {
    constructor($scope,
                ConfigService,
                ProjectService,
                StudentDataService,
                NotebookService,
                SessionService,
                $mdDialog,
                $mdToast,
                $mdComponentRegistry) {

        this.$scope = $scope;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;
        this.NotebookService = NotebookService;
        this.SessionService = SessionService;
        this.$mdDialog = $mdDialog;
        this.$mdToast = $mdToast;
        this.$mdComponentRegistry = $mdComponentRegistry;

        // TODO: set these variables dynamically from theme settings
        this.layoutView = 'list'; // 'list' or 'card'
        this.numberProject = true;

        this.themePath = this.ProjectService.getThemePath();

        this.nodeStatuses = this.StudentDataService.nodeStatuses;

        this.rootNode = this.ProjectService.rootNode;
        this.rootNodeStatus = this.nodeStatuses[this.rootNode.id];

        this.workgroupId = this.ConfigService.getWorkgroupId();
        this.workgroupUserNames = this.isPreview ? ['Preview User'] : this.ConfigService.getUserNamesByWorkgroupId(this.workgroupId);

        // build project status pop-up
        let statusTemplateUrl = this.themePath + '/templates/projectStatus.html';
        let scope = this;

        this.statusDisplay = this.$mdToast.build({
            locals: {
                projectStatus: scope.rootNodeStatus,
                userNames: scope.workgroupUserNames
            },
            controller: 'ProjectStatusController',
            bindToController: true,
            templateUrl: statusTemplateUrl,
            hideDelay: 0
        });
        this.projectStatusOpen = false;

        // build server disconnect display
        this.connectionLostDisplay = $mdToast.build({
            template: '<md-toast>\
                      <span><md-icon class="warn"> error </md-icon>&nbsp;Server error. Check your internet connection.</span>\
                      </md-toast>',
            hideDelay: 0
        });
        this.connectionLostShown = false;

        // alert user when a locked node has been clicked
        this.$scope.$on('nodeClickLocked', angular.bind(this, function (event, args) {
            let nodeId = args.nodeId;

            // TODO: customize alert with constraint details, correct node term
            this.$mdDialog.show(
                this.$mdDialog.alert()
                    .parent(angular.element(document.body))
                    .title('Item Locked')
                    .content('Sorry, you cannot view this item yet.')
                    .ariaLabel('Item Locked')
                    .clickOutsideToClose(true)
                    .ok('OK')
                    .targetEvent(event)
            );
        }));

        // alert user when inactive for a long time
        this.$scope.$on('showSessionWarning', angular.bind(this, function() {
            let alert = this.$mdDialog.confirm()
                .parent(angular.element(document.body))
                .title('Session Timeout')
                .content('You have been inactive for a long time. Do you want to stay logged in?')
                .ariaLabel('Session Timeout')
                .ok('YES')
                .cancel('No');

            this.$mdDialog.show(alert).then(()=> {
                this.SessionService.renewSession();
                alert = undefined;
            }, ()=> {
                this.SessionService.forceLogOut();
            });
        }));

        // alert user when server loses connection
        this.$scope.$on('serverDisconnected', angular.bind(this, function() {
            this.handleServerDisconnect();
        }));

        // remove alert when server regains connection
        this.$scope.$on('serverConnected', angular.bind(this, function() {
            this.handleServerReconnect();
        }));

        // alert user when attempt to add component state to notebook that already exists in notebook
        this.$scope.$on('notebookAddDuplicateAttempt', angular.bind(this, function (event, args) {
            this.$mdDialog.show(
                this.$mdDialog.alert()
                    .parent(angular.element(document.body))
                    .title('Item already exists in Notebook')
                    .content('You can add another version of the item by making changes and then adding it again.')
                    .ariaLabel('Notebook Duplicate')
                    .clickOutsideToClose(true)
                    .ok('OK')
                    .targetEvent(event)
            );
        }));

        // show list of revisions in a dialog when user clicks the show revisions link for a component
        this.$scope.$on('showRevisions', angular.bind(this, function (event, args) {
            let revisions = args.revisions;
            let componentController = args.componentController;
            let allowRevert = args.allowRevert;
            let $event = args.$event;
            let revisionsTemplateUrl = scope.themePath + '/templates/componentRevisions.html';

            this.$mdDialog.show({
                parent: angular.element(document.body),
                targetEvent: $event,
                templateUrl: revisionsTemplateUrl,
                locals: {
                    items: revisions.reverse(),
                    componentController: componentController,
                    allowRevert: allowRevert
                },
                controller: RevisionsController
            });
            function RevisionsController($scope, $mdDialog, items, componentController, allowRevert) {
                $scope.items = items;
                $scope.componentController = componentController;
                $scope.allowRevert = allowRevert;
                $scope.close = function() {
                    $mdDialog.hide();
                };
                $scope.revertWork = function(componentState) {
                    $scope.componentController.setStudentWork(componentState);
                    $scope.componentController.studentDataChanged();
                    $mdDialog.hide();
                };
            }
            RevisionsController.$inject = ["$scope", "$mdDialog", "items", "componentController", "allowRevert"];
        }));

        this.$scope.$on('showStudentAssets', (event, args) => {
            let componentController = args.componentController;
            let $event = args.$event;
            let studentAssetDialogTemplateUrl = scope.themePath + '/templates/studentAssetDialog.html';
            let studentAssetTemplateUrl = scope.themePath + '/studentAsset/studentAsset.html';

            this.$mdDialog.show({
                parent: angular.element(document.body),
                targetEvent: $event,
                templateUrl: studentAssetDialogTemplateUrl,
                locals: {
                    studentAssetTemplateUrl: studentAssetTemplateUrl,
                    componentController: componentController
                },
                controller: StudentAssetDialogController
            });
            function StudentAssetDialogController($scope, $mdDialog, componentController) {
                $scope.studentAssetTemplateUrl = studentAssetTemplateUrl;
                $scope.componentController = componentController;
                $scope.closeDialog = function () {
                    $mdDialog.hide();
                }
            }
            StudentAssetDialogController.$inject = ["$scope", "$mdDialog", "componentController"];
        });

        this.$scope.$on('showNotebook', angular.bind(this, function (event, args) {
            alert('show notebook not implemented yet!');
            /*
             TODO: delete me after confirming that this is no longer used

             let notebookFilters = args.notebookFilters;
            let componentController = args.componentController;
            let $event = args.$event;
            let notebookDialogTemplateUrl = scope.themePath + '/templates/notebookDialog.html';
            let notebookTemplateUrl = scope.themePath + '/notebook/notebook.html';

            this.$mdDialog.show({
                parent: angular.element(document.body),
                targetEvent: $event,
                templateUrl: notebookDialogTemplateUrl,
                locals: {
                    notebookFilters: notebookFilters,
                    notebookTemplateUrl: notebookTemplateUrl,
                    componentController: componentController
                },
                controller: NotebookDialogController
            });
            function NotebookDialogController($scope, $mdDialog, componentController) {
                $scope.notebookFilters = notebookFilters;
                $scope.notebookFilter = notebookFilters[0].name;
                $scope.notebookTemplateUrl = notebookTemplateUrl;
                $scope.componentController = componentController;
                $scope.closeDialog = function () {
                    $mdDialog.hide();
                }
            }
            NotebookDialogController.$inject = ["$scope", "$mdDialog", "componentController"];
             */
        }));

        // capture notebook open/close events
        this.$mdComponentRegistry.when('notebook').then(function(it){
            this.$scope.$watch(function() {
                return it.isOpen();
            }, (isOpenNewValue, isOpenOldValue) => {
                if (isOpenNewValue !== isOpenOldValue) {
                    let currentNode = this.StudentDataService.getCurrentNode();
                    this.NotebookService.saveNotebookToggleEvent(isOpenNewValue, currentNode);
                }
            });
        }.bind(this));
    }

    showProjectStatus($event) {
        if (this.projectStatusOpen) {
            this.$mdToast.hide(this.statusDisplay);
            this.projectStatusOpen = false;
        } else {
            this.$mdToast.show(this.statusDisplay);
            this.projectStatusOpen = true;
        }
    }

    // show server error alert when connection is lost
    handleServerDisconnect() {
        if (!this.connectionLostShown) {
          this.$mdToast.show(this.connectionLostDisplay);
          this.connectionLostShown = true;
        }
    }

    // hide server error alert when connection is restored
    handleServerReconnect() {
        this.$mdToast.hide(this.connectionLostDisplay);
        this.connectionLostShown = false;
    }
}


ThemeController.$inject = [
    '$scope',
    'ConfigService',
    'ProjectService',
    'StudentDataService',
    'NotebookService',
    'SessionService',
    '$mdDialog',
    '$mdToast',
    '$mdComponentRegistry'
];

export default ThemeController;
