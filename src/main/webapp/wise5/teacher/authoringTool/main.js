require.config({
    baseUrl: '../wise/vle5/',
    paths: {
        'angular': 'lib/angular/angular',
        'angularUIRouter': 'lib/angular/angularUIRouter/angular-ui-router',
        'angularPostMessage': 'lib/angular/angularPostMessage/angular-post-message',
        'app': 'teacher/authoringTool/app',
        'configService': 'services/configService',
        'jquery': 'lib/jquery/jquery-2.1.3.min',
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
            'exports':'angular'
        },
        'angularUIRouter': {
            'exports':'angularUIRouter',
            'deps': [
                    'angular'
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