// You can add your own custom validation functions that will be added to the $validators pipeline for all textboxio
// instances on the page.

angular.module('ephox.textboxio').factory('tbioValidationsFactory', ['$log', function ($log) {

	//    $log.log('Loading tbioValidationsFactory');
	var validations = [];
	/*
		validations['sampleValidation1'] = function (modelValue, viewValue) {
			        $log.log('Model value1: [' + modelValue + '  View value:[' + viewValue + ']');
			return true;
		};

		validations['sampleValidation2'] = function (modelValue, viewValue) {
			        $log.log('Model value2: [' + modelValue + '  View value:[' + viewValue + ']');
			return true;
		}
		*/
	return validations;
}]);
