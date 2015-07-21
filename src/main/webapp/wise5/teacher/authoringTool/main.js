require.config({
    baseUrl: '../wise/vle5/',
    paths: {
        'angular': [
            '//ajax.googleapis.com/ajax/libs/angularjs/1.3.16/angular.min',
            'vendor/angular/angular.min'
        ],
        'angularAnimate': 'vendor/angular-animate/angular-animate.min',
        'angularAria': 'vendor/angular-aria/angular-aria.min',
        'angularDragDrop': 'vendor/angular-dragdrop/src/angular-dragdrop.min',
        'angularMaterial': [
            '//ajax.googleapis.com/ajax/libs/angular_material/0.10.0/angular-material.min',
            'vendor/angular-material/angular-material.min'
        ],
        'angularUIRouter': 'vendor/angular-ui-router/release/angular-ui-router.min',
        'angularPostMessage': 'vendor/angular-post-message/dist/angular-post-message.min',
        'app': 'teacher/authoringTool/app',
        'configService': 'services/configService',
        'jquery': [
            '//ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min',
            'vendor/jquery/dist/jquery.min'
        ],
        'jqueryUI': 'lib/jquery/jquery-ui-1.10.4.interactions.min',
        'nodeApplicationService': 'services/nodeApplicationService',
        'nodeAdvancedController': 'teacher/authoringTool/node/nodeAdvancedController',
        'nodeController': 'teacher/authoringTool/node/nodeController',
        'nodeNormalController': 'teacher/authoringTool/node/nodeNormalController',
        'nodePreviewController': 'teacher/authoringTool/node/nodePreviewController',
        'nodeService': 'services/nodeService',
        'projectAdvancedController': 'teacher/authoringTool/project/projectAdvancedController',
        'projectController': 'teacher/authoringTool/project/projectController',
        'projectNormalController': 'teacher/authoringTool/project/projectNormalController',
        'projectService': 'services/projectService',
        'rootController': 'teacher/authoringTool/rootController',
        'studentDataService': 'services/studentDataService'
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
        'jquery': {
            'exports': 'jquery'
        },
        'jqueryUI': {
            'exports': 'jqueryUI',
            'deps': [
                'jquery'
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

require(['app'], function(app) {
    app.init();
});