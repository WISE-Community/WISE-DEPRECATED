define(['angular', /*'annotationService',*/ 'configService', 'nodeService', 'notebookService',
        'projectService', 'sessionService', 'studentDataService'],
    function(angular, /*AnnotationService,*/ ConfigService, NodeService, NotebookService, ProjectService,
             SessionService, StudentDataService) {

        angular.module('app.theme', [])
            .directive('navItem', function() {
                return {
                    scope: {
                        templateUrl: '=',
                        nodeId: '=',
                        showPosition: '=',
                        type: '='
                    },
                    template: '<ng-include src="navitemCtrl.getTemplateUrl()"></ng-include>',
                    controller: 'NavItemController',
                    controllerAs: 'navitemCtrl',
                    bindToController: true
                };
            })
            .controller('NavItemController',
                function($scope,
                         $state,
                         $stateParams,
                         $element,
                         ProjectService,
                         StudentDataService) {

                    this.getTemplateUrl = function(){
                        return this.templateUrl;
                    };

                    this.$element = $element;
                    this.expanded = false;

                    this.item = ProjectService.idToNode[this.nodeId];
                    this.isGroup = ProjectService.isGroupNode(this.nodeId);
                    this.nodeStatuses = StudentDataService.nodeStatuses;
                    this.nodeStatus = this.nodeStatuses[this.nodeId];

                    this.nodeTitle = this.showPosition ? (ProjectService.idToPosition[this.nodeId] + ': ' + this.item.title) : this.item.title;
                    this.currentNode = StudentDataService.currentNode;
                    this.isCurrentNode = (this.currentNode.id === this.nodeId);

                    var scope = this;
                    $scope.$watch(
                        function () { return StudentDataService.currentNode; },
                        function (newNode) {
                            scope.currentNode = newNode;
                            scope.isCurrentNode = (scope.currentNode.id === scope.nodeId);
                            if (ProjectService.isApplicationNode(newNode.id)) {
                                setExpanded();
                            }
                        }
                    );

                    $scope.$watch(
                        function () { return scope.expanded; },
                        function (value) {
                            $scope.$parent.itemExpanded = value;
                        }
                    );

                    var setExpanded = function () {
                        scope.expanded = (scope.isCurrentNode || (scope.isGroup && ProjectService.isNodeDescendentOfGroup(scope.currentNode, scope.item)));
                    };

                    this.itemClicked = function() {
                        if (this.isGroup) {
                            if (!this.isCurrentNode && !this.expanded) {
                                StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(this.nodeId);
                            }
                            this.expanded = !this.expanded;
                        } else {
                            StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(this.nodeId);
                        }
                    };

                    setExpanded();
                }
            )
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

                this.rootNode = ProjectService.rootNode;
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

                this.getNodePositionById = function(nodeId) {
                    return ProjectService.getNodePositionById(nodeId);
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

                this.idToOrder = ProjectService.idToOrder;

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
                            $scope.componentController.studentDataChanged();
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
