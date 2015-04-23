require.config({
    baseUrl: 'wise5/',
    paths: {
        'angular': 'lib/angular/angular',
        'angularAnimate': 'lib/angular/angularAnimate/angular-animate.min',
        'angularDragDrop': 'lib/angular/angularDragDrop/angular-dragdrop.min',
        'angularFileUpload': 'lib/angular/angularFileUpload/angular-file-upload.min',
        'angularSortable': 'lib/angular/angularSortable/angular-sortable',
        'angularUIRouter': 'lib/angular/angularUIRouter/angular-ui-router.min',
        'angularWebSocket': 'lib/angular/angularWebSocket/angular-websocket.min',
        'app': 'vle/app',
        'configService': 'services/configService',
        'd3': 'lib/d3/d3',
        'htmlController': 'nodes/html/htmlController',
        'jquery': 'lib/jquery/jquery-2.1.3.min',
        //'jqueryUI': 'lib/jquery/jquery-ui-1.10.4.interactions.min',
        'jqueryUI': 'lib/jquery/jquery-ui.min',
        'multipleChoiceController': 'nodes/multipleChoice/multipleChoiceController',
        'multipleChoiceService': 'nodes/multipleChoice/multipleChoiceService',
        'navigationController': 'vle/navigation/navigationController',
        'nodeController': 'vle/node/nodeController',
        'nodeService': 'services/nodeService',
        'openResponseController': 'nodes/openResponse/openResponseController',
        'openResponseService': 'nodes/openResponse/openResponseService',
        'planningController': 'nodes/planning/planningController',
        'planningService': 'nodes/planning/planningService',
        'portfolioController': 'vle/portfolio/portfolioController',
        'portfolioService': 'services/portfolioService',
        'projectService': 'services/projectService',
        'sessionService': 'services/sessionService',
        'studentAssetService': 'services/studentAssetService',
        'studentDataService': 'services/studentDataService',
        'studentStatusService': 'services/studentStatusService',
        'studentWebSocketService': 'services/studentWebSocketService',
        'vleController': 'vle/vleController'
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
        'angularFileUpload': {
            'exports': 'angularFileUpload',
            'deps': [
                    'angular'
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