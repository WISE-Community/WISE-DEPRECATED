angular.module('StudentProgressView', [
	'ui.router'
])

.config(['$urlRouterProvider', '$stateProvider', function($urlRouterProvider, $stateProvider) {
	
}])

.controller('StudentProgressController', ['StudentStatusService', 'UserAndClassInfoService', 'AnnotationService', function(StudentStatusService, UserAndClassInfoService, AnnotationService) {
	this.title = 'Student Progress';
	
	this.studentStatuses = StudentStatusService.getStudentStatuses();
	
	this.workgroups = UserAndClassInfoService.getClassmateUserInfos();
	
	this.annotations = AnnotationService.getAnnotations();
	
	this.getCurrentStepForWorkgroupId = function(workgroupId) {
		return StudentStatusService.getCurrentStepTitleForWorkgroupId(workgroupId);
	};
	
	this.getStudentProjectCompletion = function(workgroupId) {
		return StudentStatusService.getStudentProjectCompletion(workgroupId);
	};
}]);