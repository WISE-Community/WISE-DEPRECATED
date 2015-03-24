define(['angular'], function(angular) {
	
	angular.module('AnnotationService', [])
	
	.service('AnnotationService', ['$http', 'ConfigService', function($http, ConfigService) {
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
	}]);
	
});