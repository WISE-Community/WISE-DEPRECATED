require.config({
	baseUrl: './',
	paths: {
		'angular': '../../lib/angular/angular',
		'angularUIRouter': '../../lib/angular/angular-ui-router',
		'stepGradingController': 'grading/step/stepGradingController',
		'studentGradingController': 'grading/student/studentGradingController',
		'stepProgressController': 'progress/step/stepProgressController',
		'studentProgressController': 'progress/student/studentProgressController',
		'annotationService': 'services/annotationService',
		'configService': 'services/configService',
		'projectService': 'services/projectService',
		'projectMetadataService': 'services/projectMetadataService',
		'studentStatusService': 'services/studentStatusService',
		'studentWorkService': 'services/studentWorkService',
		'userAndClassInfoService': 'services/userAndClassInfoService'
	},
	shim: {
		'angular': {
			'exports': 'angular'
		},
		'angularUIRouter': {
			'exports': 'angularUIRouter',
			'deps': [
				'angular'
			]
		}
	}
});

require(['app'], function(app) {
	app.init();
});
