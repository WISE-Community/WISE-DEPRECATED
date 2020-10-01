'use strict';

var self;

class HttpInterceptor {
  constructor($q, $rootScope, NotificationService) {
    self = this;
    self.$q = $q;
    self.$rootScope = $rootScope;
    self.NotificationService = NotificationService;
  }

  // intercept request
  request(config) {
    return config;
  }

  // intercept request error
  requestError(rejection) {
    return self.$q.reject(rejection);
  }

  // intercept response
  response(response) {
    // response received, clear any disconnection alerts
    self.NotificationService.broadcastServerConnectionStatus(true);
    return response;
  }

  // intercept response error
  responseError(rejection) {
    if (rejection.status === -1 || rejection.status === 500 || rejection.status === 503 || rejection.status === 504 ) {
      // response error, broadcast disconnection alert
      self.NotificationService.broadcastServerConnectionStatus(false);
    }
    return self.$q.reject(rejection);
  }
}

HttpInterceptor.$inject = ['$q', '$rootScope', 'NotificationService'];

export default HttpInterceptor;
