require.config({
    baseUrl: 'wise5/',
    paths: {
        'angular': 'lib/angular/angular',
        'angularAnimate': 'lib/angular/angularAnimate/angular-animate.min',
        'angularDragDrop': 'lib/angular/angularDragDrop/angular-dragdrop.min',
        'angularSortable': 'lib/angular/angularSortable/angular-sortable',
        'angularUIRouter': 'lib/angular/angularUIRouter/angular-ui-router.min',
        'angularWebSocket': 'lib/angular/angularWebSocket/angular-websocket.min',
        'annotationService': 'services/annotationService',
        'app': 'classroomMonitor/app',
        'classroomMonitorController': 'classroomMonitor/classroomMonitorController',
        'configService': 'services/configService',
        'currentNodeService': 'services/currentNodeService',
        'd3': 'lib/d3/d3',
        'directives': 'directives/directives',
        'discussionService': 'components/discussion/discussionService',
        'drawService': 'components/draw/drawService',
        'filters': 'filters/filters',
        'graphService': 'components/graph/graphService',
        'htmlController': 'components/html/htmlController',
        'jquery': 'lib/jquery/jquery-2.1.3.min',
        'jqueryUI': 'lib/jquery/jquery-ui-1.10.4.interactions.min',
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
        'portfolioController': 'classroomMonitor/portfolio/portfolioController',
        'portfolioService': 'services/portfolioService',
        'projectService': 'services/projectService',
        'sessionService': 'services/sessionService',
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