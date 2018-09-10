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
      if (componentState != null) {
        var studentData = componentState.studentData;

        if (studentData != null && studentData.drawData != null) {
          var drawData = JSON.parse(studentData.drawData);
          if (drawData != null && drawData.jpeg != null && drawData.jpeg != '') {
            return drawData.jpeg;
          }
        }
      }
      return null;
    }
  }, {
    key: 'isCompleted',
    value: function isCompleted(component, componentStates, componentEvents, nodeEvents, node) {
      var result = false;

      if (componentStates && componentStates.length) {
        var submitRequired = node.showSubmitButton || component.showSubmitButton && !node.showSaveButton;

        if (submitRequired) {
          // completion requires a submission, so check for isSubmit in any component states
          for (var i = 0, l = componentStates.length; i < l; i++) {
            var state = componentStates[i];
            if (state.isSubmit && state.studentData) {
              // component state is a submission
              if (state.studentData.drawData) {
                // there is draw data so the component is completed
                // TODO: check for empty drawing or drawing same as initial state
                result = true;
                break;
              }
            }
          }
        } else {
          // get the last component state
          var _l = componentStates.length - 1;
          var componentState = componentStates[_l];

          var studentData = componentState.studentData;

          if (studentData) {
            if (studentData.drawData) {
              // there is draw data so the component is completed
              // TODO: check for empty drawing or drawing same as initial state
              result = true;
            }
          }
        }
      }

      return result;
    }
  }, {
    key: 'removeBackgroundFromComponentState',


    /**
     * Remove the background object from the draw data in the component state
     * @param componentState the component state
     * @returns the componentState
     */
    value: function removeBackgroundFromComponentState(componentState) {

      if (componentState != null) {
        var studentData = componentState.studentData;

        if (studentData != null) {

          // get the draw data string
          var drawData = studentData.drawData;

          if (drawData != null) {

            // convert the draw data string to an object
            var drawDataObject = angular.fromJson(drawData);

            if (drawDataObject != null) {

              // get the canvas value
              var canvas = drawDataObject.canvas;

              if (canvas != null) {

                // remove the background image from the canvas
                delete canvas.backgroundImage;

                // convert the object back to a JSON string
                var drawDataJSONString = angular.toJson(drawDataObject);

                if (drawDataJSONString != null) {
                  // set the draw data JSON string back into the student data
                  studentData.drawData = drawDataJSONString;
                }
              }
            }
          }
        }
      };

      return componentState;
    }
  }, {
    key: 'componentStateHasStudentWork',
    value: function componentStateHasStudentWork(componentState, componentContent) {

      if (componentState != null) {

        var studentData = componentState.studentData;

        if (studentData != null) {

          // get the student draw data
          var drawData = studentData.drawData;

          // get the draw data as a JSON object
          var drawDataJSON = angular.fromJson(drawData);

          if (componentContent == null) {
            // the component content was not provided

            if (drawDataJSON != null && drawDataJSON.canvas != null && drawDataJSON.canvas.objects != null && drawDataJSON.canvas.objects.length > 0) {

              return true;
            }
          } else {
            // the component content was provided

            var starterDrawData = componentContent.starterDrawData;

            if (starterDrawData == null || starterDrawData == '') {
              // there is no starter draw data

              if (drawDataJSON != null && drawDataJSON.canvas != null && drawDataJSON.canvas.objects != null && drawDataJSON.canvas.objects.length > 0) {

                return true;
              }
            } else {
              /*
               * there is starter draw data so we will compare it with
               * the student draw data
               */

              if (drawData != null && drawData != '' && drawData !== starterDrawData) {
                /*
                 * the student draw data is different than the
                 * starter draw data
                 */
                return true;
              }
            }
          }
        }
      }

      return false;
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
        // get the top canvas
        canvas = canvas[0];

        // get the canvas as a base64 string
        var img_b64 = canvas.toDataURL('image/png');

        // get the image object
        var imageObject = this.UtilService.getImageObjectFromBase64String(img_b64);

        // add the image to the student assets
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
