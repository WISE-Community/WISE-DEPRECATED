require.config({
    baseUrl: 'wise5/',
    waitSeconds: 0,
    paths: {
        'angular': [
            '//ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular.min',
            'lib/angular/angular'
            ],
        'angularAnimate': 'lib/angular/angularAnimate/angular-animate.min',
        'angularAria': 'lib/angular/angularAria/angular-aria.min',
        'angularAudio': 'lib/angular/angularAudio/angular-audio',
        'angularDragDrop': 'lib/angular/angularDragDrop/angular-dragdrop.min',
        'angularFileUpload': 'lib/angular/angularFileUpload/angular-file-upload.min',
        'angularMaterial': [
            '//ajax.googleapis.com/ajax/libs/angular_material/0.10.0/angular-material.min',
            'lib/angular/angularMaterial/dist/angular-material.min',
            ],
        'angularSortable': 'lib/angular/angularSortable/angular-sortable',
        'angularTextAngular': 'lib/angular/angularTextAngular/textAngular.min',
        'angularTextAngularRangy': 'lib/angular/angularTextAngular/textAngular-rangy.min',
        'angularTextAngularSanitize': 'lib/angular/angularTextAngular/textAngular-sanitize.min',
        'angularUIRouter': 'lib/angular/angularUIRouter/angular-ui-router.min',
        'angularUITree': 'lib/angular/angularUITree/angular-ui-tree.min',
        'angularWebSocket': 'lib/angular/angularWebSocket/angular-websocket.min',
        'annotationService': 'services/annotationService',
        'app': 'vle/app',
        'audioRecorderController': 'components/audioRecorder/audioRecorderController',
        'audioRecorderService': 'components/audioRecorder/audioRecorderService',
        'bootstrap': [
            '//maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min',
            'lib/bootstrap/bootstrap.min'
            ],
        'configService': 'services/configService',
        'currentNodeService': 'services/currentNodeService',
        'cRaterService': 'services/cRaterService',
        'd3': 'lib/d3/d3',
        'drawingTool': 'lib/drawingTool/drawing-tool',
        'directives': 'directives/directives',
        'discussionController': 'components/discussion/discussionController',
        'discussionService': 'components/discussion/discussionService',
        'drawController': 'components/draw/drawController',
        'drawService': 'components/draw/drawService',
        'filters': 'filters/filters',
        'graphController': 'components/graph/graphController',
        'graphService': 'components/graph/graphService',
        'highcharts': 'lib/highcharts/highcharts.src',
        'highcharts-more': 'lib/highcharts/highcharts-more',
        'highcharts-ng': 'lib/highcharts/highcharts-ng',
        'htmlController': 'components/html/htmlController',
        'jquery': [
            '//ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min',
            'lib/jquery/jquery-2.1.3.min'
            ],
        'jqueryUI': [
            '//ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min',
            'lib/jquery/jquery-ui.min'
            ],
        'matchController': 'components/match/matchController',
        'matchService': 'components/match/matchService',
        'multipleChoiceController': 'components/multipleChoice/multipleChoiceController',
        'multipleChoiceService': 'components/multipleChoice/multipleChoiceService',
        'navigationController': 'vle/navigation/navigationController',
        'nodeController': 'vle/node/nodeController',
        'nodeService': 'services/nodeService',
        'openResponseController': 'components/openResponse/openResponseController',
        'openResponseService': 'components/openResponse/openResponseService',
        'outsideURLController': 'components/outsideURL/outsideURLController',
        'outsideURLService': 'components/outsideURL/outsideURLService',
        'photoBoothController': 'components/photoBooth/photoBoothController',
        'photoBoothService': 'components/photoBooth/photoBoothService',
        'planningController': 'components/planning/planningController',
        'planningService': 'components/planning/planningService',
        'portfolioController': 'vle/portfolio/portfolioController',
        'portfolioService': 'services/portfolioService',
        'projectService': 'services/projectService',
        'questionnaireController': 'components/questionnaire/questionnaireController',
        'questionnaireService': 'components/questionnaire/questionnaireService',
        'sessionService': 'services/sessionService',
        'studentAssetService': 'services/studentAssetService',
        'studentDataService': 'services/studentDataService',
        'studentStatusService': 'services/studentStatusService',
        'studentWebSocketService': 'services/studentWebSocketService',
        'tableController': 'components/table/tableController',
        'tableService': 'components/table/tableService',
        'vendor': 'lib/drawingTool/vendor',
        'vleController': 'vle/vleController',
        'webfont': [
            '//ajax.googleapis.com/ajax/libs/webfont/1.5.18/webfont',
            'lib/webfontloader/webfontloader'
            ],
        'webfonts': 'js/webfonts'
    },
    shim: {
        'angular': {
            'exports': 'angular'
        },
        'angularAnimate': {
            'exports': 'angularAnimate',
            'deps': [
                    'angular'
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
        'angularUITree': {
            'exports': 'angularUITree',
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
        },
        'angularAria': {
            'exports': 'angularAria',
            'deps': [
                'angular'
            ]
        },
        'angularMaterial': {
            'exports': 'angularMaterial',
            'deps': [
                'angularAnimate',
                'angularAria'
            ]
        },
        'webfont': {
            'exports': 'webfont'
        },
        'webfonts': {
            'exports': 'webfonts',
            'deps': [
                'webfont'
            ]
        }
    }
});

require(['app'],function(app){
    app.init();
});