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

var OutsideURLController = function (_ComponentController) {
  _inherits(OutsideURLController, _ComponentController);

  function OutsideURLController($filter, $mdDialog, $q, $rootScope, $sce, $scope, AnnotationService, ConfigService, NodeService, NotebookService, OutsideURLService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    _classCallCheck(this, OutsideURLController);

    var _this = _possibleConstructorReturn(this, (OutsideURLController.__proto__ || Object.getPrototypeOf(OutsideURLController)).call(this, $filter, $mdDialog, $rootScope, $scope, AnnotationService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService));

    _this.$q = $q;
    _this.$sce = $sce;
    _this.OutsideURLService = OutsideURLService;

    // the url to the web page to display
    _this.url = null;

    // the max width of the iframe
    _this.maxWidth = null;

    // the max height of the iframe
    _this.maxHeight = null;

    /*
     * get the original component content. this is used when showing
     * previous work from another component.
     */
    _this.originalComponentContent = _this.$scope.originalComponentContent;

    if (_this.componentContent != null) {
      // set the url
      _this.setURL(_this.componentContent.url);
    }

    // get the max width
    _this.maxWidth = _this.componentContent.maxWidth ? _this.componentContent.maxWidth : 'none';

    // get the max height
    _this.maxHeight = _this.componentContent.maxHeight ? _this.componentContent.maxHeight : 'none';

    if (_this.$scope.$parent.nodeController != null) {
      // register this component with the parent node
      _this.$scope.$parent.nodeController.registerComponentController(_this.$scope, _this.componentContent);
    }

    /**
     * Get the component state from this component. The parent node will
     * call this function to obtain the component state when it needs to
     * save student data.
     * @return a promise of a component state containing the student data
     */
    _this.$scope.getComponentState = function () {
      var deferred = this.$q.defer();

      /*
       * the student does not have any unsaved changes in this component
       * so we don't need to save a component state for this component.
       * we will immediately resolve the promise here.
       */
      deferred.resolve();

      return deferred.promise;
    }.bind(_this);

    _this.$rootScope.$broadcast('doneRenderingComponent', { nodeId: _this.nodeId, componentId: _this.componentId });
    return _this;
  }

  /**
   * Set the url
   * @param url the url
   */


  _createClass(OutsideURLController, [{
    key: 'setURL',
    value: function setURL(url) {
      if (url != null) {
        var trustedURL = this.$sce.trustAsResourceUrl(url);
        this.url = trustedURL;
      }
    }
  }, {
    key: 'registerExitListener',


    /**
     * Register the the listener that will listen for the exit event
     * so that we can perform saving before exiting.
     */
    value: function registerExitListener() {

      /*
       * Listen for the 'exit' event which is fired when the student exits
       * the VLE. This will perform saving before the VLE exits.
       */
      this.exitListener = this.$scope.$on('exit', function (event, args) {});
    }
  }]);

  return OutsideURLController;
}(_componentController2.default);

OutsideURLController.$inject = ['$filter', '$mdDialog', '$q', '$rootScope', '$sce', '$scope', 'AnnotationService', 'ConfigService', 'NodeService', 'NotebookService', 'OutsideURLService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = OutsideURLController;
//# sourceMappingURL=outsideURLController.js.map
