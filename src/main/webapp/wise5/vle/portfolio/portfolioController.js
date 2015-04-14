define(['app', 'portfolioService'], function(app, portfolioService) {
    app.$controllerProvider.register('PortfolioController', 
        function($scope,
                $rootScope,
                $state, 
                $stateParams, 
                ConfigService,
                OpenResponseService,
                PortfolioService,
                ProjectService,
                SessionService,
                StudentDataService) {
        
        this.viewType = 'portfolio'; // [portfolio, myWork]
        this.portfolio = null;
        this.itemId = null;
        this.item = null;
        this.itemSource = false;
        this.isVisible = false;
        
        this.applicationNodes = ProjectService.getApplicationNodes();
        
        $scope.$on('portfolioChanged', angular.bind(this, function(event, args) {
            this.portfolio = args.portfolio;
        }));
        
        this.logOutListener = $scope.$on('logOut', angular.bind(this, function(event, args) {
            console.log('logOut portfolio');
            this.logOutListener();
            SessionService.logOut();
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
        
        this.showPortfolio = function() {
            this.viewType = 'portfolio';
        };
        
        this.showMyWork = function() {
            this.viewType = 'myWork';
        };
        
        
        this.portfolioItemDragStartCallback = function(event, ui, item) {
            $(ui.helper.context).data('importPortfolioItem', item);
        };
        
        this.myWorkDragStartCallback = function(event, ui, nodeId, nodeType) {
            $(ui.helper.context).data('importWorkNodeState', StudentDataService.getLatestNodeStateByNodeId(nodeId));
            $(ui.helper.context).data('importWorkNodeType', nodeType);
        };
        
        this.log = function() {
        };
        
        this.getLatestNodeStateByNodeId = function(nodeId) {
            return StudentDataService.getLatestNodeStateByNodeId(nodeId);
        };
        
        this.showStudentWorkByNodeId = function(nodeId, nodeType) {
            var result = null;
            if (nodeType === 'OpenResponse') {
                var latestNodeState = StudentDataService.getLatestNodeStateByNodeId(nodeId);
                if (latestNodeState != null) {
                    var studentWorkHTML = OpenResponseService.getStudentWorkAsHTML(latestNodeState);
                    result = studentWorkHTML;
                }
            } else {
                
            }
            return result;
        };
    });
});