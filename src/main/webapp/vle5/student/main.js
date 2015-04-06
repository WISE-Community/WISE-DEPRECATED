require.config({
    baseUrl: '../wise/vle5/',
    paths: {
        'angular': 'lib/angular/angular',
        'angularAnimate': 'lib/angular/angularAnimate/angular-animate.min',
        'angularPostMessage': 'lib/angular/angularPostMessage/angular-post-message',
        'angularSortable': 'lib/angular/angularSortable/angular-sortable',
        'angularUIRouter': 'lib/angular/angularUIRouter/angular-ui-router.min',
        'app': 'student/app',
        'configService': 'services/configService',
        'htmlController': 'nodes/html/htmlController',
        'jquery': 'lib/jquery/jquery-2.1.3.min',
        'jqueryUI': 'lib/jquery/jquery-ui-1.10.4.interactions.min',
        'navigationController': 'student/navigation/navigationController',
        'nodeApplicationService': 'services/nodeApplicationService',
        'nodeController': 'student/node/nodeController',
        'nodeService': 'services/nodeService',
        'openResponseController': 'nodes/openResponse/openResponseController',
        'openResponseService': 'nodes/openResponse/openResponseService',
        'planningController': 'nodes/planning/planningController',
        'planningService': 'nodes/planning/planningService',
        'portfolioController': 'student/portfolio/portfolioController',
        'portfolioService': 'services/portfolioService',
        'projectService': 'services/projectService',
        'studentDataService': 'services/studentDataService',
        'vleController': 'student/vleController'
    },
    shim: {
        'angular': {
            'exports': 'angular'
        },
        'angularAnimate': {
            'exports': 'angularAnimate',
            'deps': [
                    'angular',
                    'jquery'
                    ]
        },
        'angularUIRouter': {
            'exports': 'angularUIRouter',
            'deps': [
                    'angular'
                    ]
        },
        'angularPostMessage': {
            'exports': 'angularPostMessage',
            'deps': [
                    'angular'
                    ]
        },
        'angularSortable': {
            'exports': 'angularSortable',
            'deps': [
                     'angular',
                     'jquery'
                     ]
        },
        'jqueryUI': {
            'exports': 'jqueryUI',
            'deps': [
                     'jquery'
                     ]
        }
    }
});

require(['app'],function(app){
    app.init();
});