'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nodeService = require('../../services/nodeService');

var _nodeService2 = _interopRequireDefault(_nodeService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LabelService = function (_NodeService) {
  _inherits(LabelService, _NodeService);

  function LabelService($filter, $q, StudentAssetService, StudentDataService, UtilService) {
    _classCallCheck(this, LabelService);

    var _this = _possibleConstructorReturn(this, (LabelService.__proto__ || Object.getPrototypeOf(LabelService)).call(this));

    _this.$filter = $filter;
    _this.$q = $q;
    _this.StudentAssetService = StudentAssetService;
    _this.StudentDataService = StudentDataService;
    _this.UtilService = UtilService;
    _this.$translate = _this.$filter('translate');
    return _this;
  }

  /**
   * Get the component type label
   * example
   * "Label"
   */


  _createClass(LabelService, [{
    key: 'getComponentTypeLabel',
    value: function getComponentTypeLabel() {
      return this.$translate('label.componentTypeLabel');
    }

    /**
     * Create a Label component object
     * @returns a new Label component object
     */

  }, {
    key: 'createComponent',
    value: function createComponent() {
      var component = {};
      component.id = this.UtilService.generateKey();
      component.type = 'Label';
      component.prompt = '';
      component.showSaveButton = false;
      component.showSubmitButton = false;
      component.backgroundImage = '';
      component.canCreateLabels = true;
      component.canEditLabels = true;
      component.canDeleteLabels = true;
      component.enableCircles = true;
      component.width = 800;
      component.height = 600;
      component.pointSize = 5;
      component.fontSize = 20;
      component.labelWidth = 20;
      component.labels = [];
      return component;
    }

    /**
     * Copies an existing Label component object
     * @returns a copied Label component object
     */

  }, {
    key: 'copyComponent',
    value: function copyComponent(componentToCopy) {
      var component = this.createComponent();
      component.prompt = componentToCopy.prompt;
      component.showSaveButton = componentToCopy.showSaveButton;
      component.showSubmitButton = componentToCopy.showSubmitButton;
      component.backgroundImage = componentToCopy.backgroundImage;
      component.canCreateLabels = componentToCopy.canCreateLabels;
      component.canEditLabels = componentToCopy.canEditLabels;
      component.canDeleteLabels = componentToCopy.canDeleteLabels;
      component.enableCircles = componentToCopy.enableCircles;
      component.width = componentToCopy.width;
      component.height = componentToCopy.height;
      component.pointSize = componentToCopy.pointSize;
      component.fontSize = componentToCopy.fontSize;
      component.labelWidth = componentToCopy.labelWidth;
      component.labels = [];
      // go through the original labels and create new id's
      if (componentToCopy.labels != null && componentToCopy.labels.length > 0) {
        for (var l = 0; l < componentToCopy.labels.length; l++) {
          var label = componentToCopy.labels[l];
          label.id = this.UtilService.generateKey(); // generate a new id for this label.
          component.labels.push(label);
        }
      }
      return component;
    }

    /**
     * Populate a component state with the data from another component state
     * @param componentStateFromOtherComponent the component state to obtain the data from
     * @return a new component state that contains the student data from the other
     * component state
     */

  }, {
    key: 'populateComponentState',
    value: function populateComponentState(componentStateFromOtherComponent) {
      var componentState = null;

      if (componentStateFromOtherComponent != null) {

        // create an empty component state
        componentState = this.StudentDataService.createComponentState();

        // get the component type of the other component state
        var otherComponentType = componentStateFromOtherComponent.componentType;

        if (otherComponentType === 'Label') {
          // the other component is an Label component

          // get the student data from the other component state
          var studentData = componentStateFromOtherComponent.studentData;

          // create a copy of the student data
          var studentDataCopy = this.UtilService.makeCopyOfJSONObject(studentData);

          // set the student data into the new component state
          componentState.studentData = studentDataCopy;
        }
      }

      return componentState;
    }
  }, {
    key: 'isCompleted',


    /**
     * Check if the component was completed
     * @param component the component object
     * @param componentStates the component states for the specific component
     * @param componentEvents the events for the specific component
     * @param nodeEvents the events for the parent node of the component
     * @param node parent node of the component
     * @returns whether the component was completed
     */
    value: function isCompleted(component, componentStates, componentEvents, nodeEvents, node) {
      var result = false;
      if (!this.canEdit(component) && this.UtilService.hasNodeEnteredEvent(nodeEvents)) {
        /*
         * the student can't perform any work on this component and has visited
         * this step so we will mark it as completed
         */
        return true;
      }
      if (componentStates && componentStates.length) {
        var submitRequired = node.showSubmitButton || component.showSubmitButton && !node.showSaveButton;

        if (submitRequired) {
          // completion requires a submission, so check for isSubmit in any component states
          for (var i = 0, l = componentStates.length; i < l; i++) {
            var state = componentStates[i];
            if (state.isSubmit && state.studentData) {
              // component state is a submission
              if (state.studentData.labels && state.studentData.labels.length) {
                // there are labels so the component is completed
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

          if (studentData != null) {
            if (studentData.labels && studentData.labels.length) {
              // there are labels so the component is completed
              result = true;
            }
          }
        }
      }

      return result;
    }
  }, {
    key: 'canEdit',


    /**
     * Determine if the student can perform any work on this component.
     * @param component The component content.
     * @return Whether the student can perform any work on this component.
     */
    value: function canEdit(component) {
      if (this.UtilService.hasShowWorkConnectedComponent(component)) {
        return false;
      }
      return true;
    }

    /**
     * Whether this component generates student work
     * @param component (optional) the component object. if the component object
     * is not provided, we will use the default value of whether the
     * component type usually has work.
     * @return whether this component generates student work
     */

  }, {
    key: 'componentHasWork',
    value: function componentHasWork(component) {
      return true;
    }

    /**
     * Whether this component uses a save button
     * @return whether this component uses a save button
     */

  }, {
    key: 'componentUsesSaveButton',
    value: function componentUsesSaveButton() {
      return true;
    }

    /**
     * Whether this component uses a submit button
     * @return whether this component uses a submit button
     */

  }, {
    key: 'componentUsesSubmitButton',
    value: function componentUsesSubmitButton() {
      return true;
    }

    /**
     * Check if the component state has student work. Sometimes a component
     * state may be created if the student visits a component but doesn't
     * actually perform any work. This is where we will check if the student
     * actually performed any work.
     * @param componentState the component state object
     * @param componentContent the component content
     * @return whether the component state has any work
     */

  }, {
    key: 'componentStateHasStudentWork',
    value: function componentStateHasStudentWork(componentState, componentContent) {
      if (componentState != null) {
        var studentData = componentState.studentData;
        if (studentData != null) {
          // get the labels from the student data
          var labels = studentData.labels;

          if (componentContent == null) {
            // the component content was not provided
            if (labels != null && labels.length > 0) {
              // the student has work
              return true;
            }
          } else {
            // the component content was provided
            var starterLabels = componentContent.labels;
            if (starterLabels == null || starterLabels.length == 0) {
              // there are no starter labels
              if (labels != null && labels.length > 0) {
                // the student has work
                return true;
              }
            } else {
              /*
               * there are starter labels so we will compare it
               * with the student labels
               */
              if (!this.labelArraysAreTheSame(labels, starterLabels)) {
                /*
                 * the student has a response that is different than
                 * the starter sentence
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
     * Check if the component state has the exact same labels as the starter
     * labels.
     * @param componentState the component state object
     * @param componentContent the component content
     * @return whether the component state has the exact same labels as the
     * starter labels
     */

  }, {
    key: 'componentStateIsSameAsStarter',
    value: function componentStateIsSameAsStarter(componentState, componentContent) {
      if (componentState != null) {
        var studentData = componentState.studentData;

        // get the labels from the student data
        var labels = studentData.labels;
        var starterLabels = componentContent.labels;
        if (starterLabels == null || starterLabels.length == 0) {
          // there are no starter labels
          if (labels.length == 0) {
            // the student work doesn't have any labels either
            return true;
          } else if (labels != null && labels.length > 0) {
            // the student has labels
            return false;
          }
        } else {
          // there are starter labels so we will compare it with the student labels
          if (this.labelArraysAreTheSame(labels, starterLabels)) {
            // the student labels are the same as the starter labels
            return true;
          }
        }
      }

      return false;
    }

    /**
     * Check if the two arrays of labels contain the same values
     * @param labels1 an array of label objects
     * @param labels2 an array of label objects
     * @return whether the labels contain the same values
     */

  }, {
    key: 'labelArraysAreTheSame',
    value: function labelArraysAreTheSame(labels1, labels2) {
      if (labels1 == null && labels2 == null) {
        return true;
      } else if (labels1 == null && labels2 != null || labels1 != null && labels2 == null) {
        return false;
      } else {
        if (labels1.length != labels2.length) {
          return false;
        } else {
          for (var l = 0; l < labels1.length; l++) {
            var label1 = labels1[l];
            var label2 = labels2[l];
            if (!this.labelsAreTheSame(label1, label2)) {
              return false;
            }
          }
        }
      }

      return true;
    }

    /**
     * Check if two labels contain the same values
     * @param label1 a label object
     * @param label2 a label object
     * @return whether the labels contain the same values
     */

  }, {
    key: 'labelsAreTheSame',
    value: function labelsAreTheSame(label1, label2) {
      if (label1 == null && label2 == null) {
        return true;
      } else if (label1 == null && label2 != null || label1 != null && label2 == null) {
        return false;
      } else {
        if (label1.text != label2.text || label1.pointX != label2.pointX || label1.pointY != label2.pointY || label1.textX != label2.textX || label1.textY != label2.textY || label1.color != label2.color) {
          // at least one of the fields are different
          return false;
        }
      }

      return true;
    }

    /**
     * Create an image from the text string.
     * @param text A text string.
     * @param width The width of the image we will create.
     * @param height The height of the image we will create.
     * @param maxCharactersPerLine The max number of characters per line.
     * @param xPositionOfText The x position of the text in the image.
     * @param spaceInbetweenLines The amount of space inbetween each line.
     * @param fontSize The font size.
     */

  }, {
    key: 'createImageFromText',
    value: function createImageFromText(text, width, height, maxCharactersPerLine, xPositionOfText, spaceInbetweenLines, fontSize) {
      var _this2 = this;

      if (width == null || width == '') {
        width = 800;
      }

      if (height == null || height == '') {
        height = 600;
      }

      if (maxCharactersPerLine == null || maxCharactersPerLine == '') {
        maxCharactersPerLine = 100;
      }

      if (xPositionOfText == null || xPositionOfText == '') {
        xPositionOfText = 10;
      }

      if (spaceInbetweenLines == null || spaceInbetweenLines == '') {
        spaceInbetweenLines = 40;
      }

      if (fontSize == null || fontSize == '') {
        fontSize = 16;
      }

      /*
       * Line wrap the text so that each line does not exceed the max number of
       * characters.
       */
      var textWrapped = this.UtilService.wordWrap(text, maxCharactersPerLine);

      // create a promise that will return an image of the concept map
      var deferred = this.$q.defer();

      // create a div to draw the SVG in
      var svgElement = document.createElement('div');

      var draw = SVG(svgElement);
      draw.width(width);
      draw.height(height);

      /*
       * We will create a tspan for each line.
       * Example
       * <tspan x="10" dy="40">The quick brown fox jumps over the lazy dog. One fish, two fish, red fish, blue fish. Green eggs</tspan>
       * <tspan x="10" dy="40">and ham.</tspan>
       */
      var tspans = '';
      var textLines = textWrapped.split('\n');
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = textLines[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var textLine = _step.value;

          tspans += '<tspan x="' + xPositionOfText + '" dy="' + spaceInbetweenLines + '">' + textLine + '</tspan>';
        }

        /*
         * Wrap the tspans in a text element.
         * Example
         * <text id="SvgjsText1008" font-family="Helvetica, Arial, sans-serif" font-size="16">
         *   <tspan x="10" dy="40">The quick brown fox jumps over the lazy dog. One fish, two fish, red fish, blue fish. Green eggs</tspan>
         *   <tspan x="10" dy="40">and ham.</tspan>
         * </text>
         */
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

      var svgTextElementString = '<text id="SvgjsText1008" font-family="Helvetica, Arial, sans-serif" font-size="' + fontSize + '">' + tspans + '</text>';

      /*
       * Insert the text element into the svg.
       * Example
       * <svg id="SvgjsSvg1010" width="800" height="600" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs">
       *   <defs id="SvgjsDefs1011"></defs>
       *   <text id="SvgjsText1008" font-family="Helvetica, Arial, sans-serif" font-size="16">
       *     <tspan x="10" dy="40">The quick brown fox jumps over the lazy dog. One fish, two fish, red fish, blue fish. Green eggs</tspan>
       *     <tspan x="10" dy="40">and ham.</tspan>
       *   </text>
       * </svg>
       */
      var svgString = svgElement.innerHTML;
      svgString = svgString.replace('</svg>', svgTextElementString + '</svg>');

      // create a canvas to draw the image on
      var myCanvas = document.createElement('canvas');
      var ctx = myCanvas.getContext('2d');

      // create an svg blob
      var svg = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      var domURL = self.URL || self.webkitURL || self;
      var url = domURL.createObjectURL(svg);
      var image = new Image();

      /*
       * set the UtilService in a local variable so we can access it
       * in the onload callback function
       */
      var thisUtilService = this.UtilService;

      // the function that is called after the image is fully loaded
      image.onload = function (event) {

        // get the image that was loaded
        var image = event.target;

        // set the dimensions of the canvas
        myCanvas.width = image.width;
        myCanvas.height = image.height;
        ctx.drawImage(image, 0, 0);

        // get the canvas as a Base64 string
        var base64Image = myCanvas.toDataURL('image/png');

        // get the image object
        var imageObject = thisUtilService.getImageObjectFromBase64String(base64Image);

        // create a student asset image
        _this2.StudentAssetService.uploadAsset(imageObject).then(function (unreferencedAsset) {

          /*
           * make a copy of the unreferenced asset so that we
           * get a referenced asset
           */
          _this2.StudentAssetService.copyAssetForReference(unreferencedAsset).then(function (referencedAsset) {
            if (referencedAsset != null) {
              /*
               * get the asset url
               * for example
               * /wise/studentuploads/11261/297478/referenced/picture_1494016652542.png
               * if we are in preview mode this url will be a base64 string instead
               */
              var referencedAssetUrl = referencedAsset.url;

              // remove the unreferenced asset
              _this2.StudentAssetService.deleteAsset(unreferencedAsset);

              // resolve the promise with the image url
              deferred.resolve(referencedAssetUrl);
            }
          });
        });
      };

      // set the src of the image so that the image gets loaded
      image.src = url;

      return deferred.promise;
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
      var canvas = angular.element('#canvas_' + componentState.nodeId + '_' + componentState.componentId);
      if (canvas != null && canvas.length > 0) {
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

  return LabelService;
}(_nodeService2.default);

LabelService.$inject = ['$filter', '$q', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = LabelService;
//# sourceMappingURL=labelService.js.map
