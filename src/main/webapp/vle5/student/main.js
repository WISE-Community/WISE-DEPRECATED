require.config({
	baseUrl: '../wise/vle5/student',
	paths: {
		'angular':'../lib/angular/angular',
		'angularUIRouter':'../lib/angular/angular-ui-router',
		'viewLeftController':'viewLeftController',
        'viewRightController':'viewRightController',
        'viewMapController':'viewMapController',
		'jquery': '../lib/jquery/jquery-2.1.3.min',
        'configService': '../services/configService',
        'projectService': '../services/projectService',
        'nodeApplicationService': '../services/nodeApplicationService',
        'nodeService': '../services/nodeService'
	},
	shim: {
		'angular':{
			'exports':'angular'
		},
		'angularUIRouter':{
			'exports':'angularUIRouter',
			'deps':[
			        'angular'
			        ]
		}
	}
});

require(['app'],function(app){
	app.init();
});