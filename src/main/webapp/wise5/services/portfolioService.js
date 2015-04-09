define(['angular', 'configService'], function(angular, configService) {

    angular.module('PortfolioService', [])
    
    .service('PortfolioService', ['$http', '$q', '$rootScope', 'ConfigService',
                                  function($http, $q, $rootScope, ConfigService) {
        this.portfolio = {};
        this.portfolio.items = [];
        this.portfolio.deletedItems = [];
        
        this.addItem = function(portfolioItem) {
          this.portfolio.items.push(portfolioItem);
          
          // the current node is about to change
          $rootScope.$broadcast('portfolioChanged', {portfolio: this.portfolio});
        };
        
        this.deleteItem = function(itemToDelete) {
            var items = this.portfolio.items;
            var deletedItems = this.portfolio.deletedItems;
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item === itemToDelete) {
                    items.splice(i,1);
                    deletedItems.push(itemToDelete);
                }
            }
        };
    }]);
    
});