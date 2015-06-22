require.config({
    baseUrl: 'wise5/',
    paths: {
        'angular': 'lib/angular/angular',
        'angularAnimate': 'lib/angular/angularAnimate/angular-animate.min',
        'angularAudio': 'lib/angular/angularAudio/angular-audio',
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
        'audioRecorderController': 'nodes/audioRecorder/audioRecorderController',
        'audioRecorderService': 'nodes/audioRecorder/audioRecorderService',
        'bootstrap': 'lib/bootstrap/bootstrap.min',
        'configService': 'services/configService',
        'currentNodeService': 'services/currentNodeService',
        'cRaterService': 'services/cRaterService',
        'd3': 'lib/d3/d3',
        'drawingTool': 'lib/drawingTool/drawing-tool',
        'directives': 'directives/directives',
        'discussionController': 'nodes/discussion/discussionController',
        'discussionService': 'nodes/discussion/discussionService',
        'drawController': 'nodes/draw/drawController',
        'drawService': 'nodes/draw/drawService',
        'filters': 'filters/filters',
        'graphController': 'nodes/graph/graphController',
        'graphService': 'nodes/graph/graphService',
        'highcharts': 'lib/highcharts/highcharts.src',
        'highcharts-more': 'lib/highcharts/highcharts-more',
        'highcharts-ng': 'lib/highcharts/highcharts-ng',
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
        'outsideURLController': 'nodes/outsideURL/outsideURLController',
        'outsideURLService': 'nodes/outsideURL/outsideURLService',
        'photoBoothController': 'nodes/photoBooth/photoBoothController',
        'photoBoothService': 'nodes/photoBooth/photoBoothService',
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
        'tableController': 'nodes/table/tableController',
        'tableService': 'nodes/table/tableService',
        'vendor': 'lib/drawingTool/vendor',
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
        'angularAudio': {
            'exports': 'angularAudio',
            'deps': [
                    'angular',
                    'jquery'
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
        'drawingTool': {
            'exports': 'drawingTool',
            'deps': [
                    'vendor'
                    ]
        },
        'highcharts': {
            'exports': 'highcharts',
            'deps': [
                    'angular',
                    'jquery'
                    ]
        },
        'highcharts-more': {
            'exports': 'highcharts-more',
            'deps': [
                    'angular',
                    'highcharts'
                    ]
        },
        'highcharts-ng': {
            'exports': 'highcharts-ng',
            'deps': [
                    'angular',
                    'highcharts'
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