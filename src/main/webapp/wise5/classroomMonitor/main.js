require.config({
    baseUrl: 'wise5/',
    paths: {
        'angular': [
            '//ajax.googleapis.com/ajax/libs/angularjs/1.3.16/angular.min',
            'vendor/angular/angular.min'
        ],
        'angularAnimate': 'vendor/angular-animate/angular-animate.min',
        'angularAria': 'vendor/angular-aria/angular-aria.min',
        'angularDragDrop': 'vendor/angular-dragdrop/src/angular-dragdrop.min',
        'angularFileUpload': 'vendor/ng-file-upload/ng-file-upload.min',
        'angularMaterial': [
            '//ajax.googleapis.com/ajax/libs/angular_material/0.10.0/angular-material.min',
            'vendor/angular-material/angular-material.min'
        ],
        'angularSortable': 'vendor/angular-ui-sortable/sortable.min',
        'angularUIRouter': 'vendor/angular-ui-router/release/angular-ui-router.min',
        'angularWebSocket': 'vendor/angular-websocket/angular-websocket.min',
        'annotationService': 'services/annotationService',
        'app': 'classroomMonitor/app',
        'classroomMonitorController': 'classroomMonitor/classroomMonitorController',
        'configService': 'services/configService',
        'cRaterService': 'components/cRater/cRaterService',
        'd3': 'lib/d3/d3',
        'drawingTool': 'lib/drawingTool/drawing-tool',
        'vendor': 'lib/drawingTool/vendor',
        'directives': 'directives/directives',
        'discussionService': 'components/discussion/discussionService',
        'drawService': 'components/draw/drawService',
        'drawController': 'components/draw/drawController',
        'embeddedService': 'components/embedded/embeddedService',
        'filters': 'filters/filters',
        'graphService': 'components/graph/graphService',
        'htmlController': 'components/html/htmlController',
        'jquery': [
            '//ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min',
            'vendor/jquery/dist/jquery.min'
        ],
        'jqueryUI': [ // TODO: switch to pared down custom build
            '//ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min',
            'vendor/jquery-ui/jquery-ui.min'
        ],
        'matchService': 'components/match/matchService',
        'multipleChoiceService': 'components/multipleChoice/multipleChoiceService',
        'navigationController': 'classroomMonitor/navigation/navigationController',
        'nodeController': 'classroomMonitor/node/nodeController',
        'nodeGradingController': 'classroomMonitor/nodeGrading/nodeGradingController',
        'nodeProgressController': 'classroomMonitor/nodeProgress/nodeProgressController',
        'nodeService': 'services/nodeService',
        'openResponseController': 'components/openResponse/openResponseController',
        'openResponseService': 'components/openResponse/openResponseService',
        'outsideURLService': 'components/outsideURL/outsideURLService',
        'photoBoothService': 'components/photoBooth/photoBoothService',
        'planningController': 'components/planning/planningController',
        'planningService': 'components/planning/planningService',
        'notebookService': 'services/notebookService',
        'projectService': 'services/projectService',
        'sessionService': 'services/sessionService',
        'studentAssetService': 'services/studentAssetService',
        'studentDataService': 'services/studentDataService',
        'studentGradingController': 'classroomMonitor/studentGrading/studentGradingController',
        'studentProgressController': 'classroomMonitor/studentProgress/studentProgressController',
        'studentStatusService': 'services/studentStatusService',
        'tableService': 'components/table/tableService',
        'teacherDataService': 'services/teacherDataService',
        'teacherWebSocketService': 'services/teacherWebSocketService'
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
        'drawingTool': {
            'exports': 'drawingTool',
            'deps': [
                'vendor'
            ]
        },
        'vendor': {
            'exports': 'vendor'
        },
        'jquery': {
            'exports': 'jquery'
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