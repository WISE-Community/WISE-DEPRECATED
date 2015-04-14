require.config({
    baseUrl: 'wise5/',
    paths: {
        'angular': 'lib/angular/angular',
        'angularAnimate': 'lib/angular/angularAnimate/angular-animate.min',
        'angularDragDrop': 'lib/angular/angularDragDrop/angular-dragdrop.min',
        'angularSortable': 'lib/angular/angularSortable/angular-sortable',
        'angularUIRouter': 'lib/angular/angularUIRouter/angular-ui-router.min',
        'angularWebSocket': 'lib/angular/angularWebSocket/angular-websocket.min',
        'app': 'classroomMonitor/app',
        'configService': 'services/configService',
        'htmlController': 'nodes/html/htmlController',
        'jquery': 'lib/jquery/jquery-2.1.3.min',
        'jqueryUI': 'lib/jquery/jquery-ui-1.10.4.interactions.min',
        'navigationController': 'classroomMonitor/navigation/navigationController',
        'nodeController': 'classroomMonitor/node/nodeController',
        'nodeService': 'services/nodeService',
        'openResponseController': 'nodes/openResponse/openResponseController',
        'openResponseService': 'nodes/openResponse/openResponseService',
        'planningController': 'nodes/planning/planningController',
        'planningService': 'nodes/planning/planningService',
        'portfolioController': 'classroomMonitor/portfolio/portfolioController',
        'portfolioService': 'services/portfolioService',
        'projectService': 'services/projectService',
        'sessionService': 'services/sessionService',
        'studentDataService': 'services/studentDataService',
        'studentProgressController': 'classroomMonitor/progress/student/studentProgressController',
        'classroomMonitorController': 'classroomMonitor/classroomMonitorController',
        'webSocketService': 'services/webSocketService'
    },
    shim: {
        'angular': {
            'exports': 'angular'
        },
        'angularAnimate': {
            'exports': 'angularAnimate',
            'deps': [
                    'angular',
                    'jqueryUI'
                    ]
        },
        'angularDragDrop': {
            'exports': 'angularDragDrop',
            'deps': [
                    'angular',
                    'jqueryUI'
                    ]
        },
        'angularSortable': {
            'exports': 'angularSortable',
            'deps': [
                     'angular',
                     'jqueryUI'
                     ]
        },
        'angularUIRouter': {
            'exports': 'angularUIRouter',
            'deps': [
                    'angular'
                    ]
        },
        'angularWebSocket': {
            'exports': 'angularWebSocket',
            'deps': [
                    'angular'
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