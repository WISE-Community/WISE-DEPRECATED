require.config({
    baseUrl: 'wise5/',
    paths: {
        'angular': 'lib/angular/angular',
        'angularAnimate': 'lib/angular/angularAnimate/angular-animate.min',
        'angularDragDrop': 'lib/angular/angularDragDrop/angular-dragdrop.min',
        'angularFileUpload': 'lib/angular/angularFileUpload/angular-file-upload.min',
        'angularSortable': 'lib/angular/angularSortable/angular-sortable',
        'angularTextAngular': 'lib/angular/angularTextAngular/textAngular.min',
        'angularTextAngularRangy': 'lib/angular/angularTextAngular/textAngular-rangy.min',
        'angularTextAngularSanitize': 'lib/angular/angularTextAngular/textAngular-sanitize.min',
        'angularUIRouter': 'lib/angular/angularUIRouter/angular-ui-router.min',
        'angularWebSocket': 'lib/angular/angularWebSocket/angular-websocket.min',
        'annotationService': 'services/annotationService',
        'app': 'vle/app',
        'bootstrap': 'lib/bootstrap/bootstrap.min',
        'configService': 'services/configService',
        'currentNodeService': 'services/currentNodeService',
        'cRaterService': 'services/cRaterService',
        'd3': 'lib/d3/d3',
        'directives': 'directives/directives',
        'htmlController': 'nodes/html/htmlController',
        'jquery': 'lib/jquery/jquery-2.1.3.min',
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
        'questionnaireController': 'nodes/questionnaire/questionnaireController',
        'questionnaireService': 'nodes/questionnaire/questionnaireService',
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
        'angularTextAngular': {
            'exports': 'angularTextAngular',
            'deps': [
                     'angular',
                     'bootstrap',
                     'angularTextAngularRangy',
                     'angularTextAngularSanitize'
                     ]
        },
        'angularTextAngularRangy': {
            'exports': 'angularTextAngularRangy',
            'deps': [
                    'angular'
                    ]
        },
        'angularTextAngularSanitize': {
            'exports': 'angularTextAngularSanitize',
            'deps': [
                    'angular'
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
        'bootstrap': {
            'exports': 'bootstrap',
            'deps': [
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