'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ClassResponseController = function () {
  function ClassResponseController($scope, $element, $filter, StudentStatusService, ConfigService) {
    var _this = this;

    _classCallCheck(this, ClassResponseController);

    this.$scope = $scope;
    this.$element = $element;
    this.$filter = $filter;
    this.StudentStatusService = StudentStatusService;
    this.ConfigService = ConfigService;

    this.$translate = this.$filter('translate');

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
      return this.ConfigService.getAvatarColorForWorkgroupId(workgroupId);
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

    /**
     * The delete button was clicked on a student post
     * @param componentState the student component state
     */

  }, {
    key: 'deleteButtonClicked',
    value: function deleteButtonClicked(componentState) {

      var answer = confirm(this.$translate("discussion.areYouSureYouWantToDeleteThisPost"));

      if (answer) {
        // the teacher has answered yes to delete

        // tell the discussionController to delete the post
        this.deletebuttonclicked({ componentState: componentState });
      }
    }

    /**
     * The undo delete button was clicked on a student post
     * @param componentState the student component state
     */

  }, {
    key: 'undoDeleteButtonClicked',
    value: function undoDeleteButtonClicked(componentState) {

      var answer = confirm(this.$translate("discussion.areYouSureYouWantToShowThisPost"));

      if (answer) {
        // the teacher has answered yes to undo the delete

        // tell the discussionController to undo the delete of the post
        this.undodeletebuttonclicked({ componentState: componentState });
      }
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

ClassResponseController.$inject = ['$scope', '$element', '$filter', 'StudentStatusService', 'ConfigService'];

var ClassResponseComponentOptions = {
  bindings: {
    response: '=',
    mode: '=',
    deletebuttonclicked: '&',
    undodeletebuttonclicked: '&',
    submitbuttonclicked: '&',
    studentdatachanged: '&'
  },
  templateUrl: 'wise5/components/discussion/classResponse.html',
  controller: 'ClassResponseController as classResponseCtrl'
};

exports.ClassResponseController = ClassResponseController;
exports.ClassResponseComponentOptions = ClassResponseComponentOptions;
//# sourceMappingURL=classResponse.js.map
