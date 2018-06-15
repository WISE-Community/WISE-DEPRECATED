'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _componentController = require('../componentController');

var _componentController2 = _interopRequireDefault(_componentController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var HTMLController = function (_ComponentController) {
  _inherits(HTMLController, _ComponentController);

  function HTMLController($rootScope, $scope, $state, $stateParams, $sce, $filter, $mdDialog, AnnotationService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    _classCallCheck(this, HTMLController);

    var _this = _possibleConstructorReturn(this, (HTMLController.__proto__ || Object.getPrototypeOf(HTMLController)).call(this, $filter, $mdDialog, $rootScope, $scope, AnnotationService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService));

    _this.$state = $state;
    _this.$stateParams = $stateParams;
    _this.$sce = $sce;

    /*
     * get the original component content. this is used when showing
     * previous work from another component.
     */
    // TODO: remove. no longer used
    _this.originalComponentContent = _this.$scope.originalComponentContent;

    if (_this.mode === 'authoring') {} else if (_this.mode === 'grading') {} else if (_this.mode === 'student') {
      if (_this.componentContent != null) {
        _this.html = _this.componentContent.html;
      }

      if ($scope.$parent.registerComponentController != null) {
        // register this component with the parent node
        $scope.$parent.registerComponentController($scope, _this.componentContent);
      }
    }

    /*
     * Listen for the requestImage event which is fired when something needs
     * an image representation of the student data from a specific
     * component.
     */
    _this.$scope.$on('requestImage', function (event, args) {
      // get the node id and component id from the args
      var nodeId = args.nodeId;
      var componentId = args.componentId;

      // check if the image is being requested from this component
      if (_this.nodeId === nodeId && _this.componentId === componentId) {

        // obtain the image objects
        var imageObjects = _this.getImageObjects();

        if (imageObjects != null) {
          var _args = {};
          _args.nodeId = nodeId;
          _args.componentId = componentId;
          _args.imageObjects = imageObjects;

          // fire an event that contains the image objects
          _this.$scope.$emit('requestImageCallback', _args);
        }
      }
    });

    _this.$rootScope.$broadcast('doneRenderingComponent', { nodeId: _this.nodeId, componentId: _this.componentId });
    return _this;
  }

  /**
   * Get the image object representation of the student data
   * @returns an image object
   */


  _createClass(HTMLController, [{
    key: 'getImageObjects',
    value: function getImageObjects() {
      var imageObjects = [];

      // get the image elements in the scope
      var componentId = this.componentId;
      var imageElements = angular.element('#' + componentId + ' img');

      if (imageElements != null) {

        // loop through all the image elements
        for (var i = 0; i < imageElements.length; i++) {
          var imageElement = imageElements[i];

          if (imageElement != null) {

            // create an image object
            var imageObject = this.UtilService.getImageObjectFromImageElement(imageElement);
            imageObjects.push(imageObject);
          }
        }
      }

      return imageObjects;
    }
  }]);

  return HTMLController;
}(_componentController2.default);

HTMLController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', '$sce', '$filter', '$mdDialog', 'AnnotationService', 'ConfigService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = HTMLController;
//# sourceMappingURL=htmlController.js.map
