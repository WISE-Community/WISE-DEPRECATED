'use strict';

define(['../../test/app'], function (app) {
    app.$controllerProvider.register('ProjectNormalController', function ($scope, ConfigService, ProjectService) {
        this.mode = 'author';

        var knownNavigationApplications = ConfigService.getConfigParam('navigationApplications');
        var projectNavigationApplications = ProjectService.getProject().navigationApplications;
        var defaultNavigationApplication = projectNavigationApplications[0];
        for (var i = 0; i < knownNavigationApplications.length; i++) {
            var knownNavigationApplication = knownNavigationApplications[i];
            if (knownNavigationApplication.name === defaultNavigationApplication) {
                var navigationApplicationURL = knownNavigationApplication.url + '?mode=' + this.mode;
                $('#projectIFrame').attr('src', navigationApplicationURL);
            }
        }
    });
});