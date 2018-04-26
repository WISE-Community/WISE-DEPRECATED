'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _projectService = require('../services/projectService');

var _projectService2 = _interopRequireDefault(_projectService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ClassroomMonitorProjectService = function (_ProjectService) {
  _inherits(ClassroomMonitorProjectService, _ProjectService);

  function ClassroomMonitorProjectService($filter, $http, $injector, $q, $rootScope, ConfigService, UtilService) {
    _classCallCheck(this, ClassroomMonitorProjectService);

    return _possibleConstructorReturn(this, (ClassroomMonitorProjectService.__proto__ || Object.getPrototypeOf(ClassroomMonitorProjectService)).call(this, $filter, $http, $injector, $q, $rootScope, ConfigService, UtilService));
  }

  /**
   * Get the node ids and component ids in a node
   * @param nodeId get the node ids and component ids in this node
   * @returns an array of objects. the objects contain a node id
   * and component id.
   */


  _createClass(ClassroomMonitorProjectService, [{
    key: 'getNodeIdsAndComponentIds',
    value: function getNodeIdsAndComponentIds(nodeId) {
      var nodeIdAndComponentIds = [];
      if (nodeId != null) {
        var nodeContent = this.getNodeContentByNodeId(nodeId);
        if (nodeContent != null) {
          var components = nodeContent.components;
          if (components != null) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              for (var _iterator = components[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var component = _step.value;

                if (component != null) {
                  var componentId = component.id;
                  var nodeIdAndComponentId = {};
                  nodeIdAndComponentId.nodeId = nodeId;
                  nodeIdAndComponentId.componentId = componentId;
                  nodeIdAndComponentIds.push(nodeIdAndComponentId);
                }
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
        }
      }
      return nodeIdAndComponentIds;
    }

    /**
     * Get the show previous work node ids and component ids in a node
     * @param nodeId get the show previous work node ids and component ids in
     * this node
     * @returns an array of objects. the objects contain a node id
     * and component id.
     */

  }, {
    key: 'getShowPreviousWorkNodeIdsAndComponentIds',
    value: function getShowPreviousWorkNodeIdsAndComponentIds(nodeId) {
      var nodeIdAndComponentIds = [];
      if (nodeId != null) {
        var nodeContent = this.getNodeContentByNodeId(nodeId);
        if (nodeContent != null) {
          var components = nodeContent.components;
          if (components != null) {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = components[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var component = _step2.value;

                if (component != null) {
                  var showPreviousWorkNodeId = component.showPreviousWorkNodeId;
                  var showPreviousWorkComponentId = component.showPreviousWorkComponentId;
                  if (showPreviousWorkNodeId != null && showPreviousWorkComponentId != null) {
                    var nodeIdAndComponentId = {};
                    nodeIdAndComponentId.nodeId = showPreviousWorkNodeId;
                    nodeIdAndComponentId.componentId = showPreviousWorkComponentId;
                    nodeIdAndComponentIds.push(nodeIdAndComponentId);
                  }
                }
              }
            } catch (err) {
              _didIteratorError2 = true;
              _iteratorError2 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }
              } finally {
                if (_didIteratorError2) {
                  throw _iteratorError2;
                }
              }
            }
          }
        }
      }
      return nodeIdAndComponentIds;
    }

    /**
     * Get the branch letter in the node position string if the node is in a
     * branch path
     * @param nodeId the node id we want the branch letter for
     * @return the branch letter in the node position if the node is in a branch
     * path
     */

  }, {
    key: 'getBranchLetter',
    value: function getBranchLetter(nodeId) {
      if (nodeId != null) {
        // get the node position e.g. "1.8" or "1.9 A"
        var nodePosition = this.getNodePositionById(nodeId);

        if (nodePosition != null) {
          // regex for extracting the branch letter
          var branchLetterRegex = /.*([A-Z])/;

          // run the regex on the node position string
          var match = branchLetterRegex.exec(nodePosition);

          if (match != null) {
            /*
             * the node position has a branch letter so we will get it
             * from the matched group
             */
            return match[1];
          }
        }
      }
      return null;
    }
  }]);

  return ClassroomMonitorProjectService;
}(_projectService2.default);

ClassroomMonitorProjectService.$inject = ['$filter', '$http', '$injector', '$q', '$rootScope', 'ConfigService', 'UtilService'];

exports.default = ClassroomMonitorProjectService;
//# sourceMappingURL=classroomMonitorProjectService.js.map
