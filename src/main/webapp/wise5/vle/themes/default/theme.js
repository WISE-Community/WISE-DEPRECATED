define(['angular', /*'annotationService',*/ 'configService', 'nodeService', 'notebookService',
        'projectService', 'sessionService', 'studentDataService'],
    function(angular, /*AnnotationService,*/ ConfigService, NodeService, NotebookService, ProjectService,
             SessionService, StudentDataService) {

        angular.module('app.theme', [])
            .directive('navItem', function() {
                return {
                    scope: {
                        templateUrl: '=',
                        item: '=',
                        nodeClicked: '&',
                        showPosition: '=',
                        type: '='
                    },
                    template: '<ng-include src="getTemplateUrl()"></ng-include>',
                    controller: function($scope,
                                         $state,
                                         $stateParams,
                                         ProjectService,
                                         StudentDataService) {

                        $scope.getTemplateUrl = function(){
                            return $scope.templateUrl;
                        };

                        $scope.isGroup = ProjectService.isGroupNode($scope.item.id);

                        $scope.nodeStatus = StudentDataService.nodeStatuses[$scope.item.id];

                        var nodePosition = ProjectService.getNodePositionById($scope.item.id);

                        $scope.nodeTitle = $scope.showPosition ? (nodePosition + ': ' + $scope.item.title) : $scope.item.title;
                    }
                };
            })
            .directive('groupInfo', function() {
                return {
                    scope: {
                        templateUrl: '=',
                        item: '=',
                        showPosition: '=',
                        close: '&'
                    },
                    template: '<ng-include src="getTemplateUrl()"></ng-include>',
                    controller: function($scope,
                                         $state,
                                         $stateParams,
                                         StudentDataService) {

                        $scope.getTemplateUrl = function(){
                            return $scope.templateUrl;
                        };

                        $scope.nodeStatus = StudentDataService.nodeStatuses[$scope.item.id];

                        var nodePosition = ProjectService.getNodePositionById($scope.item.id);

                        $scope.nodeTitle = $scope.showPosition ? (nodePosition + ': ' + $scope.item.title) : $scope.item.title;
                    }
                };
            })
            .directive('progressCircularWithLabel', function() {
                return {
                    scope: {
                        templateUrl: '=',
                        value: '='
                    },
                    template: '<ng-include src="getTemplateUrl()"></ng-include>',
                    controller: function($scope,
                                         $state,
                                         $stateParams) {

                        $scope.getTemplateUrl = function(){
                            return $scope.templateUrl;
                        };
                    }
                };
            })
            /*.directive('notebook', function() {
                return {
                    scope: {
                        templateUrl: '=',
                        filter: '='
                    },
                    template: '<ng-include src="getTemplateUrl()"></ng-include>',
                    controller: function($scope,
                                         $state,
                                         $stateParams) {

                        $scope.getTemplateUrl = function(){
                            return $scope.templateUrl;
                        };

                        $scope.notebook = NotebookService.notebook;
                    }
                };
            })*/
            .controller('ThemeController', function(
                $scope,
                $state,
                $stateParams,
                $document,
                ConfigService,
                ProjectService,
                StudentDataService,
                NodeService,
                NotebookService,
                SessionService,
                $mdDialog,
                $mdSidenav,
                $mdToast,
                $mdComponentRegistry) {

                // TODO: set these variables dynamically from theme settings
                this.layoutView = 'list'; // 'list' or 'card'
                this.numberProject = true;

                this.themePath = "wise5/vle/themes/" + ProjectService.getTheme();

                this.nodeStatuses = StudentDataService.nodeStatuses;

                this.startNodeId = ProjectService.getStartNodeId();
                this.rootNode = ProjectService.getRootNode(this.startNodeId);
                this.rootNodeStatus = this.nodeStatuses[this.rootNode.id];

                this.workgroupId = ConfigService.getWorkgroupId();
                this.workgroupUserNames = this.isPreview ? ['Preview User'] : ConfigService.getUserNamesByWorkgroupId(this.workgroupId);

                // service utility functions
                this.getNodeById = function(nodeId) {
                    return ProjectService.getNodeById(nodeId);
                };

                this.getNodeTitleByNodeId = function(nodeId) {
                    return ProjectService.getNodeTitleByNodeId(nodeId);
                };

                this.getNodePositionId = function(nodeId) {
                    return ProjectService.getNodePositionId(nodeId);
                };

                this.isGroupNode = function(nodeId) {
                    return ProjectService.isGroupNode(nodeId);
                };

                this.nodeClicked = function(nodeId) {
                    StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(nodeId);
                };

                // build project status pop-up
                var statusTemplateUrl = this.themePath + '/templates/projectStatus.html';
                var scope = this;
                this.statusDisplay = $mdToast.build({
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
                this.showProjectStatus = function($event) {
                    if (this.projectStatusOpen) {
                        $mdToast.hide(this.statusDisplay);
                        this.projectStatusOpen = false;
                    } else {
                        $mdToast.show(this.statusDisplay);
                        this.projectStatusOpen = true;
                    }
                };

                this.idToOrder = ProjectService.idToOrder; // TODO: should we be referencing directly?

                // TODO: do we need this or should we just reference idsToPosition directly?  what is best practice?
                this.getNodePositionById = function(id) {
                    return ProjectService.getNodePositionById(id);
                };

                // alert user when a locked node has been clicked
                $scope.$on('nodeClickLocked', angular.bind(this, function (event, args) {
                    var nodeId = args.nodeId;

                    // TODO: customize alert with constraint details, correct node term
                    $mdDialog.show(
                        $mdDialog.alert()
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
                $scope.$on('showSessionWarning', angular.bind(this, function() {
                    var confirm = $mdDialog.confirm()
                        .parent(angular.element(document.body))
                        .title('Session Timeout')
                        .content('You have been inactive for a long time. Do you want to stay logged in?')
                        .ariaLabel('Session Timeout')
                        .ok('YES')
                        .cancel('No');
                    $mdDialog.show(confirm).then(function() {
                        SessionService.renewSession();
                    }, function() {
                        SessionService.forceLogOut();
                    });
                }));

                // alert user when attempt to add component state to notebook that already exists in notebook
                $scope.$on('notebookAddDuplicateAttempt', angular.bind(this, function (event, args) {
                    $mdDialog.show(
                        $mdDialog.alert()
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
                $scope.$on('showRevisions', angular.bind(this, function (event, args) {
                    var revisions = args.revisions;
                    var componentController = args.componentController;
                    var allowRevert = args.allowRevert;
                    var $event = args.$event;
                    var revisionsTemplateUrl = this.themePath + '/templates/componentRevisions.html';

                    $mdDialog.show({
                        parent: angular.element(document.body),
                        targetEvent: $event,
                        templateUrl: revisionsTemplateUrl,
                        locals: {
                            items: revisions,
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
                            $mdDialog.hide();
                        };
                    }

                }));

                // capture notebook open/close events
                $mdComponentRegistry.when('notebook').then(function(it){
                    $scope.$watch(function() {
                        return it.isOpen();
                    }, function(isOpen) {
                        var currentNode = StudentDataService.getCurrentNode();
                        NotebookService.saveNotebookToggleEvent(isOpen, currentNode);
                    });
                });
            })
            .controller('ProjectStatusController', function(
                $scope,
                $state,
                $stateParams,
                projectStatus,
                userNames) {

                $scope.projectStatus = projectStatus;
                $scope.userNames = userNames;
            });
    });
