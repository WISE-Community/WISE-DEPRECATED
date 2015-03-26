require.config({
    baseUrl: '../wise/vle5/',
    paths: {
        'angular': 'lib/angular/angular',
        'angularPostMessage': 'lib/angular/angularPostMessage/angular-post-message',
        'angularUIRouter': 'lib/angular/angularUIRouter/angular-ui-router',
        'app': 'student/app',
        'configService': 'services/configService',
        'htmlController': 'nodes/html/htmlController',
        'jquery': 'lib/jquery/jquery-2.1.3.min',
        'navigationController': 'student/navigation/navigationController',
        'nodeApplicationService': 'services/nodeApplicationService',
        'nodeController': 'student/node/nodeController',
        'nodeService': 'services/nodeService',
        'openResponseController': 'nodes/openResponse/openResponseController',
        'openResponseService': 'nodes/openResponse/openResponseService',
        'planningController': 'nodes/planning/planningController',
        'planningService': 'nodes/planning/planningService',
        'projectService': 'services/projectService',
        'studentDataService': 'services/studentDataService',
        'vleController': 'student/vleController'
    },
    shim: {
        'angular': {
            'exports':'angular'
        },
        'angularUIRouter': {
            'exports':'angularUIRouter',
            'deps': [
                    'angular'
                    ]
        },
        'angularPostMessage': {
            'exports': 'angularPostMessage',
            'deps': [
                    'angular'
                    ]
        }
    }
});

require(['app'],function(app){
    app.init();
});