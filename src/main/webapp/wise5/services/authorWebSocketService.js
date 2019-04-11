'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AuthorWebSocketService = function () {
  function AuthorWebSocketService($rootScope, $stomp, ConfigService) {
    _classCallCheck(this, AuthorWebSocketService);

    this.$rootScope = $rootScope;
    this.$stomp = $stomp;
    this.ConfigService = ConfigService;
  }

  _createClass(AuthorWebSocketService, [{
    key: 'subscribeToCurrentAuthors',
    value: function subscribeToCurrentAuthors(projectId) {
      var _this = this;

      return this.$stomp.connect(this.ConfigService.getWebSocketURL()).then(function (frame) {
        _this.$stomp.subscribe('/topic/current-authors/' + projectId, function (authors, headers, res) {
          _this.$rootScope.$broadcast('currentAuthorsReceived', { authors: authors });
        }, {});
      });
    }
  }, {
    key: 'unSubscribeFromCurrentAuthors',
    value: function unSubscribeFromCurrentAuthors(projectId) {
      return this.$stomp.disconnect();
    }
  }]);

  return AuthorWebSocketService;
}();

AuthorWebSocketService.$inject = ['$rootScope', '$stomp', 'ConfigService'];

exports.default = AuthorWebSocketService;
//# sourceMappingURL=authorWebSocketService.js.map
