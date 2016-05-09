'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var VLEController = function () {
    function VLEController($scope, $rootScope, $mdDialog, $state, ConfigService, NotebookService, ProjectService, SessionService, StudentDataService, StudentWebSocketService) {
        var _this = this;

        _classCallCheck(this, VLEController);

        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.$mdDialog = $mdDialog;
        this.$state = $state;
        this.ConfigService = ConfigService;
        this.NotebookService = NotebookService;
        this.ProjectService = ProjectService;
        this.SessionService = SessionService;
        this.StudentDataService = StudentDataService;
        this.StudentWebSocketService = StudentWebSocketService;

        this.currentNode = null;
        this.pauseDialog = null;
        this.noteDialog = null;

        this.navFilters = this.ProjectService.getFilters();
        this.navFilter = this.navFilters[0].name;

        this.projectStyle = this.ProjectService.getStyle();
        this.projectName = this.ProjectService.getProjectTitle();

        this.notebookFilters = this.NotebookService.filters;
        this.notebookFilter = this.notebookFilters[0].name; // show All note book items on load
        this.notebookOpen = false;

        // get the total score for the workgroup
        this.totalScore = this.StudentDataService.getTotalScore();

        // get the max score for the project
        this.maxScore = this.ProjectService.getMaxScore();

        this.$scope.$on('currentNodeChanged', function (event, args) {
            var previousNode = args.previousNode;
            var currentNode = _this.StudentDataService.getCurrentNode();
            var currentNodeId = currentNode.id;

            _this.StudentDataService.updateStackHistory(currentNodeId);
            _this.StudentDataService.updateVisitedNodesHistory(currentNodeId);
            _this.StudentDataService.updateNodeStatuses();

            _this.setLayoutState();

            _this.StudentWebSocketService.sendStudentStatus();
            _this.$state.go('root.vle', { nodeId: currentNodeId });

            var componentId, componentType, category, eventName, eventData, eventNodeId;
            if (previousNode != null && _this.ProjectService.isGroupNode(previousNode.id)) {
                // going from group to node or group to group
                componentId = null;
                componentType = null;
                category = "Navigation";
                eventName = "nodeExited";
                eventData = {
                    nodeId: previousNode.id
                };
                eventNodeId = previousNode.id;
                _this.StudentDataService.saveVLEEvent(eventNodeId, componentId, componentType, category, eventName, eventData);
            }

            if (_this.ProjectService.isGroupNode(currentNodeId)) {
                // save nodeEntered event if this is a group
                componentId = null;
                componentType = null;
                category = "Navigation";
                eventName = "nodeEntered";
                eventData = {
                    nodeId: currentNode.id
                };
                eventNodeId = currentNode.id;
                _this.StudentDataService.saveVLEEvent(eventNodeId, componentId, componentType, category, eventName, eventData);
            }
        });

        this.$scope.$on('componentStudentDataChanged', function () {
            _this.StudentDataService.updateNodeStatuses();
        });

        // listen for the pause screen event
        this.$scope.$on('pauseScreen', function (event, args) {
            _this.pauseScreen();
        });

        // listen for the unpause screen event
        this.$scope.$on('unPauseScreen', function (event, args) {
            _this.unPauseScreen();
        });

        // listen for the open note dialog event
        this.$scope.$on('openNoteDialog', function (event, args) {
            _this.openNoteDialog(event, args);
        });

        // listen for the close note dialog event
        this.$scope.$on('closeNoteDialog', function (event, args) {
            _this.closeNoteDialog();
        });

        // Make sure if we drop something on the page we don't navigate away
        // https://developer.mozilla.org/En/DragDrop/Drag_Operations#drop
        $(document.body).on('dragover', function (e) {
            e.preventDefault();
            return false;
        });

        $(document.body).on('drop', function (e) {
            e.preventDefault();
            return false;
        });

        this.themePath = this.ProjectService.getThemePath();
        this.notebookItemPath = this.themePath + '/notebook/notebookItem.html';

        this.setLayoutState();

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

    _createClass(VLEController, [{
        key: 'toggleNotebook',
        value: function toggleNotebook() {
            this.notebookOpen = !this.notebookOpen;
        }
    }, {
        key: 'isNotebookEnabled',
        value: function isNotebookEnabled() {
            return this.NotebookService.isNotebookEnabled();
        }

        // Display a dialog where students can add/edit a note

    }, {
        key: 'addNewNote',
        value: function addNewNote() {
            this.noteDialog = this.$mdDialog.show({
                template: '<md-dialog aria-label="Note"><md-toolbar><div class="md-toolbar-tools"><h2>Add New Note</h2></div></md-toolbar>' + '<md-dialog-content><div class="md-dialog-content">' + '<notebookitem is-edit-enabled="true" template-url="\'' + this.notebookItemPath + '\'"></notebookitem>' + '</div></md-dialog-content></md-dialog>',
                fullscreen: true,
                escapeToClose: true
            });
        }
    }, {
        key: 'openNoteDialog',
        value: function openNoteDialog(event, args) {
            // close any open note dialogs
            this.closeNoteDialog();

            // get the notebook item to edit.
            var notebookItem = args.notebookItem;
            var notebookItemId = notebookItem.id;

            this.noteDialog = this.$mdDialog.show({
                template: '<md-dialog aria-label="Note"><md-toolbar><div class="md-toolbar-tools"><h2>Edit Note</h2></div></md-toolbar>' + '<md-dialog-content><div class="md-dialog-content">' + '<notebookitem is-edit-enabled="true" item-id="' + notebookItemId + '" template-url="\'' + this.notebookItemPath + '\'" ></notebookitem>' + '</div></md-dialog-content></md-dialog>',
                fullscreen: true,
                escapeToClose: true
            });
        }

        // Close the note dialog

    }, {
        key: 'closeNoteDialog',
        value: function closeNoteDialog() {
            if (this.noteDialog) {
                this.$mdDialog.hide(this.noteDialog, "finished");
                this.noteDialog = undefined;
            }
        }
    }, {
        key: 'setLayoutState',
        value: function setLayoutState() {
            var layoutState = 'nav'; // default layout state
            var node = this.StudentDataService.getCurrentNode();

            if (node) {
                var id = node.id;
                if (this.ProjectService.isApplicationNode(id)) {
                    layoutState = 'node';
                } else if (this.ProjectService.isGroupNode(id)) {
                    layoutState = 'nav';
                }
            }

            this.layoutState = layoutState;
        }
    }, {
        key: 'goHome',
        value: function goHome() {
            // save goHome event
            var nodeId = null;
            var componentId = null;
            var componentType = null;
            var category = "Navigation";
            var event = "goHomeButtonClicked";
            var eventData = {};
            this.StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);

            this.$rootScope.$broadcast('goHome');
        }
    }, {
        key: 'logOut',
        value: function logOut() {
            // save logOut event
            var nodeId = null;
            var componentId = null;
            var componentType = null;
            var category = "Navigation";
            var event = "logOutButtonClicked";
            var eventData = {};
            this.StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);

            this.$rootScope.$broadcast('logOut');
        }
    }, {
        key: 'loadRoot',
        value: function loadRoot() {
            this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(this.ProjectService.rootNode.id);
        }
    }, {
        key: 'mouseMoved',


        /**
         * The user moved the mouse on the page
         */
        value: function mouseMoved() {
            // tell the session service a mouse event occurred
            // so it can reset the session timeout timers
            this.SessionService.mouseEventOccurred();
        }
    }, {
        key: 'pauseScreen',


        /**
         * Pause the screen
         */
        value: function pauseScreen() {
            // TODO: i18n
            this.pauseDialog = this.$mdDialog.show({
                template: '<md-dialog aria-label="Screen Paused"><md-toolbar><div class="md-toolbar-tools"><h2>Screen Paused</h2></div></md-toolbar><md-dialog-content><div class="md-dialog-content">Your teacher has paused all the screens in the class.</div></md-dialog-content></md-dialog>',
                fullscreen: true,
                escapeToClose: false
            });
        }

        /**
         * Unpause the screen
         */

    }, {
        key: 'unPauseScreen',
        value: function unPauseScreen() {
            this.$mdDialog.hide(this.pauseDialog, "finished");
            this.pauseDialog = undefined;
        }
    }]);

    return VLEController;
}();

VLEController.$inject = ['$scope', '$rootScope', '$mdDialog', '$state', 'ConfigService', 'NotebookService', 'ProjectService', 'SessionService', 'StudentDataService', 'StudentWebSocketService'];

exports.default = VLEController;
//# sourceMappingURL=vleController.js.map