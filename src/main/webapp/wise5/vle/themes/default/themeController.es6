'use strict';

class ThemeController {
    constructor($scope,
                $translate,
                ConfigService,
                ProjectService,
                StudentDataService,
                StudentStatusService,
                NotebookService,
                SessionService,
                $mdDialog,
                $mdMedia,
                $mdToast,
                $mdComponentRegistry) {

        this.$scope = $scope;
        this.$translate = $translate;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;
        this.NotebookService = NotebookService;
        this.SessionService = SessionService;
        this.StudentStatusService = StudentStatusService;
        this.$mdDialog = $mdDialog;
        this.$mdMedia = $mdMedia;
        this.$mdToast = $mdToast;
        this.$mdComponentRegistry = $mdComponentRegistry;

        // TODO: set these variables dynamically from theme settings
        this.layoutView = 'list'; // 'list' or 'card'
        this.numberProject = true;

        this.themePath = this.ProjectService.getThemePath();
        this.themeSettings = this.ProjectService.getThemeSettings();
        this.hideTotalScores = this.themeSettings.hideTotalScores;

        this.nodeStatuses = this.StudentDataService.nodeStatuses;

        this.rootNode = this.ProjectService.rootNode;
        this.rootNodeStatus = this.nodeStatuses[this.rootNode.id];

        this.workgroupId = this.ConfigService.getWorkgroupId();
        this.workgroupUserNames = this.ConfigService.getUserNamesByWorkgroupId(this.workgroupId);

        this.notebookOpen = false;

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
                      <span>Server error. Check your internet connection.</span>\
                      </md-toast>',
            hideDelay: 0
        });
        this.connectionLostShown = false;

        // alert user when a locked node has been clicked
        this.$scope.$on('nodeClickLocked', (event, args) => {
            var message = 'Sorry, you cannot view this item yet.';
            let nodeId = args.nodeId;

            var node = this.ProjectService.getNodeById(nodeId);

            if (node != null) {

                // get the constraints that affect this node
                var constraints = this.ProjectService.getConstraintsForNode(node);

                if (constraints != null && constraints.length > 0) {
                    message = '';
                }

                // loop through all the constraints that affect this node
                for (var c = 0; c < constraints.length; c++) {
                    var constraint = constraints[c];

                    // check if the constraint has been satisfied
                    if (constraint != null && !this.StudentDataService.evaluateConstraint(node, constraint)) {
                        // the constraint has not been satisfied and is still active

                        if (message != '') {
                            // separate multiple constraints with line breaks
                            message += '<br/><br/>';
                        }

                        // get the message that describes how to disable the constraint
                        message += this.ProjectService.getConstraintMessage(nodeId, constraint);
                    }
                }
            }

            this.$translate(['itemLocked', 'ok']).then((translations) => {
                this.$mdDialog.show(
                    this.$mdDialog.alert()
                        .parent(angular.element(document.body))
                        .title(translations.itemLocked)
                        .htmlContent(message)
                        .ariaLabel(translations.itemLocked)
                        .ok(translations.ok)
                        .targetEvent(event)
                );
            })
        });

        // alert user when inactive for a long time
        this.$scope.$on('showSessionWarning', (ev) => {
            this.$translate(["sessionTimeout", "autoLogoutMessage", "yes", "no"]).then((translations) => {

                let alert = this.$mdDialog.confirm()
                    .parent(angular.element(document.body))
                    .title(translations.sessionTimeout)
                    .textContent(translations.autoLogoutMessage)
                    .ariaLabel(translations.sessionTimeout)
                    .targetEvent(ev)
                    .ok(translations.yes)
                    .cancel(translations.no);

                this.$mdDialog.show(alert).then(() => {
                    this.SessionService.renewSession();
                    alert = undefined;
                }, () => {
                    this.SessionService.forceLogOut();
                });

            });
        });

        // alert user when server loses connection
        this.$scope.$on('serverDisconnected', () => {
            this.handleServerDisconnect();
        });

        // remove alert when server regains connection
        this.$scope.$on('serverConnected', () => {
            this.handleServerReconnect();
        });

        // show list of revisions in a dialog when user clicks the show revisions link for a component
        this.$scope.$on('showRevisions', (event, args) => {
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
                $scope.close = () => {
                    $mdDialog.hide();
                };
                $scope.revertWork = (componentState) => {
                    $scope.componentController.setStudentWork(componentState);
                    $scope.componentController.studentDataChanged();
                    $mdDialog.hide();
                };
            }
            RevisionsController.$inject = ["$scope", "$mdDialog", "items", "componentController", "allowRevert"];
        });

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

        this.$scope.$on('toggleNotebook', () => {
            this.toggleNotebook();
        });

        // show edit note dialog on 'editNote' event
        this.$scope.$on('editNote', (event, args) => {
            let itemId = args.itemId;
            let ev = args.ev;
            this.editNote(itemId, true, ev);
        });

        // show edit note dialog on 'addNewNote' event
        this.$scope.$on('addNewNote', (event, args) => {
            let ev = args.ev;
            let file = args.file;
            this.editNote(null, true, ev, file);
        });

        // capture notebook open/close events
        this.$mdComponentRegistry.when('notebook').then(it => {
            this.$scope.$watch(() => {
                return it.isOpen();
            }, (isOpenNewValue, isOpenOldValue) => {
                if (isOpenNewValue !== isOpenOldValue) {
                    let currentNode = this.StudentDataService.getCurrentNode();
                    this.NotebookService.saveNotebookToggleEvent(isOpenNewValue, currentNode);
                }
            });
        });
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

    getAvatarColorForWorkgroupId(workgroupId) {
        return this.StudentStatusService.getAvatarColorForWorkgroupId(workgroupId);
    }

    toggleNotebook(ev) {
        this.notebookOpen = !this.notebookOpen;
    }

    editNote(itemId, isEditEnabled, ev, file) {
        let showFullScreen = this.$mdMedia('xs');
        let notebookItemTemplate = this.themePath + '/notebook/editNotebookItem.html';
        let item = this.NotebookService.getLatestNotebookItemByLocalNotebookItemId(itemId);
        let type = item ? item.type : 'note'; // TODO: don't hardcode type once questions are enabled

        // Display a dialog where students can add/edit a notebook item
        this.$mdDialog.show({
            parent: angular.element(document.body),
            targetEvent: ev,
            fullscreen: showFullScreen,
            templateUrl: notebookItemTemplate,
            controller: EditNotebookItemController,
            locals: {
                itemId: itemId,
                isEditEnabled: isEditEnabled,
                type: type,
                file: file
            }
            //template: '<notebookitem is-edit-enabled="true" item-id="{{itemId}}"></notebookitem>'
        });

        function EditNotebookItemController($scope, $mdDialog, NotebookService) {
            $scope.itemId = itemId;
            $scope.type = type;
            $scope.isEditEnabled = isEditEnabled;
            $scope.NotebookService = NotebookService;
            $scope.item = null;
            $scope.title = ($scope.isEditEnabled ? ($scope.itemId ? 'Edit ' : 'Add ') : 'View ') + $scope.type;
            $scope.file = file;

            $scope.cancel = () => {
                $mdDialog.hide();
            };

            $scope.save = () => {
                $scope.NotebookService.saveNotebookItem($scope.item.id, $scope.item.nodeId, $scope.item.localNotebookItemId, $scope.item.type, $scope.item.title, $scope.item.content)
                    .then(() => {
                        $mdDialog.hide();
                    });
            };

            $scope.update = (item) => {
                // notebook item has changed
                $scope.item = item;
            };
        }
        EditNotebookItemController.$inject = ["$scope", "$mdDialog", "NotebookService"];
    }
}


ThemeController.$inject = [
    '$scope',
    '$translate',
    'ConfigService',
    'ProjectService',
    'StudentDataService',
    'StudentStatusService',
    'NotebookService',
    'SessionService',
    '$mdDialog',
    '$mdMedia',
    '$mdToast',
    '$mdComponentRegistry'
];

export default ThemeController;
