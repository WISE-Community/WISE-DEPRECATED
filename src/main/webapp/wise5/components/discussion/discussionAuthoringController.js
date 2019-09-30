'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _discussionController = require('./discussionController');

var _discussionController2 = _interopRequireDefault(_discussionController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DiscussionAuthoringController = function (_DiscussionController) {
  _inherits(DiscussionAuthoringController, _DiscussionController);

  function DiscussionAuthoringController($filter, $mdDialog, $q, $rootScope, $scope, AnnotationService, ConfigService, DiscussionService, NodeService, NotebookService, NotificationService, ProjectService, StudentAssetService, StudentDataService, StudentWebSocketService, UtilService, $mdMedia) {
    _classCallCheck(this, DiscussionAuthoringController);

    var _this = _possibleConstructorReturn(this, (DiscussionAuthoringController.__proto__ || Object.getPrototypeOf(DiscussionAuthoringController)).call(this, $filter, $mdDialog, $q, $rootScope, $scope, AnnotationService, ConfigService, DiscussionService, NodeService, NotebookService, NotificationService, ProjectService, StudentAssetService, StudentDataService, StudentWebSocketService, UtilService, $mdMedia));

    _this.allowedConnectedComponentTypes = [{ type: 'Discussion' }];
    return _this;
  }

  _createClass(DiscussionAuthoringController, [{
    key: 'authoringConnectedComponentTypeChanged',
    value: function authoringConnectedComponentTypeChanged(connectedComponent) {
      var component = this.ProjectService.getComponentByNodeIdAndComponentId(connectedComponent.nodeId, connectedComponent.componentId);
      this.changeAllDiscussionConnectedComponentTypesToMatch(connectedComponent.type);
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'changeAllDiscussionConnectedComponentTypesToMatch',
    value: function changeAllDiscussionConnectedComponentTypesToMatch(connectedComponentType) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.authoringComponentContent.connectedComponents[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var connectedComponent = _step.value;

          var component = this.ProjectService.getComponentByNodeIdAndComponentId(connectedComponent.nodeId, connectedComponent.componentId);
          connectedComponent.type = connectedComponentType;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: 'authoringAutomaticallySetConnectedComponentTypeIfPossible',
    value: function authoringAutomaticallySetConnectedComponentTypeIfPossible(connectedComponent) {
      if (connectedComponent.componentId != null) {
        var firstConnectedComponent = this.authoringComponentContent.connectedComponents[0];
        connectedComponent.type = firstConnectedComponent.type;
      }
    }
  }]);

  return DiscussionAuthoringController;
}(_discussionController2.default);

DiscussionAuthoringController.$inject = ['$filter', '$mdDialog', '$q', '$rootScope', '$scope', 'AnnotationService', 'ConfigService', 'DiscussionService', 'NodeService', 'NotebookService', 'NotificationService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'StudentWebSocketService', 'UtilService', '$mdMedia'];

exports.default = DiscussionAuthoringController;
//# sourceMappingURL=discussionAuthoringController.js.map
