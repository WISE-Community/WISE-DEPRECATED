define(['configService'], function(configService) {

    var service = ['$http',
                   '$rootScope',
                   'ConfigService', 
                   function($http,
                           $rootScope,
                           ConfigService) {
        var serviceObject = {};
        
        /*
         * the amount of time (in milliseconds) before we automatically log
         * out the user
         */
        serviceObject.sessionTimeoutInterval = null;
        
        /*
         * the amount of time (in milliseconds) before we check if there
         * were any mouse events
         */
        serviceObject.checkMouseEventInterval = null;
        
        /*
         * the timestamp when the last mouse event occurred
         */
        serviceObject.lastMouseEventTimestamp = null;
        
        // the id for the setTimeout of the warning message
        serviceObject.warningId = null;
        
        // the id for the setTimeout of the automatic log out
        serviceObject.logOutId = null;
        
        /**
         * Start the timers
         */
        serviceObject.initializeSession = function() {
            //this.sessionTimeoutInterval = ConfigService.getConfigParam('sessionTimeoutInterval');
            var minutes = 20;
            var seconds = minutes * 60;
            var milliseconds = seconds * 1000;
            this.sessionTimeoutInterval = milliseconds;
            
            // set the check mouse interval to one minute
            this.checkMouseEventInterval = this.convertMinutesToMilliseconds(1);
            
            // start the warning and auto log out timers
            this.startTimers();
            
            // start the check mouse event timer
            this.startCheckMouseEventTimer();
        };
        
        /**
         * Start the warning and auto log out timers
         */
        serviceObject.startTimers = function() {
            this.startWarningTimer();
            this.startLogOutTimer();
        };
        
        /**
         * Start the warning timer
         */
        serviceObject.startWarningTimer = function() {
            var warningTimeoutInterval = this.sessionTimeoutInterval * 0.75;
            this.warningId = setTimeout(angular.bind(this, this.showWarning), warningTimeoutInterval);
        };
        
        /**
         * Start the auto log out timer
         */
        serviceObject.startLogOutTimer = function() {
            this.logOutId = setTimeout(angular.bind(this, this.forceLogOut), this.sessionTimeoutInterval);
        };
        
        /**
         * Start the check mouse event timer
         */
        serviceObject.startCheckMouseEventTimer = function() {
            setInterval(angular.bind(this, this.checkMouseEvent), this.checkMouseEventInterval);
        };
        
        /**
         * Fire the event that will show the warning message
         */
        serviceObject.showWarning = function() {
            $rootScope.$broadcast('showSessionWarning');
        };
        
        /**
         * Refresh the timers
         */
        serviceObject.renewSession = function() {
            this.clearTimers();
            this.startTimers();
        };
        
        /**
         * Delete the existing timers
         */
        serviceObject.clearTimers = function() {
            clearTimeout(this.warningId);
            clearTimeout(this.logOutId);
        };
        
        /**
         * Called when a mouse event occurs
         */
        serviceObject.mouseEventOccurred = function() {
            
            // get the current timestamp
            var date = new Date();
            var timestamp = date.getTime();
            
            // remember this timestamp
            this.lastMouseEventTimestamp = timestamp;
        };
        
        /**
         * Check if there were any mouse events since the last time we checked
         */
        serviceObject.checkMouseEvent = function() {
            if (this.lastMouseEventTimestamp != null) {
                // there was a mouse event since the last time we checked
                
                // reset the timers
                this.renewSession();
                
                // clear the mouse event timestamp
                this.lastMouseEventTimestamp = null;
            }
        };
        
        /**
         * Convert minutes to milliseconds
         * @param minutes the number of minutes
         * @return the number of milliseconds
         */
        serviceObject.convertMinutesToMilliseconds = function(minutes) {
            var milliseconds = null;
            
            if (minutes != null) {
                // get the number of seconds
                var seconds = minutes * 60;
                
                // get the number of milliseconds
                milliseconds = seconds * 1000;
            }
            
            return milliseconds;
        };
        
        /**
         * Log out the user
         */
        serviceObject.forceLogOut = function() {
            $rootScope.$broadcast('logOut');
        };
        
        /**
         * Check if there are components that are not ready to log out
         * because they have not saved their data yet. If there are no
         * components left to wait for, we can then log out.
         */
        serviceObject.attemptLogOut = function() {
            
            // get all the components listening for the logOut event
            var logOutListenerCount = $rootScope.$$listenerCount.logOut;
            
            /*
             * Check how many log out listeners are still listening for the
             * logOut event. This logOutListenerCount will always be 1 or 
             * more because this SessionService also listens for the logOut
             * event but is never removed from the count. Components such as
             * nodes will finish saving their data and then be removed from
             * the listener count.
             */
            if (logOutListenerCount != null && logOutListenerCount > 1) {
                // don't log out yet because there are still listeners
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
        };
        
        /**
         * Listen for the 'componentDoneUnloading' event. When the user logs
         * out of the VLE, we will need to wait for certain components to 
         * finish performing any necessary processing (such as saving) before
         * we actually log out. Once a component has completed their unloading
         * they will fire the 'componentDoneUnloading' event. We will listen
         * for this event and when there are no more components left to wait
         * for, we will then log out.
         */
        $rootScope.$on('componentDoneUnloading', angular.bind(serviceObject, function() {
            
            // check if all components are done unloading so we can log out
            this.attemptLogOut();
        }));
        
        /**
         * Listen for the 'logOut' event. We will attempt to log out when
         * the 'logOut' even is fired. There may be components that have not
         * saved their data yet so we may not be able to log out right away.
         * If there are components that have not saved their data yet, we 
         * will wait for those components to fire the 'componentDoneUnloading'
         * event and then try to log out again.
         */
        $rootScope.$on('logOut', angular.bind(serviceObject, function() {
            
            // check if all components are done unloading so we can log out
            this.attemptLogOut();
        }));
        
        return serviceObject;
    }];
    
    return service;
});