require.config({
    baseUrl: '.',
    paths: {
        'angular': 'angular',
        'angularUIRouter': 'angular-ui-router',
        'app': 'app',
        'childService': 'ChildService',
        'parentService': 'ParentService',
        'testController': 'TestController'
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
        }
    }
});

require(['app'],function(app) {
    app.init();
});