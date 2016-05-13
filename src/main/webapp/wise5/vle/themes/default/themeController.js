'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ThemeController = function () {
    function ThemeController($scope, $translate, ConfigService, ProjectService, StudentDataService, StudentStatusService, NotebookService, SessionService, $mdDialog, $mdMedia, $mdToast, $mdComponentRegistry) {
        var _this = this;

        _classCallCheck(this, ThemeController);

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
        var statusTemplateUrl = this.themePath + '/templates/projectStatus.html';
        var scope = this;

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
        this.$scope.$on('nodeClickLocked', function (event, args) {
            var message = 'Sorry, you cannot view this item yet.';
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

            _this.$translate(['itemLocked', 'ok']).then(function (translations) {
                _this.$mdDialog.show(_this.$mdDialog.alert().parent(angular.element(document.body)).title(translations.itemLocked).htmlContent(message).ariaLabel(translations.itemLocked).ok(translations.ok).targetEvent(event));
            });
        });

        // alert user when inactive for a long time
        this.$scope.$on('showSessionWarning', function (ev) {
            _this.$translate(["sessionTimeout", "autoLogoutMessage", "yes", "no"]).then(function (translations) {

                var alert = _this.$mdDialog.confirm().parent(angular.element(document.body)).title(translations.sessionTimeout).textContent(translations.autoLogoutMessage).ariaLabel(translations.sessionTimeout).targetEvent(ev).ok(translations.yes).cancel(translations.no);

                _this.$mdDialog.show(alert).then(function () {
                    _this.SessionService.renewSession();
                    alert = undefined;
                }, function () {
                    _this.SessionService.forceLogOut();
                });
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
            var revisionsTemplateUrl = scope.themePath + '/templates/componentRevisions.html';

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
            var studentAssetDialogTemplateUrl = scope.themePath + '/templates/studentAssetDialog.html';
            var studentAssetTemplateUrl = scope.themePath + '/studentAsset/studentAsset.html';

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

        this.$scope.$on('toggleNotebook', function () {
            _this.toggleNotebook();
        });

        // show edit note dialog on 'editNote' event
        this.$scope.$on('editNote', function (event, args) {
            var itemId = args.itemId;
            var ev = args.ev;
            _this.editNote(itemId, true, ev);
        });

        // show edit note dialog on 'addNewNote' event
        this.$scope.$on('addNewNote', function (event, args) {
            var ev = args.ev;
            var file = args.file;
            _this.editNote(null, true, ev, file);
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

    _createClass(ThemeController, [{
        key: 'showProjectStatus',
        value: function showProjectStatus($event) {
            if (this.projectStatusOpen) {
                this.$mdToast.hide(this.statusDisplay);
                this.projectStatusOpen = false;
            } else {
                this.$mdToast.show(this.statusDisplay);
                this.projectStatusOpen = true;
            }
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
            return this.StudentStatusService.getAvatarColorForWorkgroupId(workgroupId);
        }
    }, {
        key: 'toggleNotebook',
        value: function toggleNotebook(ev) {
            this.notebookOpen = !this.notebookOpen;
        }
    }, {
        key: 'editNote',
        value: function editNote(itemId, isEditMode, ev, file) {
            var showFullScreen = this.$mdMedia('xs');
            var notebookItemTemplate = this.themePath + '/notebook/editNotebookItem.html';
            var item = this.NotebookService.getLatestNotebookItemByLocalNotebookItemId(itemId);
            var type = item ? item.type : 'note'; // TODO: don't hardcode type once questions are enabled

            // Display a dialog where students can add/edit a notebook item
            this.$mdDialog.show({
                parent: angular.element(document.body),
                targetEvent: ev,
                fullscreen: showFullScreen,
                templateUrl: notebookItemTemplate,
                controller: EditNotebookItemController,
                locals: {
                    itemId: itemId,
                    isEditMode: isEditMode,
                    type: type,
                    file: file
                }
                //template: '<notebookitem is-edit-enabled="true" item-id="{{itemId}}"></notebookitem>'
            });

            function EditNotebookItemController($scope, $mdDialog, NotebookService) {
                $scope.itemId = itemId;
                $scope.type = type;
                $scope.isEditMode = isEditMode;
                $scope.NotebookService = NotebookService;
                $scope.item = null;
                $scope.title = ($scope.isEditMode ? $scope.itemId ? 'Edit ' : 'Add ' : 'View ') + $scope.type;
                $scope.file = file;

                $scope.cancel = function () {
                    $mdDialog.hide();
                };

                $scope.save = function () {
                    $scope.NotebookService.saveNotebookItem($scope.item.id, $scope.item.nodeId, $scope.item.localNotebookItemId, $scope.item.type, $scope.item.title, $scope.item.content).then(function () {
                        $mdDialog.hide();
                    });
                };

                $scope.update = function (item) {
                    // notebook item has changed
                    $scope.item = item;
                };
            }
            EditNotebookItemController.$inject = ["$scope", "$mdDialog", "NotebookService"];
        }
    }]);

    return ThemeController;
}();

ThemeController.$inject = ['$scope', '$translate', 'ConfigService', 'ProjectService', 'StudentDataService', 'StudentStatusService', 'NotebookService', 'SessionService', '$mdDialog', '$mdMedia', '$mdToast', '$mdComponentRegistry'];

exports.default = ThemeController;
//# sourceMappingURL=themeController.js.map