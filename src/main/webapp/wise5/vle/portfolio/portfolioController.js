define(['app', 'portfolioService'], function(app, portfolioService) {
    app.$controllerProvider.register('PortfolioController', 
        function($injector,
                $rootScope,
                $scope,
                $state, 
                $stateParams,
                ConfigService,
                OpenResponseService,
                PortfolioService,
                ProjectService,
                SessionService,
                StudentAssetService,
                StudentDataService) {
        
        this.currentView = 'portfolio'; // [portfolio, myWork, myFiles]
        this.portfolio = null;
        this.itemId = null;
        this.item = null;
        this.itemSource = false;
        this.isVisible = false;
        this.applicationNodes = ProjectService.getApplicationNodes();
        
        this.retrieveAssets = function() {
            StudentAssetService.retrieveAssets().then(angular.bind(this, function(studentAssets) {
                this.studentAssets = studentAssets;
            }));
        };
        
        // retrieve assets at the beginning
        this.retrieveAssets();
        
        this.upload = function(files) {
            StudentAssetService.uploadAssets(files).then(angular.bind(this, function() {
               this.retrieveAssets();
            }));
        };
        
        $scope.$on('portfolioChanged', angular.bind(this, function(event, args) {
            this.portfolio = args.portfolio;
        }));
        
        this.logOutListener = $scope.$on('logOut', angular.bind(this, function(event, args) {
            console.log('logOut portfolio');
            this.logOutListener();
            $rootScope.$broadcast('componentDoneUnloading');
        }));
        
        this.deleteItem = function(item) {
            PortfolioService.deleteItem(item);
        };
        
        this.open = function() {
            this.isVisible = true;
        };
        
        this.close = function() {
            this.isVisible = false;
        };
        
        this.showView = function(viewName) {
            this.currentView = viewName;
        };
        
        this.portfolioItemDragStartCallback = function(event, ui, item) {
            $(ui.helper.context).data('importPortfolioItem', item);
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
    });
});