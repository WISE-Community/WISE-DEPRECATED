'use strict';

import EditNotebookItemController from './notebook/editNotebookItemController';

class ThemeController {
    constructor($scope,
                $state,
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
        this.$state = $state;
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
        this.idToOrder = this.ProjectService.idToOrder;

        this.rootNode = this.ProjectService.rootNode;
        this.rootNodeStatus = this.nodeStatuses[this.rootNode.id];

        this.workgroupId = this.ConfigService.getWorkgroupId();
        this.workgroupUserNames = this.ConfigService.getUserNamesByWorkgroupId(this.workgroupId);

        this.notebookOpen = false;
        this.notebookConfig = this.NotebookService.getNotebookConfig();
        this.notebookFilter = '';

        this.currentNode = this.StudentDataService.getCurrentNode();

        this.planningMode = false;

        // set current notebook type filter to first enabled type
        if (this.notebookConfig.enabled) {
            for (var type in this.notebookConfig.itemTypes) {
                let prop = this.notebookConfig.itemTypes[type];
                if (this.notebookConfig.itemTypes.hasOwnProperty(type) && prop.enabled) {
                    this.notebookFilter = type;
                    break;
                }
            }
        }

        // build server disconnect display
        this.connectionLostDisplay = $mdToast.build({
            template: '<md-toast>\
                      <span>Server error. Check your internet connection.</span>\
                      </md-toast>',
            hideDelay: 0
        });
        this.connectionLostShown = false;

        this.setLayoutState();

        // update layout state when current node changes
        this.$scope.$on('currentNodeChanged', (event, args) => {
            this.currentNode = this.StudentDataService.getCurrentNode();
            this.setLayoutState();
        });

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

        // alert user when inactive for a long time
        this.$scope.$on('showRequestLogout', (ev) => {
            this.$translate(["serverUpdate", "serverUpdateRequestLogoutMessage", "ok"]).then((translations) => {

                let alert = this.$mdDialog.confirm()
                    .parent(angular.element(document.body))
                    .title(translations.serverUpdate)
                    .textContent(translations.serverUpdateRequestLogoutMessage)
                    .ariaLabel(translations.serverUpdate)
                    .targetEvent(ev)
                    .ok(translations.ok);

                this.$mdDialog.show(alert).then(() => {
                    // do nothing
                }, () => {
                    // do nothing
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
            let revisionsTemplateUrl = this.themePath + '/templates/componentRevisions.html';

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
            let studentAssetDialogTemplateUrl = this.themePath + '/templates/studentAssetDialog.html';
            let studentAssetTemplateUrl = this.themePath + '/studentAsset/studentAsset.html';

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

        // toggle notebook opened or closed on 'toggleNotebook' event
        this.$scope.$on('toggleNotebook', (event, args) => {
            let ev = args.ev;
            let open = args.open;
            this.toggleNotebook(ev, open);
        });

        // toggle notebook nav opened or closed on 'toggleNotebookNav' event
        this.$scope.$on('toggleNotebookNav', () => {
            this.toggleNotebookNav();
        });

        // update notebook filter on 'setNotebookFilter' event
        this.$scope.$on('setNotebookFilter', (event, args) => {
            let filter = args.filter;
            this.notebookFilter = filter;
        });

        // show edit note dialog on 'editNote' event
        this.$scope.$on('editNote', (event, args) => {
            let itemId = args.itemId;
            let ev = args.ev;
            this.editNote(itemId, true, null, ev);
        });

        // show edit note dialog on 'addNewNote' event
        this.$scope.$on('addNewNote', (event, args) => {
            let ev = args.ev;
            let file = args.file;
            this.editNote(null, true, file, ev);
        });

        // show delete note confirm dialog on 'deleteNote' event
        this.$scope.$on('deleteNote', (event, args) => {
            let itemId = args.itemId;
            let ev = args.ev;
            this.deleteNote(itemId, ev);
        });

        // a group node has turned on or off planning mode
        this.$scope.$on('togglePlanningMode', (event, args) => {
            this.planningMode = args.planningMode;
        });

        // handle request for notification dismiss codes
        this.$scope.$on('viewCurrentAmbientNotification', (event, args) => {
            let notification = args.notification;
            let ev = args.event;
            let notificationDismissDialogTemplateUrl = this.themePath + '/templates/notificationDismissDialog.html';

            this.$translate(["dismissNotificationDismissCodeTitle", "dismissNotificationDismissCodeMessage", "ok", "cancel"]).then((translations) => {
                let dismissCodePrompt = {
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    templateUrl: notificationDismissDialogTemplateUrl,
                    locals: {
                        notification: notification
                    },
                    controller: DismissCodeDialogController
                };
                DismissCodeDialogController.$inject = ['$scope', '$mdDialog', '$translate', 'NotificationService', 'ProjectService', 'StudentDataService', 'notification'];

                function DismissCodeDialogController($scope, $mdDialog, $translate, NotificationService, ProjectService, StudentDataService, notification) {
                    $scope.input = {
                        dismissCode: ""
                    };
                    $scope.message = "";
                    $scope.notification = notification;
                    $scope.hasDismissCode = false;
                    if (notification.data) {
                        if (notification.data.dismissCode) {
                            $scope.hasDismissCode = true;
                        }
                    }
                    $scope.nodePositionAndTitle = ProjectService.getNodePositionAndTitleByNodeId(notification.nodeId);

                    $scope.checkDismissCode = function() {
                        if (!$scope.hasDismissCode || ($scope.input.dismissCode == notification.data.dismissCode)) {
                            NotificationService.dismissNotification(notification);
                            $mdDialog.hide();
                            // log currentAmbientNotificationDimissed event
                            var nodeId = null;
                            var componentId = null;
                            var componentType = null;
                            var category = "Notification";
                            var event = "currentAmbientNotificationDimissedWithCode";
                            var eventData = {};
                            StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);
                        } else {
                            $translate(["dismissNotificationInvalidDismissCode"]).then((translations) => {
                                $scope.errorMessage = translations.dismissNotificationInvalidDismissCode;
                            });
                        }
                    };
                    $scope.visitNode = function() {
                        if (!$scope.hasDismissCode) {
                            // only dismiss notifications that don't require a dismiss code, but still allow them to move to the node
                            NotificationService.dismissNotification(null, $scope.notification);
                        }

                        let goToNodeId = $scope.notification.nodeId;
                        if (goToNodeId != null) {
                            StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(goToNodeId);
                        }
                    };

                    $scope.closeDialog = function() {
                        $mdDialog.hide();

                        // log currentAmbientNotificationWindowClosed event
                        var nodeId = null;
                        var componentId = null;
                        var componentType = null;
                        var category = "Notification";
                        var event = "currentAmbientNotificationWindowClosed";
                        var eventData = {};
                        StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);
                    }
                }

                this.$mdDialog.show(dismissCodePrompt);

                // log currentAmbientNotificationWindowOpened event
                var nodeId = null;
                var componentId = null;
                var componentType = null;
                var category = "Notification";
                var event = "currentAmbientNotificationWindowOpened";
                var eventData = {};
                this.StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);
            });
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

    /**
    * Set the layout state of the vle
    * @param state string specifying state (e.g. 'notebook'; optional)
    */
    setLayoutState(state) {
        let layoutState = 'nav'; // default layout state
        if (state) {
            layoutState = state;
        } else {
            // no state was sent, so set based on current node
            if (this.currentNode) {
                var id = this.currentNode.id;
                if (this.ProjectService.isApplicationNode(id)) {
                    // currently viewing step, so show step view
                    layoutState = 'node';
                } else if (this.ProjectService.isGroupNode(id)) {
                    // currently viewing group node, so show navigation view
                    layoutState = 'nav';
                }
            }
        }

        if (layoutState === 'notebook') {
            this.$state.go('root.notebook', {nodeId: this.currentNode.id});
        } else {
            this.notebookNavOpen = false;
            this.$state.go('root.vle', {nodeId: this.currentNode.id});
        }

        this.layoutState = layoutState;
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
        return this.ConfigService.getAvatarColorForWorkgroupId(workgroupId);
    }

    /**
    * Open or close the notebook and save notebook open/close events
    */
    toggleNotebook(ev, open) {
        //this.notebookOpen = !this.notebookOpen;
        if (this.layoutState === 'notebook' && !open) {
            this.setLayoutState();
            this.NotebookService.saveNotebookToggleEvent(false, this.currentNode);
        } else {
            this.layoutState = 'notebook';
            this.setLayoutState('notebook');
            this.NotebookService.saveNotebookToggleEvent(true, this.currentNode);
        }
    }

    /**
     * Open or close the notebook nav menu
     */
    toggleNotebookNav() {
        this.notebookNavOpen = !this.notebookNavOpen;
    }

    /**
     * Delete the note specified by the itemId.
     */
    deleteNote(itemId, ev) {
        this.$translate(["deleteNoteConfirmMessage", "delete", "cancel"]).then((translations) => {
            let confirm = this.$mdDialog.confirm()
                .title(translations.deleteNoteConfirmMessage)
                .ariaLabel('delete note confirmation')
                .targetEvent(ev)
                .ok(translations.delete)
                .cancel(translations.cancel);

            this.$mdDialog.show(confirm).then(() => {
                let noteCopy = angular.copy(this.NotebookService.getLatestNotebookItemByLocalNotebookItemId(itemId));
                noteCopy.id = null; // set to null so we're creating a new notebook item. An edit to a notebook item results in a new entry in the db.
                noteCopy.content.clientSaveTime = Date.parse(new Date());  // set save timestamp
                let clientDeleteTime = Date.parse(new Date());  // set delete timestamp
                this.NotebookService.saveNotebookItem(noteCopy.id, noteCopy.nodeId, noteCopy.localNotebookItemId,
                    noteCopy.type, noteCopy.title, noteCopy.content, noteCopy.content.clientSaveTime, clientDeleteTime);
            }, () => {
                // they chose not to delete. Do nothing, the dialog will close.
            });
        });
    }

    editNote(itemId, isEditMode, file, ev) {
        let showFullScreen = this.$mdMedia('xs');
        let notebookItemTemplate = this.themePath + '/notebook/editNotebookItem.html';

        // Display a dialog where students can view/add/edit a notebook item
        this.$mdDialog.show({
            parent: angular.element(document.body),
            targetEvent: ev,
            fullscreen: showFullScreen,
            templateUrl: notebookItemTemplate,
            controller: EditNotebookItemController,
            controllerAs: 'editNotebookItemController',
            bindToController: true,
            locals: {
                itemId: itemId,
                isEditMode: isEditMode,
                file: file
            }
        });
    }

    /**
     * The user has moved the mouse so we will notify the Session Service
     * so that it can refresh the session
     */
    mouseMoved() {
        /*
         * notify the Session Service that the user has moved the mouse
         * so we can refresh the session
         */
        this.SessionService.mouseMoved();
    }
}


ThemeController.$inject = [
    '$scope',
    '$state',
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
