angular.module('wiseNodeAPIService', [])

.service('wiseNodeAPIService', ['$http', function($http) {
    console.log('wiseNodeAPIService');
    
    this.test = function() {
        console.log('test');
    };
}]);

console.log('load');