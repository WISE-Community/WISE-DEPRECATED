define(['angular', 'configService', 'openResponseService', 'notebookService',
        'projectService', 'sessionService', 'studentAssetService', 'studentDataService'],
    function(angular, configService, openResponseService, notebookService,
             projectService, sessionService, studentAssetService, studentDataService) {

    angular.module('notebook', [])
        .directive('notebook', function() {
            return {
                scope: {
                    filter: '=',
                    templateUrl: '='
                },
                template: '<ng-include src="notebookController.getTemplateUrl()"></ng-include>',
                controller: 'NotebookController',
                controllerAs: 'notebookController',
                bindToController: true
            };
        })
        .controller('NotebookController',
            function($injector,
                     $rootScope,
                     $scope,
                     $state,
                     $stateParams,
                     ConfigService,
                     OpenResponseService,
                     NotebookService,
                     ProjectService,
                     SessionService,
                     StudentAssetService,
                     StudentDataService) {

            this.getTemplateUrl = function() {
              return this.templateUrl;
            };

            this.notebook = null;
            this.itemId = null;
            this.item = null;
            this.itemSource = false;
            this.applicationNodes = ProjectService.getApplicationNodes();

            this.retrieveNotebookItems = function() {
                // fetch all assets first because a subset of it will be referenced by a notebook item
                StudentAssetService.retrieveAssets().then(angular.bind(this, function(studentAssets) {
                     NotebookService.retrieveNotebookItems().then(angular.bind(this, function(notebook) {
                        this.notebook = notebook;
                     }));
                }));
            };

            this.uploadStudentAssetNotebookItems = function(files) {
                if (files != null) {
                    for (var f = 0; f < files.length; f++) {
                        var file = files[f];
                        NotebookService.uploadStudentAssetNotebookItem(file);
                    }
                }
            };

            this.deleteStudentAsset = function(studentAsset) {
                StudentAssetService.deleteAsset(studentAsset).then(angular.bind(this, function(deletedStudentAsset) {
                    // remove studentAsset
                    this.studentAssets.splice(this.studentAssets.indexOf(deletedStudentAsset), 1);
                    this.calculateTotalUsage();
                }));
            };

            $scope.$on('notebookUpdated', angular.bind(this, function(event, args) {
                this.notebook = args.notebook;
            }));

            this.logOutListener = $scope.$on('logOut', angular.bind(this, function(event, args) {
                console.log('logOut notebook');
                this.logOutListener();
                $rootScope.$broadcast('componentDoneUnloading');
            }));

            this.deleteItem = function(item) {
                NotebookService.deleteItem(item);
            };

            this.notebookItemDragStartCallback = function(event, ui, notebookItem) {
                $(ui.helper.context).data('objectType', 'NotebookItem');
                $(ui.helper.context).data('objectData', notebookItem);
            };

            this.myWorkDragStartCallback = function(event, ui, nodeId, nodeType) {
                $(ui.helper.context).data('importType', 'NodeState');
                $(ui.helper.context).data('importWorkNodeState', StudentDataService.getLatestNodeStateByNodeId(nodeId));
                $(ui.helper.context).data('importWorkNodeType', nodeType);
            };

                /*
            this.studentAssetDragStartCallback = function(event, ui, studentAsset) {
                $(ui.helper.context).data('objectType', 'StudentAsset');
                $(ui.helper.context).data('objectData', studentAsset);
            };
            */

            this.log = function() {
            };

            this.getLatestNodeStateByNodeId = function(nodeId) {
                return StudentDataService.getLatestNodeStateByNodeId(nodeId);
            };

            this.showStudentWorkByNodeId = function(nodeId, nodeType) {
                var result = null;

                if (nodeId != null && nodeType != null) {
                    var childService = $injector.get(nodeType + 'Service');

                    if (childService != null) {
                        var latestNodeState = StudentDataService.getLatestNodeStateByNodeId(nodeId);
                        var studentWorkHTML = childService.getStudentWorkAsHTML(latestNodeState);
                        result = studentWorkHTML;
                    }
                }

                return result;
            };

            // retrieve assets when notebook is opened
            this.retrieveNotebookItems();
        });
    });