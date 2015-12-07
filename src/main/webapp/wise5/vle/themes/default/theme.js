define(['angular', /*'annotationService',*/ 'configService', 'nodeService', 'notebookService',
        'projectService', 'sessionService', 'studentDataService'],
    function(angular, /*AnnotationService,*/ ConfigService, NodeService, NotebookService, ProjectService,
             SessionService, StudentDataService) {

        angular.module('app.theme', [])
            .directive('navItem', function() {
                return {
                    scope: {
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
                        return ProjectService.getThemePath() + '/navigation/navItem.html';
                    };

                    this.$element = $element;
                    this.expanded = false;

                    this.item = ProjectService.idToNode[this.nodeId];
                    this.isGroup = ProjectService.isGroupNode(this.nodeId);
                    this.nodeStatuses = StudentDataService.nodeStatuses;
                    this.nodeStatus = this.nodeStatuses[this.nodeId];

                    this.nodeTitle = this.showPosition ? (ProjectService.idToPosition[this.nodeId] + ': ' + this.item.title) : this.item.title;
                    this.currentNode = StudentDataService.currentNode;
                    var isCurrentNode = (this.currentNode.id === this.nodeId);
                    var setNewNode = false;

                    var scope = this;
                    $scope.$watch(
                        function () { return StudentDataService.currentNode; },
                        function (newNode) {
                            scope.currentNode = newNode;
                            if (StudentDataService.previousNode) {
                                $scope.$parent.isPrevNode = (scope.nodeId === StudentDataService.previousNode.id);
                            }
                            isCurrentNode = (scope.currentNode.id === scope.nodeId);
                            if (isCurrentNode || ProjectService.isApplicationNode(newNode.id) || newNode.id === ProjectService.rootNode.id) {
                                setExpanded();
                            }
                        }
                    );

                    $scope.$watch(
                        function () { return scope.expanded; },
                        function (value) {
                            $scope.$parent.itemExpanded = value;
                            if (value) {
                                zoomToElement();
                            }
                        }
                    );

                    var setExpanded = function () {
                        scope.expanded = (isCurrentNode || (scope.isGroup && ProjectService.isNodeDescendentOfGroup(scope.currentNode, scope.item)));
                        if (scope.expanded && isCurrentNode) {
                            zoomToElement();
                        }
                    };

                    var zoomToElement = function () {
                        setTimeout(function () {
                            // smooth scroll to expanded group's page location
                            var location = $element[0].offsetTop - 32;
                            $('#content').animate({
                                scrollTop: location
                            }, 350, 'linear', function () {
                                if (setNewNode) {
                                    setNewNode = false;
                                    StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(scope.nodeId);
                                }
                            });
                        }, 250);
                    };

                    this.itemClicked = function() {
                        if (this.isGroup) {
                            if (!this.expanded) {
                                setNewNode = true;
                            }
                            this.expanded = !this.expanded;
                        } else {
                            StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(this.nodeId);
                        }
                    };

                    setExpanded();
                }
            )
            .directive('stepTools', function() {
                return {
                    scope: {
                        nodeId: '=',
                        showPosition: '='
                    },
                    template: '<ng-include src="stepToolsCtrl.getTemplateUrl()"></ng-include>',
                    controller: 'StepToolsCtrl',
                    controllerAs: 'stepToolsCtrl',
                    bindToController: true
                };
            })
            .controller('StepToolsCtrl',
                function($scope,
                                         $state,
                         $stateParams,
                         $element,
                         NodeService,
                         ProjectService,
                         StudentDataService) {

                    this.getTemplateUrl = function(){
                        return ProjectService.getThemePath() + '/node/stepTools.html';
                    };

                    this.nodeStatuses = StudentDataService.nodeStatuses;
                    this.nodeStatus = this.nodeStatuses[this.nodeId];

                    this.prevId = NodeService.getPrevNodeId();
                    this.nextId = NodeService.getNextNodeId();

                    // service objects and utility functions
                    this.idToOrder = ProjectService.idToOrder;

                    this.getNodeTitleByNodeId = function(nodeId) {
                        return ProjectService.getNodeTitleByNodeId(nodeId);
                    };

                    this.getNodePositionById = function(nodeId) {
                        return ProjectService.getNodePositionById(nodeId);
                    };

                    this.isGroupNode = function(nodeId) {
                        return ProjectService.isGroupNode(nodeId);
                    };

                    this.goToPrevNode = function() {
                        NodeService.goToPrevNode();
                    };

                    this.goToNextNode = function() {
                        NodeService.goToNextNode();
                    };

                    this.closeNode = function() {
                        NodeService.closeNode();
                    };

                    // model variable for selected node id
                    this.toNodeId = this.nodeId;

                    var scope = this;
                    $scope.$watch(
                        function () { return scope.toNodeId; },
                        function (newId, oldId) {
                            if (newId !== oldId) {
                                // selected node id has changed, so open new node
                                StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(newId);
                            }
                        }
                    );
                }
            )
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

                this.themePath = ProjectService.getThemePath();

                this.nodeStatuses = StudentDataService.nodeStatuses;

                this.rootNode = ProjectService.rootNode;
                this.rootNodeStatus = this.nodeStatuses[this.rootNode.id];

                this.workgroupId = ConfigService.getWorkgroupId();
                this.workgroupUserNames = this.isPreview ? ['Preview User'] : ConfigService.getUserNamesByWorkgroupId(this.workgroupId);

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
                    var revisionsTemplateUrl = scope.themePath + '/templates/componentRevisions.html';

                    $mdDialog.show({
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

                $scope.$on('showNotebook', angular.bind(this, function (event, args) {
                    var notebookFilters = args.notebookFilters;
                    var componentController = args.componentController;
                    var $event = args.$event;
                    var notebookDialogTemplateUrl = scope.themePath + '/templates/notebookDialog.html';
                    var notebookTemplateUrl = scope.themePath + '/notebook/notebook.html';

                    $mdDialog.show({
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
                        }
                    }
                }));

                // capture notebook open/close events
                $mdComponentRegistry.when('notebook').then(function(it){
                    $scope.$watch(function() {
                        return it.isOpen();
                    }, function(isOpenNewValue, isOpenOldValue) {
                        if (isOpenNewValue !== isOpenOldValue) {
                            var currentNode = StudentDataService.getCurrentNode();
                            NotebookService.saveNotebookToggleEvent(isOpenNewValue, currentNode);
                        }
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
    }
);
