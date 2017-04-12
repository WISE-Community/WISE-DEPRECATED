'use strict';

class VLEController {
    constructor($scope,
                $rootScope,
                $filter,
                $mdDialog,
                $mdMenu,
                $state,
                AnnotationService,
                ConfigService,
                NotebookService,
                NotificationService,
                ProjectService,
                SessionService,
                StudentDataService,
                UtilService) {

        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.$filter = $filter;
        this.$mdDialog = $mdDialog;
        this.$mdMenu = $mdMenu;
        this.$state = $state;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.NotebookService = NotebookService;
        this.NotificationService = NotificationService;
        this.ProjectService = ProjectService;
        this.SessionService = SessionService;
        this.StudentDataService = StudentDataService;
        this.UtilService = UtilService;

        this.$translate = this.$filter('translate');

        this.workgroupId = this.ConfigService.getWorkgroupId();
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

        this.notebookEnabled = this.NotebookService.isNotebookEnabled();

        // get the notebook config
        this.notebookConfig = this.NotebookService.getNotebookConfig();
        // Get report, if enabled; assume only one report for now
        this.reportItem = this.notebookConfig.itemTypes.report.notes[0];

        this.$scope.$on('currentNodeChanged', (event, args) => {
            var previousNode = args.previousNode;
            var currentNode = this.StudentDataService.getCurrentNode();
            var currentNodeId = currentNode.id;

            this.StudentDataService.updateStackHistory(currentNodeId);
            this.StudentDataService.updateVisitedNodesHistory(currentNodeId);
            this.StudentDataService.updateNodeStatuses();
            this.StudentDataService.saveStudentStatus();
            //this.AnnotationService.updateAnnotations();

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
                this.newNotifications = this.getNewNotifications();
            }
        );

        this.$scope.$on('notificationChanged', (event, notification) => {
            // update new notifications
            this.notifications = this.NotificationService.notifications;
            this.newNotifications = this.getNewNotifications();
        });

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
            /*
             * get the node id for the latest node entered event for an active
             * node that exists in the project
             */
            nodeId = this.StudentDataService.getLatestNodeEnteredEventNodeIdWithExistingNode();
        }

        if (nodeId == null || nodeId === '') {
            nodeId = this.ProjectService.getStartNodeId();
        }

        this.StudentDataService.setCurrentNodeByNodeId(nodeId);

        // get the run status to see if the period is currently paused
        var runStatus = this.StudentDataService.getRunStatus();

