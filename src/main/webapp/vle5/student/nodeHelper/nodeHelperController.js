define(['app'], function(app) {
    app.$controllerProvider.register('NodeHelperController', 
        function($scope, $state, $stateParams, ConfigService, NodeApplicationService, NodeService, ProjectService, StudentDataService) {
            
            var nodeApplications = ConfigService.getConfigParam('nodeApplications');
            
            for(var x = 0; x < nodeApplications.length; x++) {
                var nodeApplication = nodeApplications[x];
                var nodeApplicationUrl = nodeApplication.url;
                nodeApplications[x].url = nodeApplicationUrl.replace('index.html', 'index.html?mode=headless');
            }
            
            this.nodeApplications = nodeApplications;
            
            //StudentDataService.updateNodeStatuses();
    })
});