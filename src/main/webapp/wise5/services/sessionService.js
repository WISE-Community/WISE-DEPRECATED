define(['configService'], function(configService) {

    var service = ['$http', '$rootScope', 'ConfigService', function($http, $rootScope, ConfigService) {
        var serviceObject = {};
        
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