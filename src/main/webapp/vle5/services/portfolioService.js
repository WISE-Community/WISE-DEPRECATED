define(['angular', 'configService'], function(angular, configService) {

    angular.module('PortfolioService', [])
    
    .service('PortfolioService', ['$http', '$q', '$rootScope', 'ConfigService',
                                  function($http, $q, $rootScope, ConfigService) {
        this.portfolio = {};
        this.portfolio.items = [];
        
        this.addItem = function(portfolioItem) {
          this.portfolio.items.push(portfolioItem);
          
          // the current node is about to change
          $rootScope.$broadcast('portfolioChanged', {portfolio: this.portfolio});
        };
    }]);
    
});