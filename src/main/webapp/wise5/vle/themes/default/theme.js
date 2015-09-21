define(['angular', /*'annotationService',*/ 'configService', 'notebookService',
        'projectService', 'sessionService', 'studentDataService'],
    function(angular, /*AnnotationService,*/ ConfigService, NotebookService, ProjectService,
             SessionService, StudentDataService) {

        angular.module('app.theme', [])
            .directive('navItem', function() {
                return {
                    scope: {
                        templateUrl: '=',
                        item: '=',
                        nodeClicked: '&',
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
                    }
                };
            })
            .directive('groupInfo', function() {
                return {
                    scope: {
                        templateUrl: '=',
                        item: '=',
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
                ProjectService,
                StudentDataService,
                NotebookService,
                SessionService,
                $mdDialog,
                $mdSidenav,
                $mdComponentRegistry) {

                // TODO: set these variables dynamically from theme settings
                this.layoutView = 'card'; // do we want a list view at all?
                this.numberProject = true;

                this.nodeStatuses = StudentDataService.nodeStatuses;

                this.startNodeId = ProjectService.getStartNodeId();
                this.rootNode = ProjectService.getRootNode(this.startNodeId);
                this.rootNodeStatus = this.nodeStatuses[this.rootNode.id];


                // alert user when a locked node has been clicked
                $scope.$on('nodeClickedLocked', angular.bind(this, function (event, args) {
                    var nodeId = args.nodeId;

                    // TODO: customize alert with constraint details, correct node term
                    $mdDialog.show(
                        $mdDialog.alert()
                            .parent(angular.element(document.body))
                            .title('Item Locked')
                            .content('Sorry, you cannot view this item.')
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

                // capture notebook open/close events
                $mdComponentRegistry.when('notebook').then(function(it){
                    $scope.$watch(function() {
                        return it.isOpen();
                    }, function(isOpen) {
                        var currentNode = StudentDataService.getCurrentNode();
                        NotebookService.saveNotebookToggleEvent(isOpen, currentNode);
                    });
                });
            });
    });
