'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _editNotebookItemController = require('./notebook/editNotebookItemController');

var _editNotebookItemController2 = _interopRequireDefault(_editNotebookItemController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ThemeController = function () {
    function ThemeController($scope, $state, $filter, ConfigService, ProjectService, StudentDataService, StudentStatusService, NotebookService, SessionService, $mdDialog, $mdMedia, $mdToast, $mdComponentRegistry) {
        var _this = this;

        _classCallCheck(this, ThemeController);

        this.$scope = $scope;
        this.$state = $state;
        this.$filter = $filter;
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

        this.$translate = this.$filter('translate');

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
                var prop = this.notebookConfig.itemTypes[type];
                if (this.notebookConfig.itemTypes.hasOwnProperty(type) && prop.enabled) {
                    this.notebookFilter = type;
                    break;
                }
            }
        }

        // build server disconnect display
        this.connectionLostDisplay = $mdToast.build({
            template: "<md-toast>\
                      <span>{{ 'serverErrorCheckYourInternetConnection' | translate }}</span>\
                      </md-toast>",
            hideDelay: 0
        });
        this.connectionLostShown = false;

        this.setLayoutState();

        // update layout state when current node changes
        this.$scope.$on('currentNodeChanged', function (event, args) {
            _this.currentNode = _this.StudentDataService.getCurrentNode();
            _this.setLayoutState();
        });

        // alert user when a locked node has been clicked
        this.$scope.$on('nodeClickLocked', function (event, args) {
            var message = _this.$translate('sorryYouCannotViewThisItemYet');
            var nodeId = args.nodeId;

            var node = _this.ProjectService.getNodeById(nodeId);

            if (node != null) {

                // get the constraints that affect this node
                var constraints = _this.ProjectService.getConstraintsForNode(node);

                if (constraints != null && constraints.length > 0) {
                    message = '';
                }

                // loop through all the constraints that affect this node
                for (var c = 0; c < constraints.length; c++) {
                    var constraint = constraints[c];

                    // check if the constraint has been satisfied
                    if (constraint != null && !_this.StudentDataService.evaluateConstraint(node, constraint)) {
                        // the constraint has not been satisfied and is still active

                        if (message != '') {
                            // separate multiple constraints with line breaks
                            message += '<br/><br/>';
                        }

                        // get the message that describes how to disable the constraint
                        message += _this.ProjectService.getConstraintMessage(nodeId, constraint);
                    }
                }
            }

            _this.$mdDialog.show(_this.$mdDialog.alert().parent(angular.element(document.body)).title(_this.$translate('itemLocked')).htmlContent(message).ariaLabel(_this.$translate('itemLocked')).ok(_this.$translate('ok')).targetEvent(event));
        });

        // alert user when inactive for a long time
        this.$scope.$on('showSessionWarning', function (ev) {
            var alert = _this.$mdDialog.confirm().parent(angular.element(document.body)).title(_this.$translate('sessionTimeout')).textContent(_this.$translate('autoLogoutMessage')).ariaLabel(_this.$translate('sessionTimeout')).targetEvent(ev).ok(_this.$translate('yes')).cancel(_this.$translate('no'));

            _this.$mdDialog.show(alert).then(function () {
                _this.SessionService.renewSession();
                alert = undefined;
            }, function () {
                _this.SessionService.forceLogOut();
            });
        });

        // alert user when inactive for a long time
        this.$scope.$on('showRequestLogout', function (ev) {
            var alert = _this.$mdDialog.confirm().parent(angular.element(document.body)).title(_this.$translate('serverUpdate')).textContent(_this.$translate('serverUpdateRequestLogoutMessage')).ariaLabel(_this.$translate('serverUpdate')).targetEvent(ev).ok(_this.$translate('ok'));

            _this.$mdDialog.show(alert).then(function () {
                // do nothing
            }, function () {
                // do nothing
            });
        });

        // alert user when server loses connection
        this.$scope.$on('serverDisconnected', function () {
            _this.handleServerDisconnect();
        });

        // remove alert when server regains connection
        this.$scope.$on('serverConnected', function () {
            _this.handleServerReconnect();
        });

        // show list of revisions in a dialog when user clicks the show revisions link for a component
        this.$scope.$on('showRevisions', function (event, args) {
            var revisions = args.revisions;
            var componentController = args.componentController;
            var allowRevert = args.allowRevert;
            var $event = args.$event;
            var revisionsTemplateUrl = _this.themePath + '/templates/componentRevisions.html';

            _this.$mdDialog.show({
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
                $scope.close = function () {
                    $mdDialog.hide();
                };
                $scope.revertWork = function (componentState) {
                    $scope.componentController.setStudentWork(componentState);
                    $scope.componentController.studentDataChanged();
                    $mdDialog.hide();
                };
            }
            RevisionsController.$inject = ["$scope", "$mdDialog", "items", "componentController", "allowRevert"];
        });

        this.$scope.$on('showStudentAssets', function (event, args) {
            var componentController = args.componentController;
            var $event = args.$event;
            var studentAssetDialogTemplateUrl = _this.themePath + '/templates/studentAssetDialog.html';
            var studentAssetTemplateUrl = _this.themePath + '/studentAsset/studentAsset.html';

            _this.$mdDialog.show({
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
                };
            }
            StudentAssetDialogController.$inject = ["$scope", "$mdDialog", "componentController"];
        });

        // toggle notebook opened or closed on 'toggleNotebook' event
        this.$scope.$on('toggleNotebook', function (event, args) {
            var ev = args.ev;
            var open = args.open;
            _this.toggleNotebook(ev, open);
        });

        // toggle notebook nav opened or closed on 'toggleNotebookNav' event
        this.$scope.$on('toggleNotebookNav', function () {
            _this.toggleNotebookNav();
        });

        // update notebook filter on 'setNotebookFilter' event
        this.$scope.$on('setNotebookFilter', function (event, args) {
            _this.notebookFilter = args.filter;
        });

        // show edit note dialog on 'editNote' event
        this.$scope.$on('editNote', function (event, args) {
            var itemId = args.itemId;
            var ev = args.ev;
            _this.editNote(itemId, true, null, ev);
        });

        // show edit note dialog on 'addNewNote' event
        this.$scope.$on('addNewNote', function (event, args) {
            var ev = args.ev;
            var file = args.file;
            _this.editNote(null, true, file, ev);
        });

        // show delete note confirm dialog on 'deleteNote' event
        this.$scope.$on('deleteNote', function (event, args) {
            var itemId = args.itemId;
            var ev = args.ev;
            var doDelete = true;
            _this.deleteNote(itemId, ev, doDelete);
        });

        // show delete note confirm dialog on 'reviveNote' event
        this.$scope.$on('reviveNote', function (event, args) {
            var itemId = args.itemId;
            var ev = args.ev;
            var doDelete = false;
            _this.deleteNote(itemId, ev, doDelete);
        });

        // a group node has turned on or off planning mode
        this.$scope.$on('togglePlanningMode', function (event, args) {
            _this.planningMode = args.planningMode;
        });

        // handle request for notification dismiss codes
        this.$scope.$on('viewCurrentAmbientNotification', function (event, args) {
            var notification = args.notification;
            var ev = args.event;
            var notificationDismissDialogTemplateUrl = _this.themePath + '/templates/notificationDismissDialog.html';

            var dismissCodePrompt = {
                parent: angular.element(document.body),
                targetEvent: ev,
                templateUrl: notificationDismissDialogTemplateUrl,
                locals: {
                    notification: notification
                },
                controller: DismissCodeDialogController
            };
            DismissCodeDialogController.$inject = ['$scope', '$mdDialog', '$filter', 'NotificationService', 'ProjectService', 'StudentDataService', 'notification'];

            function DismissCodeDialogController($scope, $mdDialog, $filter, NotificationService, ProjectService, StudentDataService, notification) {

                $scope.$translate = $filter('translate');

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

                $scope.checkDismissCode = function () {
                    if (!$scope.hasDismissCode || $scope.input.dismissCode == notification.data.dismissCode) {
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
                        $scope.errorMessage = $scope.$translate('dismissNotificationInvalidDismissCode');
                    }
                };
                $scope.visitNode = function () {
                    if (!$scope.hasDismissCode) {
                        // only dismiss notifications that don't require a dismiss code, but still allow them to move to the node
                        NotificationService.dismissNotification(null, $scope.notification);
                    }

                    var goToNodeId = $scope.notification.nodeId;
                    if (goToNodeId != null) {
                        StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(goToNodeId);
                    }
                };

                $scope.closeDialog = function () {
                    $mdDialog.hide();

                    // log currentAmbientNotificationWindowClosed event
                    var nodeId = null;
                    var componentId = null;
                    var componentType = null;
                    var category = "Notification";
                    var event = "currentAmbientNotificationWindowClosed";
                    var eventData = {};
                    StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);
                };
            }

            _this.$mdDialog.show(dismissCodePrompt);

            // log currentAmbientNotificationWindowOpened event
            var nodeId = null;
            var componentId = null;
            var componentType = null;
            var category = "Notification";
            var event = "currentAmbientNotificationWindowOpened";
            var eventData = {};
            _this.StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);
        });

        // capture notebook open/close events
        this.$mdComponentRegistry.when('notebook').then(function (it) {
            _this.$scope.$watch(function () {
                return it.isOpen();
            }, function (isOpenNewValue, isOpenOldValue) {
                if (isOpenNewValue !== isOpenOldValue) {
                    var currentNode = _this.StudentDataService.getCurrentNode();
                    _this.NotebookService.saveNotebookToggleEvent(isOpenNewValue, currentNode);
                }
            });
        });
    }

    /**
    * Set the layout state of the vle
    * @param state string specifying state (e.g. 'notebook'; optional)
    */


    _createClass(ThemeController, [{
        key: 'setLayoutState',
        value: function setLayoutState(state) {
            var layoutState = 'nav'; // default layout state
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
                this.$state.go('root.notebook', { nodeId: this.currentNode.id });
            } else {
                this.notebookNavOpen = false;
                this.$state.go('root.vle', { nodeId: this.currentNode.id });
            }

            this.layoutState = layoutState;
        }

        // show server error alert when connection is lost

    }, {
        key: 'handleServerDisconnect',
        value: function handleServerDisconnect() {
            if (!this.connectionLostShown) {
                this.$mdToast.show(this.connectionLostDisplay);
                this.connectionLostShown = true;
            }
        }

        // hide server error alert when connection is restored

    }, {
        key: 'handleServerReconnect',
        value: function handleServerReconnect() {
            this.$mdToast.hide(this.connectionLostDisplay);
            this.connectionLostShown = false;
        }
    }, {
        key: 'getAvatarColorForWorkgroupId',
        value: function getAvatarColorForWorkgroupId(workgroupId) {
            return this.ConfigService.getAvatarColorForWorkgroupId(workgroupId);
        }

        /**
        * Open or close the notebook and save notebook open/close events
        */

    }, {
        key: 'toggleNotebook',
        value: function toggleNotebook(ev, open) {
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

    }, {
        key: 'toggleNotebookNav',
        value: function toggleNotebookNav() {
            this.notebookNavOpen = !this.notebookNavOpen;
        }

        /**
         * Delete the note specified by the itemId.
         */

    }, {
        key: 'deleteNote',
        value: function deleteNote(itemId, ev) {
            var _this2 = this;

            var doDelete = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

            var confirm = null;

            if (doDelete) {
                confirm = this.$mdDialog.confirm().title(this.$translate('deleteNoteConfirmMessage')).ariaLabel('delete note confirmation').targetEvent(ev).ok(this.$translate('delete')).cancel(this.$translate('cancel'));
            } else {
                confirm = this.$mdDialog.confirm().title(this.$translate('reviveNoteConfirmMessage')).ariaLabel('revive note confirmation').targetEvent(ev).ok(this.$translate('revive')).cancel(this.$translate('cancel'));
            }

            this.$mdDialog.show(confirm).then(function () {
                var noteCopy = angular.copy(_this2.NotebookService.getLatestNotebookItemByLocalNotebookItemId(itemId));
                noteCopy.id = null; // set to null so we're creating a new notebook item. An edit to a notebook item results in a new entry in the db.
                noteCopy.content.clientSaveTime = Date.parse(new Date()); // set save timestamp
                var clientDeleteTime = null; // if delete timestamp is null, then we are in effect un-deleting this note item
                if (doDelete) {
                    clientDeleteTime = Date.parse(new Date()); // set delete timestamp
                }
                _this2.NotebookService.saveNotebookItem(noteCopy.id, noteCopy.nodeId, noteCopy.localNotebookItemId, noteCopy.type, noteCopy.title, noteCopy.content, noteCopy.content.clientSaveTime, clientDeleteTime);
            }, function () {
                // they chose not to delete. Do nothing, the dialog will close.
            });
        }
    }, {
        key: 'editNote',
        value: function editNote(itemId, isEditMode, file, ev) {
            var showFullScreen = this.$mdMedia('xs');
            var notebookItemTemplate = this.themePath + '/notebook/editNotebookItem.html';

            // Display a dialog where students can view/add/edit a notebook item
            this.$mdDialog.show({
                parent: angular.element(document.body),
                targetEvent: ev,
                fullscreen: showFullScreen,
                templateUrl: notebookItemTemplate,
                controller: _editNotebookItemController2.default,
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

    }, {
        key: 'mouseMoved',
        value: function mouseMoved() {
            /*
             * notify the Session Service that the user has moved the mouse
             * so we can refresh the session
             */
            this.SessionService.mouseMoved();
        }
    }]);

    return ThemeController;
}();

ThemeController.$inject = ['$scope', '$state', '$filter', 'ConfigService', 'ProjectService', 'StudentDataService', 'StudentStatusService', 'NotebookService', 'SessionService', '$mdDialog', '$mdMedia', '$mdToast', '$mdComponentRegistry'];

exports.default = ThemeController;
//# sourceMappingURL=themeController.js.map