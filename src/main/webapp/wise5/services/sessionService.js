define(['configService'], function(configService) {

    var service = ['$http', '$rootScope', 'ConfigService', function($http, $rootScope, ConfigService) {
        var serviceObject = {};
        
        serviceObject.sessionTimeoutInterval = null;
        serviceObject.warningId = null;
        serviceObject.logOutId = null;
        
        serviceObject.initializeSession = function() {
            //this.sessionTimeoutInterval = ConfigService.getConfigParam('sessionTimeoutInterval');
            var minutes = 20;
            var seconds = minutes * 60;
            var milliseconds = seconds * 1000;
            this.sessionTimeoutInterval = milliseconds;
            this.startTimers();
        };
        
        serviceObject.startTimers = function() {
            this.startWarningTimer();
            this.startLogOutTimer();
        };
        
        serviceObject.startWarningTimer = function() {
            var warningTimeoutInterval = this.sessionTimeoutInterval * 0.75;
            this.warningId = setTimeout(angular.bind(this, this.showWarning), warningTimeoutInterval);
        };
        
        serviceObject.startLogOutTimer = function() {
            this.logOutId = setTimeout(angular.bind(this, this.forceLogOut), this.sessionTimeoutInterval);
        };
        
        serviceObject.showWarning = function() {
            $rootScope.$broadcast('showSessionWarning');
        };
        
        serviceObject.renewSession = function() {
            this.clearTimers();
            this.startTimers();
        };
        
        serviceObject.clearTimers = function() {
            clearTimeout(this.warningId);
            clearTimeout(this.logOutId);
        };
        
        serviceObject.forceLogOut = function() {
            $rootScope.$broadcast('logOut');
            this.logOut();
        };
        
        serviceObject.logOut = function() {
            var logOutListenerCount = $rootScope.$$listenerCount.logOut;
            console.log('sessionService.logOut(), logOutListenerCount: ' + logOutListenerCount);
            if (logOutListenerCount != null && logOutListenerCount > 0) {
                // don't log out yet because there are listeners alive
            } else {
                var sessionLogOutURL = ConfigService.getSessionLogOutURL();
                $http.get(sessionLogOutURL).then(function() {
                    var mainHomePageURL = ConfigService.getMainHomePageURL();
                    window.location.href = mainHomePageURL;
                });
            }
        };
        
        return serviceObject;
    }];
    
    return service;
});