        if (runStatus != null) {
            var pause = false;

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

            if (pause) {
                this.pauseScreen();
            }
        }
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
        return this.newNotifications.length > 0;
    }

    /**
     * Returns true iff there are new notifications of type 'ambient'
     */
    hasNewAmbientNotifications() {
        return this.getNewAmbientNotifications().length > 0;
    }

    /**
     * Returns all notifications that have not been dismissed yet
     * The newNotifications is an array of notification aggregate objects that looks like this:
     * [
     *  {
     *    "nodeId": "node2",
     *    "type": "DiscussionReply",   // ["DiscussionReply", "teacherToStudent"]
     *    "notifications": [{ id: 1117} , { id: 1120 }]      // array of actual undismissed notifications with this nodeId and type
     *  },
     *  ...
     * ]
     * The annotation aggregates will be sorted by latest first -> oldest last
     */
    getNewNotifications() {
        let newNotificationAggregates = [];
        // get activeNotifications
        for (let notification of this.notifications) {
            if (notification.timeDismissed == null) {
                // go through all the undimissed notifications and populate the newNotifications array
                let notificationNodeId = notification.nodeId;
                let notificationType = notification.type;
                let newNotificationForNodeIdAndTypeExists = false;
                for (let newNotificationAggregate of newNotificationAggregates) {
                    if (newNotificationAggregate.nodeId == notificationNodeId && newNotificationAggregate.type == notificationType) {
                        newNotificationForNodeIdAndTypeExists = true;
                        newNotificationAggregate.notifications.push(notification);
                        // update latestNotificationTimestamp if needed
                        if (notification.timeGenerated > newNotificationAggregate.latestNotificationTimestamp) {
                            newNotificationAggregate.latestNotificationTimestamp = notification.timeGenerated;
                        }
                    }
                }
                let notebookItemId = null;  // if this notification was created because teacher commented on a notebook report.
                if (!newNotificationForNodeIdAndTypeExists) {
                    let message = "";
                    if (notificationType === "DiscussionReply") {
                        message = this.$translate('newRepliesOnDiscussionPost');
                    } else if (notificationType === "teacherToStudent") {
                        message = this.$translate('newFeedbackFromTeacher');
                        if (notification.data != null) {
                            if (typeof notification.data === 'string') {
                                notification.data = angular.fromJson(notification.data);
                            }

                            if (notification.data.annotationId != null) {
                                let annotation = this.AnnotationService.getAnnotationById(notification.data.annotationId);
                                if (annotation != null && annotation.notebookItemId != null) {
                                    notebookItemId = annotation.notebookItemId;
                                }
                            }
                        }
                    } else if (notificationType === "CRaterResult") {
                        message = this.$translate('newFeedback');
                    }
                    let newNotificationAggregate = {
                        latestNotificationTimestamp: notification.timeGenerated,
                        message: message,
                        nodeId: notificationNodeId,
                        notebookItemId: notebookItemId,
                        notifications: [notification],
                        type: notificationType
                    };
                    newNotificationAggregates.push(newNotificationAggregate);
                }
            }
        }

        // now sort the aggregates by latestNotificationTimestamp, latest -> oldest
        newNotificationAggregates.sort((n1, n2) => {
            return n2.latestNotificationTimestamp - n1.latestNotificationTimestamp;
        });
        return newNotificationAggregates;
    }

    /**
     * Returns all ambient notifications that have not been dismissed yet
     */
    getNewAmbientNotifications() {
        return this.notifications.filter(
            function(notification) {
                let isAmbient = notification.data ? notification.data.isAmbient : false;
                return (notification.timeDismissed == null && isAmbient);
            }
        );
    }

    /**
     * Dismiss the specified notification
     * @param notification
     */
    dismissNotification(event, notification) {
        if (notification.data == null || notification.data.dismissCode == null) {
            // no dismiss code needed, so we can dismiss it
            this.NotificationService.dismissNotification(notification);
        } else {
            // ask user to input dimiss code before dimissing it
            let args = {
                event: event,
                notification: notification
            };
            this.$rootScope.$broadcast('viewCurrentAmbientNotification', args);

            // hide any open menus (i.e. the notifications menu)
            this.$mdMenu.hide();
        }
    }

    /**
     * View the most recent ambient notification and allow teacher to input
     * dismiss code
     */
    viewCurrentAmbientNotification(event) {
        let ambientNotifications = this.getNewAmbientNotifications();
        if (ambientNotifications.length) {
            let currentNotification = ambientNotifications[0];
            let args = {};
            args.event = event;
            args.notification = currentNotification;
            this.$rootScope.$broadcast('viewCurrentAmbientNotification', args);
        }
    }

    /**
     * Dismiss the notification aggregate object, which effectively dismisses all notifications
     * for the nodeId and type of the aggregate object.
     * @param event
     * @param notificationAggregate
     */
    dismissNotificationAggregate(event, notificationAggregate) {
        if (notificationAggregate != null && notificationAggregate.notifications != null) {
            for (let notification of notificationAggregate.notifications) {
                this.dismissNotification(event, notification);
            }
        }
    };

    /**
     * Dismiss the specified notification aggregate object and visit the node
     * @param notificationAggregate, which contains nodeId, type, and notifications of that nodeId and type
     */
    dismissNotificationAggregateAndVisitNode(event, notificationAggregate) {
        if (notificationAggregate != null && notificationAggregate.notifications != null) {
            for (let notification of notificationAggregate.notifications) {
                if (notification.data == null || notification.data.dismissCode == null) {
                    // only dismiss notifications that don't require a dismiss code, but still allow them to move to the node
                    this.dismissNotification(event, notification);
                }
            }
        }

        let goToNodeId = notificationAggregate.nodeId;
        let notebookItemId = notificationAggregate.notebookItemId;
        if (goToNodeId != null) {
            this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(goToNodeId);
        } else if (notebookItemId != null) {
            // assume notification with notebookItemId is for the report for now,
            // as we don't currently support annotations on notes

            // show report annotations
            this.$rootScope.$broadcast('showReportAnnotations', {ev: event});

            /*let notebookItem = this.NotebookService.getNotebookItemByNotebookItemId(notebookItemId, this.workgroupId);
            if (notebookItem != null) {


                if (notebookItem.type === "note") {
                    // open note view
                    this.$rootScope.$broadcast('setNotebookFilter', {filter: "note", ev: event});
                    this.$rootScope.$broadcast('toggleNotebook', {ev: event, open: true});
                } else if (notebookItem.type === "report") {
                    // open report view
                    this.$rootScope.$broadcast('setNotebookFilter', {filter: "report", ev: event});
                    this.$rootScope.$broadcast('toggleNotebook', {ev: event, open: true});
                }
            }*/
        }
    }

    /**
     * Pause the screen
     */
    pauseScreen() {
        // TODO: i18n
        this.pauseDialog = this.$mdDialog.show({
            template: '<md-dialog aria-label="Screen Paused"><md-dialog-content><div class="md-dialog-content">' + this.$translate('yourTeacherHasPausedAllTheScreensInTheClass') + '</div></md-dialog-content></md-dialog>',
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
     * Check if the VLE is in preview mode
     * @return whether the VLE is in preview mode
     */
    isPreview() {
        return this.ConfigService.isPreview();
    }

    /**
     * Check if there are any constraints in the project
     * @return whether there are any constraints in the project
     */
    hasConstraints() {

        var hasActiveConstraints = false;

        // get the active constraints
        var activeConstraints = this.ProjectService.activeConstraints;

        if (activeConstraints != null && activeConstraints.length > 0) {
            // there are active constraints
            hasActiveConstraints = true;
        }

        return hasActiveConstraints;
    }

    /**
     * Disable all the constraints
     */
    disableConstraints() {

        // check if we are in preview mode
        if (this.ConfigService.isPreview()) {
            // we are in preview mode so we will disable all the constraints

            // clear all the active constraints
            this.ProjectService.activeConstraints = [];

            /*
             * update the node statuses so that they are re-evaluated now that
             * all the constraints have been removed
             */
            this.StudentDataService.updateNodeStatuses();
        }
    }
}

VLEController.$inject = [
    '$scope',
    '$rootScope',
    '$filter',
    '$mdDialog',
    '$mdMenu',
    '$state',
    'AnnotationService',
    'ConfigService',
    'NotebookService',
    'NotificationService',
    'ProjectService',
    'SessionService',
    'StudentDataService',
    'UtilService'
];

export default VLEController;
