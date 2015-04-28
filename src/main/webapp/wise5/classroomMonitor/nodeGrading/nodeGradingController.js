define(['app'], function(app) {

    app
    .$controllerProvider
    .register('NodeGradingController', ['$state', 'ConfigService', 'CurrentNodeService', 'StudentStatusService', 'TeacherDataService',
                                            function ($state, ConfigService, CurrentNodeService, StudentStatusService, TeacherDataService) {
        this.title = 'Node Grading!!!';
        
        this.nodeId = CurrentNodeService.getCurrentNodeId();
        
        var vleStates = TeacherDataService.getVLEStates();
        
        this.workgroupIds = ConfigService.getClassmateWorkgroupIds();
        
        this.getNodeVisitsByWorkgroupIdAndNodeId = function(workgroupId, nodeId) {
            return TeacherDataService.getNodeVisitsByWorkgroupIdAndNodeId(workgroupId, nodeId);
        };
        
        this.getUserNameByWorkgroupId = function(workgroupId) {
            var userName = null;
            var userInfo = ConfigService.getUserInfoByWorkgroupId(workgroupId);
            
            if (userInfo != null) {
                userName = userInfo.userName;
            }
            
            return userName;
        };
        
        this.scoreChanged = function() {
            console.log('scoreChanged');
        };
    }]);
    
});