'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ThemeController = function ThemeController($scope, ConfigService, ProjectService, StudentDataService, NotebookService, SessionService, $mdDialog, $mdToast, $mdComponentRegistry) {
    _classCallCheck(this, ThemeController);

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
    this.showProjectStatus = function ($event) {
        if (this.projectStatusOpen) {
            this.$mdToast.hide(this.statusDisplay);
            this.projectStatusOpen = false;
        } else {
            this.$mdToast.show(this.statusDisplay);
            this.projectStatusOpen = true;
        }
    };

    // alert user when a locked node has been clicked
    this.$scope.$on('nodeClickLocked', angular.bind(this, function (event, args) {
        var nodeId = args.nodeId;

        // TODO: customize alert with constraint details, correct node term
        this.$mdDialog.show(this.$mdDialog.alert().parent(angular.element(document.body)).title('Item Locked').content('Sorry, you cannot view this item yet.').ariaLabel('Item Locked').clickOutsideToClose(true).ok('OK').targetEvent(event));
    }));

    // alert user when inactive for a long time
    this.$scope.$on('showSessionWarning', angular.bind(this, function () {
        var confirm = this.$mdDialog.confirm().parent(angular.element(document.body)).title('Session Timeout').content('You have been inactive for a long time. Do you want to stay logged in?').ariaLabel('Session Timeout').ok('YES').cancel('No');
        this.$mdDialog.show(confirm).then(function () {
            this.SessionService.renewSession();
        }, function () {
            this.SessionService.forceLogOut();
        });
    }));

    // alert user when attempt to add component state to notebook that already exists in notebook
    this.$scope.$on('notebookAddDuplicateAttempt', angular.bind(this, function (event, args) {
        this.$mdDialog.show(this.$mdDialog.alert().parent(angular.element(document.body)).title('Item already exists in Notebook').content('You can add another version of the item by making changes and then adding it again.').ariaLabel('Notebook Duplicate').clickOutsideToClose(true).ok('OK').targetEvent(event));
    }));

    // show list of revisions in a dialog when user clicks the show revisions link for a component
    this.$scope.$on('showRevisions', angular.bind(this, function (event, args) {
        var revisions = args.revisions;
        var componentController = args.componentController;
        var allowRevert = args.allowRevert;
        var $event = args.$event;
        var revisionsTemplateUrl = scope.themePath + '/templates/componentRevisions.html';

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
            $scope.close = function () {
                $mdDialog.hide();
            };
            $scope.revertWork = function (componentState) {
                $scope.componentController.setStudentWork(componentState);
                $scope.componentController.studentDataChanged();
                $mdDialog.hide();
            };
        }
    }));

    this.$scope.$on('showNotebook', angular.bind(this, function (event, args) {
        var notebookFilters = args.notebookFilters;
        var componentController = args.componentController;
        var $event = args.$event;
        var notebookDialogTemplateUrl = scope.themePath + '/templates/notebookDialog.html';
        var notebookTemplateUrl = scope.themePath + '/notebook/notebook.html';

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
            };
        }
    }));

    // capture notebook open/close events
    this.$mdComponentRegistry.when('notebook').then(function (it) {
        this.$scope.$watch(function () {
            return it.isOpen();
        }, function (isOpenNewValue, isOpenOldValue) {
            if (isOpenNewValue !== isOpenOldValue) {
                var currentNode = this.StudentDataService.getCurrentNode();
                this.NotebookService.saveNotebookToggleEvent(isOpenNewValue, currentNode);
            }
        });
    }.bind(this));
};

ThemeController.$inject = ['$scope', 'ConfigService', 'ProjectService', 'StudentDataService', 'NotebookService', 'SessionService', '$mdDialog', '$mdToast', '$mdComponentRegistry'];

/*
angular.module('vle').controller('NavItemController', new NavItemController($scope, $element, ProjectService, StudentDataService));
angular.module('vle').controller('StepToolsCtrl', new StepToolsCtrl());
angular.module('vle').controller('NodeStatusIconCtrl', new NodeStatusIconCtrl());
angular.module('vle').controller('ProjectStatusController', new ProjectStatusController());
angular.module('vle').controller('ThemeController', new ThemeController());
*/

//angular.module('vle').controller('NavItemController', NavItemController);
//angular.module('vle').controller('StepToolsCtrl', StepToolsCtrl);
//angular.module('vle').controller('NodeStatusIconCtrl', NodeStatusIconCtrl);
//angular.module('vle').controller('ProjectStatusController', ProjectStatusController);
//angular.module('vle').controller('ThemeController', ThemeController);

//angular.module('vle').controller('ThemeController', ThemeController);

exports.default = ThemeController;
//# sourceMappingURL=themeController.js.map