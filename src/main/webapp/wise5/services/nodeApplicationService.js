define(['angular', 'configService'], function(angular, configService) {

    angular.module('NodeApplicationService', [])
    
    .service('NodeApplicationService', ['ConfigService', function(ConfigService) {
        
        this.nodeApplications = null;
        
        this.intializeNodeApplications = function() {
            this.nodeApplications = ConfigService.getConfigParam('nodeApplications');
            return this.nodeApplications;
        };
        
        this.getNodeURL = function(nodeName) {
            for (var i = 0; i < this.nodeApplications.length; i++) {
                var nodeApplication = this.nodeApplications[i];
                if (nodeApplication.name === nodeName) {
                    return nodeApplication.url;
                } 
            }
            return null;
        };
    }]);
});