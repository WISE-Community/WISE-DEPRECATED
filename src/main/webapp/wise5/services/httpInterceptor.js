'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var self;

var HttpInterceptor = function () {
    function HttpInterceptor($q, $rootScope) {
        _classCallCheck(this, HttpInterceptor);

        self = this;
        self.$q = $q;
        self.$rootScope = $rootScope;
    }

    // intercept request


    _createClass(HttpInterceptor, [{
        key: 'request',
        value: function request(config) {
            return config;
        }

        // intercept request error

    }, {
        key: 'requestError',
        value: function requestError(rejection) {
            return self.$q.reject(rejection);
        }

        // intercept response

    }, {
        key: 'response',
        value: function response(_response) {
            // response received, clear any disconnection alerts
            self.$rootScope.$broadcast('serverConnected');

            return _response;
        }

        // intercept response error

    }, {
        key: 'responseError',
        value: function responseError(rejection) {
            // response error, broadcast disconnection alert
            self.$rootScope.$broadcast('serverDisconnected');

            return self.$q.reject(rejection);
        }
    }]);

    return HttpInterceptor;
}();

HttpInterceptor.$inject = ['$q', '$rootScope'];

exports.default = HttpInterceptor;
//# sourceMappingURL=httpInterceptor.js.map