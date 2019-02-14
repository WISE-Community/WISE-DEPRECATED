'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _componentService = require('../componentService');

var _componentService2 = _interopRequireDefault(_componentService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DrawService = function (_ComponentService) {
  _inherits(DrawService, _ComponentService);

  function DrawService($filter, $q, StudentAssetService, StudentDataService, UtilService) {
    _classCallCheck(this, DrawService);

    var _this = _possibleConstructorReturn(this, (DrawService.__proto__ || Object.getPrototypeOf(DrawService)).call(this, $filter, StudentDataService, UtilService));

    _this.$q = $q;
    _this.StudentAssetService = StudentAssetService;
    return _this;
  }

  _createClass(DrawService, [{
    key: 'getComponentTypeLabel',
    value: function getComponentTypeLabel() {
      return this.$translate('draw.componentTypeLabel');
    }
  }, {
    key: 'createComponent',
    value: function createComponent() {
      var component = _get(DrawService.prototype.__proto__ || Object.getPrototypeOf(DrawService.prototype), 'createComponent', this).call(this);
      component.type = 'Draw';
      component.stamps = {};
      component.stamps.Stamps = [];
      component.tools = {};
      component.tools.select = true;
      component.tools.line = true;
      component.tools.shape = true;
      component.tools.freeHand = true;
      component.tools.text = true;
      component.tools.stamp = true;
      component.tools.strokeColor = true;
      component.tools.fillColor = true;
      component.tools.clone = true;
      component.tools.strokeWidth = true;
      component.tools.sendBack = true;
      component.tools.sendForward = true;
      component.tools.undo = true;
      component.tools.redo = true;
      component.tools.delete = true;
      return component;
    }
  }, {
    key: 'getStudentWorkJPEG',
    value: function getStudentWorkJPEG(componentState) {
      var studentData = componentState.studentData;
      var drawData = JSON.parse(studentData.drawData);
      if (drawData != null && drawData.jpeg != null && drawData.jpeg != '') {
        return drawData.jpeg;
      }
      return null;
    }
  }, {
    key: 'isCompleted',
    value: function isCompleted(component, componentStates, componentEvents, nodeEvents, node) {
      if (componentStates && componentStates.length) {
        var submitRequired = node.showSubmitButton || component.showSubmitButton && !node.showSaveButton;
        if (submitRequired) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = componentStates[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var componentState = _step.value;

              if (componentState.isSubmit) {
                return true;
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
        } else {
          var _componentState = componentStates[componentStates.length - 1];
          if (_componentState.studentData.drawData) {
            // there is draw data so the component is completed
            // TODO: check for empty drawing or drawing same as initial state
            return true;
          }
        }
      }
      return false;
    }

    /**
     * Remove the background object from the draw data in the component state
     * @param componentState the component state
     * @returns the componentState
     */

  }, {
    key: 'removeBackgroundFromComponentState',
    value: function removeBackgroundFromComponentState(componentState) {
      var drawData = componentState.studentData.drawData;
      var drawDataObject = angular.fromJson(drawData);
      var canvas = drawDataObject.canvas;
      delete canvas.backgroundImage;
      var drawDataJSONString = angular.toJson(drawDataObject);
      componentState.studentData.drawData = drawDataJSONString;
      return componentState;
    }

    /**
     * @param componentState
     * @param componentContent (optional)
     */

  }, {
    key: 'componentStateHasStudentWork',
    value: function componentStateHasStudentWork(componentState, componentContent) {
      if (componentState != null) {
        var drawDataString = componentState.studentData.drawData;
        var drawData = angular.fromJson(drawDataString);
        if (componentContent == null) {
          if (this.isDrawDataContainsObjects(drawData)) {
            return true;
          }
        } else {
          if (this.isStarterDrawDataExists(componentContent)) {
            var starterDrawData = componentContent.starterDrawData;
            if (this.isStudentDrawDataDifferentFromStarterData(drawDataString, starterDrawData)) {
              return true;
            }
          } else {
            if (this.isDrawDataContainsObjects(drawData)) {
              return true;
            }
          }
        }
      }
      return false;
    }
  }, {
    key: 'isDrawDataContainsObjects',
    value: function isDrawDataContainsObjects(drawData) {
      return drawData.canvas != null && drawData.canvas.objects != null && drawData.canvas.objects.length > 0;
    }
  }, {
    key: 'isStarterDrawDataExists',
    value: function isStarterDrawDataExists(componentContent) {
      return componentContent.starterDrawData != null && componentContent.starterDrawData !== '';
    }
  }, {
    key: 'isStudentDrawDataDifferentFromStarterData',
    value: function isStudentDrawDataDifferentFromStarterData(drawDataString, starterDrawData) {
      return drawDataString != null && drawDataString !== '' && drawDataString !== starterDrawData;
    }

    /**
     * The component state has been rendered in a <component></component> element
     * and now we want to take a snapshot of the work.
     * @param componentState The component state that has been rendered.
     * @return A promise that will return an image object.
     */

  }, {
    key: 'generateImageFromRenderedComponentState',
    value: function generateImageFromRenderedComponentState(componentState) {
      var deferred = this.$q.defer();
      var canvas = angular.element('#drawingtool_' + componentState.nodeId + '_' + componentState.componentId + ' canvas');
      if (canvas != null && canvas.length > 0) {
        canvas = canvas[0];
        var canvasBase64String = canvas.toDataURL('image/png');
        var imageObject = this.UtilService.getImageObjectFromBase64String(canvasBase64String);
        this.StudentAssetService.uploadAsset(imageObject).then(function (asset) {
          deferred.resolve(asset);
        });
      }
      return deferred.promise;
    }
  }]);

  return DrawService;
}(_componentService2.default);

DrawService.$inject = ['$filter', '$q', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = DrawService;
//# sourceMappingURL=drawService.js.map
