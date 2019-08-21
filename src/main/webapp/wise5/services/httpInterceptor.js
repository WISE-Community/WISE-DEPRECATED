'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var self;

var HttpInterceptor =
/*#__PURE__*/
function () {
  function HttpInterceptor($q, $rootScope) {
    _classCallCheck(this, HttpInterceptor);

    self = this;
    self.$q = $q;
    self.$rootScope = $rootScope;
  } // intercept request


  _createClass(HttpInterceptor, [{
    key: "request",
    value: function request(config) {
      return config;
    } // intercept request error

  }, {
    key: "requestError",
    value: function requestError(rejection) {
      return self.$q.reject(rejection);
    } // intercept response

  }, {
    key: "response",
    value: function response(_response) {
      // response received, clear any disconnection alerts
      self.$rootScope.$broadcast('serverConnected');
      return _response;
    } // intercept response error

  }, {
    key: "responseError",
    value: function responseError(rejection) {
      if (rejection.status === -1 || rejection.status === 500 || rejection.status === 503 || rejection.status === 504) {
        // response error, broadcast disconnection alert
        self.$rootScope.$broadcast('serverDisconnected');
      }

      return self.$q.reject(rejection);
    }
  }]);

  return HttpInterceptor;
}();

HttpInterceptor.$inject = ['$q', '$rootScope'];
var _default = HttpInterceptor;
exports["default"] = _default;
//# sourceMappingURL=httpInterceptor.js.map
