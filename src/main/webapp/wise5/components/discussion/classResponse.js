'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ClassResponseComponentOptions = exports.ClassResponseController = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ClassResponseController =
/*#__PURE__*/
function () {
  function ClassResponseController($scope, $element, $filter, StudentStatusService, ConfigService) {
    var _this = this;

    _classCallCheck(this, ClassResponseController);

    this.$scope = $scope;
    this.$element = $element;
    this.$filter = $filter;
    this.StudentStatusService = StudentStatusService;
    this.ConfigService = ConfigService;
    this.$translate = this.$filter('translate');
    this.urlMatcher = /((http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?)/g;
    this.$scope.$watch(function () {
      return _this.response.replies.length;
    }, function (newValue, oldValue) {
      if (newValue !== oldValue) {
        _this.injectLinksIntoReplies();

        _this.toggleExpanded(true);
      }
    });
    this.injectLinksIntoResponse();
    this.injectLinksIntoReplies();
  }

  _createClass(ClassResponseController, [{
    key: "injectLinksIntoResponse",
    value: function injectLinksIntoResponse() {
      this.response.studentData.responseText = this.injectLinks(this.response.studentData.response);
    }
  }, {
    key: "injectLinksIntoReplies",
    value: function injectLinksIntoReplies() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.response.replies[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var reply = _step.value;

          if (reply.studentData.responseText == null) {
            reply.studentData.responseText = this.injectLinks(reply.studentData.response);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: "injectLinks",
    value: function injectLinks(response) {
      return response.replace(this.urlMatcher, function (match) {
        var matchUrl = match;

        if (!match.startsWith('http')) {
          /*
           * The url does not begin with http so we will add // to the beginning of it so that the
           * browser treats the url as an absolute link and not a relative link. The browser will also
           * use the same protocol that the current page is loaded with (http or https).
           */
          matchUrl = '//' + match;
        }

        return "<a href=\"".concat(matchUrl, "\" target=\"_blank\">").concat(match, "</a>");
      });
    }
  }, {
    key: "getAvatarColorForWorkgroupId",
    value: function getAvatarColorForWorkgroupId(workgroupId) {
      return this.ConfigService.getAvatarColorForWorkgroupId(workgroupId);
    }
  }, {
    key: "replyEntered",
    value: function replyEntered($event, response) {
      if ($event.keyCode === 13) {
        if (response.replyText) {
          this.submitButtonClicked(response);
        }
      }
    }
  }, {
    key: "submitButtonClicked",
    value: function submitButtonClicked(response) {
      // call the callback function in discussionController
      this.submitbuttonclicked({
        r: response
      });
    }
    /**
     * The delete button was clicked on a student post
     * @param componentState the student component state
     */

  }, {
    key: "deleteButtonClicked",
    value: function deleteButtonClicked(componentState) {
      var answer = confirm(this.$translate("discussion.areYouSureYouWantToDeleteThisPost"));

      if (answer) {
        // the teacher has answered yes to delete
        // tell the discussionController to delete the post
        this.deletebuttonclicked({
          componentState: componentState
        });
      }
    }
    /**
     * The undo delete button was clicked on a student post
     * @param componentState the student component state
     */

  }, {
    key: "undoDeleteButtonClicked",
    value: function undoDeleteButtonClicked(componentState) {
      var answer = confirm(this.$translate("discussion.areYouSureYouWantToShowThisPost"));

      if (answer) {
        // the teacher has answered yes to undo the delete
        // tell the discussionController to undo the delete of the post
        this.undodeletebuttonclicked({
          componentState: componentState
        });
      }
    }
  }, {
    key: "toggleExpanded",
    value: function toggleExpanded(open) {
      if (open) {
        this.expanded = true;
      } else {
        this.expanded = !this.expanded;
      }

      if (this.expanded) {
        var $clist = $(this.element).find('.discussion-comments__list');
        setTimeout(function () {
          $clist.animate({
            scrollTop: $clist.height()
          }, 250);
        }, 250);
      }
    }
  }, {
    key: "adjustClientSaveTime",
    value: function adjustClientSaveTime(time) {
      return this.ConfigService.convertToClientTimestamp(time);
    }
  }]);

  return ClassResponseController;
}();

exports.ClassResponseController = ClassResponseController;
ClassResponseController.$inject = ['$scope', '$element', '$filter', 'StudentStatusService', 'ConfigService'];
var ClassResponseComponentOptions = {
  bindings: {
    response: '=',
    mode: '=',
    deletebuttonclicked: '&',
    undodeletebuttonclicked: '&',
    submitbuttonclicked: '&',
    studentdatachanged: '&',
    isdisabled: '='
  },
  templateUrl: 'wise5/components/discussion/classResponse.html',
  controller: 'ClassResponseController as classResponseCtrl'
};
exports.ClassResponseComponentOptions = ClassResponseComponentOptions;
//# sourceMappingURL=classResponse.js.map
