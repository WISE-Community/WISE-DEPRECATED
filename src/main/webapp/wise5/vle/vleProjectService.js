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

var VLEProjectService = function (_ProjectService) {
  _inherits(VLEProjectService, _ProjectService);

  function VLEProjectService($filter, $http, $injector, $q, $rootScope, ConfigService, UtilService) {
    _classCallCheck(this, VLEProjectService);

    return _possibleConstructorReturn(this, (VLEProjectService.__proto__ || Object.getPrototypeOf(VLEProjectService)).call(this, $filter, $http, $injector, $q, $rootScope, ConfigService, UtilService));
  }

  /**
   * Check if a component is a connected component
   * @param nodeId the node id of the component
   * @param componentId the component that is listening for connected changes
   * @param connectedComponentId the component that is broadcasting connected changes
   * @returns whether the componentId is connected to the connectedComponentId
   */


  _createClass(VLEProjectService, [{
    key: 'isConnectedComponent',
    value: function isConnectedComponent(nodeId, componentId, connectedComponentId) {
      var component = this.getComponentByNodeIdAndComponentId(nodeId, componentId);
      if (component != null) {
        var connectedComponents = component.connectedComponents;
        if (connectedComponents != null) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = connectedComponents[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var connectedComponent = _step.value;

              if (connectedComponent != null) {
                /*
                 * check if the connected component id matches the one
                 * we are looking for. connectedComponent.id is the old
                 * field we used to store the component id in so we will
                 * look for that field for the sake of backwards
                 * compatibility. connectedComponent.componentId is the
                 * new field we store the component id in.
                 */
                if (connectedComponentId === connectedComponent.id || connectedComponentId === connectedComponent.componentId) {
                  return true;
                }
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
      return false;
    }

    /**
     * Get a connected component params
     * @param componentId the connected component id
     * @returns the params for the connected component
     */

  }, {
    key: 'getConnectedComponentParams',
    value: function getConnectedComponentParams(componentContent, componentId) {
      var connectedComponentParams = null;
      if (componentContent != null && componentId != null) {
        var connectedComponents = componentContent.connectedComponents;
        if (connectedComponents != null) {
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = connectedComponents[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var connectedComponent = _step2.value;

              if (connectedComponent != null) {
                /*
                 * check if the connected component id matches the one
                 * we are looking for. connectedComponent.id is the old
                 * field we used to store the component id in so we will
                 * look for that field for the sake of backwards
                 * compatibility. connectedComponent.componentId is the
                 * new field we store the component id in.
                 */
                if (componentId === connectedComponent.id || componentId === connectedComponent.componentId) {
                  connectedComponentParams = connectedComponent;
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
      return connectedComponentParams;
    }

    /**
     * Check if we need to display the annotation to the student
     * @param annotation the annotation
     * @returns {boolean} whether we need to display the annotation to the student
     */

  }, {
    key: 'displayAnnotation',
    value: function displayAnnotation(annotation) {
      var component = this.getComponentByNodeIdAndComponentId(annotation.nodeId, annotation.componentId);
      if (component != null) {
        var componentService = this.$injector.get(component.type + 'Service');
        return componentService.displayAnnotation(component, annotation);
      }
      return true;
    }

    /**
     * Get the global annotation properties for the specified component and score, if exists.
     * @param component the component content
     * @param previousScore the previousScore we want the annotation properties for, can be null, which means we just want to look at
     * the currentScore
     * @param currentScore the currentScore we want the annotation properties for
     * @returns the annotation properties for the given score
     */

  }, {
    key: 'getGlobalAnnotationGroupByScore',
    value: function getGlobalAnnotationGroupByScore(component, previousScore, currentScore) {
      var annotationGroup = null;
      if (component.globalAnnotationSettings != null && component.globalAnnotationSettings.globalAnnotationGroups != null) {
        var globalAnnotationGroups = component.globalAnnotationSettings.globalAnnotationGroups;
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = globalAnnotationGroups[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var globalAnnotationGroup = _step3.value;

            if (globalAnnotationGroup.enableCriteria != null && globalAnnotationGroup.enableCriteria.scoreSequence != null) {
              var scoreSequence = globalAnnotationGroup.enableCriteria.scoreSequence;
              if (scoreSequence != null) {
                /*
                 * get the expected previous score and current score
                 * that will satisfy the rule
                 */
                var previousScoreMatch = scoreSequence[0];
                var currentScoreMatch = scoreSequence[1];

                if (previousScore == null) {
                  // just matching on the current score
                  if (previousScoreMatch == "" && currentScore.toString().match("[" + currentScoreMatch + "]")) {
                    // found a match
                    annotationGroup = globalAnnotationGroup;
                    break;
                  }
                } else {
                  if (previousScore.toString().match("[" + previousScoreMatch + "]") && currentScore.toString().match("[" + currentScoreMatch + "]")) {
                    /*
                     * the previous score and current score match the
                     * expected scores so we have found the rule we want
                     */
                    annotationGroup = globalAnnotationGroup;
                    break;
                  }
                }
              }
            }
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
      }
      return annotationGroup;
    }

    /**
     * Get the notification for the given score, if exists.
     * @param component the component content
     * @param previousScore the previousScore we want notification for, can be null, which means we just want to look at
     * the currentScore
     * @param currentScore the currentScore we want notification for
     * @returns the notification for the given score
     */

  }, {
    key: 'getNotificationByScore',
    value: function getNotificationByScore(component, previousScore, currentScore) {
      var notificationResult = null;
      if (component.notificationSettings != null && component.notificationSettings.notifications != null) {
        var notifications = component.notificationSettings.notifications;
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = notifications[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var notification = _step4.value;

            if (notification.enableCriteria != null && notification.enableCriteria.scoreSequence != null) {
              var scoreSequence = notification.enableCriteria.scoreSequence;
              if (scoreSequence != null) {
                /*
                 * get the expected previous score and current score
                 * that will satisfy the rule
                 */
                var previousScoreMatch = scoreSequence[0];
                var currentScoreMatch = scoreSequence[1];

                if (previousScore == null) {
                  // just matching on the current score
                  if (previousScoreMatch == "" && currentScore.toString().match("[" + currentScoreMatch + "]")) {
                    notificationResult = notification;
                    break;
                  }
                } else {
                  if (previousScore.toString().match("[" + previousScoreMatch + "]") && currentScore.toString().match("[" + currentScoreMatch + "]")) {
                    /*
                     * the previous score and current score match the
                     * expected scores so we have found the rule we want
                     */
                    notificationResult = notification;
                    break;
                  }
                }
              }
            }
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }
      }
      return notificationResult;
    }

    /**
     * Retrieve the script with the provided script filename
     * @param scriptFilename
     */

  }, {
    key: 'retrieveScript',
    value: function retrieveScript(scriptFilename) {
      var assetDirectoryPath = this.ConfigService.getProjectAssetsDirectoryPath();
      var scriptPath = assetDirectoryPath + "/" + scriptFilename;
      return this.$http.get(scriptPath).then(function (result) {
        return result.data;
      });
    }
  }, {
    key: 'addAdditionalProcessingFunction',


    /**
     * Registers an additionalProcessingFunction for the specified node and component
     * @param nodeId the node id
     * @param componentId the component id
     * @param additionalProcessingFunction the function to register for the node and component.
     */
    value: function addAdditionalProcessingFunction(nodeId, componentId, additionalProcessingFunction) {
      var key = nodeId + "_" + componentId;
      if (this.additionalProcessingFunctionsMap[key] == null) {
        this.additionalProcessingFunctionsMap[key] = [];
      }
      this.additionalProcessingFunctionsMap[key].push(additionalProcessingFunction);
    }
  }]);

  return VLEProjectService;
}(_projectService2.default);

VLEProjectService.$inject = ['$filter', '$http', '$injector', '$q', '$rootScope', 'ConfigService', 'UtilService'];

exports.default = VLEProjectService;
//# sourceMappingURL=vleProjectService.js.map
