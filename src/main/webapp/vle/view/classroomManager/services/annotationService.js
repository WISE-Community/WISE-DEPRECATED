angular.module('AnnotationService', [])

.service('AnnotationService', ['$http', '$q', 'ConfigService', function($http, $q, ConfigService) {
	this.annotations = null;

	this.retrieveAnnotations = function() {
		var getAnnotationsUrl = ConfigService.getConfigParam('getAnnotationsUrl');
		
		return $http.get(getAnnotationsUrl).then(angular.bind(this, function(result) {
			var annotations = result.data;
			this.annotations = annotations;
			return annotations;
		}));
	};
	
	this.getAnnotations = function() {
		return this.annotations;
	}
	
	this.retrieveAnnotations0 = function() {
		
		var deferred = $q.defer();
		
		return ConfigService.getConfigParam('getAnnotationsUrl')
		.then(angular.bind(this, function(result) {
			var getAnnotationsUrl = result;
			return $http.get(getAnnotationsUrl);
		}))
		.then(angular.bind(this, function(result) {
			var annotations = result.data;
			this.annotations = annotations;
			deferred.resolve(annotations);
			return annotations;
		}));
		
		
		return deferred.promise;
	};
}]);