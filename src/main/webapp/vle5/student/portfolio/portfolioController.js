define(['app'], function(app) {
    app.$controllerProvider.register('PortfolioController', 
        function($scope, 
                $state, 
                $stateParams, 
                ConfigService,
                OpenResponseService,
                PortfolioService,
                ProjectService,
                StudentDataService) {
        console.log('portfolioController');
        
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
        
        this.log = function() {
            console.log('hiroki');
        };
        
        this.showStudentWorkByNodeId = function(nodeId) {
            var result = null;
            console.log('showStudentWorkByNodeId, nodeId: ' + nodeId);
            var latestNodeState = StudentDataService.getLatestNodeStateByNodeId(nodeId);
            if (latestNodeState != null) {
                var studentWorkHTML = OpenResponseService.getStudentWorkAsHTML(latestNodeState);
                result = studentWorkHTML;
            }
            return result;
        };
    });
});