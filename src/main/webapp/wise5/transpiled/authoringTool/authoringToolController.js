'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AuthoringToolController = function () {
    function AuthoringToolController($scope, ConfigService, SessionService, $mdDialog) {
        _classCallCheck(this, AuthoringToolController);

        this.ConfigService = ConfigService;
        this.SessionService = SessionService;

        $scope.$on('showSessionWarning', angular.bind(this, function () {
            // Appending dialog to document.body
            var confirm = $mdDialog.confirm().parent(angular.element(document.body)).title('Session Timeout').content('You have been inactive for a long time. Do you want to stay logged in?').ariaLabel('Session Timeout').ok('YES').cancel('No');
            $mdDialog.show(confirm).then(function () {
                this.SessionService.renewSession();
            }, function () {
                this.SessionService.forceLogOut();
            });
        }));
    }

    _createClass(AuthoringToolController, [{
        key: 'exit',
        value: function exit() {
            //get the context path e.g. /wise
            var contextPath = this.ConfigService.getConfigParam('contextPath');
            // send the user to the teacher home page
            var homePageURL = contextPath + '/teacher';
            window.location = homePageURL;
        }
    }]);

    return AuthoringToolController;
}();

AuthoringToolController.$inject = ['$scope', 'ConfigService', 'SessionService', '$mdDialog'];

exports.default = AuthoringToolController;