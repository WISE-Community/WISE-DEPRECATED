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

            this.getTemplateUrl = function(){
              return this.templateUrl;
            };

            this.notebook = null;
            this.itemId = null;
            this.item = null;
            this.itemSource = false;
            this.applicationNodes = ProjectService.getApplicationNodes();

            this.retrieveAssets = function() {
                StudentAssetService.retrieveAssets().then(angular.bind(this, function(studentAssets) {
                    this.studentAssets = studentAssets;
                    this.calculateTotalUsage();
                }));
            };

            this.calculateTotalUsage = function() {
                // get the total size
                var totalSizeSoFar = 0;
                for (var i = 0; i < this.studentAssets.length; i++) {
                    var studentAsset = this.studentAssets[i];
                    var studentAssetSize = studentAsset.fileSize;
                    totalSizeSoFar += studentAssetSize;
                }
                this.studentAssets.totalSize = totalSizeSoFar;
                this.studentAssets.totalSizeMax = ConfigService.getStudentMaxTotalAssetsSize();
                this.studentAssets.usagePercentage = this.studentAssets.totalSize / this.studentAssets.totalSizeMax * 100;
            };

            this.upload = function(files) {
                StudentAssetService.uploadAssets(files).then(angular.bind(this, function() {
                    this.retrieveAssets();
                }));
            };

            this.deleteStudentAsset = function(studentAsset) {
                StudentAssetService.deleteAsset(studentAsset).then(angular.bind(this, function(deletedStudentAsset) {
                    // remove studentAsset
                    this.studentAssets.splice(this.studentAssets.indexOf(deletedStudentAsset), 1);
                    this.calculateTotalUsage();
                }));
            };

            $scope.$on('studentAssetsUpdated', angular.bind(this, function() {
                this.retrieveAssets();
            }));

            $scope.$on('notebookChanged', angular.bind(this, function(event, args) {
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

            this.notebookItemDragStartCallback = function(event, ui, item) {
                $(ui.helper.context).data('importNotebookItem', item);
            };

            this.myWorkDragStartCallback = function(event, ui, nodeId, nodeType) {
                $(ui.helper.context).data('importType', 'NodeState');
                $(ui.helper.context).data('importWorkNodeState', StudentDataService.getLatestNodeStateByNodeId(nodeId));
                $(ui.helper.context).data('importWorkNodeType', nodeType);
            };

            this.studentAssetDragStartCallback = function(event, ui, studentAsset) {
                $(ui.helper.context).data('objectType', 'StudentAsset');
                $(ui.helper.context).data('objectData', studentAsset);
            };

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

            // retrieve assets at the beginning
            this.retrieveAssets();
        });
    });