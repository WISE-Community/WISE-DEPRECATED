define(['angular'], function(angular) {
	
	angular.module('AnnotationService', [])
	
	.service('AnnotationService', ['$http', 'ConfigService', function($http, ConfigService) {
		this.annotations = null;
	
		this.retrieveAnnotations = function() {
			var annotationsURL = ConfigService.getConfigParam('annotationsURL');
			
			return $http.get(annotationsURL).then(angular.bind(this, function(result) {
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