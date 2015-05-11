define(['configService'], function(configService) {

    var service = ['$http',
                   '$rootScope',
                   'ConfigService', 
                   function($http,
                           $rootScope,
                           ConfigService) {
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
        
        /**
         * Listen for the 'componentDoneUnloading' event. When the user logs
         * out of the VLE, we will need to wait for certain components to 
         * finish performing any necessary processing (such as saving) before
         * we actualy log out. Once a component has completed their unloading
         * they will fire the 'componentDoneUnloading' event. We will listen
         * for this event and when there are no more components left to wait
         * for, we will then log out.
         */
        $rootScope.$on('componentDoneUnloading', angular.bind(this, function() {
            
            // get all the components listening for the logOut event
            var logOutListenerCount = $rootScope.$$listenerCount.logOut;
            
            if (logOutListenerCount != null && logOutListenerCount > 0) {
                // don't log out yet because there are listeners alive
            } else {
                // there are no more listeners so we will log out
                
                // get the url that will log out the user
                var sessionLogOutURL = ConfigService.getSessionLogOutURL();
                
                // make a request to the log out url
                $http.get(sessionLogOutURL).then(function() {
                    
                    // bring the user back to the home page
                    var mainHomePageURL = ConfigService.getMainHomePageURL();
                    window.location.href = mainHomePageURL;
                });
            }
        }));
        
        return serviceObject;
    }];
    
    return service;
});