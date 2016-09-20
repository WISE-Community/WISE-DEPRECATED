'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ClassResponseController = function () {
    function ClassResponseController($scope, $element, StudentStatusService, ConfigService) {
        var _this = this;

        _classCallCheck(this, ClassResponseController);

        this.$scope = $scope;
        this.$element = $element;
        this.StudentStatusService = StudentStatusService;
        this.ConfigService = ConfigService;

        this.$scope.$watch(function () {
            return _this.response.replies.length;
        }, function (oldValue, newValue) {
            if (newValue !== oldValue) {
                _this.toggleExpanded(true);
                _this.response.replyText = '';
            }
        });
    }

    _createClass(ClassResponseController, [{
        key: 'getAvatarColorForWorkgroupId',
        value: function getAvatarColorForWorkgroupId(workgroupId) {
            return this.StudentStatusService.getAvatarColorForWorkgroupId(workgroupId);
        }
    }, {
        key: 'replyEntered',
        value: function replyEntered($event, response) {
            if ($event.keyCode === 13) {
                if (response.replyText) {
                    this.submitButtonClicked(response);
                }
            }
        }
    }, {
        key: 'submitButtonClicked',
        value: function submitButtonClicked(response) {
            // call the callback function in discussionController
            this.submitbuttonclicked({ r: response });
        }
    }, {
        key: 'toggleExpanded',
        value: function toggleExpanded(open) {
            if (open) {
                this.expanded = true;
            } else {
                this.expanded = !this.expanded;
            }

            if (this.expanded) {
                var $clist = $(this.element).find('.discussion-comments__list');
                setTimeout(function () {
                    $clist.animate({ scrollTop: $clist.height() }, 250);
                }, 250);
            }
        }
    }, {
        key: 'adjustClientSaveTime',
        value: function adjustClientSaveTime(time) {
            return this.ConfigService.convertToClientTimestamp(time);
        }
    }]);

    return ClassResponseController;
}();

ClassResponseController.$inject = ['$scope', '$element', 'StudentStatusService', 'ConfigService'];

var ClassResponseComponentOptions = {
    bindings: {
        response: '=',
        submitbuttonclicked: '&',
        studentdatachanged: '&'
    },
    templateUrl: 'wise5/components/discussion/classResponse.html',
    controller: 'ClassResponseController as classResponseCtrl'
};

exports.ClassResponseController = ClassResponseController;
exports.ClassResponseComponentOptions = ClassResponseComponentOptions;
//# sourceMappingURL=classResponse.js.map