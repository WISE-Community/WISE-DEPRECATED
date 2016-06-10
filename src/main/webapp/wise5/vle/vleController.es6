'use strict';

class VLEController {
    constructor($scope,
                $rootScope,
                $mdDialog,
                $mdMedia,
                $state,
                $translate,
                ConfigService,
                NotebookService,
                NotificationService,
                ProjectService,
                SessionService,
                StudentDataService,
                StudentWebSocketService,
                UtilService) {

        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.$mdDialog = $mdDialog;
        this.$mdMedia = $mdMedia;
        this.$state = $state;
        this.$translate = $translate;
        this.ConfigService = ConfigService;
        this.NotebookService = NotebookService;
        this.NotificationService = NotificationService;
        this.ProjectService = ProjectService;
        this.SessionService = SessionService;
        this.StudentDataService = StudentDataService;
        this.StudentWebSocketService = StudentWebSocketService;
        this.UtilService = UtilService;

        this.currentNode = null;
        this.pauseDialog = null;
        this.noteDialog = null;

        this.navFilters = this.ProjectService.getFilters();
        this.navFilter = this.navFilters[0].name;

        this.projectStyle = this.ProjectService.getStyle();
        this.projectName = this.ProjectService.getProjectTitle();

        // get the total score for the workgroup
        this.totalScore = this.StudentDataService.getTotalScore();

        // get the max score for the project
        this.maxScore = this.ProjectService.getMaxScore();

        this.$scope.$on('currentNodeChanged', (event, args) => {
            var previousNode = args.previousNode;
            var currentNode = this.StudentDataService.getCurrentNode();
            var currentNodeId = currentNode.id;

            this.StudentDataService.updateStackHistory(currentNodeId);
            this.StudentDataService.updateVisitedNodesHistory(currentNodeId);
            this.StudentDataService.updateNodeStatuses();

            this.StudentWebSocketService.sendStudentStatus();
            this.$state.go('root.vle', {nodeId:currentNodeId});

            var componentId, componentType, category, eventName, eventData, eventNodeId;
            if (previousNode != null && this.ProjectService.isGroupNode(previousNode.id)) {
                // going from group to node or group to group
                componentId = null;
                componentType = null;
                category = "Navigation";
                eventName = "nodeExited";
                eventData = {
                    nodeId: previousNode.id
                };
                eventNodeId = previousNode.id;
                this.StudentDataService.saveVLEEvent(eventNodeId, componentId, componentType, category, eventName, eventData);
            }

            if (this.ProjectService.isGroupNode(currentNodeId)) {
                // save nodeEntered event if this is a group
                componentId = null;
                componentType = null;
                category = "Navigation";
                eventName = "nodeEntered";
                eventData = {
                    nodeId: currentNode.id
                };
                eventNodeId = currentNode.id;
                this.StudentDataService.saveVLEEvent(eventNodeId, componentId, componentType, category, eventName, eventData);
            }
        });

        this.notifications = this.NotificationService.notifications;
        // watch for changes in notifications
        this.$scope.$watch(
            () => {
                return this.NotificationService.notifications.length;
            },
            (newValue, oldValue) => {
                this.notifications = this.NotificationService.notifications;
            }
        );

        this.$scope.$on('componentStudentDataChanged', () => {
            this.StudentDataService.updateNodeStatuses();
        });

        // listen for the pause screen event
        this.$scope.$on('pauseScreen', (event, args) => {
            this.pauseScreen();
        });

        // listen for the unpause screen event
        this.$scope.$on('unPauseScreen', (event, args) => {
            this.unPauseScreen();
        });

        this.$scope.$on('requestImageCallback', (event, args) => {

            // initialize the snippable items
            if (this.snippableItems == null) {
                this.snippableItems = [];
            }

            if (args.imageObject != null) {
                // add the image object as a snippable item
                this.snippableItems.push(args.imageObject);
            }

            if (args.imageObjects != null) {

                // loop through the image objects
                for (var i = 0; i < args.imageObjects.length; i++) {

                    var imageObject = args.imageObjects[i];

                    if (imageObject != null) {
                        // add the image object as a snippable item
                        this.snippableItems.push(imageObject);
                    }
                }
            }
        });

        // Make sure if we drop something on the page we don't navigate away
        // https://developer.mozilla.org/En/DragDrop/Drag_Operations#drop
        $(document.body).on('dragover', function(e) {
            e.preventDefault();
            return false;
        });

        $(document.body).on('drop', function(e){
            e.preventDefault();
            return false;
        });

        this.themePath = this.ProjectService.getThemePath();
        this.notebookItemPath = this.themePath + '/notebook/notebookItem.html';

        var nodeId = null;
        var stateParams = null;
        var stateParamNodeId = null;

        if (this.$state != null) {
            stateParams = this.$state.params;
        }

        if (stateParams != null) {
            stateParamNodeId = stateParams.nodeId;
        }

        if (stateParamNodeId != null && stateParamNodeId !== '') {
            nodeId = stateParamNodeId;
        } else {
            var latestComponentState = this.StudentDataService.getLatestComponentState();

            if (latestComponentState != null) {
                nodeId = latestComponentState.nodeId;
            }
        }

        if (nodeId == null || nodeId === '') {
            nodeId = this.ProjectService.getStartNodeId();
        }

        this.StudentDataService.setCurrentNodeByNodeId(nodeId);

        // get the run status to see if the period is currently paused
        var runStatus = this.StudentDataService.getRunStatus();

        if (runStatus != null) {
            var pause = false;
            if (runStatus.allPeriodsPaused) {
                pause = true;
            } else {
                // get the signed in user's period id
                var periodId = this.ConfigService.getPeriodId();

                if (periodId != null) {
                    var periods = runStatus.periods;

                    if (periods != null) {

                        // loop through all the periods in the run status
                        for (var p = 0; p < periods.length; p++) {
                            var tempPeriod = periods[p];

                            if (periodId === tempPeriod.periodId) {
                                if (tempPeriod.paused) {
                                    // our period is paused so we will pause the screen
                                    pause = true;
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            if (pause) {
                this.pauseScreen();
            }
        }
    }

    visitNode(nodeId) {
        this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(nodeId);
    }

    isNotebookEnabled() {
        return this.NotebookService.isNotebookEnabled();
    }

    // TODO: remove and use inline clipping (with guidance)
    snipNewNote($event) {
        // Ask all of the components on the page for snippable items
        let templateUrl = this.themePath + '/notebook/contentSnipper.html';

        let currentNodeId = this.StudentDataService.getCurrentNodeId();
        let currentComponents = this.ProjectService.getComponentsByNodeId(currentNodeId);

        /*
         * initialize the snippable items array that will become populated
         * with snippable items
         */
        this.snippableItems = [];

        for (let c = 0; c < currentComponents.length; c++) {
            let currentComponent = currentComponents[c];
            var args = {};
            args.nodeId = currentNodeId;
            args.componentId = currentComponent.id;

            this.$rootScope.$broadcast('requestImage', args);
        }
        this.$mdDialog.show({
            parent: angular.element(document.body),
            targetEvent: $event,
            templateUrl: templateUrl,
            clickOutsideToClose: true,
            locals: {
                snippableItems: this.snippableItems
            },
            controller: NotebookContentSnippetController,
            controllerAs: 'notebookContentSnippetController',
            bindToController: true
        });
        function NotebookContentSnippetController($rootScope, $scope, $mdDialog, snippableItems, NotebookService, StudentDataService, ProjectService) {
            $scope.NotebookService = NotebookService;
            $scope.StudentDataService = StudentDataService;
            $scope.ProjectService = ProjectService;
            $scope.snippableItems = snippableItems;

            // loop through the snippable items
            for (var s = 0; s < snippableItems.length; s++) {
                var snippableItem = snippableItems[s];

                if (snippableItem != null) {
                    /*
                     * create a local browser URL for the snippable item so
                     * we can display it as an image
                     */
                    snippableItem.url = URL.createObjectURL(snippableItem);
                }
            }

            $scope.close = () => {
                $mdDialog.hide();
            };
            $scope.chooseSnippet = (snippableItem) => {

                // add the snippable item
                $scope.NotebookService.addNewItem($event, snippableItem);

                $mdDialog.hide();
            };
        }

        NotebookContentSnippetController.$inject = ["$rootScope", "$scope", "$mdDialog", "snippableItems", "NotebookService", "StudentDataService", "ProjectService"];
    }

    goHome() {
        // save goHome event
        var nodeId = null;
        var componentId = null;
        var componentType = null;
        var category = "Navigation";
        var event = "goHomeButtonClicked";
        var eventData = {};
        this.StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);

        this.$rootScope.$broadcast('goHome');
    };

    logOut() {
        // save logOut event
        var nodeId = null;
        var componentId = null;
        var componentType = null;
        var category = "Navigation";
        var event = "logOutButtonClicked";
        var eventData = {};
        this.StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);

        this.$rootScope.$broadcast('logOut');
    };

    loadRoot() {
        this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(this.ProjectService.rootNode.id);
    };

    /**
     * The user moved the mouse on the page
     */
    mouseMoved() {
        // tell the session service a mouse event occurred
        // so it can reset the session timeout timers
        this.SessionService.mouseEventOccurred();
    };

    /**
     * Returns true iff there are new notifications
     */
    hasNewNotifications() {
        return this.getNewNotifications().length > 0;
    }

    /**
     * Returns all notifications that have not been dismissed yet
     */
    getNewNotifications() {
        return this.notifications.filter(
            function(notification) {
                return notification.timeDismissed == null;
            }
        );
    }

    /**
     * Dismiss all new notifications
     */
    dismissAllNotifications(ev) {
        this.$translate(["dismissNotificationsTitle", "dismissNotificationsMessage", "yes", "no"]).then((translations) => {
            let confirm = this.$mdDialog.confirm()
                .parent(angular.element($('._md-open-menu-container._md-active')))// TODO: hack for now (showing md-dialog on top of md-menu)
                .ariaLabel(translations.dismissNotificationsTitle)
                .textContent(translations.dismissNotificationsMessage)
                .targetEvent(ev)
                .ok(translations.yes)
                .cancel(translations.no);

            this.$mdDialog.show(confirm).then(() => {
                let newNotifications = this.getNewNotifications();
                newNotifications.map((newNotification) => {
                    this.dismissNotification(newNotification);
                });
            });
        });
    }

    /**
     * Dismiss the specified notification
     * @param notification
     */
    dismissNotification(notification) {
        notification.timeDismissed = Date.parse(new Date());
        this.NotificationService.saveNotificationToServer(notification);  // also save to server
    }

    /**
     * Pause the screen
     */
    pauseScreen() {
        // TODO: i18n
        this.pauseDialog = this.$mdDialog.show({
            template: '<md-dialog aria-label="Screen Paused"><md-dialog-content><div class="md-dialog-content">Your teacher has paused all the screens in the class.</div></md-dialog-content></md-dialog>',
            fullscreen: true,
            escapeToClose: false
        });
    }

    /**
     * Unpause the screen
     */
    unPauseScreen() {
        this.$mdDialog.hide( this.pauseDialog, "finished" );
        this.pauseDialog = undefined;
    }

    /**
     * Snip an image from the VLE
     * @param $event the click event from the student clicking on the image
     */
    snipImage($event) {

        // get the target that was clicked
        var imageElement = $event.target;

        if (imageElement != null) {

            // create an image object
            var imageObject = this.UtilService.getImageObjectFromImageElement(imageElement);

            if (imageObject != null) {

                // create a notebook item with the image populated into it
                this.NotebookService.addNewItem($event, imageObject);
            }
        }
    }
}

VLEController.$inject = [
    '$scope',
    '$rootScope',
    '$mdDialog',
    '$mdMedia',
    '$state',
    '$translate',
    'ConfigService',
    'NotebookService',
    'NotificationService',
    'ProjectService',
    'SessionService',
    'StudentDataService',
    'StudentWebSocketService',
    'UtilService'
];

export default VLEController;
