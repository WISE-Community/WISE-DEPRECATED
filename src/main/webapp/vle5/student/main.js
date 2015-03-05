require.config({
    baseUrl: '../wise/vle5/',
    paths: {
        'angular': 'lib/angular/angular',
        'angularPostMessage': 'lib/angular/angularPostMessage/angular-post-message',
        'angularUIRouter': 'lib/angular/angularUIRouter/angular-ui-router',
        'app': 'student/app',
        'configService': 'services/configService',
        'jquery': 'lib/jquery/jquery-2.1.3.min',
        'nodeApplicationService': 'services/nodeApplicationService',
        'nodeService': 'services/nodeService',
        'projectService': 'services/projectService',
        'studentDataService': 'services/studentDataService',
        'vleController': 'student/vleController'
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