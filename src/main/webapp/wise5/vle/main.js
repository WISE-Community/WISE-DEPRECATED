require.config({
    baseUrl: 'wise5/',
    waitSeconds: 0,
    paths: {
        'angular': [
            '//ajax.googleapis.com/ajax/libs/angularjs/1.3.16/angular.min',
            'vendor/angular/angular.min'
            ],
        'angularAnimate': 'vendor/angular-animate/angular-animate.min',
        'angularAria': 'vendor/angular-aria/angular-aria.min',
        'angularAudio': 'vendor/angular-audio/app/angular.audio',
        'angularDragDrop': 'vendor/angular-dragdrop/src/angular-dragdrop.min',
        'angularFileUpload': 'vendor/ng-file-upload/ng-file-upload.min',
        'angularMaterial': 'vendor/angular-material/angular-material.min',
        'angularSortable': 'vendor/angular-ui-sortable/sortable.min',
        'angularTextAngular': 'lib/angularTextAngular/textAngular.min', // TODO: switch to using bower once loading errors are fixed
        'angularTextAngularRangy': 'lib/angularTextAngular/textAngular-rangy.min', // TODO: switch to using bower once loading errors are fixed
        'angularTextAngularSanitize': 'lib/angularTextAngular/textAngular-sanitize.min', // TODO: switch to using bower once loading errors are fixed
        'angularUIRouter': 'vendor/angular-ui-router/release/angular-ui-router.min',
        'angularUITree': 'vendor/angular-ui-tree/dist/angular-ui-tree.min',
        'angularWebSocket': 'vendor/angular-websocket/angular-websocket.min',
        'app': 'vle/app',
        'audioRecorderController': 'components/audioRecorder/audioRecorderController',
        'audioRecorderService': 'components/audioRecorder/audioRecorderService',
        'bootstrap': [ // TODO: remove once no longer using
            '//maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min',
            'lib/bootstrap/bootstrap.min'
            ],
        'configService': 'services/configService',
        'currentNodeService': 'services/currentNodeService',
        'cRaterController': 'components/cRater/cRaterController',
        'cRaterService': 'components/cRater/cRaterService',
        'd3': 'lib/d3/d3',
        'drawingTool': 'lib/drawingTool/drawing-tool',
        'vendor': 'lib/drawingTool/vendor',
        'directives': 'directives/directives',
        'discussionController': 'components/discussion/discussionController',
        'discussionService': 'components/discussion/discussionService',
        'drawController': 'components/draw/drawController',
        'drawService': 'components/draw/drawService',
        'filters': 'filters/filters',
        'graphController': 'components/graph/graphController',
        'graphService': 'components/graph/graphService',
        'highcharts': 'vendor/highcharts/highcharts',
        'highcharts-more': 'vendor/highcharts/highcharts-more',
        'highcharts-ng': 'vendor/highcharts-ng/dist/highcharts-ng-modified',
        'htmlController': 'components/html/htmlController',
        'jquery': [
            '//ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min',
            'vendor/jquery/dist/jquery.min'
            ],
        'jqueryUI': [ // TODO: switch to pared down custom build
            '//ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min',
            'vendor/jquery-ui/jquery-ui.min'
            ],
        'matchController': 'components/match/matchController',
        'matchService': 'components/match/matchService',
        'multipleChoiceController': 'components/multipleChoice/multipleChoiceController',
        'multipleChoiceService': 'components/multipleChoice/multipleChoiceService',
        'navigationController': 'vle/navigation/navigationController',
        'nodeController': 'node/nodeController',
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
        'sessionService': 'services/sessionService',
        'studentAssetService': 'services/studentAssetService',
        'studentDataService': 'services/studentDataService',
        'studentStatusService': 'services/studentStatusService',
        'studentWebSocketService': 'services/studentWebSocketService',
        'tableController': 'components/table/tableController',
        'tableService': 'components/table/tableService',
        'vleController': 'vle/vleController',
        'webfont': [
            '//ajax.googleapis.com/ajax/libs/webfont/1.5.18/webfont',
            'vendor/webfontloader/webfontloader'
            ],
        'webfonts': 'js/webfonts'
    },
    shim: {
        'angular': {
            'exports': 'angular',
            'deps': [
                'jquery'
            ]
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
                    'angular'
                    ]
        },
        'angularDragDrop': {
            'exports': 'angularDragDrop',
            'deps': [
                    'angular'
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
                     'angular'
                     ]
        },
        'angularTextAngular': {
            'exports': 'angularTextAngular',
            'deps': [
                     'angular',
                     'bootstrap',
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
                    'angular',
                    'angularTextAngularRangy'
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
        'vendor': {
            'exports': 'vendor'
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
        'jquery': {
            'exports': 'jquery'
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