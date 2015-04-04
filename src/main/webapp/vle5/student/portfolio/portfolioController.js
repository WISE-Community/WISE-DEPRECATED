define(['app'], function(app) {
    app.$controllerProvider.register('PortfolioController', 
        function($scope, 
                $state, 
                $stateParams, 
                ConfigService, 
                PortfolioService,
                ProjectService,
                StudentDataService) {
        console.log('portfolioController');
        
        this.portfolio = null;
        this.itemId = null;
        this.item = null;
        this.itemSource = false;

        this.isVisible = false;
        
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
    });
});