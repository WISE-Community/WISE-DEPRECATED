'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AuthoringToolController = function () {
    function AuthoringToolController($mdDialog, $scope, $translate, ConfigService, SessionService) {
        var _this = this;

        _classCallCheck(this, AuthoringToolController);

        this.$mdDialog = $mdDialog;
        this.$scope = $scope;
        this.$translate = $translate;
        this.ConfigService = ConfigService;
        this.SessionService = SessionService;

        $scope.$on('showSessionWarning', function () {

            _this.$translate('autoLogoutMessage').then(function (autoLogoutMessage) {
                // Appending dialog to document.body
                var confirm = _this.$mdDialog.confirm().parent(angular.element(document.body)).title('Session Timeout').content(autoLogoutMessage).ariaLabel('Session Timeout').ok('YES').cancel('No');
                _this.$mdDialog.show(confirm).then(function () {
                    _this.SessionService.renewSession();
                }, function () {
                    _this.SessionService.forceLogOut();
                });
            });
        });
    }

    _createClass(AuthoringToolController, [{
        key: 'exit',
        value: function exit() {
            // Send the user to the teacher home page
            var wiseBaseURL = this.ConfigService.getWISEBaseURL();
            var teacherHomePageURL = wiseBaseURL + '/teacher';
            window.location = teacherHomePageURL;
        }
    }]);

    return AuthoringToolController;
}();

AuthoringToolController.$inject = ['$mdDialog', '$scope', '$translate', 'ConfigService', 'SessionService'];

exports.default = AuthoringToolController;
//# sourceMappingURL=authoringToolController.js.map