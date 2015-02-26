require.config({
    baseUrl: '../wise/vle5/teacher',
    paths: {
        'angular':'../lib/angular/angular',
        'angularUIRouter':'../lib/angular/angularUIRouter/angular-ui-router',
        'angularPostMessage':'../lib/angular/angularPostMessage/angular-post-message',
        'vleController': 'vleController',
        'jquery': '../lib/jquery/jquery-2.1.3.min',
        'configService': '../services/configService',
        'projectService': '../services/projectService',
        'nodeApplicationService': '../services/nodeApplicationService',
        'nodeService': '../services/nodeService',
        'studentDataService': '../services/studentDataService'
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

require(['app'],function(app){
    app.init();
});