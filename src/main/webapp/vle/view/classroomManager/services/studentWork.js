angular.module('StudentWorkService', [])

.service('StudentWorkService', ['$http', '$q', 'ConfigService', function($http, $q, ConfigService) {
	this.studentStatuses = null;
	
	this.getStudentWork = function() {
		var deferred = $q.defer();
		
		ConfigService.getConfigParam('getStudentDataUrl').then(function(result) {
			deferred.resolve(result);
		});
		
		return deferred.promise;
	};
}]);